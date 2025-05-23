// components/widgets/TaskWidget.tsx
import { useState, FormEvent, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, Trash2, Pencil, Tag, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import CreatableSelect from 'react-select/creatable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import confetti from 'canvas-confetti';

interface Task {
  id: number;
  text: string;
  done: boolean;
  dueDate: string | null;
  source: string; 
  tags: string[];
  createdAt: string;
  priority?: string;
  notes?: string;
}

interface UserSettings {
  id: number;
  userId: string;
  globalTags: string[];
  selectedCals: string[];
  defaultView: string;
  activeWidgets: string[];
}

function TaskWidget() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Task data fetching - always enabled and refetch frequently during development
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => fetch('/api/tasks', { credentials: 'include' }).then(res => res.json()),
    refetchInterval: 3000, // Refetch every 3 seconds to ensure we have the latest tasks
    staleTime: 2000, // Consider data fresh for 2 seconds to reduce flickering
  });
  
  // User settings for global tags
  const { data: userSettings } = useQuery({
    queryKey: ['/api/auth/settings'],
    queryFn: () => fetch('/api/auth/settings').then(res => res.json()),
    enabled: isAuthenticated,
  });

  // State
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskSource, setTaskSource] = useState<string>("personal");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<string>("medium");
  const [notes, setNotes] = useState<string>("");

  // Combine unique tags from tasks and global tags from settings
  const allAvailableTags = useMemo(() => {
    const taskTags = tasks?.flatMap((task: Task) => task.tags) || [];
    const globalTags = userSettings?.globalTags || [];
    const combinedTags = [...taskTags, ...globalTags];
    return Array.from(new Set(combinedTags)).sort();
  }, [tasks, userSettings]);

  const tagOptions = allAvailableTags.map(tag => ({ value: tag, label: tag }));

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (newTask: Omit<Task, 'id' | 'createdAt'>) => {
      console.log("Submitting task:", newTask);
      return fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
        credentials: 'include' // Include cookies for authentication
      }).then(res => {
        if (!res.ok) {
          console.error("Error creating task:", res.status, res.statusText);
          return res.text().then(text => {
            console.error("Error response:", text);
            throw new Error("Failed to create task: " + text);
          });
        }
        return res.json();
      });
    },
    onSuccess: (data) => {
      console.log("Task created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setInput("");
      setSelectedTags([]);
      setTaskSource("personal");
      setPriority("medium");
      setNotes("");
      setDueDate(new Date());
    },
    onError: (error) => {
      console.error("Task creation failed:", error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...task }: Partial<Task> & { id: number }) => 
      fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setEditDialogOpen(false);
      setEditing(null);
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/tasks/${id}/toggle`, {
        method: 'PATCH',
      }).then(res => res.json()),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Find the task that was toggled
      const task = tasks.find((t: Task) => t.id === id);
      if (task && !task.done) {
        // Task was marked as complete, trigger celebration
        triggerCelebration();
      }
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete task');
        return true;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  // Event handlers
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Don't require user to be logged in for testing
    // if (!user) return;

    const newTask = {
      text: input,
      done: false,
      dueDate: dueDate ? dueDate.toISOString() : null,
      source: taskSource,
      tags: selectedTags,
      priority,
      notes
    };

    // Prevent double submissions
    if (createTaskMutation.isPending) return;
    
    console.log("Creating task:", newTask);
    createTaskMutation.mutate(newTask);
  };

  const handleEdit = (task: Task) => {
    setEditing(task);
    setInput(task.text);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setTaskSource(task.source || "personal");
    setSelectedTags(task.tags || []);
    setPriority(task.priority || "medium");
    setNotes(task.notes || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    
    updateTaskMutation.mutate({
      id: editing.id,
      text: input,
      dueDate: dueDate ? dueDate.toISOString() : null,
      source: taskSource,
      tags: selectedTags,
      priority,
      notes
    });
  };

  const handleTagChange = (newValue: any) => {
    setSelectedTags(newValue ? newValue.map((item: any) => item.value) : []);
  };

  // Celebration animation
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // State for filtering and search
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    // First filter the tasks
    return tasks.filter((t: Task) => {
      // Filter out completed tasks if hideCompleted is true
      if (hideCompleted && t.done) return false;
      
      // If no search query, include all tasks
      if (!searchQuery) return true;
      
      // Search by text content
      if (t.text.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      
      // Search by tags
      if (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
      
      // Search by source
      if (t.source && t.source.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      
      // Search by priority
      if (t.priority && t.priority.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      
      // No match
      return false;
    }).sort((a: Task, b: Task) => {
      // First by completion status
      if (a.done !== b.done) return a.done ? 1 : -1;
      
      // Then by due date (if available)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Tasks with due dates come before tasks without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Finally by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, hideCompleted, searchQuery]);

  return (
    <div className="border rounded-lg p-4 shadow-sm h-full bg-card">
      <h3 className="text-lg font-semibold mb-3">Tasks</h3>
      
      {/* Search and Filter Controls */}
      <div className="mb-4 space-y-2">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hideCompleted" 
            checked={hideCompleted}
            onCheckedChange={(checked) => setHideCompleted(!!checked)}
          />
          <label htmlFor="hideCompleted" className="text-sm cursor-pointer">
            Hide completed tasks
          </label>
        </div>
      </div>
      
      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center text-sm">
          {/* Due Date Picker */}
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setDueDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {/* Task Source */}
          <Select value={taskSource} onValueChange={setTaskSource}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="work">Work</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Priority */}
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Tags Input */}
        <div className="w-full">
          <CreatableSelect
            isMulti
            placeholder="Add tags..."
            options={tagOptions}
            className="text-sm"
            onChange={handleTagChange}
            value={selectedTags.map(tag => ({ value: tag, label: tag }))}
          />
        </div>
      </form>
      
      {/* Task List */}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100% - 240px)" }}>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks yet. Add your first task above!
          </div>
        ) : (
          filteredTasks.map((task: Task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all",
                task.done ? "bg-muted/50 border-muted" : "bg-card"
              )}
            >
              <Checkbox
                checked={task.done}
                onCheckedChange={() => toggleTaskMutation.mutate(task.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn("font-medium break-words", task.done && "line-through text-muted-foreground")}>
                      {task.text}
                    </p>
                    {task.notes && (
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(task)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Task metadata */}
                <div className="text-xs flex flex-wrap gap-x-2 gap-y-1 mt-2">
                  {task.dueDate && (
                    <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
                  
                  {task.source && (
                    <span className={cn(
                      "px-2 py-1 rounded-full flex items-center",
                      task.source === "work" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    )}>
                      {task.source === "work" ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="M3 9h18" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      }
                      {task.source.charAt(0).toUpperCase() + task.source.slice(1)}
                    </span>
                  )}
                  
                  {task.priority && (
                    <span className={cn(
                      "px-2 py-1 rounded-full flex items-center",
                      task.priority === "high" ? "bg-red-100 text-red-800" : 
                      task.priority === "medium" ? "bg-amber-100 text-amber-800" : 
                      "bg-green-100 text-green-800"
                    )}>
                      {task.priority === "high" ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg> : 
                        task.priority === "medium" ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15 12 9" /><path d="M12 9 6 15" /></svg>
                      }
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>
                
                {/* Task tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.tags.map((tag: string) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Input
              placeholder="Task description"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "No date set"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Source</label>
                <Select value={taskSource} onValueChange={setTaskSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tags</label>
              <CreatableSelect
                isMulti
                options={tagOptions}
                className="mt-1"
                onChange={handleTagChange}
                value={selectedTags.map(tag => ({ value: tag, label: tag }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input 
                placeholder="Add notes..."
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default memo(TaskWidget);
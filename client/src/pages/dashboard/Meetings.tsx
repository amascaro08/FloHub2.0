import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { CalendarIcon, LinkIcon, PlusCircleIcon } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Meeting type definition
interface Meeting {
  id: number;
  userId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingType: 'internal' | 'client' | 'one-on-one' | 'interview' | 'workshop';
  calendarEventId?: string;
  createdAt?: string;
  updatedAt?: string;
  tasks?: Task[];
}

// Task type definition
interface Task {
  id: number;
  userId: string;
  text: string;
  done: boolean;
  dueDate?: string | null;
  source: string;
  tags: string[];
  priority: string;
  notes?: string;
  createdAt?: string;
}

// Calendar Event type definition
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  description?: string;
  source?: string;
}

// Component to display meeting details
const MeetingDetail = ({ 
  meeting,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateTask,
  onLinkCalendarEvent,
  calendarEvents
}: {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'upcoming' | 'completed' | 'cancelled') => void;
  onCreateTask: (meetingId: number, taskData: Partial<Task>) => void;
  onLinkCalendarEvent: (meetingId: number, calendarEventId: string) => void;
  calendarEvents: CalendarEvent[];
}) => {
  const { toast } = useToast();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskNotes, setTaskNotes] = useState('');
  
  const [linkEventOpen, setLinkEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Format time display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  // Handle task creation
  const handleCreateTask = () => {
    if (!taskText.trim()) {
      toast({
        title: "Error",
        description: "Task text cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const newTask = {
      text: taskText,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      priority: taskPriority,
      notes: taskNotes || `From meeting: ${meeting.title}`,
      source: 'meeting',
      tags: ['meeting', meeting.meetingType]
    };
    
    onCreateTask(meeting.id, newTask);
    
    // Reset form
    setTaskText('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskNotes('');
    setCreateTaskOpen(false);
    
    toast({
      title: "Task created",
      description: "Task has been added to your task list"
    });
  };
  
  // Handle linking to calendar event
  const handleLinkEvent = () => {
    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select a calendar event",
        variant: "destructive"
      });
      return;
    }
    
    onLinkCalendarEvent(meeting.id, selectedEventId);
    setLinkEventOpen(false);
    
    toast({
      title: "Meeting linked",
      description: "Meeting has been linked to calendar event"
    });
  };
  
  // Filter events that match this meeting's date
  const filteredEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start).toISOString().split('T')[0];
    return eventDate === meeting.date;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-medium text-gray-800">{meeting.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(meeting)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(meeting.id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center mb-4">
            <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-teal-100 text-teal-700">
              📅
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Date & Time</h3>
              <p className="text-sm text-gray-600">
                {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-teal-100 text-teal-700">
              📍
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Location</h3>
              <p className="text-sm text-gray-600">{meeting.location}</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-teal-100 text-teal-700">
              🏷️
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Type</h3>
              <p className="text-sm text-gray-600">
                {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
              </p>
            </div>
          </div>
          
          {/* Calendar Event Link (if linked) */}
          {meeting.calendarEventId && (
            <div className="flex items-center mb-4">
              <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Linked Calendar Event</h3>
                <p className="text-sm text-gray-600">
                  {calendarEvents.find(e => e.id === meeting.calendarEventId)?.title || 'Calendar Event'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onStatusChange(meeting.id, 'upcoming')}
                className={`px-3 py-1 rounded-md text-sm ${
                  meeting.status === 'upcoming' 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => onStatusChange(meeting.id, 'completed')}
                className={`px-3 py-1 rounded-md text-sm ${
                  meeting.status === 'completed' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => onStatusChange(meeting.id, 'cancelled')}
                className={`px-3 py-1 rounded-md text-sm ${
                  meeting.status === 'cancelled' 
                    ? 'bg-red-100 text-red-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Attendees</h3>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((attendee, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {attendee}
                </span>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => setCreateTaskOpen(true)}
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Add Task
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => setLinkEventOpen(true)}
              disabled={meeting.calendarEventId !== undefined}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Link to Calendar
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{meeting.description}</p>
      </div>
      
      {/* Meeting Tasks Section */}
      {meeting.tasks && meeting.tasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks</h3>
          <div className="space-y-2">
            {meeting.tasks.map(task => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-md flex items-start">
                <div className={`w-4 h-4 mt-1 mr-2 rounded-full ${task.done ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-700'}`}>{task.text}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {task.dueDate && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Notes</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          {meeting.notes ? (
            <p className="text-sm text-gray-600 whitespace-pre-line">{meeting.notes}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">No notes recorded for this meeting yet.</p>
          )}
        </div>
      </div>
      
      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task from Meeting</DialogTitle>
            <DialogDescription>
              Add a task related to this meeting. It will appear in your task list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task description</label>
              <Input 
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Due date (optional)</label>
              <Input 
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea 
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Any additional details about this task"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Link Calendar Event Dialog */}
      <Dialog open={linkEventOpen} onOpenChange={setLinkEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Calendar Event</DialogTitle>
            <DialogDescription>
              Link this meeting to a calendar event on {format(new Date(meeting.date), 'MMMM d, yyyy')}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {filteredEvents.length > 0 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select calendar event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select an event --</option>
                  {filteredEvents.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No calendar events found for {format(new Date(meeting.date), 'MMMM d, yyyy')}.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkEventOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleLinkEvent} 
              disabled={!selectedEventId || filteredEvents.length === 0}
            >
              Link Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Meeting edit form component
const MeetingForm = ({
  meeting,
  onSave,
  onCancel
}: {
  meeting?: Meeting;
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
}) => {
  const { toast } = useToast();
  const isEditing = !!meeting;
  const [extractingActionItems, setExtractingActionItems] = useState(false);
  
  const [formData, setFormData] = useState<Meeting>(meeting || {
    id: 0,
    userId: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: 'Conference Room A',
    attendees: [],
    notes: '',
    status: 'upcoming',
    meetingType: 'internal',
    tasks: []
  });

  const [newAttendee, setNewAttendee] = useState('');
  
  // Template choices for meeting notes
  const noteTemplates = [
    {
      name: "Standard Meeting",
      template: "# Meeting Summary\n\n## Agenda\n- \n- \n- \n\n## Discussion Points\n- \n- \n- \n\n## Action Items\n- [ ] \n- [ ] \n- [ ] \n\n## Decisions Made\n- \n- \n\n## Next Steps\n- "
    },
    {
      name: "One-on-One",
      template: "# One-on-One Meeting Notes\n\n## Goals & Achievements\n- \n- \n\n## Challenges & Blockers\n- \n- \n\n## Development Plans\n- \n- \n\n## Action Items\n- [ ] \n- [ ] \n\n## Follow-up for Next Meeting\n- "
    },
    {
      name: "Project Update",
      template: "# Project Status Update\n\n## Project Overview\n- Current Status: \n- Timeline: \n\n## Milestones\n- Completed: \n- In Progress: \n- Upcoming: \n\n## Risks & Issues\n- \n- \n\n## Resource Needs\n- \n\n## Action Items\n- [ ] \n- [ ] \n- [ ] "
    },
    {
      name: "Client Meeting",
      template: "# Client Meeting Notes\n\n## Client Requirements\n- \n- \n\n## Feedback Received\n- \n- \n\n## Project Updates Shared\n- \n- \n\n## Questions & Concerns\n- \n- \n\n## Action Items\n- [ ] \n- [ ] \n- [ ] \n\n## Follow-up Schedule\n- Next meeting: "
    }
  ];

  const handleAddAttendee = () => {
    if (newAttendee.trim() !== '' && !formData.attendees.includes(newAttendee.trim())) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, newAttendee.trim()]
      });
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (attendeeToRemove: string) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(attendee => attendee !== attendeeToRemove)
    });
  };
  
  const applyTemplate = (templateText: string) => {
    // Preserve any existing notes if there are some
    if (formData.notes && formData.notes.trim() !== '') {
      if (confirm('This will replace your current notes. Are you sure?')) {
        setFormData({
          ...formData,
          notes: templateText
        });
      }
    } else {
      setFormData({
        ...formData,
        notes: templateText
      });
    }
  };
  
  // Function to extract action items from meeting notes
  const extractActionItems = () => {
    setExtractingActionItems(true);
    
    // In a real implementation, we could use AI like OpenAI to extract tasks
    // For demo purposes, we'll use a simple regex to find action items
    const actionItemRegex = /\[\s?\]\s*(.*?)(?:\n|$)/g;
    const matches = [...formData.notes.matchAll(actionItemRegex)];
    
    setTimeout(() => {
      setExtractingActionItems(false);
      
      if (matches.length === 0) {
        toast({
          title: "No action items found",
          description: "Try using the format '- [ ] Task description' for action items",
          variant: "destructive"
        });
        return;
      }
      
      const extractedTasks = matches.map(match => match[1].trim()).filter(item => item.length > 0);
      
      // Add these to the meeting form as potential tasks
      const updatedFormData = {
        ...formData,
        extractedTasks: extractedTasks
      };
      
      setFormData(updatedFormData as any);
      
      toast({
        title: `${extractedTasks.length} action items found`,
        description: "These will be automatically converted to tasks when you save the meeting",
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create tasks from extracted action items if any
    if ((formData as any).extractedTasks && (formData as any).extractedTasks.length > 0) {
      const tasks = (formData as any).extractedTasks.map((text: string, index: number) => {
        return {
          id: -(index + 1), // Negative ID to flag as a new task
          userId: formData.userId,
          text: text,
          done: false,
          source: 'meeting',
          tags: [formData.meetingType, 'action-item'],
          priority: 'medium',
          notes: `From meeting: ${formData.title}`,
          dueDate: null,
        };
      });
      
      const updatedFormData = {
        ...formData,
        tasks: [...tasks],
        extractedTasks: undefined // Remove this temporary field
      };
      
      onSave(updatedFormData as Meeting);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        {isEditing ? 'Edit Meeting Notes' : 'Create New Meeting'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter meeting title"
              required
            />
          </div>
          
          {/* Date and Type Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time*
              </label>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <span className="flex items-center">-</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="internal">Internal</option>
                <option value="client">Client</option>
                <option value="one-on-one">One-on-One</option>
                <option value="interview">Interview</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
          </div>
          
          {/* Location and Attendees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter meeting location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendees
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Add attendee"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-4 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attendees.map((attendee, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center"
                  >
                    {attendee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Brief Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter a brief meeting description"
              rows={2}
            />
          </div>
          
          {/* Note Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Meeting Notes</span>
              <div className="relative inline-block text-left">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Choose Note Template</DialogTitle>
                      <DialogDescription>
                        Select a template to structure your meeting notes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                      {noteTemplates.map((template, i) => (
                        <div 
                          key={i}
                          className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            applyTemplate(template.template);
                            document.querySelector("[data-state='open']")?.setAttribute("data-state", "closed");
                          }}
                        >
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{template.template.substring(0, 60)}...</p>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        document.querySelector("[data-state='open']")?.setAttribute("data-state", "closed");
                      }}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </label>
            <div className="mb-2 text-xs text-gray-500">
              Use format "- [ ] Task description" for action items that can be automatically converted to tasks
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono"
              placeholder="Enter detailed meeting notes with action items marked as '- [ ] Task description'"
              rows={12}
            />
            
            {/* Action Items Section */}
            {(formData as any).extractedTasks && (formData as any).extractedTasks.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Extracted Action Items</h3>
                <ul className="space-y-2">
                  {(formData as any).extractedTasks.map((task: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 mt-0.5 mr-2 border border-blue-500 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-blue-600">These items will be automatically added as tasks when you save.</p>
              </div>
            )}
            
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={extractActionItems}
                disabled={extractingActionItems}
              >
                {extractingActionItems ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting Action Items...
                  </>
                ) : (
                  <>Extract Action Items</>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              {isEditing ? 'Update Meeting' : 'Save Meeting'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Meeting list item component
const MeetingListItem = ({ 
  meeting, 
  onSelectMeeting 
}: { 
  meeting: Meeting; 
  onSelectMeeting: (meeting: Meeting) => void;
}) => {
  
  // Format time display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  // Get status badge color
  const getStatusBadge = (status: 'upcoming' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get meeting type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-teal-100 text-teal-800';
      case 'client':
        return 'bg-purple-100 text-purple-800';
      case 'one-on-one':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={() => onSelectMeeting(meeting)}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800">{meeting.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(meeting.status)}`}>
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        <div className="flex items-center">
          <span className="mr-2">📅</span>
          <span>
            {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            , {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <span className="mr-2">📍</span>
          <span>{meeting.location}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(meeting.meetingType)}`}>
          {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
        </span>
        
        <div className="flex -space-x-1">
          {meeting.attendees.slice(0, 3).map((attendee, index) => (
            <div 
              key={index}
              className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border border-white"
              title={attendee}
            >
              {attendee.charAt(0).toUpperCase()}
            </div>
          ))}
          {meeting.attendees.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border border-white">
              +{meeting.attendees.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Meetings Dashboard Component
export default function MeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id?.toString() || '1'; // Fallback to '1' for demo
  
  // Sample calendar events for demo
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal1',
      title: 'Team Standup',
      start: '2025-05-20T09:00:00',
      end: '2025-05-20T09:30:00',
      location: 'Conference Room A',
    },
    {
      id: 'cal2',
      title: 'Client Project Kickoff',
      start: '2025-05-21T13:00:00',
      end: '2025-05-21T14:30:00',
      location: 'Main Conference Room',
    },
    {
      id: 'cal3',
      title: 'Performance Review with Emma',
      start: '2025-05-22T10:00:00',
      end: '2025-05-22T11:00:00',
      location: 'Office 203',
    }
  ]);
  
  // Fetch meetings
  // In a real implementation, this would use:
  // const { data: meetings = [], isLoading } = useQuery({
  //   queryKey: ['/api/meetings'],
  //   queryFn: () => fetch('/api/meetings').then(res => res.json()),
  //   enabled: !!user,
  // });
  
  // For demo purposes, use useState with sample data
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      userId: userId,
      title: 'Weekly Team Standup',
      description: 'Regular weekly team meeting to discuss progress, blockers, and upcoming priorities.',
      date: '2025-05-20',
      startTime: '09:00',
      endTime: '09:30',
      location: 'Conference Room A',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson'],
      notes: '',
      status: 'upcoming',
      meetingType: 'internal',
      tasks: [],
    },
    {
      id: 2,
      userId: userId,
      title: 'Project Kickoff Meeting',
      description: 'Initial kickoff meeting to discuss project goals, timeline, and resource allocation for the new client project.',
      date: '2025-05-21',
      startTime: '13:00',
      endTime: '14:30',
      location: 'Main Conference Room',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'David Lee', 'Client Rep'],
      notes: '',
      status: 'upcoming',
      meetingType: 'client',
      tasks: [],
    },
    {
      id: 3,
      userId: userId,
      title: 'Performance Review',
      description: 'One-on-one performance review meeting to discuss progress, goals, and career development.',
      date: '2025-05-22',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Office 203',
      attendees: ['John Smith', 'Emma Wilson'],
      notes: '',
      status: 'upcoming',
      meetingType: 'one-on-one',
      tasks: [],
    },
    {
      id: 4,
      userId: userId,
      title: 'Software Developer Interview',
      description: 'Interview for the Senior Software Developer position.',
      date: '2025-05-23',
      startTime: '14:00',
      endTime: '15:30',
      location: 'Meeting Room B',
      attendees: ['John Smith', 'Sarah Johnson', 'Candidate'],
      notes: '',
      status: 'upcoming',
      meetingType: 'interview',
      tasks: [],
    },
    {
      id: 5,
      userId: userId,
      title: 'Product Design Workshop',
      description: 'Collaborative workshop to brainstorm new product features and design improvements.',
      date: '2025-05-24',
      startTime: '09:00',
      endTime: '12:00',
      location: 'Innovation Lab',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'Design Team', 'Product Team'],
      notes: '',
      status: 'upcoming',
      meetingType: 'workshop',
      tasks: [],
    },
    {
      id: 6,
      userId: userId,
      title: 'Last Month\'s Budget Review',
      description: 'Review of last month\'s budget, expenses, and financial planning for the next quarter.',
      date: '2025-05-15',
      startTime: '11:00',
      endTime: '12:00',
      location: 'Finance Department',
      attendees: ['John Smith', 'Finance Director', 'Department Heads'],
      notes: 'Discussed budget allocation for Q3. Identified areas for cost optimization. Action items assigned to department heads for detailed expense reports.',
      status: 'completed',
      meetingType: 'internal',
      tasks: [],
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Fetch calendar events - in production, this would be from the API
  // const { data: calendarEvents = [] } = useQuery({
  //   queryKey: ['/api/calendar/events'],
  //   enabled: !!user,
  // });

  // API mutations for production use
  const createTaskMutation = useMutation({
    mutationFn: ({ meetingId, taskData }: { meetingId: number; taskData: Partial<Task> }) => 
      fetch(`/api/meetings/${meetingId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Demo only - update the local state
      toast({
        title: "Task Created",
        description: "The task has been added to your task list.",
      });
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  });

  const linkCalendarEventMutation = useMutation({
    mutationFn: ({ meetingId, calendarEventId }: { meetingId: number; calendarEventId: string }) => 
      fetch(`/api/meetings/${meetingId}/calendar-event`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEventId })
      }).then(res => res.json()),
    onSuccess: (updatedMeeting) => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      
      // Demo only - update the local state
      setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
      if (selectedMeeting && selectedMeeting.id === updatedMeeting.id) {
        setSelectedMeeting(updatedMeeting);
      }
      
      toast({
        title: "Calendar Event Linked",
        description: "The meeting has been linked to the calendar event.",
      });
    },
    onError: (error) => {
      console.error('Error linking calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to link calendar event. Please try again.",
        variant: "destructive"
      });
    }
  });

  // For demo purposes - create and link a new task to a meeting
  const handleCreateTask = (meetingId: number, taskData: Partial<Task>) => {
    // In production, this would use the createTaskMutation
    // createTaskMutation.mutate({ meetingId, taskData });
    
    // For demo, update the local state
    const newTaskId = Math.max(...meetings.flatMap(m => m.tasks?.map(t => t.id) || [0])) + 1;
    const newTask: Task = {
      id: newTaskId,
      userId: userId,
      text: taskData.text || 'New task',
      done: false,
      dueDate: taskData.dueDate || null,
      source: taskData.source || 'meeting',
      tags: taskData.tags || [],
      priority: taskData.priority || 'medium',
      notes: taskData.notes || '',
      createdAt: new Date().toISOString(),
    };
    
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        return {
          ...meeting,
          tasks: [...(meeting.tasks || []), newTask]
        };
      }
      return meeting;
    });
    
    setMeetings(updatedMeetings);
    
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        tasks: [...(selectedMeeting.tasks || []), newTask]
      });
    }
  };

  // For demo purposes - link a calendar event to a meeting
  const handleLinkCalendarEvent = (meetingId: number, calendarEventId: string) => {
    // In production, this would use the linkCalendarEventMutation
    // linkCalendarEventMutation.mutate({ meetingId, calendarEventId });
    
    // For demo, update the local state
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        return {
          ...meeting,
          calendarEventId
        };
      }
      return meeting;
    });
    
    setMeetings(updatedMeetings);
    
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        calendarEventId
      });
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    if (filter === 'all') return true;
    return meeting.status === filter;
  });

  // Sort meetings by date and time
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.startTime.localeCompare(b.startTime);
  });

  // Handle selecting a meeting
  const handleSelectMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setView('detail');
  };

  // Handle editing a meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setView('form');
  };

  // Handle saving a meeting (new or edited)
  const handleSaveMeeting = (meeting: Meeting) => {
    if (meeting.id === 0) {
      // New meeting
      const newMeeting = {
        ...meeting,
        userId,
        id: meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1,
        tasks: []
      };
      setMeetings([...meetings, newMeeting]);
    } else {
      // Update existing meeting
      setMeetings(meetings.map(m => m.id === meeting.id ? { ...meeting, tasks: m.tasks || [] } : m));
    }
    setSelectedMeeting(meeting.id !== 0 ? { ...meeting, tasks: selectedMeeting?.tasks || [] } : null);
    setEditingMeeting(null);
    setView(meeting.id !== 0 ? 'detail' : 'list');
  };

  // Handle deleting a meeting
  const handleDeleteMeeting = (id: number) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
    setSelectedMeeting(null);
    setView('list');
  };

  // Handle changing meeting status
  const handleStatusChange = (id: number, status: 'upcoming' | 'completed' | 'cancelled') => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === id ? { ...meeting, status } : meeting
    );
    setMeetings(updatedMeetings);
    
    // Update selected meeting if it's the one being changed
    if (selectedMeeting && selectedMeeting.id === id) {
      setSelectedMeeting({ ...selectedMeeting, status });
    }
  };

  return (
    <DashboardLayout title="Meetings">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          {view === 'list' && (
            <button
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              onClick={() => {
                setEditingMeeting(null);
                setView('form');
              }}
            >
              + Schedule Meeting
            </button>
          )}
          {view !== 'list' && (
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              onClick={() => {
                setView('list');
                setSelectedMeeting(null);
                setEditingMeeting(null);
              }}
            >
              Back to List
            </button>
          )}
        </div>

        {view === 'list' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex flex-wrap space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'all' 
                      ? 'bg-teal-100 text-teal-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Meetings
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'completed' 
                      ? 'bg-green-100 text-green-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'cancelled' 
                      ? 'bg-red-100 text-red-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Meetings List */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {filter === 'all' ? 'All Meetings' : 
                filter === 'upcoming' ? 'Upcoming Meetings' : 
                filter === 'completed' ? 'Completed Meetings' : 'Cancelled Meetings'}
                <span className="ml-2 text-sm text-gray-500">({sortedMeetings.length})</span>
              </h2>
              
              {sortedMeetings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No meetings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedMeetings.map((meeting) => (
                    <MeetingListItem 
                      key={meeting.id}
                      meeting={meeting}
                      onSelectMeeting={handleSelectMeeting}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedMeeting && (
          <MeetingDetail 
            meeting={selectedMeeting}
            onEdit={handleEditMeeting}
            onDelete={handleDeleteMeeting}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
            onLinkCalendarEvent={handleLinkCalendarEvent}
            calendarEvents={calendarEvents}
          />
        )}

        {view === 'form' && (
          <MeetingForm 
            meeting={editingMeeting || undefined}
            onSave={handleSaveMeeting}
            onCancel={() => {
              setView(editingMeeting ? 'detail' : 'list');
              setEditingMeeting(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { PlusCircleIcon, CalendarIcon, ClipboardIcon, CheckIcon } from 'lucide-react';
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
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingType: 'internal' | 'client' | 'one-on-one' | 'interview' | 'workshop';
  date: string;
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

// Note Template type
interface NoteTemplate {
  name: string;
  template: string;
}

// Meeting detail component
const MeetingDetail = ({ 
  meeting,
  onEdit,
  onBack,
  onDelete,
  onStatusChange,
  onCreateTask
}: {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onBack: () => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'upcoming' | 'completed' | 'cancelled') => void;
  onCreateTask: (meetingId: number, taskText: string) => void;
}) => {
  const { toast } = useToast();
  const [taskText, setTaskText] = useState('');

  // Extract action items from notes
  const handleExtractTasks = () => {
    const noteLines = meeting.notes.split('\n');
    const actionItems = [];
    
    for (const line of noteLines) {
      if (line.includes('[ ]') || line.includes('- [ ]') || line.includes('* [ ]')) {
        const taskText = line.replace(/[-*]\s*\[\s?\]\s*/, '').trim();
        if (taskText) {
          actionItems.push(taskText);
        }
      }
    }
    
    if (actionItems.length === 0) {
      toast({
        title: "No action items found",
        description: "Try using the format '- [ ] Task description' for action items",
        variant: "destructive"
      });
      return;
    }
    
    for (const task of actionItems) {
      onCreateTask(meeting.id, task);
    }
    
    toast({
      title: `${actionItems.length} tasks created`,
      description: "Tasks have been added to your task list",
    });
  };
  
  const handleQuickTask = () => {
    if (!taskText.trim()) {
      toast({
        title: "Task text is required",
        description: "Please enter a task description",
        variant: "destructive"
      });
      return;
    }
    
    onCreateTask(meeting.id, taskText);
    setTaskText('');
    
    toast({
      title: "Task created",
      description: "The task has been added to your task list"
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-medium text-gray-800">
          {meeting.title}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back
          </button>
          <button
            onClick={() => onEdit(meeting)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Edit Notes
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
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Info</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
            </p>
            {meeting.description && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Description:</span> {meeting.description}
              </p>
            )}
          </div>
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
            <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Type</h3>
            <div className="flex flex-wrap gap-2">
              {['internal', 'client', 'one-on-one', 'interview', 'workshop'].map(type => (
                <button
                  key={type}
                  onClick={() => onEdit({
                    ...meeting,
                    meetingType: type as any
                  })}
                  className={`px-3 py-1 rounded-md text-sm ${
                    meeting.meetingType === type
                      ? 'bg-teal-100 text-teal-800 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick task creation */}
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Add a quick task..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickTask}
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtractTasks}
              className="w-full justify-center mt-1"
            >
              <ClipboardIcon className="h-4 w-4 mr-1" />
              Extract Tasks from Notes
            </Button>
          </div>
        </div>
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
            <p className="text-sm text-gray-600 whitespace-pre-line font-mono">{meeting.notes}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">No notes recorded for this meeting yet.</p>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>Pro Tip: Use "- [ ] Task name" format to mark action items in your notes that can be extracted as tasks.</p>
        </div>
      </div>
    </div>
  );
};

// Meeting notes form component
const MeetingNotesForm = ({
  meeting,
  onSave,
  onCancel
}: {
  meeting?: Meeting;
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Meeting>(meeting || {
    id: 0,
    userId: '',
    title: '',
    description: '',
    notes: '',
    status: 'upcoming',
    meetingType: 'internal',
    date: new Date().toISOString().split('T')[0],
    tasks: []
  });
  
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
  
  const applyTemplate = (templateText: string) => {
    // Preserve any existing notes if there are some
    if (formData.notes && formData.notes.trim() !== '') {
      if (window.confirm('This will replace your current notes. Are you sure?')) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.title) {
      alert('Please enter a meeting title');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        {meeting ? 'Edit Meeting Notes' : 'Create New Meeting Notes'}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
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
              <div className="flex space-x-2">
                <select 
                  className="p-2 text-sm rounded border border-gray-300"
                  onChange={(e) => {
                    const template = noteTemplates.find(t => t.name === e.target.value);
                    if (template) {
                      applyTemplate(template.template);
                    }
                    e.target.value = ""; // Reset select after use
                  }}
                  value=""
                >
                  <option value="" disabled>Select template</option>
                  {noteTemplates.map((template, i) => (
                    <option key={i} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
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
              rows={15}
            />
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
              {meeting ? 'Update Notes' : 'Save Notes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Main Meetings Page
export default function MeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id?.toString() || '1'; // Fallback to '1' for demo
  
  // State
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      userId: userId,
      title: 'Weekly Team Standup',
      description: 'Regular weekly team meeting to discuss progress, blockers, and upcoming priorities.',
      notes: '# Weekly Team Standup\n\n## Updates\n- Backend API integration is 80% complete\n- Frontend design updates completed\n- QA started testing new features\n\n## Action Items\n- [ ] Send updated timeline to stakeholders\n- [ ] Schedule additional resources for API work\n- [ ] Review QA feedback by Friday\n\n## Next Steps\n- Continue API development\n- Start planning for next sprint',
      status: 'upcoming',
      meetingType: 'internal',
      date: '2025-05-20',
      tasks: [
        {
          id: 101,
          userId: userId,
          text: "Prepare agenda for next sprint planning",
          done: false,
          source: "meeting",
          tags: ["internal", "planning"],
          priority: "high",
          createdAt: new Date().toISOString(),
        }
      ],
    },
    {
      id: 2,
      userId: userId,
      title: 'Project Kickoff Meeting',
      description: 'Initial kickoff meeting to discuss project goals, timeline, and resource allocation for the new client project.',
      notes: '# Project Kickoff\n\n## Project Goals\n- Launch initial version by August 15th\n- Address client\'s primary pain points\n- Establish scalable architecture\n\n## Timeline\n- Design phase: 2 weeks\n- Development: 8 weeks\n- Testing: 2 weeks\n- Launch: 1 week\n\n## Action Items\n- [ ] Create detailed project plan\n- [ ] Set up development environments\n- [ ] Schedule recurring status meetings',
      status: 'upcoming',
      meetingType: 'client',
      date: '2025-05-21',
      tasks: [],
    },
    {
      id: 3,
      userId: userId,
      title: 'Last Month\'s Budget Review',
      description: 'Review of last month\'s budget, expenses, and financial planning for the next quarter.',
      notes: '# Budget Review Meeting\n\n## Q1 Highlights\n- Overall spending 5% under budget\n- Marketing expenses 10% over allocated budget\n- New equipment purchases delayed to Q2\n\n## Q2 Planning\n- Increase development resources budget by 15%\n- Reduce travel expenses by 20%\n\n## Action Items\n- [ ] Prepare updated budget proposal\n- [ ] Schedule individual department reviews\n- [ ] Finalize Q2 financial plan\n',
      status: 'completed',
      meetingType: 'internal',
      date: '2025-05-15',
      tasks: [
        {
          id: 102,
          userId: userId,
          text: "Schedule follow-up meeting with client",
          done: true,
          source: "meeting",
          tags: ["client", "follow-up"],
          priority: "medium",
          createdAt: new Date().toISOString(),
        }
      ],
    },
  ]);

  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Filter meetings by status
  const filteredMeetings = meetings.filter(meeting => 
    statusFilter === 'all' || meeting.status === statusFilter
  );

  // Handler functions
  const handleCreateTask = (meetingId: number, taskText: string) => {
    // Create a new task
    const newTaskId = Math.max(...meetings.flatMap(m => m.tasks?.map(t => t.id) || [0])) + 1;
    
    const newTask: Task = {
      id: newTaskId,
      userId: userId,
      text: taskText,
      done: false,
      source: 'meeting',
      tags: ['meeting', 'action-item'],
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    
    // Update the meetings with the new task
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
    
    // If a meeting is selected, update it too
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        tasks: [...(selectedMeeting.tasks || []), newTask]
      });
    }
    
    // Create it in the main task list too via API
    try {
      fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taskText,
          done: false,
          source: 'meeting',
          tags: ['meeting', 'action-item'],
          priority: 'medium',
          notes: `From meeting: ${meetings.find(m => m.id === meetingId)?.title || 'Unknown meeting'}`,
        }),
      });
    } catch (error) {
      console.error('Error creating task in task list:', error);
    }
  };
  
  // Create meeting
  const handleCreateMeeting = (meeting: Meeting) => {
    const newMeeting = {
      ...meeting,
      userId,
      id: meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1,
      tasks: []
    };
    
    setMeetings([...meetings, newMeeting]);
    setView('list');
    
    toast({
      title: "Meeting notes created",
      description: "Your meeting notes have been saved.",
    });
  };
  
  // Update meeting
  const handleUpdateMeeting = (meeting: Meeting) => {
    const updatedMeetings = meetings.map(m => 
      m.id === meeting.id ? { ...meeting, tasks: m.tasks } : m
    );
    
    setMeetings(updatedMeetings);
    setSelectedMeeting({ ...meeting, tasks: selectedMeeting?.tasks || [] });
    setEditingMeeting(null);
    setView('detail');
    
    toast({
      title: "Meeting notes updated",
      description: "Your changes have been saved.",
    });
  };

  // Delete meeting
  const handleDeleteMeeting = (id: number) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
    setSelectedMeeting(null);
    setView('list');
    
    toast({
      title: "Meeting deleted",
      description: "The meeting has been removed.",
    });
  };

  // Change meeting status
  const handleStatusChange = (id: number, status: 'upcoming' | 'completed' | 'cancelled') => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === id ? { ...meeting, status } : meeting
    );
    
    setMeetings(updatedMeetings);
    
    // Update selected meeting if it's the one being changed
    if (selectedMeeting && selectedMeeting.id === id) {
      setSelectedMeeting({ ...selectedMeeting, status });
    }
    
    toast({
      title: "Status updated",
      description: `Meeting marked as ${status}.`,
    });
  };

  return (
    <DashboardLayout title="Meetings">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Meeting Notes</h1>
            
            {view === 'list' && (
              <Button
                onClick={() => {
                  setEditingMeeting(null);
                  setView('form');
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                New Meeting Notes
              </Button>
            )}
            
            {view !== 'list' && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMeeting(null);
                  setEditingMeeting(null);
                  setView('list');
                }}
              >
                Back to List
              </Button>
            )}
          </div>
          
          {view === 'list' && (
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'cancelled'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Meetings List View */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeetings.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">No meetings found. Create a new meeting to get started.</p>
              </div>
            ) : (
              filteredMeetings.map(meeting => (
                <div 
                  key={meeting.id}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setView('detail');
                  }}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{meeting.title}</h3>
                    <div className={`px-2 py-1 rounded text-xs ${
                      meeting.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    <span>{format(new Date(meeting.date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      meeting.meetingType === 'internal' ? 'bg-teal-100 text-teal-800' :
                      meeting.meetingType === 'client' ? 'bg-purple-100 text-purple-800' :
                      meeting.meetingType === 'one-on-one' ? 'bg-yellow-100 text-yellow-800' :
                      meeting.meetingType === 'interview' ? 'bg-blue-100 text-blue-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
                    </div>
                    
                    {meeting.tasks && meeting.tasks.length > 0 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        {meeting.tasks.length} task{meeting.tasks.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Meeting Detail View */}
        {view === 'detail' && selectedMeeting && (
          <MeetingDetail 
            meeting={selectedMeeting}
            onEdit={(meeting) => {
              setEditingMeeting(meeting);
              setView('form');
            }}
            onBack={() => {
              setSelectedMeeting(null);
              setView('list');
            }}
            onDelete={handleDeleteMeeting}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
          />
        )}
        
        {/* Meeting Form View */}
        {view === 'form' && (
          <MeetingNotesForm
            meeting={editingMeeting}
            onSave={editingMeeting ? handleUpdateMeeting : handleCreateMeeting}
            onCancel={() => {
              if (editingMeeting) {
                setEditingMeeting(null);
                setView('detail');
              } else {
                setView('list');
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
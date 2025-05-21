import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { CalendarIcon, PlusCircleIcon, CheckIcon, ClipboardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
        <div className={`px-2 py-1 rounded text-xs ${getStatusBadge(meeting.status)}`}>
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-2 flex items-center">
        <span className="mr-2">{new Date(meeting.date).toLocaleDateString()}</span>
        <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(meeting.meetingType)}`}>
          {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
        </div>
        
        <div className="text-xs text-gray-500">
          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {meeting.tasks && meeting.tasks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex items-center">
            <CheckIcon className="h-3 w-3 mr-1" />
            {meeting.tasks.length} task{meeting.tasks.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Format time display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
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
        <h2 className="text-xl font-medium text-gray-800">{meeting.title}</h2>
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
              <CalendarIcon className="h-5 w-5" />
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
              <span className="text-lg">📍</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Location</h3>
              <p className="text-sm text-gray-600">{meeting.location}</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <span className="text-lg">🏷️</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Type</h3>
              <p className="text-sm text-gray-600">
                {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1).replace('-', ' ')}
              </p>
            </div>
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
            <h3 className="text-sm font-medium text-gray-700 mb-2">Attendees</h3>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((attendee, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {attendee}
                </span>
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
    onSave(formData);
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
              rows={12}
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
              {isEditing ? 'Update Meeting' : 'Save Meeting'}
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
  const queryClient = useQueryClient();
  const userId = user?.id?.toString() || '1'; // Fallback to '1' for demo
  
  // Sample task data
  const sampleTasks = [
    {
      id: 101,
      userId: userId,
      text: "Prepare agenda for next sprint planning",
      done: false,
      source: "meeting",
      tags: ["internal", "planning"],
      priority: "high",
      createdAt: new Date().toISOString(),
    },
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
  ];
  
  // Sample meetings for demonstration
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
      notes: '# Weekly Team Standup\n\n## Updates\n- Backend API integration is 80% complete\n- Frontend design updates completed\n- QA started testing new features\n\n## Action Items\n- [ ] Send updated timeline to stakeholders\n- [ ] Schedule additional resources for API work\n- [ ] Review QA feedback by Friday\n\n## Next Steps\n- Continue API development\n- Start planning for next sprint',
      status: 'upcoming',
      meetingType: 'internal',
      tasks: [sampleTasks[0]],
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
      notes: '# Project Kickoff\n\n## Project Goals\n- Launch initial version by August 15th\n- Address client\'s primary pain points\n- Establish scalable architecture\n\n## Timeline\n- Design phase: 2 weeks\n- Development: 8 weeks\n- Testing: 2 weeks\n- Launch: 1 week\n\n## Action Items\n- [ ] Create detailed project plan\n- [ ] Set up development environments\n- [ ] Schedule recurring status meetings',
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
      notes: '# Performance Review\n\n## Achievements\n- Successfully led the redesign project\n- Improved build performance by 30%\n- Mentored 2 junior team members\n\n## Areas for Growth\n- Technical documentation could be more comprehensive\n- Consider taking on more project management responsibilities\n\n## Goals for Next Quarter\n- Complete advanced certification\n- Lead a cross-functional initiative\n\n## Action Items\n- [ ] Research certification courses\n- [ ] Draft development plan\n- [ ] Schedule monthly check-ins',
      status: 'upcoming',
      meetingType: 'one-on-one',
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
      notes: '# Budget Review Meeting\n\n## Q1 Highlights\n- Overall spending 5% under budget\n- Marketing expenses 10% over allocated budget\n- New equipment purchases delayed to Q2\n\n## Q2 Planning\n- Increase development resources budget by 15%\n- Reduce travel expenses by 20%\n\n## Action Items\n- [ ] Prepare updated budget proposal\n- [ ] Schedule individual department reviews\n- [ ] Finalize Q2 financial plan\n',
      status: 'completed',
      meetingType: 'internal',
      tasks: [sampleTasks[1]],
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // In a real implementation, we would fetch meetings from the API
  // For demo, we're using local state
  
  // Handler functions
  const handleCreateTask = (meetingId: number, taskText: string) => {
    // In a real implementation, this would call the API
    const newTaskId = Math.max(...meetings.flatMap(m => m.tasks?.map(t => t.id) || [0]), ...sampleTasks.map(t => t.id)) + 1;
    
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
      setSelectedMeeting(newMeeting);
    } else {
      // Update existing meeting
      const updatedMeetings = meetings.map(m => 
        m.id === meeting.id ? { ...meeting, tasks: m.tasks || [] } : m
      );
      setMeetings(updatedMeetings);
      setSelectedMeeting({ ...meeting, tasks: selectedMeeting?.tasks || [] });
    }
    
    setEditingMeeting(null);
    setView('detail');
    
    toast({
      title: meeting.id === 0 ? "Meeting created" : "Meeting updated",
      description: "Your meeting has been saved successfully.",
    });
  };

  // Handle deleting a meeting
  const handleDeleteMeeting = (id: number) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
    setSelectedMeeting(null);
    setView('list');
    
    toast({
      title: "Meeting deleted",
      description: "The meeting has been removed.",
    });
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
    
    toast({
      title: "Status updated",
      description: `Meeting marked as ${status}.`,
    });
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
              + New Meeting
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {filter === 'all' ? 'All Meetings' : 
                  filter === 'upcoming' ? 'Upcoming Meetings' : 
                  filter === 'completed' ? 'Completed Meetings' : 'Cancelled Meetings'}
              </h2>
              
              {sortedMeetings.length === 0 ? (
                <div className="py-8 text-center">
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
            onBack={() => setView('list')}
            onDelete={handleDeleteMeeting}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
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
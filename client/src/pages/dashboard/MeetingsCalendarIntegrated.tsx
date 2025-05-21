import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { CalendarIcon, PlusCircleIcon, CheckIcon, LinkIcon, ClipboardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

// Meeting type definition
interface Meeting {
  id: number;
  userId: string;
  title: string;
  description: string;
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

// Calendar Event type definition
interface CalendarEvent {
  id: string;
  calendarId?: string;
  summary: string; // title
  description?: string;
  location?: string;
  start: { dateTime?: string; timeZone?: string; date?: string };
  end?: { dateTime?: string; timeZone?: string; date?: string };
  attendees?: Array<{ email: string; name?: string; responseStatus?: string }>;
  organizer?: { email: string; displayName?: string };
  source?: string;
  hangoutLink?: string;
  htmlLink?: string;
  conference?: any;
  color?: string;
}

// Note Template type
interface NoteTemplate {
  name: string;
  template: string;
}

// Helper to get event date from calendar event
const getEventDateTime = (event: CalendarEvent): Date => {
  if (!event.start) return new Date();
  
  if (event.start.dateTime) {
    return parseISO(event.start.dateTime);
  } else if (event.start.date) {
    return parseISO(event.start.date);
  } else {
    return new Date();
  }
};

// Helper to format calendar event time
const formatEventTime = (event: CalendarEvent) => {
  if (!event.start) return 'TBD';
  
  // Safely extract start date/time
  let startDateTime: Date;
  let isAllDay = false;
  
  if ('dateTime' in event.start && event.start.dateTime) {
    startDateTime = parseISO(event.start.dateTime);
  } else if ('date' in event.start && event.start.date) {
    startDateTime = parseISO(event.start.date);
    isAllDay = true;
  } else {
    startDateTime = new Date();
  }
  
  // Safely extract end date/time
  let endDateTime: Date;
  
  if (event.end) {
    if ('dateTime' in event.end && event.end.dateTime) {
      endDateTime = parseISO(event.end.dateTime);
    } else if ('date' in event.end && event.end.date) {
      endDateTime = parseISO(event.end.date);
    } else {
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1); // Default 1 hour duration
    }
  } else {
    endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1); // Default 1 hour duration
  }
  
  if (isAllDay) {
    return 'All day';
  }
  
  return `${format(startDateTime, 'h:mm a')} - ${format(endDateTime, 'h:mm a')}`;
};

// Calendar Event Card component
const CalendarEventCard = ({ 
  event, 
  onSelectEvent, 
  isMeetingLinked 
}: { 
  event: CalendarEvent; 
  onSelectEvent: (event: CalendarEvent) => void;
  isMeetingLinked: (eventId: string) => boolean;
}) => {
  // Safely extract date using helper function
  const startDateTime = getEventDateTime(event);
  
  const sourceColors = {
    'google': 'bg-blue-100 text-blue-800',
    'outlook': 'bg-teal-100 text-teal-800',
    'work': 'bg-purple-100 text-purple-800'
  };
  
  const sourceColorClass = event.source ? 
    sourceColors[event.source] || 'bg-gray-100 text-gray-800' : 
    'bg-gray-100 text-gray-800';
  
  return (
    <div 
      onClick={() => onSelectEvent(event)}
      className={`p-4 border border-gray-200 rounded-lg transition-shadow cursor-pointer ${
        isMeetingLinked(event.id) ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 line-clamp-2">{event.summary}</h3>
        {isMeetingLinked(event.id) && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
            <LinkIcon className="h-3 w-3 mr-1" />
            Linked
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {formatEventTime(event)}
      </div>
      
      <div className="flex justify-between items-center">
        <div className={`px-2 py-1 rounded-full text-xs ${sourceColorClass}`}>
          {event.source ? event.source.charAt(0).toUpperCase() + event.source.slice(1) : 'Calendar'}
        </div>
        
        {event.location && (
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            {event.location}
          </div>
        )}
      </div>
      
      {event.attendees && event.attendees.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

// Meeting detail component
const MeetingDetail = ({ 
  meeting,
  event,
  onEdit,
  onBack,
  onDelete,
  onStatusChange,
  onCreateTask
}: {
  meeting: Meeting;
  event?: CalendarEvent;
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
        {event && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Calendar Event</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-800 font-medium">{event.summary}</p>
                <p className="text-xs text-gray-500">
                  {event.start.dateTime ? format(parseISO(event.start.dateTime), 'EEEE, MMMM d, yyyy') : 
                    (event.start.date ? format(parseISO(event.start.date), 'EEEE, MMMM d, yyyy') : '')}
                </p>
                <p className="text-xs text-gray-500">{formatEventTime(event)}</p>
              </div>
              
              {event.location && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Location:</span> {event.location}
                </p>
              )}
              
              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 font-medium">Attendees:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.attendees.slice(0, 5).map((attendee, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                        title={attendee.email}
                      >
                        {attendee.name || attendee.email}
                      </span>
                    ))}
                    {event.attendees.length > 5 && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        +{event.attendees.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {event.description && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Description:</span> {event.description}
                </p>
              )}
            </div>
          </div>
        )}
      
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
  const { toast } = useToast();
  const isEditing = !!meeting;
  
  const [formData, setFormData] = useState<Meeting>(meeting || {
    id: 0,
    userId: '',
    title: '',
    description: '',
    notes: '',
    status: 'upcoming',
    meetingType: 'internal',
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
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        {isEditing ? 'Edit Meeting Notes' : 'Create New Meeting Notes'}
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
              {isEditing ? 'Update Notes' : 'Save Notes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Create New Meeting Notes from Event component
const CreateMeetingFromEvent = ({
  event,
  onSave,
  onCancel
}: {
  event: CalendarEvent;
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
}) => {
  const { toast } = useToast();
  
  // Generate a title based on the event summary
  const eventTitle = event.summary || 'Untitled Event';
  
  // Determine meeting type based on event title or description
  const determineMeetingType = (): 'internal' | 'client' | 'one-on-one' | 'interview' | 'workshop' => {
    const titleLower = eventTitle.toLowerCase();
    const descriptionLower = event.description?.toLowerCase() || '';
    
    if (titleLower.includes('interview') || descriptionLower.includes('interview')) {
      return 'interview';
    } else if (titleLower.includes('1:1') || titleLower.includes('one on one') || titleLower.includes('1-on-1')) {
      return 'one-on-one';
    } else if (titleLower.includes('workshop') || descriptionLower.includes('workshop')) {
      return 'workshop';
    } else if (titleLower.includes('client') || descriptionLower.includes('client')) {
      return 'client';
    } else {
      return 'internal';
    }
  };
  
  // Generate description from event details
  const generateDescription = (): string => {
    let description = event.description || '';
    
    // Add location if available
    if (event.location) {
      description += `\nLocation: ${event.location}`;
    }
    
    // Add attendees if available
    if (event.attendees && event.attendees.length > 0) {
      description += `\n\nAttendees:\n`;
      event.attendees.forEach(attendee => {
        description += `- ${attendee.name || attendee.email}\n`;
      });
    }
    
    return description;
  };
  
  const [formData, setFormData] = useState<Meeting>({
    id: 0,
    userId: '',
    title: eventTitle,
    description: generateDescription(),
    notes: '',
    status: 'upcoming',
    meetingType: determineMeetingType(),
    calendarEventId: event.id,
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
    setFormData({
      ...formData,
      notes: templateText
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Apply appropriate template based on meeting type when component mounts
  useEffect(() => {
    const defaultTemplate = formData.meetingType === 'one-on-one' ? 
      noteTemplates[1].template : 
      (formData.meetingType === 'client' ? 
        noteTemplates[3].template : 
        noteTemplates[0].template);
        
    setFormData(prev => ({
      ...prev,
      notes: defaultTemplate
    }));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <CalendarIcon className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-gray-800">Create Notes for Calendar Event</h2>
          <p className="text-sm text-gray-500">
            {format(
              event.start.dateTime ? parseISO(event.start.dateTime) : parseISO(event.start.date as string), 
              'EEE, MMM d, yyyy'
            )}
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium text-blue-800">Event Details</h3>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-800 font-medium">{event.summary}</p>
          <p className="text-xs text-gray-600">{formatEventTime(event)}</p>
          
          {event.location && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Location:</span> {event.location}
            </p>
          )}
          
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 font-medium">Attendees:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {event.attendees.slice(0, 5).map((attendee, i) => (
                  <span 
                    key={i} 
                    className="text-xs bg-white px-2 py-0.5 rounded-full"
                    title={attendee.email}
                  >
                    {attendee.name || attendee.email}
                  </span>
                ))}
                {event.attendees.length > 5 && (
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                    +{event.attendees.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {event.description && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Description:</span> {event.description}
            </p>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title
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
              Create Meeting Notes
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
  
  // Fetch real calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Calculate time range for fetching events (current month + next month)
  const timeRange = useMemo(() => {
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const timeMax = nextMonth.toISOString();
    return { timeMin, timeMax };
  }, []);

  // Fetch calendar events from API
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      setIsLoadingEvents(true);
      try {
        // Build API URL for calendar events
        const apiUrl = `/api/calendar?timeMin=${encodeURIComponent(timeRange.timeMin)}&timeMax=${encodeURIComponent(timeRange.timeMax)}&useCalendarSources=true`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }
        
        const data = await response.json();
        setCalendarEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        toast({
          title: "Failed to load calendar events",
          description: "There was an error loading your calendar events. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingEvents(false);
      }
    };

    if (user?.id) {
      fetchCalendarEvents();
    }
  }, [user?.id, timeRange, toast]);
  
  // Sample meetings for demonstration
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      userId: userId,
      title: 'Weekly Team Standup',
      description: 'Regular weekly team meeting to discuss progress, blockers, and upcoming priorities.',
      notes: '# Weekly Team Standup\n\n## Updates\n- Backend API integration is 80% complete\n- Frontend design updates completed\n- QA started testing new features\n\n## Action Items\n- [ ] Send updated timeline to stakeholders\n- [ ] Schedule additional resources for API work\n- [ ] Review QA feedback by Friday\n\n## Next Steps\n- Continue API development\n- Start planning for next sprint',
      status: 'upcoming',
      meetingType: 'internal',
      calendarEventId: 'event1',
      tasks: [sampleTasks[0]],
    },
    {
      id: 2,
      userId: userId,
      title: 'Project Kickoff Meeting',
      description: 'Initial kickoff meeting to discuss project goals, timeline, and resource allocation for the new client project.',
      notes: '# Project Kickoff\n\n## Project Goals\n- Launch initial version by August 15th\n- Address client\'s primary pain points\n- Establish scalable architecture\n\n## Timeline\n- Design phase: 2 weeks\n- Development: 8 weeks\n- Testing: 2 weeks\n- Launch: 1 week\n\n## Action Items\n- [ ] Create detailed project plan\n- [ ] Set up development environments\n- [ ] Schedule recurring status meetings',
      status: 'upcoming',
      meetingType: 'client',
      calendarEventId: 'event2',
      tasks: [],
    },
    {
      id: 6,
      userId: userId,
      title: 'Last Month\'s Budget Review',
      description: 'Review of last month\'s budget, expenses, and financial planning for the next quarter.',
      notes: '# Budget Review Meeting\n\n## Q1 Highlights\n- Overall spending 5% under budget\n- Marketing expenses 10% over allocated budget\n- New equipment purchases delayed to Q2\n\n## Q2 Planning\n- Increase development resources budget by 15%\n- Reduce travel expenses by 20%\n\n## Action Items\n- [ ] Prepare updated budget proposal\n- [ ] Schedule individual department reviews\n- [ ] Finalize Q2 financial plan\n',
      status: 'completed',
      meetingType: 'internal',
      calendarEventId: 'event4',
      tasks: [sampleTasks[1]],
    },
  ]);

  const [view, setView] = useState<'events' | 'meetings' | 'detail' | 'form' | 'create-from-event'>('events');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('upcoming');

  // In a real implementation, we would fetch events from the API
  // For demo, we're using local state
  
  // Check if a meeting is already linked to an event
  const isMeetingLinkedToEvent = (eventId: string): boolean => {
    return meetings.some(meeting => meeting.calendarEventId === eventId);
  };
  
  // Find associated meeting for an event
  const findMeetingForEvent = (eventId: string): Meeting | undefined => {
    return meetings.find(meeting => meeting.calendarEventId === eventId);
  };
  
  // Get event by ID
  const getEventById = (eventId: string): CalendarEvent | undefined => {
    return calendarEvents.find(event => event.id === eventId);
  };
  
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
  
  // Select a calendar event to create meeting notes
  const handleSelectEvent = (event: CalendarEvent) => {
    // Check if this event already has meeting notes
    const existingMeeting = findMeetingForEvent(event.id);
    
    if (existingMeeting) {
      // If meeting notes exist, show them
      setSelectedMeeting(existingMeeting);
      setSelectedEvent(event);
      setView('detail');
    } else {
      // If no meeting notes exist yet, create new ones
      setSelectedEvent(event);
      setView('create-from-event');
    }
  };
  
  // Create new meeting notes for a calendar event
  const handleCreateMeetingFromEvent = (meeting: Meeting) => {
    const newMeeting = {
      ...meeting,
      userId,
      id: meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1,
      tasks: []
    };
    
    setMeetings([...meetings, newMeeting]);
    setSelectedMeeting(newMeeting);
    setView('detail');
    
    toast({
      title: "Meeting notes created",
      description: "Notes have been linked to the calendar event.",
    });
  };
  
  // Filter events by date range
  const filteredEvents = calendarEvents.filter(event => {
    if (dateFilter === 'all') return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = event.start.dateTime ? 
      new Date(event.start.dateTime) : 
      (event.start.date ? new Date(event.start.date) : new Date());
      
    if (dateFilter === 'today') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return eventDate >= today && eventDate <= endOfDay;
    }
    
    if (dateFilter === 'upcoming') {
      return eventDate >= today;
    }
    
    if (dateFilter === 'past') {
      return eventDate < today;
    }
    
    return true;
  });
  
  // Handle editing a meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setView('form');
  };

  // Handle saving a meeting (edited)
  const handleSaveMeeting = (meeting: Meeting) => {
    // Update existing meeting
    const updatedMeetings = meetings.map(m => 
      m.id === meeting.id ? { ...meeting, tasks: m.tasks || [] } : m
    );
    setMeetings(updatedMeetings);
    
    // If this meeting is the selected one, update it
    if (selectedMeeting && selectedMeeting.id === meeting.id) {
      setSelectedMeeting({ ...meeting, tasks: selectedMeeting.tasks || [] });
    }
    
    setEditingMeeting(null);
    setView('detail');
    
    toast({
      title: "Meeting notes updated",
      description: "Your changes have been saved.",
    });
  };

  // Handle deleting a meeting
  const handleDeleteMeeting = (id: number) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
    setSelectedMeeting(null);
    setView('events');
    
    toast({
      title: "Meeting notes deleted",
      description: "The meeting notes have been removed.",
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
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('events')}
                className={`px-4 py-2 rounded-md ${
                  view === 'events' || view === 'create-from-event'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Calendar Events
              </button>
              <button
                onClick={() => {
                  setView('meetings');
                  setSelectedMeeting(null);
                  setSelectedEvent(null);
                }}
                className={`px-4 py-2 rounded-md ${
                  view === 'meetings'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Meeting Notes
              </button>
            </div>
            
            {view !== 'detail' && view !== 'form' && view !== 'create-from-event' && (
              <div className="flex space-x-2">
                {view === 'events' && (
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                  >
                    <option value="upcoming">Upcoming Events</option>
                    <option value="today">Today's Events</option>
                    <option value="past">Past Events</option>
                    <option value="all">All Events</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {view === 'events' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              {dateFilter === 'all' ? 'All Calendar Events' : 
               dateFilter === 'today' ? 'Today\'s Events' : 
               dateFilter === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </h2>
            
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No events found in this time range.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <CalendarEventCard 
                    key={event.id}
                    event={event}
                    onSelectEvent={handleSelectEvent}
                    isMeetingLinked={isMeetingLinkedToEvent}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {view === 'meetings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">All Meeting Notes</h2>
            
            {meetings.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No meeting notes found. Select a calendar event to add notes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => {
                  const linkedEvent = meeting.calendarEventId ? 
                    getEventById(meeting.calendarEventId) : undefined;
                  
                  return (
                    <div 
                      key={meeting.id}
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setSelectedEvent(linkedEvent);
                        setView('detail');
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
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
                      
                      {linkedEvent && (
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          <span className="mr-2">
                            {linkedEvent.start.dateTime ? 
                              format(parseISO(linkedEvent.start.dateTime), 'MMM d, yyyy') : 
                              (linkedEvent.start.date ? format(parseISO(linkedEvent.start.date), 'MMM d, yyyy') : '')}
                          </span>
                          <span>{formatEventTime(linkedEvent)}</span>
                        </div>
                      )}
                      
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'detail' && selectedMeeting && (
          <MeetingDetail 
            meeting={selectedMeeting}
            event={selectedEvent || undefined}
            onEdit={handleEditMeeting}
            onBack={() => setView(selectedEvent ? 'events' : 'meetings')}
            onDelete={handleDeleteMeeting}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
          />
        )}

        {view === 'form' && editingMeeting && (
          <MeetingNotesForm 
            meeting={editingMeeting}
            onSave={handleSaveMeeting}
            onCancel={() => {
              setView('detail');
              setEditingMeeting(null);
            }}
          />
        )}
        
        {view === 'create-from-event' && selectedEvent && (
          <CreateMeetingFromEvent
            event={selectedEvent}
            onSave={handleCreateMeetingFromEvent}
            onCancel={() => {
              setView('events');
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
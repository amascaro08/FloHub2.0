import React, { useState } from 'react';
import { useLocation } from 'wouter';

// Meeting type definition
interface Meeting {
  id: number;
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
}

// Component to display meeting details
const MeetingDetail = ({ 
  meeting,
  onEdit,
  onDelete,
  onStatusChange
}: {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'upcoming' | 'completed' | 'cancelled') => void;
}) => {

  // Format time display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

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
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{meeting.description}</p>
      </div>
      
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
  const isEditing = !!meeting;
  
  const [formData, setFormData] = useState<Meeting>(meeting || {
    id: 0,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: 'Conference Room A',
    attendees: [],
    notes: '',
    status: 'upcoming',
    meetingType: 'internal'
  });

  const [newAttendee, setNewAttendee] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">
        {isEditing ? 'Edit Meeting' : 'Schedule New Meeting'}
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter meeting description"
              rows={3}
            />
          </div>
          
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
                Start Time*
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time*
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>
          
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter meeting notes"
              rows={5}
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
              {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
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
  // Sample meetings for demonstration
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: 'Weekly Team Standup',
      description: 'Regular weekly team meeting to discuss progress, blockers, and upcoming priorities.',
      date: '2025-05-20',
      startTime: '09:00',
      endTime: '09:30',
      location: 'Conference Room A',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson'],
      notes: '',
      status: 'upcoming',
      meetingType: 'internal'
    },
    {
      id: 2,
      title: 'Project Kickoff Meeting',
      description: 'Initial kickoff meeting to discuss project goals, timeline, and resource allocation for the new client project.',
      date: '2025-05-21',
      startTime: '13:00',
      endTime: '14:30',
      location: 'Main Conference Room',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'David Lee', 'Client Rep'],
      notes: '',
      status: 'upcoming',
      meetingType: 'client'
    },
    {
      id: 3,
      title: 'Performance Review',
      description: 'One-on-one performance review meeting to discuss progress, goals, and career development.',
      date: '2025-05-22',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Office 203',
      attendees: ['John Smith', 'Emma Wilson'],
      notes: '',
      status: 'upcoming',
      meetingType: 'one-on-one'
    },
    {
      id: 4,
      title: 'Software Developer Interview',
      description: 'Interview for the Senior Software Developer position.',
      date: '2025-05-23',
      startTime: '14:00',
      endTime: '15:30',
      location: 'Meeting Room B',
      attendees: ['John Smith', 'Sarah Johnson', 'Candidate'],
      notes: '',
      status: 'upcoming',
      meetingType: 'interview'
    },
    {
      id: 5,
      title: 'Product Design Workshop',
      description: 'Collaborative workshop to brainstorm new product features and design improvements.',
      date: '2025-05-24',
      startTime: '09:00',
      endTime: '12:00',
      location: 'Innovation Lab',
      attendees: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'Design Team', 'Product Team'],
      notes: '',
      status: 'upcoming',
      meetingType: 'workshop'
    },
    {
      id: 6,
      title: 'Last Month\'s Budget Review',
      description: 'Review of last month\'s budget, expenses, and financial planning for the next quarter.',
      date: '2025-05-15',
      startTime: '11:00',
      endTime: '12:00',
      location: 'Finance Department',
      attendees: ['John Smith', 'Finance Director', 'Department Heads'],
      notes: 'Discussed budget allocation for Q3. Identified areas for cost optimization. Action items assigned to department heads for detailed expense reports.',
      status: 'completed',
      meetingType: 'internal'
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

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
        id: meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1
      };
      setMeetings([...meetings, newMeeting]);
    } else {
      // Update existing meeting
      setMeetings(meetings.map(m => m.id === meeting.id ? meeting : m));
    }
    setSelectedMeeting(meeting.id !== 0 ? meeting : null);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
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
    </div>
  );
}
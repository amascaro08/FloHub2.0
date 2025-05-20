import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CalendarWidgetComponent from '@/components/calendar/CalendarWidget';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  FileText, 
  MessageSquare,
  Menu,
  X,
  Settings,
  User,
  Lock,
  Unlock,
  Plus,
  Search
} from 'lucide-react';

// Use the responsive grid layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget types
type WidgetType = 'tasks' | 'calendar' | 'chat' | 'overview' | 'notes' | 'habits';

// Simplified demo widgets
const TaskWidget = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finish project proposal", dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), done: false, source: "personal", tags: ["work"] },
    { id: 2, text: "Schedule team meeting", dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), done: false, source: "work", tags: ["meeting"] },
    { id: 3, text: "Send email to client", dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), done: true, source: "personal", tags: ["client"] },
  ]);
  
  const [newTask, setNewTask] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  
  // Toggle task completion status
  const toggleTaskDone = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };
  
  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return;
    
    const newTaskObj = {
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      text: newTask.trim(),
      dueDate: new Date().toISOString(),
      done: false,
      source: "personal",
      tags: []
    };
    
    setTasks([...tasks, newTaskObj]);
    setNewTask("");
  };
  
  // Format date to readable format
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="flex mb-3">
        <input 
          type="text" 
          placeholder="Add a new task..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <button 
          onClick={addTask}
          className="bg-teal-600 text-white px-3 rounded-r-md hover:bg-teal-700"
        >
          Add
        </button>
      </div>
      
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="flex items-start group">
            <div className="flex items-center h-5 mt-1">
              <input 
                type="checkbox" 
                checked={task.done}
                onChange={() => toggleTaskDone(task.id)}
                className="h-4 w-4 rounded border-gray-300" 
              />
            </div>
            <div className="ml-3 text-sm flex-1">
              <div className="flex justify-between">
                <label className={`font-medium text-gray-800 ${task.done ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </label>
                <div className="hidden group-hover:flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center">
                <p className="text-gray-500 mr-2">{formatDate(task.dueDate)}</p>
                
                {/* Source tag */}
                <span className={`px-1.5 py-0.5 text-xs rounded-full mr-1 ${
                  task.source === 'work' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {task.source}
                </span>
                
                {/* Task tags */}
                {task.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full mr-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CalendarWidget = () => {
  const [events, setEvents] = useState([
    { 
      id: '1', 
      summary: 'Team Standup', 
      start: { dateTime: `${new Date().toISOString().split('T')[0]}T10:00:00` },
      end: { dateTime: `${new Date().toISOString().split('T')[0]}T10:30:00` },
      source: 'work',
      calendarName: 'Work',
      tags: ['daily', 'team']
    },
    { 
      id: '2', 
      summary: 'Client Meeting', 
      start: { dateTime: `${new Date().toISOString().split('T')[0]}T14:00:00` },
      end: { dateTime: `${new Date().toISOString().split('T')[0]}T15:00:00` },
      source: 'personal',
      calendarName: 'Personal',
      tags: ['client']
    },
    { 
      id: '3', 
      summary: 'Project Review', 
      start: { dateTime: `${new Date().toISOString().split('T')[0]}T16:30:00` },
      end: { dateTime: `${new Date().toISOString().split('T')[0]}T17:30:00` },
      source: 'work',
      calendarName: 'Work',
      tags: ['project']
    }
  ]);
  
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [selectedCalendars, setSelectedCalendars] = useState(['Work', 'Personal']);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Get current month name and year
  const currentMonthYear = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Get current date
  const today = new Date();
  const currentDay = today.getDate();
  
  // Calculate days in current month
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  
  // Calculate first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();
  
  // Format event time
  const formatEventTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Filter events for today
  const todaysEvents = events.filter(event => {
    if (!event.start.dateTime) return false;
    const eventDate = new Date(event.start.dateTime).toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];
    return eventDate === todayDate;
  }).sort((a, b) => {
    return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime();
  });
  
  return (
    <div className="h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{currentMonthYear}</h3>
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setView('today')}
            className={`px-2 py-1 rounded ${view === 'today' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-2 py-1 rounded ${view === 'week' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-2 py-1 rounded ${view === 'month' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100'}`}
          >
            Month
          </button>
        </div>
      </div>
      
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-1 text-xs mb-4">
          <div className="text-center font-medium">Su</div>
          <div className="text-center font-medium">Mo</div>
          <div className="text-center font-medium">Tu</div>
          <div className="text-center font-medium">We</div>
          <div className="text-center font-medium">Th</div>
          <div className="text-center font-medium">Fr</div>
          <div className="text-center font-medium">Sa</div>
          
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="text-center p-1"></div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNumber = i + 1;
            const isToday = dayNumber === currentDay;
            const hasEvents = events.some(event => {
              if (!event.start.dateTime) return false;
              const eventDate = new Date(event.start.dateTime);
              return eventDate.getDate() === dayNumber && 
                    eventDate.getMonth() === today.getMonth() &&
                    eventDate.getFullYear() === today.getFullYear();
            });
            
            return (
              <div 
                key={dayNumber} 
                className={`text-center p-1 rounded-full relative
                  ${isToday ? 'bg-teal-500 text-white font-bold' : 'hover:bg-gray-100'}
                `}
              >
                {dayNumber}
                {hasEvents && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Events</h4>
        {todaysEvents.length === 0 ? (
          <p className="text-sm text-gray-500">No events scheduled for today</p>
        ) : (
          <div className="space-y-2">
            {todaysEvents.map(event => (
              <div 
                key={event.id} 
                className={`p-2 rounded-md ${
                  event.source === 'work' ? 'bg-blue-50' : 'bg-teal-50'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-xs font-medium ${
                    event.source === 'work' ? 'text-blue-700' : 'text-teal-700'
                  }`}>
                    {formatEventTime(event.start.dateTime)} - {event.summary}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    event.source === 'work' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {event.calendarName}
                  </span>
                </div>
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-gray-100 px-1 py-0.5 rounded-full text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-right">
        <button className="text-teal-600 text-xs flex items-center ml-auto">
          <span>View Full Calendar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "How can I help you today?",
      timestamp: "10:30 AM"
    },
    {
      role: "user",
      content: "I need help organizing my tasks for the week.",
      timestamp: "10:31 AM"
    },
    {
      role: "assistant",
      content: "I can help with that! Would you like me to create a task schedule based on priority?",
      timestamp: "10:32 AM"
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    setMessages([
      ...messages,
      {
        role: "user",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    ]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'll help you organize that. Let me analyze your calendar and existing tasks to create an optimal schedule.",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }
      ]);
    }, 1000);
    
    setNewMessage("");
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="overflow-y-auto flex-1 mb-4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`${
              msg.role === "assistant" 
                ? "bg-gray-100" 
                : "bg-teal-100 ml-auto"
            } p-3 rounded-lg mb-3 max-w-[80%]`}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {msg.role === "assistant" ? "FloCat Assistant" : "You"} - {msg.timestamp}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-auto flex">
        <input 
          type="text" 
          placeholder="Type your message..." 
          className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button 
          className="bg-teal-500 text-white px-4 py-2 rounded-r-md"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const OverviewWidget = () => {
  // Get current date
  const today = new Date();
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const currentDate = today.toLocaleDateString('en-US', dateOptions as any);
  
  return (
    <div className="h-full overflow-auto">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Today: {currentDate}</h3>
        <div className="bg-teal-50 p-3 rounded-md">
          <p className="text-sm">Complete project proposal draft</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">3 tasks completed today</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">2 meetings scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">5 new notes created</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div className="h-2 bg-teal-500 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">60% of weekly goals completed</div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Weather</h3>
        <div className="flex items-center">
          <div className="text-2xl mr-2">☀️</div>
          <div>
            <div className="text-sm font-medium">72°F</div>
            <div className="text-xs text-gray-600">Sunny, New York</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotesWidget = () => {
  const [note, setNote] = useState('');
  
  return (
    <div className="h-full overflow-auto">
      <textarea 
        className="w-full h-32 p-2 border border-gray-300 rounded-md mb-2 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50" 
        placeholder="Write a quick note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      ></textarea>
      <div className="flex justify-end mb-4">
        <button 
          className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
          onClick={() => {
            if (note.trim()) {
              alert('Note saved!');
              setNote('');
            }
          }}
        >
          Save Note
        </button>
      </div>
      <div className="space-y-3 mt-4">
        <div className="bg-yellow-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-800">Meeting Notes</h3>
          <p className="text-xs text-gray-600 mt-1">Created yesterday</p>
          <p className="text-sm mt-2">Discuss project timeline with team. Need to follow up on resources.</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-800">Ideas for Presentation</h3>
          <p className="text-xs text-gray-600 mt-1">Created 2 days ago</p>
          <p className="text-sm mt-2">Include case studies and client testimonials.</p>
        </div>
      </div>
    </div>
  );
};

// Habit Tracker Widget
const HabitTrackerWidget = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: "Exercise", streak: 3, target: 5, completedToday: false },
    { id: 2, name: "Read", streak: 7, target: 7, completedToday: true },
    { id: 3, name: "Meditate", streak: 1, target: 3, completedToday: false },
    { id: 4, name: "Journal", streak: 5, target: 5, completedToday: true }
  ]);
  
  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { ...habit, completedToday: !habit.completedToday } 
        : habit
    ));
  };
  
  const addHabit = () => {
    const habitName = prompt("Enter new habit name:");
    if (habitName) {
      const newId = Math.max(...habits.map(h => h.id)) + 1;
      setHabits([...habits, { 
        id: newId, 
        name: habitName, 
        streak: 0, 
        target: 3, 
        completedToday: false 
      }]);
    }
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">Your progress this week</div>
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div className="h-2 bg-teal-500 rounded-full" style={{ 
            width: `${(habits.filter(h => h.completedToday).length / habits.length) * 100}%` 
          }}></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={habit.completedToday}
                onChange={() => toggleHabit(habit.id)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{habit.name}</p>
                <p className="text-xs text-gray-500">
                  {habit.streak} day streak {habit.completedToday ? '(completed today)' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-teal-100 text-teal-800">
                {habit.streak}/{habit.target} days
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={addHabit}
        className="mt-4 text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
      >
        <span className="mr-1">+</span> Add new habit
      </button>
    </div>
  );
};

// Define widget components
const widgetComponents: Record<WidgetType, React.ReactNode> = {
  tasks: <TaskWidget />,
  calendar: <CalendarWidget />,
  chat: <ChatWidget />,
  overview: <OverviewWidget />,
  notes: <NotesWidget />,
  habits: <HabitTrackerWidget />
};

// Helper function to get the appropriate icon for each widget
const getWidgetIcon = (widgetKey: string) => {
  switch(widgetKey) {
    case 'tasks':
      return <CheckSquare className="w-5 h-5" />;
    case 'calendar':
      return <Calendar className="w-5 h-5" />;
    case 'chat':
      return <MessageSquare className="w-5 h-5" />;
    case 'overview':
      return <Clock className="w-5 h-5" />;
    case 'notes':
      return <FileText className="w-5 h-5" />;
    case 'habits':
      return <CheckSquare className="w-5 h-5" />;
    default:
      return null;
  }
};

// Available widgets for adding to dashboard
const availableWidgets = [
  {id: 'tasks', name: 'Tasks', icon: <CheckSquare className="w-5 h-5" />},
  {id: 'calendar', name: 'Calendar', icon: <Calendar className="w-5 h-5" />},
  {id: 'chat', name: 'Chat Assistant', icon: <MessageSquare className="w-5 h-5" />},
  {id: 'overview', name: 'At A Glance', icon: <Clock className="w-5 h-5" />},
  {id: 'notes', name: 'Quick Notes', icon: <FileText className="w-5 h-5" />},
  {id: 'habits', name: 'Habit Tracker', icon: <CheckSquare className="w-5 h-5" />}
];

// Define dashboard layout with consistent naming across breakpoints
const defaultLayouts = {
  lg: [
    { i: "tasks", x: 0, y: 0, w: 3, h: 5 },
    { i: "calendar", x: 3, y: 0, w: 3, h: 5 },
    { i: "overview", x: 0, y: 5, w: 3, h: 5 },
    { i: "notes", x: 3, y: 5, w: 3, h: 5 },
    { i: "habits", x: 6, y: 0, w: 3, h: 5 },
    { i: "chat", x: 6, y: 5, w: 3, h: 5 },
  ],
  md: [
    { i: "tasks", x: 0, y: 0, w: 4, h: 5 },
    { i: "calendar", x: 4, y: 0, w: 4, h: 5 },
    { i: "overview", x: 0, y: 5, w: 4, h: 5 },
    { i: "notes", x: 4, y: 5, w: 4, h: 5 },
    { i: "habits", x: 0, y: 10, w: 8, h: 5 },
    { i: "chat", x: 0, y: 15, w: 8, h: 5 },
  ],
  sm: [
    { i: "tasks", x: 0, y: 0, w: 6, h: 5 },
    { i: "calendar", x: 0, y: 5, w: 6, h: 5 },
    { i: "overview", x: 0, y: 10, w: 6, h: 5 },
    { i: "notes", x: 0, y: 15, w: 6, h: 5 },
    { i: "habits", x: 0, y: 20, w: 6, h: 5 },
    { i: "chat", x: 0, y: 25, w: 6, h: 5 },
  ],
  xs: [
    { i: "tasks", x: 0, y: 0, w: 4, h: 5 },
    { i: "calendar", x: 0, y: 5, w: 4, h: 5 },
    { i: "overview", x: 0, y: 10, w: 4, h: 5 },
    { i: "notes", x: 0, y: 15, w: 4, h: 5 },
    { i: "habits", x: 0, y: 20, w: 4, h: 5 },
    { i: "chat", x: 0, y: 25, w: 4, h: 5 },
  ],
  xxs: [
    { i: "tasks", x: 0, y: 0, w: 2, h: 5 },
    { i: "calendar", x: 0, y: 5, w: 2, h: 5 },
    { i: "overview", x: 0, y: 10, w: 2, h: 5 },
    { i: "notes", x: 0, y: 15, w: 2, h: 5 },
    { i: "habits", x: 0, y: 20, w: 2, h: 5 },
    { i: "chat", x: 0, y: 25, w: 2, h: 5 },
  ],
};

export default function Dashboard() {
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [isLocked, setIsLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(['tasks', 'calendar', 'chat', 'overview', 'notes', 'habits']);
  
  // Reference for debouncing layout saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load saved layout from localStorage on component mount
  useEffect(() => {
    try {
      // Load saved layout
      const savedLayout = localStorage.getItem('dashboard-layout');
      if (savedLayout) {
        setLayouts(JSON.parse(savedLayout));
      }
      
      // Load saved widgets
      const savedWidgets = localStorage.getItem('dashboard-widgets');
      if (savedWidgets) {
        setActiveWidgets(JSON.parse(savedWidgets));
      }
      
      // Load saved lock state
      const savedLockState = localStorage.getItem('dashboard-locked');
      if (savedLockState) {
        setIsLocked(JSON.parse(savedLockState));
      }
    } catch (error) {
      console.error("Failed to load dashboard state:", error);
    }
  }, []);
  
  // Handle layout changes and save to localStorage
  const handleLayoutChange = (_: any, allLayouts: any) => {
    // Debounce saving to localStorage to prevent excessive writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Get the current layouts from localStorage if they exist
        const existingLayoutsJson = localStorage.getItem('dashboard-layout');
        let existingLayouts = existingLayoutsJson ? JSON.parse(existingLayoutsJson) : {};
        
        // Merge the new layouts with existing layouts
        // This ensures we only update the breakpoints that have changed
        // and preserve layouts for breakpoints that weren't modified
        const mergedLayouts = { ...existingLayouts, ...allLayouts };
        
        // Save all layouts back to localStorage
        localStorage.setItem('dashboard-layout', JSON.stringify(mergedLayouts));
        setLayouts(mergedLayouts);
      } catch (error) {
        console.error("Failed to save layout:", error);
      }
    }, 500); // Wait 500ms before saving
  };
  
  // Toggle lock/unlock dashboard editing
  const toggleLock = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    localStorage.setItem('dashboard-locked', JSON.stringify(newLockState));
  };

  // Add a widget to the dashboard
  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      const newActiveWidgets = [...activeWidgets, widgetId];
      setActiveWidgets(newActiveWidgets);
      localStorage.setItem('dashboard-widgets', JSON.stringify(newActiveWidgets));
      setShowAddWidgetModal(false);
    }
  };

  // Remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    const newActiveWidgets = activeWidgets.filter(id => id !== widgetId);
    setActiveWidgets(newActiveWidgets);
    localStorage.setItem('dashboard-widgets', JSON.stringify(newActiveWidgets));
  };

  // Add Widget Modal Component
  const AddWidgetModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Add Widget</h3>
          <button onClick={() => setShowAddWidgetModal(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Select widgets to add to your dashboard:</p>
          <div className="grid grid-cols-2 gap-3">
            {availableWidgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => addWidget(widget.id)}
                disabled={activeWidgets.includes(widget.id)}
                className={`flex items-center p-3 rounded-md border ${
                  activeWidgets.includes(widget.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-teal-500">{widget.icon}</span>
                <span>{widget.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => setShowAddWidgetModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Dashboard">
      <div className="widget-grid">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <button 
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center"
              onClick={() => setShowAddWidgetModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Widget
            </button>
            <button
              className="p-2 rounded-md border text-gray-500 hover:bg-gray-100"
              onClick={toggleLock}
              title={isLocked ? "Unlock dashboard" : "Lock dashboard"}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 9, md: 8, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={50}
          isDraggable={!isLocked}
          isResizable={!isLocked}
          margin={[16, 16]}
          onLayoutChange={handleLayoutChange}
        >
          {activeWidgets
            .filter(widgetKey => 
              !searchQuery || 
              widgetKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (widgetKey === 'overview' && 'at a glance'.includes(searchQuery.toLowerCase()))
            )
            .map((widgetKey) => (
            <div key={widgetKey} className="widget bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="widget-header px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  {getWidgetIcon(widgetKey)}
                  <h3 className="ml-2 font-medium text-gray-700 capitalize">
                    {widgetKey === 'overview' ? 'At A Glance' : widgetKey}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <button 
                    className="p-1 text-gray-400 hover:text-red-500 rounded-md"
                    onClick={() => removeWidget(widgetKey)}
                    title="Remove widget"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="widget-body p-4 h-full">
                {widgetComponents[widgetKey as WidgetType]}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Add Widget Modal */}
      {showAddWidgetModal && <AddWidgetModal />}
    </DashboardLayout>
  );
}
import React, { useState } from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  FileText, 
  MessageSquare,
  Menu,
  X,
  Settings,
  User
} from 'lucide-react';

// Use the responsive grid layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget types
type WidgetType = 'tasks' | 'calendar' | 'chat' | 'overview' | 'notes' | 'habits';

// Simplified demo widgets
const TaskWidget = () => (
  <div className="h-full overflow-auto">
    <ul className="space-y-3">
      <li className="flex items-start">
        <div className="flex items-center h-5 mt-1">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-800">Finish project proposal</label>
          <p className="text-gray-500">Due tomorrow</p>
        </div>
      </li>
      <li className="flex items-start">
        <div className="flex items-center h-5 mt-1">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-800">Schedule team meeting</label>
          <p className="text-gray-500">By end of week</p>
        </div>
      </li>
      <li className="flex items-start">
        <div className="flex items-center h-5 mt-1">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-800 line-through">Send email to client</label>
          <p className="text-gray-500">Completed yesterday</p>
        </div>
      </li>
    </ul>
    <button className="mt-4 text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center">
      <span className="mr-1">+</span> Add new task
    </button>
  </div>
);

const CalendarWidget = () => (
  <div className="h-full overflow-hidden">
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">May 2025</h3>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs">
        <div className="text-center font-medium">Su</div>
        <div className="text-center font-medium">Mo</div>
        <div className="text-center font-medium">Tu</div>
        <div className="text-center font-medium">We</div>
        <div className="text-center font-medium">Th</div>
        <div className="text-center font-medium">Fr</div>
        <div className="text-center font-medium">Sa</div>
        
        {/* Calendar days */}
        {Array.from({ length: 31 }, (_, i) => (
          <div 
            key={i} 
            className={`text-center p-1 rounded-full ${i+1 === 15 ? 'bg-teal-500 text-white font-bold' : 'hover:bg-gray-100'}`}
          >
            {i+1}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Events</h4>
        <div className="bg-teal-50 p-2 rounded-md mb-2">
          <p className="text-xs font-medium text-teal-700">10:00 AM - Team Standup</p>
        </div>
        <div className="bg-orange-50 p-2 rounded-md">
          <p className="text-xs font-medium text-orange-700">2:00 PM - Client Meeting</p>
        </div>
      </div>
    </div>
  </div>
);

const ChatWidget = () => (
  <div className="h-full flex flex-col">
    <div className="overflow-y-auto flex-1 mb-4">
      <div className="bg-gray-100 p-3 rounded-lg mb-3 max-w-[80%]">
        <p className="text-sm">How can I help you today?</p>
        <p className="text-xs text-gray-500 mt-1">FloCat Assistant - 10:30 AM</p>
      </div>
      <div className="bg-teal-100 p-3 rounded-lg mb-3 max-w-[80%] ml-auto">
        <p className="text-sm">I need help organizing my tasks for the week.</p>
        <p className="text-xs text-gray-500 mt-1">You - 10:31 AM</p>
      </div>
      <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
        <p className="text-sm">I can help with that! Would you like me to create a task schedule based on priority?</p>
        <p className="text-xs text-gray-500 mt-1">FloCat Assistant - 10:32 AM</p>
      </div>
    </div>
    <div className="mt-auto flex">
      <input 
        type="text" 
        placeholder="Type your message..." 
        className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
      />
      <button className="bg-teal-500 text-white px-4 py-2 rounded-r-md">
        Send
      </button>
    </div>
  </div>
);

const OverviewWidget = () => (
  <div className="h-full overflow-auto">
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Focus for Today</h3>
      <div className="bg-teal-50 p-3 rounded-md mb-4">
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
  </div>
);

const NotesWidget = () => (
  <div className="h-full overflow-auto">
    <textarea 
      className="w-full h-32 p-2 border border-gray-300 rounded-md mb-2 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50" 
      placeholder="Write a quick note..."
    ></textarea>
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

// Enhanced widget with AI capabilities for the chat widget
const EnhancedChatWidget = () => {
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

// Habit Tracker Widget inspired by FloHub repository
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
  chat: <EnhancedChatWidget />,
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

// Define dashboard layout
const defaultLayouts = {
  lg: [
    { i: "tasks", x: 0, y: 0, w: 3, h: 5 },
    { i: "calendar", x: 3, y: 0, w: 3, h: 5 },
    { i: "overview", x: 0, y: 5, w: 3, h: 5 },
    { i: "notes", x: 3, y: 5, w: 3, h: 5 },
    { i: "habits", x: 6, y: 0, w: 3, h: 10 },
    { i: "chat", x: 0, y: 10, w: 9, h: 5 },
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
};

export default function Dashboard() {
  const [layouts] = useState(defaultLayouts);
  const activeWidgets = ['tasks', 'calendar', 'chat', 'overview', 'notes', 'habits'];

  return (
    <DashboardLayout title="Dashboard">
      <div className="widget-grid">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
              + Add Widget
            </button>
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 9, md: 8, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={50}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
        >
          {activeWidgets.map((widgetKey) => (
            <div key={widgetKey} className="widget bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="widget-header px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  {getWidgetIcon(widgetKey)}
                  <h3 className="ml-2 font-medium text-gray-700 capitalize">{widgetKey}</h3>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
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
    </DashboardLayout>
  );
}
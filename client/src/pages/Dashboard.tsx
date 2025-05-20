import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
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
            className={`text-center p-1 rounded-full ${i+1 === 20 ? 'bg-teal-500 text-white font-bold' : 'hover:bg-gray-100'}`}
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

// Define dashboard layout
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
        localStorage.setItem('dashboard-layout', JSON.stringify(allLayouts));
        setLayouts(allLayouts);
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
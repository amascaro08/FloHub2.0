import React, { useState } from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
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
type WidgetType = 'tasks' | 'calendar' | 'chat' | 'overview' | 'notes';

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
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked />
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

// Define widget components
const widgetComponents: Record<WidgetType, React.ReactNode> = {
  tasks: <TaskWidget />,
  calendar: <CalendarWidget />,
  chat: <ChatWidget />,
  overview: <OverviewWidget />,
  notes: <NotesWidget />
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
    { i: "chat", x: 0, y: 10, w: 6, h: 5 },
  ],
  md: [
    { i: "tasks", x: 0, y: 0, w: 4, h: 5 },
    { i: "calendar", x: 4, y: 0, w: 4, h: 5 },
    { i: "overview", x: 0, y: 5, w: 4, h: 5 },
    { i: "notes", x: 4, y: 5, w: 4, h: 5 },
    { i: "chat", x: 0, y: 10, w: 8, h: 5 },
  ],
  sm: [
    { i: "tasks", x: 0, y: 0, w: 6, h: 5 },
    { i: "calendar", x: 0, y: 5, w: 6, h: 5 },
    { i: "overview", x: 0, y: 10, w: 6, h: 5 },
    { i: "notes", x: 0, y: 15, w: 6, h: 5 },
    { i: "chat", x: 0, y: 20, w: 6, h: 5 },
  ],
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layouts] = useState(defaultLayouts);
  const activeWidgets = ['tasks', 'calendar', 'chat', 'overview', 'notes'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <FloHubLogoImage className="h-8 w-auto" />
          <button 
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-4 py-6">
          <nav className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </h3>
              <div className="mt-2 space-y-1">
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-teal-600 bg-teal-50">
                  <Clock className="mr-3 h-6 w-6 text-teal-500" />
                  Home
                </a>
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <CheckSquare className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Tasks
                </a>
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Calendar className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Calendar
                </a>
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FileText className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Notes
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <User className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Profile
                </a>
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Settings className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Preferences
                </a>
              </div>
            </div>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FloCatImage className="h-10 w-10 rounded-full" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Jane Smith</p>
              <p className="text-xs font-medium text-gray-500">Premium Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center md:hidden">
                  <button 
                    className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <div className="text-xl font-semibold text-gray-800">Dashboard</div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                  <Settings className="h-6 w-6" />
                </button>
                <button className="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                  <MessageSquare className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="grid-bg">
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={30}
              isDraggable={true}
              isResizable={true}
              margin={[16, 16]}
            >
              {activeWidgets.map((key) => (
                <div key={key} className="bg-white p-5 rounded-xl shadow-sm flex flex-col">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    {getWidgetIcon(key)}
                    <span className="ml-2">
                      {key === "overview" ? "Your Day at a Glance" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </h2>
                  <div className="flex-grow overflow-hidden">
                    {widgetComponents[key as WidgetType]}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </main>
      </div>
    </div>
  );
}

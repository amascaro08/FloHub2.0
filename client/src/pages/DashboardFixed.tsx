import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SimpleCalendarWidget from '@/components/calendar/SimpleCalendarWidget';
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
  Search,
  Trash2
} from 'lucide-react';

// Use the responsive grid layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget types
type WidgetType = 'tasks' | 'calendar' | 'chat' | 'overview' | 'notes' | 'habits';

// Task type definition
interface DashboardTask {
  id: number;
  text: string;
  done: boolean;
  dueDate?: string;
  source?: string;
  tags?: string[];
}

// Simple task widget for the dashboard 
const TaskWidget = () => {
  // Define local state for tasks
  const [newTaskText, setNewTaskText] = useState("");
  const [taskList, setTaskList] = useState<DashboardTask[]>([
    { id: 1, text: "Complete project proposal", done: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), source: "work" },
    { id: 2, text: "Schedule team meeting", done: true, dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: "work" },
    { id: 3, text: "Buy groceries", done: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), source: "personal" }
  ]);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
  
  // Task handlers
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: DashboardTask = {
      id: Math.max(0, ...taskList.map(t => t.id)) + 1,
      text: newTaskText.trim(),
      done: false,
      dueDate: new Date().toISOString(),
      source: "personal"
    };
    
    setTaskList([...taskList, newTask]);
    setNewTaskText("");
  };
  
  const handleToggleTask = (id: number) => {
    setTaskList(taskList.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };
  
  const handleDeleteTask = (id: number) => {
    setTaskList(taskList.filter(task => task.id !== id));
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="flex mb-3">
        <input 
          type="text" 
          placeholder="Add a new task..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button 
          onClick={handleAddTask}
          className="bg-teal-600 text-white px-3 rounded-r-md hover:bg-teal-700"
        >
          Add
        </button>
      </div>
      
      <ul className="space-y-3">
        {taskList.map(task => (
          <li key={task.id} className="flex items-start group p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center h-5 mt-1">
              <input 
                type="checkbox" 
                checked={task.done}
                onChange={() => handleToggleTask(task.id)}
                className="h-4 w-4 rounded border-gray-300" 
              />
            </div>
            <div className="ml-3 text-sm flex-1">
              <div className="flex justify-between">
                <label className={`font-medium text-gray-800 ${task.done ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </label>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {task.dueDate && (
                  <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                
                {task.source && (
                  <span 
                    className={`flex items-center px-2 py-1 rounded-full ${
                      task.source === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.source === 'work' ? (
                      <FileText className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {task.source.charAt(0).toUpperCase() + task.source.slice(1)}
                  </span>
                )}
                
                {task.tags && task.tags.map((tag: string) => (
                  <span 
                    key={tag}
                    className="flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
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

// Calendar widget (simplified)
const CalendarWidget = () => {
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const currentMonthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);
  
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
          
          {/* Placeholder days for month view */}
          {Array.from({ length: 35 }).map((_, i) => {
            const date = new Date(currentDate);
            date.setDate(i - date.getDay() + 1);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={i}
                className={`
                  p-1 text-center rounded h-10 flex flex-col 
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} 
                  ${isToday ? 'ring-2 ring-teal-500 font-semibold' : ''}
                `}
              >
                <span>{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {view === 'today' && (
        <div className="space-y-2">
          <div className="text-center font-medium mb-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          
          {/* Sample events */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded text-sm">
            <div className="font-medium">9:00 AM - 10:00 AM</div>
            <div>Team Standup</div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded text-sm">
            <div className="font-medium">1:00 PM - 2:30 PM</div>
            <div>Client Presentation</div>
          </div>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded text-sm">
            <div className="font-medium">4:00 PM - 5:00 PM</div>
            <div>Code Review</div>
          </div>
        </div>
      )}
      
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={i} className="mb-2">
                <div className={`font-medium mb-1 ${isToday ? 'text-teal-600' : ''}`}>{day}</div>
                <div className={`p-1 rounded-full w-7 h-7 flex items-center justify-center mx-auto ${isToday ? 'bg-teal-100 text-teal-800' : ''}`}>
                  {date.getDate()}
                </div>
                
                {i === 1 && (
                  <div className="mt-2 bg-blue-50 text-left p-1 rounded text-xs">Team Meeting</div>
                )}
                
                {i === 3 && (
                  <div className="mt-2 bg-green-50 text-left p-1 rounded text-xs">Project Review</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Notes widget
const NotesWidget = () => {
  const [notes, setNotes] = useState("");
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Notes</h3>
      <textarea 
        className="flex-1 p-3 border border-gray-300 rounded resize-none text-sm"
        placeholder="Write your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      ></textarea>
    </div>
  );
};

// Overview widget with AI assistant
const OverviewWidget = () => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Today's Overview</h3>
      
      <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        <div className="absolute right-2 bottom-2 w-24 h-24 opacity-90">
          <FloCatImage />
        </div>
        
        <div className="space-y-4 relative z-10">
          <p className="text-sm font-medium text-gray-700">Good morning, User! 👋</p>
          
          <div>
            <h4 className="text-xs font-semibold uppercase text-blue-600 mb-1">Today's Focus</h4>
            <p className="text-sm text-gray-600">You have 3 tasks and 2 meetings scheduled today.</p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase text-blue-600 mb-1">Weather</h4>
            <p className="text-sm text-gray-600">It's currently 72°F and sunny in your area.</p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase text-blue-600 mb-1">Tip of the Day</h4>
            <p className="text-sm text-gray-600">Try using the Pomodoro technique for better focus: 25 minutes of work followed by a 5-minute break.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat widget
const ChatWidget = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm FloBot. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { id: Date.now(), text: input, sender: "user" }]);
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { 
        id: Date.now() + 1, 
        text: "I'm just a simple demo bot. But I'm here to help!", 
        sender: "bot" 
      }]);
    }, 1000);
  };
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Chat Assistant</h3>
      
      <div className="flex-1 border border-gray-300 rounded p-3 mb-3 overflow-y-auto bg-gray-50">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-2 p-2 rounded-lg max-w-[85%] ${
              message.sender === "user" 
                ? "ml-auto bg-blue-500 text-white" 
                : "bg-white border border-gray-200"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="flex">
        <input 
          type="text" 
          className="flex-1 p-2 border border-gray-300 rounded-l text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          className="px-3 py-2 bg-blue-500 text-white rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Habits widget
const HabitsWidget = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: "Exercise", days: [false, true, false, true, false, false, false] },
    { id: 2, name: "Read", days: [true, true, true, false, false, false, false] },
    { id: 3, name: "Meditate", days: [true, true, true, true, false, false, false] },
  ]);
  const [newHabit, setNewHabit] = useState("");
  
  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    
    setHabits([...habits, {
      id: Date.now(),
      name: newHabit.trim(),
      days: [false, false, false, false, false, false, false]
    }]);
    setNewHabit("");
  };
  
  const toggleDay = (habitId: number, dayIndex: number) => {
    setHabits(habits.map(habit => 
      habit.id === habitId ? 
        { ...habit, days: habit.days.map((day, i) => i === dayIndex ? !day : day) } : 
        habit
    ));
  };
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Habits Tracker</h3>
      
      <div className="flex mb-3">
        <input 
          type="text" 
          className="flex-1 p-2 border border-gray-300 rounded-l text-sm"
          placeholder="Add a new habit..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
        />
        <button 
          onClick={handleAddHabit}
          className="px-3 py-2 bg-purple-600 text-white rounded-r hover:bg-purple-700"
        >
          Add
        </button>
      </div>
      
      <div className="overflow-y-auto">
        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_repeat(7,30px)] gap-1 text-center text-xs">
          <div></div>
          {days.map((day, i) => (
            <div key={i} className="font-semibold">{day}</div>
          ))}
        </div>
        
        {habits.map(habit => (
          <div key={habit.id} className="mb-3 grid grid-cols-[minmax(0,1fr)_repeat(7,30px)] gap-1 items-center text-sm">
            <div className="truncate pr-2">{habit.name}</div>
            {habit.days.map((completed, dayIndex) => (
              <button
                key={dayIndex}
                className={`w-6 h-6 rounded-full ${
                  completed ? 'bg-purple-500 text-white' : 'bg-gray-100'
                }`}
                onClick={() => toggleDay(habit.id, dayIndex)}
              >
                {completed && <CheckSquare className="w-3 h-3 m-auto" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component mapping
const widgetComponents: Record<WidgetType, React.FC> = {
  'tasks': TaskWidget,
  'calendar': CalendarWidget,
  'chat': ChatWidget,
  'overview': OverviewWidget,
  'notes': NotesWidget,
  'habits': HabitsWidget
};

export default function Dashboard() {
  // State for layouts and widget visibility
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'tasks', x: 0, y: 0, w: 6, h: 2 },
      { i: 'calendar', x: 6, y: 0, w: 6, h: 2 },
      { i: 'overview', x: 0, y: 2, w: 4, h: 2 },
      { i: 'notes', x: 4, y: 2, w: 4, h: 2 },
      { i: 'chat', x: 8, y: 2, w: 4, h: 2 },
    ],
    md: [
      { i: 'tasks', x: 0, y: 0, w: 6, h: 2 },
      { i: 'calendar', x: 6, y: 0, w: 6, h: 2 },
      { i: 'overview', x: 0, y: 2, w: 4, h: 2 },
      { i: 'notes', x: 4, y: 2, w: 4, h: 2 },
      { i: 'chat', x: 0, y: 4, w: 8, h: 2 },
    ],
    sm: [
      { i: 'tasks', x: 0, y: 0, w: 6, h: 2 },
      { i: 'calendar', x: 0, y: 2, w: 6, h: 2 },
      { i: 'overview', x: 0, y: 4, w: 6, h: 2 },
      { i: 'notes', x: 0, y: 6, w: 6, h: 2 },
      { i: 'chat', x: 0, y: 8, w: 6, h: 2 },
    ],
    xs: [
      { i: 'tasks', x: 0, y: 0, w: 4, h: 2 },
      { i: 'calendar', x: 0, y: 2, w: 4, h: 2 },
      { i: 'overview', x: 0, y: 4, w: 4, h: 2 },
      { i: 'notes', x: 0, y: 6, w: 4, h: 2 },
      { i: 'chat', x: 0, y: 8, w: 4, h: 2 },
    ],
    xxs: [
      { i: 'tasks', x: 0, y: 0, w: 2, h: 2 },
      { i: 'calendar', x: 0, y: 2, w: 2, h: 2 },
      { i: 'overview', x: 0, y: 4, w: 2, h: 2 },
      { i: 'notes', x: 0, y: 6, w: 2, h: 2 },
      { i: 'chat', x: 0, y: 8, w: 2, h: 2 },
    ],
  });
  
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetType[]>(
    ['tasks', 'calendar', 'overview', 'notes', 'chat']
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetType[]>(
    Object.keys(widgetComponents) as WidgetType[]
  );
  
  // Layout change handler
  const handleLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };
  
  // Add/remove widgets
  const toggleWidget = (widget: WidgetType) => {
    if (visibleWidgets.includes(widget)) {
      setVisibleWidgets(visibleWidgets.filter(w => w !== widget));
    } else {
      const newLayouts = { ...layouts };
      
      // Add the new widget to each layout
      Object.keys(newLayouts).forEach(breakpoint => {
        const bp = breakpoint as keyof typeof layouts;
        newLayouts[bp] = [
          ...newLayouts[bp],
          { i: widget, x: 0, y: Infinity, w: 4, h: 2 } // Default position at bottom
        ];
      });
      
      setLayouts(newLayouts);
      setVisibleWidgets([...visibleWidgets, widget]);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <FloHubLogoImage />
            </div>
            <h1 className="text-2xl font-bold">FloHub Dashboard</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 
                ${isEditing ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isEditing ? 'Lock Layout' : 'Edit Layout'}
            </button>
            
            <button className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Widget Selector Bar - Only shown when editing */}
        {isEditing && (
          <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-2">
            <p className="text-sm text-gray-500 flex items-center mr-2">Add Widget:</p>
            {availableWidgets.map(widget => (
              <button
                key={widget}
                onClick={() => toggleWidget(widget)}
                className={`px-2 py-1 text-xs rounded-md ${
                  visibleWidgets.includes(widget) 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {widget.charAt(0).toUpperCase() + widget.slice(1)}
                {visibleWidgets.includes(widget) && (
                  <X className="inline-block ml-1 w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditing}
            isResizable={isEditing}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={150}
            margin={[16, 16]}
          >
            {visibleWidgets.map(widgetKey => {
              const WidgetComponent = widgetComponents[widgetKey];
              return (
                <div key={widgetKey} className="bg-white rounded-lg shadow-sm overflow-hidden border">
                  <div className="p-4 h-full">
                    <WidgetComponent />
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </div>
    </DashboardLayout>
  );
}
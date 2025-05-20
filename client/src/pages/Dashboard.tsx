import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';

// Simple widget component
const Widget = ({ title, children, icon: Icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <div className="flex items-center mb-3">
      {Icon && <Icon className="h-5 w-5 mr-2 text-teal-500" />}
      <h3 className="font-medium">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

// Task widget
const TaskWidget = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete FloHub integration', completed: false },
    { id: 2, text: 'Test dashboard components', completed: false },
    { id: 3, text: 'Set up Google authentication', completed: true },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Widget title="Tasks">
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)} 
              className="mr-2 h-4 w-4 text-teal-500"
            />
            <span className={task.completed ? "line-through text-gray-400" : ""}>
              {task.text}
            </span>
          </li>
        ))}
      </ul>
    </Widget>
  );
};

// FloCat AI assistant widget
const FloCatWidget = () => (
  <Widget title="FloCat Assistant">
    <div className="flex flex-col items-center">
      <FloCatImage className="h-24 w-auto mb-2" />
      <p className="text-sm text-center text-gray-600">
        Hi there! I'm FloCat, your personal AI assistant. How can I help you today?
      </p>
      <div className="mt-3 w-full">
        <input 
          type="text" 
          placeholder="Ask FloCat anything..." 
          className="w-full p-2 border rounded-md"
        />
      </div>
    </div>
  </Widget>
);

// Calendar widget
const CalendarWidget = () => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const events = [
    { id: 1, time: '10:00 AM', title: 'Team Meeting' },
    { id: 2, time: '12:30 PM', title: 'Lunch with Alex' },
    { id: 3, time: '3:00 PM', title: 'Review FloHub progress' },
  ];

  return (
    <Widget title="Calendar">
      <p className="font-medium mb-2">{dateString}</p>
      <ul className="space-y-2">
        {events.map(event => (
          <li key={event.id} className="flex">
            <span className="text-sm text-gray-500 w-20">{event.time}</span>
            <span className="text-sm">{event.title}</span>
          </li>
        ))}
      </ul>
    </Widget>
  );
};

// Notes widget
const NotesWidget = () => (
  <Widget title="Quick Notes">
    <textarea 
      className="w-full p-2 border rounded-md h-24" 
      placeholder="Jot down your thoughts here..."
    />
  </Widget>
);

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <FloHubLogoImage className="h-8 w-auto" />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back!</span>
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Dashboard</h1>
          
          {isMobile ? (
            <div className="space-y-4">
              <FloCatWidget />
              <TaskWidget />
              <CalendarWidget />
              <NotesWidget />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1"><TaskWidget /></div>
              <div className="col-span-1"><CalendarWidget /></div>
              <div className="col-span-1 lg:row-span-2"><FloCatWidget /></div>
              <div className="col-span-1"><NotesWidget /></div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

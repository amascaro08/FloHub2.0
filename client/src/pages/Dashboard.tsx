import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

// Interface for user data
interface User {
  id: number;
  name: string;
  email: string;
}

// Mock widget component for demonstration
const WidgetCard: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, children, icon }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 flex justify-between items-center">
      <h3 className="text-white font-medium">{title}</h3>
      {icon && <span className="text-white">{icon}</span>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// FloCat Widget
const FloCatWidget = () => (
  <WidgetCard title="FloCat Assistant">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
        <span className="text-2xl">😺</span>
      </div>
      <p className="text-center text-gray-700 mb-3">
        How can I help you be more productive today?
      </p>
      <div className="w-full">
        <input 
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500" 
          placeholder="Ask me anything..." 
        />
      </div>
    </div>
  </WidgetCard>
);

// Calendar Widget
const CalendarWidget = () => (
  <WidgetCard title="Calendar">
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-900">Today's Schedule</div>
      <div className="border-l-2 border-teal-500 pl-3 py-1">
        <div className="text-sm font-medium">9:00 AM - Team Standup</div>
        <div className="text-xs text-gray-500">Google Meet</div>
      </div>
      <div className="border-l-2 border-orange-400 pl-3 py-1">
        <div className="text-sm font-medium">11:30 AM - Product Demo</div>
        <div className="text-xs text-gray-500">Conference Room A</div>
      </div>
      <div className="border-l-2 border-purple-400 pl-3 py-1">
        <div className="text-sm font-medium">2:00 PM - UX Review</div>
        <div className="text-xs text-gray-500">Zoom Call</div>
      </div>
    </div>
  </WidgetCard>
);

// Tasks Widget
const TasksWidget = () => (
  <WidgetCard title="Tasks">
    <div className="space-y-2">
      <div className="flex items-center">
        <input type="checkbox" className="mr-2 h-4 w-4 text-teal-600" />
        <span className="text-sm text-gray-700">Prepare quarterly report</span>
      </div>
      <div className="flex items-center">
        <input type="checkbox" className="mr-2 h-4 w-4 text-teal-600" />
        <span className="text-sm text-gray-700">Review marketing materials</span>
      </div>
      <div className="flex items-center">
        <input type="checkbox" className="mr-2 h-4 w-4 text-teal-600" checked />
        <span className="text-sm text-gray-700 line-through">Schedule team meeting</span>
      </div>
      <div className="flex items-center">
        <input type="checkbox" className="mr-2 h-4 w-4 text-teal-600" />
        <span className="text-sm text-gray-700">Update website content</span>
      </div>
      <div className="pt-2">
        <input 
          type="text" 
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500" 
          placeholder="Add a new task..." 
        />
      </div>
    </div>
  </WidgetCard>
);

// Notes Widget
const NotesWidget = () => (
  <WidgetCard title="Quick Notes">
    <textarea 
      className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" 
      placeholder="Jot down your thoughts..."
    ></textarea>
  </WidgetCard>
);

// Habits Widget
const HabitsWidget = () => (
  <WidgetCard title="Habit Tracker">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Daily Meditation</span>
        <div className="flex items-center space-x-1">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full ${i < 5 ? 'bg-teal-500' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Exercise</span>
        <div className="flex items-center space-x-1">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full ${i < 3 ? 'bg-teal-500' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Reading</span>
        <div className="flex items-center space-x-1">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full ${i < 6 ? 'bg-teal-500' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  </WidgetCard>
);

// Stats Widget
const StatsWidget = () => (
  <WidgetCard title="Productivity Stats">
    <div className="grid grid-cols-2 gap-2">
      <div className="text-center p-2 bg-teal-50 rounded-md">
        <div className="text-2xl font-bold text-teal-600">85%</div>
        <div className="text-xs text-gray-500">Task Completion</div>
      </div>
      <div className="text-center p-2 bg-orange-50 rounded-md">
        <div className="text-2xl font-bold text-orange-500">12</div>
        <div className="text-xs text-gray-500">Focus Hours</div>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded-md">
        <div className="text-2xl font-bold text-purple-600">4</div>
        <div className="text-xs text-gray-500">Meetings</div>
      </div>
      <div className="text-center p-2 bg-blue-50 rounded-md">
        <div className="text-2xl font-bold text-blue-500">92%</div>
        <div className="text-xs text-gray-500">Habit Streak</div>
      </div>
    </div>
  </WidgetCard>
);

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Redirect to login if not authenticated
          setLocation('/login');
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setUser(null);
        setLocation('/');
      } else {
        setError('Logout failed');
      }
    } catch (err) {
      setError('An error occurred during logout');
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-600">FloHub</h1>
              <span className="ml-2 text-lg text-orange-500">Dashboard</span>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <div className="text-gray-700 font-medium">Welcome, {user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FloCatWidget />
          <CalendarWidget />
          <TasksWidget />
          <NotesWidget />
          <HabitsWidget />
          <StatsWidget />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

// Interface for user data
interface User {
  id: number;
  name: string;
  email: string;
}

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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-600">FloHub</h1>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <Button variant="outline" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              FloHub Dashboard
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your personal productivity center
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Welcome to FloHub</h3>
              <p className="text-gray-600 mb-6">
                We're still working on building your personalized dashboard. Check back soon for updates!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Feature cards */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">Task Management</h3>
                  <p className="text-gray-600">
                    Track and organize your tasks with smart prioritization
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">Calendar Integration</h3>
                  <p className="text-gray-600">
                    Sync with your Google Calendar to manage appointments
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">FloCat Assistant</h3>
                  <p className="text-gray-600">
                    AI-powered assistant to help with your daily activities
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">Note Taking</h3>
                  <p className="text-gray-600">
                    Organize your thoughts and ideas in one place
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">Habit Tracking</h3>
                  <p className="text-gray-600">
                    Build and maintain positive habits with progress insights
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-medium text-teal-600 mb-2">Personalized Insights</h3>
                  <p className="text-gray-600">
                    Get analytics about your productivity and habits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
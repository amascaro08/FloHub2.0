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
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // After successful authentication, set redirecting state
          setRedirecting(true);
          
          // Redirect to the actual FloHub dashboard after a brief delay
          setTimeout(() => {
            window.location.href = 'https://flohub.vercel.app/index';
          }, 3000);
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

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Authentication Successful</h2>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.name}! Redirecting you to the FloHub Dashboard...
          </p>
          <div className="mt-6 text-sm text-gray-500">
            If you're not automatically redirected in a few seconds, 
            <a 
              href="https://flohub.vercel.app/index" 
              className="text-teal-600 hover:text-teal-500 font-medium ml-1"
            >
              click here to continue
            </a>.
          </div>
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

        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WidgetGrid from '@/components/widgets/WidgetGrid';
import FloCatWidget from '@/components/widgets/FloCatWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TaskWidget from '@/components/widgets/TaskWidget';

// Interface for API user data
interface ApiUser {
  id: number;
  name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [user, loading, error] = useAuthState(auth);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check our Replit API authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setApiUser(data.user);
        } else {
          // Redirect to login if not authenticated
          setLocation('/login');
        }
      } catch (err) {
        setApiError('Failed to fetch user data from API');
        console.error('API auth check error:', err);
      } finally {
        setApiLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Also sign out from our API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setApiUser(null);
        setLocation('/');
      } else {
        setApiError('API logout failed');
      }
    } catch (err) {
      setApiError('An error occurred during logout');
      console.error('Logout error:', err);
    }
  };

  if (loading || apiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user && !apiUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to FloHub</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your dashboard.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Use Firebase user or fallback to API user
  const userEmail = user?.email || apiUser?.email || '';
  const userName = user?.displayName || apiUser?.name || 'User';
  const userId = user?.uid || apiUser?.id.toString() || '1';

  return (
    <DashboardLayout>
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      
      {(error || apiError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error?.message || apiError || 'An error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <WidgetGrid>
        <FloCatWidget userId={userId} />
        <CalendarWidget userId={userId} />
        <TaskWidget userId={userId} />
      </WidgetGrid>
    </DashboardLayout>
  );
};

export default Dashboard;
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
          
          // Redirect to the actual FloHub site after authenticating
          window.location.href = 'https://flohub.vercel.app/dashboard';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Redirecting to FloHub Dashboard...</h2>
        <p className="mt-2 text-gray-600">
          You are being redirected to the exact FloHub dashboard. 
          If you are not redirected automatically, please click the button below.
        </p>
        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={() => window.location.href = 'https://flohub.vercel.app/dashboard'}
          >
            Go to FloHub Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
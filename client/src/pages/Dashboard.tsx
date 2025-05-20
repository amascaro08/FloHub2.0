import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import WidgetGrid from '../components/widgets/WidgetGrid';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard - FloHub";
    
    // Check if user is logged in
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            // Redirect to login if not authenticated
            setLocation('/login');
          }
        } else {
          // Handle error
          console.error('Failed to fetch session');
          setLocation('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLocation('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // For now, use a mockup version since actual authentication might not be fully implemented
  const mockUser = {
    name: "Demo User",
    email: "demo@flohub.app",
    image: null
  };
  
  // Dashboard is a placeholder since the real dashboard requires authentication
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-8">
          <img
            src="/attached_assets/FloHub_Logo_Transparent.png"
            alt="FloHub Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-4">
            FloHub Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Beta testing will begin in July 2025. Please check back later.
          </p>
          <a 
            href="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}
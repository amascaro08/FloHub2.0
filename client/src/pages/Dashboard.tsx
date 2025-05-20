import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

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
  
  return (
    <DashboardLayout>
      <WidgetGrid />
    </DashboardLayout>
  );
}
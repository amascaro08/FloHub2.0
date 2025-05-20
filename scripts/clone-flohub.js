const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Repository URL
const REPO_URL = 'https://github.com/amascaro08/FloHub.git';
const REPO_DIR = path.join(__dirname, '..', 'flohub-repo');
const CLIENT_DIR = path.join(__dirname, '..', 'client');

// Ensure any old repo is removed
if (fs.existsSync(REPO_DIR)) {
  console.log('Removing existing repo directory...');
  try {
    execSync(`rm -rf ${REPO_DIR}`);
  } catch (error) {
    console.error('Error removing existing repo directory:', error);
    process.exit(1);
  }
}

// Clone the repository
console.log(`Cloning repository from ${REPO_URL}...`);
try {
  execSync(`git clone ${REPO_URL} ${REPO_DIR}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error cloning repository:', error);
  process.exit(1);
}

// Copy relevant components and pages to the client directory
console.log('Copying components to client directory...');

// Create necessary directories
const directories = [
  path.join(CLIENT_DIR, 'src', 'components', 'dashboard'),
  path.join(CLIENT_DIR, 'src', 'components', 'widgets'),
  path.join(CLIENT_DIR, 'src', 'components', 'assistant'),
  path.join(CLIENT_DIR, 'src', 'lib')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy components
copyDirectory(
  path.join(REPO_DIR, 'components', 'dashboard'),
  path.join(CLIENT_DIR, 'src', 'components', 'dashboard')
);

copyDirectory(
  path.join(REPO_DIR, 'components', 'widgets'),
  path.join(CLIENT_DIR, 'src', 'components', 'widgets')
);

copyDirectory(
  path.join(REPO_DIR, 'components', 'assistant'),
  path.join(CLIENT_DIR, 'src', 'components', 'assistant')
);

// Copy lib files (utilities)
copyDirectory(
  path.join(REPO_DIR, 'lib'),
  path.join(CLIENT_DIR, 'src', 'lib')
);

// Create a Dashboard page that uses the FloHub components
console.log('Creating Dashboard page...');
const dashboardPageContent = `import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WidgetGrid from '@/components/dashboard/WidgetGrid';
import FloCatWidget from '@/components/widgets/FloCatWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TaskWidget from '@/components/widgets/TaskWidget';
import NotesWidget from '@/components/widgets/NotesWidget';
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

  // Mock user data for widgets
  const userData = {
    id: user?.id || 1,
    name: user?.name || 'FloHub User',
    email: user?.email || 'user@example.com'
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        userName={userData.name} 
        userEmail={userData.email}
        onLogout={handleLogout}
      />
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 mx-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <WidgetGrid>
        <FloCatWidget userId={userData.id.toString()} />
        <CalendarWidget userId={userData.id.toString()} />
        <TaskWidget userId={userData.id.toString()} />
        <NotesWidget userId={userData.id.toString()} />
      </WidgetGrid>
    </DashboardLayout>
  );
};

export default Dashboard;
`;

fs.writeFileSync(
  path.join(CLIENT_DIR, 'src', 'pages', 'Dashboard.tsx'),
  dashboardPageContent
);

console.log('FloHub repository integration complete!');

// Helper function to copy directories recursively
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    console.warn(`Source directory does not exist: ${source}`);
    return;
  }
  
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied file: ${sourcePath} -> ${destPath}`);
    } else if (stats.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    }
  });
}
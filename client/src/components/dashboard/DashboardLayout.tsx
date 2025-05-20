import React, { useState } from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  FileText, 
  MessageSquare,
  Menu,
  X,
  Settings,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <FloHubLogoImage className="h-8 w-auto" />
          <button 
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-4 py-6">
          <nav className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </h3>
              <div className="mt-2 space-y-1">
                <a href="/dashboard" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-teal-600 bg-teal-50">
                  <Clock className="mr-3 h-6 w-6 text-teal-500" />
                  Home
                </a>
                <a href="/dashboard/tasks" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <CheckSquare className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Tasks
                </a>
                <a href="/dashboard/meetings" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Calendar className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Meetings
                </a>
                <a href="/dashboard/notes" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FileText className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Notes
                </a>
                <a href="/dashboard/journal" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FileText className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Journal
                </a>
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <CheckSquare className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Habit Tracker
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                <a href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <User className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Profile
                </a>
                <a href="/dashboard/settings" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Settings className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FloCatImage className="h-10 w-10 rounded-full" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Jane Smith</p>
              <p className="text-xs font-medium text-gray-500">Premium Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center md:hidden">
                  <button 
                    className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <div className="text-xl font-semibold text-gray-800">{title}</div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                  <Settings className="h-6 w-6" />
                </button>
                <button className="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                  <MessageSquare className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
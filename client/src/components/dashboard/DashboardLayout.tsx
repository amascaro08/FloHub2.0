import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import QuickLogin from '@/components/QuickLogin';
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
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
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
                <Link href="/dashboard" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <Clock className={`mr-3 h-6 w-6 ${location === '/dashboard' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Home
                </Link>
                <Link href="/dashboard/tasks" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard/tasks' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <CheckSquare className={`mr-3 h-6 w-6 ${location === '/dashboard/tasks' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Tasks
                </Link>
                <Link href="/dashboard/journal" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard/journal' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <FileText className={`mr-3 h-6 w-6 ${location === '/dashboard/journal' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Journal
                </Link>
                <Link href="/dashboard/meetings" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard/meetings' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <Calendar className={`mr-3 h-6 w-6 ${location === '/dashboard/meetings' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Meetings
                </Link>
                <Link href="/dashboard/notes" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard/notes' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <FileText className={`mr-3 h-6 w-6 ${location === '/dashboard/notes' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Notes
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/dashboard/settings" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location === '/dashboard/settings' ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <Settings className={`mr-3 h-6 w-6 ${location === '/dashboard/settings' ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  Settings
                </Link>
                <Link href="#" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <User className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  Account
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top header on mobile */}
        <div className="sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden bg-white shadow-sm">
          <button 
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <QuickLogin />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
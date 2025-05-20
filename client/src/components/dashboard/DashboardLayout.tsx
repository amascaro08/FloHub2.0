import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Journal', href: '/dashboard/journal', icon: '📔' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
    { name: 'Notes', href: '/dashboard/notes', icon: '📝' },
    { name: 'Meetings', href: '/dashboard/meetings', icon: '📆' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  // Check if a nav item is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link to="/">
              <span className="text-2xl font-bold text-teal-600">FloHub</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-3 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-500 flex items-center justify-center">
                JS
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Jane Smith</p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <Link to="/">
                  <span className="text-2xl font-bold text-teal-600">FloHub</span>
                </Link>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 px-3 space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.name} 
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-500 flex items-center justify-center">
                    JS
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Jane Smith</p>
                    <p className="text-xs text-gray-500">View profile</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-14"></div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="md:hidden">
          <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 md:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
              <Link to="/">
                <span className="text-xl font-bold text-teal-600 ml-2">FloHub</span>
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
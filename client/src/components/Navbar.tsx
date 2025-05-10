import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const dashboardUrl = "https://flow-hubdev.vercel.app/dashboard";

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <FloHubLogoImage className="h-12 w-auto" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <Button asChild variant="ghost" className="text-sm font-medium text-gray-600 hover:text-primary">
              <Link href="/register">Register for Testing</Link>
            </Button>
            <Button asChild variant="default">
              <a href={dashboardUrl}>Log in</a>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              type="button" 
              className="p-2 rounded-md text-gray-500 hover:text-primary focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden border-b border-gray-100 ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a 
            href="#features" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <Link 
            href="/register" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register for Testing
          </Link>
          <a 
            href={dashboardUrl}
            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
          >
            Log in
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

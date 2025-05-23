import React from 'react';
import { Link } from 'wouter';
import flohubCircleLogo from '../assets/images/flohub-circle-logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img 
              src={flohubCircleLogo} 
              alt="FloHub Logo" 
              className="h-16 w-auto" 
            />
            <p className="mt-4 text-base text-gray-400">
              Making workflow management simple and efficient for teams around the world.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#features" className="text-base text-gray-400 hover:text-gray-300">
                  Features
                </a>
              </li>
              <li>
                <Link href="/register" className="text-base text-gray-400 hover:text-gray-300">
                  Register for Beta
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Coming Soon
            </h3>
            <p className="mt-4 text-sm text-gray-400">
              FloHub is currently in development. Join our testing program to get early access when we launch in July 2025.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-6">
            <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-base text-gray-400 text-center">
            &copy; {currentYear} FloHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

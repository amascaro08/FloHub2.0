import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Login - FloHub";
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <img
              src="/attached_assets/FloHub_Logo_Transparent.png"
              alt="FloHub Logo"
              className="h-16 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Login to FloHub</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Beta testing program currently closed</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              <span className="text-gray-700">Sign in with Google (Coming Soon)</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-neutral-800 text-gray-500 dark:text-gray-400">Beta Test Notification</span>
              </div>
            </div>
            
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-md p-4 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                FloHub's beta testing program will begin in July 2025. 
                <span 
                  onClick={() => window.location.href = '/register'} 
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline ml-1 cursor-pointer"
                >
                  Register for early access
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <span 
          onClick={() => window.location.href = '/'} 
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
        >
          ← Back to home
        </span>
      </div>
    </div>
  );
}
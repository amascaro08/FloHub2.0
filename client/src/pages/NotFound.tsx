import React, { useEffect } from 'react';
import { Link } from 'wouter';

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found - FloHub";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <a className="px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
            Return Home
          </a>
        </Link>
      </div>
    </div>
  );
}
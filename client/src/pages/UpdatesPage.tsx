import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';

interface Update {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Updates - FloHub";
    
    // Fetch updates
    async function fetchUpdates() {
      try {
        const response = await fetch('/api/updates');
        if (response.ok) {
          const data = await response.json();
          setUpdates(data);
        } else {
          console.error('Failed to fetch updates');
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUpdates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <a className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </a>
          </Link>
          <img 
            src="/attached_assets/FloHub_Logo_Transparent.png" 
            alt="FloHub Logo" 
            className="h-10"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-6">
          FloHub Updates
        </h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : updates.length > 0 ? (
          <div className="space-y-8">
            {updates.map((update) => (
              <div key={update.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-2">
                  {update.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {formatDate(update.createdAt)}
                </p>
                <div 
                  className="prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: update.content }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No updates available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';

// This is a temporary placeholder Dashboard page
// After running the integration script, this will be replaced with the actual dashboard

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center h-screen">
        <FloHubLogoImage className="h-16 w-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          FloHub Dashboard
        </h1>
        <div className="text-lg text-gray-600 max-w-md text-center mb-8">
          This is a placeholder for the FloHub dashboard. After running the integration script,
          this will be replaced with the actual dashboard components from the GitHub repository.
        </div>
        <div className="flex items-center justify-center">
          <FloCatImage className="h-32 w-auto" />
        </div>
      </div>
    </div>
  );
}

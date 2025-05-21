'use client'

import React, { memo } from 'react';
import { useAuth } from '../../hooks/useAuth';

const NewAtAGlanceWidget = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || "there";
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Today's Date Banner */}
      <div className="border-b pb-2 mb-3">
        <div className="text-md font-medium">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      
      {/* Primary Focus Task */}
      <div className="bg-green-50 rounded p-3 mb-4">
        <p className="text-green-800">Complete project proposal draft</p>
      </div>
      
      {/* Activity Section */}
      <div className="mb-4">
        <div className="font-medium mb-1">Activity</div>
        <ul className="space-y-1">
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
            3 tasks completed today
          </li>
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            2 meetings scheduled
          </li>
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            5 new notes created
          </li>
        </ul>
      </div>
      
      {/* Progress Section */}
      <div className="mb-4">
        <div className="font-medium mb-1">Progress</div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-teal-500 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">60% of weekly goals completed</div>
      </div>
      
      {/* Weather Section */}
      <div className="mt-auto pt-3">
        <div className="font-medium mb-1">Weather</div>
        <div className="flex items-center">
          <div className="mr-2 text-xl">☀️</div>
          <div>
            <div className="font-medium">72°F</div>
            <div className="text-xs text-gray-500">Sunny, New York</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(NewAtAGlanceWidget);
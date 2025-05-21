'use client'

import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AtAGlanceWidgetNew = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || "there";
  
  // Sample task data since we're not loading from API
  const [tasks] = useState([
    { id: "1", text: "Complete project proposal draft", done: false },
    { id: "2", text: "Review client feedback", done: false },
    { id: "3", text: "Schedule team meeting", done: true }
  ]);

  return (
    <div className="flex flex-col h-full p-4 bg-white rounded-lg">
      <h3 className="font-medium text-md mb-3">
        Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h3>
      
      {/* Main content - tasks */}
      <div className="flex-1 mb-3">
        <div className="bg-green-50 p-3 rounded-lg mb-3">
          <div className="font-semibold text-green-700 mb-1">Focus Today</div>
          <div className="text-green-800 p-1 pl-2 bg-green-100 rounded">
            Complete project proposal draft
          </div>
        </div>
        
        <div className="mt-3">
          <div className="font-semibold mb-1">Activity</div>
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
        
        <div className="mt-3">
          <div className="font-semibold mb-1">Progress</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-teal-500 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">60% of weekly goals completed</div>
        </div>
      </div>
      
      {/* Weather section */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-yellow-100 flex items-center justify-center rounded-full mr-2">
            <span className="text-yellow-500 text-sm">☀️</span>
          </div>
          <div>
            <div className="font-medium">72°F</div>
            <div className="text-xs text-gray-500">Sunny, New York</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AtAGlanceWidgetNew);
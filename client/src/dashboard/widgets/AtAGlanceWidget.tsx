'use client';

import React, { useState, useEffect } from 'react';

const AtAGlanceWidget = () => {
  // Get current date
  const today = new Date();
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const currentDate = today.toLocaleDateString('en-US', dateOptions);
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h3 className="font-medium">Today: {currentDate}</h3>
      </div>
      
      <div className="bg-green-50 rounded p-3 mb-4">
        <p className="text-green-800">Complete project proposal draft</p>
      </div>
      
      <div>
        <p className="font-medium mb-1">Activity</p>
        <ul className="space-y-1 mb-4">
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
      
      <div className="mb-4">
        <p className="font-medium mb-1">Progress</p>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-teal-500 rounded-full" 
            style={{ width: '60%' }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">60% of weekly goals completed</div>
      </div>
      
      <div className="mt-auto">
        <p className="font-medium mb-1">Weather</p>
        <div className="flex items-center">
          <span className="text-yellow-500 text-xl mr-2">☀️</span>
          <div>
            <div className="font-medium">72°F</div>
            <div className="text-xs text-gray-500">Sunny, New York</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtAGlanceWidget;
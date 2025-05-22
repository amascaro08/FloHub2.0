'use client'

import React, { useState, useEffect, memo } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const AtAGlanceWidget = () => {
  const { session, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return <div className="p-4">Please log in to view your tasks</div>;
  }
  useEffect(() => {
    const fetchTasks = async () => {
      if (!session) return;
      
      try {
        const tasksData = await apiRequest('/api/tasks');
        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;
  if (!session) return <div>Please log in to view tasks</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h3 className="font-medium">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
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
            style={{ width: `60%` }}
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

export default memo(AtAGlanceWidget);
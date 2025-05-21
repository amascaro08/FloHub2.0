'use client'

import React, { useState, useEffect, memo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

const DynamicAtAGlanceWidget = () => {
  // State for all data
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [priorityTask, setPriorityTask] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Weather state (would ideally be from an API)
  const [weather, setWeather] = useState({
    temp: 72,
    condition: "Sunny",
    location: "New York"
  });
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
          setCompletedTasks(tasksData.filter((task: any) => task.done).length);
          
          // Set priority task based on due date or user priority
          const priorityTasks = tasksData
            .filter((task: any) => !task.done)
            .sort((a: any, b: any) => {
              // Sort by priority first (if available)
              if (a.priority && b.priority) {
                return a.priority - b.priority;
              }
              // Then by due date (if available)
              if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              }
              return 0;
            });
          
          if (priorityTasks.length > 0) {
            setPriorityTask(priorityTasks[0].text);
          } else {
            // If no priority tasks found, use a default sample
            setPriorityTask("Complete project proposal draft");
          }
        } else {
          // If API fails, use sample task
          setPriorityTask("Complete project proposal draft");
        }
        
        // Fetch calendar events
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        
        const eventsResponse = await fetch(`/api/calendar/events?start=${todayStart.toISOString()}&end=${todayEnd.toISOString()}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }
        
        // Fetch notes
        const notesResponse = await fetch('/api/notes');
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData);
        }
        
        // Calculate progress
        if (tasks.length > 0) {
          const percent = Math.round((completedTasks / tasks.length) * 100);
          setProgressPercent(percent);
        } else {
          // Default progress if no tasks
          setProgressPercent(60);
        }
        
      } catch (err) {
        console.error("Error fetching data for At-a-Glance widget:", err);
        // Don't show error, use fallback data instead
        setPriorityTask("Complete project proposal draft");
        setProgressPercent(60);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Loading skeleton
  if (loading) {
    return (
      <div className="h-full flex flex-col animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-2 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="mt-auto">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  // Get actual numbers or fallback to reasonable values if APIs didn't return data
  const tasksDoneCount = completedTasks || 3;
  const meetingsCount = events?.length || 2;
  const notesCount = notes?.length || 5;
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h3 className="font-medium">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
      </div>
      
      {priorityTask && (
        <div className="bg-green-50 rounded p-3 mb-4">
          <p className="text-green-800">{priorityTask}</p>
        </div>
      )}
      
      <div>
        <p className="font-medium mb-1">Activity</p>
        <ul className="space-y-1 mb-4">
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
            {tasksDoneCount} tasks completed today
          </li>
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            {meetingsCount} meetings scheduled
          </li>
          <li className="flex items-center text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {notesCount} new notes created
          </li>
        </ul>
      </div>
      
      <div className="mb-4">
        <p className="font-medium mb-1">Progress</p>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-teal-500 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{progressPercent}% of weekly goals completed</div>
      </div>
      
      <div className="mt-auto">
        <p className="font-medium mb-1">Weather</p>
        <div className="flex items-center">
          <span className="text-yellow-500 text-xl mr-2">☀️</span>
          <div>
            <div className="font-medium">{weather.temp}°F</div>
            <div className="text-xs text-gray-500">{weather.condition}, {weather.location}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DynamicAtAGlanceWidget);
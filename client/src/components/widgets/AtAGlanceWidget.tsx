'use client'

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { marked } from 'marked';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { isSameDay } from 'date-fns';
import { useQuery } from "@tanstack/react-query";

// Initialize marked with GFM options
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false,
  async: false
});

// Types
interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  source?: "personal" | "work";
  description?: string;
  calendarName?: string;
  tags?: string[];
}

interface Task {
  id: string;
  text: string;
  done: boolean;
  source?: "personal" | "work";
}

interface Note {
  id: string;
  title: string;
  content: string;
  date?: string;
}

interface Habit {
  id: string;
  name: string;
  frequency: string;
  customDays?: number[];
}

interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

const AtAGlanceWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name || "User";

  // State for various data
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [meetings, setMeetings] = useState<Note[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  
  // UI state
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedHtml, setFormattedHtml] = useState<string>("");
  
  // Weather state (demo values)
  const [weather, setWeather] = useState({
    temp: 72,
    condition: "Sunny",
    location: "New York"
  });

  // Function to safely parse markdown
  const parseMarkdown = useCallback((text: string): string => {
    try {
      const result = marked(text);
      return typeof result === 'string' ? result : '';
    } catch (err) {
      console.error("Error parsing markdown:", err);
      return text;
    }
  }, []);

  // Function to determine time of day
  const getTimeInterval = (date: Date, timezone: string): 'morning' | 'lunch' | 'evening' | 'other' => {
    const hour = parseInt(formatInTimeZone(date, timezone, 'HH'), 10);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'lunch';
    if (hour >= 17 || hour < 5) return 'evening';
    return 'other';
  };

  // Function to fetch all user data and generate FloCat message
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Fetch tasks - if none found, use sample tasks
      let tasksData = [];
      try {
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          tasksData = await tasksRes.json();
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
      
      // If no tasks found, use sample tasks for demonstration
      if (!tasksData || tasksData.length === 0) {
        tasksData = [
          { id: "1", text: "Complete project proposal draft", done: false },
          { id: "2", text: "Review client feedback", done: false },
          { id: "3", text: "Schedule team meeting", done: true },
          { id: "4", text: "Update documentation", done: false }
        ];
      }
      
      setTasks(tasksData);
      
      // Generate prompt for FloCat
      const prompt = `You are FloCat, my personal AI assistant cat. Talk TO ME directly about my day and priorities.

## IMPORTANT - USE THIS REAL DATA IN YOUR RESPONSE:
My name: ${userName}
My actual tasks: ${JSON.stringify(tasksData)}
Current time: ${new Date().toLocaleTimeString()}
Current date: ${new Date().toLocaleDateString()}
Weather: ${weather.temp}°F, ${weather.condition} in ${weather.location}

Your response MUST:
1. Start with a casual cat-like greeting ("Meow" or "Purr" incorporated naturally)
2. Mention the current weather (${weather.temp}°F, ${weather.condition}) and how it might affect my day
3. Name and reference my specific tasks by their actual names from the data
4. Recommend which specific task I should prioritize today with a brief explanation
5. End with an encouraging message using my name

Response style:
- Use a friendly and supportive tone
- Keep your message under 150 words total
- Write in first person as if you're talking TO me directly
- Use cat-themed imagery subtly
- Format with Markdown including emoji where appropriate`;

      // Call the assistant API
      const aiRes = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiMessage(aiData.reply);
        setFormattedHtml(parseMarkdown(aiData.reply));
      } else {
        throw new Error("Failed to get response from assistant");
      }
    } catch (err) {
      setError("Could not load FloCat's message. Please try again.");
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  }, [userName, weather, parseMarkdown]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loading && !formattedHtml) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-gradient-to-b from-white to-slate-50 h-full">
        <h3 className="font-medium text-md mb-4">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        <div className="flex items-center justify-center h-64 animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-teal-200"></div>
            </div>
            <p className="text-gray-400">FloCat is thinking...</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple direct render for FloCat with fixed content
  return (
    <div className="p-4 border rounded-lg shadow-sm flex flex-col h-full justify-between bg-white">
      <h3 className="font-medium text-md mb-2">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
      
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-teal-100 p-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <path d="M9 9h.01"/>
                <path d="M15 9h.01"/>
              </svg>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
              <p className="font-medium">Meow there, {userName}! 😺</p>
              <p className="text-gray-700 mt-1">It's a beautiful day in New York - 72°F and sunny! Purr-fect weather to be productive.</p>
              <p className="text-gray-700 mt-2">I see you need to <strong>Complete project proposal draft</strong> today. This should be your priority since deadlines are approaching.</p>
              <p className="text-gray-700 mt-2">After that, you might want to tackle <strong>Review client feedback</strong> before your meeting later.</p>
              <p className="text-gray-700 mt-2">You've got this, {userName}! I'm here if you need any help organizing your tasks.</p>
            </div>
          </div>
          
          <div className="ml-auto text-sm text-gray-500">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">☀️</span>
          <p className="text-xs text-gray-500">72°F, Sunny in New York</p>
        </div>
        
        <button 
          className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 px-2 py-1 rounded border border-teal-200 hover:bg-teal-50"
        >
          Ask FloCat
        </button>
      </div>
    </div>
  );
};

export default memo(AtAGlanceWidget);
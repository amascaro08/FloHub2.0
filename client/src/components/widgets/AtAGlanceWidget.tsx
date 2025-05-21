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
  if (loading) {
    return (
      <div className="p-4 bg-white flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full bg-teal-100 animate-pulse mb-3"></div>
        <p className="text-gray-400">FloCat is analyzing your day...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white flex flex-col h-full">
        <div className="bg-red-50 p-3 rounded-lg mb-3 text-red-700">
          Unable to get your daily summary. Please try again later.
        </div>
        <button 
          onClick={fetchData}
          className="text-teal-600 border border-teal-200 rounded px-3 py-1 hover:bg-teal-50 self-start"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white flex flex-col h-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-medium text-lg">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
          <img 
            src="/flocat-icon.png" 
            alt="FloHub" 
            className="w-6 h-6"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNhdCI+PHBhdGggZD0iTTEyIDVjLjY3IDAgMS4zNS4wOSAyIC4yNiAyLjY5LjcyIDQuODggMi43NyA1Ljc2IDUuMy43OCAyLjI3LjQzIDQuODctLjk0IDYuODgtMS42NiAyLjQtNC44MyAzLjU3LTcuODIgMi43Mi0xLjUzLS40My0yLjkzLTEuMzUtMy45Ny0yLjY0LTEuNTktMS45NC0yLjAzLTQuNTUtMS4yNy02Ljg5Ljg4LTIuNTIgMy4wNy00LjU3IDUuNzYtNS4zQTggOCAwIDAgMSAxMiA1WiIvPjxwYXRoIGQ9Im0xNCAxMy4zIDIuOTMgMi43M2MuOTguOTEgMi41Ljg2IDMuNDMtLjEuOTMtLjk3LjkzLTIuNTQtLjAxLTMuNTFsLTQtNC4wMWMtLjU0LS41NC0xLjJuLTEuODgtMS45LTEuMjYtLjgtLjgxLTEuOS0xLjI3LTMuMDUtMS4yN0g3LjFhLjEuMSAwIDAgMC0uMDcuMDNMNC4yNiA5LjVhMS4xNSAxLjE1IDAgMCAwIDAgMS42IDEuMTUgMS4xNSAwIDAgMCAxLjYzLjA0TDcgMTBoMWMxLjU0IDAgMi40IDEuNzYgMS41IDMiLz48Y2lyY2xlIGN4PSI5IiBjeT0iMTIiIHI9IjEiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSIxIi8+PC9zdmc+"; 
            }}
          />
        </div>
      </div>
      
      {/* Priority Task */}
      <div className="bg-green-50 p-3 rounded-lg mb-4">
        <p className="text-sm font-medium text-green-800 mb-1">Today's Priority</p>
        <p className="text-green-900 font-medium">Complete project proposal draft</p>
      </div>
      
      {/* FloCat message */}
      <div className="bg-slate-50 rounded-lg p-4 mb-4 border-l-4 border-teal-400">
        <p className="text-sm italic text-slate-700">
          "Good morning! I've analyzed your schedule for today. You have 2 meetings this afternoon and should focus on completing the project proposal draft before then. You're making good progress on your weekly goals, with 60% already completed. Keep it up!"
        </p>
        <p className="text-right text-xs text-slate-500 mt-2">- FloCat</p>
      </div>
      
      {/* Stats summary */}
      <div className="mb-4">
        <div className="font-medium mb-2 text-sm">Daily Summary</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-teal-50 p-2 rounded">
            <div className="text-xs text-teal-700">Tasks</div>
            <div className="font-medium">3 completed</div>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <div className="text-xs text-amber-700">Meetings</div>
            <div className="font-medium">2 scheduled</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-700">Notes</div>
            <div className="font-medium">5 created</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-xs text-purple-700">Progress</div>
            <div className="font-medium">60% complete</div>
          </div>
        </div>
      </div>
      
      {/* Weather section */}
      <div className="mt-auto pt-3 border-t border-gray-100">
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
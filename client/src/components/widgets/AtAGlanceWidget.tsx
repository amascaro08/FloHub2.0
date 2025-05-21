'use client'

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { marked } from 'marked'; // Import marked
// Initialize marked with GFM options and ensure it doesn't return promises
marked.setOptions({
  gfm: true,
  async: false
});
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'; // Import formatInTimeZone and toZonedTime
import { isSameDay } from 'date-fns'; // Import isSameDay from date-fns
import { useQuery } from "@tanstack/react-query";
import type { UserSettings } from '../../types/app'; // Import UserSettings type
import type { Note } from '../../types/app'; // Import shared Note type
import type { Habit, HabitCompletion } from '../../types/habit-tracker'; // Import Habit types


interface CalendarEvent {
  id: string;
  calendarId: string; // Calendar ID field
  summary: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  source?: "personal" | "work"; // "personal" = Google, "work" = O365
  description?: string; // Description field
  calendarName?: string; // Calendar name field
  tags?: string[]; // Tags field
}

interface Task {
  id: string;
  text: string;
  done: boolean;
  source?: "personal" | "work"; // Add source tag
}

const AtAGlanceWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name || "User";

  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]); // Add state for notes
  const [meetings, setMeetings] = useState<Note[]>([]); // Meeting notes also use the Note type
  const [habits, setHabits] = useState<Habit[]>([]); // Add state for habits
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]); // Add state for habit completions
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedHtml, setFormattedHtml] = useState<string>("<div class='flex items-center gap-2'><img src='/flocat-icon.png' alt='FloCat' class='w-8 h-8' /> <p>FloCat is thinking...</p></div>");
  
  // Weather state
  const [weather, setWeather] = useState<{temp: number, condition: string, location: string}>({
    temp: 72,
    condition: "Sunny", 
    location: "New York"
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Function to fetch user's location and weather
  const fetchWeather = useCallback(async () => {
    try {
      // For demonstration, we'll use a default location first
      // In production, this would use the browser's geolocation API and a weather service
      setWeather({
        temp: 72,
        condition: "Sunny",
        location: "New York"
      });
      
      // This would actually access the browser's geolocation API
      // navigator.geolocation.getCurrentPosition((position) => {
      //   setUserLocation({
      //     lat: position.coords.latitude,
      //     lon: position.coords.longitude
      //   });
      //   
      //   // Then fetch weather based on coordinates
      //   // fetchWeatherFromCoordinates(position.coords.latitude, position.coords.longitude);
      // });
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  }, []);

  // Fetch user settings
  const { data: loadedSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user-settings'],
    retry: 1,
    enabled: isAuthenticated
  });

  // State for calendar sources, initialized from settings
  const [calendarSources, setCalendarSources] = useState<any[]>([]);
  const [selectedCals, setSelectedCals] = useState<string[]>([]);
  const [powerAutomateUrl, setPowerAutomateUrl] = useState<string>("");

  // Update calendar settings when settings load
  useEffect(() => {
    if (loadedSettings) {
      // Set PowerAutomate URL for backward compatibility
      if (loadedSettings.powerAutomateUrl) {
        setPowerAutomateUrl(loadedSettings.powerAutomateUrl);
      }
      
      // Set selected calendars for backward compatibility
      if (loadedSettings.selectedCals && loadedSettings.selectedCals.length > 0) {
        setSelectedCals(loadedSettings.selectedCals);
      }
      
      // Set calendar sources if available
      if (loadedSettings.calendarSources && loadedSettings.calendarSources.length > 0) {
        setCalendarSources(loadedSettings.calendarSources.filter(source => source.isEnabled));
      }
    }
  }, [loadedSettings]);


 // Function to determine the current time interval (morning, lunch, evening)
 const getTimeInterval = (date: Date, timezone: string): 'morning' | 'lunch' | 'evening' | 'other' => {
   const hour = parseInt(formatInTimeZone(date, timezone, 'HH'), 10);
   if (hour >= 5 && hour < 12) return 'morning';
   if (hour >= 12 && hour < 17) return 'lunch';
   if (hour >= 17 || hour < 5) return 'evening';
   return 'other'; // Should not happen with the current logic, but as a fallback
 };

 // Function to safely parse markdown (memoized to prevent unnecessary re-renders)
const parseMarkdown = React.useCallback((text: string): string => {
  try {
    const result = marked(text);
    return typeof result === 'string' ? result : '';
  } catch (err) {
    console.error("Error parsing markdown:", err);
    return text;
  }
}, []);

// Function to get actual greeting based on time of day
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    if (!isMounted) return;
    
    setLoading(true);
    setError(null);
    setAiMessage(null);

    try {
      // Fetch real tasks from your API
      const tasksRes = await fetch('/api/tasks');
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksRes.json();
      
      // Fetch events
      const eventsRes = await fetch('/api/calendar');
      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsRes.json();
      setUpcomingEvents(eventsData);

      // Get real weather data
      let weatherData;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const weatherRes = await fetch(`/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        if (weatherRes.ok) {
          weatherData = await weatherRes.json();
          setWeather({
            temp: Math.round(weatherData.temp),
            condition: weatherData.condition,
            location: weatherData.location
          });
        }
      } catch (weatherErr) {
        console.error('Weather fetch failed:', weatherErr);
      }

      // Process tasks data
      const incompleteTasks = tasksData.filter((task: Task) => !task.done);
      setTasks(tasksData);

      // Generate personalized message based on actual data
      const timeOfDay = getTimeBasedGreeting();
      const now = new Date();
      const currentHour = now.getHours();

      let personalizedGreeting = '';
      if (currentHour < 12) {
        personalizedGreeting = "Meow! Rise and shine";
      } else if (currentHour < 17) {
        personalizedGreeting = "Purr! Hope your day is going well";
      } else {
        personalizedGreeting = "Meow! Winding down for the day";
      }
      
      const dynamicMessage = `# ${personalizedGreeting}, ${userName}! 😺

${weather ? `The weather is ${weather.temp}°F and ${weather.condition.toLowerCase()} in ${weather.location} - ${weather.temp > 75 ? 'perfect for a lazy sunbath!' : 'cozy indoor weather!'} ☀️` : ''}

${incompleteTasks.length > 0 ? `
Your todo list (${incompleteTasks.length} items pending):
${incompleteTasks.map((task: Task) => `- ${task.text}${task.priority === 'high' ? ' ⭐' : ''}`).join('\n')}

*Paws up!* I think "${incompleteTasks[0].text}" needs attention first! 🐾` : 'Your task list is clear - time for a well-deserved catnap! 😺'}

${upcomingEvents.length > 0 ? `
Upcoming events:
${upcomingEvents.slice(0, 3).map(event => `- ${event.summary} at ${new Date(event.start.dateTime || event.start.date).toLocaleTimeString()}`).join('\n')}` : ''}

*Purrs contentedly* Keep up the great work, ${userName}! 🌟`;

      setAiMessage(dynamicMessage);
      setFormattedHtml(parseMarkdown(dynamicMessage));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch real-time data');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

     const now = new Date();
     const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
     const currentTimeInterval = getTimeInterval(now, userTimezone);

     console.log("AtAGlanceWidget: Fetching data for interval:", currentTimeInterval);

     try {
       // Fetch upcoming events for today, including o365Url
       // Calculate start and end of day in the user's timezone, including the timezone offset

        // Calculate start and end of day in the user's timezone, including the timezone offset
        const startOfTodayInTimezone = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd\'T\'00:00:00XXX');
        const endOfTodayInTimezone = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd\'T\'23:59:59XXX');

        // Create Date objects from the timezone-aware strings and convert them to UTC ISO strings for the API
        const startOfTodayUTC = new Date(startOfTodayInTimezone).toISOString();
        const endOfTodayUTC = new Date(endOfTodayInTimezone).toISOString();

        // Determine whether to use new calendar sources or legacy settings
        let apiUrlParams = `timeMin=${encodeURIComponent(startOfTodayUTC)}&timeMax=${encodeURIComponent(endOfTodayUTC)}&timezone=${encodeURIComponent(userTimezone)}`;
        
        // If we have calendar sources, use them
        if (calendarSources && calendarSources.length > 0) {
          console.log("AtAGlanceWidget: Using calendar sources:", calendarSources);
          apiUrlParams += `&useCalendarSources=true`;
        } else {
          // Otherwise fall back to legacy settings
          // Construct calendarId query parameter from selectedCals
          const calendarIdQuery = loadedSettings?.selectedCals && loadedSettings.selectedCals.length > 0
            ? `&calendarId=${loadedSettings.selectedCals.map((id: string) => encodeURIComponent(id)).join('&calendarId=')}`
            : ''; // If no calendars selected, don't add calendarId param (API defaults to primary)
          
          apiUrlParams += calendarIdQuery;
          
          // Add PowerAutomate URL if available
          if (loadedSettings?.powerAutomateUrl) {
            console.log("AtAGlanceWidget: Using powerAutomateUrl:", loadedSettings.powerAutomateUrl);
            apiUrlParams += `&o365Url=${encodeURIComponent(loadedSettings.powerAutomateUrl)}`;
          }
        }
        
        const eventsApiUrl = `/api/calendar?${apiUrlParams}`;
       console.log("AtAGlanceWidget: Fetching events from URL:", eventsApiUrl);

       const eventsRes = await fetch(eventsApiUrl);
        if (!eventsRes.ok) {
          throw new Error(`Error fetching events: ${eventsRes.statusText}`);
        }
       const eventsData: CalendarEvent[] = await eventsRes.json();
       console.log("AtAGlanceWidget: Fetched raw eventsData:", eventsData); // Log raw data
       console.log("AtAGlanceWidget: Number of events fetched:", eventsData.length); // Log number of events
       console.log("AtAGlanceWidget: Events data structure example:", eventsData.length > 0 ? eventsData[0] : "No events"); // Log example event structure

       // Convert event times to user's timezone
       const eventsInUserTimezone = eventsData.map(event => {
         const start = event.start.dateTime
           ? { dateTime: formatInTimeZone(toZonedTime(event.start.dateTime, userTimezone), userTimezone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX') }
         : event.start.date
           ? { date: event.start.date } // All-day events don't need time conversion
           : {};
         const end = event.end?.dateTime
           ? { dateTime: formatInTimeZone(toZonedTime(event.end.dateTime, userTimezone), userTimezone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX') }
          : event.end?.date
            ? { date: event.end.date } // All-day events don't need time conversion
            : undefined;

         return {
           ...event,
           start,
           end,
         };
       });

       console.log("AtAGlanceWidget: Events converted to user timezone:", eventsInUserTimezone); // Log events after timezone conversion
       setUpcomingEvents(eventsInUserTimezone);

       // Fetch tasks
       const tasksRes = await fetch('/api/tasks');
        if (!tasksRes.ok) {
          throw new Error(`Error fetching tasks: ${tasksRes.statusText}`);
        }
        let tasksData: Task[] = await tasksRes.json();
        
        // If no tasks found, add some sample tasks to demonstrate personalization
        if (!tasksData || tasksData.length === 0) {
          console.log("AtAGlanceWidget: No tasks found, adding sample tasks for demonstration");
          tasksData = [
            { id: "1", text: "Complete project proposal draft", done: false },
            { id: "2", text: "Review client feedback", done: false },
            { id: "3", text: "Schedule team meeting", done: true },
            { id: "4", text: "Update documentation", done: false }
          ];
        }
        
        console.log("AtAGlanceWidget: Tasks data for prompt:", tasksData);
        setTasks(tasksData);

        // Fetch notes
        const notesRes = await fetch('/api/notes');
        if (!notesRes.ok) {
          throw new Error(`Error fetching notes: ${notesRes.statusText}`);
        }
        const notesData: Note[] = await notesRes.json();
        setNotes(notesData);

        // Fetch meetings
        const meetingsRes = await fetch('/api/meetings');
        if (!meetingsRes.ok) {
          throw new Error(`Error fetching meetings: ${meetingsRes.statusText}`);
        }
        const meetingsData: Note[] = await meetingsRes.json();
        setMeetings(meetingsData);

        // Fetch habits
        const habitsRes = await fetch('/api/habits');
        if (!habitsRes.ok) {
          console.log("Error fetching habits:", habitsRes.statusText);
          // Don't throw error here, just log it and continue
        } else {
          const habitsData: Habit[] = await habitsRes.json();
          setHabits(habitsData);
          
          // Fetch habit completions for the current month
          const today = new Date();
          const habitCompletionsRes = await fetch(`/api/habits/completions?year=${today.getFullYear()}&month=${today.getMonth()}`);
          if (habitCompletionsRes.ok) {
            const completionsData: HabitCompletion[] = await habitCompletionsRes.json();
            setHabitCompletions(completionsData);
          }
        }


        // Filter out completed tasks for the AI prompt
        const incompleteTasks = tasksData.filter(task => !task.done);


       // Filter out past events for the AI prompt, using times already converted to user's timezone
       const upcomingEventsForPrompt = eventsInUserTimezone.filter(ev => {
         console.log("AtAGlanceWidget: Filtering event:", ev.summary, ev.start.dateTime || ev.start.date);
         const nowInUserTimezone = toZonedTime(now, userTimezone); // Use toZonedTime for current time as well

         if (ev.start.dateTime) {
           // Timed event
           const startTime = toZonedTime(ev.start.dateTime, userTimezone);
           const endTime = ev.end?.dateTime ? toZonedTime(ev.end.dateTime, userTimezone) : null;

           // Include if the event starts today AND has not ended yet
           const isToday = isSameDay(startTime, nowInUserTimezone);
           const hasNotEnded = !endTime || endTime.getTime() > nowInUserTimezone.getTime();

           const shouldKeep = isToday && hasNotEnded;
           console.log("AtAGlanceWidget: Timed event times (user timezone):", startTime, endTime, "Current time (user timezone):", nowInUserTimezone, "Is today:", isToday, "Has not ended:", hasNotEnded, "Keep timed event?", shouldKeep);
           return shouldKeep;

         } else if (ev.start.date) {
           // All-day event
           const eventDate = toZonedTime(ev.start.date, userTimezone);

           // Include if the event date is today
           const isToday = isSameDay(eventDate, nowInUserTimezone);

           const shouldKeep = isToday;
           console.log("AtAGlanceWidget: All-day event date (user timezone):", eventDate, "Current time (user timezone):", nowInUserTimezone, "Is today:", isToday, "Keep all-day event?", shouldKeep);
           return shouldKeep;
         }
         // Should not happen if data is well-formed, but filter out if no start time/date
         console.log("AtAGlanceWidget: Filtering out event with no start time/date.");
         return false;
       });
          console.log("AtAGlanceWidget: upcomingEventsForPrompt:", upcomingEventsForPrompt); // Add this log

       // Check for cached message *after* fetching data
       try {
         const cachedMessage = localStorage.getItem('flohub.atAGlanceMessage');
         const cachedTimestamp = localStorage.getItem('flohub.atAGlanceTimestamp');
         const cachedInterval = localStorage.getItem('flohub.atAGlanceInterval');

         if (cachedMessage && cachedTimestamp && cachedInterval === currentTimeInterval && isMounted) {
           // Use cached message if it's from the current time interval
           setAiMessage(cachedMessage);
           // Pre-parse the markdown for the cached message
           setFormattedHtml(parseMarkdown(cachedMessage));
           console.log("AtAGlanceWidget: Using cached message for interval:", currentTimeInterval);
         } else if (isMounted) {
         console.log("AtAGlanceWidget: Generating new message for interval:", currentTimeInterval);
         
         // Get today's date in YYYY-MM-DD format for habit completions
         const todayFormatted = formatInTimeZone(now, userTimezone, 'yyyy-MM-dd');
         
         // Filter habits that should be completed today (limit to 5 for performance)
         const todaysHabits = habits.filter(habit => {
           const dayOfWeek = now.getDay(); // 0-6, Sunday-Saturday
           
           switch (habit.frequency) {
             case 'daily':
               return true;
             case 'weekly':
               return dayOfWeek === 0; // Sunday
             case 'custom':
               return habit.customDays?.includes(dayOfWeek) || false;
             default:
               return false;
           }
         }).slice(0, 5); // Limit to 5 habits to reduce prompt size
         
         // Check which habits are completed today
         const completedHabits = todaysHabits.filter(habit =>
           habitCompletions.some(c =>
             c.habitId === habit.id &&
             c.date === todayFormatted &&
             c.completed
           )
         );
         
         // Calculate habit completion rate
         const habitCompletionRate = todaysHabits.length > 0
           ? Math.round((completedHabits.length / todaysHabits.length) * 100)
           : 0;
         
         // Limit the number of items in each category to reduce prompt size
         const limitedEvents = upcomingEventsForPrompt.slice(0, 3);
         const limitedTasks = incompleteTasks.slice(0, 3);
         const limitedNotes = notes.slice(0, 2);
         const limitedMeetings = meetings.slice(0, 2);
         
         // Get user preferences from settings
         const floCatPrefs = loadedSettings?.floCatPreferences || {
           communicationStyle: 'friendly',
           focusAreas: ['meetings', 'tasks', 'habits'],
           reminderIntensity: 'moderate',
           interactionFrequency: 'medium'
         };
         
         const communicationStyle = floCatPrefs.communicationStyle;
         const focusAreas = floCatPrefs.focusAreas;
         const reminderIntensity = floCatPrefs.reminderIntensity;
         const interactionFrequency = floCatPrefs.interactionFrequency;
         
         console.log("AtAGlanceWidget: Using FloCat preferences:", { 
           communicationStyle, 
           focusAreas, 
           reminderIntensity,
           interactionFrequency
         });
         
         // Generate AI message with personalized prompt based on user preferences
         const prompt = `You are FloCat, my personal AI assistant cat. Talk directly TO ME about my day and priorities.

## IMPORTANT - USE THIS REAL DATA IN YOUR RESPONSE:
My name: ${userName}
Time of day: ${currentTimeInterval}
Weather: ${weather.temp}°F, ${weather.condition} in ${weather.location}

${focusAreas.includes('meetings') ? `My upcoming events: ${limitedEvents.map(event => {
  const eventTime = event.start.dateTime
    ? formatInTimeZone(new Date(event.start.dateTime), userTimezone, 'h:mm a')
    : event.start.date;
  const calendarType = event.source === "work" ? "work" : "personal";
  return `"${event.summary}" at ${eventTime} (${calendarType})`;
}).join(', ') || 'No events today'}` : ''}

${focusAreas.includes('tasks') ? `My tasks: ${limitedTasks.map(task => `"${task.text}"`).join(', ') || 'No tasks'}` : ''}

${focusAreas.includes('habits') ? `My habits progress: ${completedHabits.length}/${todaysHabits.length} completed
${todaysHabits.map(habit => {
  const isCompleted = completedHabits.some(h => h.id === habit.id);
  return `${isCompleted ? '✅' : '⬜'} ${habit.name}`;
}).join('\n')}` : ''}

Your response MUST:
1. Start with a casual cat-like greeting ("Meow" or "Purr" incorporated naturally)
2. Mention the current weather and briefly how it might affect my day
3. Name and reference my specific tasks/events by their actual names from the data
4. If I have tasks, recommend which specific task I should prioritize with a brief explanation
5. End with an encouraging message using my name (${userName})

Response style:
- Use a ${communicationStyle === 'professional' ? 'clear and efficient' : 
          communicationStyle === 'friendly' ? 'warm and supportive' : 
          communicationStyle === 'humorous' ? 'light and playful' : 
          'witty and quirky'} tone
- Keep your message under 150 words total
- Write in first person as if you're talking TO me directly
- Use cat-themed imagery subtly in your phrasing
- Format with Markdown including emoji where appropriate
- Your reminders should be ${reminderIntensity} in intensity
- Adjust detail level to ${interactionFrequency} frequency settings

DO NOT mention that you're an AI - just be my helpful cat assistant who knows my schedule and tasks.`;


          // Track the actual fetch for analytics and debugging
          console.log("AtAGlanceWidget: Sending personalized prompt to assistant API with real data");
          console.log("AtAGlanceWidget: Real events data:", limitedEvents.length > 0 ? limitedEvents : "No events today");
          console.log("AtAGlanceWidget: Real tasks data:", limitedTasks.length > 0 ? limitedTasks : "No active tasks");
          
          // Create a more conversational, assistant-like prompt with real data
          const fullPrompt = `You are FloCat, my personal AI assistant cat. Talk directly TO ME about my day and priorities.

## IMPORTANT - USE THIS REAL DATA IN YOUR RESPONSE:
My name: ${userName || "User"}
My actual tasks: ${JSON.stringify(limitedTasks)}
My calendar events: ${JSON.stringify(limitedEvents)}
Current time: ${new Date().toLocaleTimeString()}
Current date: ${new Date().toLocaleDateString()}
Weather: [Based on your current location - will be fetched dynamically]

Your response MUST:
1. Start with a casual cat-like greeting ("Meow" or "Purr" incorporated naturally)
2. Mention the current weather (72°F, Sunny) and briefly how it might affect my day
3. Name and reference my specific tasks by their actual names from the data
4. Recommend which specific task I should prioritize today with a brief explanation
5. If I have an upcoming event, mention it by name with the time
6. End with an encouraging message using my name

Response style:
- Use a ${communicationStyle === 'professional' ? 'clear and efficient' : 
                communicationStyle === 'friendly' ? 'warm and supportive' : 
                communicationStyle === 'humorous' ? 'light and playful' : 'witty and quirky'} tone
- Keep your message under 150 words total
- Write in first person as if you're talking TO me directly
- Use cat-themed imagery subtly in your phrasing
- Format with Markdown including emoji where appropriate
                
DO NOT mention "AI" or that you're an AI assistant - just be my helpful cat assistant`;

          console.log("AtAGlanceWidget: Using personalized prompt with FloCat conversational style");
          
          console.log("AtAGlanceWidget: Using upgraded prompt to ensure real data is used");
          
          const aiRes = await fetch('/api/assistant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              history: [], 
              prompt: fullPrompt,
              // Include metadata to improve response quality
              metadata: {
                userName,
                communicationStyle,
                focusAreas,
                eventCount: upcomingEvents.length,
                taskCount: tasks.length,
                incompleteTasks: incompleteTasks.length,
                userTimezone
              }
            }),
          });

          if (!aiRes.ok) {
            // If we get a timeout or other error, generate a simple message instead
            if (aiRes.status === 504) {
              console.warn("AI request timed out, using fallback message");
              const fallbackMessage = `# *Purrs softly* Good ${currentTimeInterval}, ${userName}! 😺

It's a ${weather.condition.toLowerCase()} day at ${weather.temp}°F here in ${weather.location}! Perfect weather for a productive day.

${upcomingEventsForPrompt.length > 0 ? `
I've been keeping an eye on your schedule, and here's what's coming up:
${upcomingEventsForPrompt.slice(0, 3).map(event => {
  const eventTime = event.start.dateTime
    ? formatInTimeZone(new Date(event.start.dateTime), userTimezone, 'h:mm a')
    : event.start.date;
  return `- **${event.summary}** at ${eventTime}`;
}).join('\n')}
` : ''}

${incompleteTasks.length > 0 ? `
I've noticed these tasks need your attention:
${incompleteTasks.slice(0, 3).map(task => `- ${task.text}`).join('\n')}

*My whiskers tell me you should focus on "${incompleteTasks[0].text}" first!*
` : ''}

${todaysHabits.length > 0 ? `
*Pawsome* progress on your habits today! ${completedHabits.length}/${todaysHabits.length} completed:
${todaysHabits.slice(0, 3).map(habit => {
  const isCompleted = completedHabits.some(h => h.id === habit.id);
  return `- ${isCompleted ? '✅' : '⬜'} ${habit.name}`;
}).join('\n')}
` : ''}

Keep being amazing, ${userName}! I'll be right here if you need me. 🐱`;

              setAiMessage(fallbackMessage);
              setFormattedHtml(parseMarkdown(fallbackMessage));
              return;
            }
            throw new Error(`Error generating AI message: ${aiRes.statusText}`);
          }

          const aiData = await aiRes.json();
          if (aiData.reply && isMounted) {
            setAiMessage(aiData.reply);
            // Pre-parse the markdown
            setFormattedHtml(parseMarkdown(aiData.reply));
            
            // Store the new message and timestamp in localStorage
            try {
              localStorage.setItem('flohub.atAGlanceMessage', aiData.reply);
              localStorage.setItem('flohub.atAGlanceTimestamp', now.toISOString());
              localStorage.setItem('flohub.atAGlanceInterval', currentTimeInterval);
            } catch (err) {
              console.error("Error saving to localStorage:", err);
            }
          } else if (isMounted) {
            setError("AI assistant did not return a message.");
          }
         }
       } catch (err) {
         console.error("Error accessing localStorage:", err);
       }


     } catch (err: any) {
       if (isMounted) {
         setError(err.message);
         console.error("Error fetching data or generating AI message for At A Glance widget:", err);
       }
     } finally {
       if (isMounted) {
         setLoading(false);
       }
     }
   };

   // Fetch data when user or loadedSettings changes
   if (isAuthenticated && loadedSettings) { // Only fetch data if authenticated and settings are loaded
     fetchData();
   }
   
   // Cleanup function to prevent state updates after unmount
   return () => {
     isMounted = false;
   };
  }, [user, isAuthenticated, loadedSettings, parseMarkdown]); // Include all dependencies

 let loadingMessage = "Planning your day...";
 if (loading) {
   // Determine a more specific loading message based on what's being fetched
   if (!loadedSettings) {
     loadingMessage = "Loading settings...";
   } else if (isAuthenticated && loadedSettings && !upcomingEvents.length && !tasks.length && !notes.length && !meetings.length) {
      loadingMessage = "Gathering your day's information...";
   } else if (isAuthenticated && loadedSettings && upcomingEvents.length > 0 && tasks.length === 0 && notes.length === 0 && meetings.length === 0) {
       loadingMessage = "Checking for tasks, notes, and meetings...";
   } else if (isAuthenticated && loadedSettings && upcomingEvents.length === 0 && tasks.length > 0 && notes.length === 0 && meetings.length === 0) {
       loadingMessage = "Checking for events, notes, and meetings...";
   } else {
       loadingMessage = "Compiling your daily summary...";
   }


   return <div className="p-4 border rounded-lg shadow-sm">{loadingMessage}</div>;
 }

 if (error) {
    return <div className="p-4 border rounded-lg shadow-sm text-red-500">Error: {error}</div>;
  }

  // We've removed the separate useEffect for markdown conversion
  // and integrated it directly into the data fetching flow

  return (
    <div className="p-4 border rounded-lg shadow-sm flex flex-col h-full justify-between bg-gradient-to-b from-white to-slate-50">
      <h3 className="font-medium text-md mb-2">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
      
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-teal-100 p-2 animate-bounce">
            <img src="/flocat-icon.png" alt="FloCat" className="w-8 h-8" />
          </div>
          <p className="text-gray-600 animate-pulse">
            {loadingMessage}
            <span className="inline-block animate-pulse">...</span>
          </p>
        </div>
      ) : error ? (
        <div className="text-red-500">
          <p>Sorry, I had trouble connecting. Please try again later.</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-start">
              <div className="rounded-full bg-teal-100 p-2 mt-1">
                <img src="/flocat-icon.png" alt="FloCat" className="w-8 h-8" />
              </div>
              <div className="text-md prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2 group hover:bg-blue-50 rounded-full px-3 py-1 transition-all duration-200">
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            {weather.condition.toLowerCase().includes('sun') ? '☀️' : 
             weather.condition.toLowerCase().includes('cloud') ? '☁️' :
             weather.condition.toLowerCase().includes('rain') ? '🌧️' : '⛅'}
          </span>
          <p className="text-sm text-gray-600 font-medium">{weather.temp}°F, {weather.condition} in {weather.location}</p>
        </div>
        
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            // Run the fetchData function
            const fetchAndRefresh = async () => {
              try {
                // Fetch weather data
                await fetchWeather();
                
                // Fetch tasks and calendar events
                const now = new Date();
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                
                // This would typically call your API endpoints
                const tasksRes = await fetch('/api/tasks');
                const tasksData = await tasksRes.json();
                
                // If no tasks found, add demonstrational tasks
                const finalTasks = tasksData && tasksData.length > 0 ? tasksData : [
                  { id: "1", text: "Complete project proposal draft", done: false },
                  { id: "2", text: "Review client feedback", done: false },
                  { id: "3", text: "Schedule team meeting", done: true },
                  { id: "4", text: "Update documentation", done: false }
                ];
                
                setTasks(finalTasks);
                
                // Now generate a new message
                const prompt = `You are FloCat, my personal AI assistant cat. Talk directly TO ME about my day and priorities.

## IMPORTANT - USE THIS REAL DATA IN YOUR RESPONSE:
My name: ${userName || "User"}
My actual tasks: ${JSON.stringify(finalTasks)}
Current time: ${new Date().toLocaleTimeString()}
Current date: ${new Date().toLocaleDateString()}
Weather: ${weather.temp}°F, ${weather.condition} in ${weather.location}

Your response MUST:
1. Start with a casual cat-like greeting ("Meow" or "Purr" incorporated naturally)
2. Mention the current weather and how it might affect my day
3. Name and reference my specific tasks by their actual names (Complete project proposal draft, etc.)
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
                setError("Could not refresh FloCat message. Please try again.");
                console.error("Error refreshing FloCat:", err);
              } finally {
                setLoading(false);
              }
            };
            
            fetchAndRefresh();
          }} 
          className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 px-2 py-1 rounded border border-teal-200 hover:bg-teal-50"
          disabled={loading}
        >
          {loading ? "Updating..." : "Ask FloCat"}
        </button>
      </div>
    </div>
  );
};

export default memo(AtAGlanceWidget);
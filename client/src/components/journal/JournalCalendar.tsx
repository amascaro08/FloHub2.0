import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface JournalCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
  refreshTrigger?: number; // Add this to trigger refresh
}

interface DateInfo {
  date: string;
  hasJournalEntry: boolean;
  hasMood: boolean;
  moodEmoji?: string;
  activities: string[];
  sleep?: {
    duration: number;
    quality: number;
  };
}

export default function JournalCalendar({ onSelectDate, selectedDate, refreshTrigger = 0 }: JournalCalendarProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<DateInfo[]>([]);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const loadCalendarData = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get the first day of the month
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get the last day of the month
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Get days from previous month to fill in the first row
      const prevMonthDays = [];
      const prevMonth = new Date(year, month, 0);
      const daysInPrevMonth = prevMonth.getDate();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        prevMonthDays.push({
          date: date.toISOString().split('T')[0],
          hasJournalEntry: false,
          hasMood: false,
          activities: [],
        });
      }
      
      // Get days from current month
      const currentMonthDays = [];
      
      // If authenticated, prefetch the month's data from the API
      let monthEntries: Record<string, any> = {};
      let monthMoods: Record<string, any> = {};
      let monthActivities: Record<string, any> = {};
      
      if (isAuthenticated) {
        try {
          // Fetch journal entries for the month
          const entriesResponse = await fetch(`/api/journal/entries/month/${year}/${month + 1}`);
          if (entriesResponse.ok) {
            const entries = await entriesResponse.json();
            entries.forEach((entry: any) => {
              monthEntries[entry.date] = entry;
            });
          }
          
          // Fetch moods for the month
          const moodsResponse = await fetch(`/api/journal/moods/month/${year}/${month + 1}`);
          if (moodsResponse.ok) {
            const moods = await moodsResponse.json();
            moods.forEach((mood: any) => {
              monthMoods[mood.date] = mood;
            });
          }
          
          // Fetch activities for the month
          const activitiesResponse = await fetch(`/api/journal/activities/month/${year}/${month + 1}`);
          if (activitiesResponse.ok) {
            const activities = await activitiesResponse.json();
            activities.forEach((activity: any) => {
              if (!monthActivities[activity.date]) {
                monthActivities[activity.date] = [];
              }
              monthActivities[activity.date].push(activity);
            });
          }
        } catch (error) {
          console.error('Error fetching month data:', error);
        }
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        
        // Check if there's a journal entry for this date
        let hasJournalEntry = false;
        
        if (monthEntries[dateString]) {
          hasJournalEntry = true;
        } else {
          // Fallback to localStorage
          hasJournalEntry = localStorage.getItem(`journal_entry_${dateString}`) !== null;
        }
        
        // Check if there's a mood for this date
        let hasMood = false;
        let moodEmoji = undefined;
        
        if (monthMoods[dateString]) {
          hasMood = true;
          moodEmoji = monthMoods[dateString].emoji;
        } else {
          // Fallback to localStorage
          const moodData = localStorage.getItem(`mood_${dateString}`);
          hasMood = moodData !== null;
          
          if (hasMood) {
            try {
              const parsedMood = JSON.parse(moodData || '{}');
              moodEmoji = parsedMood.emoji;
            } catch (e) {
              console.error('Error parsing mood data', e);
            }
          }
        }
        
        // Check if there are activities for this date
        let activities: string[] = [];
        
        if (monthActivities[dateString]) {
          activities = monthActivities[dateString].map((a: any) => a.type);
        } else {
          // Fallback to localStorage
          const activitiesKey = `activities_${dateString}`;
          const activitiesData = localStorage.getItem(activitiesKey);
          
          if (activitiesData) {
            try {
              const parsedActivities = JSON.parse(activitiesData);
              activities = Object.keys(parsedActivities);
            } catch (e) {
              console.error('Error parsing activities data', e);
            }
          }
        }
        
        // Check if there's sleep data for this date
        let sleep = undefined;
        const hasSleepActivity = activities.includes('sleep');
        
        if (!hasSleepActivity) {
          // Check localStorage as fallback
          const sleepKey = `sleep_${dateString}`;
          const sleepData = localStorage.getItem(sleepKey);
          
          if (sleepData) {
            try {
              const parsedSleep = JSON.parse(sleepData);
              sleep = {
                duration: parsedSleep.duration || 0,
                quality: parsedSleep.quality || 0
              };
            } catch (e) {
              console.error('Error parsing sleep data', e);
            }
          }
        } else {
          // If we have a sleep activity, use it
          const sleepActivity = monthActivities[dateString]?.find((a: any) => a.type === 'sleep');
          if (sleepActivity) {
            // Extract duration and quality from notes
            const qualityMatch = sleepActivity.notes?.match(/Quality: (\d)\/5/);
            const quality = qualityMatch ? parseInt(qualityMatch[1]) : 3;
            
            sleep = {
              duration: sleepActivity.duration / 60, // Convert minutes to hours
              quality
            };
          }
        }
        
        currentMonthDays.push({
          date: dateString,
          hasJournalEntry,
          hasMood,
          moodEmoji,
          activities,
          sleep
        });
      }
      
      // Get days from next month to fill the last row
      const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length;
      const nextMonthDays = [];
      const daysNeeded = 42 - totalDaysSoFar; // 6 rows of 7 days
      
      for (let day = 1; day <= daysNeeded; day++) {
        const date = new Date(year, month + 1, day);
        nextMonthDays.push({
          date: date.toISOString().split('T')[0],
          hasJournalEntry: false,
          hasMood: false,
          activities: [],
        });
      }
      
      // Combine all days
      setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
    };
    
    loadCalendarData();
  }, [currentMonth, refreshTrigger, isAuthenticated]);
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  const isSameMonth = (date: string, month: Date): boolean => {
    const dateObj = new Date(date);
    return dateObj.getMonth() === month.getMonth() && 
           dateObj.getFullYear() === month.getFullYear();
  };
  
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">Journal Calendar</h2>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={goToCurrentMonth}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Today
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-2 text-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatMonthYear(currentMonth)}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div 
            key={index} 
            className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const date = new Date(dayInfo.date);
          const day = date.getDate();
          const isToday = dayInfo.date === new Date().toISOString().split('T')[0];
          const isSelected = dayInfo.date === selectedDate;
          const isCurrentMonth = isSameMonth(dayInfo.date, currentMonth);
          
          return (
            <button
              key={index}
              onClick={() => onSelectDate(dayInfo.date)}
              className={`
                relative h-10 flex flex-col items-center justify-center rounded-md transition-colors
                ${isSelected ? 'bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100' : 
                  isToday ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 
                  isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : 
                  'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}
              `}
            >
              <span className={`text-xs ${isToday ? 'font-bold' : ''}`}>{day}</span>
              
              {/* Indicators for journal entry, mood, activities, and sleep */}
              {isCurrentMonth && (
                <div className="absolute bottom-1 flex space-x-1 items-center">
                  {dayInfo.hasJournalEntry && (
                    <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                  )}
                  {dayInfo.hasMood && dayInfo.moodEmoji && (
                    <div className="text-[9px]">{dayInfo.moodEmoji}</div>
                  )}
                  {dayInfo.activities && dayInfo.activities.length > 0 && (
                    <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  )}
                  {dayInfo.sleep && (
                    <div className="text-[9px]">💤</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
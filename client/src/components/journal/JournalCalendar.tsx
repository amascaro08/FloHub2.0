import React, { useState, useEffect } from 'react';

interface JournalCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

interface DateInfo {
  date: string;
  hasJournalEntry: boolean;
  hasMood: boolean;
  moodEmoji?: string;
}

export default function JournalCalendar({ onSelectDate, selectedDate }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<DateInfo[]>([]);
  
  // Generate calendar days for the current month
  useEffect(() => {
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
      });
    }
    
    // Get days from current month
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if there's a journal entry for this date
      const hasJournalEntry = localStorage.getItem(`journal_entry_${dateString}`) !== null;
      
      // Check if there's a mood for this date
      const moodData = localStorage.getItem(`mood_${dateString}`);
      const hasMood = moodData !== null;
      let moodEmoji = undefined;
      
      if (hasMood) {
        try {
          const parsedMood = JSON.parse(moodData || '{}');
          moodEmoji = parsedMood.emoji;
        } catch (e) {
          console.error('Error parsing mood data', e);
        }
      }
      
      currentMonthDays.push({
        date: dateString,
        hasJournalEntry,
        hasMood,
        moodEmoji,
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
      });
    }
    
    // Combine all days
    setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
  }, [currentMonth]);
  
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
              
              {/* Indicator for journal entry or mood */}
              {isCurrentMonth && (dayInfo.hasJournalEntry || dayInfo.hasMood) && (
                <div className="absolute bottom-1 flex space-x-1 items-center">
                  {dayInfo.hasJournalEntry && (
                    <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                  )}
                  {dayInfo.hasMood && dayInfo.moodEmoji && (
                    <div className="text-[9px]">{dayInfo.moodEmoji}</div>
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
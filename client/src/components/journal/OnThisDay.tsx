import React, { useState, useEffect } from 'react';

interface HistoricalEntry {
  date: string;
  content: string;
  mood?: {
    emoji: string;
    label: string;
  };
  yearsAgo: number;
}

interface OnThisDayProps {
  onViewEntry: (date: string) => void;
}

export default function OnThisDay({ onViewEntry }: OnThisDayProps) {
  const [entries, setEntries] = useState<HistoricalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistoricalEntries = () => {
      setIsLoading(true);
      
      try {
        // Get today's date
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        const currentYear = today.getFullYear();
        
        // Get all entries from localStorage
        const keys = Object.keys(localStorage);
        const entryKeys = keys.filter(key => key.startsWith('journal_entry_'));
        const moodKeys = keys.filter(key => key.startsWith('mood_'));
        
        // Create a map of dates to entries
        const historicalEntries: HistoricalEntry[] = [];
        
        // Process journal entries - check if they fall on the same day and month
        entryKeys.forEach(key => {
          try {
            const dateStr = key.replace('journal_entry_', '');
            const entryDate = new Date(dateStr);
            
            // Check if this entry is from a previous year but same month/day
            if (
              entryDate.getMonth() === currentMonth && 
              entryDate.getDate() === currentDay && 
              entryDate.getFullYear() < currentYear
            ) {
              const yearsAgo = currentYear - entryDate.getFullYear();
              const entryData = JSON.parse(localStorage.getItem(key) || '{}');
              
              // Look for a matching mood entry
              const moodKey = `mood_${dateStr}`;
              let mood = undefined;
              
              if (localStorage.getItem(moodKey)) {
                try {
                  const moodData = JSON.parse(localStorage.getItem(moodKey) || '{}');
                  mood = {
                    emoji: moodData.emoji,
                    label: moodData.label
                  };
                } catch (e) {
                  console.error(`Error parsing mood for ${dateStr}`, e);
                }
              }
              
              historicalEntries.push({
                date: dateStr,
                content: entryData.content || '',
                mood,
                yearsAgo
              });
            }
          } catch (e) {
            console.error(`Error processing entry key ${key}`, e);
          }
        });
        
        // Check for entries that only have mood (no journal content)
        moodKeys.forEach(key => {
          try {
            const dateStr = key.replace('mood_', '');
            
            // Skip if we already have an entry for this date
            if (historicalEntries.some(entry => entry.date === dateStr)) {
              return;
            }
            
            const entryDate = new Date(dateStr);
            
            // Check if this entry is from a previous year but same month/day
            if (
              entryDate.getMonth() === currentMonth && 
              entryDate.getDate() === currentDay && 
              entryDate.getFullYear() < currentYear
            ) {
              const yearsAgo = currentYear - entryDate.getFullYear();
              const moodData = JSON.parse(localStorage.getItem(key) || '{}');
              
              historicalEntries.push({
                date: dateStr,
                content: '',
                mood: {
                  emoji: moodData.emoji,
                  label: moodData.label
                },
                yearsAgo
              });
            }
          } catch (e) {
            console.error(`Error processing mood key ${key}`, e);
          }
        });
        
        // Sort entries by years ago (newest first)
        historicalEntries.sort((a, b) => a.yearsAgo - b.yearsAgo);
        
        setEntries(historicalEntries);
      } catch (e) {
        console.error('Error loading historical entries', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistoricalEntries();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">On This Day</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">On This Day</h2>
      
      {entries.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">No journal entries found from past years on this day.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div 
              key={entry.date} 
              className="cursor-pointer"
              onClick={() => onViewEntry(entry.date)}
            >
              <div className="flex items-center mb-2">
                <span className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100 px-2 py-1 rounded-full mr-2">
                  {entry.yearsAgo} {entry.yearsAgo === 1 ? 'year' : 'years'} ago
                </span>
                {entry.mood && (
                  <span className="text-lg mr-1">{entry.mood.emoji}</span>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(entry.date).toLocaleDateString(undefined, { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              {entry.content ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-3">
                  "{entry.content}"
                </p>
              ) : entry.mood ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Feeling {entry.mood.label.toLowerCase()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
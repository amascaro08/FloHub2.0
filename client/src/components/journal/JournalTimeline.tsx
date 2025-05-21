import React, { useState, useEffect } from 'react';

interface JournalEntry {
  date: string;
  content: string;
  mood?: {
    emoji: string;
    label: string;
    tags: string[];
  };
}

interface JournalTimelineProps {
  onSelectDate: (date: string) => void;
}

export default function JournalTimeline({ onSelectDate }: JournalTimelineProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const loadedEntries: JournalEntry[] = [];
    
    // Get all localStorage keys and filter for journal entries
    const keys = Object.keys(localStorage);
    const entryKeys = keys.filter(key => key.startsWith('journal_entry_'));
    const moodKeys = keys.filter(key => key.startsWith('mood_'));
    
    // Create a map of dates to entries
    const entriesByDate: Record<string, JournalEntry> = {};
    
    // Process journal entries
    entryKeys.forEach(key => {
      const date = key.replace('journal_entry_', '');
      
      try {
        const entryData = JSON.parse(localStorage.getItem(key) || '{}');
        entriesByDate[date] = {
          date,
          content: entryData.content || '',
        };
      } catch (e) {
        console.error(`Error parsing journal entry for date ${date}`, e);
      }
    });
    
    // Process mood entries and add to existing journal entries
    moodKeys.forEach(key => {
      const date = key.replace('mood_', '');
      
      try {
        const moodData = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (entriesByDate[date]) {
          // Add mood to existing entry
          entriesByDate[date].mood = {
            emoji: moodData.emoji,
            label: moodData.label,
            tags: Array.isArray(moodData.tags) ? moodData.tags : [],
          };
        } else {
          // Create new entry with only mood
          entriesByDate[date] = {
            date,
            content: '',
            mood: {
              emoji: moodData.emoji,
              label: moodData.label,
              tags: Array.isArray(moodData.tags) ? moodData.tags : [],
            },
          };
        }
      } catch (e) {
        console.error(`Error parsing mood for date ${date}`, e);
      }
    });
    
    // Convert the entries object to an array sorted by date (newest first)
    const sortedEntries = Object.values(entriesByDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setEntries(sortedEntries);
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: dateString.startsWith(new Date().getFullYear().toString()) ? undefined : 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Journal Timeline</h2>
      
      {entries.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">No journal entries yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start writing today to build your timeline.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <div 
              key={entry.date} 
              className="border-l-2 border-teal-500 pl-4 ml-2 transition-colors hover:border-teal-700 cursor-pointer"
              onClick={() => onSelectDate(entry.date)}
            >
              <div className="flex items-center mb-2">
                {entry.mood ? (
                  <span className="text-lg mr-2">{entry.mood.emoji}</span>
                ) : (
                  <span className="w-6 h-6 mr-2 bg-teal-100 dark:bg-teal-800 rounded-full"></span>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(entry.date)}</span>
              </div>
              
              {entry.content ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {entry.content}
                </p>
              ) : entry.mood ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Feeling {entry.mood.label.toLowerCase()}
                  {entry.mood.tags.length > 0 ? ` about ${entry.mood.tags.slice(0, 3).join(', ')}` : ''}
                  {entry.mood.tags.length > 3 ? '...' : ''}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">No content</p>
              )}
            </div>
          ))}
          
          {entries.length > 5 && (
            <button className="mt-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-sm flex items-center">
              View all entries
            </button>
          )}
        </div>
      )}
    </div>
  );
}
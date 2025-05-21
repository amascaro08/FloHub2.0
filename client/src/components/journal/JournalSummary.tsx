import React, { useState, useEffect } from 'react';

interface MoodCount {
  emoji: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface TagCount {
  tag: string;
  count: number;
}

export default function JournalSummary() {
  const [moodStats, setMoodStats] = useState<MoodCount[]>([]);
  const [commonTags, setCommonTags] = useState<TagCount[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      setIsLoading(true);
      
      try {
        // Get all localStorage keys
        const keys = Object.keys(localStorage);
        const entryKeys = keys.filter(key => key.startsWith('journal_entry_'));
        const moodKeys = keys.filter(key => key.startsWith('mood_'));
        
        // Count moods
        const moodCounts: Record<string, { 
          emoji: string, 
          label: string, 
          count: number,
          color: string 
        }> = {};
        
        let totalMoods = 0;
        
        // Process mood entries
        moodKeys.forEach(key => {
          try {
            const moodData = JSON.parse(localStorage.getItem(key) || '{}');
            
            if (moodData.label) {
              const label = moodData.label;
              
              if (!moodCounts[label]) {
                let color = 'bg-gray-400';
                
                switch (label.toLowerCase()) {
                  case 'happy': color = 'bg-yellow-400'; break;
                  case 'excited': color = 'bg-green-400'; break;
                  case 'calm': color = 'bg-blue-400'; break;
                  case 'neutral': color = 'bg-gray-400'; break;
                  case 'sad': color = 'bg-indigo-400'; break;
                  case 'angry': color = 'bg-red-400'; break;
                  case 'tired': color = 'bg-purple-400'; break;
                  case 'anxious': color = 'bg-orange-400'; break;
                }
                
                moodCounts[label] = { 
                  emoji: moodData.emoji, 
                  label, 
                  count: 0,
                  color
                };
              }
              
              moodCounts[label].count++;
              totalMoods++;
            }
          } catch (e) {
            console.error('Error parsing mood data', e);
          }
        });
        
        // Calculate percentages and create array
        const moodStatsArray = Object.values(moodCounts).map(mood => ({
          emoji: mood.emoji,
          label: mood.label,
          count: mood.count,
          percentage: totalMoods > 0 ? Math.round((mood.count / totalMoods) * 100) : 0,
          color: mood.color
        }));
        
        // Sort by count (highest first)
        moodStatsArray.sort((a, b) => b.count - a.count);
        
        setMoodStats(moodStatsArray);
        
        // Collect tags
        const tagCounts: Record<string, number> = {};
        
        moodKeys.forEach(key => {
          try {
            const moodData = JSON.parse(localStorage.getItem(key) || '{}');
            
            if (Array.isArray(moodData.tags)) {
              moodData.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          } catch (e) {
            console.error('Error processing tags', e);
          }
        });
        
        // Create tag stats array
        const tagStatsArray = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Get top 10 tags
        
        setCommonTags(tagStatsArray);
        
        // Calculate writing streak
        const calculateStreak = () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const entryDates = entryKeys.map(key => {
            const dateStr = key.replace('journal_entry_', '');
            return new Date(dateStr);
          });
          
          // Sort dates in descending order (newest first)
          entryDates.sort((a, b) => b.getTime() - a.getTime());
          
          // If no entries, streak is 0
          if (entryDates.length === 0) {
            return 0;
          }
          
          // Check if there's an entry for today
          const todayStr = today.toISOString().split('T')[0];
          const hasTodayEntry = entryKeys.some(key => key.includes(todayStr));
          
          // Start counting streak
          let currentStreak = hasTodayEntry ? 1 : 0;
          
          // If no entry for today, check if there's one for yesterday
          if (!hasTodayEntry) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const hasYesterdayEntry = entryKeys.some(key => key.includes(yesterdayStr));
            
            if (hasYesterdayEntry) {
              currentStreak = 1;
            } else {
              return 0; // No entry for today or yesterday, streak is 0
            }
          }
          
          // Check consecutive days
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - (hasTodayEntry ? 1 : 2)); // Start from yesterday or day before
          
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasEntry = entryKeys.some(key => key.includes(dateStr));
            
            if (hasEntry) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          
          return currentStreak;
        };
        
        setStreak(calculateStreak());
      } catch (e) {
        console.error('Error calculating journal stats', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Journal Insights</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Journal Insights</h2>
      
      <div className="space-y-6">
        {/* Mood Trends */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mood Trends</h3>
          
          {moodStats.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Not enough data to show mood trends yet.</p>
          ) : (
            <>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="flex h-full">
                  {moodStats.map((mood, index) => (
                    <div 
                      key={mood.label} 
                      className={`${mood.color} h-full`} 
                      style={{ width: `${mood.percentage}%` }}
                      title={`${mood.label}: ${mood.percentage}%`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap text-xs mt-2 justify-between">
                {moodStats.map(mood => (
                  <span key={mood.label} title={mood.label}>
                    {mood.emoji} {mood.percentage}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Common Themes */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Themes</h3>
          
          {commonTags.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No themes identified yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <span 
                  key={tag.tag} 
                  className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100 rounded-full text-xs"
                  title={`Used ${tag.count} times`}
                >
                  {tag.tag} {tag.count > 1 && <span className="opacity-70">({tag.count})</span>}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Writing Streak */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Writing Streak</h3>
          <div className="flex items-center">
            <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mr-2">{streak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {streak === 1 ? 'day' : 'days'} in a row
            </div>
          </div>
          
          {streak === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Write in your journal today to start a streak!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface EntryViewerProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

const EntryViewer: React.FC<EntryViewerProps> = ({ date, isOpen, onClose }) => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<{ content: string } | null>(null);
  const [mood, setMood] = useState<{ label: string; emoji: string; tags?: string[] } | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [sleep, setSleep] = useState<{ duration: number; quality: number; notes?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Format date for display
  const displayDate = date ? format(new Date(date), 'MMMM d, yyyy') : '';
  
  useEffect(() => {
    if (!date || !isOpen) return;
    
    const fetchEntry = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from API
        if (user) {
          const response = await fetch(`/api/journal/entries/${date}`);
          if (response.ok) {
            const data = await response.json();
            setEntry(data);
            setLoading(false);
            return;
          }
        }
        
        // Fall back to localStorage if needed
        const entryKey = `journal_entry_${date}`;
        const moodKey = `mood_${date}`;
        const activitiesKey = `activities_${date}`;
        const sleepKey = `sleep_${date}`;
        
        // Load entry content
        try {
          const savedEntry = localStorage.getItem(entryKey);
          if (savedEntry) {
            setEntry(JSON.parse(savedEntry));
          }
        } catch (e) {
          console.error('Error loading journal entry:', e);
        }
        
        // Load mood
        try {
          const savedMood = localStorage.getItem(moodKey);
          if (savedMood) {
            setMood(JSON.parse(savedMood));
          }
        } catch (e) {
          console.error('Error loading mood:', e);
        }
        
        // Load activities
        try {
          const savedActivities = localStorage.getItem(activitiesKey);
          if (savedActivities) {
            const activities = JSON.parse(savedActivities);
            setActivities(Object.keys(activities));
          }
        } catch (e) {
          console.error('Error loading activities:', e);
        }
        
        // Load sleep data
        try {
          const savedSleep = localStorage.getItem(sleepKey);
          if (savedSleep) {
            setSleep(JSON.parse(savedSleep));
          }
        } catch (e) {
          console.error('Error loading sleep data:', e);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching entry:', error);
        setLoading(false);
      }
    };
    
    fetchEntry();
  }, [date, isOpen, user]);
  
  const getSleepQualityEmoji = (quality: number) => {
    const emojis = ['😫', '😔', '😐', '🙂', '😊'];
    return emojis[Math.min(Math.max(Math.floor(quality) - 1, 0), 4)];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {displayDate}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <Button variant="ghost" size="sm">×</Button>
          </DialogClose>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-t-2 border-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Mood section */}
            {mood && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mood
                </h3>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{mood.emoji}</div>
                  <div>
                    <div className="font-medium">{mood.label}</div>
                    {mood.tags && mood.tags.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {mood.tags.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Activities section */}
            {activities.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm"
                    >
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sleep section */}
            {sleep && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sleep
                </h3>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{getSleepQualityEmoji(sleep.quality)}</div>
                  <div>
                    <div className="font-medium">{sleep.duration} hours</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quality: {sleep.quality}/5
                    </div>
                  </div>
                </div>
                {sleep.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-10">
                    {sleep.notes}
                  </div>
                )}
              </div>
            )}
            
            {/* Journal entry content */}
            {entry && entry.content && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Journal Entry
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 whitespace-pre-wrap">
                  {entry.content}
                </div>
              </div>
            )}
            
            {!mood && !entry?.content && activities.length === 0 && !sleep && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No data recorded for this date.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntryViewer;
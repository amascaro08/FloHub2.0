import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';


interface EntryViewerProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

const EntryViewer: React.FC<EntryViewerProps> = ({ date, isOpen, onClose }) => {
  const { user } = useAuth();
  const [entry, setEntry] = React.useState<string>('');
  const [mood, setMood] = React.useState<{ emoji: string; label: string } | null>(null);
  const [activities, setActivities] = React.useState<string[]>([]);
  
  // Load entry data when opened
  React.useEffect(() => {
    if (isOpen && date) {
      loadEntryData();
    }
  }, [isOpen, date]);
  
  const loadEntryData = async () => {
    // Try to load from API first
    try {
      const entryResponse = await fetch(`/api/journal/entries/${date}`);
      if (entryResponse.ok) {
        const entryData = await entryResponse.json();
        setEntry(entryData.content || '');
      } else {
        // Try localStorage as fallback
        const savedEntry = localStorage.getItem(`journal_entry_${date}`);
        if (savedEntry) {
          const parsed = JSON.parse(savedEntry);
          setEntry(parsed.content || '');
        } else {
          setEntry('');
        }
      }
      
      // Try to load mood
      const moodResponse = await fetch(`/api/journal/moods/${date}`);
      if (moodResponse.ok) {
        const moodData = await moodResponse.json();
        setMood({
          emoji: moodData.emoji || '😐',
          label: moodData.label || 'Neutral'
        });
      } else {
        // Try localStorage as fallback
        const savedMood = localStorage.getItem(`mood_${date}`);
        if (savedMood) {
          const parsed = JSON.parse(savedMood);
          setMood({
            emoji: parsed.emoji || '😐',
            label: parsed.label || 'Neutral'
          });
        } else {
          setMood(null);
        }
      }
      
      // Try to load activities
      const activitiesResponse = await fetch(`/api/journal/activities/${date}`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.map((a: any) => a.type));
      } else {
        // Try localStorage as fallback
        const savedActivities = localStorage.getItem(`activities_${date}`);
        if (savedActivities) {
          const parsed = JSON.parse(savedActivities);
          setActivities(Object.keys(parsed));
        } else {
          setActivities([]);
        }
      }
    } catch (error) {
      console.error('Error loading entry data:', error);
      setEntry('');
      setMood(null);
      setActivities([]);
    }
  };
  
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="mr-2 text-teal-600 dark:text-teal-400">
              {mood?.emoji || '📝'}
            </span>
            {formatDisplayDate(date)}
          </DialogTitle>
          <DialogDescription>
            {mood ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                You were feeling <span className="font-medium">{mood.label}</span>
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        
        {/* Activities */}
        {activities && activities.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activities:</h3>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {activity}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Entry Content */}
        <div className="mt-2 whitespace-pre-wrap">
          {entry ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              {entry}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No journal entry for this date.
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryViewer;
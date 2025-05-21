import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from "@/components/ui/slider";

// Import journal components
import TodayEntry from "@/components/journal/TodayEntry";
import MoodTracker from "@/components/journal/MoodTracker";
import JournalTimeline from "@/components/journal/JournalTimeline";
import OnThisDay from "@/components/journal/OnThisDay";
import JournalSummary from "@/components/journal/JournalSummary";
import LinkedMoments from "@/components/journal/LinkedMoments";
import ActivityLog from "@/components/journal/ActivityLog";
import JournalCalendar from "@/components/journal/JournalCalendar";

// Interface for sleep data
interface SleepData {
  duration: number;
  quality: number;
  notes: string;
}

// Activity type with icon mapping
const activityTypes = [
  { value: 'exercise', label: 'Exercise', icon: '🏃‍♂️', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'meditation', label: 'Meditation', icon: '🧘', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
  { value: 'reading', label: 'Reading', icon: '📚', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  { value: 'learning', label: 'Learning', icon: '🧠', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100' },
  { value: 'social', label: 'Social', icon: '👥', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' },
  { value: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100' },
];

// Journal entry prompts to help users write more meaningful entries
const journalPrompts = [
  "What made you smile today?",
  "What challenged you today?",
  "What are you grateful for today?",
  "What did you learn today?",
  "What's one thing you'd like to improve tomorrow?",
  "How did you take care of yourself today?",
  "What was the highlight of your day?",
  "Did anything surprise you today?",
  "What was your biggest achievement today?",
  "What is something you're looking forward to?"
];

// Journal page component
export default function JournalPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewEntryButton, setShowNewEntryButton] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [journalContent, setJournalContent] = useState('');
  
  // Activity state
  const [selectedActivities, setSelectedActivities] = useState<{[key: string]: {
    duration: number;
    notes: string;
  }}>({});
  
  // Sleep tracking state
  const [sleepData, setSleepData] = useState<SleepData>({
    duration: 8, // Default 8 hours
    quality: 3,  // Default medium quality (scale 1-5)
    notes: ''
  });

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowNewEntryButton(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  // Set a random prompt when component mounts or date changes
  useEffect(() => {
    setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  }, [selectedDate]);

  // Load data for the current date
  useEffect(() => {
    if (isAuthenticated) {
      // Load journal entry, mood, activities, sleep data for selected date
      const loadJournalData = async () => {
        try {
          // Load journal entry
          const entryResponse = await fetch(`/api/journal/entries/${selectedDate}`);
          if (entryResponse.ok) {
            const entry = await entryResponse.json();
            setJournalContent(entry.content || '');
          } else {
            // Try to load from localStorage as fallback
            const savedEntry = localStorage.getItem(`journal_entry_${selectedDate}`);
            if (savedEntry) {
              const parsed = JSON.parse(savedEntry);
              setJournalContent(parsed.content || '');
            } else {
              setJournalContent('');
            }
          }
          
          // Load sleep data
          const sleepKey = `sleep_${selectedDate}`;
          const savedSleep = localStorage.getItem(sleepKey);
          if (savedSleep) {
            setSleepData(JSON.parse(savedSleep));
          } else {
            setSleepData({
              duration: 8,
              quality: 3,
              notes: ''
            });
          }
          
          // Load activities
          const activitiesResponse = await fetch(`/api/journal/activities/${selectedDate}`);
          if (activitiesResponse.ok) {
            const activities = await activitiesResponse.json();
            const activitiesMap: {[key: string]: {duration: number, notes: string}} = {};
            
            activities.forEach((activity: any) => {
              activitiesMap[activity.type] = {
                duration: activity.duration,
                notes: activity.notes || ''
              };
            });
            
            setSelectedActivities(activitiesMap);
          } else {
            // Try to load from localStorage as fallback
            setSelectedActivities({});
          }
        } catch (error) {
          console.error('Error loading journal data:', error);
        }
      };
      
      loadJournalData();
    }
  }, [isAuthenticated, selectedDate]);

  // Handle saving journal entry
  const handleSaveEntry = async () => {
    if (!journalContent.trim()) return;
    
    console.log("Saving entry:", journalContent);
    
    if (isAuthenticated) {
      try {
        // Save to database
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: selectedDate,
            content: journalContent
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save journal entry to database');
        }
        
        console.log('Journal entry saved to database successfully');
        
        // Save to localStorage as backup
        const entry = { 
          content: journalContent, 
          timestamp: new Date().toISOString() 
        };
        localStorage.setItem(`journal_entry_${selectedDate}`, JSON.stringify(entry));
        
      } catch (error) {
        console.error('Error saving journal entry to database:', error);
        
        // Save to localStorage as fallback
        const entry = { 
          content: journalContent, 
          timestamp: new Date().toISOString() 
        };
        localStorage.setItem(`journal_entry_${selectedDate}`, JSON.stringify(entry));
      }
    } else {
      // Save to localStorage if not authenticated
      const entry = { 
        content: journalContent, 
        timestamp: new Date().toISOString() 
      };
      localStorage.setItem(`journal_entry_${selectedDate}`, JSON.stringify(entry));
    }
  };

  // Handle saving mood
  const handleSaveMood = async (mood: { emoji: string; label: string; tags: string[] }) => {
    console.log("Saving mood:", mood);
    
    if (isAuthenticated) {
      try {
        // Save to database
        const response = await fetch('/api/journal/moods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: selectedDate,
            emoji: mood.emoji,
            label: mood.label,
            tags: mood.tags
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save mood to database');
        }
        
        console.log('Mood saved to database successfully');
      } catch (error) {
        console.error('Error saving mood to database:', error);
        // Continue with local storage as fallback
      }
    }
  };

  // Handle saving sleep data
  const handleSaveSleep = async () => {
    console.log("Saving sleep data:", sleepData);
    
    // Save to localStorage
    localStorage.setItem(`sleep_${selectedDate}`, JSON.stringify(sleepData));
    
    if (isAuthenticated) {
      try {
        // Save as an activity of type 'sleep'
        const response = await fetch('/api/journal/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: selectedDate,
            type: 'sleep',
            name: `Sleep: ${sleepData.duration} hours`,
            duration: sleepData.duration * 60, // Convert to minutes
            notes: `Quality: ${sleepData.quality}/5. ${sleepData.notes}`
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save sleep data to database');
        }
        
        console.log('Sleep data saved to database successfully');
      } catch (error) {
        console.error('Error saving sleep data to database:', error);
      }
    }
  };

  // Handle toggling an activity
  const handleToggleActivity = (activityType: string) => {
    setSelectedActivities(prev => {
      const newActivities = {...prev};
      
      if (newActivities[activityType]) {
        // Remove activity if it's already selected
        delete newActivities[activityType];
      } else {
        // Add activity with default values
        newActivities[activityType] = {
          duration: 30,
          notes: ''
        };
      }
      
      return newActivities;
    });
  };
  
  // Handle updating activity details
  const handleUpdateActivity = (
    activityType: string, 
    field: 'duration' | 'notes', 
    value: number | string
  ) => {
    setSelectedActivities(prev => {
      if (!prev[activityType]) return prev;
      
      return {
        ...prev,
        [activityType]: {
          ...prev[activityType],
          [field]: value
        }
      };
    });
  };
  
  // Handle saving all activities
  const handleSaveActivities = async () => {
    console.log("Saving activities:", selectedActivities);
    
    if (isAuthenticated) {
      try {
        // Save each activity to the database
        for (const [type, details] of Object.entries(selectedActivities)) {
          const activityType = activityTypes.find(t => t.value === type);
          if (!activityType) continue;
          
          await fetch('/api/journal/activities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              date: selectedDate,
              type,
              name: `${activityType.label}`,
              duration: details.duration,
              notes: details.notes
            })
          });
        }
        
        console.log('Activities saved to database successfully');
      } catch (error) {
        console.error('Error saving activities to database:', error);
      }
    }
  };

  // Handle selecting a date from the timeline or calendar
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    console.log("Selected date:", date);
    
    // On mobile, scroll to top
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Format the selected date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // If it's today
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    
    // If it's yesterday
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    
    // Otherwise, show full date
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };
  
  // Function to add a prompt to the journal content
  const addPromptToJournal = () => {
    const newContent = journalContent 
      ? `${journalContent}\n\n${currentPrompt}\n`
      : `${currentPrompt}\n`;
    
    setJournalContent(newContent);
    
    // Set a new random prompt
    const currentIndex = journalPrompts.indexOf(currentPrompt);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * journalPrompts.length);
    } while (newIndex === currentIndex && journalPrompts.length > 1);
    
    setCurrentPrompt(journalPrompts[newIndex]);
  };

  return (
    <DashboardLayout title="Journal">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Journal</h1>
            <div className="text-xl font-medium text-teal-600 dark:text-teal-400">
              {formatDisplayDate(selectedDate)}
            </div>
          </div>
        </div>
        
        {/* Main Journal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Previous Entries */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <JournalCalendar 
                  onSelectDate={handleSelectDate}
                  selectedDate={selectedDate}
                />
              </CardContent>
            </Card>
            
            <JournalTimeline onSelectDate={handleSelectDate} />
            
            <OnThisDay onViewEntry={handleSelectDate} />
          </div>
          
          {/* Middle Column - Today's Entry & Mood */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Tracker */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">How are you feeling today?</h2>
                <MoodTracker onSave={handleSaveMood} />
              </CardContent>
            </Card>
            
            {/* Activities Section */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Activities</h2>
                
                {/* Activity Type Selection */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleToggleActivity(type.value)}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all
                        ${selectedActivities[type.value] 
                          ? `ring-2 ring-teal-400 ${type.color}` 
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Activity Details Section */}
                {Object.keys(selectedActivities).length > 0 && (
                  <div className="space-y-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Details</h3>
                    
                    {Object.entries(selectedActivities).map(([type, details]) => {
                      const activityType = activityTypes.find(t => t.value === type);
                      if (!activityType) return null;
                      
                      return (
                        <div key={type} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">{activityType.icon}</span>
                            <span className="font-medium">{activityType.label}</span>
                          </div>
                          
                          {type === 'sleep' ? (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Sleep Duration: {sleepData.duration} hours</span>
                                </div>
                                <Slider 
                                  value={[sleepData.duration]} 
                                  min={1} 
                                  max={12} 
                                  step={0.5}
                                  onValueChange={(value) => 
                                    setSleepData(prev => ({...prev, duration: value[0]}))
                                  }
                                />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Sleep Quality: {sleepData.quality}/5</span>
                                </div>
                                <Slider 
                                  value={[sleepData.quality]} 
                                  min={1} 
                                  max={5} 
                                  step={1}
                                  onValueChange={(value) => 
                                    setSleepData(prev => ({...prev, quality: value[0]}))
                                  }
                                />
                              </div>
                              
                              <div>
                                <span className="text-sm">Notes:</span>
                                <Input
                                  value={sleepData.notes}
                                  onChange={(e) => 
                                    setSleepData(prev => ({...prev, notes: e.target.value}))
                                  }
                                  placeholder="Did you dream? Any disruptions?"
                                  className="mt-1"
                                />
                              </div>
                              
                              <Button 
                                size="sm" 
                                onClick={handleSaveSleep}
                                className="mt-2"
                              >
                                Save Sleep Data
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Duration: {details.duration} minutes</span>
                                </div>
                                <Slider 
                                  value={[details.duration]} 
                                  min={5} 
                                  max={180} 
                                  step={5}
                                  onValueChange={(value) => 
                                    handleUpdateActivity(type, 'duration', value[0])
                                  }
                                />
                              </div>
                              
                              <div>
                                <span className="text-sm">Notes:</span>
                                <Input
                                  value={details.notes}
                                  onChange={(e) => 
                                    handleUpdateActivity(type, 'notes', e.target.value)
                                  }
                                  placeholder={`Any details about your ${activityType.label.toLowerCase()} activity?`}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Save all activities button */}
                    {type !== 'sleep' && (
                      <Button onClick={handleSaveActivities} className="w-full mt-2">
                        Save All Activities
                      </Button>
                    )}
                  </div>
                )}
                
                {Object.keys(selectedActivities).length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p>Select activities you did today</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Journal Entry */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Journal Entry</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={addPromptToJournal}>
                      Add Prompt
                    </Button>
                    <Button size="sm" onClick={handleSaveEntry} disabled={!journalContent.trim()}>
                      Save Entry
                    </Button>
                  </div>
                </div>
                
                {/* Prompt */}
                <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 rounded-md p-3 mb-4">
                  <p className="text-teal-800 dark:text-teal-300 italic">{currentPrompt}</p>
                </div>
                
                {/* Journal Text Area */}
                <textarea
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Write your thoughts for today..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:text-white"
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LinkedMoments date={selectedDate} />
              <JournalSummary />
            </div>
          </div>
        </div>
        
        {/* Floating New Entry button (mobile only) */}
        {showNewEntryButton && (
          <button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center z-10 hover:bg-teal-600 transition-colors"
            aria-label="New Journal Entry"
            onClick={() => {
              // Scroll to the journal entry section
              document.querySelector('h2:contains("Journal Entry")')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
        
        {/* Voice-to-text button (future feature placeholder) */}
        <button
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-lg flex items-center justify-center z-10 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          aria-label="Voice to Text"
          onClick={() => {
            alert("Voice-to-text feature coming soon!");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
    </DashboardLayout>
  );
}
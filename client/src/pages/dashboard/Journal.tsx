import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import journal components
import TodayEntry from "@/components/journal/TodayEntry";
import MoodTracker from "@/components/journal/MoodTracker";
import JournalTimeline from "@/components/journal/JournalTimeline";
import OnThisDay from "@/components/journal/OnThisDay";
import JournalSummary from "@/components/journal/JournalSummary";
import LinkedMoments from "@/components/journal/LinkedMoments";
import ActivityLog from "@/components/journal/ActivityLog";
import JournalCalendar from "@/components/journal/JournalCalendar";

// Journal page component
export default function JournalPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewEntryButton, setShowNewEntryButton] = useState(false);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal', 'calendar', or 'activities'

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

  // Sync entries with database
  useEffect(() => {
    if (isAuthenticated) {
      // We could fetch initial data from the database here
      // but we'll just use localStorage for now and sync later
      // when components need them
    }
  }, [isAuthenticated]);

  // Handle saving journal entry
  const handleSaveEntry = async (entry: { content: string; timestamp: string }) => {
    console.log("Saving entry:", entry);
    
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
            content: entry.content
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save journal entry to database');
        }
        
        console.log('Journal entry saved to database successfully');
      } catch (error) {
        console.error('Error saving journal entry to database:', error);
        // Continue with local storage as fallback
      }
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

  // Handle adding activity
  const handleAddActivity = async (activity: any) => {
    console.log("Adding activity:", activity);
    
    if (isAuthenticated) {
      try {
        // Save to database
        const response = await fetch('/api/journal/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: selectedDate,
            type: activity.type,
            name: activity.name,
            duration: activity.duration,
            notes: activity.notes
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save activity to database');
        }
        
        console.log('Activity saved to database successfully');
      } catch (error) {
        console.error('Error saving activity to database:', error);
        // Continue with local storage as fallback
      }
    }
  };

  // Handle selecting a date from the timeline or calendar
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    console.log("Selected date:", date);
    
    // On mobile, scroll to top to view the selected date
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Main journal component rendering
  const renderJournalContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Left column - main journal content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Today's Entry */}
        <div className={isMobile ? "h-[300px]" : "h-[400px]"}>
          <TodayEntry onSave={handleSaveEntry} />
        </div>
        
        {/* Journal Timeline */}
        <JournalTimeline onSelectDate={handleSelectDate} />
        
        {/* Journal Summary on mobile only */}
        {isMobile && (
          <JournalSummary />
        )}
      </div>
      
      {/* Right column - mood & insights */}
      <div className="space-y-6">
        {/* Mood Tracker */}
        <MoodTracker onSave={handleSaveMood} />
        
        {/* Journal Summary on desktop only */}
        {!isMobile && (
          <JournalSummary />
        )}
        
        {/* On This Day */}
        <OnThisDay onViewEntry={handleSelectDate} />
        
        {/* Linked Moments */}
        <LinkedMoments date={selectedDate} />
      </div>
    </div>
  );

  // Calendar view component
  const renderCalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <JournalCalendar 
          onSelectDate={handleSelectDate} 
          selectedDate={selectedDate} 
        />
        
        <LinkedMoments date={selectedDate} />
      </div>
      
      <div className="space-y-6">
        <div className={isMobile ? "h-[300px]" : "h-[400px]"}>
          <TodayEntry onSave={handleSaveEntry} />
        </div>
        
        <MoodTracker onSave={handleSaveMood} />
      </div>
    </div>
  );

  // Activities view component
  const renderActivitiesView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <ActivityLog 
          date={selectedDate} 
          onAddActivity={handleAddActivity} 
        />
        
        <JournalCalendar 
          onSelectDate={handleSelectDate} 
          selectedDate={selectedDate} 
        />
      </div>
      
      <div className="space-y-6">
        <LinkedMoments date={selectedDate} />
        <JournalSummary />
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Journal">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Journal</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="journal">Journal</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'journal' && renderJournalContent()}
          {activeTab === 'calendar' && renderCalendarView()}
          {activeTab === 'activities' && renderActivitiesView()}
        </div>
        
        {/* Floating New Entry button (mobile only) */}
        {showNewEntryButton && (
          <button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center z-10 hover:bg-teal-600 transition-colors"
            aria-label="New Journal Entry"
            onClick={() => {
              // Scroll to the top where the entry component is
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
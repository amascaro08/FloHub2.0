import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Import journal components
import TodayEntry from "@/components/journal/TodayEntry";
import MoodTracker from "@/components/journal/MoodTracker";
import JournalTimeline from "@/components/journal/JournalTimeline";
import OnThisDay from "@/components/journal/OnThisDay";
import JournalSummary from "@/components/journal/JournalSummary";
import LinkedMoments from "@/components/journal/LinkedMoments";

// Journal page component
export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewEntryButton, setShowNewEntryButton] = useState(false);

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

  // Handle saving journal entry
  const handleSaveEntry = (entry: { content: string; timestamp: string }) => {
    console.log("Saving entry:", entry);
    // Storage is handled within the TodayEntry component itself
  };

  // Handle saving mood
  const handleSaveMood = (mood: { emoji: string; label: string; tags: string[] }) => {
    console.log("Saving mood:", mood);
    // Storage is handled within the MoodTracker component itself
  };

  // Handle selecting a date from the timeline
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    console.log("Selected date:", date);
    
    // On mobile, scroll to top to view the selected date
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout title="Journal">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Journal</h1>
        
        {/* Main content grid */}
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
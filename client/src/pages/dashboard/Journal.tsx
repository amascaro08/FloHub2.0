import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface JournalEntry {
  id: number;
  date: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
}

// Journal entry component for today
const TodayEntry = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | 'excited' | 'tired'>('neutral');

  const handleSave = () => {
    console.log('Saving entry:', { entry, mood });
    alert('Journal entry saved successfully!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Today's Journal</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling today?
        </label>
        <div className="flex space-x-4">
          <button 
            onClick={() => setMood('happy')} 
            className={`p-2 rounded-full ${mood === 'happy' ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'hover:bg-gray-100'}`}
          >
            😊
          </button>
          <button 
            onClick={() => setMood('sad')} 
            className={`p-2 rounded-full ${mood === 'sad' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
          >
            😢
          </button>
          <button 
            onClick={() => setMood('excited')} 
            className={`p-2 rounded-full ${mood === 'excited' ? 'bg-green-100 ring-2 ring-green-400' : 'hover:bg-gray-100'}`}
          >
            😃
          </button>
          <button 
            onClick={() => setMood('tired')} 
            className={`p-2 rounded-full ${mood === 'tired' ? 'bg-purple-100 ring-2 ring-purple-400' : 'hover:bg-gray-100'}`}
          >
            😴
          </button>
          <button 
            onClick={() => setMood('neutral')} 
            className={`p-2 rounded-full ${mood === 'neutral' ? 'bg-gray-200 ring-2 ring-gray-400' : 'hover:bg-gray-100'}`}
          >
            😐
          </button>
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your thoughts for today..."
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

// Timeline of past journal entries
const JournalTimeline = () => {
  // Mock data for demonstration
  const entries: JournalEntry[] = [
    { id: 3, date: 'May 19, 2025', content: 'Today was a productive day. I finished the project proposal and received positive feedback.', mood: 'happy' },
    { id: 2, date: 'May 18, 2025', content: 'Feeling a bit overwhelmed with all the tasks, but taking it one step at a time.', mood: 'tired' },
    { id: 1, date: 'May 17, 2025', content: 'Had a great brainstorming session with the team. Excited about the new project direction!', mood: 'excited' },
  ];

  // Get mood emoji based on mood type
  const getMoodEmoji = (mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired') => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😢';
      case 'excited': return '😃';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Journal Timeline</h2>
      
      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="border-l-2 border-teal-500 pl-4 ml-2">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">{getMoodEmoji(entry.mood)}</span>
              <span className="text-sm font-medium text-gray-700">{entry.date}</span>
            </div>
            <p className="text-sm text-gray-600">{entry.content}</p>
          </div>
        ))}

        <button className="mt-2 text-teal-600 hover:text-teal-800 text-sm flex items-center">
          View more entries
        </button>
      </div>
    </div>
  );
};

// Journal insights component
const JournalSummary = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Journal Insights</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Mood Trends</h3>
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div className="bg-yellow-400 h-full" style={{ width: '40%' }}></div>
              <div className="bg-green-400 h-full" style={{ width: '25%' }}></div>
              <div className="bg-purple-400 h-full" style={{ width: '20%' }}></div>
              <div className="bg-blue-400 h-full" style={{ width: '10%' }}></div>
              <div className="bg-gray-400 h-full" style={{ width: '5%' }}></div>
            </div>
          </div>
          <div className="flex text-xs mt-2 justify-between">
            <span>😊 40%</span>
            <span>😃 25%</span>
            <span>😴 20%</span>
            <span>😢 10%</span>
            <span>😐 5%</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Common Themes</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Work</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Family</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Projects</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Health</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Learning</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Writing Streak</h3>
          <div className="flex items-center">
            <div className="text-xl font-bold text-teal-600 mr-2">15</div>
            <div className="text-sm text-gray-600">days in a row</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Journal Entry for a specific date in history
const OnThisDay = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 mb-4">On This Day</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">1 year ago</span>
            <span className="text-sm text-gray-600 ml-2">May 20, 2024</span>
          </div>
          <p className="text-sm text-gray-600">
            "Started working on the new app idea today. I'm really excited about the potential impact it could have!"
          </p>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">2 years ago</span>
            <span className="text-sm text-gray-600 ml-2">May 20, 2023</span>
          </div>
          <p className="text-sm text-gray-600">
            "Had a great family dinner tonight. It's important to take time off work and enjoy these moments."
          </p>
        </div>
      </div>
    </div>
  );
};

// Journal page component
export default function JournalPage() {
  return (
    <DashboardLayout title="Journal">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main journal area - takes up 2 columns on medium screens */}
          <div className="md:col-span-2 space-y-6">
            <TodayEntry />
            <JournalTimeline />
          </div>
          
          {/* Sidebar - takes up 1 column */}
          <div className="space-y-6">
            <JournalSummary />
            <OnThisDay />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import React, { useState, useEffect } from 'react';

interface Mood {
  emoji: string;
  label: string;
  tags: string[];
}

interface MoodOption {
  emoji: string;
  label: string;
  color: string;
  activeColor: string;
}

interface MoodTrackerProps {
  onSave: (mood: Mood) => void;
}

const moodOptions: MoodOption[] = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100', activeColor: 'ring-yellow-400' },
  { emoji: '😃', label: 'Excited', color: 'bg-green-100', activeColor: 'ring-green-400' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100', activeColor: 'ring-blue-400' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-200', activeColor: 'ring-gray-400' },
  { emoji: '😔', label: 'Sad', color: 'bg-indigo-100', activeColor: 'ring-indigo-400' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-100', activeColor: 'ring-red-400' },
  { emoji: '😴', label: 'Tired', color: 'bg-purple-100', activeColor: 'ring-purple-400' },
  { emoji: '😨', label: 'Anxious', color: 'bg-orange-100', activeColor: 'ring-orange-400' },
];

// Common mood tags that users can quickly select
const commonTags = [
  'Work', 'Family', 'Friends', 'Exercise', 'Food', 'Travel', 
  'Music', 'Reading', 'Movies', 'Gaming', 'Study', 'Weather',
  'Shopping', 'Health', 'Productive', 'Unproductive', 'Creative'
];

export default function MoodTracker({ onSave }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Load saved mood from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedMood = localStorage.getItem(`mood_${today}`);
    
    if (savedMood) {
      try {
        const parsed = JSON.parse(savedMood);
        
        // Find the corresponding mood option
        const moodOption = moodOptions.find(m => m.label === parsed.label);
        if (moodOption) {
          setSelectedMood(moodOption);
        }
        
        // Set the tags
        if (Array.isArray(parsed.tags)) {
          setSelectedTags(parsed.tags);
        }
        
        // Set last saved timestamp
        if (parsed.timestamp) {
          setLastSaved(new Date(parsed.timestamp));
        }
      } catch (e) {
        console.error('Error parsing saved mood', e);
      }
    }
  }, []);
  
  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
  };
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };
  
  const handleSave = () => {
    if (!selectedMood) return;
    
    setIsSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      
      const mood: Mood = {
        emoji: selectedMood.emoji,
        label: selectedMood.label,
        tags: selectedTags,
      };
      
      // Save to localStorage with timestamp
      localStorage.setItem(`mood_${today}`, JSON.stringify({
        ...mood,
        timestamp
      }));
      
      // Call the onSave prop
      onSave(mood);
      
      // Update last saved timestamp
      setLastSaved(new Date());
    } catch (e) {
      console.error('Error saving mood', e);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">How are you feeling today?</h2>
        {lastSaved && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      {/* Mood Selection */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {moodOptions.map(mood => (
          <button
            key={mood.label}
            onClick={() => handleMoodSelect(mood)}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${mood.color} 
              ${selectedMood?.label === mood.label ? `ring-2 ${mood.activeColor}` : 'hover:ring-1 hover:ring-gray-300'}`}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tags Section - only show if mood is selected */}
      {selectedMood && (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's making you feel {selectedMood.label.toLowerCase()}?
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex mt-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-l-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
                className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Mood'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
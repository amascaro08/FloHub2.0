import React, { useState, useEffect } from 'react';

interface TodayEntryProps {
  onSave: (entry: { content: string; timestamp: string }) => void;
}

export default function TodayEntry({ onSave }: TodayEntryProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedContent, setSavedContent] = useState('');

  // Load the entry from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedEntry = localStorage.getItem(`journal_entry_${today}`);
    
    if (savedEntry) {
      try {
        const parsed = JSON.parse(savedEntry);
        setContent(parsed.content || '');
        setSavedContent(parsed.content || '');
        setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
      } catch (e) {
        console.error('Error parsing saved journal entry', e);
      }
    }
  }, []);

  // Auto-save entry when content changes after a delay
  useEffect(() => {
    if (content === savedContent) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [content, savedContent]);

  const handleSave = () => {
    if (!content.trim()) return;
    if (content === savedContent) return;
    
    setIsSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      const entry = { content, timestamp };
      
      // Save to localStorage
      localStorage.setItem(`journal_entry_${today}`, JSON.stringify(entry));
      
      // Call the onSave prop
      onSave(entry);
      
      // Update state
      setLastSaved(new Date());
      setSavedContent(content);
    } catch (e) {
      console.error('Error saving journal entry', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">Today's Journal</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts for today..."
        className="flex-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white resize-none"
      />
      
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isSaving || content === savedContent || !content.trim()}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 
            ${isSaving || content === savedContent || !content.trim() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-teal-600 text-white hover:bg-teal-700'}`}
        >
          {isSaving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}
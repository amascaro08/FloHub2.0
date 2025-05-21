import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'exercise' | 'meditation' | 'reading' | 'learning' | 'creative' | 'social' | 'custom';
  name: string;
  duration: number; // in minutes
  timestamp: string;
  notes?: string;
}

interface ActivityLogProps {
  date: string;
  onAddActivity?: (activity: Activity) => void;
}

const activityTypes = [
  { value: 'exercise', label: 'Exercise', icon: '🏃‍♂️', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'meditation', label: 'Meditation', icon: '🧘', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
  { value: 'reading', label: 'Reading', icon: '📚', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  { value: 'learning', label: 'Learning', icon: '🧠', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100' },
  { value: 'social', label: 'Social', icon: '👥', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' },
  { value: 'custom', label: 'Other', icon: '✨', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
];

export default function ActivityLog({ date, onAddActivity }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'exercise',
    name: '',
    duration: 30,
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load activities for the given date from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const activitiesKey = `activities_${date}`;
      const savedActivities = localStorage.getItem(activitiesKey);
      
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      } else {
        setActivities([]);
      }
    } catch (e) {
      console.error('Error loading activities', e);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      const activitiesKey = `activities_${date}`;
      localStorage.setItem(activitiesKey, JSON.stringify(activities));
    }
  }, [activities, date]);

  const handleAddActivity = () => {
    if (!newActivity.name || !newActivity.type) return;
    
    const activity: Activity = {
      id: Date.now().toString(),
      type: newActivity.type as Activity['type'],
      name: newActivity.name,
      duration: newActivity.duration || 0,
      timestamp: new Date().toISOString(),
      notes: newActivity.notes,
    };
    
    setActivities(prev => [...prev, activity]);
    setShowAddForm(false);
    setNewActivity({
      type: 'exercise',
      name: '',
      duration: 30,
      notes: '',
    });
    
    if (onAddActivity) {
      onAddActivity(activity);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewActivity({
      type: 'exercise',
      name: '',
      duration: 30,
      notes: '',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };

  const getActivityTypeInfo = (type: string) => {
    return activityTypes.find(t => t.value === type) || activityTypes[6]; // Default to 'custom'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">Activities</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-teal-600 dark:text-teal-400 text-sm hover:text-teal-800 dark:hover:text-teal-300 flex items-center"
          >
            <span className="mr-1">+</span> Add Activity
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        <div>
          {showAddForm ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Activity Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {activityTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewActivity(prev => ({ ...prev, type: type.value as Activity['type'] }))}
                        className={`p-2 rounded flex flex-col items-center justify-center transition-all
                          ${newActivity.type === type.value 
                            ? `ring-2 ring-teal-400 ${type.color}`
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                      >
                        <span className="text-xl mb-1">{type.icon}</span>
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="activity-name" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Activity Name
                  </label>
                  <input
                    id="activity-name"
                    type="text"
                    value={newActivity.name}
                    onChange={e => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="What did you do?"
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="activity-duration" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    id="activity-duration"
                    type="number"
                    min="1"
                    value={newActivity.duration}
                    onChange={e => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="activity-notes" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="activity-notes"
                    value={newActivity.notes}
                    onChange={e => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any details to add..."
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:text-white h-20"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelAdd}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddActivity}
                    disabled={!newActivity.name}
                    className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    Save Activity
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          
          {activities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No activities logged for this day.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add activities to track how you spend your time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => {
                const typeInfo = getActivityTypeInfo(activity.type);
                return (
                  <div key={activity.id} className="flex items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className={`flex-shrink-0 w-10 h-10 ${typeInfo.color} rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-xl">{typeInfo.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">{activity.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDuration(activity.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{typeInfo.label}</p>
                      {activity.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                          "{activity.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
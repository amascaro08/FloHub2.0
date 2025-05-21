import React, { useState, useEffect } from 'react';

interface LinkedMomentsProps {
  date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
}

interface Task {
  id: number;
  text: string;
  dueDate?: string;
  done: boolean;
}

export default function LinkedMoments({ date }: LinkedMomentsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events and tasks for the selected date
  useEffect(() => {
    const fetchLinkedData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch calendar events (simulated)
        // In a real implementation, this would call your API
        const dateString = new Date(date).toISOString().split('T')[0];
        
        // Try to get calendar events from localStorage or simulate some
        let foundEvents: CalendarEvent[] = [];
        try {
          const storedEvents = localStorage.getItem('calendar_events');
          if (storedEvents) {
            const allEvents = JSON.parse(storedEvents);
            foundEvents = allEvents.filter((event: any) => 
              event.date && event.date.startsWith(dateString)
            );
          }
        } catch (e) {
          console.error('Error loading calendar events', e);
        }
        
        // If no events found, create placeholder
        if (foundEvents.length === 0) {
          // Just leaving array empty instead of using placeholders
        }
        
        setEvents(foundEvents);
        
        // Try to fetch tasks from the API
        try {
          const response = await fetch('/api/tasks');
          if (response.ok) {
            const allTasks = await response.json();
            // Filter tasks for the selected date
            const dateTasks = allTasks.filter((task: Task) => 
              task.dueDate && task.dueDate.split('T')[0] === dateString
            );
            setTasks(dateTasks);
          } else {
            setTasks([]);
          }
        } catch (e) {
          console.error('Error fetching tasks', e);
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching linked moments data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (date) {
      fetchLinkedData();
    }
  }, [date]);

  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Moments from {formatDate(date)}</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Moments from {formatDate(date)}</h2>
      
      {events.length === 0 && tasks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">No events or tasks found for this date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calendar Events */}
          {events.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events</h3>
              <ul className="space-y-2">
                {events.map(event => (
                  <li key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1 mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{event.title}</p>
                      {event.time && <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Tasks */}
          {tasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h3>
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-start">
                    <div className={`flex-shrink-0 h-4 w-4 rounded-full mt-1 mr-2 ${task.done ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <div>
                      <p className={`text-sm ${task.done ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {task.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
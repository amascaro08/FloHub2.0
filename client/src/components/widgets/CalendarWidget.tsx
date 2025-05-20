import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface CalendarWidgetProps {
  userId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ userId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In the real app, this would fetch from API
    // For now, we'll use mock data to match the GitHub repo
    const fetchEvents = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // These are the exact events from the GitHub repo
        const mockEvents = [
          { 
            id: '1', 
            title: 'Team Standup', 
            start: '09:00', 
            end: '09:30', 
            location: 'Google Meet' 
          },
          { 
            id: '2', 
            title: 'Product Demo', 
            start: '11:00', 
            end: '12:00', 
            location: 'Conference Room A' 
          },
          { 
            id: '3', 
            title: 'UX Review', 
            start: '14:00', 
            end: '15:30', 
            location: 'Zoom Call' 
          }
        ];
        
        setEvents(mockEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Could not load calendar events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [userId]);
  
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3">
        <h3 className="text-white font-medium text-sm">Today's Schedule</h3>
      </div>
      
      <div className="p-4">
        <div className="mb-3 text-sm font-medium text-gray-600">{today}</div>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-t-teal-500 border-teal-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500">{error}</p>
            <button className="mt-2 text-xs text-teal-600 hover:text-teal-800">
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No events scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="border-l-2 border-teal-500 pl-3 py-1">
                <p className="text-sm font-medium text-gray-900">
                  {event.start} - {event.title}
                </p>
                <p className="text-xs text-gray-500">{event.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
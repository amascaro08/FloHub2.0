import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isSameMonth, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarEvent {
  id: string;
  calendarId?: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  source?: "personal" | "work";
  description?: string;
  htmlDescription?: string; // For storing the original HTML description
  calendarName?: string;
  tags?: string[];
}

// Local storage key for calendar sources
const LOCAL_STORAGE_KEY = 'floHub_calendarSources';

const SimpleCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsDialogOpen, setIsEventDetailsDialogOpen] = useState(false);
  const [filteredSources, setFilteredSources] = useState<number[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Get calendar sources from localStorage
  const [calendarSources, setCalendarSources] = useState<any[]>(() => {
    // Initialize from localStorage if available
    const savedSources = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSources) {
      try {
        return JSON.parse(savedSources);
      } catch (e) {
        console.error('Error parsing saved calendar sources:', e);
      }
    }
    
    // Default sources if nothing in localStorage
    return [
      {
        id: 1,
        name: 'Work',
        type: 'url',
        sourceId: 'https://prod-41.australiasoutheast.logic.azure.com:443/workflows/bdb98e26fe364c62a86fd92e48f6551d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CL0eUhcsx5WksUi2AYu-5Qgzo6MnLDDYT_X5v3KG960',
        isEnabled: true,
        tags: []
      },
      {
        id: 2, 
        name: 'Optus',
        type: 'url',
        sourceId: 'https://prod-41.australiasoutheast.logic.azure.com:443/workflows/bdb98e26fe364c62a86fd92e48f6551d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CL0eUhcsx5WksUi2AYu-5Qgzo6MnLDDYT_X5v3KG960',
        isEnabled: true,
        tags: []
      }
    ];
  });
  
  // Store event tags in localStorage
  const EVENT_TAGS_STORAGE_KEY = 'floHub_eventTags';
  
  // Get event tags from localStorage
  const [eventTags, setEventTags] = useState<Record<string, string[]>>(() => {
    const savedTags = localStorage.getItem(EVENT_TAGS_STORAGE_KEY);
    if (savedTags) {
      try {
        return JSON.parse(savedTags);
      } catch (e) {
        console.error("Error parsing event tags from localStorage:", e);
        return {};
      }
    }
    return {};
  });
  
  // Save event tags to localStorage when they change
  useEffect(() => {
    localStorage.setItem(EVENT_TAGS_STORAGE_KEY, JSON.stringify(eventTags));
  }, [eventTags]);
  
  // Add a tag to an event
  const addTagToEvent = (eventId: string, tag: string) => {
    setEventTags(prevTags => {
      const updatedTags = { ...prevTags };
      if (!updatedTags[eventId]) {
        updatedTags[eventId] = [];
      }
      if (!updatedTags[eventId].includes(tag)) {
        updatedTags[eventId] = [...updatedTags[eventId], tag];
      }
      return updatedTags;
    });
  };
  
  // Remove a tag from an event
  const removeTagFromEvent = (eventId: string, tag: string) => {
    setEventTags(prevTags => {
      const updatedTags = { ...prevTags };
      if (updatedTags[eventId]) {
        updatedTags[eventId] = updatedTags[eventId].filter(t => t !== tag);
      }
      return updatedTags;
    });
  };

  // Stay in sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedSources = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (updatedSources) {
        try {
          setCalendarSources(JSON.parse(updatedSources));
        } catch (e) {
          console.error('Error parsing updated calendar sources:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch calendar events for the current month
  const month = startOfMonth(currentDate);
  const timeMin = month.toISOString();
  const timeMax = endOfMonth(month).toISOString();

  // Function to directly fetch events from a PowerAutomate URL
  const fetchPowerAutomateEvents = async (url: string): Promise<CalendarEvent[]> => {
    try {
      // Some URLs need slightly different parameters
      const formattedUrl = url.includes('?') 
        ? `${url}&timeMin=${timeMin}&timeMax=${timeMax}` 
        : `${url}?timeMin=${timeMin}&timeMax=${timeMax}`;
        
      const response = await fetch(formattedUrl);
      if (!response.ok) {
        console.error('Error fetching events from Power Automate URL:', response.statusText);
        return [];
      }
      
      const data = await response.json();
      
      // Different APIs might return data in slightly different formats
      // Try to handle a few common ones
      let events = data;
      
      // If the API returns a nested structure, try to find the events
      if (data.value && Array.isArray(data.value)) {
        events = data.value;
      } else if (data.items && Array.isArray(data.items)) {
        events = data.items;
      } else if (data.events && Array.isArray(data.events)) {
        events = data.events;
      }
      
      // Process events if needed and return
      return events.map((event: any, index: number) => {
        // Clean up HTML in description
        let cleanDescription = '';
        if (event.description || event.body) {
          const rawDescription = event.description || event.body;
          // Extract useful information from HTML if present
          if (rawDescription.includes('<div') || rawDescription.includes('<span')) {
            // Extract meeting ID
            const meetingIdMatch = rawDescription.match(/Meeting ID:?\s*([0-9\s]+)/i);
            const meetingId = meetingIdMatch ? meetingIdMatch[1].trim() : '';
            
            // Extract passcode
            const passcodeMatch = rawDescription.match(/Pass(?:code|word):?\s*([a-zA-Z0-9]+)/i);
            const passcode = passcodeMatch ? passcodeMatch[1].trim() : '';
            
            // Extract Teams link
            const teamsLinkMatch = rawDescription.match(/href="(https:\/\/(?:aka\.ms\/JoinTeamsMeeting|teams\.microsoft\.com\/[^"]+))"/i);
            const teamsLink = teamsLinkMatch ? teamsLinkMatch[1] : '';
            
            // Build a cleaner description with the extracted information
            cleanDescription = 'Microsoft Teams Meeting\n';
            if (teamsLink) {
              cleanDescription += `Join link: ${teamsLink}\n`;
            }
            if (meetingId) {
              cleanDescription += `Meeting ID: ${meetingId}\n`;
            }
            if (passcode) {
              cleanDescription += `Passcode: ${passcode}`;
            }
          } else {
            cleanDescription = rawDescription;
          }
        }
        
        // Convert from startTime/endTime format to start/end format if needed
        if (event.startTime && event.endTime) {
          console.log('Converting startTime/endTime format to start/end format');
          return {
            id: event.id || `event-${Date.now()}-${index}`,
            summary: event.subject || event.title || event.name || 'Untitled Event',
            start: { dateTime: event.startTime },
            end: { dateTime: event.endTime },
            description: cleanDescription,
            calendarName: event.calendar || event.calendarName || 'Work',
            source: 'work',
            htmlDescription: event.description || event.body || '',
          };
        } 
        // Handle Google Calendar API format
        else if (event.start && event.end) {
          return {
            id: event.id || `event-${Date.now()}-${index}`,
            summary: event.summary || event.title || 'Untitled Event',
            start: event.start,
            end: event.end,
            description: cleanDescription,
            calendarName: event.calendarName || 'Calendar',
            source: event.source || 'work',
            htmlDescription: event.description || event.body || '',
          };
        }
        // Default case - just return with minimal transformation
        else {
          return {
            id: event.id || `event-${Date.now()}-${index}`,
            summary: event.summary || event.subject || event.title || 'Untitled Event',
            start: { 
              dateTime: event.start?.dateTime || event.startDate || event.start || new Date().toISOString() 
            },
            end: { 
              dateTime: event.end?.dateTime || event.endDate || event.end || new Date().toISOString() 
            },
            description: cleanDescription,
            calendarName: event.calendarName || 'Calendar',
            source: event.source || 'work',
            htmlDescription: event.description || event.body || '',
          };
        }
      });
    } catch (error) {
      console.error('Error fetching Power Automate events:', error);
      return [];
    }
  };

  // Fetch events from API and from Power Automate URLs
  const { data: apiEvents = [], isLoading: isLoadingApiEvents } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events', { timeMin, timeMax }],
    retry: 1
  });

  // Fetch events from enabled calendar sources (Power Automate URLs)
  const { data: powerAutomateEvents = [], isLoading: isLoadingPAEvents } = useQuery<CalendarEvent[]>({
    queryKey: ['powerAutomateEvents', { timeMin, timeMax, sources: calendarSources }],
    queryFn: async () => {
      // Only fetch from enabled sources
      const enabledSources = calendarSources.filter(source => source.isEnabled);
      
      if (enabledSources.length === 0) {
        return [];
      }
      
      // Fetch events from each source in parallel
      const allEventPromises = enabledSources.map(async source => {
        const sourceEvents = await fetchPowerAutomateEvents(source.sourceId);
        // Add calendar name to each event
        return sourceEvents.map(event => ({
          ...event,
          calendarName: source.name,
          calendarId: String(source.id)
        }));
      });
      
      const allEventsArrays = await Promise.all(allEventPromises);
      // Flatten arrays of events into a single array
      return allEventsArrays.flat();
    },
    enabled: calendarSources.some(source => source.isEnabled)
  });

  // Combine events from all sources
  const events = [...(apiEvents || []), ...(powerAutomateEvents || [])];
  const isLoadingEvents = isLoadingApiEvents || isLoadingPAEvents;

  // When sources load, initialize filtered sources
  useEffect(() => {
    // Get IDs of enabled sources
    const enabledSources = calendarSources
      .filter(source => source.isEnabled)
      .map(source => source.id);
    
    setFilteredSources(enabledSources);
  }, [calendarSources]);

  // Toggle calendar source filter
  const toggleCalendarSource = (sourceId: number) => {
    setFilteredSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  // Toggle calendar source enabled/disabled state
  const toggleCalendarEnabled = (id: number, isEnabled: boolean) => {
    // Update in localStorage
    const updatedSources = calendarSources.map(source => {
      if (source.id === id) {
        return { ...source, isEnabled };
      }
      return source;
    });
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSources));
    setCalendarSources(updatedSources);
    
    // Update filtered sources
    if (!isEnabled && filteredSources.includes(id)) {
      setFilteredSources(prev => prev.filter(sourceId => sourceId !== id));
    } else if (isEnabled && !filteredSources.includes(id)) {
      setFilteredSources(prev => [...prev, id]);
    }
  };

  // Filter events based on selected calendar sources
  const filteredEvents = events?.filter(event => {
    // If no filters are selected, show all events
    if (filteredSources.length === 0) return true;
    
    // Find the matching calendar source based on event properties
    // This is a simplified version that assumes all events belong to calendar ID 1 or 2
    const eventSourceId = event.calendarId === '1' ? 1 : 2;
    
    // Include the event if its source is in the filtered sources list
    return filteredSources.includes(eventSourceId);
  });

  // Group events by date for easier rendering
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  
  filteredEvents?.forEach(event => {
    const eventDate = event.start.dateTime 
      ? format(parseISO(event.start.dateTime), 'yyyy-MM-dd')
      : event.start.date;
    
    if (eventDate) {
      if (!eventsByDate[eventDate]) {
        eventsByDate[eventDate] = [];
      }
      eventsByDate[eventDate].push(event);
    }
  });

  // Navigation functions
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate days for the current month view
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });



  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsDialogOpen(true);
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="h-8"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <CardDescription className="font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </CardDescription>
          <div className="flex space-x-1 text-xs">
            <Button 
              variant={view === 'today' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('today')}
              className="h-7 text-xs"
            >
              Today
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('week')}
              className="h-7 text-xs"
            >
              Week
            </Button>
            <Button 
              variant={view === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setView('month')}
              className="h-7 text-xs"
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto pb-0">
        {/* Calendar source filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {calendarSources
            .filter(source => source.isEnabled)
            .map(source => (
              <Badge 
                key={source.id} 
                variant={filteredSources.includes(source.id) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleCalendarSource(source.id)}
              >
                {source.name}
              </Badge>
            ))
          }
        </div>
        
        {/* Calendar settings */}
        <div className="mb-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2">Calendar Settings</summary>
            <div className="space-y-2 pl-2">
              {calendarSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <span>{source.name}</span>
                  <Switch 
                    checked={source.isEnabled} 
                    onCheckedChange={(checked) => toggleCalendarEnabled(source.id, checked)}
                  />
                </div>
              ))}
            </div>
          </details>
        </div>
        
        {/* Month View */}
        {view === 'month' && (
          isLoadingEvents ? (
            <div className="space-y-2">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-medium py-1">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={day.toString()}
                    className={`
                      min-h-[80px] p-1 border relative
                      ${isCurrentMonth ? '' : 'opacity-40'}
                      ${isCurrentDay ? 'bg-primary-50 border-primary' : ''}
                    `}
                  >
                    <div className={`
                      text-xs font-medium h-5 w-5 rounded-full flex items-center justify-center
                      ${isCurrentDay ? 'bg-primary text-primary-foreground' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto text-left">
                      {dayEvents.length > 0 ? (
                        dayEvents.map((event) => (
                          <TooltipProvider key={event.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`
                                    text-xs truncate rounded px-1 py-0.5 cursor-pointer
                                    ${event.source === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                                  `}
                                  onClick={() => handleEventClick(event)}
                                >
                                  {event.start.dateTime && (
                                    <span className="font-medium">
                                      {format(parseISO(event.start.dateTime), 'HH:mm')} {' '}
                                    </span>
                                  )}
                                  {event.summary}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs">
                                  <p className="font-bold">{event.summary}</p>
                                  {event.start.dateTime && event.end?.dateTime && (
                                    <p>
                                      {format(parseISO(event.start.dateTime), 'MMM d, HH:mm')} - {' '}
                                      {format(parseISO(event.end.dateTime), 'HH:mm')}
                                    </p>
                                  )}
                                  {event.calendarName && (
                                    <p className="text-muted-foreground">{event.calendarName}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))
                      ) : (
                        <div className="h-1"></div> // Empty placeholder to maintain height
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        
        {/* Week View */}
        {view === 'week' && (
          <div className="space-y-2">
            <div className="grid grid-cols-7 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - date.getDay() + index);
                return (
                  <div key={day} className="text-xs font-medium p-2">
                    <div>{day}</div>
                    <div className={`
                      h-6 w-6 rounded-full mx-auto flex items-center justify-center text-center
                      ${isToday(date) ? 'bg-primary text-primary-foreground' : ''}
                    `}>
                      {format(date, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-1 mt-2">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                // Get the date for this day in the week
                const currentWeekDay = new Date(currentDate);
                currentWeekDay.setDate(currentWeekDay.getDate() - currentWeekDay.getDay() + dayIndex);
                const dateKey = format(currentWeekDay, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                
                if (dayEvents.length === 0) return null;
                
                return (
                  <div key={dateKey} className="border-t pt-2">
                    <div className="font-medium text-xs mb-1">
                      {format(currentWeekDay, 'EEEE, MMM d')}
                    </div>
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`
                          p-2 mb-1 rounded-md cursor-pointer text-sm
                          ${event.source === 'work' ? 'bg-blue-50' : 'bg-green-50'}
                        `}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{event.summary}</div>
                          {event.start.dateTime && (
                            <div className="text-xs">
                              {format(parseISO(event.start.dateTime), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}
        
        {/* Today View */}
        {view === 'today' && (
          <div className="space-y-4">
            <div className="font-medium text-center">
              {format(new Date(), 'EEEE, MMMM d')}
            </div>
            
            {(() => {
              const today = new Date();
              const dateKey = format(today, 'yyyy-MM-dd');
              const todayEvents = eventsByDate[dateKey] || [];
              
              return todayEvents.length > 0 ? (
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`
                        p-3 rounded-md cursor-pointer border-l-4
                        ${event.source === 'work' ? 'bg-blue-50 border-blue-400' : 'bg-green-50 border-green-400'}
                      `}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium mb-1">{event.summary}</div>
                      {event.start.dateTime && event.end?.dateTime && (
                        <div className="text-xs text-gray-600">
                          {format(parseISO(event.start.dateTime), 'HH:mm')} - {format(parseISO(event.end.dateTime), 'HH:mm')}
                        </div>
                      )}
                      {event.calendarName && (
                        <div className="text-xs mt-1 flex justify-between">
                          <span>{event.calendarName}</span>
                        </div>
                      )}
                      
                      {/* Display Teams meeting info if present */}
                      {event.description && (event.description.includes('Microsoft Teams') || event.description.includes('Join link')) && (
                        <div className="mt-2">
                          {/* Extract and use teams meeting URL if present */}
                          {(event.description.match(/(https:\/\/[^\s"'<>]+)/i) || 
                           event.description.includes('Join link:') && event.description.match(/Join link: (https:\/\/[^\s\n]+)/)) && (
                            <a 
                              href={
                                event.description.includes('Join link:') 
                                  ? event.description.match(/Join link: (https:\/\/[^\s\n]+)/)?.[1] 
                                  : event.description.match(/(https:\/\/[^\s"'<>]+)/i)?.[1] || '#'
                              }
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-xs inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                            >
                              <span className="mr-1">Join Teams Meeting</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM9.18 18.12C8.3 18.12 7.55 17.62 7.2 16.85H7.14L7.09 18H5.83V6H7.3V10.7H7.34C7.66 9.95 8.39 9.42 9.33 9.42C11.13 9.42 12.18 11 12.18 13.79C12.18 16.59 11.12 18.12 9.18 18.12ZM16.76 18.12C14.48 18.12 13.19 16.45 13.19 13.8C13.19 11.3 14.48 9.42 16.76 9.42C19.04 9.42 20.34 11.3 20.34 13.8C20.34 16.45 19.05 18.12 16.76 18.12Z" fill="currentColor"/>
                                <path d="M16.75 10.82C15.77 10.82 15.11 11.99 15.11 13.8C15.11 15.61 15.77 16.72 16.75 16.72C17.76 16.72 18.4 15.61 18.4 13.8C18.4 11.99 17.75 10.82 16.75 10.82Z" fill="currentColor"/>
                                <path d="M9.11 10.82C8.21 10.82 7.43 11.82 7.43 13.76C7.43 15.7 8.21 16.72 9.11 16.72C10.04 16.72 10.71 15.7 10.71 13.76C10.71 11.82 10.04 10.82 9.11 10.82Z" fill="currentColor"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Extract and display meeting details if available */}
                      {event.description && (
                        event.description.includes('Meeting ID:') || 
                        event.description.includes('Passcode:')
                      ) && (
                        <div className="mt-1 space-y-1">
                          {event.description.match(/Meeting ID:?\s*([0-9\s]+)/i) && (
                            <div className="text-xs">
                              <span className="font-medium">Meeting ID:</span> {
                                event.description.match(/Meeting ID:?\s*([0-9\s]+)/i)?.[1]?.trim() || ''
                              }
                            </div>
                          )}
                          {event.description.match(/Pass(?:code|word):?\s*([a-zA-Z0-9]+)/i) && (
                            <div className="text-xs">
                              <span className="font-medium">Passcode:</span> {
                                event.description.match(/Pass(?:code|word):?\s*([a-zA-Z0-9]+)/i)?.[1]?.trim() || ''
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No events scheduled for today</p>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div>
          {filteredEvents && (
            <span className="text-xs text-muted-foreground">
              {filteredEvents.length} events this month
            </span>
          )}
        </div>
      </CardFooter>
      
      {/* Event Details Dialog */}
      <Dialog 
        open={isEventDetailsDialogOpen} 
        onOpenChange={setIsEventDetailsDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.summary}</DialogTitle>
                {selectedEvent.calendarName && (
                  <DialogDescription>
                    Calendar: {selectedEvent.calendarName}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <p className="font-medium text-sm">When</p>
                  <p>
                    {selectedEvent.start.dateTime && selectedEvent.end?.dateTime ? (
                      <>
                        {format(parseISO(selectedEvent.start.dateTime), 'MMMM d, yyyy HH:mm')} - {' '}
                        {format(parseISO(selectedEvent.end.dateTime), 'HH:mm')}
                      </>
                    ) : selectedEvent.start.date && selectedEvent.end?.date ? (
                      <>
                        {format(parseISO(selectedEvent.start.date), 'MMMM d, yyyy')} - {' '}
                        {format(parseISO(selectedEvent.end.date), 'MMMM d, yyyy')}
                      </>
                    ) : (
                      'Time not specified'
                    )}
                  </p>
                </div>
                
                {/* Organizer and Attendee Information */}
                {selectedEvent.description && (
                  <>
                    {selectedEvent.description.includes('Organizer:') && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Organizer</p>
                        <p>
                          {selectedEvent.description.match(/Organizer:\s*([^\n]+)/)?.[1] || 
                           selectedEvent.htmlDescription?.match(/Organizer:\s*([^<]+)/)?.[1] || 
                           'Not specified'}
                        </p>
                      </div>
                    )}
                    
                    {selectedEvent.description.includes('Required Attendees:') && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Required Attendees</p>
                        <p>
                          {selectedEvent.description.match(/Required Attendees:\s*([^\n]+)/)?.[1] || 
                           selectedEvent.htmlDescription?.match(/Required Attendees:\s*([^<]+)/)?.[1] || 
                           'Not specified'}
                        </p>
                      </div>
                    )}
                    
                    {selectedEvent.description.includes('Optional Attendees:') && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Optional Attendees</p>
                        <p>
                          {selectedEvent.description.match(/Optional Attendees:\s*([^\n]+)/)?.[1] || 
                           selectedEvent.htmlDescription?.match(/Optional Attendees:\s*([^<]+)/)?.[1] || 
                           'Not specified'}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Teams Meeting Information */}
                {selectedEvent.description && (
                  selectedEvent.description.includes('Microsoft Teams') || 
                  selectedEvent.description.includes('Join link')
                ) && (
                  <div className="space-y-2 border rounded-md p-3 bg-blue-50">
                    <p className="font-medium text-sm">Microsoft Teams Meeting</p>
                    
                    {/* Teams Join Link */}
                    {(selectedEvent.description.match(/(https:\/\/[^\s"'<>]+)/i) || 
                      selectedEvent.description.includes('Join link:') && 
                      selectedEvent.description.match(/Join link: (https:\/\/[^\s\n]+)/)) && (
                      <div>
                        <a 
                          href={
                            selectedEvent.description.includes('Join link:') 
                              ? selectedEvent.description.match(/Join link: (https:\/\/[^\s\n]+)/)?.[1] 
                              : selectedEvent.description.match(/(https:\/\/[^\s"'<>]+)/i)?.[1] || '#'
                          }
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <span className="mr-2">Join Teams Meeting</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM9.18 18.12C8.3 18.12 7.55 17.62 7.2 16.85H7.14L7.09 18H5.83V6H7.3V10.7H7.34C7.66 9.95 8.39 9.42 9.33 9.42C11.13 9.42 12.18 11 12.18 13.79C12.18 16.59 11.12 18.12 9.18 18.12ZM16.76 18.12C14.48 18.12 13.19 16.45 13.19 13.8C13.19 11.3 14.48 9.42 16.76 9.42C19.04 9.42 20.34 11.3 20.34 13.8C20.34 16.45 19.05 18.12 16.76 18.12Z" fill="currentColor"/>
                            <path d="M16.75 10.82C15.77 10.82 15.11 11.99 15.11 13.8C15.11 15.61 15.77 16.72 16.75 16.72C17.76 16.72 18.4 15.61 18.4 13.8C18.4 11.99 17.75 10.82 16.75 10.82Z" fill="currentColor"/>
                            <path d="M9.11 10.82C8.21 10.82 7.43 11.82 7.43 13.76C7.43 15.7 8.21 16.72 9.11 16.72C10.04 16.72 10.71 15.7 10.71 13.76C10.71 11.82 10.04 10.82 9.11 10.82Z" fill="currentColor"/>
                          </svg>
                        </a>
                      </div>
                    )}
                    
                    {/* Meeting ID and Passcode */}
                    <div className="flex flex-col space-y-1 mt-2">
                      {selectedEvent.description.match(/Meeting ID:?\s*([0-9\s]+)/i) && (
                        <div className="text-sm">
                          <span className="font-medium">Meeting ID:</span> {
                            selectedEvent.description.match(/Meeting ID:?\s*([0-9\s]+)/i)?.[1]?.trim() || ''
                          }
                        </div>
                      )}
                      {selectedEvent.description.match(/Pass(?:code|word):?\s*([a-zA-Z0-9]+)/i) && (
                        <div className="text-sm">
                          <span className="font-medium">Passcode:</span> {
                            selectedEvent.description.match(/Pass(?:code|word):?\s*([a-zA-Z0-9]+)/i)?.[1]?.trim() || ''
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Full Description */}
                {selectedEvent.description && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Description</p>
                    <div className="whitespace-pre-line max-h-[200px] overflow-y-auto border rounded p-2">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
                
                {/* Tags Section */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">Tags</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="border rounded px-2 py-1 text-sm" 
                        placeholder="Add a tag..." 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            addTagToEvent(selectedEvent.id, newTag.trim());
                            setNewTag('');
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (newTag.trim()) {
                            addTagToEvent(selectedEvent.id, newTag.trim());
                            setNewTag('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(selectedEvent.tags || []).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2"
                      >
                        {tag}
                        <button 
                          className="rounded-full h-4 w-4 inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                          onClick={() => removeTagFromEvent(selectedEvent.id, tag)}
                        >
                          <span className="sr-only">Remove tag</span>
                          ×
                        </button>
                      </Badge>
                    ))}
                    {!(selectedEvent.tags || []).length && (
                      <span className="text-gray-500 text-xs">No tags added yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsEventDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SimpleCalendarWidget;
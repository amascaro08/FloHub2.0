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
  calendarName?: string;
  tags?: string[];
}

// Local storage key for calendar sources
const LOCAL_STORAGE_KEY = 'floHub_calendarSources';

const SimpleCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsDialogOpen, setIsEventDetailsDialogOpen] = useState(false);
  const [filteredSources, setFilteredSources] = useState<number[]>([]);
  
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

  const { data: events = [], isLoading: isLoadingEvents } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events', { timeMin, timeMax }],
    retry: 1
  });

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
        <CardDescription className="text-center font-medium pt-1">
          {format(currentDate, 'MMMM yyyy')}
        </CardDescription>
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
        
        {/* Calendar grid */}
        {isLoadingEvents ? (
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
                    min-h-[100px] p-1 border relative
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
        <DialogContent>
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
                
                {selectedEvent.description && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Description</p>
                    <p className="whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}
                
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
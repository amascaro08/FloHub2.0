import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, SettingsIcon, PlusIcon } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parse, isEqual, subWeeks, addWeeks, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CalendarIntegrationSettings from './CalendarIntegrationSettings';
import { normalizeCalendarEvent, type CalendarEventNormalized } from '@/utils/calendarDataAdapter';
import { useToast } from "@/hooks/use-toast";

interface EnhancedCalendarWidgetProps {
  isMinimized?: boolean;
}

export default function EnhancedCalendarWidget({ isMinimized = false }: EnhancedCalendarWidgetProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEventNormalized[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarSources, setCalendarSources] = useState<any[]>([]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventNormalized | null>(null);

  // Fetch calendar sources when component mounts
  useEffect(() => {
    fetchCalendarSources();
  }, []);

  // Fetch calendar events whenever the selected date or view changes
  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedDate, view, calendarSources]);

  const fetchCalendarSources = async () => {
    try {
      const response = await fetch('/api/calendar/sources');
      if (response.ok) {
        const sources = await response.json();
        setCalendarSources(sources);
      }
    } catch (error) {
      console.error('Error fetching calendar sources:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    setIsLoading(true);
    
    try {
      let timeMin, timeMax;
      
      // Set time range based on current view
      if (view === 'day') {
        timeMin = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
        timeMax = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      } else if (view === 'week') {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        timeMin = new Date(weekStart.setHours(0, 0, 0, 0)).toISOString();
        timeMax = new Date(weekEnd.setHours(23, 59, 59, 999)).toISOString();
      } else {
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        timeMin = new Date(monthStart.setHours(0, 0, 0, 0)).toISOString();
        timeMax = new Date(monthEnd.setHours(23, 59, 59, 999)).toISOString();
      }
      
      const response = await fetch(`/api/calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`);
      
      if (response.ok) {
        let eventData = await response.json();
        
        // Transform events to normalized format, adding calendar source info
        const normalizedEvents = Array.isArray(eventData) ? eventData.map((event) => {
          const calendarSource = calendarSources.find(source => 
            (source.type === event.source) ||
            (source.id === event.calendarId) ||
            (source.name === event.calendarName)
          );
          
          return normalizeCalendarEvent(
            event, 
            event.source || 'unknown',
            calendarSource?.name || event.calendarName || 'Calendar'
          );
        }) : [];
        
        setEvents(normalizedEvents);
      } else {
        toast({
          title: "Failed to fetch events",
          description: "Could not retrieve calendar events at this time.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handlePrevious = () => {
    if (view === 'day') {
      handleDateChange(subDays(selectedDate, 1));
    } else if (view === 'week') {
      handleDateChange(subWeeks(selectedDate, 1));
    } else { // month
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() - 1);
      handleDateChange(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      handleDateChange(addDays(selectedDate, 1));
    } else if (view === 'week') {
      handleDateChange(addWeeks(selectedDate, 1));
    } else { // month
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + 1);
      handleDateChange(newDate);
    }
  };

  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
  };

  const formatEventTime = (event: CalendarEventNormalized) => {
    if (!event || !event.start) return 'All day';
    
    const startDate = event.start.dateTime 
      ? new Date(event.start.dateTime) 
      : event.start.date 
        ? new Date(event.start.date)
        : null;
        
    const endDate = event.end?.dateTime 
      ? new Date(event.end.dateTime) 
      : event.end?.date 
        ? new Date(event.end.date)
        : null;
    
    if (!startDate) return 'Unknown time';
    
    // Check if all-day event (only date, no time component)
    if (event.start.date && !event.start.dateTime) {
      return 'All day';
    }
    
    // Format time with safety checks
    try {
      return `${startDate ? format(startDate, 'h:mm a') : ''} - ${endDate ? format(endDate, 'h:mm a') : ''}`;
    } catch (error) {
      console.error('Error formatting event time:', error);
      return 'Time format error';
    }
  };
  
  const handleEventClick = (event: CalendarEventNormalized) => {
    setSelectedEvent(event);
  };

  const getDayEvents = (date: Date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    return events.filter(event => {
      // Add safety checks for event.start
      if (!event || !event.start) return false;
      
      const eventStart = event.start.dateTime 
        ? new Date(event.start.dateTime) 
        : event.start.date 
          ? new Date(event.start.date)
          : null;
          
      if (!eventStart) return false;
      
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents(new Date(selectedDate));
    
    return (
      <div className="mt-3 space-y-1">
        <h3 className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events scheduled for today
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {dayEvents.map((event, index) => (
              <div 
                key={`${event.id}-${index}`}
                className="p-2 rounded-lg border cursor-pointer hover:bg-accent"
                onClick={() => handleEventClick(event)}
                style={{ borderLeft: `4px solid ${event.color || '#4285F4'}` }}
              >
                <div className="font-medium truncate">{event.summary}</div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{formatEventTime(event)}</span>
                  {event.calendarName && (
                    <span className="text-xs px-1 rounded">{event.calendarName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Start week on Sunday
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="mt-3 grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayEvents = getDayEvents(new Date(day));
          const isCurrentDay = isToday(day);
          
          return (
            <div key={i} className="min-h-[100px]">
              <div 
                className={`text-center p-1 rounded-t-md ${
                  isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className={`text-xs ${isCurrentDay ? 'font-bold' : ''}`}>{format(day, 'd')}</div>
              </div>
              
              <div className="p-1 space-y-1 max-h-[150px] overflow-auto">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div 
                    key={`${event.id}-${index}`}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:bg-accent"
                    onClick={() => handleEventClick(event)}
                    style={{ backgroundColor: `${event.color}25`, borderLeft: `2px solid ${event.color || '#4285F4'}` }}
                  >
                    {event.summary}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Calculate number of weeks needed to display all days
    const weeks = Math.ceil(days.length / 7);
    
    return (
      <div className="mt-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-xs font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dayEvents = getDayEvents(new Date(day));
            const isCurrentDay = isToday(day);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            
            return (
              <div 
                key={i} 
                className={`min-h-[60px] p-1 border-t ${
                  isCurrentMonth ? '' : 'text-muted-foreground opacity-40'
                }`}
              >
                <div 
                  className={`text-xs ${
                    isCurrentDay 
                      ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mx-auto' 
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((event, index) => (
                    <div 
                      key={`${event.id}-${index}`}
                      className="text-xs truncate cursor-pointer hover:bg-accent"
                      onClick={() => handleEventClick(event)}
                      style={{ borderLeft: `2px solid ${event.color || '#4285F4'}` }}
                      title={event.summary}
                    >
                      <span className="pl-1 text-[8px]">{event.summary}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] text-center text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={`h-full overflow-hidden ${isMinimized ? 'shadow-none border-none' : ''}`}>
      <CardHeader className={`p-3 ${isMinimized ? 'pb-0' : ''}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Calendar
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              {view === 'day' && (
                <Button variant="outline" size="sm" onClick={() => handleDateChange(new Date())}>
                  Today
                </Button>
              )}
            </div>
            
            {!isMinimized && (
              <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Calendar Settings</DialogTitle>
                  </DialogHeader>
                  <CalendarIntegrationSettings />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex items-center justify-between mt-3">
            <div className="text-md font-medium">
              {view === 'day' && format(selectedDate, 'MMM d, yyyy')}
              {view === 'week' && `${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`}
              {view === 'month' && format(selectedDate, 'MMMM yyyy')}
            </div>
            
            <Tabs defaultValue={view} onValueChange={(value) => handleViewChange(value as any)} className="w-[240px]">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>
      
      <CardContent className={`p-3 ${isMinimized ? 'pt-2' : ''}`}>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading calendar events...
          </div>
        ) : (
          <div>
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </div>
        )}
      </CardContent>
      
      {/* Event detail dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedEvent.summary}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="flex items-start space-x-2">
                <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {selectedEvent.start?.dateTime 
                      ? format(new Date(selectedEvent.start.dateTime), 'EEEE, MMMM d, yyyy')
                      : selectedEvent.start?.date 
                        ? format(new Date(selectedEvent.start.date), 'EEEE, MMMM d, yyyy')
                        : 'Unknown date'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatEventTime(selectedEvent)}
                  </div>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {selectedEvent.location}
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="mt-4">
                  <div className="font-medium">Description:</div>
                  <div className="text-sm mt-1 whitespace-pre-line">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium">Attendees:</div>
                  <div className="text-sm mt-1">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span>{attendee.displayName || attendee.email}</span>
                        {attendee.responseStatus && (
                          <Badge variant={
                            attendee.responseStatus === 'accepted' ? 'default' :
                            attendee.responseStatus === 'declined' ? 'destructive' : 'outline'
                          }>
                            {attendee.responseStatus}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Calendar:</span>
                  <Badge variant="outline" style={{ borderColor: selectedEvent.color }}>
                    {selectedEvent.calendarName || 'Unknown'}
                  </Badge>
                </div>
                
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
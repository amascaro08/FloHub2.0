import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Settings, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isSameMonth, parseISO, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarIntegrationSettings from './CalendarIntegrationSettings';

interface CalendarEvent {
  id: string;
  calendarId?: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  source?: "google" | "o365" | "url" | string;
  calendarName?: string;
  tags?: string[];
  status?: string;
  organizer?: {
    displayName?: string;
    email?: string;
  };
  attendees?: Array<{
    displayName?: string;
    email?: string;
    responseStatus?: string;
  }>;
  color?: string;
  isRecurring?: boolean;
}

interface CalendarSource {
  id: string | number;
  userId: string;
  name: string;
  type: string;
  sourceId: string;
  isEnabled: boolean;
  tags?: string[] | null;
  connectionData: string;
  lastSyncTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const EnhancedCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('floHubUserId'));

  // Get dates for current view
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const firstDayOfWeek = startOfWeek(currentDate);
  const lastDayOfWeek = endOfWeek(currentDate);

  // Query for calendar sources
  const { 
    data: calendarSources, 
    isLoading: isLoadingSources,
    error: sourcesError 
  } = useQuery({
    queryKey: ['/api/calendar/sources'],
    enabled: !!userId
  });

  // Fetch calendar events for the current view
  const timeMin = firstDayOfMonth.toISOString();
  const timeMax = lastDayOfMonth.toISOString();

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      summary: 'Team Standup',
      description: 'Daily team coordination meeting',
      start: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0).toISOString() },
      end: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 30).toISOString() },
      source: 'google',
      calendarName: 'Work Calendar',
      tags: ['work', 'team'],
      status: 'confirmed',
      location: 'Virtual Meeting Room',
      color: '#4285F4' // Google blue
    },
    {
      id: '2',
      summary: 'Project Review',
      description: 'Monthly project review with the leadership team',
      start: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 14, 0).toISOString() },
      end: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 15, 30).toISOString() },
      source: 'o365',
      calendarName: 'Office 365',
      tags: ['project', 'review'],
      status: 'confirmed',
      location: 'Conference Room A',
      color: '#0078D4' // Microsoft blue
    },
    {
      id: '3',
      summary: 'Client Meeting',
      description: 'Meeting with ABC Corp. to discuss upcoming product launch',
      start: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 0).toISOString() },
      end: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0).toISOString() },
      source: 'url',
      calendarName: 'Client Calendar',
      tags: ['client', 'important'],
      status: 'confirmed',
      color: '#34A853' // Google green
    },
    {
      id: '4',
      summary: 'Dentist Appointment',
      start: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 9, 0).toISOString() },
      end: { dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 10, 0).toISOString() },
      source: 'google',
      calendarName: 'Personal',
      tags: ['personal', 'health'],
      color: '#FBBC05' // Google yellow
    },
    {
      id: '5',
      summary: 'All Day Conference',
      description: 'Annual industry conference',
      start: { date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25).toISOString().split('T')[0] },
      end: { date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 27).toISOString().split('T')[0] },
      source: 'o365',
      calendarName: 'Work Calendar',
      tags: ['conference', 'work'],
      location: 'Convention Center',
      color: '#EA4335' // Google red
    }
  ];

  // The real implementation would query events from the API
  const { data: apiEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/calendar/events', { timeMin, timeMax }],
    enabled: !!userId && !!calendarSources && calendarSources.length > 0,
    placeholderData: []
  });

  // Merge mockEvents with any API events for demonstration
  const allEvents = [...(apiEvents || []), ...mockEvents];

  // Initialize selected sources when calendar sources load
  useEffect(() => {
    if (calendarSources && calendarSources.length > 0 && selectedSources.length === 0) {
      setSelectedSources(calendarSources.map((source: CalendarSource) => source.id.toString()));
    }
  }, [calendarSources]);

  // Filter events based on selected sources
  const filteredEvents = allEvents.filter(event => {
    if (selectedSources.length === 0) return true;
    
    // If the event has a source that matches one of our selected sources
    if (event.calendarId) {
      const sourceMatch = calendarSources?.find((source: CalendarSource) => 
        source.sourceId === event.calendarId && selectedSources.includes(source.id.toString())
      );
      return !!sourceMatch;
    }
    
    // For mock events
    return true;
  });

  // Group events by date for rendering in the calendar
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  
  filteredEvents.forEach(event => {
    const dateStr = event.start.dateTime 
      ? format(parseISO(event.start.dateTime), 'yyyy-MM-dd')
      : event.start.date;
      
    if (dateStr) {
      if (!eventsByDate[dateStr]) {
        eventsByDate[dateStr] = [];
      }
      eventsByDate[dateStr].push(event);
    }
  });

  // Calendar navigation
  const goToPrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const goToNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const toggleCalendarSource = (sourceId: string) => {
    setSelectedSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  // Generate calendar days based on current view
  const calendarDays = currentView === 'month'
    ? eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })
    : currentView === 'week'
      ? eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek })
      : [currentDate];

  // Render day cell with events
  const renderDayCell = (day: Date) => {
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
          ${isCurrentDay ? 'bg-primary/10 border-primary' : ''}
        `}
      >
        <div className={`
          text-xs font-medium h-5 w-5 rounded-full flex items-center justify-center
          ${isCurrentDay ? 'bg-primary text-primary-foreground' : ''}
        `}>
          {format(day, 'd')}
        </div>
        
        <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto text-left">
          {dayEvents.map((event) => (
            <TooltipProvider key={event.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      text-xs truncate rounded px-1 py-0.5 cursor-pointer
                      ${event.color ? '' : 'bg-blue-100 text-blue-800'}
                    `}
                    style={{
                      backgroundColor: event.color ? `${event.color}33` : '', // Add transparency
                      color: event.color || ''
                    }}
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
          ))}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
    
    return (
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day headers */}
        {weekDays.map((day) => (
          <div key={day.toString()} className="text-xs font-medium py-1">
            {format(day, 'EEE d')}
          </div>
        ))}
        
        {/* Day cells */}
        {weekDays.map(day => renderDayCell(day))}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    return (
      <div className="flex flex-col">
        <div className="text-sm font-medium py-2 text-center">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
        
        <div className="mt-2 space-y-1 overflow-y-auto">
          {hours.map(hour => {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const hourEvents = dayEvents.filter(event => {
              if (!event.start.dateTime) return false;
              return format(parseISO(event.start.dateTime), 'HH') === timeString.split(':')[0];
            });
            
            return (
              <div key={hour} className="flex hover:bg-muted/10">
                <div className="w-12 text-xs text-muted-foreground py-1">
                  {timeString}
                </div>
                <div className="flex-1 min-h-[30px] border-t border-muted py-1">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className="text-xs rounded px-1 py-0.5 mb-1 cursor-pointer"
                      style={{
                        backgroundColor: event.color ? `${event.color}33` : '#e6f2ff',
                        color: event.color || '#0066cc'
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.summary}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
              onClick={goToPrevious}
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
              onClick={goToNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  Calendar Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <CardDescription className="font-medium pt-1">
            {currentView === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : currentView === 'week'
                ? `${format(firstDayOfWeek, 'MMM d')} - ${format(lastDayOfWeek, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM d, yyyy')}
          </CardDescription>
          
          <div className="space-x-1">
            <Button 
              variant={currentView === 'day' ? "secondary" : "ghost"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setCurrentView('day')}
            >
              Day
            </Button>
            <Button 
              variant={currentView === 'week' ? "secondary" : "ghost"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setCurrentView('week')}
            >
              Week
            </Button>
            <Button 
              variant={currentView === 'month' ? "secondary" : "ghost"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setCurrentView('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto pb-0">
        {/* Calendar source filters */}
        {calendarSources && calendarSources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {calendarSources.map((source: CalendarSource) => (
              <Badge 
                key={source.id} 
                variant={selectedSources.includes(source.id.toString()) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleCalendarSource(source.id.toString())}
              >
                {source.name}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Loading state */}
        {isLoadingEvents || isLoadingSources ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <>
            {/* Calendar Views */}
            {currentView === 'month' && (
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs font-medium py-1">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map(day => renderDayCell(day))}
              </div>
            )}
            
            {currentView === 'week' && renderWeekView()}
            
            {currentView === 'day' && renderDayView()}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div>
          {!isLoadingEvents && (
            <span className="text-xs text-muted-foreground">
              {filteredEvents.length} events {currentView === 'month' ? 'this month' : currentView === 'week' ? 'this week' : 'today'}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setIsAddEventOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </CardFooter>
      
      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
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
                        {format(parseISO(selectedEvent.start.date), 'MMMM d, yyyy')} 
                        {selectedEvent.end.date !== selectedEvent.start.date && (
                          <> - {format(parseISO(selectedEvent.end.date), 'MMMM d, yyyy')}</>
                        )}
                        <span className="ml-2 text-sm text-muted-foreground">(All day)</span>
                      </>
                    ) : (
                      'Time not specified'
                    )}
                  </p>
                </div>
                
                {selectedEvent.location && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Location</p>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Description</p>
                    <p className="whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}
                
                {selectedEvent.organizer && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Organizer</p>
                    <p>{selectedEvent.organizer.displayName || selectedEvent.organizer.email}</p>
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
                
                {selectedEvent.source && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Source</p>
                    <Badge>
                      {selectedEvent.source === 'google' 
                        ? 'Google Calendar'
                        : selectedEvent.source === 'o365'
                          ? 'Microsoft 365'
                          : selectedEvent.source === 'url'
                            ? 'External Calendar'
                            : selectedEvent.source}
                    </Badge>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsEventDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event in your connected calendars.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              In the full implementation, this form would allow you to create events 
              that sync back to your connected calendar sources.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddEventOpen(false)}>
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Calendar Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
            <DialogDescription>
              Manage your connected calendars and preferences.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="sources">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="sources">Calendar Sources</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sources" className="space-y-4 py-4">
              <CalendarIntegrationSettings />
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-view">Default View</Label>
                    <p className="text-sm text-muted-foreground">Select the default calendar view</p>
                  </div>
                  <select 
                    id="default-view"
                    className="border rounded p-2"
                    defaultValue="month"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="week-starts">Week Starts On</Label>
                    <p className="text-sm text-muted-foreground">Choose first day of week</p>
                  </div>
                  <select 
                    id="week-starts"
                    className="border rounded p-2"
                    defaultValue="sunday"
                  >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-weekends">Show Weekends</Label>
                    <p className="text-sm text-muted-foreground">Display weekend days in calendar</p>
                  </div>
                  <Switch id="show-weekends" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="event-reminders">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for upcoming events</p>
                  </div>
                  <Switch id="event-reminders" defaultChecked />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EnhancedCalendarWidget;
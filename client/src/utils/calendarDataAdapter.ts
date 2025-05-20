/**
 * Calendar Data Adapter
 * This utility handles different calendar data formats and normalizes them
 * to a consistent format for the calendar widget.
 */

export interface CalendarEventNormalized {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  source?: string;
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

// Power Automate URL expected format
export interface PowerAutomateCalendarEvent {
  id: string;
  title: string;
  start: string | { dateTime?: string; date?: string };
  end: string | { dateTime?: string; date?: string };
  description?: string;
  location?: string;
  organizer?: {
    displayName?: string;
    email?: string;
  };
  attendees?: Array<{
    displayName?: string;
    email?: string;
    responseStatus?: string;
  }>;
}

// Google Calendar format
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  organizer?: {
    displayName?: string;
    email?: string;
  };
  attendees?: Array<{
    displayName?: string;
    email?: string;
    responseStatus?: string;
  }>;
  status?: string;
  colorId?: string;
  recurrence?: string[];
}

// Microsoft/Office 365 format
export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: {
    displayName?: string;
  };
  organizer?: {
    emailAddress: {
      name?: string;
      address: string;
    }
  };
  attendees?: Array<{
    emailAddress: {
      name?: string;
      address: string;
    };
    status?: {
      response?: string;
    }
  }>;
  isAllDay?: boolean;
}

// Colors for calendar sources
const sourceColors = {
  google: '#4285F4', // Google blue
  o365: '#0078D4',   // Microsoft blue
  microsoft: '#0078D4', // Microsoft blue
  url: '#34A853',    // Google green
  default: '#EA4335' // Google red
};

/**
 * Normalize a Power Automate calendar event to the standard format
 */
export function normalizePowerAutomateEvent(event: PowerAutomateCalendarEvent, calendarName?: string): CalendarEventNormalized {
  // Handle different start/end time formats
  let startObj = typeof event.start === 'string' 
    ? { dateTime: event.start } 
    : event.start;
    
  let endObj = typeof event.end === 'string' 
    ? { dateTime: event.end } 
    : event.end;
  
  // Check if this is an all-day event (no time component)
  if (typeof event.start === 'string' && !event.start.includes('T')) {
    startObj = { date: event.start };
  }
  
  if (typeof event.end === 'string' && !event.end.includes('T')) {
    endObj = { date: event.end };
  }

  return {
    id: event.id,
    summary: event.title,
    description: event.description,
    start: startObj,
    end: endObj,
    location: event.location,
    source: 'url',
    calendarName: calendarName || 'Power Automate Calendar',
    organizer: event.organizer,
    attendees: event.attendees,
    color: sourceColors.url,
    status: 'confirmed'
  };
}

/**
 * Normalize a Google Calendar event to the standard format
 */
export function normalizeGoogleEvent(event: GoogleCalendarEvent, calendarName?: string): CalendarEventNormalized {
  return {
    id: event.id,
    summary: event.summary,
    description: event.description,
    start: event.start,
    end: event.end,
    location: event.location,
    source: 'google',
    calendarName: calendarName || 'Google Calendar',
    organizer: event.organizer,
    attendees: event.attendees,
    status: event.status,
    color: sourceColors.google,
    isRecurring: event.recurrence ? true : false
  };
}

/**
 * Normalize a Microsoft/Office 365 Calendar event to the standard format
 */
export function normalizeMicrosoftEvent(event: MicrosoftCalendarEvent, calendarName?: string): CalendarEventNormalized {
  // Convert Microsoft format to standard format
  const normalizedAttendees = event.attendees?.map(attendee => ({
    displayName: attendee.emailAddress.name,
    email: attendee.emailAddress.address,
    responseStatus: attendee.status?.response
  }));

  // Handle all-day events
  const startObj = event.isAllDay 
    ? { date: event.start.dateTime.split('T')[0] }
    : { dateTime: event.start.dateTime };
    
  const endObj = event.isAllDay 
    ? { date: event.end.dateTime.split('T')[0] }
    : { dateTime: event.end.dateTime };

  return {
    id: event.id,
    summary: event.subject,
    description: event.bodyPreview,
    start: startObj,
    end: endObj,
    location: event.location?.displayName,
    source: 'o365',
    calendarName: calendarName || 'Office 365 Calendar',
    organizer: event.organizer ? {
      displayName: event.organizer.emailAddress.name,
      email: event.organizer.emailAddress.address
    } : undefined,
    attendees: normalizedAttendees,
    color: sourceColors.o365,
    status: 'confirmed'
  };
}

/**
 * Normalize any calendar event to the standard format
 */
export function normalizeCalendarEvent(
  event: any, 
  source: string, 
  calendarName?: string
): CalendarEventNormalized {
  switch (source) {
    case 'google':
      return normalizeGoogleEvent(event, calendarName);
    case 'o365':
    case 'microsoft':
      return normalizeMicrosoftEvent(event, calendarName);
    case 'url':
      return normalizePowerAutomateEvent(event, calendarName);
    default:
      // Try to normalize based on available properties
      if (event.summary || event.subject || event.title) {
        return {
          id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          summary: event.summary || event.subject || event.title,
          description: event.description || event.bodyPreview,
          start: typeof event.start === 'string' ? { dateTime: event.start } : event.start,
          end: typeof event.end === 'string' ? { dateTime: event.end } : event.end,
          location: event.location?.displayName || event.location,
          source: source,
          calendarName: calendarName || 'Calendar',
          color: sourceColors.default
        };
      }
      
      // If unknown format, create a minimal event
      return {
        id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        summary: event.summary || event.subject || event.title || 'Untitled Event',
        start: event.start || { dateTime: new Date().toISOString() },
        end: event.end || { dateTime: new Date().toISOString() },
        source: source,
        calendarName: calendarName || 'Calendar',
        color: sourceColors.default
      };
  }
}
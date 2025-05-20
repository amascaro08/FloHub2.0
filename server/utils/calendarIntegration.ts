import { createAuthenticatedClient, isTokenExpired, refreshGoogleAccessToken } from './googleAuth';
import { isMicrosoftTokenExpired, refreshMicrosoftAccessToken, createMicrosoftAuthHeaders } from './microsoftAuth';
import { fetchEventsFromPowerAutomate } from './powerAutomateIntegration';
import fetch from 'node-fetch';

// Define a common interface for calendar events
export interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  source?: "personal" | "work";
  description?: string;
  calendarName?: string;
  tags?: string[];
}

// Define a common interface for calendar sources
export interface CalendarSource {
  id: string;
  name: string;
  type: 'google' | 'o365' | 'other';
  sourceId: string;
  isEnabled: boolean;
  tags?: string[];
  connectionData?: any;
  userId: string;
}

// Google Calendar API Functions

/**
 * Fetches events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  calendarId: string,
  tokens: any,
  timeMin: string,
  timeMax: string,
  userId: string
): Promise<CalendarEvent[]> {
  try {
    // Check if token is expired and refresh if needed
    let currentTokens = tokens;
    if (isTokenExpired(tokens) && tokens.refresh_token) {
      currentTokens = await refreshGoogleAccessToken(tokens.refresh_token);
      // Here you would save the updated tokens to your database
    }

    // Create authenticated client
    const oauth2Client = createAuthenticatedClient(currentTokens);
    
    // Make request to Google Calendar API
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime'
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${currentTokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Google Calendar events to our common format
    return data.items.map((event: any) => ({
      id: event.id,
      calendarId,
      summary: event.summary || 'Untitled Event',
      start: event.start,
      end: event.end,
      description: event.description,
      calendarName: data.summary || 'Google Calendar',
      source: 'personal', // Default, could be customized based on metadata
      tags: event.colorId ? [`color-${event.colorId}`] : []
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}

/**
 * Lists available Google Calendars
 */
export async function listGoogleCalendars(tokens: any, userId: string) {
  try {
    // Check if token is expired and refresh if needed
    let currentTokens = tokens;
    if (isTokenExpired(tokens) && tokens.refresh_token) {
      currentTokens = await refreshGoogleAccessToken(tokens.refresh_token);
      // Here you would save the updated tokens to your database
    }

    // Create authenticated client
    const oauth2Client = createAuthenticatedClient(currentTokens);
    
    // Make request to Google Calendar API
    const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${currentTokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Google Calendar list to our common format
    return data.items.map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary || calendar.id,
      primary: calendar.primary || false,
      selected: calendar.selected || false
    }));
  } catch (error) {
    console.error('Error listing Google Calendars:', error);
    throw error;
  }
}

// Microsoft Graph Calendar API Functions

/**
 * Fetches events from Microsoft Calendar
 */
export async function fetchMicrosoftCalendarEvents(
  calendarId: string,
  tokens: any,
  timeMin: string,
  timeMax: string,
  userId: string
): Promise<CalendarEvent[]> {
  try {
    // Check if token is expired and refresh if needed
    let currentTokens = tokens;
    if (isMicrosoftTokenExpired(tokens) && tokens.refresh_token) {
      currentTokens = await refreshMicrosoftAccessToken(tokens.refresh_token);
      // Here you would save the updated tokens to your database
    }

    // Make request to Microsoft Graph API
    let url = 'https://graph.microsoft.com/v1.0/me/calendar/events';
    if (calendarId !== 'primary') {
      url = `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`;
    }
    
    const params = new URLSearchParams({
      $filter: `start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}'`,
      $orderby: 'start/dateTime',
      $top: '50'
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: createMicrosoftAuthHeaders(currentTokens.access_token),
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Microsoft Calendar events to our common format
    return data.value.map((event: any) => ({
      id: event.id,
      calendarId,
      summary: event.subject || 'Untitled Event',
      start: {
        dateTime: event.start.dateTime + 'Z',
        timeZone: event.start.timeZone
      },
      end: {
        dateTime: event.end.dateTime + 'Z',
        timeZone: event.end.timeZone
      },
      description: event.bodyPreview,
      calendarName: 'Microsoft Calendar', // This could be fetched separately
      source: 'work', // Default, could be customized based on metadata
      tags: event.categories || []
    }));
  } catch (error) {
    console.error('Error fetching Microsoft Calendar events:', error);
    throw error;
  }
}

/**
 * Lists available Microsoft Calendars
 */
export async function listMicrosoftCalendars(tokens: any, userId: string) {
  try {
    // Check if token is expired and refresh if needed
    let currentTokens = tokens;
    if (isMicrosoftTokenExpired(tokens) && tokens.refresh_token) {
      currentTokens = await refreshMicrosoftAccessToken(tokens.refresh_token);
      // Here you would save the updated tokens to your database
    }

    // Make request to Microsoft Graph API
    const url = 'https://graph.microsoft.com/v1.0/me/calendars';
    
    const response = await fetch(url, {
      headers: createMicrosoftAuthHeaders(currentTokens.access_token),
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Microsoft Calendar list to our common format
    return data.value.map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.name || calendar.id,
      primary: calendar.isDefaultCalendar || false,
      selected: true // Microsoft doesn't have an equivalent property
    }));
  } catch (error) {
    console.error('Error listing Microsoft Calendars:', error);
    throw error;
  }
}

// Unified API to fetch events from multiple sources

/**
 * Fetches events from all enabled calendar sources
 */
export async function fetchEventsFromAllSources(
  calendarSources: CalendarSource[],
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];
  const enabledSources = calendarSources.filter(source => source.isEnabled);

  // Process each enabled calendar source
  for (const source of enabledSources) {
    try {
      let events: CalendarEvent[] = [];

      if (source.type === 'google') {
        events = await fetchGoogleCalendarEvents(
          source.sourceId,
          source.connectionData,
          timeMin,
          timeMax,
          source.userId
        );
      } else if (source.type === 'o365') {
        // Check if this is a Power Automate source
        if (source.sourceId === 'powerautomate' && source.connectionData?.url) {
          events = await fetchEventsFromPowerAutomate(
            {
              url: source.connectionData.url,
              name: source.name,
              userId: source.userId,
              headers: source.connectionData.headers
            },
            timeMin,
            timeMax
          );
        } else {
          events = await fetchMicrosoftCalendarEvents(
            source.sourceId,
            source.connectionData,
            timeMin,
            timeMax,
            source.userId
          );
        }
      }

      // Add source metadata to events
      events.forEach(event => {
        event.source = source.type === 'google' ? 'personal' : 'work';
        event.calendarName = source.name;
        event.tags = [...(event.tags || []), ...(source.tags || [])];
      });

      allEvents.push(...events);
    } catch (error) {
      console.error(`Error fetching events from source ${source.id}:`, error);
      // Continue with other sources even if one fails
    }
  }

  return allEvents;
}
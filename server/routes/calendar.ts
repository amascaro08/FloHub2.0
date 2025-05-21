import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { storage } from '../storage';
// Use a middleware that leverages session-based authentication
const sessionAuth = (req: any, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Types for calendar data
interface CalendarEvent {
  id: string;
  summary?: string;
  title?: string;
  subject?: string;
  description?: string;
  bodyPreview?: string;
  start: string | { dateTime?: string; date?: string; timeZone?: string };
  end: string | { dateTime?: string; date?: string; timeZone?: string };
  location?: string | { displayName?: string };
  source?: string;
  calendarName?: string;
  tags?: string[];
  organizer?: any;
  attendees?: any[];
}

// Possible response formats from different calendar APIs
interface GoogleCalendarResponse {
  items: CalendarEvent[];
}

interface MicrosoftCalendarResponse {
  value: CalendarEvent[];
}

interface PowerAutomateResponse {
  events?: CalendarEvent[];
  value?: CalendarEvent[];
  items?: CalendarEvent[];
}

type CalendarApiResponse = CalendarEvent[] | GoogleCalendarResponse | MicrosoftCalendarResponse | PowerAutomateResponse;

const router = Router();

// Get all calendar sources for the current user
router.get('/sources', sessionAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session.userId;
    const sources = await storage.getCalendarSources(userId);
    
    // Remove sensitive data
    const sanitizedSources = sources.map(source => {
      const connectionData = source.connectionData ? JSON.parse(source.connectionData) : {};
      
      return {
        id: source.id,
        name: source.name,
        type: source.type,
        sourceId: source.sourceId,
        isEnabled: source.isEnabled,
        tags: source.tags,
        lastSyncTime: source.lastSyncTime,
        // Include URL for Power Automate sources
        url: source.type === 'url' ? connectionData.url : undefined
      };
    });
    
    res.json(sanitizedSources);
  } catch (error) {
    console.error('Error fetching calendar sources:', error);
    res.status(500).json({ error: 'Failed to fetch calendar sources' });
  }
});

// Add Power Automate URL source
router.post('/url-source', sessionAuth, async (req: any, res: Response) => {
  try {
    const { name, url, tags } = req.body;
    const userId = req.session.userId;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Create calendar source in database
    const calendarSource = await storage.createCalendarSource({
      userId: userId,
      name: name || 'Power Automate Calendar',
      type: 'url',
      sourceId: `url-${Date.now()}`,
      connectionData: JSON.stringify({
        url
      }),
      tags: tags || null,
      isEnabled: true
    });
    
    res.json(calendarSource);
  } catch (error) {
    console.error('Error adding URL source:', error);
    res.status(500).json({ error: 'Failed to add Power Automate calendar source' });
  }
});

// Update a calendar source
router.put('/sources/:id', sessionAuth, async (req: any, res: Response) => {
  try {
    const sourceId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    const { name, isEnabled, tags } = req.body;
    
    // Get the source
    const source = await storage.getCalendarSource(sourceId);
    
    if (!source) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }
    
    // Check if the user owns this source
    if (source.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this calendar source' });
    }
    
    // Update the source
    const updatedSource = await storage.updateCalendarSource(sourceId, {
      name: name,
      isEnabled: isEnabled,
      tags: tags
    });
    
    res.json(updatedSource);
  } catch (error) {
    console.error('Error updating calendar source:', error);
    res.status(500).json({ error: 'Failed to update calendar source' });
  }
});

// Delete a calendar source
router.delete('/sources/:id', sessionAuth, async (req: any, res: Response) => {
  try {
    const sourceId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    // Get the source
    const source = await storage.getCalendarSource(sourceId);
    
    if (!source) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }
    
    // Check if the user owns this source
    if (source.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this calendar source' });
    }
    
    // Delete the source
    const result = await storage.deleteCalendarSource(sourceId);
    
    if (result) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete calendar source' });
    }
  } catch (error) {
    console.error('Error deleting calendar source:', error);
    res.status(500).json({ error: 'Failed to delete calendar source' });
  }
});

// Get calendar events from all enabled sources
router.get('/events', sessionAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session.userId;
    const { timeMin, timeMax } = req.query;
    
    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'timeMin and timeMax parameters are required' });
    }
    
    // Get all enabled calendar sources
    const sources = await storage.getCalendarSources(userId);
    const enabledSources = sources.filter(source => source.isEnabled);
    
    if (enabledSources.length === 0) {
      // Return sample events if no sources are configured
      const sampleEvents = getSampleEvents();
      return res.json(sampleEvents);
    }
    
    // Fetch events from all sources
    const allEvents = [];
    
    for (const source of enabledSources) {
      try {
        let events: CalendarEvent[] = [];
        
        if (source.type === 'url') {
          // For Power Automate URL sources
          const connectionData = JSON.parse(source.connectionData || '{}');
          if (connectionData.url) {
            events = await fetchEventsFromUrl(connectionData.url, timeMin, timeMax);
          }
        }
        
        // Add source information to each event
        if (events.length > 0) {
          events = events.map(event => ({
            ...event,
            source: source.type,
            calendarId: source.id,
            calendarName: source.name,
            tags: source.tags || []
          }));
          
          allEvents.push(...events);
        }
      } catch (error) {
        console.error(`Error fetching events from source ${source.id}:`, error);
        // Continue with other sources even if one fails
      }
    }
    
    res.json(allEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Helper function to fetch events from a Power Automate URL
async function fetchEventsFromUrl(url: string, timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  try {
    console.log(`Fetching events from URL: ${url}`);
    
    // We'll make a direct URL request without generating sample data first
    try {
      // For Power Automate Flow URLs, you might need specific formatting
      // Let's try both with and without the time parameters
      
      // First try with the URL as provided (for already configured URLs)
      console.log(`Making direct request to Power Automate URL: ${url}`);
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // If that didn't work, try with time parameters
      if (!response.ok) {
        console.log(`Direct URL request failed, trying with time parameters`);
        const separator = url.includes('?') ? '&' : '?';
        const urlWithParams = `${url}${separator}timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;
        
        console.log(`Making request to: ${urlWithParams}`);
        response = await fetch(urlWithParams);
      }
      
      if (!response.ok) {
        console.error(`URL response not OK: ${response.status} ${response.statusText}`);
        const responseText = await response.text();
        console.error(`Response body: ${responseText}`);
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      
      const data = await response.json() as CalendarApiResponse;
      console.log(`Response data received, processing...`);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        console.log('Data is an array of events, length:', data.length);
        
        // Convert the format from Power Automate (startTime/endTime) to the format our app expects (start/end)
        return data.map((event: any) => {
          // Check if we need to convert from startTime/endTime to start/end object format
          if (event.startTime && !event.start) {
            console.log('Converting startTime/endTime format to start/end format');
            return {
              id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              summary: event.title || event.summary || 'Untitled Event',
              description: event.description || event.bodyPreview || '',
              start: { dateTime: event.startTime },
              end: { dateTime: event.endTime },
              location: event.location || '',
              source: 'powerautomate'
            };
          }
          // For other formats, ensure required fields are present
          return {
            ...event,
            id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            summary: event.summary || event.title || event.subject || 'Untitled Event',
            source: 'powerautomate'
          };
        });
      } else if ('events' in data && Array.isArray(data.events)) {
        console.log('Data has events property, length:', data.events.length);
        return data.events.map(event => ({
          ...event,
          source: 'powerautomate'
        }));
      } else if ('value' in data && Array.isArray(data.value)) {
        console.log('Data has value property (Microsoft format), length:', data.value.length);
        return data.value.map(event => ({
          id: event.id,
          summary: event.subject || 'Untitled Event',
          description: event.bodyPreview || '',
          start: event.start,
          end: event.end,
          location: typeof event.location === 'object' && event.location?.displayName ? 
                   event.location.displayName : 
                   (typeof event.location === 'string' ? event.location : ''),
          organizer: event.organizer,
          attendees: event.attendees,
          source: 'powerautomate'
        }));
      } else if ('items' in data && Array.isArray(data.items)) {
        console.log('Data has items property (Google format), length:', data.items.length);
        return data.items.map(event => ({
          ...event,
          source: 'powerautomate'
        }));
      }
      
      console.error('Could not parse data in any known format:', Object.keys(data));
      throw new Error('Calendar data format not recognized');
    } catch (error) {
      console.error('Error fetching events from URL:', error);
      
      // On error, check if o365Url parameter was specified directly in query
      const o365UrlParam = new URL(url).searchParams.get('o365Url');
      if (o365UrlParam) {
        // Try again with the provided o365Url parameter
        try {
          console.log(`Trying with extracted o365Url parameter: ${o365UrlParam}`);
          const directResponse = await fetch(o365UrlParam);
          if (directResponse.ok) {
            const data = await directResponse.json();
            if (Array.isArray(data) && data.length > 0) {
              console.log('Successfully retrieved events from o365Url parameter');
              return data.map(event => ({
                ...event,
                source: 'powerautomate-direct'
              }));
            }
          }
        } catch (innerError) {
          console.error('Also failed with o365Url parameter:', innerError);
        }
      }
      
      // Generate some current sample events as last resort
      console.log('Using sample events due to failure fetching from URL');
      return getSamplePowerAutomateEvents();
    }
  } catch (error) {
    console.error('Unexpected error in fetchEventsFromUrl:', error);
    return [];
  }
}

// Sample events for Power Automate URL testing
function getSamplePowerAutomateEvents(): CalendarEvent[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  return [
    {
      id: 'pa-1',
      title: 'Team Sync (Power Automate)',
      start: { dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString() },
      end: { dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString() },
      description: 'Weekly team synchronization meeting to discuss progress and roadblocks.'
    },
    {
      id: 'pa-2',
      title: 'Client Presentation (Power Automate)',
      start: { dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString() },
      end: { dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 30).toISOString() },
      description: 'Presenting new features to the client.'
    },
    {
      id: 'pa-3',
      title: 'Project Planning (Power Automate)',
      start: { dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0).toISOString() },
      end: { dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30).toISOString() },
      description: 'Planning session for the next project phase.'
    }
  ];
}

// Sample events for testing when no sources are configured
function getSampleEvents() {
  return [
    {
      id: 'sample-1',
      summary: 'Team Meeting',
      start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() },
      source: 'sample',
      calendarName: 'Sample Calendar',
      tags: ['sample', 'meeting']
    },
    {
      id: 'sample-2',
      summary: 'Client Call',
      start: { dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString() },
      source: 'sample',
      calendarName: 'Sample Calendar',
      tags: ['sample', 'client']
    }
  ];
}

export default router;
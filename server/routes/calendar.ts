import { Request, Response } from 'express';
import { storage } from '../storage';

// Type definitions for calendar events
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

// Calendar API routes
export function registerCalendarRoutes(app: any) {
  // Get calendar events
  app.get('/api/calendar/events', async (req: Request, res: Response) => {
    try {
      const { calendarId = 'primary', timeMin, timeMax } = req.query;

      // Validate date parameters
      if (!timeMin || !timeMax) {
        return res.status(400).json({ error: 'Missing timeMin or timeMax parameters' });
      }

      // In a real implementation, this would fetch from Google/Microsoft/etc. APIs using user credentials
      // This requires proper authentication with the calendar provider
      const events: CalendarEvent[] = [
        { 
          id: '1', 
          calendarId: typeof calendarId === 'string' ? calendarId : 'primary',
          summary: 'Team Standup', 
          start: { dateTime: `${new Date().toISOString().split('T')[0]}T10:00:00` },
          end: { dateTime: `${new Date().toISOString().split('T')[0]}T10:30:00` },
          source: 'work',
          calendarName: 'Work',
          tags: ['daily', 'team'],
          description: 'Daily team standup meeting to discuss progress and blockers.'
        },
        { 
          id: '2', 
          calendarId: typeof calendarId === 'string' ? calendarId : 'primary',
          summary: 'Client Meeting', 
          start: { dateTime: `${new Date().toISOString().split('T')[0]}T14:00:00` },
          end: { dateTime: `${new Date().toISOString().split('T')[0]}T15:00:00` },
          source: 'personal',
          calendarName: 'Personal',
          tags: ['client'],
          description: 'Meeting with client to discuss project requirements and timeline.'
        },
        { 
          id: '3', 
          calendarId: typeof calendarId === 'string' ? calendarId : 'primary',
          summary: 'Project Review', 
          start: { dateTime: `${new Date().toISOString().split('T')[0]}T16:30:00` },
          end: { dateTime: `${new Date().toISOString().split('T')[0]}T17:30:00` },
          source: 'work',
          calendarName: 'Work',
          tags: ['project'],
          description: 'Weekly project review meeting with stakeholders.'
        }
      ];

      return res.json(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  });

  // Get available calendars
  app.get('/api/calendar/list', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would fetch from Google/Microsoft APIs
      // This requires proper authentication with the calendar provider
      const calendars = [
        { id: 'primary', summary: 'Personal Calendar', primary: true },
        { id: 'work', summary: 'Work Calendar' },
        { id: 'family', summary: 'Family Calendar' }
      ];

      return res.json(calendars);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return res.status(500).json({ error: 'Failed to fetch calendars' });
    }
  });

  // Create calendar event
  app.post('/api/calendar/events', async (req: Request, res: Response) => {
    try {
      const { calendarId = 'primary', summary, start, end, source, description, tags } = req.body;

      if (!summary || !start) {
        return res.status(400).json({ error: 'Missing required event information' });
      }

      // In a real implementation, this would create an event via Google/Microsoft APIs
      // This requires proper authentication with the calendar provider
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        calendarId,
        summary,
        start,
        end,
        source: source || 'personal',
        description,
        calendarName: calendarId === 'primary' ? 'Personal Calendar' : 'Work Calendar',
        tags: tags || []
      };

      return res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return res.status(500).json({ error: 'Failed to create calendar event' });
    }
  });

  // Get user settings (including calendar preferences)
  app.get('/api/userSettings', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would fetch user settings from the database
      const userSettings = {
        selectedCals: ['primary', 'work'],
        defaultView: 'month',
        customRange: {
          start: new Date().toISOString().slice(0, 10),
          end: new Date().toISOString().slice(0, 10),
        },
        globalTags: ['work', 'personal', 'family', 'health', 'finance'],
        activeWidgets: ['tasks', 'calendar', 'ataglance', 'quicknote', 'habit-tracker'],
        calendarSources: [
          {
            name: 'Google Calendar',
            type: 'google',
            sourceId: 'primary',
            isEnabled: true,
            tags: ['personal']
          },
          {
            name: 'Work Calendar',
            type: 'google',
            sourceId: 'work',
            isEnabled: true,
            tags: ['work']
          }
        ]
      };

      return res.json(userSettings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return res.status(500).json({ error: 'Failed to fetch user settings' });
    }
  });

  // Update user settings
  app.post('/api/userSettings', async (req: Request, res: Response) => {
    try {
      const settings = req.body;
      
      // In a real implementation, this would save user settings to the database
      
      return res.status(200).json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving user settings:', error);
      return res.status(500).json({ error: 'Failed to save user settings' });
    }
  });
}
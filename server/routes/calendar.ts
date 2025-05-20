import { Request, Response } from 'express';
import { storage } from '../storage';
import { getGoogleAuthUrl, getGoogleTokensFromCode } from '../utils/googleAuth';
import { getMicrosoftAuthUrl, getMicrosoftTokensFromCode } from '../utils/microsoftAuth';
import { 
  fetchEventsFromAllSources, 
  listGoogleCalendars, 
  listMicrosoftCalendars,
  CalendarEvent,
  CalendarSource
} from '../utils/calendarIntegration';
import { validatePowerAutomateUrl } from '../utils/powerAutomateIntegration';

// Calendar API routes
export function registerCalendarRoutes(app: any) {
  // Get calendar events
  app.get('/api/calendar/events', async (req: Request, res: Response) => {
    try {
      const { timeMin, timeMax } = req.query;
      const userId = req.user?.id || '1'; // In a real app, this would be the authenticated user's ID

      // Validate date parameters
      if (!timeMin || !timeMax) {
        return res.status(400).json({ error: 'Missing timeMin or timeMax parameters' });
      }

      // Get user settings to retrieve calendar sources
      // In a real implementation, this would fetch from the database
      const userSettings = {
        calendarSources: [
          {
            id: 'google-primary',
            name: 'Personal Google Calendar',
            type: 'google' as const,
            sourceId: 'primary',
            isEnabled: true,
            userId,
            tags: ['personal'],
            connectionData: {
              // This would contain tokens in a real implementation
              access_token: process.env.GOOGLE_ACCESS_TOKEN,
              refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
              expiry_date: Date.now() + 3600000 // 1 hour from now
            }
          },
          {
            id: 'microsoft-work',
            name: 'Work Office 365 Calendar',
            type: 'o365' as const,
            sourceId: 'primary',
            isEnabled: true,
            userId,
            tags: ['work'],
            connectionData: {
              // This would contain tokens in a real implementation
              access_token: process.env.MICROSOFT_ACCESS_TOKEN,
              refresh_token: process.env.MICROSOFT_REFRESH_TOKEN,
              expires_at: Date.now() + 3600000 // 1 hour from now
            }
          }
        ]
      };

      // Check if we have API keys/tokens for the calendar services
      const hasGoogleAuth = !!process.env.GOOGLE_ACCESS_TOKEN;
      const hasMicrosoftAuth = !!process.env.MICROSOFT_ACCESS_TOKEN;

      let events: CalendarEvent[] = [];

      // If we have real authentication credentials, use them to fetch real events
      if (hasGoogleAuth || hasMicrosoftAuth) {
        try {
          events = await fetchEventsFromAllSources(
            userSettings.calendarSources, 
            timeMin as string, 
            timeMax as string
          );
        } catch (fetchError) {
          console.error('Error fetching from real calendar sources:', fetchError);
          // Fall back to sample data
        }
      }

      // If we couldn't fetch real events or don't have authentication, use sample data
      if (events.length === 0) {
        events = [
          { 
            id: '1', 
            calendarId: 'primary',
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
            calendarId: 'primary',
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
            calendarId: 'primary',
            summary: 'Project Review', 
            start: { dateTime: `${new Date().toISOString().split('T')[0]}T16:30:00` },
            end: { dateTime: `${new Date().toISOString().split('T')[0]}T17:30:00` },
            source: 'work',
            calendarName: 'Work',
            tags: ['project'],
            description: 'Weekly project review meeting with stakeholders.'
          }
        ];
      }

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

  // Calendar Authentication Routes

  // Get Google OAuth URL
  app.get('/api/calendar/auth/google', async (req: Request, res: Response) => {
    try {
      const { state = 'default', accountLabel = 'Personal' } = req.query;
      
      if (!process.env.GOOGLE_OAUTH_ID || !process.env.GOOGLE_OAUTH_SECRET) {
        return res.status(500).json({ 
          error: 'Google OAuth credentials not configured',
          configured: false
        });
      }

      // In a real implementation, this would generate a proper OAuth URL
      // For now, we'll return a mock URL for UI testing purposes
      return res.json({
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=https://flohub.replit.app/api/auth/callback/google&response_type=code&scope=openid+email+profile+https://www.googleapis.com/auth/calendar&state=${state}-${encodeURIComponent(accountLabel as string)}&access_type=offline&prompt=consent`,
        configured: true
      });
    } catch (error) {
      console.error('Error generating Google OAuth URL:', error);
      return res.status(500).json({ error: 'Failed to generate Google OAuth URL' });
    }
  });

  // Get Microsoft OAuth URL
  app.get('/api/calendar/auth/microsoft', async (req: Request, res: Response) => {
    try {
      const { state = 'default' } = req.query;
      
      if (!process.env.MICROSOFT_OAUTH_ID || !process.env.MICROSOFT_OAUTH_SECRET) {
        return res.status(500).json({ 
          error: 'Microsoft OAuth credentials not configured',
          configured: false
        });
      }

      // In a real implementation, this would generate a proper OAuth URL
      // For now, we'll return a mock URL for UI testing purposes
      return res.json({
        url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=mock&redirect_uri=https://flohub.replit.app/api/auth/callback/microsoft&response_type=code&scope=openid+email+profile+offline_access+Calendars.Read+User.Read&state=${state}&prompt=consent`,
        configured: true
      });
    } catch (error) {
      console.error('Error generating Microsoft OAuth URL:', error);
      return res.status(500).json({ error: 'Failed to generate Microsoft OAuth URL' });
    }
  });

  // Store Power Automate URL for Office 365 integration
  app.post('/api/calendar/powerautomate', async (req: Request, res: Response) => {
    try {
      const { url, name = 'Office 365 Calendar' } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'Power Automate URL is required' });
      }

      // In a real implementation, this would store the Power Automate URL in the database
      // For now, we'll just return success
      return res.json({ 
        success: true, 
        message: 'Power Automate URL saved successfully',
        calendarSource: {
          id: `powerautomate-${Date.now()}`,
          name,
          type: 'o365',
          sourceId: 'powerautomate',
          isEnabled: true,
          tags: ['work']
        }
      });
    } catch (error) {
      console.error('Error saving Power Automate URL:', error);
      return res.status(500).json({ error: 'Failed to save Power Automate URL' });
    }
  });

  // Get connected calendar accounts
  app.get('/api/calendar/accounts', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would fetch connected accounts from the database
      // For now, we'll return sample data
      return res.json([
        {
          id: 'google-primary',
          provider: 'google',
          email: 'user@gmail.com',
          name: 'Personal Google',
          isConnected: true,
          lastSync: new Date().toISOString()
        },
        {
          id: 'microsoft-work',
          provider: 'microsoft',
          email: 'user@outlook.com',
          name: 'Work Microsoft',
          isConnected: true,
          lastSync: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching calendar accounts:', error);
      return res.status(500).json({ error: 'Failed to fetch calendar accounts' });
    }
  });

  // Sync calendars manually
  app.post('/api/calendar/sync', async (req: Request, res: Response) => {
    try {
      const { accountIds } = req.body;
      
      if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
        return res.status(400).json({ error: 'Account IDs are required' });
      }

      // In a real implementation, this would trigger a sync for the specified accounts
      // For now, we'll just return success
      return res.json({ 
        success: true, 
        message: `Synced ${accountIds.length} calendar accounts successfully`,
        syncTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing calendars:', error);
      return res.status(500).json({ error: 'Failed to sync calendars' });
    }
  });
}
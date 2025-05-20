import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import { storage } from '../storage';
import {
  getGoogleAuthClient, 
  getGoogleAuthUrl, 
  getGoogleTokens,
  getMsalApp,
  getMicrosoftAuthUrl,
  getMicrosoftTokens,
  fetchAllCalendarEvents
} from '../utils/calendarIntegration';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    calendarSetup?: {
      provider: string;
      name: string;
      tags: string[];
      state?: string;
    };
  }
}

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// ===== Google Calendar Routes =====

// Generate Google Auth URL
router.post('/google/auth-url', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { calendarName, tags } = req.body;
    const userId = req.session.userId as string;
    
    // Store calendar setup info in session
    req.session.calendarSetup = {
      provider: 'google',
      name: calendarName || 'Google Calendar',
      tags: tags || [],
      state: Math.random().toString(36).substring(2, 15)
    };
    
    // Generate auth URL
    const authUrl = getGoogleAuthUrl(userId, req.session.calendarSetup.state);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate Google authentication URL' });
  }
});

// Google OAuth callback handler
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }
    
    // Get tokens
    const tokens = await getGoogleTokens(code as string);
    
    // Get user ID and calendar setup from session or state
    const userId = req.session.userId;
    const calendarSetup = req.session.calendarSetup;
    
    if (!userId) {
      return res.status(401).send('Authentication required. Please log in first.');
    }
    
    // Create calendar source in database
    if (tokens.refresh_token) {
      await storage.createCalendarSource({
        userId: userId,
        name: calendarSetup?.name || 'Google Calendar',
        type: 'google',
        sourceId: 'primary',
        connectionData: JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date || (Date.now() + 3600 * 1000)
        }),
        tags: calendarSetup?.tags || null,
        isEnabled: true
      });
    }
    
    // Redirect back to settings page
    res.redirect('/dashboard/settings?tab=integrations&success=google');
  } catch (error) {
    console.error('Error processing Google callback:', error);
    res.status(500).send('An error occurred during Google Calendar integration.');
  }
});

// ===== Microsoft Calendar Routes =====

// Generate Microsoft Auth URL
router.post('/microsoft/auth-url', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { calendarName, tags } = req.body;
    const userId = req.session.userId as string;
    
    // Store calendar setup info in session
    req.session.calendarSetup = {
      provider: 'microsoft',
      name: calendarName || 'Office 365 Calendar',
      tags: tags || [],
      state: Math.random().toString(36).substring(2, 15)
    };
    
    // Generate auth URL
    const authUrl = await getMicrosoftAuthUrl(userId, req.session.calendarSetup.state);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error);
    res.status(500).json({ error: 'Failed to generate Microsoft authentication URL' });
  }
});

// Microsoft OAuth callback handler
router.get('/microsoft/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }
    
    // Get tokens
    const tokenResult = await getMicrosoftTokens(code as string);
    
    // Get user ID and calendar setup from session
    const userId = req.session.userId;
    const calendarSetup = req.session.calendarSetup;
    
    if (!userId) {
      return res.status(401).send('Authentication required. Please log in first.');
    }
    
    // Create calendar source in database
    if (tokenResult && tokenResult.accessToken) {
      await storage.createCalendarSource({
        userId: userId,
        name: calendarSetup?.name || 'Office 365 Calendar',
        type: 'microsoft',
        sourceId: tokenResult.account?.homeAccountId || 'primary',
        connectionData: JSON.stringify({
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken || '',
          expiresAt: Date.now() + 3600 * 1000, // Default 1 hour expiry
          account: tokenResult.account
        }),
        tags: calendarSetup?.tags || null,
        isEnabled: true
      });
    }
    
    // Redirect back to settings page
    res.redirect('/dashboard/settings?tab=integrations&success=microsoft');
  } catch (error) {
    console.error('Error processing Microsoft callback:', error);
    res.status(500).send('An error occurred during Office 365 Calendar integration.');
  }
});

// ===== Power Automate URL Route =====

// Add Power Automate URL source
router.post('/url-source', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { name, url, tags } = req.body;
    const userId = req.session.userId as string;
    
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

// ===== Calendar Source Management =====

// Get all calendar sources for the current user
router.get('/sources', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as string;
    const sources = await storage.getCalendarSources(userId);
    
    // Remove sensitive data
    const sanitizedSources = sources.map(source => {
      const connectionData = JSON.parse(source.connectionData);
      
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

// Update a calendar source
router.put('/sources/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sourceId = parseInt(req.params.id, 10);
    const userId = req.session.userId as string;
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
router.delete('/sources/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sourceId = parseInt(req.params.id, 10);
    const userId = req.session.userId as string;
    
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

// ===== Calendar Events =====

// Get events from all enabled calendar sources
router.get('/events', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as string;
    const { timeMin, timeMax } = req.query;
    
    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'timeMin and timeMax parameters are required' });
    }
    
    // Use real calendar data if we have sources
    const sources = await storage.getCalendarSources(userId);
    
    if (sources.length > 0) {
      const events = await fetchAllCalendarEvents(
        userId, 
        timeMin as string, 
        timeMax as string
      );
      
      return res.json(events);
    }
    
    // If no sources, return sample data
    const sampleEvents = [
      {
        id: 'sample-1',
        calendarId: 'sample',
        summary: 'Team Meeting',
        start: { dateTime: '2025-05-15T10:00:00Z' },
        end: { dateTime: '2025-05-15T11:00:00Z' },
        source: 'sample',
        calendarName: 'Sample Calendar',
        tags: ['sample', 'meeting']
      },
      {
        id: 'sample-2',
        calendarId: 'sample',
        summary: 'Doctor Appointment',
        start: { dateTime: '2025-05-20T14:30:00Z' },
        end: { dateTime: '2025-05-20T15:30:00Z' },
        source: 'sample',
        calendarName: 'Sample Calendar',
        tags: ['sample', 'health']
      }
    ];
    
    res.json(sampleEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;
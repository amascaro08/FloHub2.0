import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../utils/auth';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';

const router = Router();

// OAuth configuration for Google
const googleOAuthConfig = {
  clientId: process.env.GOOGLE_OAUTH_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_SECRET || '',
  redirectUri: `${process.env.HOST_URL || 'http://localhost:5000'}/api/calendar/google/callback`,
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ],
};

// OAuth configuration for Microsoft
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    authority: 'https://login.microsoftonline.com/common',
  },
};

const msalScopes = ['Calendars.Read', 'Calendars.ReadWrite'];
const msalRedirectUri = `${process.env.HOST_URL || 'http://localhost:5000'}/api/calendar/microsoft/callback`;

// Route to get Google OAuth URL
router.post('/google/auth-url', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { calendarName, tags } = req.body;
    
    // Store calendar settings in session for retrieval after OAuth callback
    req.session.calendarSetup = {
      provider: 'google',
      name: calendarName || 'Google Calendar',
      tags: tags || [],
    };
    await req.session.save();
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      googleOAuthConfig.clientId,
      googleOAuthConfig.clientSecret,
      googleOAuthConfig.redirectUri
    );
    
    // Generate authentication URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleOAuthConfig.scopes,
      prompt: 'consent',
      state: user.id.toString(), // Pass user ID in state parameter
    });
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Google OAuth callback handler
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send('Missing required parameters');
    }
    
    // Retrieve user ID from state parameter
    const userId = parseInt(state as string, 10);
    
    // Exchange authorization code for tokens
    const oauth2Client = new google.auth.OAuth2(
      googleOAuthConfig.clientId,
      googleOAuthConfig.clientSecret,
      googleOAuthConfig.redirectUri
    );
    
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Get calendar setup from session
    const calendarSetup = req.session.calendarSetup;
    
    // Create calendar source in database
    if (tokens.refresh_token) {
      await storage.createCalendarSource({
        userId: userId.toString(),
        name: calendarSetup?.name || 'Google Calendar',
        type: 'google',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
        settings: {
          tags: calendarSetup?.tags || [],
        },
        isEnabled: true,
      });
    }
    
    // Clear calendar setup from session
    delete req.session.calendarSetup;
    await req.session.save();
    
    // Redirect back to calendar settings
    res.redirect('/dashboard/settings?tab=integrations');
  } catch (error) {
    console.error('Error processing Google callback:', error);
    res.status(500).send('Failed to process authentication');
  }
});

// Route to get Microsoft OAuth URL
router.post('/microsoft/auth-url', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { calendarName, tags } = req.body;
    
    // Store calendar settings in session for retrieval after OAuth callback
    req.session.calendarSetup = {
      provider: 'microsoft',
      name: calendarName || 'Office 365 Calendar',
      tags: tags || [],
    };
    await req.session.save();
    
    // Create MSAL application
    const msalApp = new msal.ConfidentialClientApplication(msalConfig);
    
    // Generate authentication URL
    const authUrlParams = {
      scopes: msalScopes,
      redirectUri: msalRedirectUri,
      state: user.id.toString(), // Pass user ID in state parameter
    };
    
    const authUrl = await msalApp.getAuthCodeUrl(authUrlParams);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Microsoft OAuth callback handler
router.get('/microsoft/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send('Missing required parameters');
    }
    
    // Retrieve user ID from state parameter
    const userId = parseInt(state as string, 10);
    
    // Exchange authorization code for tokens
    const msalApp = new msal.ConfidentialClientApplication(msalConfig);
    
    const tokenResponse = await msalApp.acquireTokenByCode({
      code: code as string,
      scopes: msalScopes,
      redirectUri: msalRedirectUri,
    });
    
    // Get calendar setup from session
    const calendarSetup = req.session.calendarSetup;
    
    // Create calendar source in database
    if (tokenResponse.account && tokenResponse.accessToken) {
      await storage.createCalendarSource({
        userId: userId.toString(),
        name: calendarSetup?.name || 'Office 365 Calendar',
        type: 'microsoft',
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || '',
        expiresAt: new Date(Date.now() + (tokenResponse.expiresOn || 3600) * 1000),
        settings: {
          tags: calendarSetup?.tags || [],
          account: tokenResponse.account,
        },
        isEnabled: true,
      });
    }
    
    // Clear calendar setup from session
    delete req.session.calendarSetup;
    await req.session.save();
    
    // Redirect back to calendar settings
    res.redirect('/dashboard/settings?tab=integrations');
  } catch (error) {
    console.error('Error processing Microsoft callback:', error);
    res.status(500).send('Failed to process authentication');
  }
});

// Route to add a Power Automate URL calendar source
router.post('/url-source', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, url, tags } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Create calendar source in database
    const calendarSource = await storage.createCalendarSource({
      userId: user.id.toString(),
      name: name || 'Power Automate Calendar',
      type: 'url',
      accessToken: '',
      refreshToken: '',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // Set expiry far in future
      settings: {
        url,
        tags: tags || [],
      },
      isEnabled: true,
    });
    
    res.json(calendarSource);
  } catch (error) {
    console.error('Error adding URL source:', error);
    res.status(500).json({ error: 'Failed to add calendar source' });
  }
});

// Route to get calendar sources for current user
router.get('/sources', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const sources = await storage.getCalendarSources(user.id.toString());
    
    // Remove sensitive information
    const sanitizedSources = sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      isEnabled: source.isEnabled,
      settings: { 
        tags: source.settings?.tags || [],
        url: source.type === 'url' ? source.settings?.url : undefined,
      },
    }));
    
    res.json(sanitizedSources);
  } catch (error) {
    console.error('Error fetching calendar sources:', error);
    res.status(500).json({ error: 'Failed to fetch calendar sources' });
  }
});

// Route to update a calendar source
router.put('/sources/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isEnabled, tags } = req.body;
    
    const source = await storage.getCalendarSource(parseInt(id, 10));
    
    if (!source) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }
    
    // Ensure user owns this calendar source
    if (source.userId !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this calendar source' });
    }
    
    // Update source
    const updatedSource = await storage.updateCalendarSource(parseInt(id, 10), {
      name: name || source.name,
      isEnabled: isEnabled !== undefined ? isEnabled : source.isEnabled,
      settings: {
        ...source.settings,
        tags: tags || source.settings?.tags || [],
      },
    });
    
    res.json(updatedSource);
  } catch (error) {
    console.error('Error updating calendar source:', error);
    res.status(500).json({ error: 'Failed to update calendar source' });
  }
});

// Route to delete a calendar source
router.delete('/sources/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const source = await storage.getCalendarSource(parseInt(id, 10));
    
    if (!source) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }
    
    // Ensure user owns this calendar source
    if (source.userId !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this calendar source' });
    }
    
    // Delete source
    await storage.deleteCalendarSource(parseInt(id, 10));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar source:', error);
    res.status(500).json({ error: 'Failed to delete calendar source' });
  }
});

// Route to fetch calendar events
router.get('/events', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { timeMin, timeMax } = req.query;
    
    // For now, return sample data (we'll implement the real fetching later)
    const sampleEvents = [
      {
        id: '123',
        calendarId: 'primary',
        summary: 'Team Meeting',
        start: { dateTime: '2025-05-15T10:00:00Z' },
        end: { dateTime: '2025-05-15T11:00:00Z' },
        source: 'work',
        calendarName: 'Work Calendar',
        tags: ['important', 'meeting']
      },
      {
        id: '456',
        calendarId: 'personal',
        summary: 'Doctor Appointment',
        start: { dateTime: '2025-05-20T14:30:00Z' },
        end: { dateTime: '2025-05-20T15:30:00Z' },
        source: 'personal',
        calendarName: 'Personal Calendar',
        tags: ['health']
      }
    ];
    
    res.json(sampleEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;
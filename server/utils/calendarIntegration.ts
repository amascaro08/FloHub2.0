import { google, calendar_v3 } from 'googleapis';
import * as msal from '@azure/msal-node';
import fetch from 'node-fetch';
import { storage } from '../storage';
import { CalendarSource } from '@shared/schema';

// ===== Google Calendar Integration =====

// Configure Google OAuth
const googleConfig = {
  clientId: process.env.GOOGLE_OAUTH_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_SECRET || '',
  redirectUri: `${process.env.HOST_URL || 'http://localhost:5000'}/api/calendar/google/callback`,
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ],
};

// Create Google OAuth client
export function getGoogleAuthClient() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
}

// Generate Google authentication URL
export function getGoogleAuthUrl(userId: string, state: string = '') {
  const oauth2Client = getGoogleAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleConfig.scopes,
    prompt: 'consent',
    state: state || userId, // Use state for tracking or fall back to userId
  });
}

// Exchange code for tokens
export async function getGoogleTokens(code: string) {
  const oauth2Client = getGoogleAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Create authenticated Google Calendar client
export async function getGoogleCalendarClient(source: CalendarSource) {
  try {
    // Parse connection data
    const connectionData = JSON.parse(source.connectionData);
    const { accessToken, refreshToken, expiresAt } = connectionData;
    
    const oauth2Client = getGoogleAuthClient();
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiresAt
    });
    
    // Check if token needs refresh
    if (Date.now() >= expiresAt) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await storage.updateCalendarSource(source.id, {
        connectionData: JSON.stringify({
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || refreshToken,
          expiresAt: credentials.expiry_date
        })
      });
    }
    
    // Return calendar client
    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error creating Google Calendar client:', error);
    throw new Error('Failed to create Google Calendar client');
  }
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(
  source: CalendarSource,
  timeMin: string,
  timeMax: string
) {
  try {
    const calendar = await getGoogleCalendarClient(source);
    
    const response = await calendar.events.list({
      calendarId: source.sourceId || 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // Format events
    return (response.data.items || []).map(event => ({
      id: event.id || '',
      calendarId: source.sourceId || 'primary',
      summary: event.summary || 'Untitled Event',
      start: event.start,
      end: event.end,
      description: event.description,
      location: event.location,
      calendarName: source.name,
      source: 'google',
      tags: source.tags || [],
    }));
  } catch (error) {
    console.error(`Error fetching Google Calendar events for source ${source.id}:`, error);
    return [];
  }
}

// ===== Microsoft Office 365 Integration =====

// Configure Microsoft OAuth
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    authority: 'https://login.microsoftonline.com/common',
  },
};

const msalScopes = ['Calendars.Read', 'Calendars.ReadWrite'];
const msalRedirectUri = `${process.env.HOST_URL || 'http://localhost:5000'}/api/calendar/microsoft/callback`;

// Create MSAL application
export function getMsalApp() {
  return new msal.ConfidentialClientApplication(msalConfig);
}

// Generate Microsoft authentication URL
export async function getMicrosoftAuthUrl(userId: string, state: string = '') {
  const msalApp = getMsalApp();
  
  const authUrlParams = {
    scopes: msalScopes,
    redirectUri: msalRedirectUri,
    state: state || userId, // Use state for tracking or fall back to userId
  };
  
  return await msalApp.getAuthCodeUrl(authUrlParams);
}

// Exchange code for tokens
export async function getMicrosoftTokens(code: string) {
  const msalApp = getMsalApp();
  
  return await msalApp.acquireTokenByCode({
    code,
    scopes: msalScopes,
    redirectUri: msalRedirectUri,
  });
}

// Fetch events from Microsoft Calendar
export async function fetchMicrosoftCalendarEvents(
  source: CalendarSource,
  timeMin: string,
  timeMax: string
) {
  try {
    // Parse connection data
    const connectionData = JSON.parse(source.connectionData);
    const { accessToken, refreshToken, expiresAt } = connectionData;
    
    // Check if token needs refresh
    if (Date.now() >= expiresAt) {
      const msalApp = getMsalApp();
      
      // Try to refresh token
      if (refreshToken) {
        const refreshResult = await msalApp.acquireTokenByRefreshToken({
          refreshToken,
          scopes: msalScopes,
        });
        
        if (refreshResult && refreshResult.accessToken) {
          // Update tokens in database
          await storage.updateCalendarSource(source.id, {
            connectionData: JSON.stringify({
              accessToken: refreshResult.accessToken,
              refreshToken: refreshResult.refreshToken || refreshToken,
              expiresAt: Date.now() + (refreshResult.expiresOn || 3600) * 1000,
              account: refreshResult.account
            })
          });
        }
      }
    }
    
    // Fetch events from Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${timeMin}&endDateTime=${timeMax}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format events
    return (data.value || []).map((event: any) => ({
      id: event.id || '',
      calendarId: event.calendar?.id || source.sourceId || 'primary',
      summary: event.subject || 'Untitled Event',
      start: {
        dateTime: event.start.dateTime,
        timeZone: event.start.timeZone,
      },
      end: {
        dateTime: event.end.dateTime,
        timeZone: event.end.timeZone,
      },
      description: event.bodyPreview,
      location: event.location?.displayName,
      calendarName: source.name,
      source: 'microsoft',
      tags: source.tags || [],
    }));
  } catch (error) {
    console.error(`Error fetching Microsoft Calendar events for source ${source.id}:`, error);
    return [];
  }
}

// ===== Power Automate URL Integration =====

// Fetch events from Power Automate URL
export async function fetchPowerAutomateEvents(
  source: CalendarSource,
  timeMin: string,
  timeMax: string
) {
  try {
    // Parse connection data to get URL
    const connectionData = JSON.parse(source.connectionData);
    const { url } = connectionData;
    
    if (!url) {
      throw new Error('No URL provided in connection data');
    }
    
    // Make request to Power Automate URL
    // Add timeMin and timeMax as query parameters
    const separator = url.includes('?') ? '&' : '?';
    const urlWithParams = `${url}${separator}timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;
    
    const response = await fetch(urlWithParams);
    
    if (!response.ok) {
      throw new Error(`Power Automate URL error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format events - expect Power Automate to return data in a compatible format
    // If needed, transform the data to match our expected format
    return (data.events || data.items || data || []).map((event: any) => ({
      id: event.id || `pa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      calendarId: event.calendarId || 'power-automate',
      summary: event.summary || event.title || 'Untitled Event',
      start: event.start,
      end: event.end,
      description: event.description,
      location: event.location,
      calendarName: source.name,
      source: 'url',
      tags: source.tags || [],
    }));
  } catch (error) {
    console.error(`Error fetching Power Automate events for source ${source.id}:`, error);
    return [];
  }
}

// ===== Combined Calendar Functions =====

// Fetch events from all enabled calendar sources
export async function fetchAllCalendarEvents(userId: string, timeMin: string, timeMax: string) {
  try {
    // Get all enabled calendar sources for the user
    const sources = await storage.getCalendarSources(userId);
    const enabledSources = sources.filter(source => source.isEnabled);
    
    if (enabledSources.length === 0) {
      return [];
    }
    
    // Fetch events from each source in parallel
    const eventPromises = enabledSources.map(source => {
      switch (source.type) {
        case 'google':
          return fetchGoogleCalendarEvents(source, timeMin, timeMax);
        case 'microsoft':
        case 'o365':
          return fetchMicrosoftCalendarEvents(source, timeMin, timeMax);
        case 'url':
          return fetchPowerAutomateEvents(source, timeMin, timeMax);
        default:
          console.warn(`Unknown calendar source type: ${source.type}`);
          return Promise.resolve([]);
      }
    });
    
    // Wait for all promises to resolve
    const eventsArrays = await Promise.all(eventPromises);
    
    // Flatten the arrays of events
    return eventsArrays.flat();
  } catch (error) {
    console.error('Error fetching all calendar events:', error);
    return [];
  }
}
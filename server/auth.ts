import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Simplified authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // In a real application, we would check for a valid session
  // For now, we'll just allow all requests through for demo purposes
  next();
};

// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_OAUTH_ID,
  clientSecret: process.env.GOOGLE_OAUTH_SECRET,
  redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : null,
  scopes: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ]
};

// Office 365/Microsoft OAuth configuration
export const microsoftOAuthConfig = {
  clientId: process.env.MICROSOFT_OAUTH_ID,
  clientSecret: process.env.MICROSOFT_OAUTH_SECRET,
  redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/microsoft` : null,
  scopes: [
    'openid',
    'email',
    'profile',
    'offline_access',
    'Calendars.Read',
    'Calendars.ReadWrite',
    'User.Read'
  ]
};

// Check if the OAuth configurations are available
export const isGoogleOAuthConfigured = () => {
  return !!(googleOAuthConfig.clientId && googleOAuthConfig.clientSecret && googleOAuthConfig.redirectUri);
};

export const isMicrosoftOAuthConfigured = () => {
  return !!(microsoftOAuthConfig.clientId && microsoftOAuthConfig.clientSecret && microsoftOAuthConfig.redirectUri);
};

// Functions to generate OAuth URLs for both providers
export const getGoogleOAuthUrl = (state: string = 'default-state') => {
  if (!isGoogleOAuthConfigured()) {
    throw new Error('Google OAuth is not properly configured');
  }

  const scopes = googleOAuthConfig.scopes.join(' ');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', googleOAuthConfig.clientId!);
  url.searchParams.append('redirect_uri', googleOAuthConfig.redirectUri!);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes);
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('state', state);
  url.searchParams.append('prompt', 'consent');
  
  return url.toString();
};

export const getMicrosoftOAuthUrl = (state: string = 'default-state') => {
  if (!isMicrosoftOAuthConfigured()) {
    throw new Error('Microsoft OAuth is not properly configured');
  }
  
  const scopes = microsoftOAuthConfig.scopes.join(' ');
  const url = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  url.searchParams.append('client_id', microsoftOAuthConfig.clientId!);
  url.searchParams.append('redirect_uri', microsoftOAuthConfig.redirectUri!);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes);
  url.searchParams.append('state', state);
  url.searchParams.append('prompt', 'consent');
  
  return url.toString();
};

// Function to handle storing OAuth tokens
export const storeOAuthToken = async (userId: string, provider: 'google' | 'microsoft', accountLabel: string, tokens: any) => {
  // In a real application, we would store these tokens securely in the database
  // For now, we'll just log them for demo purposes
  console.log(`Storing ${provider} OAuth tokens for user ${userId}, account "${accountLabel}"`);
  return true;
};

// Function to refresh an OAuth token
export const refreshOAuthToken = async (provider: 'google' | 'microsoft', refreshToken: string) => {
  // In a real application, we would use the refresh token to get a new access token
  // For now, we'll just return a mock token
  return {
    access_token: 'mock-refreshed-access-token',
    expires_in: 3600,
    refresh_token: refreshToken,
  };
};
import { OAuth2Client } from 'google-auth-library';

// Define the Google OAuth2 scopes needed for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'email',
  'profile',
  'openid'
];

/**
 * Creates a Google OAuth2 client
 */
export function createOAuth2Client() {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
  });
}

/**
 * Generates a Google OAuth2 authorization URL
 */
export function getGoogleAuthUrl(state = 'default', accountLabel = 'Personal') {
  const oauth2Client = createOAuth2Client();
  
  // Include the account label in the state parameter
  const combinedState = encodeURIComponent(`${state}:${accountLabel}`);
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: combinedState,
    prompt: 'consent' // Force consent screen to ensure we get a refresh token
  });
}

/**
 * Exchanges a code for Google OAuth2 tokens
 */
export async function getGoogleTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Refreshes a Google OAuth2 access token
 */
export async function refreshGoogleAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Creates an authenticated Google OAuth2 client with tokens
 */
export function createAuthenticatedClient(tokens: any) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Helper to check if tokens are expired
 */
export function isTokenExpired(tokens: any) {
  if (!tokens.expiry_date) return true;
  return tokens.expiry_date <= Date.now();
}
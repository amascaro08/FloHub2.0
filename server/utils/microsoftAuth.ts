import fetch from 'node-fetch';

// Define Microsoft OAuth2 scopes needed for calendar access
const SCOPES = [
  'offline_access',
  'openid',
  'profile',
  'email',
  'Calendars.Read',
  'Calendars.ReadWrite',
  'User.Read'
];

// Microsoft OAuth constants
const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const GRAPH_URL = 'https://graph.microsoft.com/v1.0';

/**
 * Generates a Microsoft OAuth2 authorization URL
 */
export function getMicrosoftAuthUrl(state = 'default') {
  if (!process.env.MICROSOFT_OAUTH_ID) {
    throw new Error('Microsoft OAuth client ID is missing');
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/microsoft`;
  const scope = SCOPES.join(' ');
  
  const authUrl = new URL(`${AUTHORITY}/authorize`);
  authUrl.searchParams.append('client_id', process.env.MICROSOFT_OAUTH_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('prompt', 'consent');
  
  return authUrl.toString();
}

/**
 * Exchanges a code for Microsoft OAuth2 tokens
 */
export async function getMicrosoftTokensFromCode(code: string) {
  if (!process.env.MICROSOFT_OAUTH_ID || !process.env.MICROSOFT_OAUTH_SECRET) {
    throw new Error('Microsoft OAuth credentials are missing');
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/microsoft`;
  
  const tokenUrl = `${AUTHORITY}/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_OAUTH_ID,
      client_secret: process.env.MICROSOFT_OAUTH_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get Microsoft tokens: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Refreshes a Microsoft OAuth2 access token
 */
export async function refreshMicrosoftAccessToken(refreshToken: string) {
  if (!process.env.MICROSOFT_OAUTH_ID || !process.env.MICROSOFT_OAUTH_SECRET) {
    throw new Error('Microsoft OAuth credentials are missing');
  }

  const tokenUrl = `${AUTHORITY}/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_OAUTH_ID,
      client_secret: process.env.MICROSOFT_OAUTH_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to refresh Microsoft token: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Creates headers for authenticated Microsoft Graph API requests
 */
export function createMicrosoftAuthHeaders(accessToken: string) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Helper to check if tokens are expired
 */
export function isMicrosoftTokenExpired(tokens: any) {
  if (!tokens.expires_at) return true;
  return tokens.expires_at <= Date.now();
}

/**
 * Fetches user information from Microsoft Graph API
 */
export async function fetchMicrosoftUserInfo(accessToken: string) {
  const response = await fetch(`${GRAPH_URL}/me`, {
    headers: createMicrosoftAuthHeaders(accessToken),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch Microsoft user info: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}
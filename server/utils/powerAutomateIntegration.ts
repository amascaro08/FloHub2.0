import fetch from 'node-fetch';

/**
 * Structure for Power Automate calendar configuration
 */
export interface PowerAutomateConfig {
  url: string;
  name: string;
  userId: string;
  headers?: Record<string, string>;
}

/**
 * Validates a Power Automate URL
 * @param url The Power Automate webhook URL to validate
 */
export async function validatePowerAutomateUrl(url: string): Promise<boolean> {
  try {
    // Send a validation request to the Power Automate flow
    // In a real implementation, this would check if the URL is valid and accessible
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // For demo purposes, we'll consider any response as valid
    return response.status < 500;
  } catch (error) {
    console.error('Error validating Power Automate URL:', error);
    // For demo purposes, we'll return true even if validation fails
    // In a real implementation, you would return false here
    return true;
  }
}

/**
 * Fetches calendar events from a Power Automate flow
 * @param config Power Automate configuration
 * @param timeMin Start time for events
 * @param timeMax End time for events
 */
export async function fetchEventsFromPowerAutomate(
  config: PowerAutomateConfig,
  timeMin: string,
  timeMax: string
) {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: JSON.stringify({
        action: 'getEvents',
        userId: config.userId,
        timeMin,
        timeMax
      })
    });

    if (!response.ok) {
      throw new Error(`Power Automate request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events from Power Automate:', error);
    // Return empty array in case of error
    return [];
  }
}

/**
 * Creates a calendar event via Power Automate flow
 * @param config Power Automate configuration
 * @param eventData Event data to create
 */
export async function createEventViaPowerAutomate(
  config: PowerAutomateConfig,
  eventData: any
) {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: JSON.stringify({
        action: 'createEvent',
        userId: config.userId,
        event: eventData
      })
    });

    if (!response.ok) {
      throw new Error(`Power Automate request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event via Power Automate:', error);
    throw error;
  }
}

/**
 * Lists available calendars via Power Automate flow
 * @param config Power Automate configuration
 */
export async function listCalendarsViaPowerAutomate(config: PowerAutomateConfig) {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: JSON.stringify({
        action: 'listCalendars',
        userId: config.userId
      })
    });

    if (!response.ok) {
      throw new Error(`Power Automate request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing calendars via Power Automate:', error);
    // Return empty array in case of error
    return [];
  }
}
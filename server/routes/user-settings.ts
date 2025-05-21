import express from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

const router = express.Router();

// Validation schemas
const userSettingsSchema = z.object({
  defaultView: z.string().optional(),
  activeWidgets: z.array(z.string()).optional(),
  globalTags: z.array(z.string()).optional(),
  selectedCals: z.array(z.string()).optional(),
  powerAutomateUrl: z.string().optional(),
  calendarSources: z.array(z.any()).optional(), // Allow calendar sources to be updated through user settings
});

// Get user settings
router.get('/api/user-settings', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user settings
    const settings = await storage.getUserSettings(userId);
    
    // If settings don't exist, create default settings
    if (!settings) {
      const defaultSettings = {
        userId,
        globalTags: [],
        selectedCals: [],
        defaultView: 'week',
        activeWidgets: ['calendar', 'tasks', 'ataglance', 'quicknote'],
      };
      
      const createdSettings = await storage.createUserSettings(defaultSettings);
      return res.json(createdSettings);
    }

    // Include calendar sources with the settings
    const calendarSources = await storage.getCalendarSources(userId);
    
    return res.json({
      ...settings,
      calendarSources
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// Update user settings
router.put('/api/user-settings', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Extract calendar sources from request for special handling
    const { calendarSources, ...otherSettings } = req.body;

    // Validate settings
    const validationResult = userSettingsSchema.omit({ calendarSources: true }).safeParse(otherSettings);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid settings data', 
        details: validationResult.error.format() 
      });
    }

    const settingsData = validationResult.data;

    // Update calendar sources if provided
    if (Array.isArray(calendarSources)) {
      console.log('Updating calendar sources through settings API:', calendarSources);
      
      // Get existing sources to compare
      const existingSources = await storage.getCalendarSources(userId);
      
      // For each calendar source in the request
      for (const source of calendarSources) {
        if (source.id) {
          // Update existing source
          const existingSource = existingSources.find(s => s.id === source.id);
          if (existingSource) {
            // Only update if it belongs to this user
            if (existingSource.userId === userId) {
              console.log(`Updating calendar source ${source.id}:`, source);
              await storage.updateCalendarSource(source.id, {
                ...source,
                userId // Ensure userId is set correctly
              });
            }
          }
        } else {
          // Create new source
          console.log('Creating new calendar source:', source);
          await storage.createCalendarSource({
            ...source,
            userId
          });
        }
      }
      
      // Delete sources that are no longer in the list
      for (const existingSource of existingSources) {
        if (!calendarSources.some(s => s.id === existingSource.id)) {
          console.log(`Deleting calendar source ${existingSource.id}`);
          await storage.deleteCalendarSource(existingSource.id);
        }
      }
    }

    // Update other settings
    const updatedSettings = await storage.updateUserSettings(userId, settingsData);
    if (!updatedSettings) {
      // If settings don't exist, create them
      const newSettings = await storage.createUserSettings({
        userId,
        ...settingsData
      });
      
      // Get updated calendar sources
      const updatedCalendarSources = await storage.getCalendarSources(userId);
      
      return res.json({
        ...newSettings,
        calendarSources: updatedCalendarSources
      });
    }
    
    // Get updated calendar sources
    const updatedCalendarSources = await storage.getCalendarSources(userId);
    
    return res.json({
      ...updatedSettings,
      calendarSources: updatedCalendarSources
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

export default router;
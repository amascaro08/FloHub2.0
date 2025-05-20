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

    // Validate settings
    const validationResult = userSettingsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid settings data', 
        details: validationResult.error.format() 
      });
    }

    const settingsData = validationResult.data;

    // Update the settings
    const updatedSettings = await storage.updateUserSettings(userId, settingsData);
    if (!updatedSettings) {
      // If settings don't exist, create them
      const newSettings = await storage.createUserSettings({
        userId,
        ...settingsData
      });
      return res.json(newSettings);
    }
    
    // Return updated settings with calendar sources
    const calendarSources = await storage.getCalendarSources(userId);
    
    return res.json({
      ...updatedSettings,
      calendarSources
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

export default router;
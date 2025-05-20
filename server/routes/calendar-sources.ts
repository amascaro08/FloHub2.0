import express from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

const router = express.Router();

// Validation schemas
const calendarSourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['google', 'o365', 'url', 'ical']),
  sourceId: z.string().min(1),
  connectionData: z.string().optional(),
  isEnabled: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

// Get all calendar sources for the user
router.get('/api/calendar/sources', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sources = await storage.getCalendarSources(userId);
    res.json(sources);
  } catch (error) {
    console.error('Error fetching calendar sources:', error);
    res.status(500).json({ error: 'Failed to fetch calendar sources' });
  }
});

// Get a single calendar source
router.get('/api/calendar/sources/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sourceId = parseInt(req.params.id, 10);
    if (isNaN(sourceId)) {
      return res.status(400).json({ error: 'Invalid source ID' });
    }

    const source = await storage.getCalendarSource(sourceId);
    if (!source) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }

    // Check if this source belongs to the current user
    if (source.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to access this calendar source' });
    }

    res.json(source);
  } catch (error) {
    console.error('Error fetching calendar source:', error);
    res.status(500).json({ error: 'Failed to fetch calendar source' });
  }
});

// Create a new calendar source
router.post('/api/calendar/sources', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate source data
    const validationResult = calendarSourceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid calendar source data', 
        details: validationResult.error.format() 
      });
    }

    const sourceData = {
      ...validationResult.data,
      userId
    };

    // Create the calendar source
    const newSource = await storage.createCalendarSource(sourceData);
    res.status(201).json(newSource);
  } catch (error) {
    console.error('Error creating calendar source:', error);
    res.status(500).json({ error: 'Failed to create calendar source' });
  }
});

// Update a calendar source
router.put('/api/calendar/sources/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sourceId = parseInt(req.params.id, 10);
    if (isNaN(sourceId)) {
      return res.status(400).json({ error: 'Invalid source ID' });
    }

    // Get the existing source to check ownership
    const existingSource = await storage.getCalendarSource(sourceId);
    if (!existingSource) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }

    // Check if this source belongs to the current user
    if (existingSource.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this calendar source' });
    }

    // Validate source data
    const validationResult = calendarSourceSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid calendar source data', 
        details: validationResult.error.format() 
      });
    }

    const sourceData = validationResult.data;

    // Update the calendar source
    const updatedSource = await storage.updateCalendarSource(sourceId, sourceData);
    if (!updatedSource) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }

    res.json(updatedSource);
  } catch (error) {
    console.error('Error updating calendar source:', error);
    res.status(500).json({ error: 'Failed to update calendar source' });
  }
});

// Delete a calendar source
router.delete('/api/calendar/sources/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sourceId = parseInt(req.params.id, 10);
    if (isNaN(sourceId)) {
      return res.status(400).json({ error: 'Invalid source ID' });
    }

    // Get the existing source to check ownership
    const existingSource = await storage.getCalendarSource(sourceId);
    if (!existingSource) {
      return res.status(404).json({ error: 'Calendar source not found' });
    }

    // Check if this source belongs to the current user
    if (existingSource.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this calendar source' });
    }

    // Delete the calendar source
    const success = await storage.deleteCalendarSource(sourceId);
    if (!success) {
      return res.status(404).json({ error: 'Failed to delete calendar source' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar source:', error);
    res.status(500).json({ error: 'Failed to delete calendar source' });
  }
});

export default router;
import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { 
  insertJournalEntrySchema, 
  insertJournalMoodSchema, 
  insertJournalActivitySchema 
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all journal entries for the authenticated user
router.get("/entries", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const entries = await storage.getJournalEntries(userId);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
});

// Get journal entry by date
router.get("/entries/:date", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date } = req.params;
    const entry = await storage.getJournalEntriesByDate(userId, date);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    res.json(entry);
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ message: "Failed to fetch journal entry" });
  }
});

// Get journal entries for a specific month
router.get("/entries/month/:year/:month", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { year, month } = req.params;
    const entries = await storage.getJournalEntriesForMonth(userId, parseInt(year), parseInt(month));
    res.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries for month:", error);
    res.status(500).json({ message: "Failed to fetch journal entries for month" });
  }
});

// Create or update a journal entry
router.post("/entries", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date, content } = req.body;
    
    // Validate input
    const parsed = insertJournalEntrySchema.safeParse({
      userId,
      date,
      content
    });
    
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.format() });
    }
    
    // Check if entry exists and update, or create new
    const entry = await storage.updateJournalEntry(userId, date, content);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating/updating journal entry:", error);
    res.status(500).json({ message: "Failed to create/update journal entry" });
  }
});

// Delete a journal entry
router.delete("/entries/:date", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date } = req.params;
    
    const success = await storage.deleteJournalEntry(userId, date);
    
    if (!success) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
});

// Get all mood entries for the authenticated user
router.get("/moods", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const moods = await storage.getJournalMoods(userId);
    res.json(moods);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({ message: "Failed to fetch mood entries" });
  }
});

// Get mood entry by date
router.get("/moods/:date", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date } = req.params;
    const mood = await storage.getJournalMoodByDate(userId, date);
    
    if (!mood) {
      return res.status(404).json({ message: "Mood entry not found" });
    }
    
    res.json(mood);
  } catch (error) {
    console.error("Error fetching mood entry:", error);
    res.status(500).json({ message: "Failed to fetch mood entry" });
  }
});

// Get mood entries for a specific month
router.get("/moods/month/:year/:month", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { year, month } = req.params;
    const moods = await storage.getJournalMoodsForMonth(userId, parseInt(year), parseInt(month));
    res.json(moods);
  } catch (error) {
    console.error("Error fetching mood entries for month:", error);
    res.status(500).json({ message: "Failed to fetch mood entries for month" });
  }
});

// Create or update a mood entry
router.post("/moods", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date, emoji, label, tags } = req.body;
    
    // Validate input
    const parsed = insertJournalMoodSchema.safeParse({
      userId,
      date,
      emoji,
      label,
      tags: tags || []
    });
    
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.format() });
    }
    
    // Update or create mood entry
    const mood = await storage.updateJournalMood(userId, date, {
      emoji,
      label,
      tags: tags || []
    });
    
    res.status(201).json(mood);
  } catch (error) {
    console.error("Error creating/updating mood entry:", error);
    res.status(500).json({ message: "Failed to create/update mood entry" });
  }
});

// Delete a mood entry
router.delete("/moods/:date", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date } = req.params;
    
    const success = await storage.deleteJournalMood(userId, date);
    
    if (!success) {
      return res.status(404).json({ message: "Mood entry not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    res.status(500).json({ message: "Failed to delete mood entry" });
  }
});

// Get all activities for the authenticated user
router.get("/activities", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const activities = await storage.getJournalActivities(userId);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

// Get activities for a specific month - must be defined BEFORE the :date route to avoid conflicts
router.get("/activities/month/:year/:month", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { year, month } = req.params;
    
    // Get all activities for the user
    const allActivities = await storage.getJournalActivities(userId);
    
    // Filter to only include activities from the specified month
    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthEnd = new Date(parseInt(year), parseInt(month), 0);
    
    const activitiesForMonth = allActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= monthStart && activityDate <= monthEnd;
    });
    
    res.json(activitiesForMonth);
  } catch (error) {
    console.error("Error fetching activities for month:", error);
    res.status(500).json({ message: "Failed to fetch activities for month" });
  }
});

// Get activities by date
router.get("/activities/:date", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date } = req.params;
    const activities = await storage.getJournalActivitiesByDate(userId, date);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities by date:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

// Create a new activity
router.post("/activities", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const { date, type, name, duration, notes } = req.body;
    
    // Validate input
    const parsed = insertJournalActivitySchema.safeParse({
      userId,
      date,
      type,
      name,
      duration,
      notes
    });
    
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.format() });
    }
    
    // Create new activity
    const activity = await storage.createJournalActivity(parsed.data);
    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Failed to create activity" });
  }
});

// Update an activity
router.put("/activities/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { type, name, duration, notes } = req.body;
    
    const activity = await storage.updateJournalActivity(parseInt(id), {
      type,
      name,
      duration,
      notes
    });
    
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.json(activity);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ message: "Failed to update activity" });
  }
});

// Delete an activity
router.delete("/activities/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await storage.deleteJournalActivity(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Failed to delete activity" });
  }
});

export default router;
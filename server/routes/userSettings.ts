// server/routes/userSettings.ts
import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Get user settings
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get or create user settings
    let settings = await storage.getUserSettings(userId);
    
    // If settings don't exist, create them with defaults
    if (!settings) {
      settings = await storage.createUserSettings({
        userId,
        selectedCals: [],
        defaultView: "month",
        globalTags: [],
        activeWidgets: ["tasks", "calendar", "ataglance", "quicknote"]
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ message: "Failed to fetch user settings" });
  }
});

// Update user settings
router.put("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate request body
    const updateSchema = z.object({
      selectedCals: z.array(z.string()).optional(),
      defaultView: z.string().optional(),
      globalTags: z.array(z.string()).optional(),
      activeWidgets: z.array(z.string()).optional(),
    });
    
    const settingsData = updateSchema.safeParse(req.body);
    
    if (!settingsData.success) {
      return res.status(400).json({ message: "Invalid settings data", errors: settingsData.error.errors });
    }
    
    // Check if user settings exist
    let existingSettings = await storage.getUserSettings(userId);
    
    let updatedSettings;
    if (existingSettings) {
      // Update existing settings
      updatedSettings = await storage.updateUserSettings(userId, settingsData.data);
    } else {
      // Create new settings
      updatedSettings = await storage.createUserSettings({
        userId,
        ...settingsData.data,
      });
    }
    
    if (!updatedSettings) {
      return res.status(500).json({ message: "Failed to update user settings" });
    }
    
    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ message: "Failed to update user settings" });
  }
});

// Add a global tag
router.post("/tags", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate request body
    const tagSchema = z.object({
      tag: z.string().min(1),
    });
    
    const { tag } = tagSchema.parse(req.body);
    
    // Get current user settings
    let settings = await storage.getUserSettings(userId);
    
    if (!settings) {
      // Create settings with the new tag
      settings = await storage.createUserSettings({
        userId,
        globalTags: [tag],
        selectedCals: [],
        defaultView: "month",
        activeWidgets: ["tasks", "calendar", "ataglance", "quicknote"]
      });
    } else {
      // Add tag if it doesn't exist already
      const currentTags = settings.globalTags || [];
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        settings = await storage.updateUserSettings(userId, { 
          globalTags: updatedTags 
        });
      }
    }
    
    if (!settings) {
      return res.status(500).json({ message: "Failed to update user settings" });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error adding tag:", error);
    res.status(500).json({ message: "Failed to add tag" });
  }
});

// Remove a global tag
router.delete("/tags/:tag", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const tagToRemove = req.params.tag;
    
    // Get current user settings
    let settings = await storage.getUserSettings(userId);
    
    if (!settings) {
      return res.status(404).json({ message: "User settings not found" });
    }
    
    // Remove tag if it exists
    const currentTags = settings.globalTags || [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    settings = await storage.updateUserSettings(userId, { 
      globalTags: updatedTags 
    });
    
    if (!settings) {
      return res.status(500).json({ message: "Failed to update user settings" });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error removing tag:", error);
    res.status(500).json({ message: "Failed to remove tag" });
  }
});

export default router;
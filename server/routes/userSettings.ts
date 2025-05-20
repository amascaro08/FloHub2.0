import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";

const router = Router();

// Get user settings
router.get("/api/user-settings", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const settings = await storage.getUserSettings(userId);
    if (!settings) {
      // If no settings found, create default settings
      const defaultSettings = {
        userId,
        globalTags: [],
        selectedCals: [],
        defaultView: "week",
        activeWidgets: ["calendar", "tasks"]
      };
      
      const newSettings = await storage.createUserSettings(defaultSettings);
      return res.json(newSettings);
    }
    
    return res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch user settings" });
  }
});

// Update user settings
router.put("/api/user-settings", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = req.body;
    
    // Make sure we only update this user's settings
    if (updates.userId && updates.userId !== userId) {
      return res.status(403).json({ error: "Cannot update settings for another user" });
    }
    
    // Ensure userId is set correctly
    updates.userId = userId;
    
    const updatedSettings = await storage.updateUserSettings(userId, updates);
    if (!updatedSettings) {
      // If settings don't exist, create them
      const defaultSettings = {
        userId,
        ...updates,
        // Ensure these fields have defaults if not provided
        globalTags: updates.globalTags || [],
        selectedCals: updates.selectedCals || [],
        defaultView: updates.defaultView || "week",
        activeWidgets: updates.activeWidgets || ["calendar", "tasks"]
      };
      
      const newSettings = await storage.createUserSettings(defaultSettings);
      return res.json(newSettings);
    }
    
    return res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update user settings" });
  }
});

// Add a tag to global tags
router.post("/api/user-settings/tags", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }

    // Get current settings
    let settings = await storage.getUserSettings(userId);
    
    if (!settings) {
      // Create default settings with the new tag
      settings = await storage.createUserSettings({
        userId,
        globalTags: [tag],
        selectedCals: [],
        defaultView: "week",
        activeWidgets: ["calendar", "tasks"]
      });
    } else {
      // Add tag if it doesn't already exist
      const currentTags = settings.globalTags || [];
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        settings = await storage.updateUserSettings(userId, {
          globalTags: updatedTags
        });
      }
    }
    
    return res.json(settings);
  } catch (error) {
    console.error("Error adding tag:", error);
    res.status(500).json({ error: "Failed to add tag" });
  }
});

// Remove a tag from global tags
router.delete("/api/user-settings/tags/:tag", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { tag } = req.params;
    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }

    // Get current settings
    const settings = await storage.getUserSettings(userId);
    if (!settings) {
      return res.status(404).json({ error: "User settings not found" });
    }
    
    // Remove tag
    const currentTags = settings.globalTags || [];
    const updatedTags = currentTags.filter(t => t !== tag);
    const updatedSettings = await storage.updateUserSettings(userId, {
      globalTags: updatedTags
    });
    
    return res.json(updatedSettings);
  } catch (error) {
    console.error("Error removing tag:", error);
    res.status(500).json({ error: "Failed to remove tag" });
  }
});

export default router;
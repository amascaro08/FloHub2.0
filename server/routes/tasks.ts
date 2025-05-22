import { Router } from "express";
import { requireAuth } from "../routes/auth";  // Use the consistent auth middleware
import { taskService } from "../services/taskService";
import { z } from "zod";

const router = Router();

// Task validation schema
const taskSchema = z.object({
  text: z.string().min(1, "Task text is required"),
  done: z.boolean().optional().default(false),
  dueDate: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).nullable().optional(),
  notes: z.string().nullable().optional()
});

// Get all tasks for the current user
router.get("/", requireAuth, async (req: any, res) => {
  try {
    // Get user ID from session
    const userId = req.session.userId;

    const tasks = await taskService.getUserTasks(userId);
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a new task
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Validate task data
    const validationResult = taskSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid task data", 
        details: validationResult.error.format() 
      });
    }

    // Process the validated data
    const taskData = validationResult.data;
    
    // Convert string date to Date object if present
    const processedTaskData = {
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
    };
    
    // Create the task
    const newTask = await taskService.createTask(userId, processedTaskData);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update a task
router.put("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    // Validate task update data
    const validationResult = taskSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid task data", 
        details: validationResult.error.format() 
      });
    }

    // Process the validated data
    const taskData = validationResult.data;
    
    // Process the data - convert string date to Date object if present
    const processedTaskData = {
      ...taskData,
      // Only convert dueDate if it's present in the update
      dueDate: taskData.dueDate !== undefined 
        ? (taskData.dueDate ? new Date(taskData.dueDate) : null) 
        : undefined
    };
    
    // Update the task
    const updatedTask = await taskService.updateTask(taskId, userId, processedTaskData);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or you don't have permission to edit it" });
    }
    
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    // Delete the task
    const success = await taskService.deleteTask(taskId, userId);
    if (!success) {
      return res.status(404).json({ error: "Task not found or you don't have permission to delete it" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Toggle task completion status
router.post("/:id/toggle", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    // Toggle the task
    const updatedTask = await taskService.toggleTaskCompletion(taskId, userId);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or you don't have permission to update it" });
    }
    
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

export default router;
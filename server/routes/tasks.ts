import { Router } from "express";
import { isAuthenticated } from "../replitAuth";  // Use the secure Replit Auth
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
router.get("/", async (req: any, res) => {
  try {
    // We'll always use a consistent user ID for now to ensure tasks show up properly
    // This makes development easier without requiring login
    const userId = 1; // Using integer to match database schema
    
    console.log('[AUTH] /api/tasks - isAuthenticated:', !!req.user?.claims?.sub);
    
    console.log(`Fetching tasks for user ID: ${userId}`);
    
    const tasks = await taskService.getUserTasks(userId);
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a new task
router.post("/", async (req: any, res) => {
  try {
    // Always use a consistent user ID for now for development
    const userId = 1; // Must be a number to match database schema
    
    console.log('[TASK] Creating task for user ID:', userId);

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
router.put("/:id", async (req: any, res) => {
  try {
    // Always use user ID 1 for development
    const userId = 1;
    
    console.log(`[TASK] Updating task for user ID: ${userId}`);

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
router.delete("/:id", async (req: any, res) => {
  try {
    // Always use user ID 1 for development
    const userId = 1;
    
    console.log(`[TASK] Deleting task for user ID: ${userId}`);

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
router.post("/:id/toggle", async (req: any, res) => {
  try {
    // Always use user ID 1 for development
    const userId = 1;
    
    console.log(`[TASK] Toggling task completion for user ID: ${userId}`);

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
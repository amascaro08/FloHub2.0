// server/routes/tasks.ts
import { Router, Request, Response } from "express";
import { taskService } from "../services/taskService";
import { insertTaskSchema } from "@shared/schema";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Get all tasks for a user
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const tasks = await taskService.getUserTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Create a new task
router.post("/", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate request body
    const taskData = insertTaskSchema
      .omit({ userId: true, firebaseId: true })
      .safeParse(req.body);
    
    if (!taskData.success) {
      return res.status(400).json({ message: "Invalid task data", errors: taskData.error.errors });
    }
    
    const task = await taskService.createTask(userId, taskData.data);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update a task
router.put("/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const taskId = parseInt(req.params.id, 10);
    
    // Validate request body
    const updateSchema = z.object({
      text: z.string().optional(),
      done: z.boolean().optional(),
      dueDate: z.date().nullable().optional(),
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priority: z.string().optional(),
      notes: z.string().optional(),
    });
    
    const taskData = updateSchema.safeParse(req.body);
    
    if (!taskData.success) {
      return res.status(400).json({ message: "Invalid task data", errors: taskData.error.errors });
    }
    
    const updatedTask = await taskService.updateTask(taskId, userId, taskData.data);
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const taskId = parseInt(req.params.id, 10);
    
    const result = await taskService.deleteTask(taskId, userId);
    
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// Toggle task completion
router.patch("/:id/toggle", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const taskId = parseInt(req.params.id, 10);
    
    const updatedTask = await taskService.toggleTaskCompletion(taskId, userId);
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error("Error toggling task completion:", error);
    res.status(500).json({ message: "Failed to toggle task completion" });
  }
});

export default router;
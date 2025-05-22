// server/services/taskService.ts
import { storage } from '../storage';
import { firestore } from '../firebase';
import { InsertTask, Task } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert user ID to string for Firestore
const userIdToString = (userId: number): string => {
  return userId.toString();
};

export interface TaskService {
  getUserTasks(userId: number): Promise<Task[]>;
  createTask(userId: number, task: Omit<InsertTask, 'userId' | 'firebaseId'>): Promise<Task>;
  updateTask(taskId: number, userId: number, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(taskId: number, userId: number): Promise<boolean>;
  toggleTaskCompletion(taskId: number, userId: number): Promise<Task | null>;
}

export class FirebaseTaskService implements TaskService {
  async getUserTasks(userId: number): Promise<Task[]> {
    try {
      // Always get tasks from PostgreSQL
      console.log(`Fetching tasks for user ID: ${userId}`);
      const pgTasks = await storage.getTasks(userId);
      
      // During development, we'll skip Firestore integration since it's causing errors
      // Once Firebase credentials are properly set up, this can be enabled
      
      return pgTasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }
  
  async createTask(userId: number, task: Omit<InsertTask, 'userId' | 'firebaseId'>): Promise<Task> {
    try {
      // Generate a Firebase ID (we'll keep this for future compatibility)
      const firebaseId = uuidv4();
      
      // Create in PostgreSQL only during development
      const newTask = await storage.createTask({
        userId,
        ...task,
        firebaseId
      });
      
      // We're skipping Firebase integration for now as it's causing errors
      // This will be re-enabled when Firebase credentials are properly set up
      
      return newTask;
    } catch (error) {
      console.error('Error creating task in PostgreSQL:', error);
      throw error; // Let the router handle the error response
    }
  }
  
  async updateTask(taskId: number, userId: number, updates: Partial<Task>): Promise<Task | null> {
    try {
      // Get the task to update
      const task = await storage.getTask(taskId);
      
      // Convert stored userId to number for comparison if needed
      const taskUserId = typeof task?.userId === 'string' ? parseInt(task.userId, 10) : task?.userId;
      
      if (!task || taskUserId !== userId) {
        return null;
      }
      
      // Update in PostgreSQL
      // updateTask already handles adding updatedAt in storage.ts
      const updatedTask = await storage.updateTask(taskId, updates);
      
      if (!updatedTask) {
        return null;
      }
      
      // We're skipping Firebase integration for now as it's causing errors
      // This will be re-enabled when Firebase credentials are properly set up
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error; // Let the router handle the error response
    }
  }
  
  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      // Get the task to delete
      const task = await storage.getTask(taskId);
      
      // Convert stored userId to number for comparison if needed
      const taskUserId = typeof task?.userId === 'string' ? parseInt(task.userId, 10) : task?.userId;
      
      if (!task || taskUserId !== userId) {
        return false;
      }
      
      // Delete from PostgreSQL
      const result = await storage.deleteTask(taskId);
      
      // We're skipping Firebase integration for now as it's causing errors
      // This will be re-enabled when Firebase credentials are properly set up
      
      return result;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error; // Let the router handle the error response
    }
  }
  
  async toggleTaskCompletion(taskId: number, userId: number): Promise<Task | null> {
    try {
      // Get the task
      const task = await storage.getTask(taskId);
      
      // Convert stored userId to number for comparison if needed
      const taskUserId = typeof task?.userId === 'string' ? parseInt(task.userId, 10) : task?.userId;
      
      if (!task || taskUserId !== userId) {
        return null;
      }
      
      // Toggle the completion status
      const updatedTask = await this.updateTask(taskId, userId, {
        done: !task.done
      });
      
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return null;
    }
  }
}

export const taskService = new FirebaseTaskService();
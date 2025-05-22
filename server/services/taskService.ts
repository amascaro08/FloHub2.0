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
      // Get tasks from PostgreSQL
      const pgTasks = await storage.getTasks(userId);
      
      // Get tasks from Firestore - need to convert userId to string for Firestore
      const userIdStr = userIdToString(userId);
      const firebaseTasksSnapshot = await firestore
        .collection('users')
        .doc(userIdStr)
        .collection('tasks')
        .get();
      
      if (firebaseTasksSnapshot.empty) {
        return pgTasks;
      }
      
      // Combine tasks and remove duplicates
      const firebaseTasks = firebaseTasksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: 0, // Will be updated if we find a matching task in PG
          userId,
          text: data.text,
          done: data.done,
          dueDate: data.dueDate ? new Date(data.dueDate.toDate()) : null,
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: new Date(),
          source: data.source || 'personal',
          tags: data.tags || [],
          priority: data.priority || 'medium',
          notes: data.notes || null,
          firebaseId: doc.id
        };
      });
      
      // Check for tasks that exist in Firebase but not in PostgreSQL
      const newTasks: Task[] = [];
      for (const fbTask of firebaseTasks) {
        const matchingPgTask = pgTasks.find(pgTask => pgTask.firebaseId === fbTask.firebaseId);
        
        if (matchingPgTask) {
          // Task exists in both - we'll use the PostgreSQL version
          continue;
        } else {
          // Task only exists in Firebase - add to PostgreSQL
          const newTask = await storage.createTask({
            userId,
            text: fbTask.text,
            done: fbTask.done,
            dueDate: fbTask.dueDate,
            source: fbTask.source as string,
            tags: fbTask.tags as string[],
            priority: fbTask.priority as string,
            notes: fbTask.notes as string,
            firebaseId: fbTask.firebaseId
          });
          
          newTasks.push(newTask);
        }
      }
      
      // Return the combined list
      return [...pgTasks, ...newTasks];
    } catch (error) {
      console.error('Error getting tasks:', error);
      // Fallback to PostgreSQL only
      return storage.getTasks(userId);
    }
  }
  
  async createTask(userId: number, task: Omit<InsertTask, 'userId' | 'firebaseId'>): Promise<Task> {
    try {
      // Generate a Firebase ID
      const firebaseId = uuidv4();
      
      // Create in PostgreSQL first
      const newTask = await storage.createTask({
        userId,
        ...task,
        firebaseId
      });
      
      // Try to create in Firebase, but don't fail the whole operation if it doesn't work
      try {
        // Create in Firebase - need to convert userId to string for Firestore
        const userIdStr = userIdToString(userId);
        await firestore
          .collection('users')
          .doc(userIdStr)
          .collection('tasks')
          .doc(firebaseId)
          .set({
            text: task.text,
            done: task.done ?? false,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            source: task.source || 'personal',
            tags: task.tags || [],
            priority: task.priority || 'medium',
            notes: task.notes || null
          });
      } catch (firebaseError) {
        console.error('Firebase storage error (task will still be created in PostgreSQL):', firebaseError);
        // Continue with the operation even if Firebase fails
      }
      
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
      
      // Update in Firebase if firebaseId exists
      if (task.firebaseId) {
        // Convert to string for Firestore
        const userIdStr = userIdToString(userId);
        await firestore
          .collection('users')
          .doc(userIdStr)
          .collection('tasks')
          .doc(task.firebaseId)
          .update({
            ...updates,
            updatedAt: new Date()
          });
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      // If Firebase fails, at least return the PostgreSQL task
      const result = await storage.updateTask(taskId, updates);
      return result || null;
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
      
      // Delete from Firebase if firebaseId exists
      if (task.firebaseId) {
        // Convert to string for Firestore
        const userIdStr = userIdToString(userId);
        await firestore
          .collection('users')
          .doc(userIdStr)
          .collection('tasks')
          .doc(task.firebaseId)
          .delete();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting task:', error);
      // If Firebase fails, at least return the PostgreSQL result
      return storage.deleteTask(taskId);
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
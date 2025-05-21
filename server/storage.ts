import { 
  users, type User, type InsertUser, 
  registrations, type Registration, type InsertRegistration, 
  updates, type Update, type InsertUpdate,
  sessions, type Session,
  userSettings, type UserSettings, type InsertUserSettings,
  calendarSources, type CalendarSource, type InsertCalendarSource,
  tasks, type Task, type InsertTask
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations

export interface IStorage {
  // User operations
  getUser(id: string | number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
  
  // Calendar sources operations
  getCalendarSources(userId: string): Promise<CalendarSource[]>;
  getCalendarSource(id: number): Promise<CalendarSource | undefined>;
  createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource>;
  updateCalendarSource(id: number, source: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined>;
  deleteCalendarSource(id: number): Promise<boolean>;
  
  // Calendar accounts operations
  getCalendarAccounts(): Promise<any[]>;
  
  // Registration operations
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  
  // Update operations
  createUpdate(update: InsertUpdate): Promise<Update>;
  getUpdates(): Promise<Update[]>;
  getUpdate(id: number): Promise<Update | undefined>;
  updateUpdate(id: number, updateData: Partial<InsertUpdate>): Promise<Update | undefined>;
  deleteUpdate(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Calendar accounts operations
  async getCalendarAccounts(): Promise<any[]> {
    // For demo purposes, return some sample accounts
    return [
      {
        id: 'google-1',
        provider: 'google',
        email: 'amascaro08@gmail.com',
        displayName: 'Adam Mascaro',
        isConnected: true
      },
      {
        id: 'o365-1',
        provider: 'o365',
        email: 'user@office365.com',
        displayName: 'Office 365 Account',
        isConnected: false
      }
    ];
  }

  // User operations
  async getUser(id: string | number): Promise<User | undefined> {
    // Convert string to number if needed
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async upsertUser(userData: InsertUser): Promise<User> {
    // First check if user exists
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({
          username: userData.username,
          name: userData.name,
          // Only update password if provided
          ...(userData.password ? { password: userData.password } : {})
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      return this.createUser(userData);
    }
  }
  
  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }
  
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db
      .insert(userSettings)
      .values(settings)
      .returning();
    return newSettings;
  }
  
  async updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const [updatedSettings] = await db
      .update(userSettings)
      .set(settings)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updatedSettings || undefined;
  }
  
  // Calendar sources operations
  async getCalendarSources(userId: string): Promise<CalendarSource[]> {
    return await db.select().from(calendarSources).where(eq(calendarSources.userId, userId));
  }
  
  async getCalendarSource(id: number): Promise<CalendarSource | undefined> {
    const [source] = await db.select().from(calendarSources).where(eq(calendarSources.id, id));
    return source || undefined;
  }
  
  async createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource> {
    const [newSource] = await db
      .insert(calendarSources)
      .values(source)
      .returning();
    return newSource;
  }
  
  async updateCalendarSource(id: number, source: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined> {
    const [updatedSource] = await db
      .update(calendarSources)
      .set(source)
      .where(eq(calendarSources.id, id))
      .returning();
    return updatedSource || undefined;
  }
  
  async deleteCalendarSource(id: number): Promise<boolean> {
    await db.delete(calendarSources).where(eq(calendarSources.id, id));
    return true;
  }
  
  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await db
      .insert(registrations)
      .values(registration)
      .returning();
    return newRegistration;
  }
  
  async getRegistrations(): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .orderBy(registrations.createdAt);
  }
  
  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.email, email));
    return registration || undefined;
  }
  
  // Update operations
  async createUpdate(update: InsertUpdate): Promise<Update> {
    const [newUpdate] = await db
      .insert(updates)
      .values(update)
      .returning();
    return newUpdate;
  }
  
  async getUpdates(): Promise<Update[]> {
    return await db
      .select()
      .from(updates)
      .orderBy(desc(updates.createdAt));
  }
  
  async getUpdate(id: number): Promise<Update | undefined> {
    const [update] = await db
      .select()
      .from(updates)
      .where(eq(updates.id, id));
    return update || undefined;
  }
  
  async updateUpdate(id: number, updateData: Partial<InsertUpdate>): Promise<Update | undefined> {
    const [updatedUpdate] = await db
      .update(updates)
      .set(updateData)
      .where(eq(updates.id, id))
      .returning();
    return updatedUpdate || undefined;
  }
  
  async deleteUpdate(id: number): Promise<boolean> {
    const result = await db
      .delete(updates)
      .where(eq(updates.id, id))
      .returning({ id: updates.id });
    return result.length > 0;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...taskData,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

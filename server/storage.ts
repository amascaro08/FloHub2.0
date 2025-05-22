import { 
  users, type User, type InsertUser, 
  registrations, type Registration, type InsertRegistration, 
  updates, type Update, type InsertUpdate,
  sessions, type Session,
  userSettings, type UserSettings, type InsertUserSettings,
  calendarSources, type CalendarSource, type InsertCalendarSource,
  tasks, type Task, type InsertTask,
  journalEntries, type JournalEntry, type InsertJournalEntry,
  journalMoods, type JournalMood, type InsertJournalMood,
  journalActivities, type JournalActivity, type InsertJournalActivity
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
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Journal entry operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  getJournalEntriesByDate(userId: string, date: string): Promise<JournalEntry | undefined>;
  getJournalEntriesForMonth(userId: string, year: number, month: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(userId: string, date: string, content: string): Promise<JournalEntry | undefined>;
  deleteJournalEntry(userId: string, date: string): Promise<boolean>;
  
  // Journal mood operations
  getJournalMoods(userId: string): Promise<JournalMood[]>;
  getJournalMoodByDate(userId: string, date: string): Promise<JournalMood | undefined>;
  getJournalMoodsForMonth(userId: string, year: number, month: number): Promise<JournalMood[]>;
  createJournalMood(mood: InsertJournalMood): Promise<JournalMood>;
  updateJournalMood(userId: string, date: string, moodData: Partial<InsertJournalMood>): Promise<JournalMood | undefined>;
  deleteJournalMood(userId: string, date: string): Promise<boolean>;
  
  // Journal activity operations
  getJournalActivities(userId: string): Promise<JournalActivity[]>;
  getJournalActivitiesByDate(userId: string, date: string): Promise<JournalActivity[]>;
  createJournalActivity(activity: InsertJournalActivity): Promise<JournalActivity>;
  updateJournalActivity(id: number, activityData: Partial<InsertJournalActivity>): Promise<JournalActivity | undefined>;
  deleteJournalActivity(id: number): Promise<boolean>;
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
  async getTasks(userId: number): Promise<Task[]> {
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

  // Journal entry operations
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.date));
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  }

  async getJournalEntriesByDate(userId: string, date: string): Promise<JournalEntry | undefined> {
    try {
      const entries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .where(eq(journalEntries.date, date));
      
      return entries[0];
    } catch (error) {
      console.error("Error getting journal entry by date:", error);
      return undefined;
    }
  }

  async getJournalEntriesForMonth(userId: string, year: number, month: number): Promise<JournalEntry[]> {
    try {
      // Format month with leading zero if needed
      const startMonth = month < 10 ? `0${month}` : `${month}`;
      const startDate = `${year}-${startMonth}-01`;
      
      // Calculate end date (first day of next month)
      let endYear = year;
      let endMonth = month + 1;
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
      const endMonthStr = endMonth < 10 ? `0${endMonth}` : `${endMonth}`;
      const endDate = `${endYear}-${endMonthStr}-01`;
      
      // Query entries using >= startDate and < endDate
      const entries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .where(sql => sql`${journalEntries.date} >= ${startDate} AND ${journalEntries.date} < ${endDate}`)
        .orderBy(journalEntries.date);
      
      return entries;
    } catch (error) {
      console.error("Error getting journal entries for month:", error);
      return [];
    }
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    try {
      const [result] = await db
        .insert(journalEntries)
        .values(entry)
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw error;
    }
  }

  async updateJournalEntry(userId: string, date: string, content: string): Promise<JournalEntry | undefined> {
    try {
      // First check if entry exists
      const existingEntry = await this.getJournalEntriesByDate(userId, date);
      
      if (existingEntry) {
        // Update existing entry
        const [updated] = await db
          .update(journalEntries)
          .set({ 
            content,
            updatedAt: new Date()
          })
          .where(eq(journalEntries.userId, userId))
          .where(eq(journalEntries.date, date))
          .returning();
        
        return updated;
      } else {
        // Create new entry
        const newEntry: InsertJournalEntry = {
          userId,
          date,
          content,
        };
        
        return await this.createJournalEntry(newEntry);
      }
    } catch (error) {
      console.error("Error updating journal entry:", error);
      return undefined;
    }
  }

  async deleteJournalEntry(userId: string, date: string): Promise<boolean> {
    try {
      const deleted = await db
        .delete(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .where(eq(journalEntries.date, date))
        .returning();
      
      return deleted.length > 0;
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      return false;
    }
  }
  
  // Journal mood operations
  async getJournalMoods(userId: string): Promise<JournalMood[]> {
    try {
      return await db
        .select()
        .from(journalMoods)
        .where(eq(journalMoods.userId, userId))
        .orderBy(desc(journalMoods.date));
    } catch (error) {
      console.error("Error getting journal moods:", error);
      return [];
    }
  }

  async getJournalMoodByDate(userId: string, date: string): Promise<JournalMood | undefined> {
    try {
      const moods = await db
        .select()
        .from(journalMoods)
        .where(eq(journalMoods.userId, userId))
        .where(eq(journalMoods.date, date));
      
      return moods[0];
    } catch (error) {
      console.error("Error getting journal mood by date:", error);
      return undefined;
    }
  }

  async getJournalMoodsForMonth(userId: string, year: number, month: number): Promise<JournalMood[]> {
    try {
      // Format month with leading zero if needed
      const startMonth = month < 10 ? `0${month}` : `${month}`;
      const startDate = `${year}-${startMonth}-01`;
      
      // Calculate end date (first day of next month)
      let endYear = year;
      let endMonth = month + 1;
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
      const endMonthStr = endMonth < 10 ? `0${endMonth}` : `${endMonth}`;
      const endDate = `${endYear}-${endMonthStr}-01`;
      
      // Query moods using >= startDate and < endDate
      const moods = await db
        .select()
        .from(journalMoods)
        .where(eq(journalMoods.userId, userId))
        .where(sql => sql`${journalMoods.date} >= ${startDate} AND ${journalMoods.date} < ${endDate}`)
        .orderBy(journalMoods.date);
      
      return moods;
    } catch (error) {
      console.error("Error getting journal moods for month:", error);
      return [];
    }
  }

  async createJournalMood(mood: InsertJournalMood): Promise<JournalMood> {
    try {
      const [result] = await db
        .insert(journalMoods)
        .values(mood)
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating journal mood:", error);
      throw error;
    }
  }

  async updateJournalMood(userId: string, date: string, moodData: Partial<InsertJournalMood>): Promise<JournalMood | undefined> {
    try {
      // First check if mood exists
      const existingMood = await this.getJournalMoodByDate(userId, date);
      
      if (existingMood) {
        // Update existing mood
        const [updated] = await db
          .update(journalMoods)
          .set({ 
            ...moodData,
            updatedAt: new Date()
          })
          .where(eq(journalMoods.userId, userId))
          .where(eq(journalMoods.date, date))
          .returning();
        
        return updated;
      } else if (moodData.emoji && moodData.label) {
        // Create new mood if we have the required fields
        const newMood: InsertJournalMood = {
          userId,
          date,
          emoji: moodData.emoji,
          label: moodData.label,
          tags: moodData.tags || [],
        };
        
        return await this.createJournalMood(newMood);
      }
      
      return undefined;
    } catch (error) {
      console.error("Error updating journal mood:", error);
      return undefined;
    }
  }

  async deleteJournalMood(userId: string, date: string): Promise<boolean> {
    try {
      const deleted = await db
        .delete(journalMoods)
        .where(eq(journalMoods.userId, userId))
        .where(eq(journalMoods.date, date))
        .returning();
      
      return deleted.length > 0;
    } catch (error) {
      console.error("Error deleting journal mood:", error);
      return false;
    }
  }
  
  // Journal activity operations
  async getJournalActivities(userId: string): Promise<JournalActivity[]> {
    try {
      return await db
        .select()
        .from(journalActivities)
        .where(eq(journalActivities.userId, userId))
        .orderBy(desc(journalActivities.date));
    } catch (error) {
      console.error("Error getting journal activities:", error);
      return [];
    }
  }

  async getJournalActivitiesByDate(userId: string, date: string): Promise<JournalActivity[]> {
    try {
      return await db
        .select()
        .from(journalActivities)
        .where(eq(journalActivities.userId, userId))
        .where(eq(journalActivities.date, date))
        .orderBy(desc(journalActivities.createdAt));
    } catch (error) {
      console.error("Error getting journal activities by date:", error);
      return [];
    }
  }

  async createJournalActivity(activity: InsertJournalActivity): Promise<JournalActivity> {
    try {
      const [result] = await db
        .insert(journalActivities)
        .values(activity)
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating journal activity:", error);
      throw error;
    }
  }

  async updateJournalActivity(id: number, activityData: Partial<InsertJournalActivity>): Promise<JournalActivity | undefined> {
    try {
      const [updated] = await db
        .update(journalActivities)
        .set({ 
          ...activityData,
          updatedAt: new Date()
        })
        .where(eq(journalActivities.id, id))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Error updating journal activity:", error);
      return undefined;
    }
  }

  async deleteJournalActivity(id: number): Promise<boolean> {
    try {
      const deleted = await db
        .delete(journalActivities)
        .where(eq(journalActivities.id, id))
        .returning();
      
      return deleted.length > 0;
    } catch (error) {
      console.error("Error deleting journal activity:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();

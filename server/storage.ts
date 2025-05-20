import { users, type User, type InsertUser, registrations, type Registration, type InsertRegistration, updates, type Update, type InsertUpdate } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // User settings operations
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
  
  // Calendar sources operations
  getCalendarSources(userId: number): Promise<CalendarSource[]>;
  getCalendarSource(id: number): Promise<CalendarSource | undefined>;
  createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource>;
  updateCalendarSource(id: number, source: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined>;
  deleteCalendarSource(id: number): Promise<boolean>;
  
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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
}

export const storage = new DatabaseStorage();

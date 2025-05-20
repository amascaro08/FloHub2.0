import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

export type Session = typeof sessions.$inferSelect;

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  selectedCals: text("selected_cals").array().default([]),
  defaultView: text("default_view").default("month"),
  lastSyncTime: timestamp("last_sync_time"),
  globalTags: text("global_tags").array().default([]),
  activeWidgets: text("active_widgets").array().default(["tasks", "calendar", "ataglance", "quicknote"]),
  powerAutomateUrl: text("power_automate_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  selectedCals: true,
  defaultView: true,
  globalTags: true,
  activeWidgets: true,
  powerAutomateUrl: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export const calendarSources = pgTable("calendar_sources", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'google', 'o365', 'other'
  sourceId: text("source_id").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  tags: text("tags").array().default([]),
  connectionData: text("connection_data").notNull(), // JSON string with connection details
  lastSyncTime: timestamp("last_sync_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCalendarSourceSchema = createInsertSchema(calendarSources).pick({
  userId: true,
  name: true,
  type: true,
  sourceId: true,
  isEnabled: true,
  tags: true,
  connectionData: true,
});

export type InsertCalendarSource = z.infer<typeof insertCalendarSourceSchema>;
export type CalendarSource = typeof calendarSources.$inferSelect;

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull().unique(),
  hasGmail: boolean("has_gmail").notNull().default(false),
  gmailAccount: text("gmail_account"),
  devices: text("devices").array(),
  role: text("role").notNull(),
  why: text("why").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).pick({
  firstName: true,
  email: true,
  hasGmail: true,
  gmailAccount: true,
  devices: true,
  role: true,
  why: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// Schema for updates sent to registered users
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentBy: text("sent_by").notNull(),
  recipientCount: integer("recipient_count").default(0).notNull(),
  recipientIds: text("recipient_ids").array().default([]),
});

export const insertUpdateSchema = createInsertSchema(updates).pick({
  title: true,
  content: true,
  sentBy: true,
  recipientIds: true,
  recipientCount: true,
});

export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updates.$inferSelect;

// Schema for tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  done: boolean("done").default(false).notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  source: text("source").default("personal"), // "personal" or "work"
  tags: text("tags").array().default([]),
  priority: text("priority").default("medium"), // "low", "medium", "high"
  notes: text("notes"),
  firebaseId: text("firebase_id"), // To maintain compatibility with Firestore
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  text: true,
  done: true,
  dueDate: true,
  source: true,
  tags: true,
  priority: true,
  notes: true,
  firebaseId: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

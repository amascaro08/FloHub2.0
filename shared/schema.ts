import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  floCatPreferences: jsonb("flocat_preferences"),
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
  floCatPreferences: true,
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

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries);

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Journal moods table
export const journalMoods = pgTable("journal_moods", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  emoji: text("emoji").notNull(),
  label: text("label").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalMoodSchema = createInsertSchema(journalMoods);

export type InsertJournalMood = z.infer<typeof insertJournalMoodSchema>;
export type JournalMood = typeof journalMoods.$inferSelect;

// Journal activities table
export const journalActivities = pgTable("journal_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalActivitySchema = createInsertSchema(journalActivities);

export type InsertJournalActivity = z.infer<typeof insertJournalActivitySchema>;
export type JournalActivity = typeof journalActivities.$inferSelect;

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location"),
  attendees: text("attendees").array().default([]),
  notes: text("notes"),
  status: text("status").default("upcoming"), // "upcoming", "completed", "cancelled"
  meetingType: text("meeting_type").default("internal"), // "internal", "client", "one-on-one", "interview", "workshop"
  calendarEventId: text("calendar_event_id"), // Link to a calendar event if this meeting is associated with one
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  userId: true,
  title: true,
  description: true,
  date: true,
  startTime: true,
  endTime: true,
  location: true,
  attendees: true,
  notes: true,
  status: true,
  meetingType: true,
  calendarEventId: true,
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Meeting tasks table - links a meeting to tasks created during/for that meeting
export const meetingTasks = pgTable("meeting_tasks", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeetingTaskSchema = createInsertSchema(meetingTasks).pick({
  meetingId: true,
  taskId: true,
});

export type InsertMeetingTask = z.infer<typeof insertMeetingTaskSchema>;
export type MeetingTask = typeof meetingTasks.$inferSelect;

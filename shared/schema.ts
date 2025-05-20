import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Google OAuth fields
  googleId: text("google_id").unique(),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  avatarUrl: text("avatar_url"),
  isOAuthUser: boolean("is_oauth_user").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  createdAt: true,
  googleId: true,
  googleAccessToken: true,
  googleRefreshToken: true,
  avatarUrl: true,
  isOAuthUser: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

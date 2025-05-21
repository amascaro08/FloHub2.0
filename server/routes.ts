
import path from "path";

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertUpdateSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendRegistrationConfirmation, sendAdminNotification, sendUpdateEmail } from "./utils/emailService";
import calendarRoutes from "./routes/calendar";
import taskRoutes from "./routes/tasks";
import userSettingsRoutes from "./routes/user-settings";
import calendarSourcesRoutes from "./routes/calendar-sources";
import calendarAccountsRoutes from "./routes/calendar-accounts";
import assistantRoutes from "./routes/assistant";
import journalRoutes from "./routes/journal";
import { setupAuthRoutes } from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register auth routes
  setupAuthRoutes(app);
  
  // Register calendar routes
  app.use('/api/calendar', calendarRoutes);
  
  // Register task routes
  app.use('/api/tasks', taskRoutes);
  
  // Register user settings routes
  app.use('/', userSettingsRoutes);
  
  // Register calendar sources routes
  app.use('/', calendarSourcesRoutes);
  
  // Register calendar accounts routes
  app.use('/', calendarAccountsRoutes);
  
  // Register assistant routes
  app.use('/', assistantRoutes);
  
  // Register journal routes
  app.use('/', journalRoutes);
  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // Registration endpoints
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const registration = insertRegistrationSchema.parse(req.body);
      
      // Check if the email already exists
      const existingRegistration = await storage.getRegistrationByEmail(registration.email);
      if (existingRegistration) {
        // Instead of returning an error, let's reuse the existing registration
        // and send them an email anyway - it's more user-friendly
        console.log(`Email ${registration.email} already registered, sending email anyway`);
        
        // Send confirmation email to user
        try {
          await sendRegistrationConfirmation(existingRegistration);
          console.log(`Re-confirmation email sent to ${existingRegistration.email}`);
        } catch (emailError) {
          console.error('Error sending re-confirmation email:', emailError);
        }
        
        return res.status(200).json({
          message: "You're already registered! We've sent you another confirmation email.",
          id: existingRegistration.id,
        });
      }
      
      const newRegistration = await storage.createRegistration(registration);
      
      // Send confirmation email to user
      try {
        await sendRegistrationConfirmation(newRegistration);
        console.log(`Registration confirmation email sent to ${newRegistration.email}`);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue with the registration process even if email fails
      }
      
      // Send notification to admin
      try {
        await sendAdminNotification(newRegistration);
        console.log('Admin notification email sent');
      } catch (adminEmailError) {
        console.error('Error sending admin notification email:', adminEmailError);
      }
      
      return res.status(201).json(newRegistration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Invalid registration data", 
          details: error.issues 
        });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get all registrations - only for admin purposes
  app.get("/api/registrations", async (_req: Request, res: Response) => {
    try {
      const allRegistrations = await storage.getRegistrations();
      return res.status(200).json(allRegistrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Testing endpoint for sending emails without registration
  app.get("/api/test-email", async (_req: Request, res: Response) => {
    try {
      // Get the most recent registration
      const registrations = await storage.getRegistrations();
      
      if (registrations.length === 0) {
        return res.status(404).json({ error: 'No registrations found to test with' });
      }
      
      // Use the latest registration
      const registration = registrations[registrations.length - 1];
      
      // Send both emails
      await sendRegistrationConfirmation(registration);
      await sendAdminNotification(registration);
      
      return res.status(200).json({ 
        message: 'Test emails sent successfully', 
        sentTo: registration.email,
        registrationId: registration.id
      });
    } catch (error) {
      console.error('Error sending test emails:', error);
      return res.status(500).json({ error: 'Failed to send test emails' });
    }
  });
  
  // Endpoint to send welcome emails to all registered users (one-time use)
  app.get("/api/send-welcome-to-all", async (_req: Request, res: Response) => {
    try {
      // Get all registrations
      const registrations = await storage.getRegistrations();
      
      if (registrations.length === 0) {
        return res.status(404).json({ error: 'No registrations found' });
      }
      
      const results = [];
      
      // Send welcome email to each registration
      for (const registration of registrations) {
        try {
          await sendRegistrationConfirmation(registration);
          results.push({ 
            email: registration.email, 
            success: true 
          });
        } catch (error) {
          console.error(`Error sending to ${registration.email}:`, error);
          results.push({ 
            email: registration.email, 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
        
        // Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      return res.status(200).json({ 
        message: `Sent welcome emails to ${results.filter(r => r.success).length} out of ${registrations.length} users`, 
        results
      });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      return res.status(500).json({ error: 'Failed to send bulk emails' });
    }
  });
  
  // API endpoints for updates
  
  // Get all updates
  app.get("/api/updates", async (_req: Request, res: Response) => {
    try {
      const updates = await storage.getUpdates();
      return res.status(200).json(updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
      return res.status(500).json({ error: 'Failed to fetch updates' });
    }
  });
  
  // Get a specific update
  app.get("/api/updates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid update ID' });
      }
      
      const update = await storage.getUpdate(id);
      if (!update) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      return res.status(200).json(update);
    } catch (error) {
      console.error('Error fetching update:', error);
      return res.status(500).json({ error: 'Failed to fetch update' });
    }
  });
  
  // Update an existing update
  app.put("/api/updates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid update ID' });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // Check if update exists
      const existingUpdate = await storage.getUpdate(id);
      if (!existingUpdate) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      // Update the record
      const updatedUpdate = await storage.updateUpdate(id, updateData);
      if (!updatedUpdate) {
        return res.status(500).json({ error: 'Failed to update record' });
      }
      
      return res.status(200).json({
        message: 'Update successfully edited',
        update: updatedUpdate
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Invalid update data', 
          details: error.errors 
        });
      }
      
      console.error('Error updating update:', error);
      return res.status(500).json({ error: 'Failed to update record' });
    }
  });
  
  // Delete an update
  app.delete("/api/updates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid update ID' });
      }
      
      // Check if update exists
      const existingUpdate = await storage.getUpdate(id);
      if (!existingUpdate) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      // Delete the record
      const deleted = await storage.deleteUpdate(id);
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete update' });
      }
      
      return res.status(200).json({
        message: 'Update successfully deleted',
        id
      });
    } catch (error) {
      console.error('Error deleting update:', error);
      return res.status(500).json({ error: 'Failed to delete update' });
    }
  });
  
  // Create and send a new update
  app.post("/api/updates", async (req: Request, res: Response) => {
    try {
      // Parse and validate the update data
      const updateData = insertUpdateSchema.parse(req.body);
      
      // Determine recipients
      let recipients: any[] = [];
      
      // If recipientIds is empty, send to all registrations
      if (!updateData.recipientIds || updateData.recipientIds.length === 0) {
        recipients = await storage.getRegistrations();
      } else {
        // Otherwise, get the specified registrations
        const allRegistrations = await storage.getRegistrations();
        recipients = allRegistrations.filter(r => 
          updateData.recipientIds?.includes(r.id.toString())
        );
      }
      
      if (recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients found for this update' });
      }
      
      // Create the update record first
      const update = await storage.createUpdate({
        ...updateData,
        recipientCount: recipients.length
      });
      
      // Send the emails
      const emailResult = await sendUpdateEmail(update, recipients);
      
      return res.status(200).json({
        update,
        emailResult,
        message: `Update created and sent to ${emailResult.sent} out of ${recipients.length} recipients`
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Invalid update data', 
          details: error.errors 
        });
      }
      
      console.error('Error creating update:', error);
      return res.status(500).json({ error: 'Failed to create and send update' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


import path from "path";

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendRegistrationConfirmation, sendAdminNotification } from "./utils/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
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
            error: error.message 
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

  const httpServer = createServer(app);
  return httpServer;
}

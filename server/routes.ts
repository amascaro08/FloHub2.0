
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
        return res.status(400).json({ 
          error: "Email already registered" 
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

  const httpServer = createServer(app);
  return httpServer;
}

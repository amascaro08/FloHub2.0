
import path from "path";

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // API routes should be registered before static file handling
  app.post("/api/register", async (req: Request, res: Response) => {

  // Health check endpoint (accessible at /health)
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

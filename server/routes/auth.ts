import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import { z } from 'zod';

// Login validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Registration validation schema
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  name: z.string().optional(),
  password: z.string().min(6),
});

export const setupAuthRoutes = (app: any) => {
  // Registration endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate request
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid registration data', details: validation.error.format() });
      }
      
      const { email, username, name, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        username,
        name,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate request
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid login data', details: validation.error.format() });
      }
      
      // For testing purposes, we'll allow a direct login with test credentials
      if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
        // Find or create test user
        let user = await storage.getUserByEmail('test@example.com');
        
        if (!user) {
          user = await storage.createUser({
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            password: await bcrypt.hash('password123', 10)
          });
        }
        
        if (user) {
          // Store user ID in session and save session immediately
          req.session.userId = String(user.id);
          req.session.isAuthenticated = true;
          req.session.userInfo = { id: user.id, email: user.email, username: user.username };
          
          await new Promise((resolve) => {
            req.session.save((err) => {
              if (err) console.error('Session save error:', err);
              resolve(true);
            });
          });
          
          console.log('Login successful for test user, session userId:', req.session.userId);
          
          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;
          
          return res.json(userWithoutPassword);
        }
      }
      
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Store user ID in session and save session immediately
      req.session.userId = String(user.id);
      // Using session.regenerate for better security and to ensure the session is correctly established
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration error:', err);
            reject(err);
            return;
          }
          req.session.userId = String(user.id);
          resolve();
        });
      });
      
      await new Promise((resolve) => {
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
          resolve(true);
        });
      });
      
      console.log('Login successful for user, session userId:', req.session.userId);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user endpoint
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Authentication check failed' });
    }
  });
  
  // Authentication middleware
  app.use('/api/calendar', (req: Request, res: Response, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  });
};

// Middleware for requiring authentication
export const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
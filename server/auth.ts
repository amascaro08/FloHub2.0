import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// User session interface
export interface UserSession {
  id: number;
  email: string;
  name: string;
}

// Setup Google OAuth Strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://flohub.replit.app/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async function(accessToken, refreshToken, profile, done) {
        try {
          // See if user already exists
          let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (!user) {
            // Create new user with Google profile
            const username = profile.emails?.[0]?.value?.split('@')[0] || '';
            const newUser = {
              username,
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName || username,
              password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
              googleId: profile.id,
              isOAuthUser: true
            };
            
            user = await storage.createUser(newUser);
          }
          
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
  
  // Configure Passport session handling
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// User registration handler
export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Set user in session
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    };
    
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid input', errors: error.errors });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  }
};

// User login handler
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Set user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid input', errors: error.errors });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  }
};

// User logout handler
export const logoutUser = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = (req: Request, res: Response) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Google auth routes
export const setupGoogleAuthRoutes = (app: any) => {
  // Initiate Google OAuth flow
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
  
  // Google OAuth callback
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
      // On successful authentication
      if (req.user) {
        const user = req.user as User;
        req.session.user = {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
      res.redirect('/dashboard');
    }
  );
}
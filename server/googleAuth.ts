import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { z } from 'zod';

// Only initialize the strategy if we have Google credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export interface GoogleUserProfile {
  id: string;
  displayName: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
}

// Configure Google Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user in database
          let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (!user) {
            // Create a new user with Google profile data
            const newUser = {
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName,
              username: profile.emails?.[0]?.value?.split('@')[0] || '',
              password: '', // No password for OAuth users
              isOAuthUser: true,
              googleId: profile.id,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              avatarUrl: profile.photos?.[0]?.value || '',
            };
            
            user = await storage.createUser(newUser);
          } else {
            // Update existing user with refreshed OAuth tokens
            // In a real implementation, you might want to update user tokens here
          }
          
          // Return user info to be serialized
          return done(null, user);
        } catch (error) {
          console.error('Error in Google authentication:', error);
          return done(error as Error);
        }
      }
    )
  );
}

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to check if user is authenticated
export const isGoogleAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Routes for Google authentication
export const setupGoogleAuth = (app: any) => {
  // Initialize Google auth route
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    })
  );

  // Google auth callback route
  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );

  // Route to get current authenticated user
  app.get('/api/auth/session', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        },
      });
    } else {
      res.json({ user: null });
    }
  });

  // Logout route
  app.get('/api/auth/signout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }
      res.redirect('/');
    });
  });
};
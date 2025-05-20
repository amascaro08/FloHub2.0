import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { storage } from './storage';
import bcrypt from 'bcrypt';

// Google OAuth client setup
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Function to verify Google ID token
async function verifyGoogleToken(token: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// Login handler
export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Set user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    return res.status(200).json({ 
      success: true,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
}

// Google OAuth callback handler
export async function googleCallbackHandler(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Invalid Google credential' });
    }
    
    // Verify the Google token
    const payload = await verifyGoogleToken(credential);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    
    const { email, name, sub: googleId, picture } = payload;
    
    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }
    
    // Check if user exists by email or Google ID
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Check if user exists by Google ID
      user = await storage.getUserByGoogleId(googleId);
    }
    
    if (!user) {
      // Create a new user if they don't exist
      const username = email.split('@')[0];
      const newUser = {
        email,
        name: name || username,
        username: username,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
        googleId,
        avatarUrl: picture,
        isOAuthUser: true
      };
      
      user = await storage.createUser(newUser);
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        // In a real implementation, you'd update the user record
        // For now, we'll just use the existing user
        console.log('Would update Google ID for user:', user.id);
      }
    }
    
    // Set user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    return res.status(200).json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(500).json({ message: 'An error occurred during Google authentication' });
  }
}

// Session check handler
export function sessionHandler(req: Request, res: Response) {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(200).json({ user: null });
}

// Logout handler
export function logoutHandler(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'An error occurred during logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true });
  });
}
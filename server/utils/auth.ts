import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated
  if (req.session && req.session.userId) {
    // Add user to request object
    storage.getUser(parseInt(req.session.userId, 10))
      .then(user => {
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(401).json({ error: 'Authentication required' });
        }
      })
      .catch(err => {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      username: username || null,
    });
    
    // Create session
    req.session.userId = user.id.toString();
    await req.session.save();
    
    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create session
    req.session.userId = user.id.toString();
    await req.session.save();
    
    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

// Logout user
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to log out' });
      }
      
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(parseInt(req.session.userId, 10));
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
};
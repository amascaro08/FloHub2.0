import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { storage } from '../storage';

const router = Router();

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if passwords match
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Set user ID in session
    req.session.userId = user.id.toString();
    await req.session.save();
    
    // Return user info without sensitive data
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'An error occurred during logout' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Get current user route
router.get('/user', async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ authenticated: false });
    }
    
    const user = await storage.getUser(parseInt(req.session.userId, 10));
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    
    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      authenticated: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'An error occurred while getting user data' });
  }
});

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      username: username || null
    });
    
    // Set user ID in session
    req.session.userId = user.id.toString();
    await req.session.save();
    
    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

export default router;
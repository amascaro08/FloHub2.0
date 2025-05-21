import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

const router = express.Router();

// Get calendar accounts for the authenticated user
router.get('/api/calendar/accounts', isAuthenticated, async (req: any, res) => {
  try {
    // Simply return sample accounts for now
    const accounts = await storage.getCalendarAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching calendar accounts:', error);
    res.status(500).json({ error: 'Failed to fetch calendar accounts' });
  }
});

// Google auth callback
router.get('/api/auth/google', isAuthenticated, (req, res) => {
  // For now, redirect back with a success message
  // This would normally redirect to Google OAuth
  res.redirect('/?calendarConnected=google');
});

// Microsoft auth callback
router.get('/api/auth/microsoft', isAuthenticated, (req, res) => {
  // For now, redirect back with a success message
  // This would normally redirect to Microsoft OAuth
  res.redirect('/?calendarConnected=microsoft');
});

// Sync calendars endpoint
router.post('/api/calendar/sync', isAuthenticated, async (req: any, res) => {
  try {
    // Simulate a sync operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ 
      success: true, 
      message: 'Calendars synchronized successfully' 
    });
  } catch (error) {
    console.error('Error syncing calendars:', error);
    res.status(500).json({ error: 'Failed to sync calendars' });
  }
});

export default router;
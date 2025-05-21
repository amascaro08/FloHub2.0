import express, { Request, Response } from 'express';
import { db } from '../db';
import { isAuthenticated } from '../replitAuth';
import { meetings, insertMeetingSchema, insertMeetingTaskSchema, meetingTasks } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { storage } from '../storage';
import { z } from 'zod';

// Calendar Event type
interface CalendarEvent {
  id: string;
  calendarId?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string } | { date: string };
  end: { dateTime: string; timeZone?: string } | { date: string };
  attendees?: Array<{ email: string; name?: string; responseStatus?: string }>;
  organizer?: { email: string; displayName?: string };
  source?: 'google' | 'outlook' | 'work';
  hangoutLink?: string;
  htmlLink?: string;
  conference?: any;
  color?: string;
}

// Extend meeting schema to include calendarEventId
const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['upcoming', 'completed', 'cancelled']).default('upcoming'),
  meetingType: z.enum(['internal', 'client', 'one-on-one', 'interview', 'workshop']).default('internal'),
  calendarEventId: z.string().optional(),
});

const updateMeetingSchema = createMeetingSchema.partial();

// Meeting task schema
const createTaskSchema = z.object({
  text: z.string().min(1, "Task text is required"),
  meetingId: z.number().int().positive(),
  done: z.boolean().default(false),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).default([]),
});

const router = express.Router();

// Get all meetings for the authenticated user
router.get('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Fetch meetings
    const userMeetings = await db.select()
      .from(meetings)
      .where(eq(meetings.userId, userId))
      .orderBy(meetings.updatedAt);
    
    // For each meeting, fetch its tasks
    const meetingsWithTasks = await Promise.all(
      userMeetings.map(async (meeting) => {
        const tasks = await db.select()
          .from(meetingTasks)
          .where(eq(meetingTasks.meetingId, meeting.id));
        
        return {
          ...meeting,
          tasks,
        };
      })
    );
    
    res.status(200).json(meetingsWithTasks);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// Get a specific meeting by ID
router.get('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }
    
    // Fetch the meeting
    const [meeting] = await db.select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Fetch tasks for this meeting
    const tasks = await db.select()
      .from(meetingTasks)
      .where(eq(meetingTasks.meetingId, meetingId));
    
    res.status(200).json({
      ...meeting,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ message: 'Failed to fetch meeting' });
  }
});

// Create a new meeting
router.post('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate request body
    const validationResult = createMeetingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid meeting data', errors: validationResult.error.format() });
    }
    
    const meetingData = validationResult.data;
    
    // Create meeting
    const [createdMeeting] = await db.insert(meetings)
      .values({
        userId,
        title: meetingData.title,
        description: meetingData.description || '',
        notes: meetingData.notes || '',
        status: meetingData.status,
        meetingType: meetingData.meetingType,
        calendarEventId: meetingData.calendarEventId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    res.status(201).json({
      ...createdMeeting,
      tasks: [],
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }
    
    // Validate request body
    const validationResult = updateMeetingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid meeting data', errors: validationResult.error.format() });
    }
    
    const meetingData = validationResult.data;
    
    // Check if meeting exists and belongs to user
    const [existingMeeting] = await db.select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Update meeting
    const [updatedMeeting] = await db.update(meetings)
      .set({
        ...meetingData,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    // Fetch tasks for this meeting
    const tasks = await db.select()
      .from(meetingTasks)
      .where(eq(meetingTasks.meetingId, meetingId));
    
    res.status(200).json({
      ...updatedMeeting,
      tasks,
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }
    
    // Check if meeting exists and belongs to user
    const [existingMeeting] = await db.select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Delete related tasks first
    await db.delete(meetingTasks)
      .where(eq(meetingTasks.meetingId, meetingId));
    
    // Delete meeting
    await db.delete(meetings)
      .where(eq(meetings.id, meetingId));
    
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

// Create a task for a meeting
router.post('/:id/tasks', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }
    
    // Validate request body
    const validationResult = createTaskSchema.safeParse({
      ...req.body,
      meetingId,
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid task data', errors: validationResult.error.format() });
    }
    
    const taskData = validationResult.data;
    
    // Check if meeting exists and belongs to user
    const [existingMeeting] = await db.select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Create the task
    const [createdTask] = await db.insert(meetingTasks)
      .values({
        userId,
        meetingId,
        text: taskData.text,
        done: taskData.done,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        tags: taskData.tags,
        source: 'meeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    // Also create this task in the main tasks table if needed
    try {
      await storage.createTask({
        userId,
        text: taskData.text,
        done: taskData.done,
        dueDate: taskData.dueDate,
        source: 'meeting',
        tags: [...taskData.tags, 'meeting'],
        priority: taskData.priority,
        notes: `From meeting: ${existingMeeting.title}`,
      });
    } catch (taskError) {
      console.error('Error creating task in main tasks table:', taskError);
      // Continue even if creating in the main tasks table fails
    }
    
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error creating meeting task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Get meetings for a specific calendar event
router.get('/calendar/:eventId', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = req.params.eventId;
    
    // Fetch meetings linked to this calendar event
    const linkedMeetings = await db.select()
      .from(meetings)
      .where(and(
        eq(meetings.userId, userId),
        eq(meetings.calendarEventId, eventId)
      ));
    
    // For each meeting, fetch its tasks
    const meetingsWithTasks = await Promise.all(
      linkedMeetings.map(async (meeting) => {
        const tasks = await db.select()
          .from(meetingTasks)
          .where(eq(meetingTasks.meetingId, meeting.id));
        
        return {
          ...meeting,
          tasks,
        };
      })
    );
    
    res.status(200).json(meetingsWithTasks);
  } catch (error) {
    console.error('Error fetching meetings for calendar event:', error);
    res.status(500).json({ message: 'Failed to fetch meetings for calendar event' });
  }
});

export default router;
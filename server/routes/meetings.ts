// server/routes/meetings.ts
import express, { Request, Response } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { meetings, meetingTasks, tasks, insertMeetingSchema, insertMeetingTaskSchema } from '@shared/schema';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Get all meetings for the authenticated user
router.get('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const userMeetings = await db.select().from(meetings).where(eq(meetings.userId, userId));
    res.json(userMeetings);
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
    
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Get tasks associated with this meeting
    const meetingTasksData = await db
      .select({
        meetingTask: meetingTasks,
        task: tasks
      })
      .from(meetingTasks)
      .innerJoin(tasks, eq(meetingTasks.taskId, tasks.id))
      .where(eq(meetingTasks.meetingId, meetingId));
    
    const associatedTasks = meetingTasksData.map(item => item.task);
    
    res.json({
      ...meeting,
      tasks: associatedTasks
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
    const meetingData = insertMeetingSchema.parse({
      ...req.body,
      userId
    });
    
    const [newMeeting] = await db.insert(meetings).values(meetingData).returning();
    res.status(201).json(newMeeting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid meeting data', errors: error.errors });
    }
    console.error('Error creating meeting:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    // Check if the meeting exists and belongs to the user
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Update the meeting
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    res.json(updatedMeeting);
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
    
    // Check if the meeting exists and belongs to the user
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Delete associated meeting tasks first
    await db
      .delete(meetingTasks)
      .where(eq(meetingTasks.meetingId, meetingId));
    
    // Delete the meeting
    await db
      .delete(meetings)
      .where(eq(meetings.id, meetingId));
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

// Add a task to a meeting
router.post('/:id/tasks', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    
    // Check if the meeting exists and belongs to the user
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Create a new task first
    const taskData = {
      userId,
      text: req.body.text,
      done: false,
      dueDate: req.body.dueDate,
      source: req.body.source || 'meeting',
      tags: req.body.tags || [],
      priority: req.body.priority || 'medium',
      notes: req.body.notes || `From meeting: ${existingMeeting.title}`
    };
    
    const [newTask] = await db.insert(tasks).values(taskData).returning();
    
    // Now link the task to the meeting
    const meetingTaskData = {
      meetingId,
      taskId: newTask.id
    };
    
    await db.insert(meetingTasks).values(meetingTaskData);
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error adding task to meeting:', error);
    res.status(500).json({ message: 'Failed to add task to meeting' });
  }
});

// Remove a task from a meeting
router.delete('/:meetingId/tasks/:taskId', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.meetingId);
    const taskId = parseInt(req.params.taskId);
    
    // Check if the meeting exists and belongs to the user
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Delete the meeting-task relationship
    await db
      .delete(meetingTasks)
      .where(and(
        eq(meetingTasks.meetingId, meetingId),
        eq(meetingTasks.taskId, taskId)
      ));
    
    res.json({ message: 'Task removed from meeting' });
  } catch (error) {
    console.error('Error removing task from meeting:', error);
    res.status(500).json({ message: 'Failed to remove task from meeting' });
  }
});

// Link a meeting to a calendar event
router.put('/:id/calendar-event', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const meetingId = parseInt(req.params.id);
    const { calendarEventId } = req.body;
    
    if (!calendarEventId) {
      return res.status(400).json({ message: 'Calendar event ID is required' });
    }
    
    // Check if the meeting exists and belongs to the user
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(
        eq(meetings.id, meetingId),
        eq(meetings.userId, userId)
      ));
    
    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Update the meeting with the calendar event ID
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        calendarEventId,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error linking meeting to calendar event:', error);
    res.status(500).json({ message: 'Failed to link meeting to calendar event' });
  }
});

export default router;
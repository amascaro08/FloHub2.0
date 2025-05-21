import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { taskService } from "../services/taskService";
import { storage } from "../storage";
import OpenAI from "openai";

// Create OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const router = Router();

// Get comprehensive context for FloCat
router.get("/api/assistant/context", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || "";
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get tasks using taskService to ensure we get both PostgreSQL and Firebase data
    const tasks = await taskService.getUserTasks(userId);
    
    // Get calendar events
    const calendarSources = await storage.getCalendarSources(userId);
    
    // Get user settings
    const userSettings = await storage.getUserSettings(userId);
    
    // Return context data
    res.json({
      tasks: {
        all: tasks,
        completed: tasks.filter(task => task.done),
        pending: tasks.filter(task => !task.done),
        priority: tasks.filter(task => !task.done).sort((a, b) => {
          // Sort by priority first (high > medium > low)
          const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityMap[a.priority as string] || 0;
          const bPriority = priorityMap[b.priority as string] || 0;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          // Then sort by due date if priorities are the same
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          
          // Put tasks with due dates before those without
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          
          return 0;
        })[0] // Get the highest priority task
      },
      calendar: {
        sources: calendarSources
      },
      settings: userSettings
    });
  } catch (error) {
    console.error("Error fetching assistant context:", error);
    res.status(500).json({ error: "Failed to fetch context" });
  }
});

// FloCat assistant endpoint
router.post('/api/assistant', async (req: any, res) => {
  try {
    const { prompt, history = [], metadata = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Assistant API: Processing request', { 
      userId: req.user?.claims?.sub,
      messageLength: prompt.length,
      metadata
    });

    // Create messages array for OpenAI
    const messages = [
      { role: 'system', content: 'You are FloCat, a helpful AI assistant that helps users manage their productivity.' },
      ...history,
      { role: 'user', content: prompt }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages.map(m => ({ role: m.role as any, content: m.content })),
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0]?.message?.content;
    
    if (!reply) {
      return res.status(500).json({ error: 'Failed to generate response' });
    }

    console.log('Assistant API: Generated response', { 
      userId: req.user?.claims?.sub,
      responseLength: reply.length 
    });

    res.json({ reply });
  } catch (error) {
    console.error('Error in assistant endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

export default router;
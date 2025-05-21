import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { OpenAI } from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// FloCat assistant endpoint (no authentication for testing)
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

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Assistant API error:', error);
    
    // Handle rate limits and other OpenAI-specific errors
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        fallback: true
      });
    }
    
    // Return error with appropriate status code
    return res.status(error.status || 500).json({ 
      error: error.message || 'An error occurred processing your request',
      fallback: true
    });
  }
});

export default router;
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import OpenAI from "openai";
import {
  fetchUserNotes,
  fetchUserMeetingNotes,
  fetchUserConversations,
  findRelevantContextSemantic as findRelevantContext,
} from "@/lib/context";
import { ChatCompletionMessageParam } from "openai/resources";

// Types
type ChatRequest = {
  history?: { role: string; content: string }[];
  prompt?: string;
  message?: string; // Added for direct message support
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility to parse simple due phrases like "today", "tomorrow", "in 3 days", "next Monday"
const parseDueDate = (phrase: string): string | undefined => {
  const now = new Date();
  const dayMs = 86400000;

  if (phrase === "today") {
    now.setHours(23, 59, 59, 999);
    return now.toISOString();
  }

  if (phrase === "tomorrow") {
    const date = new Date(now.getTime() + dayMs);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }

  const inDaysMatch = phrase.match(/^in (\d+) days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const date = new Date(now.getTime() + days * dayMs);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }

  const weekdays = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ];

  const nextWeekdayMatch = phrase.match(/^next (\w+)$/);
  if (nextWeekdayMatch) {
    const targetDay = weekdays.indexOf(nextWeekdayMatch[1].toLowerCase());
    if (targetDay >= 0) {
      let date = new Date(now);
      const currentDay = date.getDay();
      let daysToAdd = (targetDay - currentDay + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7;
      date.setDate(date.getDate() + daysToAdd);
      date.setHours(23, 59, 59, 999);
      return date.toISOString();
    }
  }

  return undefined;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.email || !token.accessToken) {
    return res.status(401).json({ error: "Not signed in" });
  }

  const email = token.email as string;
  const { history = [], prompt, message } = req.body as ChatRequest;

  // Use either prompt or message, with message taking precedence
  const userInput = message || prompt || "";

  if (!Array.isArray(history) || typeof userInput !== "string" || !userInput) {
    return res.status(400).json({ error: "Invalid request body - missing message/prompt or invalid history" });
  }

  const lowerPrompt = userInput.toLowerCase();

  const callInternalApi = async (path: string, method: string, body: any) => {
    const url = path;
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error calling ${path}: ${response.status} - ${errorText}`);
    }

    return response.ok;
  };

  // ── Add Task Detection ─────────────────────────────
  const taskMatch = userInput.match(/(?:add|new) task(?: called)? (.+?)(?: due ([\w\s]+))?$/i);
  if (taskMatch && taskMatch[1]) {
    const taskText = taskMatch[1].trim();
    const duePhrase = taskMatch[2]?.trim().toLowerCase();
    const dueDate = duePhrase ? parseDueDate(duePhrase) : undefined;

    const payload: any = { text: taskText };
    if (dueDate) payload.dueDate = dueDate;

    await callInternalApi("/api/tasks", "POST", payload);
    return res.status(200).json({
      reply: `✅ Task "${taskText}" added${dueDate ? ` (due ${duePhrase})` : ""}.`,
    });
  }

  // ── Add Calendar Event Detection ───────────────────
  if (
    lowerPrompt.includes("add event") ||
    lowerPrompt.includes("new event") ||
    lowerPrompt.includes("schedule event")
  ) {
    const eventMatch = userInput.match(/(?:add|new|schedule) event (.+)/i);
    if (eventMatch && eventMatch[1]) {
      const summary = eventMatch[1].trim();
      const now = new Date();
      const start = now.toISOString();
      const end = new Date(now.getTime() + 3600000).toISOString();
      await callInternalApi("/api/calendar", "POST", { summary, start, end });
      return res.status(200).json({ reply: `📅 Event "${summary}" scheduled.` });
    }
  }

  // ── Fetch Context & Fallback to OpenAI ─────────────
  try {
    // Fetch all data in parallel
    const [notes, meetings, conversations] = await Promise.all([
      fetchUserNotes(email),
      fetchUserMeetingNotes(email),
      fetchUserConversations(email)
    ]);
    
    // Start context processing
    const relevantContextPromise = findRelevantContext(userInput, notes, meetings, conversations);

    // Prepare base messages while context is being processed
    const baseMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are FloCat, a friendly, slightly quirky AI assistant. You provide summaries, add tasks, schedule events, and cheerfully help users stay on track. You are also a cat 😺.`,
      }
    ];
    
    // Map history messages (can be done while waiting for context)
    const historyMessages = history.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content || "", // Ensure content is never undefined
    }));
    
    // Wait for context to complete
    const relevantContext = await relevantContextPromise;
    
    // Combine all messages
    const messages: ChatCompletionMessageParam[] = [
      ...baseMessages,
      {
        role: "system",
        content: `Relevant context:\n${relevantContext}`,
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content || "", // Ensure content is never undefined
      })),
      {
        role: "user",
        content: userInput, // Use userInput instead of prompt
      },
    ];

    try { // Moved try block to wrap only the OpenAI call
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });

      const aiReply = completion.choices[0]?.message?.content;
      if (!aiReply) {
        return res.status(500).json({ error: "OpenAI did not return a message." });
      }

      return res.status(200).json({ reply: aiReply });
    } catch (err: any) {
      console.error("OpenAI API error:", err);
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  } catch (err: any) {
    console.error("Assistant error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function seedDatabase() {
  const existing = await storage.getMessages();
  if (existing.length === 0) {
    await storage.createMessage({ role: "assistant", content: "Hello! I am ready to help. You can type a message or use the microphone to speak!" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.chat.history.path, async (req, res) => {
    try {
      const msgs = await storage.getMessages();
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: "Failed to get history" });
    }
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const input = api.chat.send.input.parse(req.body);
      
      // Save user message
      await storage.createMessage({ role: "user", content: input.message });

      const msgs = await storage.getMessages();
      const messagesForAI = msgs.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await ai.chat.completions.create({
        model: "gpt-5.1",
        messages: messagesForAI,
      });

      const replyContent = response.choices[0]?.message?.content || "No response";

      // Save assistant message
      await storage.createMessage({ role: "assistant", content: replyContent });

      res.status(200).json({ reply: replyContent });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  await seedDatabase();

  return httpServer;
}

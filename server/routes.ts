import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import * as multer from 'multer';
import path from "path";
import { FireworksClient, createPrompt } from "./lib/fireworks";

if (!process.env.FIREWORKS_API_KEY) {
  throw new Error("FIREWORKS_API_KEY environment variable is required");
}

// Configure multer for file uploads
const upload = multer.default({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Initialize Fireworks client
const fireworks = new FireworksClient({
  apiKey: process.env.FIREWORKS_API_KEY,
  model: "accounts/fireworks/models/flux", // Using Flux model
});

export function registerRoutes(app: Express): Server {
  // Handle image generation endpoint
  app.post("/api/generate", upload.single("logo"), async (req: Request, res) => {
    try {
      const { title, style, font, primaryColor } = req.body;
      const logo = req.file;

      console.log("Received generation request:", {
        title,
        style,
        font,
        primaryColor,
        hasLogo: !!logo,
      });

      const prompt = createPrompt({
        title,
        style,
        primaryColor,
      });

      console.log("Generated prompt:", prompt);
      const imageUrl = await fireworks.generateImage(prompt);

      console.log("Generated image URL:", imageUrl);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
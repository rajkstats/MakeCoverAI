import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { FireworksClient, createPrompt } from "./lib/fireworks";

if (!process.env.FIREWORKS_API_KEY) {
  throw new Error("FIREWORKS_API_KEY environment variable is required");
}

// Configure multer for file uploads
const upload = multer({
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
      const { title, description, style, font, primaryColor } = req.body;
      const logo = req.file;

      console.log("Received generation request:", {
        title,
        description,
        style,
        font,
        primaryColor,
        hasLogo: !!logo,
      });

      const prompt = createPrompt({
        description,
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

  // Add style recommendations endpoint
  app.post("/api/recommend-style", async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      const recommendation = await fireworks.getStyleRecommendations(title, description);
      res.json(recommendation);
    } catch (error) {
      console.error("Style recommendation error:", error);
      res.status(500).json({ message: "Failed to get style recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
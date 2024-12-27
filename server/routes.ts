import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import * as multer from 'multer';
import path from "path";

// Configure multer for file uploads
const upload = multer.default({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
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

      // TODO: Integrate with Fireworks.ai
      // For now, return a placeholder image
      const imageUrl = `https://placehold.co/1200x675/png?text=${encodeURIComponent(
        title
      )}`;

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
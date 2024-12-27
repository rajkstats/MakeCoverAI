import fetch from "node-fetch";
import { z } from "zod";

interface FireworksConfig {
  apiKey: string;
  model: string;
}

export class FireworksClient {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://api.fireworks.ai/inference/v1";

  constructor(config: FireworksConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log("Starting image generation with prompt:", prompt);

    try {
      const response = await fetch(
        `${this.baseUrl}/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "image/jpeg",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            prompt,
            height: 1024,
            width: 1024,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            text_prompts: [
              {
                text: prompt,
                weight: 1.0,
              },
              {
                text: "text, typography, letters, words, title, heading, watermark, writing",
                weight: -1.0,
              },
            ],
            negative_prompt:
              "text, typography, letters, words, title, heading, watermark, writing, blurry, low quality, poor quality",
          }),
        },
      );

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fireworks API error response:", errorText);
        throw new Error(
          `Failed to generate image: ${response.status} - ${errorText}`,
        );
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      console.log("Successfully generated image");
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Image generation error details:", error);
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export function createPrompt(params: {
  description: string;
  style: string;
  primaryColor: string;
}): string {
  console.log("Creating prompt with params:", params);

  const { description, style, primaryColor } = params;

  // Define base style characteristics
  const stylePrompts: Record<string, string> = {
    modern: "sleek contemporary aesthetic, clean minimal composition, sophisticated modern design elements",
    minimal: "refined simplicity, elegant negative space, subtle details, balanced minimalist approach",
    bold: "striking visual impact, dramatic contrasts, powerful composition, bold design elements",
    tech: "futuristic tech aesthetic, digital patterns, innovative technological elements, cutting-edge visuals",
    creative: "artistic expression, unique creative elements, dynamic artistic composition, imaginative design",
  };

  // Create the final prompt combining the user's description with style guidance
  const finalPrompt = `Create a sophisticated blog cover image that combines ${stylePrompts[style]}.
Main theme: ${description}.
Visual style: Professional composition with ${stylePrompts[style]}.
Color palette: Elegant use of ${primaryColor} as the primary color with harmonious complementary tones.
Composition requirements: High-quality artistry, balanced layout, subtle depth and dimensionality.
Additional elements: Professional lighting effects, refined gradients, cohesive visual storytelling.
Image purpose: Professional blog header image.`;

  console.log("Generated prompt:", finalPrompt);
  return finalPrompt;
}
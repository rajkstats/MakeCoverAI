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
                text: "text, typography, letters, words, title, heading, watermark, writing, label, sign, logo",
                weight: -1.0,
              },
            ],
            negative_prompt:
              "text, typography, letters, words, title, heading, watermark, writing, label, sign, logo, text overlay, caption, subtitle, blurry, low quality, poor quality",
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

  // Create a detailed prompt that focuses on the description while incorporating style
  const finalPrompt = `Create a professional blog cover image with the following theme: ${description}. 
The image should incorporate ${stylePrompts[style]} and use ${primaryColor} as a key color element.
The composition should be balanced and visually striking, with:
- High-quality artistic elements that reflect the description
- Professional lighting and atmospheric effects
- Subtle depth and dimensional qualities
- Clean, uncluttered layout suitable for text overlay
- No text or typography in the generated image
Additional requirements:
- Maintain visual harmony while emphasizing the main theme
- Create an engaging backdrop that complements but doesn't overwhelm
- Ensure the image has areas suitable for text overlay
The image should be sophisticated and polished, perfect for a professional blog header.`;

  console.log("Generated prompt:", finalPrompt);
  return finalPrompt;
}
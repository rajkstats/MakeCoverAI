import fetch from "node-fetch";
import { z } from 'zod';

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
    console.log("Generating image with prompt:", prompt);

    try {
      const response = await fetch(
        `${this.baseUrl}/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "image/jpeg",
            "Authorization": `Bearer ${this.apiKey}`,
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
                weight: 1.0
              }
            ],
            negative_prompt: "blurry, low quality, text, watermark, letters, words, typography",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Fireworks API error:", error);
        throw new Error(`Failed to generate image: ${error}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error details:", error);
      throw error;
    }
  }
}

export function createPrompt(params: {
  title: string;
  style: string;
  primaryColor: string;
}): string {
  const { title, style, primaryColor } = params;

  // Define base style characteristics
  const stylePrompts: Record<string, string> = {
    modern: "clean lines, contemporary design, sleek geometric shapes, minimalist approach",
    minimal: "elegant simplicity, refined composition, subtle textures, plenty of whitespace",
    bold: "high contrast elements, dramatic lighting, dynamic composition, impactful visuals",
    tech: "digital patterns, circuit-like structures, futuristic elements, technological aesthetic",
    creative: "abstract forms, artistic flourishes, unique visual elements, expressive design",
  };

  // Analyze title for themes and concepts
  const titleWords = title.toLowerCase().split(' ');
  let conceptPrompt = '';

  // Map common themes to visual concepts
  if (titleWords.some(word => ['ai', 'intelligence', 'machine', 'neural', 'deep'].includes(word))) {
    conceptPrompt = "neural networks, interconnected nodes, abstract representation of artificial intelligence";
  } else if (titleWords.some(word => ['data', 'analytics', 'analysis', 'insights'].includes(word))) {
    conceptPrompt = "flowing data streams, abstract visualization of information, connected patterns";
  } else if (titleWords.some(word => ['future', 'innovation', 'technology', 'tech'].includes(word))) {
    conceptPrompt = "futuristic technological elements, innovative visual metaphors, cutting-edge design elements";
  } else if (titleWords.some(word => ['nature', 'environment', 'eco', 'green'].includes(word))) {
    conceptPrompt = "organic patterns, natural elements, flowing forms, environmental themes";
  } else if (titleWords.some(word => ['business', 'corporate', 'professional'].includes(word))) {
    conceptPrompt = "professional geometric shapes, corporate aesthetic, clean business-oriented design";
  } else {
    // Create a general concept based on title
    conceptPrompt = `abstract visual representation of ${title}, thematic elements that evoke ${title}`;
  }

  // Combine style and concept into final prompt
  return `Create a professional blog cover image combining ${stylePrompts[style]}.
Theme elements: ${conceptPrompt}.
Color scheme: sophisticated use of ${primaryColor} as the primary color with complementary tones.
Style requirements: high-quality, polished composition, professional blog header.
Additional details: subtle depth effects, balanced composition, professional lighting, cohesive visual narrative.`;
}
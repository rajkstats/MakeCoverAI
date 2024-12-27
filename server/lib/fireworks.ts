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
            negative_prompt: "blurry, low quality, text, watermark, letters, words, typography, title, heading",
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
    modern: "sleek contemporary aesthetic, clean minimal composition, sophisticated modern design elements",
    minimal: "refined simplicity, elegant negative space, subtle details, balanced minimalist approach",
    bold: "striking visual impact, dramatic contrasts, powerful composition, bold design elements",
    tech: "futuristic tech aesthetic, digital patterns, innovative technological elements, cutting-edge visuals",
    creative: "artistic expression, unique creative elements, dynamic artistic composition, imaginative design",
  };

  // Define specific themes and their visual representations
  const themePatterns = [
    {
      keywords: ['ai', 'intelligence', 'machine', 'neural', 'deep', 'learning'],
      visuals: "glowing neural pathways, interconnected nodes forming abstract patterns, flowing data streams, digital synapses, technological brain structures",
    },
    {
      keywords: ['data', 'analytics', 'analysis', 'insights', 'metrics'],
      visuals: "flowing information streams, abstract data visualization, dynamic graph patterns, interconnected data points, analytical structures",
    },
    {
      keywords: ['future', 'innovation', 'technology', 'tech', 'digital'],
      visuals: "futuristic cityscapes, innovative tech structures, glowing circuit patterns, advanced technological elements, digital transformation visuals",
    },
    {
      keywords: ['nature', 'environment', 'eco', 'green', 'sustainable'],
      visuals: "organic flowing patterns, natural elements, environmental motifs, sustainable design elements, biomorphic structures",
    },
    {
      keywords: ['business', 'corporate', 'professional', 'enterprise'],
      visuals: "professional geometric patterns, corporate architectural elements, modern business aesthetics, sophisticated structural designs",
    },
    {
      keywords: ['creative', 'art', 'design', 'artistic', 'creative'],
      visuals: "abstract artistic elements, creative design patterns, dynamic artistic compositions, expressive visual elements",
    },
  ];

  // Analyze title for themes
  const titleWords = title.toLowerCase().split(' ');
  let themeVisuals = '';

  // Find matching theme pattern
  const matchedTheme = themePatterns.find(pattern => 
    pattern.keywords.some(keyword => titleWords.some(word => word.includes(keyword)))
  );

  if (matchedTheme) {
    themeVisuals = matchedTheme.visuals;
  } else {
    // Create a custom theme based on title words
    themeVisuals = `abstract visual metaphors of ${title}, symbolic representations incorporating ${
      titleWords.join(' and ')
    }, thematic elements that capture the essence of ${title}`;
  }

  // Combine style and theme into final prompt
  return `Create a sophisticated blog cover image that combines ${stylePrompts[style]}.
Main theme: ${themeVisuals}.
Visual style: Professional composition with ${stylePrompts[style]}.
Color palette: Elegant use of ${primaryColor} as the primary color with harmonious complementary tones.
Composition requirements: High-quality artistry, balanced layout, subtle depth and dimensionality.
Additional elements: Professional lighting effects, refined gradients, cohesive visual storytelling.
Image purpose: Professional blog header focusing on the theme of "${title}".`;
}
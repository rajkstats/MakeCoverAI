import fetch from "node-fetch";

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
            negative_prompt: "blurry, low quality, text, watermark",
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

  const stylePrompts: Record<string, string> = {
    modern: "minimalist composition with clean lines and geometric shapes",
    minimal: "simple, elegant design with focus on negative space",
    bold: "dramatic composition with strong visual hierarchy",
    tech: "futuristic design with digital elements and tech patterns",
    creative: "artistic composition with abstract elements and dynamic shapes",
  };

  // Create a more descriptive prompt based on the title
  const titleWords = title.toLowerCase().split(' ');
  let conceptPrompt = '';

  // Add specific imagery based on common tech/AI related words
  if (titleWords.includes('transformer') || titleWords.includes('attention')) {
    conceptPrompt = "futuristic neural network visualization, glowing interconnected nodes in a 3D space, sophisticated AI concept art";
  } else if (titleWords.includes('ai') || titleWords.includes('intelligence')) {
    conceptPrompt = "abstract digital brain patterns, circuit-like structures, high-tech visualization";
  } else if (titleWords.includes('data') || titleWords.includes('analytics')) {
    conceptPrompt = "flowing data streams, geometric patterns representing information flow";
  } else {
    conceptPrompt = "abstract shapes and patterns that represent the concept of " + title;
  }

  const basePrompt = `Create a professional blog cover image with ${stylePrompts[style] || stylePrompts.modern}.
Main elements: ${conceptPrompt}.
Color scheme: elegant use of ${primaryColor} as the primary color.
Style requirements: high-quality, clean composition, suitable for text overlay, professional blog header.
Additional details: subtle gradient effects, balanced composition, professional lighting.
The image should have space for text overlay in the center: "${title}"`;

  return basePrompt;
}
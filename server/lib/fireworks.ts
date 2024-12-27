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
        `${this.baseUrl}/text-to-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "accounts/fireworks/models/flux",
            prompt,
            n: 1,
            size: "1024x1024",
            steps: 50,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Fireworks API error:", error);
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      if (!data.images?.[0]?.url) {
        console.error("Unexpected API response:", data);
        throw new Error("Invalid API response format");
      }

      return data.images[0].url;
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
    modern: "modern, clean, minimalist design with balanced typography",
    minimal: "minimal, elegant design focusing on essential elements",
    bold: "bold, high-contrast design with strong typography",
    tech: "tech-inspired design with geometric patterns and digital aesthetic",
    creative: "creative, artistic design with unique layout and expressive elements",
  };

  const basePrompt = `Create a blog cover image for an article titled "${title}". 
Style: ${stylePrompts[style] || stylePrompts.modern}
Color scheme: primarily using ${primaryColor}
Requirements: professional quality, clean composition, text should be clearly readable`;

  return basePrompt;
}
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

    const response = await fetch(`${this.baseUrl}/generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        num_images: 1,
        height: 675,
        width: 1200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Fireworks API error:", error);
      throw new Error("Failed to generate image");
    }

    const data = await response.json();
    console.log("Image generated successfully");
    return data.images[0].url;
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

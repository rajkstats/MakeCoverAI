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

    const response = await fetch(
      `${this.baseUrl}/workflows/accounts/fireworks/models/accounts/raj-k-stats-72993c/deployedModels/flux-1-dev-fp8-c1ca32b2/text_to_image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "image/jpeg",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Fireworks API error:", error);
      throw new Error("Failed to generate image");
    }

    const buffer = await response.buffer();

    // Convert buffer to base64 for frontend display
    const base64Image = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
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
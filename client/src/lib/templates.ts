export type StyleTemplate = "modern" | "minimal" | "bold" | "tech" | "creative";

export interface TemplateConfig {
  name: StyleTemplate;
  label: string;
  description: string;
  preview: string;
}

export const templates: TemplateConfig[] = [
  {
    name: "modern",
    label: "Modern",
    description: "Clean and contemporary design with balanced typography",
    preview: "https://placehold.co/600x400/png?text=Modern",
  },
  {
    name: "minimal",
    label: "Minimal",
    description: "Simple and elegant with focus on essential elements",
    preview: "https://placehold.co/600x400/png?text=Minimal",
  },
  {
    name: "bold",
    label: "Bold",
    description: "Strong typography and high contrast for impact",
    preview: "https://placehold.co/600x400/png?text=Bold",
  },
  {
    name: "tech",
    label: "Tech",
    description: "Modern tech aesthetic with geometric patterns",
    preview: "https://placehold.co/600x400/png?text=Tech",
  },
  {
    name: "creative",
    label: "Creative",
    description: "Artistic and expressive with unique layouts",
    preview: "https://placehold.co/600x400/png?text=Creative",
  },
];

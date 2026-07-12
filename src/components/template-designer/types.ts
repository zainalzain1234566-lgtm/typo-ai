import type { GeneratedSlide } from "@/lib/services/generation";

export interface DesignerVersion {
  id: string;
  versionNumber: number;
  css: string;
  layouts: { cover: string; content: string; ending: string };
  rawSlides: GeneratedSlide[];
  slides: string[]; // merged, ready-to-render HTML — index-aligned with rawSlides
  aiMessage: string;
  source: "generate" | "edit";
  createdAt: string;
}

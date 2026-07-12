import { substituteTokens } from "@/lib/services/template-sandbox";
import type { GeneratedSlide } from "@/lib/services/generation";

interface MergeOptions {
  accountName?: string;
  logoUrl?: string;
}

// Fuses real generated content into the AI-designed layout shells: slide 0
// gets the cover layout, the last slide gets the ending layout, everything
// between reuses the content layout. Pure function — layouts/css were
// already sanitized server-side at generation time; substituteTokens still
// HTML-escapes the slide title/body defensively since they're now the
// injection-relevant values (real user-topic-driven AI content, not fixed
// sample strings).
export function mergeSlides(
  rawSlides: GeneratedSlide[],
  layouts: { cover: string; content: string; ending: string },
  options: MergeOptions = {}
): string[] {
  const total = rawSlides.length;
  return rawSlides.map((slide, i) => {
    const layout = i === 0 ? layouts.cover : i === total - 1 ? layouts.ending : layouts.content;
    return substituteTokens(layout, {
      title: slide.title,
      body: slide.body,
      slideNumber: String(i + 1),
      totalSlides: String(total),
      ctaText: slide.cta_text ?? "",
      accountName: options.accountName ?? "",
      logoUrl: options.logoUrl ?? "",
    });
  });
}

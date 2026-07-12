import { z } from "zod";
import { AVAILABLE_AI_MODELS } from "@/lib/constants";

const AI_MODEL_IDS = AVAILABLE_AI_MODELS.map((m) => m.id) as [string, ...string[]];
const aiModelSchema = z.enum(AI_MODEL_IDS).optional();

export const CANVAS_SIZES = ["1080x1080", "1080x1350", "1080x1920"] as const;
export const CANVAS_SIZE_DIMENSIONS: Record<(typeof CANVAS_SIZES)[number], { width: number; height: number; label: string }> = {
  "1080x1080": { width: 1080, height: 1080, label: "منشور مربع" },
  "1080x1350": { width: 1080, height: 1350, label: "منشور عمودي" },
  "1080x1920": { width: 1080, height: 1920, label: "ستوري Instagram" },
};

export const TEMPLATE_FONT_IDS = ["tajawal", "cairo", "ibm"] as const;
export const TEMPLATE_FONT_NAMES: Record<(typeof TEMPLATE_FONT_IDS)[number], string> = {
  tajawal: "Tajawal",
  cairo: "Cairo",
  ibm: "IBM Plex Sans Arabic",
};

export const FONT_SIZE_PREFERENCES = ["small", "medium", "large"] as const;
export const TEXT_DENSITIES = ["minimal", "balanced", "detailed"] as const;

export const MIN_SLIDE_COUNT = 2;
export const MAX_SLIDE_COUNT = 10;

// Primary inputs (topic/colors/slideCount/size) are what the user explicitly
// asked to control. Font/style/density are optional "extras" — left unset,
// the AI picks them itself (see generateSystemPrompt's creative-freedom
// branch in generation.ts) instead of defaulting to a safe/generic look.
export const customTemplateSettingsSchema = z.object({
  topic: z.string().min(1).max(200),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(6).default([]),
  slideCount: z.number().int().min(MIN_SLIDE_COUNT).max(MAX_SLIDE_COUNT),
  size: z.enum(CANVAS_SIZES),
  fontFamily: z.enum(TEMPLATE_FONT_IDS).optional(),
  fontSizePreference: z.enum(FONT_SIZE_PREFERENCES).optional(),
  textDensity: z.enum(TEXT_DENSITIES).optional(),
  visualStyle: z.string().max(200).optional(),
  showAccountName: z.boolean(),
  showLogo: z.boolean(),
  showSlideNumbers: z.boolean(),
});

export type CustomTemplateSettings = z.infer<typeof customTemplateSettingsSchema>;

export const generateCustomTemplateSchema = z.object({
  settings: customTemplateSettingsSchema,
  message: z.string().max(2000).optional().default(""),
  model: aiModelSchema,
});

export const editCustomTemplateSchema = z.object({
  settings: customTemplateSettingsSchema,
  message: z.string().min(1).max(2000),
  currentCss: z.string().min(1),
  currentHtmlCover: z.string().min(1),
  currentHtmlContent: z.string().min(1),
  currentHtmlEnding: z.string().min(1),
  model: aiModelSchema,
});

import { z } from "zod";

export const SIZE_MAP = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

export const SIZES = ["square", "portrait", "story"] as const;
export const CONTENT_TYPES = ["تعليمي", "قصة", "توعوي", "قائمة", "خطوات", "نصائح", "مقارنة", "شرح مفهوم"] as const;
export const TONES = ["مبسطة", "احترافية", "ودية", "رسمية", "تحفيزية", "قصصية", "مباشرة", "أكاديمية"] as const;
export const LEVELS = ["مبتدئ", "متوسط", "متقدم"] as const;
export const LANGUAGES = ["العربية الفصحى", "اللهجة العراقية", "اللهجة الخليجية", "اللهجة المصرية", "الإنجليزية"] as const;
export const CTA_OPTIONS = ["بدون CTA", "احفظ المنشور", "شارك المنشور", "تابع الحساب", "اكتب رأيك"] as const;
export const FONTS = ["tajawal", "cairo", "ibm-plex-sans-arabic"] as const;
export const PLACEMENTS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

export const createProjectSchema = z.object({
  title: z.string().min(1, "الموضوع مطلوب").max(200, "الموضوع طويل جدًا"),
  topic: z.string().min(1, "الموضوع مطلوب").max(200),
  content_type: z.enum(CONTENT_TYPES),
  target_audience: z.string().max(200).optional().nullable(),
  content_level: z.enum(LEVELS),
  tone: z.enum(TONES),
  language: z.enum(LANGUAGES),
  size: z.enum(SIZES),
  slide_count: z.number().int().min(2).max(10),
  cta_type: z.enum(CTA_OPTIONS).nullable(),
  template_id: z.string().uuid(),
  palette_id: z.string().uuid(),
  font_family: z.enum(FONTS),
  font_size_scale: z.number().min(0.7).max(1.5),
  use_brand_kit: z.boolean(),
  show_logo: z.boolean(),
  show_account_name: z.boolean(),
  show_slide_number: z.boolean(),
  logo_position: z.enum(PLACEMENTS),
  account_name_position: z.enum(PLACEMENTS),
  folder_id: z.string().uuid().nullable().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  folder_id: z.string().uuid().nullable().optional(),
  template_id: z.string().uuid().optional(),
  palette_id: z.string().uuid().optional(),
  font_family: z.enum(FONTS).optional(),
  font_size_scale: z.number().min(0.7).max(1.5).optional(),
  use_brand_kit: z.boolean().optional(),
  show_logo: z.boolean().optional(),
  show_account_name: z.boolean().optional(),
  show_slide_number: z.boolean().optional(),
  logo_position: z.enum(PLACEMENTS).optional(),
  account_name_position: z.enum(PLACEMENTS).optional(),
  caption: z.string().optional().nullable(),
  hashtags: z.string().optional().nullable(),
  status: z.enum(["in_progress", "completed", "archived"]).optional(),
  is_favorite: z.boolean().optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

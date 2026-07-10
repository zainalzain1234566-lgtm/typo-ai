import { z } from "zod";

export const updateBrandKitSchema = z.object({
  instagram_username: z.string().max(100).optional().nullable(),
  logo_path: z.string().optional().nullable(),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح")
    .optional()
    .nullable(),
  default_font: z.enum(["tajawal", "cairo", "ibm-plex-sans-arabic"]).optional(),
});
export type UpdateBrandKitInput = z.infer<typeof updateBrandKitSchema>;

export const updatePreferencesSchema = z.object({
  default_language: z.string().optional(),
  default_tone: z.string().optional(),
  default_level: z.string().optional(),
  default_size: z.enum(["square", "portrait", "story"]).optional(),
  default_slide_count: z.number().int().min(2).max(10).optional(),
  preferred_template_id: z.string().uuid().nullable().optional(),
});
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const folderSchema = z.object({
  name: z.string().min(1, "اسم المجلد مطلوب").max(50, "الاسم طويل جدًا"),
});
export type FolderInput = z.infer<typeof folderSchema>;

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

import { z } from "zod";

export const slideTypes = ["cover", "content", "summary", "cta"] as const;

export const createSlideSchema = z.object({
  project_id: z.string().uuid(),
  position: z.number().int().min(1),
  slide_type: z.enum(slideTypes),
  title: z.string().max(300).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
  cta_text: z.string().max(200).optional().nullable(),
});
export type CreateSlideInput = z.infer<typeof createSlideSchema>;

export const updateSlideSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(300).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
  cta_text: z.string().max(200).optional().nullable(),
});
export type UpdateSlideInput = z.infer<typeof updateSlideSchema>;

export const reorderSlidesSchema = z.object({
  project_id: z.string().uuid(),
  ordered_slide_ids: z.array(z.string().uuid()).min(2),
});
export type ReorderSlidesInput = z.infer<typeof reorderSlidesSchema>;

export const duplicateSlideSchema = z.object({
  slide_id: z.string().uuid(),
});
export type DuplicateSlideInput = z.infer<typeof duplicateSlideSchema>;

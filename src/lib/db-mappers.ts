import type { Project, Slide, ContentType, ContentLevel, Tone, Language, CarouselSize, CTAOption, FontFamily, Placement, SlideType, ProjectStatus, ReviewStatus, Folder, TextAlignment } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// ============= Size mapping =============
export const SIZE_FE_TO_DB: Record<CarouselSize, string> = {
  "1080x1080": "square",
  "1080x1350": "portrait",
  "1080x1920": "story",
};
export const SIZE_DB_TO_FE: Record<string, CarouselSize> = {
  square: "1080x1080",
  portrait: "1080x1350",
  story: "1080x1920",
};

// ============= Font mapping =============
export const FONT_FE_TO_DB: Record<FontFamily, string> = {
  tajawal: "tajawal",
  cairo: "cairo",
  ibm: "ibm-plex-sans-arabic",
};
export const FONT_DB_TO_FE: Record<string, FontFamily> = {
  tajawal: "tajawal",
  cairo: "cairo",
  "ibm-plex-sans-arabic": "ibm",
};

// ============= Slide type mapping =============
export function slideTypeDbToFe(dbType: string): SlideType {
  if (dbType === "cover") return "cover";
  if (dbType === "content") return "content";
  return "ending";
}

// ============= Project row → frontend Project =============
// row must include nested template(slug) and palette(sort_order) via Supabase join
export function mapProject(row: any, slideRows: any[]): Project {
  const templateSlug = row.template?.slug ?? "tahrir";
  const paletteSortOrder = row.palette?.sort_order ?? 1;
  const paletteId = `p${paletteSortOrder}`;

  return {
    id: row.id,
    title: row.title,
    folderId: row.folder_id,
    settings: {
      contentType: row.content_type as ContentType,
      audience: row.target_audience ?? "",
      level: row.content_level as ContentLevel,
      tone: row.tone as Tone,
      language: row.language as Language,
      size: SIZE_DB_TO_FE[row.size] ?? "1080x1350",
      slideCount: row.slide_count,
      cta: (row.cta_type ?? "بدون CTA") as CTAOption,
      templateId: templateSlug,
      paletteId,
      titleFont: FONT_DB_TO_FE[row.title_font_family ?? row.font_family] ?? "tajawal",
      bodyFont: FONT_DB_TO_FE[row.font_family] ?? "tajawal",
      titleFontSizeScale: row.title_font_size_scale ?? row.font_size_scale ?? 1.0,
      bodyFontSizeScale: row.font_size_scale ?? 1.0,
      titleTextAlign: (row.title_text_align ?? "auto") as TextAlignment,
      bodyTextAlign: (row.body_text_align ?? "auto") as TextAlignment,
      brandKit: {
        enabled: row.use_brand_kit,
        showLogo: row.show_logo,
        showAccountName: row.show_account_name,
        showSlideNumber: row.show_slide_number,
        showDisclaimer: row.show_disclaimer ?? true,
        placement: (row.logo_position ?? "bottom-left") as Placement,
      },
      specialty: row.specialty_slug ?? undefined,
    },
    slides: slideRows.map(mapSlide),
    caption: row.caption ?? "",
    hashtags: row.hashtags ? row.hashtags.split(" ").filter(Boolean) : [],
    status: (row.status === "completed" ? "completed" : "draft") as ProjectStatus,
    favorite: row.is_favorite,
    reviewStatus: row.review_status as ReviewStatus | undefined,
    isMedical: row.requires_medical_review === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exportCount: 0,
  };
}

export function mapSlide(row: any): Slide {
  return {
    id: row.id,
    type: slideTypeDbToFe(row.slide_type),
    title: row.title ?? "",
    body: row.body ?? "",
    ctaText: row.cta_text ?? undefined,
  };
}

export function mapFolder(row: any): Folder {
  return { id: row.id, name: row.name };
}

// ============= Template UUID lookup =============
export interface TemplateLookup {
  [slug: string]: { id: string; palettes: Record<string, string> };
}

export async function fetchTemplateLookup(supabase: SupabaseClient): Promise<TemplateLookup> {
  const { data: templates } = await supabase
    .from("templates")
    .select("id, slug, template_palettes(id, sort_order)")
    .eq("is_active", true);

  const lookup: TemplateLookup = {};
  for (const t of templates ?? []) {
    const palettes: Record<string, string> = {};
    for (const p of (t as any).template_palettes ?? []) {
      palettes[`p${p.sort_order}`] = p.id;
    }
    lookup[t.slug] = { id: t.id, palettes };
  }
  return lookup;
}

export function useTemplateLookup(supabase: SupabaseClient): TemplateLookup {
  const [lookup, setLookup] = useState<TemplateLookup>({});
  useEffect(() => {
    fetchTemplateLookup(supabase).then(setLookup).catch(() => {});
  }, [supabase]);
  return lookup;
}

// ============= Frontend Project → server action input =============
export function projectToCreateInput(project: Project, lookup: TemplateLookup): Record<string, unknown> | null {
  const tmpl = lookup[project.settings.templateId];
  if (!tmpl) return null;
  const paletteId = tmpl.palettes[project.settings.paletteId];
  if (!paletteId) return null;

  return {
    title: project.title,
    topic: project.title,
    content_type: project.settings.contentType,
    target_audience: project.settings.audience || null,
    content_level: project.settings.level,
    tone: project.settings.tone,
    language: project.settings.language,
    size: SIZE_FE_TO_DB[project.settings.size],
    slide_count: project.settings.slideCount,
    cta_type: project.settings.cta === "بدون CTA" ? null : project.settings.cta,
    template_id: tmpl.id,
    palette_id: paletteId,
    title_font_family: FONT_FE_TO_DB[project.settings.titleFont] ?? "tajawal",
    font_family: FONT_FE_TO_DB[project.settings.bodyFont] ?? "tajawal",
    title_font_size_scale: project.settings.titleFontSizeScale,
    font_size_scale: project.settings.bodyFontSizeScale,
    title_text_align: project.settings.titleTextAlign,
    body_text_align: project.settings.bodyTextAlign,
    use_brand_kit: project.settings.brandKit.enabled,
    show_logo: project.settings.brandKit.showLogo,
    show_account_name: project.settings.brandKit.showAccountName,
    show_slide_number: project.settings.brandKit.showSlideNumber,
    show_disclaimer: project.settings.brandKit.showDisclaimer,
    logo_position: project.settings.brandKit.placement,
    account_name_position: project.settings.brandKit.placement,
    folder_id: project.folderId,
    specialty_slug: project.settings.specialty ?? null,
    requires_medical_review: true,
  };
}

export function projectToUpdateInput(project: Project, lookup: TemplateLookup): Record<string, unknown> | null {
  const tmpl = lookup[project.settings.templateId];
  if (!tmpl) return null;
  const paletteId = tmpl.palettes[project.settings.paletteId];

  return {
    id: project.id,
    title: project.title,
    template_id: tmpl.id,
    palette_id: paletteId,
    title_font_family: FONT_FE_TO_DB[project.settings.titleFont],
    font_family: FONT_FE_TO_DB[project.settings.bodyFont],
    title_font_size_scale: project.settings.titleFontSizeScale,
    font_size_scale: project.settings.bodyFontSizeScale,
    title_text_align: project.settings.titleTextAlign,
    body_text_align: project.settings.bodyTextAlign,
    use_brand_kit: project.settings.brandKit.enabled,
    show_logo: project.settings.brandKit.showLogo,
    show_account_name: project.settings.brandKit.showAccountName,
    show_slide_number: project.settings.brandKit.showSlideNumber,
    show_disclaimer: project.settings.brandKit.showDisclaimer,
    logo_position: project.settings.brandKit.placement,
    account_name_position: project.settings.brandKit.placement,
    caption: project.caption,
    hashtags: project.hashtags.join(" "),
    status: project.status === "completed" ? "completed" : "in_progress",
    is_favorite: project.favorite,
    folder_id: project.folderId,
    specialty_slug: project.settings.specialty ?? null,
  };
}

// ============= Blank project factory (moved from auth-context) =============
export function createBlankProject(): Project {
  const now = new Date().toISOString();
  return {
    id: `temp_${Date.now()}`,
    title: "مشروع بدون عنوان",
    folderId: null,
    status: "draft",
    favorite: false,
    isMedical: false,
    exportCount: 0,
    createdAt: now,
    updatedAt: now,
    settings: {
      contentType: "تعليمي",
      audience: "",
      level: "مبتدئ",
      tone: "مبسطة",
      language: "العربية الفصحى",
      size: "1080x1350",
      slideCount: 6,
      cta: "تابع الحساب",
      templateId: "tahrir",
      paletteId: "p1",
      titleFont: "tajawal",
      bodyFont: "tajawal",
      titleFontSizeScale: 1.0,
      bodyFontSizeScale: 1.0,
      titleTextAlign: "auto",
      bodyTextAlign: "auto",
      brandKit: {
        enabled: false,
        showLogo: false,
        showAccountName: false,
        showSlideNumber: false,
        showDisclaimer: true,
        placement: "bottom-left",
      },
    },
    slides: [],
    caption: "",
    hashtags: [],
  };
}

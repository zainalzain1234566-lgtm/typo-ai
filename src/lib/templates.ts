import type { Palette, Template, FontFamily } from "./types";

export const PALETTES: Palette[] = [
  { id: "p1", name: "مكمّل", background: "#FAFAF9", text: "#1C1917", accent: "#6D5EFC", secondary: "#E8E6FE" },
  { id: "p2", name: "ليلي", background: "#1E1B2E", text: "#F5F3FF", accent: "#A78BFA", secondary: "#3B3258" },
  { id: "p3", name: "رمادي", background: "#F5F5F4", text: "#1C1917", accent: "#44403C", secondary: "#D6D3D1" },
  { id: "p4", name: "مرجاني", background: "#FFF5F3", text: "#7C2D12", accent: "#F97316", secondary: "#FFEDD5" },
];

export const ALL_FONTS: { id: FontFamily; name: string; cssVar: string }[] = [
  { id: "tajawal", name: "Tajawal", cssVar: "var(--font-tajawal)" },
  { id: "cairo", name: "Cairo", cssVar: "var(--font-cairo)" },
  { id: "ibm", name: "IBM Plex Sans Arabic", cssVar: "var(--font-ibm)" },
];

export const TEMPLATE_DEFS: Template[] = [
  { id: "tahrir", name: "تحرير", description: "تصميم تحريري بأرقام كبيرة وتباين واضح", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tahrir" },
  { id: "wadeh", name: "واضح", description: "تصميم نظيف بمساحات واسعة وخط واضح", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "wadeh" },
  { id: "noqta", name: "نقطة", description: "نقطة بصرية مركزية مع عنوان بارز", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "noqta" },
  { id: "itar", name: "إطار", description: "إطار زخرفي حول المحتوى مع خلفية ناعمة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "itar" },
  { id: "mujaz", name: "موجز", description: "تصميم مختصر بكتلة نصية متمركزة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "mujaz" },
  { id: "academy", name: "أكاديمي", description: "تصميم منظم بشريط جانبي وأرقام", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "academy" },
  { id: "hadith", name: "حديث", description: "تصميم عصري بأشكال هندسية وزوايا", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "hadith" },
  { id: "tabayun", name: "تباين", description: "تباين قوي بين النص والخلفية مع شريط ملوّن", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tabayun" },
  { id: "shabaka", name: "شبكة", description: "تصميم بخلفية شبكية وعناصر منظمة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "shabaka" },
  { id: "unwan", name: "عنوان", description: "عنوان ضخم يملأ المساحة مع تفاصيل دقيقة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "unwan" },
];

export function getTemplate(id: string): Template {
  return TEMPLATE_DEFS.find((t) => t.id === id) ?? TEMPLATE_DEFS[0];
}

export function getPalette(templateId: string, paletteId: string): Palette {
  const t = getTemplate(templateId);
  return t.palettes.find((p) => p.id === paletteId) ?? t.palettes[0];
}

export const SIZES: { id: string; label: string; ratio: string; w: number; h: number }[] = [
  { id: "1080x1080", label: "منشور مربع", ratio: "1:1", w: 1080, h: 1080 },
  { id: "1080x1350", label: "منشور عمودي", ratio: "4:5", w: 1080, h: 1350 },
  { id: "1080x1920", label: "ستوري Instagram", ratio: "9:16", w: 1080, h: 1920 },
];

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

// ============= Style-specific palettes for new templates =============

const HERO_PALETTES: Palette[] = [
  { id: "p1", name: "أبيض", background: "#ffffff", text: "#111111", accent: "#111111", secondary: "#f5f5f5" },
  { id: "p2", name: "ليلي", background: "#111111", text: "#ffffff", accent: "#ffffff", secondary: "#1a1a1a" },
  { id: "p3", name: "كريمي", background: "#faf3e0", text: "#1a1a1a", accent: "#1a1a1a", secondary: "#f0e8d0" },
  { id: "p4", name: "أزرق", background: "#f0f4ff", text: "#1a1a2e", accent: "#1a1a2e", secondary: "#e0e8ff" },
];

const EDITORIAL_PALETTES: Palette[] = [
  { id: "p1", name: "كريمي ذهبي", background: "#faf3e0", text: "#1a1a1a", accent: "#b8860b", secondary: "#f0e8d0" },
  { id: "p2", name: "ليلي ذهبي", background: "#1e1a14", text: "#faf3e0", accent: "#b8860b", secondary: "#2a2418" },
  { id: "p3", name: "أبيض ذهبي", background: "#ffffff", text: "#1a1a1a", accent: "#b8860b", secondary: "#f8f4e8" },
  { id: "p4", name: "كحلي ذهبي", background: "#1a1a2e", text: "#f5f5f5", accent: "#b8860b", secondary: "#252540" },
];

const SPLIT_PALETTES: Palette[] = [
  { id: "p1", name: "بنفسجي", background: "#0e0e12", text: "#f0f0f0", accent: "#6c5ce7", secondary: "#16161e" },
  { id: "p2", name: "كحلي", background: "#0f172a", text: "#f0f0f0", accent: "#3b82f6", secondary: "#1e293b" },
  { id: "p3", name: "أبيض", background: "#ffffff", text: "#111111", accent: "#6366f1", secondary: "#f0f0f0" },
  { id: "p4", name: "أخضر", background: "#0d1b14", text: "#e0e0e0", accent: "#10b981", secondary: "#15291c" },
];

const STACKED_PALETTES: Palette[] = [
  { id: "p1", name: "وردي", background: "#fdeef5", text: "#5a4a55", accent: "#ff7eb6", secondary: "#fff6fb" },
  { id: "p2", name: "خزامي", background: "#f0eef5", text: "#4a4a55", accent: "#a78bfa", secondary: "#f5f3fa" },
  { id: "p3", name: "نعناع", background: "#eaf5ee", text: "#4a5a4f", accent: "#34d399", secondary: "#f0faf5" },
  { id: "p4", name: "خوخي", background: "#fff0e8", text: "#5a4a3a", accent: "#fb923c", secondary: "#fff5f0" },
];

const CARDS_PALETTES: Palette[] = [
  { id: "p1", name: "أخضر", background: "#eafff5", text: "#103a2f", accent: "#10a37f", secondary: "#ffffff" },
  { id: "p2", name: "أبيض", background: "#ffffff", text: "#1a1a1a", accent: "#6D5EFC", secondary: "#f5f5f5" },
  { id: "p3", name: "ليلي", background: "#0a1a14", text: "#e0e0e0", accent: "#10a37f", secondary: "#15291c" },
  { id: "p4", name: "أزرق", background: "#eef5ff", text: "#1a2a3a", accent: "#3b82f6", secondary: "#f0f5ff" },
];

const ROTATED_PALETTES: Palette[] = [
  { id: "p1", name: "مرجاني", background: "#fff3ee", text: "#3a1c12", accent: "#e17055", secondary: "#fff" },
  { id: "p2", name: "أصفر", background: "#fffbe6", text: "#3a2a10", accent: "#f59e0b", secondary: "#fff" },
  { id: "p3", name: "وردي", background: "#fdf2f8", text: "#3a1c2a", accent: "#ec4899", secondary: "#fff" },
  { id: "p4", name: "تركواز", background: "#eef5f5", text: "#1a2a2a", accent: "#14b8a6", secondary: "#fff" },
];

const TERMINAL_PALETTES: Palette[] = [
  { id: "p1", name: "أخضر نيون", background: "#0d0d0d", text: "#e8e8e8", accent: "#3ef58a", secondary: "#141414" },
  { id: "p2", name: "أزرق", background: "#0d0d1a", text: "#e0e0e0", accent: "#60a5fa", secondary: "#14141f" },
  { id: "p3", name: "أحمر", background: "#1a0d0d", text: "#e0d0d0", accent: "#f87171", secondary: "#1f1414" },
  { id: "p4", name: "أخضر داكن", background: "#0d1a0d", text: "#d0e0d0", accent: "#34d399", secondary: "#142014" },
];

const MAGAZINE_PALETTES: Palette[] = [
  { id: "p1", name: "كرافت", background: "#d9c9a3", text: "#3a2f1d", accent: "#8a5a2b", secondary: "#e7dcc0" },
  { id: "p2", name: "أبيض", background: "#f5f0e8", text: "#2a2010", accent: "#5a3a18", secondary: "#e8e0d0" },
  { id: "p3", name: "ورق قديم", background: "#e8dcc0", text: "#3a2f1d", accent: "#6b5a3a", secondary: "#f0e8d8" },
  { id: "p4", name: "رشمة", background: "#f0e8d8", text: "#3a2a1a", accent: "#8a6a3b", secondary: "#e0d8c8" },
];

const TILT_PALETTES: Palette[] = [
  { id: "p1", name: "نيلي", background: "#1e1b4b", text: "#f0f0ff", accent: "#a78bfa", secondary: "#60a5fa" },
  { id: "p2", name: "تركواز", background: "#0f1b2e", text: "#e0f0f5", accent: "#60a5fa", secondary: "#34d399" },
  { id: "p3", name: "بنفسجي", background: "#1a0d2e", text: "#e0d5f5", accent: "#c084fc", secondary: "#a78bfa" },
  { id: "p4", name: "وردي", background: "#2e0d1e", text: "#f5e0e8", accent: "#f472b6", secondary: "#fb7185" },
];

const RETRO_PALETTES: Palette[] = [
  { id: "p1", name: "أصفر", background: "#ffe600", text: "#111111", accent: "#ff00a0", secondary: "#00a0ff" },
  { id: "p2", name: "سماوي", background: "#e0f5ff", text: "#111111", accent: "#ff00a0", secondary: "#00a0ff" },
  { id: "p3", name: "ليموني", background: "#d4ff00", text: "#111111", accent: "#ff00a0", secondary: "#00a0ff" },
  { id: "p4", name: "برتقالي", background: "#ffd000", text: "#111111", accent: "#ff00a0", secondary: "#00a0ff" },
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
  // === New styles (style01–style10) ===
  { id: "hero", name: "بطل", description: "تصميم مركزي بأرقام شفافة وتباين أبيض/أسود", palettes: HERO_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "hero" },
  { id: "editorial", name: "تحريري", description: "تصميم تحريري بخط سيريف وألوان كريمي/ذهبي", palettes: EDITORIAL_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "editorial" },
  { id: "split", name: "انقسام", description: "لوحة منقسمة بلون ملوّن ولوحة جانبية", palettes: SPLIT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "split" },
  { id: "stacked", name: "مكدّس", description: "تصميم مكدّس أسفل بألوان وردية ناعمة", palettes: STACKED_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "stacked" },
  { id: "cards", name: "بطاقات", description: "شبكة بطاقات بألوان خضراء وعناصر مرتبة", palettes: CARDS_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "cards" },
  { id: "rotated", name: "مائل", description: "تصميم مائل بظلال صلبة وألوان مرجانية", palettes: ROTATED_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "rotated" },
  { id: "terminal", name: "برمجي", description: "تصميم طرفية سوداء بأخضر نيون وخط أحادي", palettes: TERMINAL_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "terminal" },
  { id: "magazine", name: "مجلة", description: "أعمدة مجلية بخط الآلة الكاتبة وإطار متقطع", palettes: MAGAZINE_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "magazine" },
  { id: "tilt", name: "قطري", description: "تصميم مائل قطريًا بخلفية متدرجة وزجاجية", palettes: TILT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tilt" },
  { id: "retro", name: "ريترو", description: "تصميم تسعينيات بخطوط قطرية وظلال صلبة", palettes: RETRO_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "retro" },
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

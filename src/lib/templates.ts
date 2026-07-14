import type { Palette, Template, FontFamily } from "./types";
import type { ContentMode } from "./content-mode";

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

const ENGINEERING_PALETTES: Palette[] = [
  { id: "p1", name: "مخطط كحلي", background: "#0D2B4A", text: "#F5FBFF", accent: "#63C6FF", secondary: "#173F66" },
  { id: "p2", name: "ورق هندسي", background: "#F4F9FC", text: "#13324A", accent: "#1976A8", secondary: "#DCECF5" },
  { id: "p3", name: "فحمي سماوي", background: "#151A1F", text: "#EFF7FA", accent: "#38BDF8", secondary: "#26333D" },
  { id: "p4", name: "كوبالت أبيض", background: "#123B6D", text: "#FFFFFF", accent: "#A8E4FF", secondary: "#1D518F" },
];

const LAQTA_PALETTES: Palette[] = [
  { id: "p1", name: "عاجي كهرماني", background: "#FFFDF5", text: "#2F261E", accent: "#D97706", secondary: "#FDEBC8" },
  { id: "p2", name: "أبيض بنفسجي", background: "#FFFFFF", text: "#27223A", accent: "#6D5EFC", secondary: "#ECEAFE" },
  { id: "p3", name: "فحمي سماوي", background: "#171A1F", text: "#F8FAFC", accent: "#38BDF8", secondary: "#26313A" },
  { id: "p4", name: "وردي مرجاني", background: "#FFF7F7", text: "#3D2529", accent: "#E85D75", secondary: "#FDE2E7" },
];

// ============= Medical Spec Template Palettes =============

const CLINICAL_CLEAN_PALETTES: Palette[] = [
  { id: "p1", name: "أزرق طبي", background: "#FFFFFF", text: "#0F2A3F", accent: "#2E86C1", secondary: "#6B7C8C" },
  { id: "p2", name: "أخضر ناعم", background: "#F7FAFC", text: "#14342B", accent: "#2E9E7B", secondary: "#5E7A72" },
  { id: "p3", name: "كحلي هادئ", background: "#FFFFFF", text: "#1A1A2E", accent: "#4A5CC7", secondary: "#7A7F99" },
  { id: "p4", name: "محايد دافئ", background: "#FBF9F6", text: "#2B2B2B", accent: "#C0392B", secondary: "#8A7F7A" },
];

const MYTH_FACT_PALETTES: Palette[] = [
  { id: "p1", name: "أبيض", background: "#FFFFFF", text: "#1B1B1B", accent: "#E74C3C", secondary: "#27AE60" },
  { id: "p2", name: "وردي ناعم", background: "#FDF6F5", text: "#2A1A1A", accent: "#D64545", secondary: "#2E9E7B" },
  { id: "p3", name: "داكن", background: "#0F1626", text: "#F2F4F8", accent: "#FF6B6B", secondary: "#4ADE80" },
  { id: "p4", name: "تركواز", background: "#F7F9FC", text: "#16324F", accent: "#E4572E", secondary: "#17A398" },
];

const NUMBERED_STEPS_PALETTES: Palette[] = [
  { id: "p1", name: "أزرق", background: "#FFFFFF", text: "#14213D", accent: "#2E86C1", secondary: "#DCEBF7" },
  { id: "p2", name: "أخضر", background: "#F6FBF9", text: "#12312A", accent: "#17A398", secondary: "#D2EFE9" },
  { id: "p3", name: "برتقالي", background: "#FFF8F0", text: "#2B1E12", accent: "#E67E22", secondary: "#FBE7D0" },
  { id: "p4", name: "داكن", background: "#1A1A2E", text: "#EDEDF5", accent: "#7C83FD", secondary: "#2E2E52" },
];

const EDITORIAL_HEALTH_PALETTES: Palette[] = [
  { id: "p1", name: "رملي دافئ", background: "#FBF7F0", text: "#2E2A26", accent: "#C77D4A", secondary: "#F0E6D8" },
  { id: "p2", name: "أخضر مريمي", background: "#F4F8F5", text: "#23342B", accent: "#5A8F6E", secondary: "#E1EDE5" },
  { id: "p3", name: "وردي ناعم", background: "#FFF6F5", text: "#3A2A2A", accent: "#D98A8A", secondary: "#F6E4E4" },
  { id: "p4", name: "تحريري داكن", background: "#20242B", text: "#EDE9E3", accent: "#E0A458", secondary: "#2C3138" },
];

const BOLD_STATEMENT_PALETTES: Palette[] = [
  { id: "p1", name: "ذهبي داكن", background: "#0E1116", text: "#FFFFFF", accent: "#FFD166", secondary: "#1a1d24" },
  { id: "p2", name: "أزرق كامل", background: "#256A9B", text: "#FFFFFF", accent: "#0B3D5C", secondary: "#2563a0" },
  { id: "p3", name: "أبيض وأحمر", background: "#F2F4F8", text: "#14213D", accent: "#E63946", secondary: "#dfe3ec" },
  { id: "p4", name: "أخضر عميق", background: "#16302B", text: "#EAF4EF", accent: "#2CC28E", secondary: "#1a3f37" },
];

const TAHDHEER_PALETTES: Palette[] = [
  { id: "p1", name: "كهرماني", background: "#FFFBEB", text: "#451A03", accent: "#D97706", secondary: "#FEF3C7" },
  { id: "p2", name: "أحمر تحذيري", background: "#FEF2F2", text: "#450A0A", accent: "#DC2626", secondary: "#FEE2E2" },
  { id: "p3", name: "داكن", background: "#1C1410", text: "#FDE9CE", accent: "#F59E0B", secondary: "#2B2016" },
  { id: "p4", name: "محايد", background: "#FAFAF9", text: "#1C1917", accent: "#B91C1C", secondary: "#F5F5F4" },
];

const RAQMI_PALETTES: Palette[] = [
  { id: "p1", name: "بنفسجي", background: "#F5F3FF", text: "#2E1065", accent: "#7C3AED", secondary: "#EDE9FE" },
  { id: "p2", name: "أزرق", background: "#EFF6FF", text: "#1E3A5F", accent: "#2563EB", secondary: "#DBEAFE" },
  { id: "p3", name: "أخضر", background: "#ECFDF5", text: "#064E3B", accent: "#059669", secondary: "#D1FAE5" },
  { id: "p4", name: "داكن", background: "#18181B", text: "#F4F4F5", accent: "#A78BFA", secondary: "#27272A" },
];

export const TEMPLATE_DEFS: Template[] = [
  { id: "tahrir", name: "تحرير", description: "تصميم تحريري بأرقام كبيرة وتباين واضح", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tahrir", category: "medical" },
  { id: "wadeh", name: "واضح", description: "تصميم نظيف بمساحات واسعة وخط واضح", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "wadeh", category: "medical" },
  { id: "noqta", name: "نقطة", description: "نقطة بصرية مركزية مع عنوان بارز", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "noqta", category: "medical" },
  { id: "itar", name: "إطار", description: "إطار زخرفي حول المحتوى مع خلفية ناعمة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "itar", category: "medical" },
  { id: "mujaz", name: "موجز", description: "تصميم مختصر بكتلة نصية متمركزة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "mujaz", category: "medical" },
  { id: "academy", name: "أكاديمي", description: "تصميم منظم بشريط جانبي وأرقام", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "academy", category: "medical" },
  { id: "hadith", name: "حديث", description: "تصميم عصري بأشكال هندسية وزوايا", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "hadith", category: "medical" },
  { id: "tabayun", name: "تباين", description: "تباين قوي بين النص والخلفية مع شريط ملوّن", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tabayun", category: "medical" },
  // === Medical spec templates ===
  { id: "clinical-clean", name: "طببي نظيف", description: "تصميم مؤسسي نظيف وموثوق بمساحات واسعة وخطوط رفيعة", palettes: CLINICAL_CLEAN_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "clinical-clean", category: "medical" },
  { id: "numbered-steps", name: "خطوات مرقمة", description: "أرقام كبيرة كمرساة بصرية لخطوات وإجراءات قابلة للتنفيذ", palettes: NUMBERED_STEPS_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "numbered-steps", category: "medical" },
  { id: "myth-fact", name: "خرافة وحقيقة", description: "نظام بصحيح لتفكيك الخرافات بإشارات صح والخطأ المتضادة", palettes: MYTH_FACT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "myth-fact", category: "medical" },
  { id: "editorial-health", name: "صحي تحريري", description: "تصميم مجلات دافئ بصفحات راقية ومحتوى إنساني", palettes: EDITORIAL_HEALTH_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "editorial-health", category: "medical" },
  { id: "bold-statement", name: "بيان جريء", description: "تباين عالي ورسالة واحدة قوية في كل شريحة", palettes: BOLD_STATEMENT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "bold-statement", category: "medical" },
  { id: "tahdheer", name: "تحذير", description: "تصميم تنبيهي لأعراض الخطر وحالات استشارة الطبيب العاجلة", palettes: TAHDHEER_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tahdheer", category: "medical" },
  { id: "raqmi", name: "رقمي", description: "تصميم إحصائي برقم كبير وخلفية متدرجة لعرض الأرقام والدراسات", palettes: RAQMI_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "raqmi", category: "medical" },
  { id: "shabaka", name: "شبكة", description: "تصميم بخلفية شبكية وعناصر منظمة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "shabaka", category: "general" },
  { id: "unwan", name: "عنوان", description: "عنوان ضخم يملأ المساحة مع تفاصيل دقيقة", palettes: PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "unwan", category: "general" },
  // === New styles (style01–style10) ===
  { id: "hero", name: "بطل", description: "تصميم مركزي بأرقام شفافة وتباين أبيض/أسود", palettes: HERO_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "hero", category: "general" },
  { id: "editorial", name: "تحريري", description: "تصميم تحريري بخط سيريف وألوان كريمي/ذهبي", palettes: EDITORIAL_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "editorial", category: "general" },
  { id: "split", name: "انقسام", description: "تصميم منقسم بلون ملوّن ولوحة جانبية", palettes: SPLIT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "split", category: "general" },
  { id: "stacked", name: "مكدّس", description: "تصميم مكدّس أسفل بألوان وردية ناعمة", palettes: STACKED_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "stacked", category: "general" },
  { id: "cards", name: "بطاقات", description: "شبكة بطاقات بألوان خضراء وعناصر مرتبة", palettes: CARDS_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "cards", category: "general" },
  { id: "rotated", name: "مائل", description: "تصميم مائل بظلال صلبة وألوان مرجانية", palettes: ROTATED_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "rotated", category: "general" },
  { id: "terminal", name: "برمجي", description: "تصميم طرفية سوداء بأخضر نيون وخط أحادي", palettes: TERMINAL_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "terminal", category: "general" },
  { id: "magazine", name: "مجلة", description: "أعمدة مجلية بخط الآلة الكاتبة وإطار متقطع", palettes: MAGAZINE_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "magazine", category: "general" },
  { id: "tilt", name: "قطري", description: "تصميم مائل قطريًا بخلفية متدرجة وزجاجية", palettes: TILT_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "tilt", category: "general" },
  { id: "retro", name: "ريترو", description: "تصميم تسعينيات بخطوط قطرية وظلال صلبة", palettes: RETRO_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "retro", category: "general" },
  { id: "engineering", name: "هندسي", description: "مخطط هندسي بخلفية شبكية وخطوط قياس تقنية", palettes: ENGINEERING_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "engineering", category: "general" },
  { id: "laqta", name: "لقطة", description: "صور مرتبطة بالموضوع مع بطاقة نصية عائمة", palettes: LAQTA_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "laqta", category: "shared" },
];

export const VISIBLE_TEMPLATES = TEMPLATE_DEFS;

export function templatesForMode(mode: ContentMode): Template[] {
  return TEMPLATE_DEFS.filter((template) => template.category === mode || template.category === "shared");
}

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

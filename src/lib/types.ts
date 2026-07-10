// ============= Core Type Definitions =============

export type SlideType = "cover" | "content" | "ending";

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  body: string;
  ctaText?: string;
}

export type ContentType =
  | "تعليمي" | "قصة" | "توعوي" | "قائمة" | "خطوات" | "نصائح" | "مقارنة" | "شرح مفهوم"
  | "تفكيك الخرافات" | "شرح مرض";

export type Audience = string;

export type ContentLevel = "مبتدئ" | "متوسط" | "متقدم";

export type Tone =
  | "مبسطة" | "احترافية" | "ودية" | "رسمية" | "تحفيزية" | "قصصية" | "مباشرة" | "أكاديمية";

export type Language = "العربية الفصحى" | "اللهجة العراقية" | "اللهجة الخليجية" | "اللهجة المصرية" | "الإنجليزية";

export type CarouselSize = "1080x1080" | "1080x1350" | "1080x1920";

export type CTAOption = "بدون CTA" | "احفظ المنشور" | "شارك المنشور" | "تابع الحساب" | "اكتب رأيك";

export type FontFamily = "tajawal" | "cairo" | "ibm";

export type Placement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface Palette {
  id: string;
  name: string;
  background: string;
  text: string;
  accent: string;
  secondary: string;
}

export interface BrandKit {
  instagramHandle: string;
  logoDataUrl: string | null;
  primaryColor: string;
  font: FontFamily;
  disclaimerText?: string;
}

export interface BrandKitSettings {
  enabled: boolean;
  showLogo: boolean;
  showAccountName: boolean;
  showSlideNumber: boolean;
  showDisclaimer: boolean;
  placement: Placement;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  palettes: Palette[];
  fonts: FontFamily[];
  component: string; // template key for renderer
  category?: "medical" | "general";
}

export interface MedicalProps {
  specialty?: string;
  source?: string;
}

export interface ProjectSettings {
  contentType: ContentType;
  audience: Audience;
  level: ContentLevel;
  tone: Tone;
  language: Language;
  size: CarouselSize;
  slideCount: number;
  cta: CTAOption;
  templateId: string;
  paletteId: string;
  font: FontFamily;
  fontSizeScale: number;
  brandKit: BrandKitSettings;
  specialty?: string;
  source?: string;
}

export type ProjectStatus = "draft" | "completed";

export type ReviewStatus = "pending" | "pass" | "needs_review" | "blocked";

export interface Project {
  id: string;
  title: string;
  folderId: string | null;
  settings: ProjectSettings;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  status: ProjectStatus;
  favorite: boolean;
  reviewStatus?: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
}

export interface Folder {
  id: string;
  name: string;
}

export interface Stats {
  totalProjects: number;
  completedProjects: number;
  exportCount: number;
  favoriteTemplates: number;
}

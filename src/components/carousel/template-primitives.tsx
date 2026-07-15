"use client";

import React from "react";
import type {
  Slide,
  Palette,
  FontFamily,
  BrandKitSettings,
  CarouselSize,
  Placement,
  BrandKit as BrandKitData,
  MedicalProps,
  TextAlignment,
} from "@/lib/types";
import { oppositeHorizontalPlacement } from "@/lib/template-layout";

export interface SlideRenderProps {
  slide: Slide;
  templateId: string;
  palette: Palette;
  font: FontFamily;
  size: CarouselSize;
  brandKitSettings: BrandKitSettings;
  brandKitData: BrandKitData;
  index: number;
  total: number;
  fontSizeScale?: number;
  titleFont?: FontFamily;
  bodyFont?: FontFamily;
  titleFontSizeScale?: number;
  bodyFontSizeScale?: number;
  titleTextAlign?: TextAlignment;
  bodyTextAlign?: TextAlignment;
  medical?: MedicalProps;
}

export const fontMap: Record<FontFamily, string> = {
  tajawal: "var(--font-tajawal)",
  cairo: "var(--font-cairo)",
  ibm: "var(--font-ibm)",
};

export const decorFont = {
  playfair: "var(--font-playfair), serif",
  grotesk: "var(--font-grotesk), sans-serif",
  mono: "var(--font-mono), monospace",
  courier: "var(--font-courier), monospace",
};

export const fs = (px: number, scale = 1) => `${Math.round(px * scale)}px`;

export function TitleText({ children }: { children: React.ReactNode }) {
  return <span data-slide-title>{children}</span>;
}

export function BodyText({ children }: { children: React.ReactNode }) {
  return <span data-slide-body>{children}</span>;
}

const SPECIALTY_LABELS: Record<string, string> = {
  general: "طب عام",
  dentistry: "طب الأسنان",
  dermatology: "الجلدية",
  nutrition: "التغذية",
  pediatrics: "طب الأطفال",
  cardiology: "أمراض القلب",
  neurology: "الأعصاب",
  mental_health: "الصحة النفسية",
};

function BrandOverlay({ settings, data, palette, font, fontSizeScale = 1 }: {
  settings: BrandKitSettings;
  data: BrandKitData;
  palette: Palette;
  font: FontFamily;
  fontSizeScale?: number;
}) {
  if (!settings.enabled) return null;
  const posStyles: Record<Placement, React.CSSProperties> = {
    "top-right": { top: "64px", right: "64px" },
    "top-left": { top: "64px", left: "64px" },
    "bottom-right": { bottom: "64px", right: "64px" },
    "bottom-left": { bottom: "64px", left: "64px" },
  };
  const alignItems = settings.placement.includes("right") ? "flex-start" : "flex-end";
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: alignItems,
        zIndex: 10,
        ...posStyles[settings.placement],
      }}
    >
      {settings.showLogo && data.logoDataUrl && (
        <img
          src={data.logoDataUrl}
          alt="شعار الحساب"
          width={80}
          height={80}
          decoding="async"
          style={{ width: "80px", height: "80px", objectFit: "contain" }}
        />
      )}
      {settings.showAccountName && (
        <span style={{ fontFamily: fontMap[font], fontSize: fs(32, fontSizeScale), fontWeight: 600, color: palette.accent }}>
          {data.instagramHandle}
        </span>
      )}
    </div>
  );
}

function SlideNumber({ show, index, total, palette, font, placement, fontSizeScale = 1 }: {
  show: boolean; index: number; total: number; palette: Palette; font: FontFamily; placement: Placement; fontSizeScale?: number;
}) {
  if (!show) return null;
  const posStyles: Record<Placement, React.CSSProperties> = {
    "top-right": { top: "64px", right: "64px" },
    "top-left": { top: "64px", left: "64px" },
    "bottom-right": { bottom: "64px", right: "64px" },
    "bottom-left": { bottom: "64px", left: "64px" },
  };
  return (
    <span
      style={{
        position: "absolute",
        zIndex: 10,
        fontFamily: fontMap[font],
        fontSize: fs(36, fontSizeScale),
        fontWeight: 700,
        color: palette.accent,
        opacity: 0.7,
        ...posStyles[placement],
      }}
    >
      {index + 1} / {total}
    </span>
  );
}

export function BaseSlide({ children, palette, font, slide, settings, data, index, total, fontSizeScale = 1, style }: {
  children: React.ReactNode;
  palette: Palette;
  font: FontFamily;
  slide: Slide;
  settings: BrandKitSettings;
  data: BrandKitData;
  index: number;
  total: number;
  fontSizeScale?: number;
  style?: React.CSSProperties;
}) {
  const hasVisibleBrand = settings.enabled && (
    settings.showAccountName || (settings.showLogo && !!data.logoDataUrl)
  );
  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: fontMap[font],
        position: "relative",
        overflow: "hidden",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        isolation: "isolate",
        ...style,
      }}
    >
      {children}
      <BrandOverlay settings={settings} data={data} palette={palette} font={font} fontSizeScale={fontSizeScale} />
      <SlideNumber
        show={settings.enabled && settings.showSlideNumber}
        index={index}
        total={total}
        palette={palette}
        font={font}
        placement={hasVisibleBrand ? oppositeHorizontalPlacement(settings.placement) : settings.placement}
        fontSizeScale={fontSizeScale}
      />
    </div>
  );
}

export function DisclaimerFooter({ text, palette, font, fontSizeScale = 1, variant }: {
  text: string; palette: Palette; font: FontFamily; fontSizeScale?: number;
  variant: "overlay" | "inline";
}) {
  const content = text || "هذا المحتوى للتوعية فقط ولا يغني عن استشارة الطبيب";
  if (variant === "overlay") {
    return (
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "12px 40px",
        background: "rgba(0,0,0,0.04)",
        textAlign: "center",
        fontSize: "16px",
        color: palette.text,
        opacity: 0.7,
        fontFamily: fontMap[font],
        pointerEvents: "none",
      }}>
        {content}
      </div>
    );
  }
  return (
    <div style={{
      textAlign: "center",
      fontSize: fs(18, fontSizeScale),
      color: palette.text,
      opacity: 0.55,
      fontFamily: fontMap[font],
      padding: "8px 0",
      marginTop: "auto",
    }}>
      {content}
    </div>
  );
}

export function PhysicianMark({ specialty, palette, font, fontSizeScale = 1 }: {
  specialty?: string; palette: Palette; font: FontFamily; fontSizeScale?: number;
}) {
  if (!specialty) return null;
  const label = SPECIALTY_LABELS[specialty];
  if (!label) return null;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 20px",
      borderRadius: "100px",
      backgroundColor: palette.accent + "18",
      border: `1px solid ${palette.accent}40`,
      fontFamily: fontMap[font],
      fontSize: fs(22, fontSizeScale),
      fontWeight: 600,
      color: palette.accent,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
      </svg>
      <span>محتوى طبي</span>
      <span style={{ opacity: 0.6, fontSize: fs(18, fontSizeScale) }}>•</span>
      <span>{label}</span>
    </div>
  );
}

export function SourceBadge({ source, palette, font, fontSizeScale = 1 }: {
  source?: string; palette: Palette; font: FontFamily; fontSizeScale?: number;
}) {
  if (!source) return null;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 16px",
      borderRadius: "8px",
      backgroundColor: palette.secondary,
      fontFamily: fontMap[font],
      fontSize: fs(20, fontSizeScale),
      fontWeight: 500,
      color: palette.text,
      opacity: 0.85,
    }}>
      <span style={{ opacity: 0.6 }}>المصدر:</span>
      <span>{source}</span>
    </div>
  );
}

export const splitBody = (body: string): { para: string; items: string[] } => {
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return { para: lines[0] || "", items: [] };
  return { para: lines[0], items: lines.slice(1) };
};

export const PROJECT_IMAGE_OBJECT_POSITIONS = {
  center: "center center",
  top: "top center",
  bottom: "bottom center",
  left: "center left",
  right: "center right",
} as const;

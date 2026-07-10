"use client";

import { forwardRef, useRef, useState, useEffect, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { Slide, Palette, FontFamily, BrandKitSettings, CarouselSize, Placement, BrandKit as BrandKitData, SlideType, MedicalProps } from "@/lib/types";
import { SIZES, ALL_FONTS } from "@/lib/templates";

interface SlideRenderProps {
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
  medical?: MedicalProps;
}

const fontMap: Record<FontFamily, string> = {
  tajawal: "var(--font-tajawal)",
  cairo: "var(--font-cairo)",
  ibm: "var(--font-ibm)",
};

const decorFont = {
  playfair: "var(--font-playfair), serif",
  grotesk: "var(--font-grotesk), sans-serif",
  mono: "var(--font-mono), monospace",
  courier: "var(--font-courier), monospace",
};

const fs = (px: number, scale = 1) => `${Math.round(px * scale)}px`;

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

// ============= Main Slide Renderer =============

export const SlideRenderer = forwardRef<HTMLDivElement, SlideRenderProps>(function SlideRenderer(
  props, ref
) {
  const { templateId } = props;
  const renderers: Record<string, ForwardRefExoticComponent<SlideRenderProps & RefAttributes<HTMLDivElement>>> = {
    tahrir: Tahrir,
    wadeh: Wadeh,
    noqta: Noqta,
    itar: Itar,
    mujaz: Mujaz,
    academy: Academy,
    hadith: Hadith,
    tabayun: Tabayun,
    shabaka: Shabaka,
    unwan: Unwan,
    hero: Hero,
    editorial: Editorial,
    split: Split,
    stacked: Stacked,
    cards: Cards,
    rotated: Rotated,
    terminal: Terminal,
    magazine: Magazine,
    tilt: Tilt,
    retro: Retro,
    "clinical-clean": ClinicalClean,
    "numbered-steps": NumberedSteps,
    "myth-fact": MythFact,
    "editorial-health": EditorialHealth,
    "bold-statement": BoldStatement,
  };
  const Renderer = renderers[templateId] ?? Tahrir;
  return <Renderer {...props} ref={ref} />;
});

// ============= Scaled Wrapper =============
// Renders slide at natural 1080px size, visually scaled to fit container.
// width prop acts as maxWidth; slide fills container on smaller screens.

export function ScaledSlide({ width = 400, ...slideProps }: SlideRenderProps & { width?: number }) {
  const dims = SIZES.find((s) => s.id === slideProps.size) ?? SIZES[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(width);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setMeasuredWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = measuredWidth / dims.w;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-white mx-auto"
      style={{ width: "100%", maxWidth: `${width}px`, aspectRatio: `${dims.w} / ${dims.h}` }}
    >
      <div
        style={{
          width: `${dims.w}px`,
          height: `${dims.h}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top right",
        }}
        className="absolute top-0 right-0"
      >
        <SlideRenderer {...slideProps} />
        {slideProps.brandKitSettings.showDisclaimer && (
          <DisclaimerFooter
            variant="overlay"
            text={slideProps.brandKitData.disclaimerText || ""}
            palette={slideProps.palette}
            font={slideProps.font}
          />
        )}
      </div>
    </div>
  );
}

// Export-quality slide (natural size, no scaling)
export function ExportSlide(props: SlideRenderProps) {
  const dims = SIZES.find((s) => s.id === props.size) ?? SIZES[0];
  return (
    <div style={{ width: `${dims.w}px`, height: `${dims.h}px` }}>
      <SlideRenderer {...props} />
    </div>
  );
}

// ============= Brand Kit Overlay =============

function BrandOverlay({ settings, data, palette, font, fontSizeScale = 1 }: {
  settings: BrandKitSettings;
  data: BrandKitData;
  palette: Palette;
  font: FontFamily;
  fontSizeScale?: number;
}) {
  if (!settings.enabled) return null;
  const posStyles: Record<Placement, React.CSSProperties> = {
    "top-right": { top: "40px", right: "40px" },
    "top-left": { top: "40px", left: "40px" },
    "bottom-right": { bottom: "40px", right: "40px" },
    "bottom-left": { bottom: "40px", left: "40px" },
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
        <img src={data.logoDataUrl} alt="logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
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
    "top-right": { top: "40px", right: "40px" },
    "top-left": { top: "40px", left: "40px" },
    "bottom-right": { bottom: "40px", right: "40px" },
    "bottom-left": { bottom: "40px", left: "40px" },
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

// ============= Base Slide Wrapper =============

function BaseSlide({ children, palette, font, slide, settings, data, index, total, fontSizeScale = 1, style }: {
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
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: fontMap[font],
        position: "relative",
        overflow: "hidden",
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
        placement={settings.placement}
        fontSizeScale={fontSizeScale}
      />
    </div>
  );
}

// ============= Shared Medical Subcomponents =============

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

function PhysicianMark({ specialty, palette, font, fontSizeScale = 1 }: {
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
      <span>من إعداد طبيب</span>
      <span style={{ opacity: 0.6, fontSize: fs(18, fontSizeScale) }}>•</span>
      <span>{label}</span>
    </div>
  );
}

function SourceBadge({ source, palette, font, fontSizeScale = 1 }: {
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

// ============= 1. Tahrir — Editorial =============

const Tahrir = forwardRef<HTMLDivElement, SlideRenderProps>(function Tahrir(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Accent strip */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "100%", backgroundColor: palette.accent }} />
        <div style={{ padding: isCover ? "100px 80px 100px 80px" : "80px 80px 80px 80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: isCover ? "center" : "flex-start", paddingTop: isCover ? undefined : "90px" }}>
          {/* Slide number badge */}
          {!isCover && (
            <div style={{ marginBottom: "32px" }}>
              <span style={{ fontSize: fs(120, fontSizeScale), fontWeight: 800, color: palette.accent, opacity: 0.15, lineHeight: 1 }}>
                {String(index).padStart(2, "0")}
              </span>
            </div>
          )}
          {isCover && (
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 600, color: palette.accent, letterSpacing: "2px" }}>
                كاروسيل
              </span>
            </div>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 72 : 56, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(isCover ? 32 : 28, fontSizeScale), lineHeight: 1.6, color: palette.text, opacity: 0.75, margin: 0, maxWidth: "85%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "40px", display: "inline-block" }}>
              <span style={{
                display: "inline-block",
                padding: "16px 40px",
                backgroundColor: palette.accent,
                color: "#ffffff",
                fontSize: fs(30, fontSizeScale),
                fontWeight: 700,
                borderRadius: "100px",
              }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 2. Wadeh — Clean & Clear =============

const Wadeh = forwardRef<HTMLDivElement, SlideRenderProps>(function Wadeh(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 100px" }}>
          {isCover && (
            <div style={{ width: "80px", height: "8px", backgroundColor: palette.accent, borderRadius: "4px", marginBottom: "48px" }} />
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, marginBottom: "24px" }}>
              {index} / {total - 1}
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 64 : 52, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
            maxWidth: "90%",
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "48px" }}>
              <span style={{
                display: "inline-block",
                padding: "18px 48px",
                backgroundColor: palette.accent,
                color: "#fff",
                fontSize: fs(28, fontSizeScale),
                fontWeight: 700,
                borderRadius: "16px",
              }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 3. Noqta — Dot / Focal Point =============

const Noqta = forwardRef<HTMLDivElement, SlideRenderProps>(function Noqta(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Large circle element */}
        <div style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          backgroundColor: palette.secondary,
          opacity: 0.5,
        }} />
        <div style={{
          position: "absolute",
          bottom: "-150px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          backgroundColor: palette.accent,
          opacity: 0.1,
        }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 90px" }}>
          {!isCover && (
            <div style={{ marginBottom: "24px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: fs(26, fontSizeScale), fontWeight: 600, color: palette.accent }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: palette.accent }} />
                نقطة {index}
              </span>
            </div>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 68 : 54, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "85%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ fontSize: fs(32, fontSizeScale), fontWeight: 700, color: palette.accent, borderBottom: `4px solid ${palette.accent}`, paddingBottom: "8px" }}>
                {slide.ctaText} ←
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 4. Itar — Frame =============

const Itar = forwardRef<HTMLDivElement, SlideRenderProps>(function Itar(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Frame border */}
        <div style={{ position: "absolute", inset: "40px", border: `3px solid ${palette.accent}`, borderRadius: "24px" }} />
        <div style={{ position: "absolute", inset: "52px", border: `1px solid ${palette.accent}`, borderRadius: "20px", opacity: 0.3 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 120px" }}>
          {isCover && (
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: palette.accent, marginBottom: "32px" }} />
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(26, fontSizeScale), fontWeight: 700, color: palette.accent, marginBottom: "20px", opacity: 0.8 }}>
              شريحة {index}
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 60 : 50, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.65, margin: 0, maxWidth: "85%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ display: "inline-block", padding: "14px 36px", border: `2px solid ${palette.accent}`, color: palette.accent, fontSize: fs(28, fontSizeScale), fontWeight: 700, borderRadius: "12px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 5. Mujaz — Brief / Centered =============

const Mujaz = forwardRef<HTMLDivElement, SlideRenderProps>(function Mujaz(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", padding: "60px 120px", maxWidth: "900px" }}>
          {isCover && (
            <span style={{ display: "block", fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, marginBottom: "16px", letterSpacing: "3px", textTransform: "uppercase" }}>
              موجز
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 56 : 44, fontSizeScale),
            fontWeight: 700,
            lineHeight: 1.35,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(26, fontSizeScale), lineHeight: 1.8, opacity: 0.6, margin: 0 }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "32px" }}>
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 700, color: palette.accent }}>
                {slide.ctaText} →
              </span>
            </div>
          )}
          {!isCover && !isEnding && (
            <div style={{ marginTop: "32px", display: "flex", justifyContent: "center", gap: "8px" }}>
              {Array.from({ length: total - 2 }, (_, i) => (
                <span key={i} style={{ width: i === index - 1 ? "32px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i === index - 1 ? palette.accent : palette.secondary }} />
              ))}
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 6. Academy — Academic Sidebar =============

const Academy = forwardRef<HTMLDivElement, SlideRenderProps>(function Academy(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Sidebar */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "100%", backgroundColor: palette.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
          <span style={{ fontSize: fs(56, fontSizeScale), fontWeight: 800, color: "#ffffff", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {isCover ? "01" : isEnding ? String(total).padStart(2, "0") : String(index).padStart(2, "0")}
          </span>
        </div>
        <div style={{ paddingRight: "160px", paddingLeft: "80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isCover && (
            <span style={{ fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, marginBottom: "16px" }}>
              محتوى أكاديمي
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 60 : 48, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <div style={{ borderRight: `4px solid ${palette.accent}`, paddingRight: "24px", marginRight: "-28px" }}>
              <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                {slide.body}
              </p>
            </div>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "32px" }}>
              <span style={{ display: "inline-block", padding: "14px 40px", backgroundColor: palette.accent, color: "#fff", fontSize: fs(28, fontSizeScale), fontWeight: 700, borderRadius: "8px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 7. Hadith — Modern Geometric =============

const Hadith = forwardRef<HTMLDivElement, SlideRenderProps>(function Hadith(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Geometric shapes */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "350px", height: "350px", backgroundColor: palette.secondary, transform: "rotate(15deg)", borderRadius: "32px" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", backgroundColor: palette.accent, opacity: 0.12 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 90px" }}>
          {!isCover && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: fs(26, fontSizeScale), fontWeight: 700, color: palette.accent, backgroundColor: palette.secondary, padding: "8px 24px", borderRadius: "100px" }}>
                {String(index).padStart(2, "0")}
              </span>
            </div>
          )}
          {isCover && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: fs(26, fontSizeScale), fontWeight: 700, color: palette.accent, backgroundColor: palette.secondary, padding: "8px 24px", borderRadius: "100px" }}>جديد</span>
            </div>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 64 : 52, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: fs(30, fontSizeScale), fontWeight: 700, color: "#fff", backgroundColor: palette.accent, padding: "16px 40px", borderRadius: "100px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 8. Tabayun — Contrast =============

const Tabayun = forwardRef<HTMLDivElement, SlideRenderProps>(function Tabayun(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const isDark = palette.background !== "#FAFAF9" && palette.background !== "#F5F5F4" && palette.background !== "#FFF5F3";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "80px", backgroundColor: palette.accent }} />
        {/* Side block */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "40%", height: "100%", backgroundColor: palette.secondary, opacity: 0.5 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 90px 80px 90px" }}>
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 800, color: palette.accent, marginBottom: "20px" }}>
              {String(index).padStart(2, "0")} /
            </span>
          )}
          {isCover && (
            <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 800, color: palette.accent, marginBottom: "20px" }}>
              00 /
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 60 : 50, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.75, margin: 0, maxWidth: "75%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ fontSize: fs(32, fontSizeScale), fontWeight: 800, color: palette.accent }}>
                ← {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 9. Shabaka — Grid Pattern =============

const Shabaka = forwardRef<HTMLDivElement, SlideRenderProps>(function Shabaka(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Grid background */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${palette.secondary} 2px, transparent 2px), linear-gradient(90deg, ${palette.secondary} 2px, transparent 2px)`,
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }} />
        {/* Content card */}
        <div style={{
          position: "relative",
          zIndex: 2,
          margin: "60px",
          backgroundColor: palette.background,
          borderRadius: "24px",
          padding: "60px 70px",
          height: "calc(100% - 120px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: `2px solid ${palette.accent}`,
        }}>
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(26, fontSizeScale), fontWeight: 700, color: palette.accent, marginBottom: "16px" }}>
              الشريحة {index}
            </span>
          )}
          {isCover && (
            <div style={{ width: "48px", height: "48px", backgroundColor: palette.accent, borderRadius: "12px", marginBottom: "24px" }} />
          )}
          <h1 style={{
            fontSize: fs(isCover ? 56 : 46, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: fs(26, fontSizeScale), lineHeight: 1.7, opacity: 0.65, margin: 0 }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "28px" }}>
              <span style={{ display: "inline-block", padding: "12px 36px", backgroundColor: palette.accent, color: "#fff", fontSize: fs(26, fontSizeScale), fontWeight: 700, borderRadius: "12px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Helper: split body into paragraph + list items =============

const splitBody = (body: string): { para: string; items: string[] } => {
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return { para: lines[0] || "", items: [] };
  return { para: lines[0], items: lines.slice(1) };
};

// ============= 11. Hero — Center Hero (style01) =============

const Hero = forwardRef<HTMLDivElement, SlideRenderProps>(function Hero(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontFamily: decorFont.grotesk, fontWeight: 200, fontSize: fs(420, fontSizeScale),
          color: "transparent", WebkitTextStroke: `1px ${palette.text}`, opacity: 0.06,
          lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", gap: fs(22, fontSizeScale), padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "3px", textTransform: "uppercase",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 18px", borderRadius: "30px",
            }}>
              {isCover ? "كاروسيل" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(16, fontSizeScale), letterSpacing: "6px", color: palette.accent, textTransform: "uppercase" }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{
              fontSize: fs(isCover ? 66 : 54, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0,
            }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{
              fontSize: fs(46, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0,
            }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}>
              {slide.body}
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(14, fontSizeScale), padding: 0, margin: 0, alignItems: "center" }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, textAlign: "center" }}>{item}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.text}20`, borderRadius: "14px", padding: "20px 26px", direction: "ltr", textAlign: "left", maxWidth: "760px", width: "100%" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(21, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 12. Editorial — Left Editorial (style02) =============

const Editorial = forwardRef<HTMLDivElement, SlideRenderProps>(function Editorial(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", insetInlineEnd: "30px", top: "120px",
          fontFamily: decorFont.playfair, fontWeight: 900, fontSize: fs(320, fontSizeScale),
          color: palette.accent, opacity: 0.12, lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center",
          textAlign: "right", gap: fs(20, fontSizeScale), maxWidth: "680px", padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 16px", borderRadius: "20px",
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{
              fontFamily: decorFont.playfair, fontSize: fs(isCover ? 58 : 50, fontSizeScale),
              fontWeight: 900, lineHeight: 1.2, margin: 0,
            }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{
              fontFamily: decorFont.playfair, fontSize: fs(42, fontSizeScale),
              fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0,
            }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.85, color: palette.text, opacity: 0.6, margin: 0 }}>
              {slide.body}
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.85, color: palette.text, opacity: 0.6, margin: 0 }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(14, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(23, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "26px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, color: palette.accent }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, borderInlineStart: `4px solid ${palette.accent}`, borderRadius: "8px", padding: "18px 24px", direction: "ltr", textAlign: "left", width: "100%" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 13. Split — Split Panel (style03) =============

const Split = forwardRef<HTMLDivElement, SlideRenderProps>(function Split(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{ height: "100%", display: "flex", flexDirection: "row-reverse" }}>
          <div style={{ flex: 1, padding: "60px 70px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(20, fontSizeScale) }}>
              {(isCover || isEnding) && (
                <span style={{
                  fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
                  color: palette.accent, border: `1px solid ${palette.accent}`,
                  padding: "6px 16px", borderRadius: "20px", alignSelf: "flex-start",
                }}>
                  {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
                </span>
              )}
              {!isCover && !isEnding && (
                <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
                  {`// ${String(index + 1).padStart(2, "0")}`}
                </span>
              )}
              {isCover || isEnding ? (
                <h1 style={{ fontSize: fs(isCover ? 56 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
                  {slide.title}
                </h1>
              ) : (
                <h2 style={{ fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
                  {slide.title}
                </h2>
              )}
              {(isCover || isEnding) && slide.body && (
                <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}>{slide.body}</p>
              )}
              {!isCover && !isEnding && slide.body && (
                <>
                  {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}>{para}</p>}
                  {items.length > 0 && (
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ fontSize: fs(23, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "28px", position: "relative" }}>
                          <span style={{ position: "absolute", insetInlineStart: 0, top: "11px", width: "10px", height: "10px", background: palette.accent, borderRadius: "50%" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              {isEnding && slide.ctaText && (
                <div style={{ background: palette.secondary, border: `1px solid ${palette.accent}40`, borderRadius: "10px", padding: "18px 24px", direction: "ltr", textAlign: "left" }}>
                  <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
                  <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: "0 0 36%", backgroundColor: palette.accent, color: palette.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", position: "relative" }}>
            <div style={{ fontFamily: decorFont.grotesk, fontWeight: 700, fontSize: fs(200, fontSizeScale), lineHeight: 0.9 }}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{
              fontFamily: decorFont.grotesk, fontSize: fs(20, fontSizeScale), letterSpacing: "4px",
              textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)", opacity: 0.8,
            }}>
              {isCover ? "START" : isEnding ? "END" : "SLIDE"}
            </div>
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 14. Stacked — Bottom Stacked (style04) =============

const Stacked = forwardRef<HTMLDivElement, SlideRenderProps>(function Stacked(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", insetInlineStart: "40px", top: "90px",
          fontWeight: 900, fontSize: fs(300, fontSizeScale), color: palette.accent, opacity: 0.16,
          lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "flex-end", alignItems: "flex-start", gap: fs(18, fontSizeScale),
          textAlign: "right", padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 16px", borderRadius: "20px",
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 60 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{ fontSize: fs(44, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "840px" }}>{slide.body}</p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "840px" }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "30px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, top: "12px", width: "11px", height: "11px", borderRadius: "50%", background: palette.accent }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.accent}40`, borderRadius: "22px", padding: "18px 24px", direction: "ltr", textAlign: "left", maxWidth: "840px", width: "100%" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 15. Cards — Card Grid (style05) =============

const Cards = forwardRef<HTMLDivElement, SlideRenderProps>(function Cards(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(22, fontSizeScale),
          padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: "#fff", background: palette.accent,
              padding: "6px 18px", borderRadius: "20px", alignSelf: "flex-start",
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 60 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{ fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}>{slide.body}</p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}>{para}</p>}
              {items.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: fs(16, fontSizeScale) }}>
                  {items.map((item, i) => (
                    <div key={i} style={{
                      fontSize: fs(22, fontSizeScale), color: palette.text, opacity: 0.7,
                      background: palette.background, border: `1px solid ${palette.accent}30`,
                      borderRadius: "16px", padding: "18px 22px",
                      boxShadow: `0 8px 18px ${palette.accent}1a`,
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `1px solid ${palette.accent}30`, borderRadius: "16px", padding: "18px 24px", direction: "ltr", textAlign: "left", boxShadow: `0 10px 24px ${palette.accent}1a` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 16. Rotated — Asymmetric Rotated (style06) =============

const Rotated = forwardRef<HTMLDivElement, SlideRenderProps>(function Rotated(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", insetInlineStart: "-40px", top: "300px",
          width: "8px", height: "420px", background: palette.accent,
          transform: "rotate(-10deg)", opacity: 0.5, zIndex: 0,
        }} />
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
          gap: fs(20, fontSizeScale), transform: "translateX(40px)", padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px", color: "#fff",
              background: palette.accent, padding: "6px 16px", borderRadius: "4px",
              transform: "rotate(-3deg)", alignSelf: "flex-start",
              boxShadow: `6px 6px 0 ${palette.accent}40`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent, fontFamily: decorFont.grotesk }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 62 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.12, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{
              fontSize: fs(44, fontSizeScale), fontWeight: 700, color: palette.accent,
              lineHeight: 1.2, margin: 0, transform: "rotate(-1.5deg)", transformOrigin: "right",
            }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}>{slide.body}</p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(14, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "30px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, color: palette.accent }}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `2px solid ${palette.text}`, borderRadius: "4px", padding: "18px 24px", direction: "ltr", textAlign: "left", boxShadow: `8px 8px 0 ${palette.accent}` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 17. Terminal — Code-First Mono (style07) =============

const Terminal = forwardRef<HTMLDivElement, SlideRenderProps>(function Terminal(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const mono = decorFont.mono;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(18, fontSizeScale),
          padding: "56px 64px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(12, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "5px 14px", borderRadius: "4px", alignSelf: "flex-start", fontFamily: mono,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(14, fontSizeScale), letterSpacing: "3px", color: palette.accent, fontFamily: mono }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 54 : 48, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{ fontSize: fs(38, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "880px", fontFamily: mono }}>{slide.body}</p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "880px", fontFamily: mono }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(12, fontSizeScale), padding: 0, margin: 0, fontFamily: mono }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(21, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "26px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, color: palette.accent }}>$</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.accent}40`, borderInlineStart: `4px solid ${palette.accent}`, borderRadius: "8px", padding: "24px 28px", direction: "ltr", textAlign: "left", fontFamily: mono, boxShadow: "0 14px 30px rgba(0,0,0,.4)" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(24, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 18. Magazine — Magazine Columns (style08) =============

const Magazine = forwardRef<HTMLDivElement, SlideRenderProps>(function Magazine(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{ border: `2px dashed ${palette.text}40` }}
      >
        <div style={{
          position: "absolute", insetInlineEnd: "20px", top: "90px",
          fontWeight: 900, fontSize: fs(300, fontSizeScale), color: palette.accent, opacity: 0.14,
          lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(18, fontSizeScale),
          maxWidth: "720px", padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.background, background: palette.accent,
              padding: "6px 16px", alignSelf: "flex-start",
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 58 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{ fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.9, color: palette.text, opacity: 0.6, margin: 0, columnCount: 2, columnGap: "34px", textAlign: "justify" }}>
              {slide.body}
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.9, color: palette.text, opacity: 0.6, margin: 0, columnCount: 2, columnGap: "34px", textAlign: "justify" }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(22, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "26px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, top: "6px", color: palette.accent, fontSize: fs(12, fontSizeScale) }}>■</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.text}40`, borderRadius: "4px", padding: "16px 22px", direction: "ltr", textAlign: "left" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(19, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 19. Tilt — Diagonal Tilt (style09) =============

const Tilt = forwardRef<HTMLDivElement, SlideRenderProps>(function Tilt(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{ background: `linear-gradient(135deg, ${palette.background}, ${palette.secondary})` }}
      >
        <div style={{
          position: "absolute", inset: "-60px",
          background: `${palette.accent}12`, border: `1px solid ${palette.accent}30`,
          transform: "rotate(-4deg)", zIndex: 1,
        }} />
        <div style={{
          position: "relative", zIndex: 3, height: "100%",
          display: "flex", flexDirection: "column", gap: fs(20, fontSizeScale),
          transform: "rotate(-4deg)", padding: "60px 70px",
          justifyContent: "center",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 16px", borderRadius: "20px", alignSelf: "flex-start",
              background: `${palette.accent}12`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{ fontSize: fs(isCover ? 60 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{ fontSize: fs(44, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "840px" }}>{slide.body}</p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "840px" }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "30px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, top: "12px", width: "11px", height: "11px", borderRadius: "50%", background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary})` }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: `${palette.background}cc`, border: `1px solid ${palette.accent}30`, borderRadius: "16px", padding: "18px 24px", direction: "ltr", textAlign: "left", backdropFilter: "blur(8px)" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 20. Retro — Retro 90s (style10) =============

const Retro = forwardRef<HTMLDivElement, SlideRenderProps>(function Retro(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{
          background: `repeating-linear-gradient(45deg, ${palette.secondary}30 0 22px, transparent 22px 44px), ${palette.background}`,
        }}
      >
        <div style={{
          position: "absolute", insetInlineStart: "40px", top: "60px",
          fontFamily: decorFont.grotesk, fontWeight: 700, fontSize: fs(200, fontSizeScale),
          color: palette.accent, WebkitTextStroke: `3px ${palette.text}`,
          lineHeight: 1, zIndex: 0,
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          gap: fs(18, fontSizeScale), padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(14, fontSizeScale), fontWeight: 700, letterSpacing: "1px",
              color: "#fff", background: palette.accent, padding: "8px 18px",
              alignSelf: "flex-start", boxShadow: `5px 5px 0 ${palette.secondary}`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "4px", color: palette.accent, fontWeight: 700 }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <h1 style={{
              fontSize: fs(isCover ? 58 : 48, fontSizeScale), fontWeight: 900, lineHeight: 1.15,
              background: palette.text, color: palette.background, display: "inline-block",
              padding: "14px 26px", alignSelf: "flex-start", margin: 0,
              boxShadow: `8px 8px 0 ${palette.accent}`,
            }}>
              {slide.title}
            </h1>
          ) : (
            <h2 style={{
              fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent,
              background: palette.background, display: "inline-block", padding: "10px 20px",
              alignSelf: "flex-start", margin: 0, border: `3px solid ${palette.text}`,
              boxShadow: `6px 6px 0 ${palette.secondary}`,
            }}>
              {slide.title}
            </h2>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{
              fontSize: fs(23, fontSizeScale), lineHeight: 1.8, color: palette.text,
              background: `${palette.background}d8`, padding: "14px 20px",
              alignSelf: "flex-start", maxWidth: "820px", border: `2px solid ${palette.text}`,
            }}>
              {slide.body}
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{
                fontSize: fs(23, fontSizeScale), lineHeight: 1.8, color: palette.text,
                background: `${palette.background}d8`, padding: "14px 20px",
                alignSelf: "flex-start", maxWidth: "820px", border: `2px solid ${palette.text}`,
              }}>{para}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(12, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{
                      fontSize: fs(23, fontSizeScale), color: palette.text,
                      background: `${palette.background}d8`, padding: "12px 18px",
                      border: `2px solid ${palette.text}`, borderInlineStart: `8px solid ${palette.accent}`,
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `3px solid ${palette.text}`, padding: "16px 22px", direction: "ltr", textAlign: "left", boxShadow: `6px 6px 0 ${palette.accent}` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 10. Unwan — Oversized Title =============

const Unwan = forwardRef<HTMLDivElement, SlideRenderProps>(function Unwan(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8px", backgroundColor: palette.accent }} />
        <div style={{ padding: "80px 80px 80px 80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {!isCover && (
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — {String(index).padStart(2, "0")}
              </span>
            )}
            {isCover && (
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — عنوان
              </span>
            )}
          </div>
          <div>
            <h1 style={{
              fontSize: fs(isCover ? 84 : 68, fontSizeScale),
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: slide.body ? "24px" : 0,
              letterSpacing: "-1px",
            }}>
              {slide.title}
            </h1>
            {slide.body && (
              <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.6, opacity: 0.6, margin: 0, maxWidth: "85%" }}>
                {slide.body}
              </p>
            )}
            {isEnding && slide.ctaText && (
              <div style={{ marginTop: "32px" }}>
                <span style={{ fontSize: fs(34, fontSizeScale), fontWeight: 800, color: palette.accent }}>
                  {slide.ctaText} →
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", backgroundColor: i === index ? palette.accent : palette.secondary }} />
            ))}
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Medical Spec Templates =============

// ============= Clinical Clean =============

const ClinicalClean = forwardRef<HTMLDivElement, SlideRenderProps>(function ClinicalClean(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const padding = "80px 72px";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding, height: "100%", display: "flex", flexDirection: "column", justifyContent: isCover ? "center" : "flex-start", paddingTop: isCover ? undefined : "80px", gap: "24px" }}>
          {isCover && medical?.specialty && (
            <div style={{ position: "absolute", top: "72px", right: "72px" }}>
              <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, letterSpacing: "1px", alignSelf: "flex-start" }}>
              {String(index).padStart(2, "0")} — شريحة
            </span>
          )}
          <h1 style={{
            fontSize: fs(isCover ? 68 : 52, fontSizeScale),
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
            fontFamily: fontMap.ibm,
            textAlign: "right",
            maxWidth: "90%",
          }}>
            {slide.title}
          </h1>
          <div style={{ width: fs(80, fontSizeScale), height: "4px", backgroundColor: palette.accent, borderRadius: "2px" }} />
          {slide.body && (
            <p style={{
              fontSize: fs(34, fontSizeScale),
              lineHeight: 1.7,
              color: palette.text,
              opacity: 0.8,
              margin: 0,
              maxWidth: "88%",
              fontWeight: 400,
            }}>
              {slide.body}
            </p>
          )}
          {!isCover && medical?.source && (
            <div style={{ marginTop: "8px" }}>
              <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", marginTop: "40px" }}>
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "16px 40px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(30, fontSizeScale),
                  fontWeight: 700,
                  borderRadius: "100px",
                }}>
                  {slide.ctaText}
                </span>
              )}
            </div>
          )}
          {brandKitSettings.showDisclaimer && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Numbered Steps =============

const NumberedSteps = forwardRef<HTMLDivElement, SlideRenderProps>(function NumberedSteps(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const stepItems = !isCover && !isEnding && slide.body ? slide.body.split("\n").filter((l) => l.trim()) : [];
  const isList = stepItems.length > 1;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          {isCover && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 28px",
                  borderRadius: "100px",
                  backgroundColor: palette.secondary,
                  fontSize: fs(26, fontSizeScale),
                  fontWeight: 700,
                  color: palette.accent,
                  fontFamily: fontMap.cairo,
                }}>
                  {total - 2} خطوات
                </span>
                {medical?.specialty && (
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                )}
              </div>
              <h1 style={{
                fontSize: fs(72, fontSizeScale),
                fontWeight: 900,
                lineHeight: 1.2,
                margin: 0,
                fontFamily: fontMap.cairo,
                textAlign: "right",
              }}>
                {slide.title}
              </h1>
              {slide.body && (
                <p style={{ fontSize: fs(34, fontSizeScale), lineHeight: 1.6, opacity: 0.7, margin: 0, maxWidth: "85%" }}>
                  {slide.body}
                </p>
              )}
            </>
          )}
          {!isCover && !isEnding && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
                <span style={{
                  fontSize: fs(isList ? 100 : 140, fontSizeScale),
                  fontWeight: 900,
                  color: palette.secondary,
                  lineHeight: 1,
                  fontFamily: fontMap.cairo,
                  flexShrink: 0,
                  minWidth: fs(isList ? 100 : 140, fontSizeScale),
                  textAlign: "center",
                }}>
                  {index}
                </span>
                <div style={{ flex: 1, paddingTop: fs(20, fontSizeScale) }}>
                  {isList ? (
                    <>
                      <h2 style={{ fontSize: fs(40, fontSizeScale), fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3 }}>
                        {slide.title}
                      </h2>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        {stepItems.map((item, i) => (
                          <li key={i} style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.5, display: "flex", gap: "12px", alignItems: "baseline" }}>
                            <span style={{ color: palette.accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h2 style={{ fontSize: fs(48, fontSizeScale), fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3 }}>
                        {slide.title}
                      </h2>
                      <p style={{ fontSize: fs(32, fontSizeScale), lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
                        {slide.body}
                      </p>
                    </>
                  )}
                  {medical?.source && (
                    <div style={{ marginTop: "16px" }}>
                      <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
                {Array.from({ length: Math.max(total - 2, 1) }, (_, i) => (
                  <span key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", backgroundColor: i === index - 1 ? palette.accent : palette.secondary }} />
                ))}
              </div>
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px" }}>
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "18px 48px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(32, fontSizeScale),
                  fontWeight: 700,
                  borderRadius: "16px",
                }}>
                  {slide.ctaText}
                </span>
              )}
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {brandKitSettings.showDisclaimer && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Myth vs Fact =============

const MythFact = forwardRef<HTMLDivElement, SlideRenderProps>(function MythFact(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";

  const mythColor = palette.accent;
  const factColor = palette.secondary;

  const bodyLines = slide.body ? slide.body.split("\n").map((l) => l.trim()).filter(Boolean) : [];
  const mythText = bodyLines.find((l) => l.startsWith("خرافة:") || l.startsWith("خرافة："))?.replace(/^خرافة[:：]\s*/, "");
  const factText = bodyLines.find((l) => l.startsWith("حقيقة:") || l.startsWith("حقيقة："))?.replace(/^حقيقة[:：]\s*/, "");
  const isSplit = mythText && factText;
  const regularBody = !isSplit ? slide.body : null;

  const MythBadge = () => (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 24px",
      borderRadius: "100px",
      backgroundColor: mythColor + "20",
      fontFamily: fontMap.cairo,
      fontSize: fs(30, fontSizeScale),
      fontWeight: 800,
      color: mythColor,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: mythColor, color: "#fff", fontSize: fs(20, fontSizeScale), fontWeight: 900 }}>✕</span>
      خرافة
    </div>
  );

  const FactBadge = () => (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 24px",
      borderRadius: "100px",
      backgroundColor: factColor + "20",
      fontFamily: fontMap.cairo,
      fontSize: fs(30, fontSizeScale),
      fontWeight: 800,
      color: factColor,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: factColor, color: "#fff", fontSize: fs(20, fontSizeScale), fontWeight: 900 }}>✓</span>
      حقيقة
    </div>
  );

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
          {isCover && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "32px", textAlign: "center" }}>
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                backgroundColor: mythColor + "18", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: fs(56, fontSizeScale), color: mythColor, fontWeight: 900,
              }}>
                ✕
              </div>
              <h1 style={{
                fontSize: fs(64, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.25,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "85%",
              }}>
                {slide.title}
              </h1>
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 600, color: factColor }}>
                الحقيقة بالداخل ↓
              </span>
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {!isCover && !isEnding && (
            <>
              {isSplit ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px", height: "100%", justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <MythBadge />
                    <p style={{
                      fontSize: fs(40, fontSizeScale),
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0,
                      color: palette.text,
                      opacity: 0.5,
                      textDecoration: "line-through",
                      fontFamily: fontMap.ibm,
                    }}>
                      {mythText}
                    </p>
                  </div>
                  <div style={{ height: "2px", backgroundColor: palette.text, opacity: 0.1 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <FactBadge />
                    <p style={{
                      fontSize: fs(40, fontSizeScale),
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0,
                      color: palette.text,
                      fontFamily: fontMap.ibm,
                    }}>
                      {factText}
                    </p>
                    {medical?.source && (
                      <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", justifyContent: "center" }}>
                  {slide.title.includes("خرافة") || slide.title.includes("خرافه") ? <MythBadge /> : slide.title.includes("حقيقة") || slide.title.includes("حقيقه") ? <FactBadge /> : null}
                  <h2 style={{
                    fontSize: fs(48, fontSizeScale),
                    fontWeight: 600,
                    lineHeight: 1.4,
                    margin: 0,
                    fontFamily: fontMap.ibm,
                  }}>
                    {slide.title}
                  </h2>
                  {regularBody && (
                    <p style={{ fontSize: fs(34, fontSizeScale), lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
                      {regularBody}
                    </p>
                  )}
                  {medical?.source && (
                    <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                  )}
                </div>
              )}
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: factColor + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs(44, fontSizeScale), color: factColor, fontWeight: 900 }}>✓</div>
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "18px 48px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(30, fontSizeScale),
                  fontWeight: 700,
                  borderRadius: "16px",
                }}>
                  {slide.ctaText}
                </span>
              )}
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {brandKitSettings.showDisclaimer && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Editorial Health =============

const EditorialHealth = forwardRef<HTMLDivElement, SlideRenderProps>(function EditorialHealth(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const paragraphs = slide.body ? slide.body.split("\n").filter((l) => l.trim()) : [];
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 100px", height: "100%", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px", marginRight: "auto", marginLeft: "auto" }}>
          {isCover && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", justifyContent: "center", height: "100%" }}>
              {medical?.specialty && (
                <div style={{ alignSelf: "flex-start" }}>
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
              <span style={{
                fontSize: fs(24, fontSizeScale),
                fontWeight: 600,
                color: palette.accent,
                letterSpacing: "2px",
              }}>
                {String(index).padStart(2, "0")} — مقال صحي
              </span>
              <h1 style={{
                fontSize: fs(62, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "90%",
              }}>
                {slide.title}
              </h1>
              <div style={{ width: fs(60, fontSizeScale), height: "3px", backgroundColor: palette.accent, borderRadius: "2px" }} />
              {slide.body && (
                <p style={{
                  fontSize: fs(34, fontSizeScale),
                  lineHeight: 1.75,
                  color: palette.text,
                  opacity: 0.75,
                  margin: 0,
                  maxWidth: "80%",
                }}>
                  {slide.body}
                </p>
              )}
            </div>
          )}
          {!isCover && !isEnding && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", justifyContent: "flex-start", paddingTop: "40px" }}>
              <span style={{
                fontSize: fs(24, fontSizeScale),
                fontWeight: 600,
                color: palette.accent,
                letterSpacing: "2px",
              }}>
                {String(index).padStart(2, "0")}
              </span>
              <h2 style={{
                fontSize: fs(52, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "95%",
              }}>
                {slide.title}
              </h2>
              <div style={{ width: fs(40, fontSizeScale), height: "2px", backgroundColor: palette.accent, opacity: 0.5, borderRadius: "1px" }} />
              {paragraphs.map((para, i) => (
                <p key={i} style={{
                  fontSize: fs(34, fontSizeScale),
                  lineHeight: 1.75,
                  color: palette.text,
                  opacity: 0.8,
                  margin: 0,
                  maxWidth: "85%",
                }}>
                  {para}
                </p>
              ))}
              {medical?.source && (
                <div style={{ marginTop: "8px" }}>
                  <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
            </div>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "28px" }}>
              <div style={{ width: fs(40, fontSizeScale), height: "3px", backgroundColor: palette.accent, borderRadius: "2px" }} />
              {slide.ctaText && (
                <span style={{
                  fontSize: fs(42, fontSizeScale),
                  fontWeight: 700,
                  color: palette.accent,
                  fontFamily: fontMap.ibm,
                  textAlign: "center",
                }}>
                  {slide.ctaText}
                </span>
              )}
              <div style={{
                fontSize: fs(28, fontSizeScale),
                fontWeight: 600,
                color: palette.text,
                opacity: 0.6,
                fontFamily: fontMap[font],
              }}>
                {brandKitData.instagramHandle}
              </div>
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {brandKitSettings.showDisclaimer && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= Bold Statement =============

const BoldStatement = forwardRef<HTMLDivElement, SlideRenderProps>(function BoldStatement(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";

  const isStat = !isCover && !isEnding && /^\d+/.test(slide.title);
  const statNumber = isStat ? slide.title.match(/^\d+/)?.[0] : null;
  const statLabel = isStat ? slide.title.replace(/^\d+/, "").trim() : null;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>
          {isCover && (
            <>
              {medical?.specialty && (
                <div style={{ position: "absolute", top: "72px", left: "72px" }}>
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
              <h1 style={{
                fontSize: fs(84, fontSizeScale),
                fontWeight: 900,
                lineHeight: 1.15,
                margin: 0,
                fontFamily: fontMap.ibm,
                textAlign: "right",
                maxWidth: "95%",
              }}>
                {slide.title}
              </h1>
              {slide.body && (
                <p style={{
                  fontSize: fs(32, fontSizeScale),
                  lineHeight: 1.4,
                  opacity: 0.7,
                  margin: 0,
                  maxWidth: "70%",
                }}>
                  {slide.body}
                </p>
              )}
            </>
          )}
          {!isCover && !isEnding && (
            <>
              {isStat && statNumber && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{
                    fontSize: fs(140, fontSizeScale),
                    fontWeight: 900,
                    lineHeight: 1,
                    color: palette.accent,
                    fontFamily: fontMap.ibm,
                  }}>
                    {statNumber}
                  </span>
                  {statLabel && (
                    <span style={{
                      fontSize: fs(44, fontSizeScale),
                      fontWeight: 700,
                      lineHeight: 1.2,
                      fontFamily: fontMap.ibm,
                      maxWidth: "90%",
                    }}>
                      {statLabel}
                    </span>
                  )}
                </div>
              )}
              {!isStat && (
                <h2 style={{
                  fontSize: fs(72, fontSizeScale),
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: fontMap.ibm,
                  textAlign: "right",
                  maxWidth: "95%",
                }}>
                  {slide.title}
                </h2>
              )}
              {slide.body && (
                <p style={{
                  fontSize: fs(32, fontSizeScale),
                  lineHeight: 1.4,
                  opacity: 0.7,
                  margin: 0,
                  maxWidth: "75%",
                }}>
                  {slide.body}
                </p>
              )}
              {medical?.source && (
                <div style={{ marginTop: "8px" }}>
                  <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "28px" }}>
              {slide.ctaText && (
                <div style={{
                  display: "inline-block",
                  padding: "24px 56px",
                  backgroundColor: palette.accent,
                  color: "#FFFFFF",
                  fontSize: fs(40, fontSizeScale),
                  fontWeight: 900,
                  borderRadius: "0",
                  fontFamily: fontMap.ibm,
                }}>
                  {slide.ctaText}
                </div>
              )}
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {brandKitSettings.showDisclaimer && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

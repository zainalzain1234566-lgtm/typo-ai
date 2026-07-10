"use client";

import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { Slide, Palette, FontFamily, BrandKitSettings, CarouselSize, Placement, BrandKit as BrandKitData, SlideType } from "@/lib/types";
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
}

const fontMap: Record<FontFamily, string> = {
  tajawal: "var(--font-tajawal)",
  cairo: "var(--font-cairo)",
  ibm: "var(--font-ibm)",
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
  };
  const Renderer = renderers[templateId] ?? Tahrir;
  return <Renderer {...props} ref={ref} />;
});

// ============= Scaled Wrapper =============
// Renders slide at natural 1080px size, visually scaled to fit container

export function ScaledSlide({ width = 400, ...slideProps }: SlideRenderProps & { width?: number }) {
  const dims = SIZES.find((s) => s.id === slideProps.size) ?? SIZES[0];
  const scale = width / dims.w;
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white"
      style={{ width: `${width}px`, height: `${width * (dims.h / dims.w)}px` }}
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

function BrandOverlay({ settings, data, palette, font }: {
  settings: BrandKitSettings;
  data: BrandKitData;
  palette: Palette;
  font: FontFamily;
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
        <span style={{ fontFamily: fontMap[font], fontSize: "32px", fontWeight: 600, color: palette.accent }}>
          {data.instagramHandle}
        </span>
      )}
    </div>
  );
}

function SlideNumber({ show, index, total, palette, font, placement }: {
  show: boolean; index: number; total: number; palette: Palette; font: FontFamily; placement: Placement;
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
        fontSize: "36px",
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

function BaseSlide({ children, palette, font, slide, settings, data, index, total, style }: {
  children: React.ReactNode;
  palette: Palette;
  font: FontFamily;
  slide: Slide;
  settings: BrandKitSettings;
  data: BrandKitData;
  index: number;
  total: number;
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
      <BrandOverlay settings={settings} data={data} palette={palette} font={font} />
      <SlideNumber
        show={settings.enabled && settings.showSlideNumber}
        index={index}
        total={total}
        palette={palette}
        font={font}
        placement={settings.placement}
      />
    </div>
  );
}

// ============= 1. Tahrir — Editorial =============

const Tahrir = forwardRef<HTMLDivElement, SlideRenderProps>(function Tahrir(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Accent strip */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "100%", backgroundColor: palette.accent }} />
        <div style={{ padding: isCover ? "100px 80px 100px 80px" : "80px 80px 80px 80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: isCover ? "center" : "flex-start", paddingTop: isCover ? undefined : "90px" }}>
          {/* Slide number badge */}
          {!isCover && (
            <div style={{ marginBottom: "32px" }}>
              <span style={{ fontSize: "120px", fontWeight: 800, color: palette.accent, opacity: 0.15, lineHeight: 1 }}>
                {String(index).padStart(2, "0")}
              </span>
            </div>
          )}
          {isCover && (
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "28px", fontWeight: 600, color: palette.accent, letterSpacing: "2px" }}>
                كاروسيل
              </span>
            </div>
          )}
          <h1 style={{
            fontSize: isCover ? "72px" : "56px",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: isCover ? "32px" : "28px", lineHeight: 1.6, color: palette.text, opacity: 0.75, margin: 0, maxWidth: "85%" }}>
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
                fontSize: "30px",
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 100px" }}>
          {isCover && (
            <div style={{ width: "80px", height: "8px", backgroundColor: palette.accent, borderRadius: "4px", marginBottom: "48px" }} />
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: "24px", fontWeight: 600, color: palette.accent, marginBottom: "24px" }}>
              {index} / {total - 1}
            </span>
          )}
          <h1 style={{
            fontSize: isCover ? "64px" : "52px",
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
            maxWidth: "90%",
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "30px", lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
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
                fontSize: "28px",
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
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
              <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "26px", fontWeight: 600, color: palette.accent }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: palette.accent }} />
                نقطة {index}
              </span>
            </div>
          )}
          <h1 style={{
            fontSize: isCover ? "68px" : "54px",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "30px", lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "85%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ fontSize: "32px", fontWeight: 700, color: palette.accent, borderBottom: `4px solid ${palette.accent}`, paddingBottom: "8px" }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Frame border */}
        <div style={{ position: "absolute", inset: "40px", border: `3px solid ${palette.accent}`, borderRadius: "24px" }} />
        <div style={{ position: "absolute", inset: "52px", border: `1px solid ${palette.accent}`, borderRadius: "20px", opacity: 0.3 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 120px" }}>
          {isCover && (
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: palette.accent, marginBottom: "32px" }} />
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: "26px", fontWeight: 700, color: palette.accent, marginBottom: "20px", opacity: 0.8 }}>
              شريحة {index}
            </span>
          )}
          <h1 style={{
            fontSize: isCover ? "60px" : "50px",
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "28px", lineHeight: 1.7, opacity: 0.65, margin: 0, maxWidth: "85%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ display: "inline-block", padding: "14px 36px", border: `2px solid ${palette.accent}`, color: palette.accent, fontSize: "28px", fontWeight: 700, borderRadius: "12px" }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", padding: "60px 120px", maxWidth: "900px" }}>
          {isCover && (
            <span style={{ display: "block", fontSize: "24px", fontWeight: 600, color: palette.accent, marginBottom: "16px", letterSpacing: "3px", textTransform: "uppercase" }}>
              موجز
            </span>
          )}
          <h1 style={{
            fontSize: isCover ? "56px" : "44px",
            fontWeight: 700,
            lineHeight: 1.35,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "26px", lineHeight: 1.8, opacity: 0.6, margin: 0 }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "32px" }}>
              <span style={{ fontSize: "28px", fontWeight: 700, color: palette.accent }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Sidebar */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "100%", backgroundColor: palette.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
          <span style={{ fontSize: "56px", fontWeight: 800, color: "#ffffff", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {isCover ? "01" : isEnding ? String(total).padStart(2, "0") : String(index).padStart(2, "0")}
          </span>
        </div>
        <div style={{ paddingRight: "160px", paddingLeft: "80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isCover && (
            <span style={{ fontSize: "24px", fontWeight: 600, color: palette.accent, marginBottom: "16px" }}>
              محتوى أكاديمي
            </span>
          )}
          <h1 style={{
            fontSize: isCover ? "60px" : "48px",
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <div style={{ borderRight: `4px solid ${palette.accent}`, paddingRight: "24px", marginRight: "-28px" }}>
              <p style={{ fontSize: "28px", lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                {slide.body}
              </p>
            </div>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "32px" }}>
              <span style={{ display: "inline-block", padding: "14px 40px", backgroundColor: palette.accent, color: "#fff", fontSize: "28px", fontWeight: 700, borderRadius: "8px" }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Geometric shapes */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "350px", height: "350px", backgroundColor: palette.secondary, transform: "rotate(15deg)", borderRadius: "32px" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", backgroundColor: palette.accent, opacity: 0.12 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 90px" }}>
          {!isCover && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "26px", fontWeight: 700, color: palette.accent, backgroundColor: palette.secondary, padding: "8px 24px", borderRadius: "100px" }}>
                {String(index).padStart(2, "0")}
              </span>
            </div>
          )}
          {isCover && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "26px", fontWeight: 700, color: palette.accent, backgroundColor: palette.secondary, padding: "8px 24px", borderRadius: "100px" }}>جديد</span>
            </div>
          )}
          <h1 style={{
            fontSize: isCover ? "64px" : "52px",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "28px", lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "30px", fontWeight: 700, color: "#fff", backgroundColor: palette.accent, padding: "16px 40px", borderRadius: "100px" }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const isDark = palette.background !== "#FAFAF9" && palette.background !== "#F5F5F4" && palette.background !== "#FFF5F3";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "80px", backgroundColor: palette.accent }} />
        {/* Side block */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "40%", height: "100%", backgroundColor: palette.secondary, opacity: 0.5 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 90px 80px 90px" }}>
          {!isCover && !isEnding && (
            <span style={{ fontSize: "28px", fontWeight: 800, color: palette.accent, marginBottom: "20px" }}>
              {String(index).padStart(2, "0")} /
            </span>
          )}
          {isCover && (
            <span style={{ fontSize: "28px", fontWeight: 800, color: palette.accent, marginBottom: "20px" }}>
              00 /
            </span>
          )}
          <h1 style={{
            fontSize: isCover ? "60px" : "50px",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "28px", lineHeight: 1.7, opacity: 0.75, margin: 0, maxWidth: "75%" }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "36px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: palette.accent }}>
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
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
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
            <span style={{ fontSize: "26px", fontWeight: 700, color: palette.accent, marginBottom: "16px" }}>
              الشريحة {index}
            </span>
          )}
          {isCover && (
            <div style={{ width: "48px", height: "48px", backgroundColor: palette.accent, borderRadius: "12px", marginBottom: "24px" }} />
          )}
          <h1 style={{
            fontSize: isCover ? "56px" : "46px",
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            {slide.title}
          </h1>
          {slide.body && (
            <p style={{ fontSize: "26px", lineHeight: 1.7, opacity: 0.65, margin: 0 }}>
              {slide.body}
            </p>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "28px" }}>
              <span style={{ display: "inline-block", padding: "12px 36px", backgroundColor: palette.accent, color: "#fff", fontSize: "26px", fontWeight: 700, borderRadius: "12px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

// ============= 10. Unwan — Oversized Title =============

const Unwan = forwardRef<HTMLDivElement, SlideRenderProps>(function Unwan(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total}>
        {/* Bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8px", backgroundColor: palette.accent }} />
        <div style={{ padding: "80px 80px 80px 80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {!isCover && (
              <span style={{ fontSize: "28px", fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — {String(index).padStart(2, "0")}
              </span>
            )}
            {isCover && (
              <span style={{ fontSize: "28px", fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — عنوان
              </span>
            )}
          </div>
          <div>
            <h1 style={{
              fontSize: isCover ? "84px" : "68px",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: slide.body ? "24px" : 0,
              letterSpacing: "-1px",
            }}>
              {slide.title}
            </h1>
            {slide.body && (
              <p style={{ fontSize: "28px", lineHeight: 1.6, opacity: 0.6, margin: 0, maxWidth: "85%" }}>
                {slide.body}
              </p>
            )}
            {isEnding && slide.ctaText && (
              <div style={{ marginTop: "32px" }}>
                <span style={{ fontSize: "34px", fontWeight: 800, color: palette.accent }}>
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

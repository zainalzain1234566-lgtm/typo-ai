"use client";

import React, { forwardRef, useId } from "react";
import { templateLayoutProfile } from "@/lib/template-layout";
import {
  BaseSlide,
  BodyText,
  TitleText,
  PhysicianMark,
  SourceBadge,
  decorFont,
  fontMap,
  fs,
  splitBody,
  PROJECT_IMAGE_OBJECT_POSITIONS,
  type SlideRenderProps,
} from "../template-primitives";

export const Laqta = forwardRef<HTMLDivElement, SlideRenderProps>(function Laqta(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const { para, items } = splitBody(slide.body || "");
  const cardWidth = layout.isStory ? 880 : layout.isPortrait ? 860 : 820;
  const cardBottom = layout.isStory ? 300 : layout.isPortrait ? 190 : 115;
  const cardTop = layout.isStory ? 350 : layout.isPortrait ? 245 : 170;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide
        slide={slide}
        palette={palette}
        font={font}
        settings={brandKitSettings}
        data={brandKitData}
        index={index}
        total={total}
        fontSizeScale={fontSizeScale}
        style={{ backgroundColor: palette.secondary }}
      >
        {slide.imageUrl ? (
          <img
            data-project-image
            aria-hidden="true"
            alt=""
            src={slide.imageUrl}
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: PROJECT_IMAGE_OBJECT_POSITIONS[slide.imageFocalPosition ?? "center"],
            }}
          />
        ) : (
          <div
            data-laqta-placeholder
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 22% 18%, ${palette.accent}55, transparent 34%), linear-gradient(145deg, ${palette.secondary}, ${palette.background})`,
            }}
          >
            <svg viewBox="0 0 120 120" width="210" height="210" style={{ position: "absolute", top: "16%", left: "10%", color: palette.accent, opacity: 0.3 }}>
              <rect x="10" y="18" width="100" height="84" rx="18" fill="none" stroke="currentColor" strokeWidth="5" />
              <circle cx="42" cy="48" r="10" fill="currentColor" />
              <path d="M20 92 52 62l20 18 14-12 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.08), transparent 36%, rgba(0,0,0,.24))" }} />

        <div
          style={{
            position: "absolute",
            zIndex: 2,
            right: `${layout.paddingX}px`,
            width: `${cardWidth}px`,
            maxWidth: `calc(100% - ${layout.paddingX * 2}px)`,
            ...(isEnding ? { top: "50%", transform: "translateY(-50%)" } : isCover ? { bottom: `${cardBottom}px` } : index % 2 === 0 ? { top: `${cardTop}px` } : { bottom: `${cardBottom}px` }),
            borderRadius: layout.isStory ? "44px" : "36px",
            overflow: "hidden",
            backgroundColor: palette.background,
            color: palette.text,
            boxShadow: "0 28px 70px rgba(0,0,0,.24)",
            border: `2px solid ${palette.accent}2E`,
          }}
        >
          <div style={{ minHeight: layout.isStory ? "96px" : "78px", padding: `0 ${layout.isStory ? 42 : 34}px`, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${palette.accent}45`, color: palette.accent }}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: fs(22, fontSizeScale), fontWeight: 800 }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: palette.accent }} />
              ملاحظة
            </span>
            <span style={{ fontSize: fs(18, fontSizeScale), fontWeight: 700, opacity: 0.75 }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>

          <div style={{ padding: layout.isStory ? "46px 46px 52px" : "34px 38px 40px" }}>
            <div style={{ fontSize: fs(isCover ? 56 : isEnding ? 50 : 44, fontSizeScale), lineHeight: 1.16, fontWeight: 900, letterSpacing: "-0.5px" }}>
              <TitleText>{slide.title}</TitleText>
            </div>
            {para && (
              <p style={{ margin: "20px 0 0", fontSize: fs(isCover ? 27 : 25, fontSizeScale), lineHeight: 1.55, fontWeight: 500, opacity: 0.86 }}>
                <BodyText>{para}</BodyText>
              </p>
            )}
            {items.length > 0 && !isCover && (
              <ul style={{ margin: "22px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "12px" }}>
                {items.slice(0, 4).map((item, itemIndex) => (
                  <li key={itemIndex} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: fs(23, fontSizeScale), lineHeight: 1.45 }}>
                    <span style={{ marginTop: "10px", width: "9px", height: "9px", borderRadius: "50%", background: palette.accent, flexShrink: 0 }} />
                    <span><BodyText>{item}</BodyText></span>
                  </li>
                ))}
              </ul>
            )}
            {isEnding && slide.ctaText && (
              <div style={{ display: "inline-flex", marginTop: "26px", padding: "14px 24px", borderRadius: "999px", background: palette.accent, color: "#FFFFFF", fontSize: fs(23, fontSizeScale), fontWeight: 800 }}>
                {slide.ctaText}
              </div>
            )}
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

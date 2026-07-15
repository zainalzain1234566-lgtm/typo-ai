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

export const Hadith = forwardRef<HTMLDivElement, SlideRenderProps>(function Hadith(
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
          <div style={{
            fontSize: fs(isCover ? 64 : 52, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
              <BodyText>{slide.body}</BodyText>
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

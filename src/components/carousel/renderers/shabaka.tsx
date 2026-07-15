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

export const Shabaka = forwardRef<HTMLDivElement, SlideRenderProps>(function Shabaka(
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
          <div style={{
            fontSize: fs(isCover ? 56 : 46, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(26, fontSizeScale), lineHeight: 1.7, opacity: 0.65, margin: 0 }}>
              <BodyText>{slide.body}</BodyText>
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

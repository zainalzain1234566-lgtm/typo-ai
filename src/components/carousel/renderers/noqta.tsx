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

export const Noqta = forwardRef<HTMLDivElement, SlideRenderProps>(function Noqta(
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
          <div style={{
            fontSize: fs(isCover ? 68 : 54, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "85%" }}>
              <BodyText>{slide.body}</BodyText>
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

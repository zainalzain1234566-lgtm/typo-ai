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

export const Mujaz = forwardRef<HTMLDivElement, SlideRenderProps>(function Mujaz(
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
          <div style={{
            fontSize: fs(isCover ? 56 : 44, fontSizeScale),
            fontWeight: 700,
            lineHeight: 1.35,
            margin: 0,
            marginBottom: slide.body ? "20px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(26, fontSizeScale), lineHeight: 1.8, opacity: 0.6, margin: 0 }}>
              <BodyText>{slide.body}</BodyText>
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

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

export const Itar = forwardRef<HTMLDivElement, SlideRenderProps>(function Itar(
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
          <div style={{
            fontSize: fs(isCover ? 60 : 50, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.65, margin: 0, maxWidth: "85%" }}>
              <BodyText>{slide.body}</BodyText>
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

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

export const Tabayun = forwardRef<HTMLDivElement, SlideRenderProps>(function Tabayun(
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
          <div style={{
            fontSize: fs(isCover ? 60 : 50, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.75, margin: 0, maxWidth: "75%" }}>
              <BodyText>{slide.body}</BodyText>
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

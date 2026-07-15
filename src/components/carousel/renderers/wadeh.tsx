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

export const Wadeh = forwardRef<HTMLDivElement, SlideRenderProps>(function Wadeh(
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
          <div style={{
            fontSize: fs(isCover ? 64 : 52, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
            maxWidth: "90%",
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0, maxWidth: "80%" }}>
              <BodyText>{slide.body}</BodyText>
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

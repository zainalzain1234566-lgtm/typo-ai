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

export const Tahrir = forwardRef<HTMLDivElement, SlideRenderProps>(function Tahrir(
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
          <div style={{
            fontSize: fs(isCover ? 72 : 56, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: slide.body ? "28px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <p style={{ fontSize: fs(isCover ? 32 : 28, fontSizeScale), lineHeight: 1.6, color: palette.text, opacity: 0.75, margin: 0, maxWidth: "85%" }}>
              <BodyText>{slide.body}</BodyText>
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

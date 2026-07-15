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

export const Academy = forwardRef<HTMLDivElement, SlideRenderProps>(function Academy(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Sidebar */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "100%", backgroundColor: palette.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
          <span style={{ fontSize: fs(56, fontSizeScale), fontWeight: 800, color: "#ffffff", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {isCover ? "01" : isEnding ? String(total).padStart(2, "0") : String(index).padStart(2, "0")}
          </span>
        </div>
        <div style={{ paddingRight: "160px", paddingLeft: "80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isCover && (
            <span style={{ fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, marginBottom: "16px" }}>
              محتوى أكاديمي
            </span>
          )}
          <div style={{
            fontSize: fs(isCover ? 60 : 48, fontSizeScale),
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            marginBottom: slide.body ? "24px" : 0,
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          {slide.body && (
            <div style={{ borderRight: `4px solid ${palette.accent}`, paddingRight: "24px", marginRight: "-28px" }}>
              <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                <BodyText>{slide.body}</BodyText>
              </p>
            </div>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ marginTop: "32px" }}>
              <span style={{ display: "inline-block", padding: "14px 40px", backgroundColor: palette.accent, color: "#fff", fontSize: fs(28, fontSizeScale), fontWeight: 700, borderRadius: "8px" }}>
                {slide.ctaText}
              </span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

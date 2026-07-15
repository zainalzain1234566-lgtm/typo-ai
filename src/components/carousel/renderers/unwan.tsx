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

export const Unwan = forwardRef<HTMLDivElement, SlideRenderProps>(function Unwan(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8px", backgroundColor: palette.accent }} />
        <div style={{ padding: "80px 80px 80px 80px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {!isCover && (
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — {String(index).padStart(2, "0")}
              </span>
            )}
            {isCover && (
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 700, color: palette.accent, display: "block", marginBottom: "16px" }}>
                — عنوان
              </span>
            )}
          </div>
          <div>
            <div style={{
              fontSize: fs(isCover ? 84 : 68, fontSizeScale),
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: slide.body ? "24px" : 0,
              letterSpacing: "-1px",
            }}>
              <TitleText>{slide.title}</TitleText>
            </div>
            {slide.body && (
              <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.6, opacity: 0.6, margin: 0, maxWidth: "85%" }}>
                <BodyText>{slide.body}</BodyText>
              </p>
            )}
            {isEnding && slide.ctaText && (
              <div style={{ marginTop: "32px" }}>
                <span style={{ fontSize: fs(34, fontSizeScale), fontWeight: 800, color: palette.accent }}>
                  {slide.ctaText} →
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", backgroundColor: i === index ? palette.accent : palette.secondary }} />
            ))}
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

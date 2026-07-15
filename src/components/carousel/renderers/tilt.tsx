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

export const Tilt = forwardRef<HTMLDivElement, SlideRenderProps>(function Tilt(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const rotation = -4 * layout.rotationScale;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{ background: `linear-gradient(135deg, ${palette.background}, ${palette.secondary})` }}
      >
        <div style={{
          position: "absolute", inset: "-60px",
          background: `${palette.accent}12`, border: `1px solid ${palette.accent}30`,
          transform: `rotate(${rotation}deg)`, zIndex: 1,
        }} />
        <div style={{
          position: "relative", zIndex: 3, height: "100%",
          display: "flex", flexDirection: "column", gap: fs(20, fontSizeScale),
          transform: `rotate(${rotation}deg)`, padding: `${layout.paddingY}px ${layout.paddingX}px`,
          justifyContent: "center", maxWidth: `${layout.contentMaxWidth}px`,
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 16px", borderRadius: "20px", alignSelf: "flex-start",
              background: `${palette.accent}12`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <div style={{ fontSize: fs(isCover ? 60 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{ fontSize: fs(44, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.72, margin: 0, maxWidth: `${layout.contentMaxWidth}px` }}><BodyText>{slide.body}</BodyText></p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.72, margin: 0, maxWidth: `${layout.contentMaxWidth}px` }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "30px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, top: "12px", width: "11px", height: "11px", borderRadius: "50%", background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary})` }} />
                      <BodyText>{item}</BodyText>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: `${palette.background}cc`, border: `1px solid ${palette.accent}30`, borderRadius: "16px", padding: "18px 24px", direction: "ltr", textAlign: "left", backdropFilter: "blur(8px)" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

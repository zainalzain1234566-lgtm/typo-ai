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

export const Rotated = forwardRef<HTMLDivElement, SlideRenderProps>(function Rotated(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", insetInlineStart: "-40px", top: layout.isStory ? "430px" : "300px",
          width: "8px", height: layout.isStory ? "680px" : "420px", background: palette.accent,
          transform: `rotate(${-10 * layout.rotationScale}deg)`, opacity: 0.5, zIndex: 0,
        }} />
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
          gap: fs(20, fontSizeScale), transform: `translateX(${Math.round(40 * layout.rotationScale)}px)`,
          padding: `${layout.paddingY}px ${layout.paddingX}px`, maxWidth: `${layout.contentMaxWidth}px`,
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px", color: "#fff",
              background: palette.accent, padding: "6px 16px", borderRadius: "4px",
              transform: "rotate(-3deg)", alignSelf: "flex-start",
              boxShadow: `6px 6px 0 ${palette.accent}40`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "5px", color: palette.accent, fontFamily: decorFont.grotesk }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <div style={{ fontSize: fs(isCover ? 62 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.12, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{
              fontSize: fs(44, fontSizeScale), fontWeight: 700, color: palette.accent,
              lineHeight: 1.2, margin: 0, transform: `rotate(${-1.5 * layout.rotationScale}deg)`, transformOrigin: "right",
            }}>
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
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(14, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "30px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, color: palette.accent }}>▸</span>
                      <BodyText>{item}</BodyText>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `2px solid ${palette.text}`, borderRadius: "4px", padding: "18px 24px", direction: "ltr", textAlign: "left", boxShadow: `8px 8px 0 ${palette.accent}` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

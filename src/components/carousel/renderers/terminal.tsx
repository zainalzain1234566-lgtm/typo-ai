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

export const Terminal = forwardRef<HTMLDivElement, SlideRenderProps>(function Terminal(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const mono = decorFont.mono;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(18, fontSizeScale),
          padding: "56px 64px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(12, fontSizeScale), letterSpacing: "2px",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "5px 14px", borderRadius: "4px", alignSelf: "flex-start", fontFamily: mono,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(14, fontSizeScale), letterSpacing: "3px", color: palette.accent, fontFamily: mono }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <div style={{ fontSize: fs(isCover ? 54 : 48, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{ fontSize: fs(38, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "880px", fontFamily: mono }}><BodyText>{slide.body}</BodyText></p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "880px", fontFamily: mono }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(12, fontSizeScale), padding: 0, margin: 0, fontFamily: mono }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(21, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "26px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, color: palette.accent }}>$</span>
                      <BodyText>{item}</BodyText>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.accent}40`, borderInlineStart: `4px solid ${palette.accent}`, borderRadius: "8px", padding: "24px 28px", direction: "ltr", textAlign: "left", fontFamily: mono, boxShadow: "0 14px 30px rgba(0,0,0,.4)" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(24, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

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

export const Magazine = forwardRef<HTMLDivElement, SlideRenderProps>(function Magazine(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}
        style={{ border: `2px dashed ${palette.text}40` }}
      >
        <div style={{
          position: "absolute", insetInlineEnd: "20px", top: layout.isStory ? "180px" : "90px",
          fontWeight: 900, fontSize: fs(300 * layout.decorScale, fontSizeScale), color: palette.accent, opacity: 0.14,
          lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(18, fontSizeScale),
          maxWidth: `${layout.contentMaxWidth}px`, padding: `${layout.paddingY}px ${layout.paddingX}px`,
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: palette.background, background: palette.accent,
              padding: "6px 16px", alignSelf: "flex-start",
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
            <div style={{ fontSize: fs(isCover ? 58 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{ fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.9, color: palette.text, opacity: 0.72, margin: 0, columnCount: layout.magazineColumns, columnGap: "34px", textAlign: "start" }}>
              <BodyText>{slide.body}</BodyText>
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(21, fontSizeScale), lineHeight: 1.9, color: palette.text, opacity: 0.72, margin: 0, columnCount: layout.magazineColumns, columnGap: "34px", textAlign: "start" }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(22, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "26px", position: "relative" }}>
                      <span style={{ position: "absolute", insetInlineStart: 0, top: "6px", color: palette.accent, fontSize: fs(12, fontSizeScale) }}>■</span>
                      <BodyText>{item}</BodyText>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.text}40`, borderRadius: "4px", padding: "16px 22px", direction: "ltr", textAlign: "left" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(19, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

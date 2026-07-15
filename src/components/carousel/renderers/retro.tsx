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

export const Retro = forwardRef<HTMLDivElement, SlideRenderProps>(function Retro(
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
        style={{
          background: `repeating-linear-gradient(45deg, ${palette.secondary}30 0 22px, transparent 22px 44px), ${palette.background}`,
        }}
      >
        <div style={{
          position: "absolute", insetInlineStart: "40px", top: layout.isStory ? "180px" : "60px",
          fontFamily: decorFont.grotesk, fontWeight: 700, fontSize: fs(200 * layout.decorScale, fontSizeScale),
          color: palette.accent, WebkitTextStroke: `3px ${palette.text}`,
          lineHeight: 1, zIndex: 0,
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: layout.isStory ? "center" : "flex-end",
          gap: fs(18, fontSizeScale), padding: `${layout.paddingY}px ${layout.paddingX}px`,
          maxWidth: `${layout.contentMaxWidth}px`,
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(14, fontSizeScale), fontWeight: 700, letterSpacing: "1px",
              color: "#fff", background: palette.accent, padding: "8px 18px",
              alignSelf: "flex-start", boxShadow: `5px 5px 0 ${palette.secondary}`,
            }}>
              {isCover ? "دليل المبتدئين" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(15, fontSizeScale), letterSpacing: "4px", color: palette.accent, fontWeight: 700 }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <div style={{
              fontSize: fs(isCover ? 58 : 48, fontSizeScale), fontWeight: 900, lineHeight: 1.15,
              background: palette.text, color: palette.background, display: "inline-block",
              padding: "14px 26px", alignSelf: "flex-start", margin: 0,
              boxShadow: `8px 8px 0 ${palette.accent}`,
            }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{
              fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent,
              background: palette.background, display: "inline-block", padding: "10px 20px",
              alignSelf: "flex-start", margin: 0, border: `3px solid ${palette.text}`,
              boxShadow: `6px 6px 0 ${palette.secondary}`,
            }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{
              fontSize: fs(23, fontSizeScale), lineHeight: 1.8, color: palette.text,
              background: `${palette.background}d8`, padding: "14px 20px",
              alignSelf: "flex-start", maxWidth: `${layout.contentMaxWidth}px`, border: `2px solid ${palette.text}`,
            }}>
              <BodyText>{slide.body}</BodyText>
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{
                fontSize: fs(23, fontSizeScale), lineHeight: 1.8, color: palette.text,
                background: `${palette.background}d8`, padding: "14px 20px",
                alignSelf: "flex-start", maxWidth: `${layout.contentMaxWidth}px`, border: `2px solid ${palette.text}`,
              }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(12, fontSizeScale), padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{
                      fontSize: fs(23, fontSizeScale), color: palette.text,
                      background: `${palette.background}d8`, padding: "12px 18px",
                      border: `2px solid ${palette.text}`, borderInlineStart: `8px solid ${palette.accent}`,
                    }}>
                      <BodyText>{item}</BodyText>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `3px solid ${palette.text}`, padding: "16px 22px", direction: "ltr", textAlign: "left", boxShadow: `6px 6px 0 ${palette.accent}` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

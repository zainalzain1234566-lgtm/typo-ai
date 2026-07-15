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

export const Cards = forwardRef<HTMLDivElement, SlideRenderProps>(function Cards(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(22, fontSizeScale),
          padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
              color: "#fff", background: palette.accent,
              padding: "6px 18px", borderRadius: "20px", alignSelf: "flex-start",
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
            <div style={{ fontSize: fs(42, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}><BodyText>{slide.body}</BodyText></p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0 }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: fs(16, fontSizeScale) }}>
                  {items.map((item, i) => (
                    <div key={i} style={{
                      fontSize: fs(22, fontSizeScale), color: palette.text, opacity: 0.7,
                      background: palette.background, border: `1px solid ${palette.accent}30`,
                      borderRadius: "16px", padding: "18px 22px",
                      boxShadow: `0 8px 18px ${palette.accent}1a`,
                    }}>
                      <BodyText>{item}</BodyText>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.background, border: `1px solid ${palette.accent}30`, borderRadius: "16px", padding: "18px 24px", direction: "ltr", textAlign: "left", boxShadow: `0 10px 24px ${palette.accent}1a` }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

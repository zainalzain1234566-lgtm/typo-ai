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

export const Split = forwardRef<HTMLDivElement, SlideRenderProps>(function Split(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{ height: "100%", display: "flex", flexDirection: "row-reverse" }}>
          <div style={{ flex: 1, padding: "60px 70px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: fs(20, fontSizeScale) }}>
              {(isCover || isEnding) && (
                <span style={{
                  fontSize: fs(13, fontSizeScale), letterSpacing: "2px",
                  color: palette.accent, border: `1px solid ${palette.accent}`,
                  padding: "6px 16px", borderRadius: "20px", alignSelf: "flex-start",
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
                <div style={{ fontSize: fs(isCover ? 56 : 50, fontSizeScale), fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
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
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(13, fontSizeScale), padding: 0, margin: 0 }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ fontSize: fs(23, fontSizeScale), color: palette.text, opacity: 0.6, paddingInlineStart: "28px", position: "relative" }}>
                          <span style={{ position: "absolute", insetInlineStart: 0, top: "11px", width: "10px", height: "10px", background: palette.accent, borderRadius: "50%" }} />
                          <BodyText>{item}</BodyText>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              {isEnding && slide.ctaText && (
                <div style={{ background: palette.secondary, border: `1px solid ${palette.accent}40`, borderRadius: "10px", padding: "18px 24px", direction: "ltr", textAlign: "left" }}>
                  <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
                  <span style={{ fontSize: fs(20, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: "0 0 36%", backgroundColor: palette.accent, color: palette.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", position: "relative" }}>
            <div style={{ fontFamily: decorFont.grotesk, fontWeight: 700, fontSize: fs(200, fontSizeScale), lineHeight: 0.9 }}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{
              fontFamily: decorFont.grotesk, fontSize: fs(20, fontSizeScale), letterSpacing: "4px",
              textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)", opacity: 0.8,
            }}>
              {isCover ? "START" : isEnding ? "END" : "SLIDE"}
            </div>
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

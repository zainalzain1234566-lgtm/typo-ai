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

export const Hero = forwardRef<HTMLDivElement, SlideRenderProps>(function Hero(
  { slide, palette, font, brandKitSettings, brandKitData, index, total, fontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontFamily: decorFont.grotesk, fontWeight: 200, fontSize: fs(420, fontSizeScale),
          color: "transparent", WebkitTextStroke: `1px ${palette.text}`, opacity: 0.06,
          lineHeight: 1, zIndex: 0, pointerEvents: "none",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", gap: fs(22, fontSizeScale), padding: "60px 70px",
        }}>
          {(isCover || isEnding) && (
            <span style={{
              fontSize: fs(13, fontSizeScale), letterSpacing: "3px", textTransform: "uppercase",
              color: palette.accent, border: `1px solid ${palette.accent}`,
              padding: "6px 18px", borderRadius: "30px",
            }}>
              {isCover ? "كاروسيل" : "شكرًا للقراءة"}
            </span>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(16, fontSizeScale), letterSpacing: "6px", color: palette.accent, textTransform: "uppercase" }}>
              {`// ${String(index + 1).padStart(2, "0")}`}
            </span>
          )}
          {isCover || isEnding ? (
            <div style={{
              fontSize: fs(isCover ? 66 : 54, fontSizeScale), fontWeight: 900, lineHeight: 1.15, margin: 0,
            }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          ) : (
            <div style={{
              fontSize: fs(46, fontSizeScale), fontWeight: 700, color: palette.accent, lineHeight: 1.2, margin: 0,
            }}>
              <TitleText>{slide.title}</TitleText>
            </div>
          )}
          {(isCover || isEnding) && slide.body && (
            <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}>
              <BodyText>{slide.body}</BodyText>
            </p>
          )}
          {!isCover && !isEnding && slide.body && (
            <>
              {para && <p style={{ fontSize: fs(24, fontSizeScale), lineHeight: 1.8, color: palette.text, opacity: 0.6, margin: 0, maxWidth: "760px" }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: fs(14, fontSizeScale), padding: 0, margin: 0, alignItems: "center" }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: fs(24, fontSizeScale), color: palette.text, opacity: 0.6, textAlign: "center" }}><BodyText>{item}</BodyText></li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isEnding && slide.ctaText && (
            <div style={{ background: palette.secondary, border: `1px solid ${palette.text}20`, borderRadius: "14px", padding: "20px 26px", direction: "ltr", textAlign: "left", maxWidth: "760px", width: "100%" }}>
              <span style={{ color: palette.accent, fontWeight: 700 }}>→ </span>
              <span style={{ fontSize: fs(21, fontSizeScale), color: palette.text }}>{slide.ctaText}</span>
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

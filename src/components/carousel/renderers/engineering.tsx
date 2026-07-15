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

export const Engineering = forwardRef<HTMLDivElement, SlideRenderProps>(function Engineering(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const schematicSize = Math.round(170 * layout.decorScale);
  const axisSize = schematicSize + 46;
  const contentBottom = layout.isStory ? 260 : layout.isPortrait ? 110 : 45;
  const grid = `linear-gradient(${palette.accent}18 1px, transparent 1px), linear-gradient(90deg, ${palette.accent}18 1px, transparent 1px)`;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide
        slide={slide}
        palette={palette}
        font={font}
        settings={brandKitSettings}
        data={brandKitData}
        index={index}
        total={total}
        fontSizeScale={fontSizeScale}
        style={{ backgroundImage: grid, backgroundSize: layout.isStory ? "44px 44px" : "36px 36px" }}
      >
        <div dir="rtl" style={{ position: "relative", zIndex: 2, height: "100%", padding: `${layout.paddingY}px ${layout.paddingX}px`, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 700, letterSpacing: "2px" }}>
            <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <span>ENGINEERING</span>
          </div>

          <div aria-hidden style={{ position: "absolute", top: layout.isStory ? "230px" : layout.isPortrait ? "175px" : "145px", left: `${layout.paddingX}px`, width: `${schematicSize}px`, height: `${schematicSize}px`, border: `2px dashed ${palette.accent}`, borderRadius: "50%", opacity: 0.65 }}>
            <span style={{ position: "absolute", top: "50%", left: "-24px", width: `${axisSize}px`, height: "1px", background: palette.accent }} />
            <span style={{ position: "absolute", top: "-24px", left: "50%", width: "1px", height: `${axisSize}px`, background: palette.accent }} />
            <span style={{ position: "absolute", inset: `${Math.round(38 * layout.decorScale)}px`, border: `1px solid ${palette.accent}`, transform: "rotate(45deg)" }} />
          </div>

          {isCover && (
            <div style={{ marginTop: "auto", marginBottom: `${contentBottom}px`, maxWidth: `${layout.contentMaxWidth}px` }}>
              <div style={{ width: "86px", height: "4px", background: palette.accent, marginBottom: "24px" }} />
              <div style={{ margin: 0, fontSize: fs(68, fontSizeScale), lineHeight: 1.25, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
              {slide.body && <p style={{ margin: "22px 0 0", maxWidth: `${layout.contentMaxWidth - 100}px`, fontSize: fs(30, fontSizeScale), lineHeight: 1.7, opacity: 0.8 }}><BodyText>{slide.body}</BodyText></p>}
            </div>
          )}

          {!isCover && !isEnding && (
            <div style={{ marginTop: "auto", marginBottom: `${contentBottom}px`, maxWidth: `${layout.contentMaxWidth}px` }}>
              <span style={{ display: "inline-block", marginBottom: "18px", color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 700 }}>DETAIL_{String(index + 1).padStart(2, "0")}</span>
              <div style={{ margin: 0, fontSize: fs(50, fontSizeScale), lineHeight: 1.3, fontWeight: 850 }}><TitleText>{slide.title}</TitleText></div>
              {para && <p style={{ margin: "22px 0 0", fontSize: fs(29, fontSizeScale), lineHeight: 1.65, opacity: 0.82 }}><BodyText>{para}</BodyText></p>}
              {items.length > 0 && (
                <ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0, display: "grid", gap: "14px" }}>
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ display: "flex", gap: "14px", alignItems: "flex-start", fontSize: fs(27, fontSizeScale), lineHeight: 1.5 }}>
                      <span style={{ color: palette.accent, fontWeight: 900, flexShrink: 0 }}>0{itemIndex + 1}</span>
                      <span><BodyText>{item}</BodyText></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isEnding && (
            <div style={{ margin: "auto 0", maxWidth: `${layout.contentMaxWidth}px` }}>
              <span style={{ color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 700, letterSpacing: "2px" }}>END_OF_DRAWING</span>
              <div style={{ margin: "20px 0 0", fontSize: fs(58, fontSizeScale), lineHeight: 1.3, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
              {slide.body && <p style={{ margin: "20px 0 0", fontSize: fs(29, fontSizeScale), lineHeight: 1.65, opacity: 0.75 }}><BodyText>{slide.body}</BodyText></p>}
              {slide.ctaText && (
                <div style={{ display: "inline-block", marginTop: "32px", padding: "16px 28px", border: `2px solid ${palette.accent}`, background: palette.secondary, color: palette.text, fontSize: fs(26, fontSizeScale), fontWeight: 800 }}>
                  {slide.ctaText} ←
                </div>
              )}
            </div>
          )}

          <div aria-hidden style={{ display: "flex", alignItems: "center", gap: "10px", color: palette.accent, fontSize: fs(14, fontSizeScale), opacity: 0.8 }}>
            <span style={{ width: "70px", height: "1px", background: palette.accent }} />
            <span>SCALE 1:100</span>
            <span style={{ flex: 1, height: "1px", background: palette.accent }} />
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

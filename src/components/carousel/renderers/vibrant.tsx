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

export const Vibrant = forwardRef<HTMLDivElement, SlideRenderProps>(function Vibrant(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const { para, items } = splitBody(slide.body || "");
  const canvasHeight = layout.isStory ? 1920 : layout.isPortrait ? 1350 : 1080;
  const openingOnRight = index % 2 === 1;
  const opening = isCover
    ? { width: layout.isStory ? 500 : 470, height: layout.isStory ? 720 : layout.isPortrait ? 540 : 450, y: canvasHeight - (layout.isStory ? 840 : layout.isPortrait ? 620 : 510) }
    : isEnding
      ? { width: layout.isStory ? 650 : 580, height: layout.isStory ? 520 : layout.isPortrait ? 400 : 340, y: layout.isStory ? 135 : 70 }
      : { width: 440, height: layout.isStory ? 1120 : layout.isPortrait ? 790 : 680, y: layout.isStory ? 360 : layout.isPortrait ? 265 : 200 };
  const openingX = openingOnRight ? 1080 - opening.width - 54 : 54;
  const x = openingX;
  const y = opening.y;
  const w = opening.width;
  const h = opening.height;
  const organicOpening = isCover
    ? [
        `M ${x + w * 0.16} ${y}`,
        `C ${x + w * 0.54} ${y - h * 0.04} ${x + w * 0.94} ${y + h * 0.08} ${x + w} ${y + h * 0.35}`,
        `C ${x + w * 1.04} ${y + h * 0.67} ${x + w * 0.77} ${y + h} ${x + w * 0.43} ${y + h}`,
        `C ${x + w * 0.08} ${y + h * 1.01} ${x - w * 0.05} ${y + h * 0.72} ${x} ${y + h * 0.42}`,
        `C ${x + w * 0.03} ${y + h * 0.18} ${x + w * 0.02} ${y + h * 0.05} ${x + w * 0.16} ${y} Z`,
      ].join(" ")
    : isEnding
      ? [
          `M ${x + w * 0.12} ${y + h * 0.2}`,
          `C ${x + w * 0.3} ${y - h * 0.08} ${x + w * 0.72} ${y - h * 0.05} ${x + w * 0.92} ${y + h * 0.18}`,
          `C ${x + w * 1.08} ${y + h * 0.4} ${x + w * 0.91} ${y + h * 0.85} ${x + w * 0.6} ${y + h * 0.95}`,
          `C ${x + w * 0.28} ${y + h * 1.06} ${x - w * 0.03} ${y + h * 0.78} ${x} ${y + h * 0.49}`,
          `C ${x + w * 0.02} ${y + h * 0.34} ${x + w * 0.04} ${y + h * 0.27} ${x + w * 0.12} ${y + h * 0.2} Z`,
        ].join(" ")
      : [
          `M ${x + w * 0.28} ${y}`,
          `C ${x + w * 0.7} ${y - h * 0.02} ${x + w} ${y + h * 0.14} ${x + w * 0.96} ${y + h * 0.4}`,
          `C ${x + w * 0.91} ${y + h * 0.68} ${x + w * 1.07} ${y + h * 0.87} ${x + w * 0.72} ${y + h}`,
          `C ${x + w * 0.43} ${y + h * 1.08} ${x + w * 0.08} ${y + h * 0.92} ${x} ${y + h * 0.64}`,
          `C ${x - w * 0.07} ${y + h * 0.39} ${x + w * 0.04} ${y + h * 0.05} ${x + w * 0.28} ${y} Z`,
        ].join(" ");
  const outerAndOpening = `M 0 0 H 1080 V ${canvasHeight} H 0 Z ${organicOpening}`;
  const textBounds = layout.isStory
    ? { coverTitle: 5, coverBody: 7, contentTitle: 4, paragraph: 7, itemLines: 3, itemLimit: 8, endingTitle: 4, endingBody: 6, contentHeight: 1050 }
    : layout.isPortrait
      ? { coverTitle: 4, coverBody: 5, contentTitle: 3, paragraph: 5, itemLines: 2, itemLimit: 6, endingTitle: 3, endingBody: 4, contentHeight: 760 }
      : { coverTitle: 3, coverBody: 4, contentTitle: 3, paragraph: 4, itemLines: 2, itemLimit: 5, endingTitle: 3, endingBody: 3, contentHeight: 620 };
  const titleLength = Array.from(slide.title).length;
  const bodyDensity = Array.from(para).length + Array.from(items.join("")).length + items.length * 24;
  const titleScale = titleLength > 120 ? 0.5 : titleLength > 88 ? 0.62 : titleLength > 60 ? 0.75 : titleLength > 42 ? 0.88 : 1;
  const bodyScale = bodyDensity > 900 ? 0.56 : bodyDensity > 650 ? 0.66 : bodyDensity > 430 ? 0.76 : bodyDensity > 260 ? 0.88 : 1;
  const visibleItems = items.slice(0, textBounds.itemLimit);
  const hiddenItems = items.length - visibleItems.length;
  const lineClamp = (lines: number): React.CSSProperties => ({
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
    overflow: "hidden",
    textOverflow: "ellipsis",
  });
  const textSide: React.CSSProperties = openingOnRight
    ? { left: `${layout.paddingX}px` }
    : { right: `${layout.paddingX}px` };
  const accentX = openingOnRight ? 84 : 818;
  const accentY = isEnding ? Math.round(canvasHeight * 0.42) : layout.isStory ? 190 : 105;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale} style={{ backgroundColor: palette.secondary }}>
        {slide.imageUrl ? (
          <img
            data-project-image
            aria-hidden="true"
            alt=""
            src={slide.imageUrl}
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: PROJECT_IMAGE_OBJECT_POSITIONS[slide.imageFocalPosition ?? "center"] }}
          />
        ) : (
          <div
            data-vibrant-placeholder
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${openingOnRight ? "78%" : "22%"} 30%, ${palette.accent}CC, transparent 34%), linear-gradient(145deg, ${palette.secondary}, ${palette.text}32)` }}
          />
        )}

        <svg data-vibrant-overlay aria-hidden="true" viewBox={`0 0 1080 ${canvasHeight}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, zIndex: 1, width: "100%", height: "100%", pointerEvents: "none" }}>
          <path d={outerAndOpening} fill={palette.background} fillRule="evenodd" clipRule="evenodd" />
          <path data-vibrant-squiggle d={`M ${accentX} ${accentY} C ${accentX + 38} ${accentY - 28}, ${accentX + 72} ${accentY + 28}, ${accentX + 110} ${accentY} S ${accentX + 180} ${accentY - 26}, ${accentX + 218} ${accentY + 2}`} fill="none" stroke={palette.accent} strokeWidth="9" strokeLinecap="round" opacity="0.72" />
          <g data-vibrant-hatch stroke={palette.accent} strokeWidth="5" strokeLinecap="round" opacity="0.48">
            {[0, 18, 36, 54].map((offset) => (
              <line key={offset} x1={accentX + offset} y1={accentY + 54} x2={accentX + offset + 28} y2={accentY + 84} />
            ))}
          </g>
        </svg>

        {isCover && (
          <div dir="rtl" style={{ position: "absolute", zIndex: 2, top: layout.isStory ? "280px" : layout.isPortrait ? "185px" : "145px", width: layout.isStory ? "600px" : "570px", maxWidth: `calc(100% - ${layout.paddingX * 2}px)`, minWidth: 0, textAlign: "right", ...textSide }}>
            <span style={{ display: "inline-block", marginBottom: "22px", padding: "9px 18px", border: `2px solid ${palette.accent}`, borderRadius: "999px", color: palette.accent, fontSize: fs(17, fontSizeScale), fontWeight: 850 }}>حكاية بصرية</span>
            <div style={{ ...lineClamp(textBounds.coverTitle), fontSize: fs(68 * titleScale, fontSizeScale), lineHeight: 1.14, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
            {slide.body && <p style={{ ...lineClamp(textBounds.coverBody), margin: "24px 0 0", fontSize: fs(27, fontSizeScale * bodyScale), lineHeight: 1.62, opacity: 0.84 }}><BodyText>{slide.body}</BodyText></p>}
          </div>
        )}

        {!isCover && !isEnding && (
          <div dir="rtl" style={{ position: "absolute", zIndex: 2, top: layout.isStory ? "390px" : layout.isPortrait ? "265px" : "205px", width: layout.isStory ? "560px" : "530px", maxWidth: `calc(100% - ${layout.paddingX * 2}px)`, maxHeight: `${textBounds.contentHeight}px`, overflow: "hidden", minWidth: 0, textAlign: "right", ...textSide }}>
            <span style={{ color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 850 }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <div style={{ ...lineClamp(textBounds.contentTitle), marginTop: "18px", fontSize: fs(50 * titleScale, fontSizeScale), lineHeight: 1.2, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
            {para && <p style={{ ...lineClamp(textBounds.paragraph), margin: "22px 0 0", fontSize: fs(25, fontSizeScale * bodyScale), lineHeight: 1.62, opacity: 0.86 }}><BodyText>{para}</BodyText></p>}
            {visibleItems.length > 0 && (
              <ul style={{ margin: "24px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "13px" }}>
                {visibleItems.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0, fontSize: fs(23, fontSizeScale * bodyScale), lineHeight: 1.5 }}>
                    <span aria-hidden style={{ width: "11px", height: "11px", marginTop: "12px", borderRadius: "50%", background: palette.accent, flexShrink: 0 }} />
                    <span style={{ ...lineClamp(textBounds.itemLines), minWidth: 0 }}><BodyText>{item}</BodyText></span>
                  </li>
                ))}
              </ul>
            )}
            {hiddenItems > 0 && <span aria-hidden style={{ display: "inline-block", marginTop: "14px", color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 800 }}>+{hiddenItems}</span>}
          </div>
        )}

        {isEnding && (
          <div dir="rtl" style={{ position: "absolute", zIndex: 2, top: layout.isStory ? "790px" : layout.isPortrait ? "555px" : "455px", left: `${layout.paddingX}px`, right: `${layout.paddingX}px`, textAlign: "center", minWidth: 0 }}>
            <div style={{ ...lineClamp(textBounds.endingTitle), margin: "0 auto", maxWidth: `${layout.contentMaxWidth}px`, fontSize: fs(58 * titleScale, fontSizeScale), lineHeight: 1.18, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
            {slide.body && <p style={{ ...lineClamp(textBounds.endingBody), margin: "24px auto 0", maxWidth: `${layout.contentMaxWidth - 100}px`, fontSize: fs(26, fontSizeScale * bodyScale), lineHeight: 1.62, opacity: 0.84 }}><BodyText>{slide.body}</BodyText></p>}
            {slide.ctaText && <div style={{ display: "inline-flex", maxWidth: "100%", boxSizing: "border-box", marginTop: "30px", padding: "16px 30px", borderRadius: "999px", background: palette.accent, color: palette.background, fontSize: fs(24, fontSizeScale), fontWeight: 900, whiteSpace: "normal" }}>{slide.ctaText}<span aria-hidden style={{ marginInlineStart: "10px" }}>←</span></div>}
          </div>
        )}
      </BaseSlide>
    </div>
  );
});

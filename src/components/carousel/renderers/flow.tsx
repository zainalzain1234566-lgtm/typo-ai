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

export const Flow = forwardRef<HTMLDivElement, SlideRenderProps>(function Flow(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const { para, items } = splitBody(slide.body || "");
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const gradientId = `flow-ribbon-${useId().replace(/:/g, "")}`;
  const ribbon = layout.isStory
    ? { height: 1920, top: 610, bottom: 940 }
    : layout.isPortrait
      ? { height: 1350, top: 410, bottom: 690 }
      : { height: 1080, top: 325, bottom: 565 };
  const wave = [
    { t1: -82, t2: 46, tm: 70, t3: -54, t4: 30, b1: 66, b2: -30, bm: -58, b3: 52, b4: -44 },
    { t1: 50, t2: -70, tm: -42, t3: 62, t4: -36, b1: -54, b2: 42, bm: 68, b3: -36, b4: 52 },
    { t1: -32, t2: -66, tm: 54, t3: 76, t4: -50, b1: 46, b2: 70, bm: -42, b3: -68, b4: 36 },
    { t1: 72, t2: 20, tm: -64, t3: -34, t4: 58, b1: -62, b2: -18, bm: 54, b3: 40, b4: -48 },
  ][index % 4];
  const ribbonPath = [
    `M 0 ${ribbon.top}`,
    `C 180 ${ribbon.top + wave.t1} 360 ${ribbon.top + wave.t2} 540 ${ribbon.top + wave.tm}`,
    `C 720 ${ribbon.top + wave.t3} 900 ${ribbon.top + wave.t4} 1080 ${ribbon.top}`,
    `L 1080 ${ribbon.bottom}`,
    `C 900 ${ribbon.bottom + wave.b1} 720 ${ribbon.bottom + wave.b2} 540 ${ribbon.bottom + wave.bm}`,
    `C 360 ${ribbon.bottom + wave.b3} 180 ${ribbon.bottom + wave.b4} 0 ${ribbon.bottom}`,
    "Z",
  ].join(" ");
  const textBounds = layout.isStory
    ? { coverTitleLines: 5, contentTitleLines: 4, endingTitleLines: 4, coverBodyLines: 7, paragraphLines: 6, endingBodyLines: 6, itemLines: 3, itemLimit: 8, regionHeight: 800, fadeDensity: 850 }
    : layout.isPortrait
      ? { coverTitleLines: 4, contentTitleLines: 3, endingTitleLines: 3, coverBodyLines: 5, paragraphLines: 4, endingBodyLines: 4, itemLines: 2, itemLimit: 6, regionHeight: 570, fadeDensity: 620 }
      : { coverTitleLines: 3, contentTitleLines: 3, endingTitleLines: 3, coverBodyLines: 4, paragraphLines: 3, endingBodyLines: 3, itemLines: 2, itemLimit: 4, regionHeight: 430, fadeDensity: 480 };
  const titleLength = Array.from(slide.title).length;
  const bodyDensity = Array.from(para).length + Array.from(items.join("")).length + items.length * 28;
  const normalizedBodyDensity = bodyDensity / (layout.isStory ? 1.35 : layout.isPortrait ? 1.15 : 1);
  const bodyScale = normalizedBodyDensity > 1100 ? 0.46 : normalizedBodyDensity > 800 ? 0.52 : normalizedBodyDensity > 600 ? 0.6 : normalizedBodyDensity > 430 ? 0.7 : normalizedBodyDensity > 280 ? 0.82 : 1;
  const titleScale = titleLength > 150 ? 0.46 : titleLength > 115 ? 0.55 : titleLength > 85 ? 0.65 : titleLength > 60 ? 0.76 : titleLength > 42 ? 0.88 : 1;
  const visibleItems = items.slice(0, textBounds.itemLimit);
  const hiddenItemCount = items.length - visibleItems.length;
  const showRegionFade = bodyDensity > textBounds.fadeDensity || hiddenItemCount > 0;
  const lineClamp = (lines: number): React.CSSProperties => ({
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
    overflow: "hidden",
    textOverflow: "ellipsis",
  });
  const cardStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: layout.isStory ? "42px 46px" : "32px 36px",
    border: `2px solid ${palette.accent}38`,
    borderRadius: layout.isStory ? "42px" : "32px",
    backgroundColor: palette.background,
    boxShadow: "0 24px 70px rgba(0,0,0,.16)",
  };

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale} style={{ backgroundColor: palette.secondary }}>
        <svg data-flow-ribbon aria-hidden="true" viewBox={`0 0 1080 ${ribbon.height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="15%" x2="100%" y2="85%">
              <stop offset="0%" stopColor={palette.accent} />
              <stop offset="52%" stopColor={palette.background} />
              <stop offset="100%" stopColor={palette.accent} />
            </linearGradient>
          </defs>
          <path d={ribbonPath} fill={`url(#${gradientId})`} opacity="0.92" />
        </svg>

        <div dir="rtl" style={{ position: "relative", zIndex: 2, height: "100%", boxSizing: "border-box", padding: `${layout.paddingY}px ${layout.paddingX}px`, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: palette.accent, fontSize: fs(17, fontSizeScale), fontWeight: 800 }}>
            <span>مسار</span>
            <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>

          {isCover && (
            <div style={{ margin: "auto 0", maxWidth: `${layout.contentMaxWidth}px`, minWidth: 0 }}>
              <div style={{ ...lineClamp(textBounds.coverTitleLines), fontSize: fs(70 * titleScale, fontSizeScale), lineHeight: 1.15, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
              {slide.body && (
                <div style={{ ...cardStyle, marginTop: "30px", maxWidth: `${layout.contentMaxWidth - 80}px` }}>
                  <p style={{ ...lineClamp(textBounds.coverBodyLines), margin: 0, fontSize: fs(27, fontSizeScale * bodyScale), lineHeight: 1.65 }}><BodyText>{slide.body}</BodyText></p>
                </div>
              )}
            </div>
          )}

          {!isCover && !isEnding && (
            <div style={{ margin: "auto 0", maxWidth: `${layout.contentMaxWidth}px`, minWidth: 0 }}>
              <div style={{ ...lineClamp(textBounds.contentTitleLines), fontSize: fs(52 * titleScale, fontSizeScale), lineHeight: 1.2, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
              {slide.body && (
                <div style={{ ...cardStyle, marginTop: "26px", position: "relative" }}>
                  <div style={{ maxHeight: `${textBounds.regionHeight}px`, overflow: "hidden", paddingBottom: showRegionFade ? "34px" : 0 }}>
                    {para && <p style={{ ...lineClamp(textBounds.paragraphLines), margin: 0, fontSize: fs(26, fontSizeScale * bodyScale), lineHeight: 1.6 }}><BodyText>{para}</BodyText></p>}
                    {visibleItems.length > 0 && (
                    <ul style={{ listStyle: "none", margin: para ? "20px 0 0" : 0, padding: 0, display: "grid", gridTemplateColumns: visibleItems.length > 4 && !layout.isStory ? "1fr 1fr" : "1fr", gap: visibleItems.length > 6 ? "9px 22px" : "14px 22px" }}>
                      {visibleItems.map((item, itemIndex) => (
                        <li key={itemIndex} style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0, fontSize: fs(23, fontSizeScale * bodyScale), lineHeight: 1.5 }}>
                          <span aria-hidden style={{ color: palette.accent, fontWeight: 900, flexShrink: 0 }}>●</span>
                          <span style={{ ...lineClamp(textBounds.itemLines), minWidth: 0 }}><BodyText>{item}</BodyText></span>
                        </li>
                      ))}
                    </ul>
                    )}
                  </div>
                  {showRegionFade && (
                    <div aria-hidden style={{ position: "absolute", insetInline: 0, bottom: 0, height: "58px", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "4px", background: `linear-gradient(180deg, transparent, ${palette.background} 72%)`, color: palette.accent, fontSize: fs(22, fontSizeScale), fontWeight: 900 }}>
                      {hiddenItemCount > 0 ? `… +${hiddenItemCount}` : "…"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isEnding && (
            <div style={{ margin: "auto", width: "100%", maxWidth: `${layout.contentMaxWidth}px`, minWidth: 0, textAlign: "center" }}>
              <div style={{ ...lineClamp(textBounds.endingTitleLines), fontSize: fs(60 * titleScale, fontSizeScale), lineHeight: 1.2, fontWeight: 900 }}><TitleText>{slide.title}</TitleText></div>
              {slide.body && <p style={{ ...lineClamp(textBounds.endingBodyLines), margin: "24px auto 0", maxWidth: `${layout.contentMaxWidth - 100}px`, fontSize: fs(27, fontSizeScale * bodyScale), lineHeight: 1.65 }}><BodyText>{slide.body}</BodyText></p>}
              {slide.ctaText && (
                <div style={{ display: "inline-flex", maxWidth: "100%", boxSizing: "border-box", marginTop: "32px", padding: "16px 32px", borderRadius: "999px", backgroundColor: palette.accent, color: "#FFFFFF", fontSize: fs(25, fontSizeScale), fontWeight: 850, whiteSpace: "normal" }}>
                  {slide.ctaText} <span aria-hidden style={{ marginInlineStart: "10px" }}>←</span>
                </div>
              )}
            </div>
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

"use client";

import React, { forwardRef } from "react";
import { templateLayoutProfile } from "@/lib/template-layout";
import {
  BaseSlide,
  BodyText,
  PROJECT_IMAGE_OBJECT_POSITIONS,
  TitleText,
  fs,
  splitBody,
  type SlideRenderProps,
} from "../template-primitives";

export const Pulse = forwardRef<HTMLDivElement, SlideRenderProps>(function Pulse(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 },
  ref,
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const canvasHeight = layout.isStory ? 1920 : layout.isPortrait ? 1350 : 1080;
  const { para, items } = splitBody(slide.body || "");
  const openingOnRight = !isCover && !isEnding && index % 2 === 1;
  const opening = isCover
    ? { x: 58, y: layout.isStory ? 1010 : layout.isPortrait ? 690 : 560, width: 650, height: layout.isStory ? 740 : layout.isPortrait ? 560 : 440, radius: 110 }
    : isEnding
      ? { x: 210, y: layout.isStory ? 170 : layout.isPortrait ? 120 : 80, width: 660, height: layout.isStory ? 520 : layout.isPortrait ? 410 : 340, radius: 150 }
      : {
          x: openingOnRight ? 595 : 55,
          y: layout.isStory ? 380 : layout.isPortrait ? 285 : 235,
          width: 430,
          height: layout.isStory ? 1050 : layout.isPortrait ? 720 : 610,
          radius: 92,
        };
  const { x, y, width, height, radius } = opening;
  const imageOpening = [
    `M ${x + radius} ${y}`,
    `H ${x + width - radius}`,
    `Q ${x + width} ${y} ${x + width} ${y + radius}`,
    `V ${y + height - radius}`,
    `Q ${x + width} ${y + height} ${x + width - radius} ${y + height}`,
    `H ${x + radius}`,
    `Q ${x} ${y + height} ${x} ${y + height - radius}`,
    `V ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y} Z`,
  ].join(" ");
  const maskPath = `M 0 0 H 1080 V ${canvasHeight} H 0 Z ${imageOpening}`;
  const titleLength = Array.from(slide.title).length;
  const titleScale = titleLength > 95 ? 0.62 : titleLength > 68 ? 0.75 : titleLength > 44 ? 0.88 : 1;
  const visibleItems = items.slice(0, layout.isStory ? 7 : 5);
  const isComparisonLayout = !isCover && !isEnding && visibleItems.length >= 2 && index % 3 === 0;
  const textSide: React.CSSProperties = openingOnRight
    ? { left: `${layout.paddingX}px` }
    : { right: `${layout.paddingX}px` };

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
        style={{ backgroundColor: palette.background }}
      >
        {slide.imageUrl ? (
          <img
            data-project-image
            aria-hidden="true"
            alt=""
            src={slide.imageUrl}
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: PROJECT_IMAGE_OBJECT_POSITIONS[slide.imageFocalPosition ?? "center"],
            }}
          />
        ) : (
          <div
            data-pulse-placeholder
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at ${openingOnRight ? "76%" : "24%"} 38%, ${palette.accent}AA, transparent 30%), linear-gradient(150deg, ${palette.secondary}, ${palette.background})`,
            }}
          />
        )}

        <svg
          data-pulse-image-frame
          aria-hidden="true"
          viewBox={`0 0 1080 ${canvasHeight}`}
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, zIndex: 1, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <path d={maskPath} fill={palette.background} fillRule="evenodd" clipRule="evenodd" />
          <path d={imageOpening} fill="none" stroke={palette.accent} strokeWidth="8" opacity="0.82" />
        </svg>

        <div
          data-pulse-grid
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            opacity: 0.22,
            backgroundImage: `radial-gradient(${palette.accent} 2px, transparent 2px)`,
            backgroundSize: "34px 34px",
            pointerEvents: "none",
          }}
        />

        <div aria-hidden="true" style={{ position: "absolute", zIndex: 2, top: layout.isStory ? "94px" : "64px", right: `${layout.paddingX}px`, display: "flex", alignItems: "center", gap: "12px", color: palette.accent, fontSize: fs(18, fontSizeScale), fontWeight: 900 }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: palette.accent }} />
          نبض بصري
        </div>

        {isCover && (
          <div style={{ position: "absolute", zIndex: 3, top: layout.isStory ? "260px" : layout.isPortrait ? "180px" : "145px", right: `${layout.paddingX}px`, width: layout.isStory ? "850px" : "820px", maxWidth: `calc(100% - ${layout.paddingX * 2}px)` }}>
            <div style={{ color: palette.accent, fontSize: fs(20, fontSizeScale), fontWeight: 900, letterSpacing: "1px" }}>01 — البداية</div>
            <div style={{ marginTop: "26px", maxWidth: "850px", fontSize: fs(72 * titleScale, fontSizeScale), lineHeight: 1.12, fontWeight: 950 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
            {para && (
              <p style={{ margin: "28px 0 0", maxWidth: "780px", fontSize: fs(29, fontSizeScale), lineHeight: 1.62, opacity: 0.84 }}>
                <BodyText>{para}</BodyText>
              </p>
            )}
          </div>
        )}

        {!isCover && !isEnding && (
          <div style={{ position: "absolute", zIndex: 3, top: layout.isStory ? "410px" : layout.isPortrait ? "310px" : "260px", width: layout.isStory ? "520px" : "500px", maxHeight: layout.isStory ? "1050px" : layout.isPortrait ? "720px" : "600px", overflow: "hidden", ...textSide }}>
            <span style={{ color: palette.accent, fontSize: fs(19, fontSizeScale), fontWeight: 900 }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <div style={{ marginTop: "20px", fontSize: fs(53 * titleScale, fontSizeScale), lineHeight: 1.18, fontWeight: 950 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
            {para && (
              <p style={{ margin: "24px 0 0", fontSize: fs(25, fontSizeScale), lineHeight: 1.6, opacity: 0.84 }}>
                <BodyText>{para}</BodyText>
              </p>
            )}
            {isComparisonLayout ? (
              <div data-pulse-comparison style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                {visibleItems.slice(0, 2).map((item, itemIndex) => (
                  <div key={itemIndex} style={{ minHeight: "150px", padding: "18px", borderRadius: "22px", background: `${palette.secondary}E6`, border: `1px solid ${palette.accent}66`, fontSize: fs(20, fontSizeScale), lineHeight: 1.45 }}>
                    <span aria-hidden="true" style={{ display: "block", marginBottom: "12px", color: palette.accent, fontWeight: 950 }}>{String(itemIndex + 1).padStart(2, "0")}</span>
                    <BodyText>{item}</BodyText>
                  </div>
                ))}
              </div>
            ) : visibleItems.length > 0 ? (
              <ul style={{ margin: "28px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "14px" }}>
                {visibleItems.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ padding: "15px 18px", borderRadius: "18px", background: `${palette.secondary}E6`, border: `1px solid ${palette.accent}55`, fontSize: fs(22, fontSizeScale), lineHeight: 1.45 }}>
                    <BodyText>{item}</BodyText>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {isEnding && (
          <div style={{ position: "absolute", zIndex: 3, top: layout.isStory ? "850px" : layout.isPortrait ? "620px" : "500px", left: `${layout.paddingX}px`, right: `${layout.paddingX}px`, textAlign: "center" }}>
            <div style={{ margin: "0 auto", maxWidth: "850px", fontSize: fs(64 * titleScale, fontSizeScale), lineHeight: 1.14, fontWeight: 950 }}>
              <TitleText>{slide.title}</TitleText>
            </div>
            {para && (
              <p style={{ margin: "28px auto 0", maxWidth: "760px", fontSize: fs(27, fontSizeScale), lineHeight: 1.62, opacity: 0.84 }}>
                <BodyText>{para}</BodyText>
              </p>
            )}
            {slide.ctaText && (
              <div style={{ display: "inline-flex", marginTop: "32px", padding: "16px 30px", borderRadius: "18px", background: palette.accent, color: palette.background, fontSize: fs(24, fontSizeScale), fontWeight: 950 }}>
                {slide.ctaText}
              </div>
            )}
          </div>
        )}
      </BaseSlide>
    </div>
  );
});

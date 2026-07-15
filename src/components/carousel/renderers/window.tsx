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

export const Window = forwardRef<HTMLDivElement, SlideRenderProps>(function Window(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale: baseFontSizeScale = 1 },
  ref,
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const layout = templateLayoutProfile(size);
  const fontSizeScale = baseFontSizeScale * layout.typeScale;
  const { para, items } = splitBody(slide.body || "");
  const titleLength = Array.from(slide.title).length;
  const titleScale = titleLength > 100 ? 0.64 : titleLength > 70 ? 0.76 : titleLength > 45 ? 0.88 : 1;
  const panelWidth = layout.isStory ? 870 : layout.isPortrait ? 850 : 820;
  const panelTop = layout.isStory ? 300 : layout.isPortrait ? 215 : 150;
  const panelSide = index % 2 === 0 ? { right: `${layout.paddingX}px` } : { left: `${layout.paddingX}px` };
  const panelPosition: React.CSSProperties = isCover
    ? { top: `${panelTop}px`, left: "50%", transform: "translateX(-50%)" }
    : isEnding
      ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
      : { top: `${panelTop + (index % 2 === 0 ? 70 : 210)}px`, ...panelSide };
  const visibleItems = items.slice(0, layout.isStory ? 6 : 4);

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
        style={{ backgroundColor: palette.secondary }}
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
            data-window-placeholder
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 20% 18%, ${palette.accent}66, transparent 30%), radial-gradient(circle at 80% 78%, ${palette.secondary}, transparent 40%), linear-gradient(145deg, ${palette.background}, ${palette.secondary})`,
            }}
          />
        )}

        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.16), rgba(0,0,0,.05) 42%, rgba(0,0,0,.28))" }} />

        <div
          data-window-panel
          style={{
            position: "absolute",
            zIndex: 2,
            width: `${panelWidth}px`,
            maxWidth: `calc(100% - ${layout.paddingX * 2}px)`,
            maxHeight: `calc(100% - ${layout.paddingY * 2}px)`,
            overflow: "hidden",
            borderRadius: layout.isStory ? "44px" : "34px",
            color: palette.text,
            background: `linear-gradient(160deg, ${palette.background}F4, ${palette.background}E8)`,
            border: `2px solid ${palette.accent}55`,
            boxShadow: "0 36px 90px rgba(0,0,0,.42)",
            ...panelPosition,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              height: layout.isStory ? "104px" : "82px",
              padding: `0 ${layout.isStory ? 42 : 32}px`,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: `${palette.secondary}F5`,
              borderBottom: `1px solid ${palette.accent}55`,
            }}
          >
            {[0.55, 0.78, 1].map((opacity) => (
              <span key={opacity} style={{ width: "20px", height: "20px", borderRadius: "50%", background: palette.accent, opacity }} />
            ))}
          </div>

          <div style={{ padding: layout.isStory ? "70px 62px 76px" : "52px 52px 58px" }}>
            <div
              style={{
                fontSize: fs((isCover ? 68 : isEnding ? 60 : 52) * titleScale, fontSizeScale),
                lineHeight: 1.16,
                fontWeight: 900,
              }}
            >
              <TitleText>{slide.title}</TitleText>
            </div>

            {para && (
              <p style={{ margin: "28px 0 0", fontSize: fs(isCover ? 30 : 27, fontSizeScale), lineHeight: 1.62, opacity: 0.88 }}>
                <BodyText>{para}</BodyText>
              </p>
            )}

            {visibleItems.length > 0 && !isCover && (
              <ul style={{ margin: "28px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "15px" }}>
                {visibleItems.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ display: "flex", alignItems: "flex-start", gap: "14px", fontSize: fs(25, fontSizeScale), lineHeight: 1.5 }}>
                    <span aria-hidden="true" style={{ marginTop: "12px", width: "10px", height: "10px", borderRadius: "50%", background: palette.accent, flexShrink: 0 }} />
                    <BodyText>{item}</BodyText>
                  </li>
                ))}
              </ul>
            )}

            {isEnding && slide.ctaText && (
              <div style={{ display: "inline-flex", marginTop: "32px", padding: "15px 28px", borderRadius: "999px", background: palette.accent, color: palette.background, fontSize: fs(24, fontSizeScale), fontWeight: 900 }}>
                {slide.ctaText}
              </div>
            )}
          </div>

          <div aria-hidden="true" style={{ height: layout.isStory ? "86px" : "68px", padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${palette.accent}44`, color: palette.accent, fontSize: fs(24, fontSizeScale), fontWeight: 800 }}>
            <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <span style={{ fontSize: fs(38, fontSizeScale) }}>←</span>
          </div>
        </div>
      </BaseSlide>
    </div>
  );
});

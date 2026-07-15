"use client";

import React, { forwardRef, useId } from "react";
import { templateLayoutProfile } from "@/lib/template-layout";
import { shouldShowMedicalDisclaimer } from "@/lib/content-mode";
import {
  BaseSlide,
  BodyText,
  DisclaimerFooter,
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

export const Raqmi = forwardRef<HTMLDivElement, SlideRenderProps>(function Raqmi(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const isStat = !isEnding && /^\d+%?/.test(slide.title);
  const statNumber = isStat ? slide.title.match(/^\d+%?/)?.[0] : null;
  const statLabel = isStat ? slide.title.replace(/^\d+%?/, "").trim() : null;
  const gradient = `linear-gradient(180deg, ${palette.background} 0%, ${palette.secondary} 100%)`;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale} style={{ background: gradient }}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "20px" }}>
          {medical?.specialty && (
            <div style={{ position: "absolute", top: "72px", right: "72px" }}>
              <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {!isEnding && isStat && statNumber && (
            <>
              <span style={{
                fontSize: fs(180, fontSizeScale),
                fontWeight: 900,
                lineHeight: 1,
                color: palette.accent,
                fontFamily: decorFont.grotesk,
              }}>
                {statNumber}
              </span>
              {statLabel && (
                <span style={{
                  display: "inline-block",
                  padding: "10px 28px",
                  borderRadius: "100px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(30, fontSizeScale),
                  fontWeight: 700,
                }}>
                  <TitleText>{statLabel}</TitleText>
                </span>
              )}
              {slide.body && (
                <p style={{ fontSize: fs(28, fontSizeScale), lineHeight: 1.6, opacity: 0.75, margin: 0, maxWidth: "80%" }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </>
          )}
          {!isEnding && !isStat && (
            <>
              <div style={{
                fontSize: fs(isCover ? 68 : 56, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.25,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "90%",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              {slide.body && (
                <p style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.6, opacity: 0.75, margin: 0, maxWidth: "85%" }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </>
          )}
          {!isEnding && medical?.source && (
            <div style={{ marginTop: "8px" }}>
              <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "18px 48px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(32, fontSizeScale),
                  fontWeight: 700,
                  borderRadius: "100px",
                }}>
                  {slide.ctaText}
                </span>
              )}
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {shouldShowMedicalDisclaimer(!!medical?.isMedical, brandKitSettings.showDisclaimer) && !isCover && (
            <DisclaimerFooter variant="inline" text={brandKitData.disclaimerText || ""} palette={palette} font={font} fontSizeScale={fontSizeScale} />
          )}
        </div>
      </BaseSlide>
    </div>
  );
});

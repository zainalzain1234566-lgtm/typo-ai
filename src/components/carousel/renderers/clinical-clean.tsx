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

export const ClinicalClean = forwardRef<HTMLDivElement, SlideRenderProps>(function ClinicalClean(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const padding = "80px 72px";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding, height: "100%", display: "flex", flexDirection: "column", justifyContent: isCover ? "center" : "flex-start", paddingTop: isCover ? undefined : "80px", gap: "24px" }}>
          {isCover && medical?.specialty && (
            <div style={{ position: "absolute", top: "72px", right: "72px" }}>
              <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {!isCover && !isEnding && (
            <span style={{ fontSize: fs(24, fontSizeScale), fontWeight: 600, color: palette.accent, letterSpacing: "1px", alignSelf: "flex-start" }}>
              {String(index).padStart(2, "0")} — شريحة
            </span>
          )}
          <div style={{
            fontSize: fs(isCover ? 68 : 52, fontSizeScale),
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
            fontFamily: fontMap.ibm,
            textAlign: "right",
            maxWidth: "90%",
          }}>
            <TitleText>{slide.title}</TitleText>
          </div>
          <div style={{ width: fs(80, fontSizeScale), height: "4px", backgroundColor: palette.accent, borderRadius: "2px" }} />
          {slide.body && (
            <p style={{
              fontSize: fs(34, fontSizeScale),
              lineHeight: 1.7,
              color: palette.text,
              opacity: 0.8,
              margin: 0,
              maxWidth: "88%",
              fontWeight: 400,
            }}>
              <BodyText>{slide.body}</BodyText>
            </p>
          )}
          {!isCover && medical?.source && (
            <div style={{ marginTop: "8px" }}>
              <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", marginTop: "40px" }}>
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "16px 40px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(30, fontSizeScale),
                  fontWeight: 700,
                  borderRadius: "100px",
                }}>
                  {slide.ctaText}
                </span>
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

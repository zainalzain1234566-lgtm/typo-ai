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

export const BoldStatement = forwardRef<HTMLDivElement, SlideRenderProps>(function BoldStatement(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";

  const isStat = !isCover && !isEnding && /^\d+/.test(slide.title);
  const statNumber = isStat ? slide.title.match(/^\d+/)?.[0] : null;
  const statLabel = isStat ? slide.title.replace(/^\d+/, "").trim() : null;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>
          {isCover && (
            <>
              {medical?.specialty && (
                <div style={{ position: "absolute", top: "72px", left: "72px" }}>
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
              <div style={{
                fontSize: fs(84, fontSizeScale),
                fontWeight: 900,
                lineHeight: 1.15,
                margin: 0,
                fontFamily: fontMap.ibm,
                textAlign: "right",
                maxWidth: "95%",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              {slide.body && (
                <p style={{
                  fontSize: fs(32, fontSizeScale),
                  lineHeight: 1.4,
                  opacity: 0.7,
                  margin: 0,
                  maxWidth: "70%",
                }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </>
          )}
          {!isCover && !isEnding && (
            <>
              {isStat && statNumber && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{
                    fontSize: fs(140, fontSizeScale),
                    fontWeight: 900,
                    lineHeight: 1,
                    color: palette.accent,
                    fontFamily: fontMap.ibm,
                  }}>
                    {statNumber}
                  </span>
                  {statLabel && (
                    <span style={{
                      fontSize: fs(44, fontSizeScale),
                      fontWeight: 700,
                      lineHeight: 1.2,
                      fontFamily: fontMap.ibm,
                      maxWidth: "90%",
                    }}>
                      <TitleText>{statLabel}</TitleText>
                    </span>
                  )}
                </div>
              )}
              {!isStat && (
                <div style={{
                  fontSize: fs(72, fontSizeScale),
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: fontMap.ibm,
                  textAlign: "right",
                  maxWidth: "95%",
                }}>
                  <TitleText>{slide.title}</TitleText>
                </div>
              )}
              {slide.body && (
                <p style={{
                  fontSize: fs(32, fontSizeScale),
                  lineHeight: 1.4,
                  opacity: 0.7,
                  margin: 0,
                  maxWidth: "75%",
                }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
              {medical?.source && (
                <div style={{ marginTop: "8px" }}>
                  <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "28px" }}>
              {slide.ctaText && (
                <div style={{
                  display: "inline-block",
                  padding: "24px 56px",
                  backgroundColor: palette.accent,
                  color: "#FFFFFF",
                  fontSize: fs(40, fontSizeScale),
                  fontWeight: 900,
                  borderRadius: "0",
                  fontFamily: fontMap.ibm,
                }}>
                  {slide.ctaText}
                </div>
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

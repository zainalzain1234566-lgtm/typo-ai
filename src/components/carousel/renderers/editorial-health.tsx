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

export const EditorialHealth = forwardRef<HTMLDivElement, SlideRenderProps>(function EditorialHealth(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const paragraphs = slide.body ? slide.body.split("\n").filter((l) => l.trim()) : [];
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 100px", height: "100%", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px", marginRight: "auto", marginLeft: "auto" }}>
          {isCover && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", justifyContent: "center", height: "100%" }}>
              {medical?.specialty && (
                <div style={{ alignSelf: "flex-start" }}>
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
              <span style={{
                fontSize: fs(24, fontSizeScale),
                fontWeight: 600,
                color: palette.accent,
                letterSpacing: "2px",
              }}>
                {String(index).padStart(2, "0")} — مقال صحي
              </span>
              <div style={{
                fontSize: fs(62, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "90%",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              <div style={{ width: fs(60, fontSizeScale), height: "3px", backgroundColor: palette.accent, borderRadius: "2px" }} />
              {slide.body && (
                <p style={{
                  fontSize: fs(34, fontSizeScale),
                  lineHeight: 1.75,
                  color: palette.text,
                  opacity: 0.75,
                  margin: 0,
                  maxWidth: "80%",
                }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </div>
          )}
          {!isCover && !isEnding && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", justifyContent: "flex-start", paddingTop: "40px" }}>
              <span style={{
                fontSize: fs(24, fontSizeScale),
                fontWeight: 600,
                color: palette.accent,
                letterSpacing: "2px",
              }}>
                {String(index).padStart(2, "0")}
              </span>
              <div style={{
                fontSize: fs(52, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "95%",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              <div style={{ width: fs(40, fontSizeScale), height: "2px", backgroundColor: palette.accent, opacity: 0.5, borderRadius: "1px" }} />
              {paragraphs.map((para, i) => (
                <p key={i} style={{
                  fontSize: fs(34, fontSizeScale),
                  lineHeight: 1.75,
                  color: palette.text,
                  opacity: 0.8,
                  margin: 0,
                  maxWidth: "85%",
                }}>
                  <BodyText>{para}</BodyText>
                </p>
              ))}
              {medical?.source && (
                <div style={{ marginTop: "8px" }}>
                  <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
            </div>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "28px" }}>
              <div style={{ width: fs(40, fontSizeScale), height: "3px", backgroundColor: palette.accent, borderRadius: "2px" }} />
              {slide.ctaText && (
                <span style={{
                  fontSize: fs(42, fontSizeScale),
                  fontWeight: 700,
                  color: palette.accent,
                  fontFamily: fontMap.ibm,
                  textAlign: "center",
                }}>
                  {slide.ctaText}
                </span>
              )}
              <div style={{
                fontSize: fs(28, fontSizeScale),
                fontWeight: 600,
                color: palette.text,
                opacity: 0.6,
                fontFamily: fontMap[font],
              }}>
                {brandKitData.instagramHandle}
              </div>
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

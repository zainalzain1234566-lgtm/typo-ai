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

export const Tahdheer = forwardRef<HTMLDivElement, SlideRenderProps>(function Tahdheer(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const warnItems = !isCover && !isEnding && slide.body ? slide.body.split("\n").filter((l) => l.trim()) : [];
  const isList = warnItems.length > 1;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "14px", backgroundColor: palette.accent }} />
        <div dir="rtl" style={{ padding: "80px 96px 80px 72px", height: "100%", display: "flex", flexDirection: "column", justifyContent: isCover ? "center" : "flex-start", gap: "24px" }}>
          {!isEnding && (
            <div style={{
              width: fs(64, fontSizeScale),
              height: fs(64, fontSizeScale),
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              backgroundColor: palette.accent,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "6px",
              flexShrink: 0,
            }}>
              <span style={{ color: palette.background, fontWeight: 900, fontSize: fs(28, fontSizeScale), fontFamily: fontMap.ibm }}>!</span>
            </div>
          )}
          {isCover && medical?.specialty && (
            <div style={{ position: "absolute", top: "72px", left: "72px" }}>
              <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
            </div>
          )}
          {isCover && (
            <>
              <div style={{ fontSize: fs(76, fontSizeScale), fontWeight: 900, lineHeight: 1.2, margin: 0, fontFamily: fontMap.ibm, textAlign: "right", maxWidth: "92%" }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              {slide.body && (
                <p style={{ fontSize: fs(32, fontSizeScale), lineHeight: 1.5, opacity: 0.75, margin: 0, maxWidth: "85%" }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </>
          )}
          {!isCover && !isEnding && (
            <>
              <div style={{ fontSize: fs(48, fontSizeScale), fontWeight: 800, margin: 0, lineHeight: 1.25, textAlign: "right", fontFamily: fontMap.ibm }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              {isList ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                  {warnItems.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", fontSize: fs(30, fontSizeScale), lineHeight: 1.5 }}>
                      <span style={{ color: palette.accent, fontWeight: 900, flexShrink: 0, marginTop: "4px" }}>▲</span>
                      <span><BodyText>{item}</BodyText></span>
                    </li>
                  ))}
                </ul>
              ) : (
                slide.body && (
                  <p style={{ fontSize: fs(32, fontSizeScale), lineHeight: 1.6, opacity: 0.85, margin: 0 }}>
                    <BodyText>{slide.body}</BodyText>
                  </p>
                )
              )}
              {medical?.source && (
                <div style={{ marginTop: "8px" }}>
                  <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                </div>
              )}
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px" }}>
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "18px 48px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(32, fontSizeScale),
                  fontWeight: 800,
                  borderRadius: "12px",
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

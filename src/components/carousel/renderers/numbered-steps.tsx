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

export const NumberedSteps = forwardRef<HTMLDivElement, SlideRenderProps>(function NumberedSteps(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  const stepItems = !isCover && !isEnding && slide.body ? slide.body.split("\n").filter((l) => l.trim()) : [];
  const isList = stepItems.length > 1;
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          {isCover && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 28px",
                  borderRadius: "100px",
                  backgroundColor: palette.secondary,
                  fontSize: fs(26, fontSizeScale),
                  fontWeight: 700,
                  color: palette.accent,
                  fontFamily: fontMap.cairo,
                }}>
                  {total - 2} خطوات
                </span>
                {medical?.specialty && (
                  <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                )}
              </div>
              <div style={{
                fontSize: fs(72, fontSizeScale),
                fontWeight: 900,
                lineHeight: 1.2,
                margin: 0,
                fontFamily: fontMap.cairo,
                textAlign: "right",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              {slide.body && (
                <p style={{ fontSize: fs(34, fontSizeScale), lineHeight: 1.6, opacity: 0.7, margin: 0, maxWidth: "85%" }}>
                  <BodyText>{slide.body}</BodyText>
                </p>
              )}
            </>
          )}
          {!isCover && !isEnding && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
                <span style={{
                  fontSize: fs(isList ? 100 : 140, fontSizeScale),
                  fontWeight: 900,
                  color: palette.secondary,
                  lineHeight: 1,
                  fontFamily: fontMap.cairo,
                  flexShrink: 0,
                  minWidth: fs(isList ? 100 : 140, fontSizeScale),
                  textAlign: "center",
                }}>
                  {index}
                </span>
                <div style={{ flex: 1, paddingTop: fs(20, fontSizeScale) }}>
                  {isList ? (
                    <>
                      <div style={{ fontSize: fs(40, fontSizeScale), fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3 }}>
                        <TitleText>{slide.title}</TitleText>
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        {stepItems.map((item, i) => (
                          <li key={i} style={{ fontSize: fs(30, fontSizeScale), lineHeight: 1.5, display: "flex", gap: "12px", alignItems: "baseline" }}>
                            <span style={{ color: palette.accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span><BodyText>{item}</BodyText></span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: fs(48, fontSizeScale), fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3 }}>
                        <TitleText>{slide.title}</TitleText>
                      </div>
                      <p style={{ fontSize: fs(32, fontSizeScale), lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
                        <BodyText>{slide.body}</BodyText>
                      </p>
                    </>
                  )}
                  {medical?.source && (
                    <div style={{ marginTop: "16px" }}>
                      <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
                {Array.from({ length: Math.max(total - 2, 1) }, (_, i) => (
                  <span key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", backgroundColor: i === index - 1 ? palette.accent : palette.secondary }} />
                ))}
              </div>
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
                  fontWeight: 700,
                  borderRadius: "16px",
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

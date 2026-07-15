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

export const MythFact = forwardRef<HTMLDivElement, SlideRenderProps>(function MythFact(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";

  const mythColor = palette.accent;
  const factColor = palette.secondary;

  const bodyLines = slide.body ? slide.body.split("\n").map((l) => l.trim()).filter(Boolean) : [];
  const mythText = bodyLines.find((l) => l.startsWith("خرافة:") || l.startsWith("خرافة："))?.replace(/^خرافة[:：]\s*/, "");
  const factText = bodyLines.find((l) => l.startsWith("حقيقة:") || l.startsWith("حقيقة："))?.replace(/^حقيقة[:：]\s*/, "");
  const isSplit = mythText && factText;
  const regularBody = !isSplit ? slide.body : null;

  const MythBadge = () => (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 24px",
      borderRadius: "100px",
      backgroundColor: mythColor + "20",
      fontFamily: fontMap.cairo,
      fontSize: fs(30, fontSizeScale),
      fontWeight: 800,
      color: mythColor,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: mythColor, color: "#fff", fontSize: fs(20, fontSizeScale), fontWeight: 900 }}>✕</span>
      خرافة
    </div>
  );

  const FactBadge = () => (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 24px",
      borderRadius: "100px",
      backgroundColor: factColor + "20",
      fontFamily: fontMap.cairo,
      fontSize: fs(30, fontSizeScale),
      fontWeight: 800,
      color: factColor,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: factColor, color: "#fff", fontSize: fs(20, fontSizeScale), fontWeight: 900 }}>✓</span>
      حقيقة
    </div>
  );

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
          {isCover && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "32px", textAlign: "center" }}>
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                backgroundColor: mythColor + "18", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: fs(56, fontSizeScale), color: mythColor, fontWeight: 900,
              }}>
                ✕
              </div>
              <div style={{
                fontSize: fs(64, fontSizeScale),
                fontWeight: 800,
                lineHeight: 1.25,
                margin: 0,
                fontFamily: fontMap.ibm,
                maxWidth: "85%",
              }}>
                <TitleText>{slide.title}</TitleText>
              </div>
              <span style={{ fontSize: fs(28, fontSizeScale), fontWeight: 600, color: factColor }}>
                الحقيقة بالداخل ↓
              </span>
              {medical?.specialty && (
                <PhysicianMark specialty={medical.specialty} palette={palette} font={font} fontSizeScale={fontSizeScale} />
              )}
            </div>
          )}
          {!isCover && !isEnding && (
            <>
              {isSplit ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px", height: "100%", justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <MythBadge />
                    <p style={{
                      fontSize: fs(40, fontSizeScale),
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0,
                      color: palette.text,
                      opacity: 0.5,
                      textDecoration: "line-through",
                      fontFamily: fontMap.ibm,
                    }}>
                      <BodyText>{mythText}</BodyText>
                    </p>
                  </div>
                  <div style={{ height: "2px", backgroundColor: palette.text, opacity: 0.1 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <FactBadge />
                    <p style={{
                      fontSize: fs(40, fontSizeScale),
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0,
                      color: palette.text,
                      fontFamily: fontMap.ibm,
                    }}>
                      <BodyText>{factText}</BodyText>
                    </p>
                    {medical?.source && (
                      <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", justifyContent: "center" }}>
                  {slide.title.includes("خرافة") || slide.title.includes("خرافه") ? <MythBadge /> : slide.title.includes("حقيقة") || slide.title.includes("حقيقه") ? <FactBadge /> : null}
                  <div style={{
                    fontSize: fs(48, fontSizeScale),
                    fontWeight: 600,
                    lineHeight: 1.4,
                    margin: 0,
                    fontFamily: fontMap.ibm,
                  }}>
                    <TitleText>{slide.title}</TitleText>
                  </div>
                  {regularBody && (
                    <p style={{ fontSize: fs(34, fontSizeScale), lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
                      <BodyText>{regularBody}</BodyText>
                    </p>
                  )}
                  {medical?.source && (
                    <SourceBadge source={medical.source} palette={palette} font={font} fontSizeScale={fontSizeScale} />
                  )}
                </div>
              )}
            </>
          )}
          {isEnding && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: factColor + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs(44, fontSizeScale), color: factColor, fontWeight: 900 }}>✓</div>
              {slide.ctaText && (
                <span style={{
                  display: "inline-block",
                  padding: "18px 48px",
                  backgroundColor: palette.accent,
                  color: "#ffffff",
                  fontSize: fs(30, fontSizeScale),
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

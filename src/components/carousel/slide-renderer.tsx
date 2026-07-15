"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { SIZES, getTemplate } from "@/lib/templates";
import { shouldShowMedicalDisclaimer } from "@/lib/content-mode";
import { RENDERER_REGISTRY } from "./renderers/registry";
import { DisclaimerFooter, fontMap, type SlideRenderProps } from "./template-primitives";

export type { SlideRenderProps } from "./template-primitives";
export { DisclaimerFooter } from "./template-primitives";

export const SlideRenderer = forwardRef<HTMLDivElement, SlideRenderProps>(function SlideRenderer(
  props, ref
) {
  const componentKey = getTemplate(props.templateId).component;
  const Renderer = RENDERER_REGISTRY[componentKey] ?? RENDERER_REGISTRY.tahrir;
  const bodyFont = props.bodyFont ?? props.font;
  const bodyScale = props.bodyFontSizeScale ?? props.fontSizeScale ?? 1;
  const titleScale = props.titleFontSizeScale ?? props.fontSizeScale ?? 1;
  const typographyStyle = {
    width: "100%",
    height: "100%",
    "--slide-title-font": fontMap[props.titleFont ?? props.font],
    "--slide-body-font": fontMap[bodyFont],
    "--slide-title-size": `${(titleScale / bodyScale) * 100}%`,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      data-slide-root
      data-title-align={props.titleTextAlign === "auto" ? undefined : props.titleTextAlign}
      data-body-align={props.bodyTextAlign === "auto" ? undefined : props.bodyTextAlign}
      style={typographyStyle}
    >
      <Renderer {...props} font={bodyFont} fontSizeScale={bodyScale} />
    </div>
  );
});

export function ScaledSlide({ width = 400, ...slideProps }: SlideRenderProps & { width?: number }) {
  const dims = SIZES.find((s) => s.id === slideProps.size) ?? SIZES[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(width);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setMeasuredWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = measuredWidth / dims.w;

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`معاينة شريحة: ${slideProps.slide.title}`}
      className="relative overflow-hidden rounded-xl bg-white mx-auto"
      style={{ width: "100%", maxWidth: `${width}px`, aspectRatio: `${dims.w} / ${dims.h}` }}
    >
      <div
        style={{
          width: `${dims.w}px`,
          height: `${dims.h}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top right",
        }}
        className="absolute top-0 right-0"
      >
        <SlideRenderer {...slideProps} />
        {shouldShowMedicalDisclaimer(!!slideProps.medical?.isMedical, slideProps.brandKitSettings.showDisclaimer) && (
          <DisclaimerFooter
            variant="overlay"
            text={slideProps.brandKitData.disclaimerText || ""}
            palette={slideProps.palette}
            font={slideProps.font}
          />
        )}
      </div>
    </div>
  );
}

export function ExportSlide(props: SlideRenderProps) {
  const dims = SIZES.find((s) => s.id === props.size) ?? SIZES[0];
  return (
    <div style={{ width: `${dims.w}px`, height: `${dims.h}px` }}>
      <SlideRenderer {...props} />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { buildSrcDoc, substituteTokens, type TemplateToken } from "@/lib/services/template-sandbox";

export const DESIGNER_SAMPLE_VALUES: Record<TemplateToken, string> = {
  title: "كيف تحافظ على صحتك اليوم؟",
  body: "نصائح بسيطة وفعالة يمكنك تطبيقها من الآن لتحسين نمط حياتك اليومي والشعور بتحسن ملحوظ.",
  slideNumber: "3",
  totalSlides: "8",
  accountName: "@typo.clinic",
  logoUrl: "",
  ctaText: "احفظ المنشور لاحقًا",
};

interface IsolatedTemplatePreviewProps {
  html: string;
  css: string;
  width: number;
  height: number;
  values?: Partial<Record<TemplateToken, string>>;
  iframeRef?: React.Ref<HTMLIFrameElement>;
}

// Renders AI-generated HTML/CSS in a sandboxed iframe. No allow-scripts,
// no allow-forms, no allow-popups — the content cannot execute JS,
// navigate the top frame, or submit forms. allow-same-origin is required
// so the parent can later read iframe.contentDocument (for PNG export),
// which grants no meaningful capability here since scripts can't run
// inside the frame in the first place. Sanitization already happened
// server-side before this html/css ever reached the client.
export function IsolatedTemplatePreview({ html, css, width, height, values, iframeRef }: IsolatedTemplatePreviewProps) {
  const substituted = substituteTokens(html, values ?? DESIGNER_SAMPLE_VALUES);
  const srcDoc = buildSrcDoc(substituted, css, width, height);
  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-same-origin"
      srcDoc={srcDoc}
      style={{ width, height, border: "none", display: "block" }}
      title="template-preview"
    />
  );
}

interface ScaledIsolatedPreviewProps extends IsolatedTemplatePreviewProps {
  maxWidth?: number;
}

// Scale-to-fit wrapper, same ResizeObserver approach as ScaledSlide
// (src/components/carousel/slide-renderer.tsx) but wrapping the sandboxed
// iframe instead of a React-component slide.
export function ScaledIsolatedPreview({ maxWidth = 400, width, height, ...previewProps }: ScaledIsolatedPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(maxWidth);

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

  const scale = measuredWidth / width;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-white mx-auto shadow-soft"
      style={{ width: "100%", maxWidth: `${maxWidth}px`, aspectRatio: `${width} / ${height}` }}
    >
      <div
        style={{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})`, transformOrigin: "top right" }}
        className="absolute top-0 right-0"
      >
        <IsolatedTemplatePreview width={width} height={height} {...previewProps} />
      </div>
    </div>
  );
}

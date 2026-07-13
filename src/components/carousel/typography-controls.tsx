"use client";

import { useState } from "react";
import { ALL_FONTS } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { FontFamily, ProjectSettings, TextAlignment } from "@/lib/types";

const ALIGNMENTS: { id: TextAlignment; label: string }[] = [
  { id: "auto", label: "تلقائي" },
  { id: "right", label: "يمين" },
  { id: "center", label: "وسط" },
  { id: "left", label: "يسار" },
];

export function TypographyControls({ settings, onChange }: {
  settings: ProjectSettings;
  onChange: (updates: Partial<ProjectSettings>) => void;
}) {
  const [role, setRole] = useState<"title" | "body">("title");
  const isTitle = role === "title";
  const font = isTitle ? settings.titleFont : settings.bodyFont;
  const scale = isTitle ? settings.titleFontSizeScale : settings.bodyFontSizeScale;
  const alignment = isTitle ? settings.titleTextAlign : settings.bodyTextAlign;

  const setFont = (value: FontFamily) => onChange(isTitle ? { titleFont: value } : { bodyFont: value });
  const setScale = (value: number) => onChange(isTitle ? { titleFontSizeScale: value } : { bodyFontSizeScale: value });
  const setAlignment = (value: TextAlignment) => onChange(isTitle ? { titleTextAlign: value } : { bodyTextAlign: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1" aria-label="نوع النص">
        <button type="button" onClick={() => setRole("title")} aria-pressed={isTitle} className={cn("min-h-11 rounded-lg px-2 text-sm font-medium", isTitle ? "bg-white text-accent shadow-sm" : "text-ink-muted")}>
          العنوان الرئيسي
        </button>
        <button type="button" onClick={() => setRole("body")} aria-pressed={!isTitle} className={cn("min-h-11 rounded-lg px-2 text-sm font-medium", !isTitle ? "bg-white text-accent shadow-sm" : "text-ink-muted")}>
          الوصف
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink">الخط</h3>
        <div className="space-y-1.5">
          {ALL_FONTS.map((item) => (
            <button key={item.id} type="button" onClick={() => setFont(item.id as FontFamily)} aria-pressed={font === item.id} className={cn("min-h-11 w-full rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors", font === item.id ? "border-accent bg-accent-soft text-accent" : "border-stone-200 bg-white text-ink hover:bg-stone-50")}>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">حجم الخط</h3>
          <span className="text-sm font-medium text-accent">{Math.round(scale * 100)}%</span>
        </div>
        <input type="range" min={0.8} max={1.3} step={0.05} value={scale} onChange={(event) => setScale(Number(event.target.value))} aria-label={`حجم خط ${isTitle ? "العنوان الرئيسي" : "الوصف"}`} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-accent" />
        <div className="mt-1 flex justify-between text-xs text-ink-subtle"><span>صغير</span><span>كبير</span></div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink">محاذاة النص</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {ALIGNMENTS.map((item) => (
            <button key={item.id} type="button" onClick={() => setAlignment(item.id)} aria-pressed={alignment === item.id} className={cn("min-h-11 rounded-lg border px-2 text-xs font-medium transition-colors", alignment === item.id ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted hover:bg-stone-50")}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

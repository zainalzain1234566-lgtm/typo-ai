"use client";

import { useState } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  CANVAS_SIZES,
  CANVAS_SIZE_DIMENSIONS,
  TEMPLATE_FONT_IDS,
  TEMPLATE_FONT_NAMES,
  FONT_SIZE_PREFERENCES,
  TEXT_DENSITIES,
  MIN_SLIDE_COUNT,
  MAX_SLIDE_COUNT,
  type CustomTemplateSettings,
} from "@/lib/validation/custom-templates";

const FONT_SIZE_LABELS: Record<(typeof FONT_SIZE_PREFERENCES)[number], string> = {
  small: "صغير",
  medium: "متوسط",
  large: "كبير",
};

const DENSITY_LABELS: Record<(typeof TEXT_DENSITIES)[number], string> = {
  minimal: "بسيط",
  balanced: "متوازن",
  detailed: "تفصيلي",
};

interface DesignerSettingsProps {
  settings: CustomTemplateSettings;
  onChange: (settings: CustomTemplateSettings) => void;
  disabled?: boolean;
}

function Chip({ active, children, onClick, disabled }: { active: boolean; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-xl border-2 py-2 px-3 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        active ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted hover:border-stone-300"
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      {children}
    </div>
  );
}

export function DesignerSettings({ settings, onChange, disabled }: DesignerSettingsProps) {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const patch = (partial: Partial<CustomTemplateSettings>) => onChange({ ...settings, ...partial });

  return (
    <div className="space-y-5 p-4" dir="rtl">
      <Field label="الموضوع">
        <Textarea
          aria-label="موضوع القالب"
          value={settings.topic}
          onChange={(e) => patch({ topic: e.target.value })}
          placeholder="مثال: كيف تربي طفلك بثقة، نصائح للصحة النفسية..."
          disabled={disabled}
          className="min-h-[70px]"
        />
      </Field>

      <Field label="عدد الشرائح">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="تقليل عدد الشرائح"
            disabled={disabled || settings.slideCount <= MIN_SLIDE_COUNT}
            onClick={() => patch({ slideCount: settings.slideCount - 1 })}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-200 text-ink-muted hover:border-stone-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="flex-1 text-center text-sm font-bold text-ink">{settings.slideCount}</span>
          <button
            type="button"
            aria-label="زيادة عدد الشرائح"
            disabled={disabled || settings.slideCount >= MAX_SLIDE_COUNT}
            onClick={() => patch({ slideCount: settings.slideCount + 1 })}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-200 text-ink-muted hover:border-stone-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </Field>

      <Field label="مقاس التصميم">
        <div className="grid grid-cols-1 gap-1.5">
          {CANVAS_SIZES.map((size) => (
            <Chip key={size} active={settings.size === size} onClick={() => patch({ size })} disabled={disabled}>
              {CANVAS_SIZE_DIMENSIONS[size].label} ({size})
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="الألوان (اختياري)">
        <div className="flex flex-wrap gap-2">
          {settings.colors.map((color, i) => (
            <div key={i} className="relative">
              <input
                type="color"
                aria-label={`اللون ${i + 1}`}
                value={color}
                disabled={disabled}
                onChange={(e) => {
                  const next = [...settings.colors];
                  next[i] = e.target.value;
                  patch({ colors: next });
                }}
                className="h-11 w-11 rounded-lg border border-stone-200 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                aria-label={`إزالة اللون ${i + 1}`}
                disabled={disabled}
                onClick={() => patch({ colors: settings.colors.filter((_, idx) => idx !== i) })}
                className="absolute -left-4 -top-4 z-10 flex min-h-11 min-w-11 items-center justify-center text-ink-subtle hover:text-red-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-stone-300 bg-white">
                  <Minus className="w-2.5 h-2.5" />
                </span>
              </button>
            </div>
          ))}
          {settings.colors.length < 6 && (
            <button
              type="button"
              aria-label="إضافة لون"
              disabled={disabled}
              onClick={() => patch({ colors: [...settings.colors, "#6D5EFC"] })}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-ink-subtle hover:border-accent hover:text-accent cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        {settings.colors.length === 0 && <p className="text-xs text-ink-subtle mt-1">لم يتم التحديد — سيختار الذكاء الاصطناعي الألوان بنفسه</p>}
      </Field>

      <button
        type="button"
        onClick={() => setExtrasOpen((v) => !v)}
        aria-expanded={extrasOpen}
        className="flex min-h-11 items-center justify-between w-full text-xs font-semibold text-ink-muted cursor-pointer"
      >
        خيارات إضافية (اختياري — دع الذكاء الاصطناعي يقرر إن تُركت فارغة)
        <ChevronDown className={cn("w-4 h-4 transition-transform", extrasOpen && "rotate-180")} />
      </button>

      {extrasOpen && (
        <div className="space-y-5">
          <Field label="الخط">
            <div className="grid grid-cols-1 gap-1.5">
              {TEMPLATE_FONT_IDS.map((font) => (
                <Chip key={font} active={settings.fontFamily === font} onClick={() => patch({ fontFamily: settings.fontFamily === font ? undefined : font })} disabled={disabled}>
                  {TEMPLATE_FONT_NAMES[font]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="حجم الخط">
            <div className="grid grid-cols-3 gap-1.5">
              {FONT_SIZE_PREFERENCES.map((pref) => (
                <Chip key={pref} active={settings.fontSizePreference === pref} onClick={() => patch({ fontSizePreference: settings.fontSizePreference === pref ? undefined : pref })} disabled={disabled}>
                  {FONT_SIZE_LABELS[pref]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="الأسلوب البصري">
            <Input
              value={settings.visualStyle ?? ""}
              onChange={(e) => patch({ visualStyle: e.target.value || undefined })}
              placeholder="مثال: عصري، بسيط، أكاديمي"
              disabled={disabled}
            />
          </Field>

          <Field label="كثافة النص">
            <div className="grid grid-cols-3 gap-1.5">
              {TEXT_DENSITIES.map((density) => (
                <Chip key={density} active={settings.textDensity === density} onClick={() => patch({ textDensity: settings.textDensity === density ? undefined : density })} disabled={disabled}>
                  {DENSITY_LABELS[density]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="عناصر إضافية">
            <div className="space-y-2.5">
              <label className="flex min-h-11 items-center justify-between text-sm text-ink cursor-pointer">
                اسم الحساب
                <Checkbox checked={settings.showAccountName} onCheckedChange={(v) => patch({ showAccountName: v })} disabled={disabled} />
              </label>
              <label className="flex min-h-11 items-center justify-between text-sm text-ink cursor-pointer">
                الشعار
                <Checkbox checked={settings.showLogo} onCheckedChange={(v) => patch({ showLogo: v })} disabled={disabled} />
              </label>
              <label className="flex min-h-11 items-center justify-between text-sm text-ink cursor-pointer">
                رقم الشريحة
                <Checkbox checked={settings.showSlideNumbers} onCheckedChange={(v) => patch({ showSlideNumbers: v })} disabled={disabled} />
              </label>
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

export const DEFAULT_DESIGNER_SETTINGS: CustomTemplateSettings = {
  topic: "",
  slideCount: 6,
  size: "1080x1350",
  colors: [],
  showAccountName: false,
  showLogo: false,
  showSlideNumbers: true,
};

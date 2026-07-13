"use client";

import { History, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignerVersion } from "./types";

interface VersionHistoryProps {
  versions: DesignerVersion[];
  currentVersionId: string | null;
  onSelect: (version: DesignerVersion) => void;
  disabled?: boolean;
}

const SOURCE_LABELS: Record<DesignerVersion["source"], string> = {
  generate: "توليد أولي",
  edit: "تعديل",
};

export function VersionHistory({ versions, currentVersionId, onSelect, disabled }: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <div dir="rtl" className="border-t border-stone-200 p-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
        <History className="w-3.5 h-3.5" />
        سجل النسخ ({versions.length})
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {[...versions].reverse().map((v) => {
          const active = v.id === currentVersionId;
          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(v)}
              aria-pressed={active}
              className={cn(
                "min-h-11 w-full text-right rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer disabled:cursor-not-allowed",
                active ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted hover:border-stone-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">نسخة {v.versionNumber} — {SOURCE_LABELS[v.source]}</span>
                {active ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5 opacity-50" />}
              </div>
              {v.aiMessage && <p className="mt-1 opacity-80 line-clamp-2">{v.aiMessage}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

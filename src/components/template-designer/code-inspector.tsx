"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CodeInspectorProps {
  open: boolean;
  onClose: () => void;
  css: string;
  htmlCover: string;
  htmlContent: string;
  htmlEnding: string;
}

const TABS = [
  { id: "css", label: "CSS" },
  { id: "cover", label: "HTML — الغلاف" },
  { id: "content", label: "HTML — المحتوى" },
  { id: "ending", label: "HTML — الختام" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CodeInspector({ open, onClose, css, htmlCover, htmlContent, htmlEnding }: CodeInspectorProps) {
  const [tab, setTab] = useState<TabId>("css");
  const [copied, setCopied] = useState(false);

  const content: Record<TabId, string> = { css, cover: htmlCover, content: htmlContent, ending: htmlEnding };

  const copy = () => {
    navigator.clipboard.writeText(content[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} title="الكود المُولّد" className="max-w-2xl">
      <div dir="rtl" className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "min-h-11 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                tab === t.id ? "bg-accent text-accent-foreground" : "bg-stone-100 text-ink-muted hover:bg-stone-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={copy}
            className="absolute top-2 left-2 z-10 flex min-h-11 items-center gap-1 rounded-lg bg-white/90 border border-stone-200 px-2 py-1 text-xs text-ink-muted hover:text-ink cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "تم النسخ" : "نسخ"}
          </button>
          <pre dir="ltr" className="max-h-96 overflow-auto rounded-xl bg-stone-900 text-stone-100 text-xs leading-relaxed p-4 text-left">
            <code>{content[tab]}</code>
          </pre>
        </div>
      </div>
    </Dialog>
  );
}

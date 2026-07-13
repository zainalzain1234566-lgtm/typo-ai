"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Cpu, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AVAILABLE_AI_MODELS } from "@/lib/constants";
import { DESIGNER_PROGRESS_MESSAGES } from "@/lib/services/generation";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  placeholder?: string;
  model?: string;
  onModelChange: (model: string | undefined) => void;
  canChooseModel: boolean;
}

export function ChatPanel({ messages, loading, onSend, placeholder, model, onModelChange, canChooseModel }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, progressIndex]);

  // No real streaming/progress signal from the API (non-streaming call) —
  // cycle fake-but-informative status messages instead, same trick as
  // projects/new/page.tsx's genMessage/genProgress cycling.
  useEffect(() => {
    if (!loading) {
      setProgressIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressIndex((i) => Math.min(i + 1, DESIGNER_PROGRESS_MESSAGES.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!modelMenuOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!modelPickerRef.current?.contains(e.target as Node)) setModelMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [modelMenuOpen]);

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setDraft("");
  };

  const modelLabel = AVAILABLE_AI_MODELS.find((m) => m.id === model)?.label ?? "افتراضي";

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-ink-subtle px-6">
            <Sparkles className="w-8 h-8 text-accent" />
            <p className="text-sm font-medium text-ink">صف التصميم الذي تريده</p>
            <p className="text-xs">مثال: تصميم طبي هادئ بعنوان كبير وبطاقات معلومات منفصلة</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "bg-accent text-accent-foreground" : "bg-stone-100 text-ink"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-accent-soft flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
              <span className="font-semibold text-accent">{DESIGNER_PROGRESS_MESSAGES[progressIndex]}...</span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-stone-200 p-3 space-y-2">
        {/* Local popover (not the shared portal Dropdown) opening UPWARD —
            this trigger sits directly above the input row, and the shared
            Dropdown always opens downward, which covered the textarea/send
            button. bottom-full anchors the menu above the trigger instead. */}
        {canChooseModel ? <div ref={modelPickerRef} className="relative inline-block">
          <button
            type="button"
            disabled={loading}
            onClick={() => setModelMenuOpen((v) => !v)}
            aria-expanded={modelMenuOpen}
            aria-controls="designer-model-options"
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-ink-muted hover:border-stone-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cpu className="w-3.5 h-3.5" />
            {modelLabel}
          </button>
          {modelMenuOpen && (
            <div id="designer-model-options" className="absolute bottom-full right-0 mb-2 min-w-[200px] rounded-xl border border-stone-200 bg-white py-1.5 shadow-lift z-50">
              <button
                type="button"
                onClick={() => { onModelChange(undefined); setModelMenuOpen(false); }}
                aria-pressed={!model}
                className="flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2 text-sm text-right text-ink hover:bg-stone-50 cursor-pointer"
              >
                {!model && <Check className="w-3.5 h-3.5" />}
                افتراضي
              </button>
              {AVAILABLE_AI_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onModelChange(m.id); setModelMenuOpen(false); }}
                  aria-pressed={model === m.id}
                  className="flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2 text-sm text-right text-ink hover:bg-stone-50 cursor-pointer"
                >
                  {model === m.id && <Check className="w-3.5 h-3.5" />}
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div> : (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-ink-muted">
            <Cpu className="w-3.5 h-3.5" /> DeepSeek Flash
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={placeholder ?? "اكتب رسالتك..."}
            disabled={loading}
            className="min-h-[44px] max-h-32"
            rows={1}
          />
          <Button type="button" size="icon" aria-label="إرسال الرسالة" onClick={send} disabled={loading || !draft.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

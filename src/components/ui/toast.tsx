"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; title: string; description?: string; type: ToastType; }

const ToastContext = createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lift",
                t.type === "success" && "border-green-200",
                t.type === "error" && "border-red-200",
                t.type === "info" && "border-stone-200"
              )}
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {t.type === "info" && <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && <p className="text-xs text-ink-muted mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-ink-subtle hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

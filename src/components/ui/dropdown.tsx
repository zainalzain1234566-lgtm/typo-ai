"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, children, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-1 min-w-[200px] rounded-xl border border-stone-200 bg-white py-1.5 shadow-lift",
              align === "end" ? "left-0" : "right-0",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ children, onClick, className, destructive }: {
  children: ReactNode; onClick?: () => void; className?: string; destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-right transition-colors cursor-pointer",
        destructive ? "text-red-600 hover:bg-red-50" : "text-ink hover:bg-stone-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-stone-100" />;
}

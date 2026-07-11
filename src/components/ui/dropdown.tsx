"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, children, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition(
        align === "end"
          ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
          : { top: rect.bottom + 4, left: rect.left }
      );
    }
    updatePosition();
    // menu is fixed-positioned (viewport coords); close instead of drifting if the page scrolls/resizes underneath it
    function close() { setOpen(false); }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, align]);

  return (
    <div ref={triggerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {mounted && createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{ position: "fixed", top: position.top, left: position.left, right: position.right }}
              className={cn(
                "z-50 min-w-[200px] rounded-xl border border-stone-200 bg-white py-1.5 shadow-lift",
                className
              )}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
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

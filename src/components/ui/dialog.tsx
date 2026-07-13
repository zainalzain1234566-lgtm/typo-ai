"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0
  );
}

export function Dialog({ open, onClose, children, className, title, description }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted) return;

    const dialog = dialogRef.current;
    const portalRoot = dialog?.closest<HTMLElement>("[data-dialog-portal]");
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    const backgroundStates = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== portalRoot)
      .map((element) => ({
        element,
        inert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      }));

    document.body.style.overflow = "hidden";
    for (const { element } of backgroundStates) {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = focusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialog ? focusableElements(dialog)[0] : null;
      (firstFocusable ?? dialog)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      for (const { element, inert, ariaHidden } of backgroundStates) {
        if (inert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      previouslyFocused?.focus();
    };
  }, [open, mounted]);

  if (!mounted || !open) return null;

  return createPortal(
    <div data-dialog-portal className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" onPointerDown={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : "نافذة حوار"}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lift border border-stone-200",
          className
        )}
      >
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            {title && <h2 id={titleId} className="text-lg font-bold text-ink">{title}</h2>}
            {description && <p id={descriptionId} className="text-sm text-ink-muted mt-1">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق النافذة" className="-mt-2 flex min-h-11 min-w-11 items-center justify-center text-ink-subtle hover:text-ink cursor-pointer">
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

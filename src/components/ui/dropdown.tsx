"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

interface TriggerElementProps {
  id?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu";
}

type MenuFocusTarget = "first" | "last";

const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function visibleElements(root: ParentNode, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hidden && !element.closest("[inert]") && element.getClientRects().length > 0
  );
}

export function Dropdown({ trigger, children, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<MenuFocusTarget | null>(null);
  const triggerId = useId();
  const menuId = useId();

  useEffect(() => setMounted(true), []);

  const getTriggerElement = () => triggerRef.current?.querySelector<HTMLElement>(TABBABLE_SELECTOR) ?? null;
  const getMenuItems = () => menuRef.current
    ? visibleElements(menuRef.current, "[role='menuitem']:not([disabled])")
    : [];

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return false;
    setPosition(
      align === "end"
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left }
    );
    return true;
  };

  const openMenu = (focusTarget: MenuFocusTarget) => {
    if (!updatePosition()) return;
    pendingFocusRef.current = focusTarget;
    setOpen(true);
  };

  const closeMenu = (returnFocus = false) => {
    setOpen(false);
    pendingFocusRef.current = null;
    if (returnFocus) window.requestAnimationFrame(() => getTriggerElement()?.focus());
  };

  useEffect(() => {
    if (!open || !position || !pendingFocusRef.current) return;
    const focusTarget = pendingFocusRef.current;
    const frame = window.requestAnimationFrame(() => {
      pendingFocusRef.current = null;
      const items = menuRef.current
        ? visibleElements(menuRef.current, "[role='menuitem']:not([disabled])")
        : [];
      items[focusTarget === "first" ? 0 : items.length - 1]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      pendingFocusRef.current = null;
      setOpen(false);
    };
    const close = () => {
      pendingFocusRef.current = null;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleTriggerClick = (event: ReactMouseEvent<HTMLElement>, original?: TriggerElementProps["onClick"]) => {
    original?.(event);
    if (event.defaultPrevented) return;
    if (open) closeMenu();
    else openMenu("first");
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>, original?: TriggerElementProps["onKeyDown"]) => {
    original?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu("last");
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu(true);
    }
  };

  const focusRelativeToTrigger = (backward: boolean) => {
    const triggerElement = getTriggerElement();
    const candidates = visibleElements(document, TABBABLE_SELECTOR).filter(
      (element) => !menuRef.current?.contains(element)
    );
    const triggerIndex = triggerElement ? candidates.indexOf(triggerElement) : -1;
    if (triggerIndex < 0 || candidates.length < 2) {
      triggerElement?.focus();
      return;
    }
    const nextIndex = (triggerIndex + (backward ? -1 : 1) + candidates.length) % candidates.length;
    candidates[nextIndex]?.focus();
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = getMenuItems();
    const activeIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = activeIndex < 0
        ? (direction === 1 ? 0 : items.length - 1)
        : (activeIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeMenu();
      focusRelativeToTrigger(event.shiftKey);
    }
  };

  let renderedTrigger: ReactNode;
  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<TriggerElementProps>;
    const elementId = element.props.id ?? triggerId;
    renderedTrigger = cloneElement(element, {
      id: elementId,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "aria-controls": menuId,
      onClick: (event) => handleTriggerClick(event, element.props.onClick),
      onKeyDown: (event) => handleTriggerKeyDown(event, element.props.onKeyDown),
    });
  } else {
    renderedTrigger = (
      <button
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => handleTriggerClick(event)}
        onKeyDown={(event) => handleTriggerKeyDown(event)}
      >
        {trigger}
      </button>
    );
  }

  const labelledBy = isValidElement(trigger)
    ? (trigger as ReactElement<TriggerElementProps>).props.id ?? triggerId
    : triggerId;

  return (
    <div ref={triggerRef} className="relative" onClick={(event) => event.stopPropagation()}>
      {renderedTrigger}
      {mounted && open && position && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={labelledBy}
          aria-orientation="vertical"
          onKeyDown={handleMenuKeyDown}
          onClick={(event) => {
            event.stopPropagation();
            const target = event.target;
            if (target instanceof Element && target.closest("[role='menuitem']")) {
              getTriggerElement()?.focus();
              closeMenu();
            }
          }}
          style={{ position: "fixed", top: position.top, left: position.left, right: position.right }}
          className={cn(
            "z-50 min-w-[200px] rounded-xl border border-stone-200 bg-white py-1.5 shadow-lift",
            className
          )}
        >
          {children}
        </div>,
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
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2 text-sm text-right transition-colors cursor-pointer",
        destructive ? "text-red-600 hover:bg-red-50" : "text-ink hover:bg-stone-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-stone-100" />;
}

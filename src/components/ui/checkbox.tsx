"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <span className="relative inline-flex">
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border transition-colors cursor-pointer peer-checked:bg-accent peer-checked:border-accent",
          checked ? "bg-accent border-accent" : "bg-white border-stone-300"
        )}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </span>
    </span>
  )
);
Checkbox.displayName = "Checkbox";

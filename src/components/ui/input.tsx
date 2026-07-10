import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

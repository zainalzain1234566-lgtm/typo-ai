import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:opacity-50 resize-y leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

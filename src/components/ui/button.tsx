import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft",
        outline: "border border-stone-200 bg-white text-ink hover:bg-stone-50 hover:border-stone-300",
        ghost: "text-ink hover:bg-stone-100",
        soft: "bg-accent-soft text-accent hover:bg-accent-soft/70",
        secondary: "bg-stone-100 text-ink hover:bg-stone-200",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#workflow", label: "طريقة العمل" },
  { href: "/#templates", label: "نماذج القوالب" },
  { href: "/#features", label: "المميزات" },
  { href: "/#pricing", label: "ملخص الأسعار" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-[#faf9f7]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Typo AI - الرئيسية" className="flex min-h-11 items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-ink">
            Typo <span className="text-accent">AI</span>
          </span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-11 items-center px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-stone-100/60"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            تسجيل الدخول
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            ابدأ مجانًا
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-stone-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
          aria-controls="mobile-marketing-menu"
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-marketing-menu" className="md:hidden overflow-hidden border-t border-stone-200 bg-white">
          <nav aria-label="قائمة التنقل للجوال" className="flex flex-col gap-1 p-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-ink-muted hover:bg-stone-50 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "min-h-11 flex-1")}
                onClick={() => setOpen(false)}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants(), "min-h-11 flex-1")}
                onClick={() => setOpen(false)}
              >
                ابدأ مجانًا
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

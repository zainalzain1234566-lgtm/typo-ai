"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#how", label: "كيف يعمل" },
  { href: "/templates", label: "القوالب" },
  { href: "/#features", label: "المميزات" },
  { href: "/#examples", label: "الأمثلة" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-[#faf9f7]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-ink">
            Typo <span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-stone-100/60"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="default">تسجيل الدخول</Button>
          </Link>
          <Link href="/signup">
            <Button>ابدأ مجانًا</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-ink p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-stone-200 bg-white"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-ink rounded-lg hover:bg-stone-50"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2">
                <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full">ابدأ مجانًا</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

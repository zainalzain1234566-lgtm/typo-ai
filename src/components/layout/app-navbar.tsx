"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, LayoutGrid, Image as ImageIcon, Sparkles, Wand2, FolderOpen } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useApp } from "@/lib/app-context";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects", label: "المشاريع", icon: LayoutGrid },
  { href: "/templates", label: "القوالب", icon: ImageIcon },
  { href: "/templates/mine", label: "قوالبي", icon: FolderOpen },
  { href: "/templates/designer", label: "مصمم القوالب بالذكاء الاصطناعي", icon: Wand2 },
  { href: "/projects/new", label: "إنشاء مشروع", icon: Sparkles },
  { href: "/settings", label: "الإعدادات", icon: SettingsIcon },
];

export function AppNavbar() {
  const { user, ready } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" aria-label="Typo AI — الصفحة الرئيسية" className="text-xl font-extrabold tracking-tight text-ink">
            Typo <span className="text-accent">AI</span>
          </Link>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href={user ? "/projects" : "/"}
          aria-label={user ? "Typo AI — المشاريع" : "Typo AI — الصفحة الرئيسية"}
          className="flex items-center gap-2 shrink-0"
        >
          <span className="text-xl font-extrabold tracking-tight text-ink">
            Typo <span className="text-accent">AI</span>
          </span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/projects/new" && item.href !== "/templates/designer" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors",
                  active ? "bg-accent-soft text-accent" : "text-ink-muted hover:text-ink hover:bg-stone-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? <Dropdown
            trigger={
              <button
                type="button"
                aria-label="فتح قائمة الحساب"
                aria-haspopup="menu"
                className="flex min-h-11 items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="صورة الحساب" width={32} height={32} decoding="async" className="w-full h-full object-cover" />
                  ) : (user?.name?.[0] ?? "م")}
                </div>
                <ChevronDown className="w-4 h-4 text-ink-subtle hidden md:block" />
              </button>
            }
          >
            <div role="presentation" className="px-3 py-2">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
            </div>
            <DropdownSeparator />
            <DropdownItem onClick={() => router.push("/settings")}>
              <SettingsIcon className="w-4 h-4" /> الإعدادات
            </DropdownItem>
            <DropdownItem onClick={handleLogout} destructive>
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </DropdownItem>
          </Dropdown> : (
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-accent hover:bg-accent-soft">
              تسجيل الدخول
            </Link>
          )}

          <button
            type="button"
            className="md:hidden min-h-11 min-w-11 text-ink p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
            aria-expanded={open}
            aria-controls="app-mobile-navigation"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="app-mobile-navigation"
          aria-label="التنقل في التطبيق"
          className="overflow-hidden border-t border-stone-200 bg-white md:hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-ink rounded-lg hover:bg-stone-50"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

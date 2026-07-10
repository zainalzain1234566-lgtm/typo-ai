"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { PROTECTED_ROUTES, AUTH_ROUTES } from "@/lib/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (isProtected && !isAuthenticated) {
      router.replace("/login");
    }
    if (isAuthRoute && isAuthenticated) {
      router.replace("/projects");
    }
  }, [ready, isAuthenticated, pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-stone-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

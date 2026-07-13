"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AppProvider } from "@/lib/app-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>{children}</ToastProvider>
    </AppProvider>
  );
}

import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { MotionPreferences } from "@/components/providers/motion-preferences";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/settings"]);

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <MotionPreferences>
      <AppProviders>{children}</AppProviders>
    </MotionPreferences>
  );
}

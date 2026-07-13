import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { MotionPreferences } from "@/components/providers/motion-preferences";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/projects"]);

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <MotionPreferences>
      <AppProviders>{children}</AppProviders>
    </MotionPreferences>
  );
}

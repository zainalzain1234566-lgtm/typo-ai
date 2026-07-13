import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/templates"]);

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

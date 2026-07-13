import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/privacy"]);

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}

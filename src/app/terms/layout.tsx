import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/terms"]);

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}

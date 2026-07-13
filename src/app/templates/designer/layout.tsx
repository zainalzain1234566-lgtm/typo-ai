import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/templates/designer"]);

export default function TemplateDesignerLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/projects/[id]/export"]);

export default function ExportProjectLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/projects/[id]/edit"]);

export default function EditProjectLayout({ children }: { children: ReactNode }) {
  return children;
}

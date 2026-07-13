import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/projects/new"]);

export default function NewProjectLayout({ children }: { children: ReactNode }) {
  return children;
}

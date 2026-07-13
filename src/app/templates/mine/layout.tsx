import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/templates/mine"]);

export default function MyTemplatesLayout({ children }: { children: ReactNode }) {
  return children;
}

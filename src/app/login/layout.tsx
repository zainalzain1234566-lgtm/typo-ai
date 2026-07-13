import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/login"]);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}

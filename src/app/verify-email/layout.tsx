import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/verify-email"]);

export default function VerifyEmailLayout({ children }: { children: ReactNode }) {
  return children;
}

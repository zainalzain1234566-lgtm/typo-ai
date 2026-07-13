import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/reset-password"]);

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}

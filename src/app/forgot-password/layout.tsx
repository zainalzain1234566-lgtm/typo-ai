import type { ReactNode } from "react";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";

export const metadata = createPageMetadata(ROUTE_SEO["/forgot-password"]);

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}

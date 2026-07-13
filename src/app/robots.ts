import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/seo";

const PROTECTED_PATHS = ["/projects", "/settings", "/templates/designer", "/templates/mine"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PROTECTED_PATHS,
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

import type { MetadataRoute } from "next";
import { absoluteUrl, INDEXABLE_PAGES } from "../lib/seo";

const PAGE_DETAILS = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/templates": { changeFrequency: "monthly", priority: 0.9 },
  "/pricing": { changeFrequency: "monthly", priority: 0.8 },
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: PAGE_DETAILS[page.path].changeFrequency,
    priority: PAGE_DETAILS[page.path].priority,
  }));
}

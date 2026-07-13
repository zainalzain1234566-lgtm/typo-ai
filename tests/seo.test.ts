import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFileSync(new URL(path, root), "utf8");
const importTs = (path: string) => import(new URL(path, import.meta.url).href);
type SeoDefinition = {
  path: string;
  title: string;
  description: string;
  index: boolean;
  follow: boolean;
};

const expectedRoutes = [
  "/",
  "/templates",
  "/pricing",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/projects",
  "/projects/new",
  "/projects/[id]/edit",
  "/projects/[id]/export",
  "/settings",
  "/templates/mine",
  "/templates/designer",
] as const;

test("defines unique route metadata, canonicals, and social metadata", async () => {
  assert.equal(existsSync(new URL("src/lib/seo.ts", root)), true);

  const { ROUTE_SEO, createPageMetadata } = await importTs("../src/lib/seo.ts");
  const routeSeo = ROUTE_SEO as Record<(typeof expectedRoutes)[number], SeoDefinition>;
  assert.deepEqual(Object.keys(routeSeo).sort(), [...expectedRoutes].sort());
  assert.equal(new Set(Object.values(routeSeo).map((page: SeoDefinition) => page.title)).size, expectedRoutes.length);
  assert.equal(new Set(Object.values(routeSeo).map((page: SeoDefinition) => page.description)).size, expectedRoutes.length);

  for (const page of Object.values(routeSeo)) {
    const metadata = createPageMetadata(page);
    assert.deepEqual(metadata.robots, page.follow
      ? { index: page.index, follow: true }
      : { index: false, follow: false, noarchive: true });
    if (page.follow) {
      assert.equal(metadata.alternates?.canonical, page.path);
      assert.equal(metadata.openGraph?.title, page.title);
      assert.equal(metadata.twitter?.description, page.description);
    }
  }
  assert.deepEqual(createPageMetadata(routeSeo["/projects"]).robots, {
    index: false,
    follow: false,
    noarchive: true,
  });
  const privateMetadata = createPageMetadata(routeSeo["/templates/designer"]);
  assert.equal(privateMetadata.alternates, null);
  assert.equal(privateMetadata.openGraph, null);
  assert.equal(privateMetadata.twitter, null);
});

test("publishes only indexable public routes in sitemap and crawl controls", async () => {
  assert.equal(existsSync(new URL("src/app/sitemap.ts", root)), true);
  assert.equal(existsSync(new URL("src/app/robots.ts", root)), true);

  const { INDEXABLE_PAGES, absoluteUrl } = await importTs("../src/lib/seo.ts");
  const oldUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://typo.example";
  try {
    assert.deepEqual(
      (INDEXABLE_PAGES as SeoDefinition[]).map((entry) => absoluteUrl(entry.path)),
      ["https://typo.example/", "https://typo.example/templates", "https://typo.example/pricing"]
    );
    const sitemapSource = source("src/app/sitemap.ts");
    const robotsSource = source("src/app/robots.ts");
    assert.match(sitemapSource, /INDEXABLE_PAGES\.map/);
    for (const route of ["/projects", "/settings", "/templates/designer", "/templates/mine"]) {
      assert.match(robotsSource, new RegExp(route.replaceAll("/", "\\/")));
    }
    assert.match(robotsSource, /sitemap\.xml/);
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = oldUrl;
  }
});

test("uses one visible FAQ source for FAQ structured data", async () => {
  assert.equal(existsSync(new URL("src/lib/home-content.ts", root)), true);
  const { HOME_FAQS, createHomeJsonLd } = await importTs("../src/lib/home-content.ts");
  const schemas = createHomeJsonLd("https://typo.example");
  const faq = schemas.find((schema: Record<string, unknown>) => schema["@type"] === "FAQPage");
  assert.ok(faq);
  assert.deepEqual(
    faq.mainEntity.map((item: { name: string; acceptedAnswer: { text: string } }) => ({
      question: item.name,
      answer: item.acceptedAnswer.text,
    })),
    HOME_FAQS
  );
  assert.match(JSON.stringify(faq), /لا يُعد نصيحة أو تشخيصًا طبيًا/);
});

test("keeps middleware under src and removes the client-only root auth gate", () => {
  const middlewarePath = new URL("src/middleware.ts", root);
  assert.equal(existsSync(middlewarePath), true);
  assert.match(source("src/lib/supabase/middleware.ts"), /auth\.getClaims\(\)/);
  assert.doesNotMatch(source("src/app/layout.tsx"), /AuthGuard/);
  assert.match(source("src/lib/supabase/middleware.ts"), /X-Robots-Tag/);
  assert.match(source("src/lib/supabase/middleware.ts"), /pathname === "\/reset-password"/);
  assert.match(source("src/lib/supabase/middleware.ts"), /pathname.*request\.nextUrl\.search/);
  assert.match(source("src/lib/supabase/middleware.ts"), /new URL\("\/login", request\.url\)/);
  assert.match(source("src/lib/supabase/middleware.ts"), /new URL\("\/projects", request\.url\)/);
  assert.match(source("src/app/login/page.tsx"), /\^\\\/\(\?!\[\\\\\/\]\)/);
});

test("keeps search-parameter client hooks behind route-local suspense", () => {
  const designerPage = source("src/app/templates/designer/page.tsx");
  assert.match(designerPage, /import \{ Suspense \} from "react"/);
  assert.match(designerPage, /<Suspense[^>]*>[\s\S]*<DesignerWorkspace \/>[\s\S]*<\/Suspense>/);
  for (const route of ["src/app/login/page.tsx", "src/app/projects/new/page.tsx", "src/app/templates/designer/page.tsx"]) {
    const page = source(route);
    assert.match(page, /fallback=\{\s*<main id="main-content"/);
    assert.match(page, /fallback=\{\s*<main[\s\S]*<h1/);
  }
});

test("homepage links resolve and accessible UI colors pass AA contrast", () => {
  const home = source("src/app/page.tsx");
  for (const href of ["/", "/templates", "/pricing", "/privacy", "/terms"]) {
    assert.match(home + source("src/components/layout/footer.tsx"), new RegExp(`href=["']${href.replace("/", "\\/")}["']`));
  }
  for (const id of ["features", "workflow", "templates", "pricing", "faq"]) {
    assert.match(home, new RegExp(`id=["']${id}["']`));
  }

  const luminance = (hex: string) => {
    const channels = hex.match(/[\da-f]{2}/gi)!.map((value) => {
      const channel = Number.parseInt(value, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrast = (foreground: string, background: string) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  assert.ok(contrast("#5B4EE5", "#FFFFFF") >= 4.5);
  assert.ok(contrast("#706B75", "#EEF0FF") >= 4.5);
  assert.ok(contrast("#FFFFFF", "#0F766E") >= 4.5);
  assert.match(source("tailwind.config.ts"), /#5B4EE5/);
  assert.match(source("tailwind.config.ts"), /#706B75/);
  assert.match(home, /bg-teal-700[\s\S]*text-white/);
});

test("keeps the custom 404 and loading states semantically independent", () => {
  const notFound = source("src/app/not-found.tsx");
  assert.match(notFound, /export const metadata/);
  assert.match(notFound, /openGraph:\s*null/);
  assert.match(notFound, /twitter:\s*null/);
  assert.match(source("src/app/projects/[id]/export/page.tsx"), /if \(!project\)[\s\S]*<main id="main-content"/);
  assert.match(source("src/app/settings/page.tsx"), /if \(!ready \|\| !user\)[\s\S]*<main id="main-content"/);
});

test("renders an Edge-compatible social card", () => {
  const socialImage = source("src/app/opengraph-image.tsx");
  assert.match(socialImage, /1200/);
  assert.match(socialImage, /630/);
  assert.match(socialImage, /Arabic carousel design with AI/);
});

test("keeps dialogs and account menus keyboard accessible without eager motion code", () => {
  const dialog = source("src/components/ui/dialog.tsx");
  const dropdown = source("src/components/ui/dropdown.tsx");
  for (const file of [dialog, dropdown, source("src/components/layout/app-navbar.tsx"), source("src/components/ui/toast.tsx")]) {
    assert.doesNotMatch(file, /framer-motion/);
  }
  assert.match(dialog, /createPortal/);
  assert.match(dialog, /event\.key !== "Tab"/);
  assert.match(dialog, /inert/);
  assert.match(dropdown, /aria-expanded/);
  for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Escape", "Tab"]) {
    assert.match(dropdown, new RegExp(key));
  }
  assert.match(source("src/components/providers/motion-preferences.tsx"), /reducedMotion="user"/);
  assert.doesNotMatch(source("src/app/templates/layout.tsx"), /MotionPreferences/);
});

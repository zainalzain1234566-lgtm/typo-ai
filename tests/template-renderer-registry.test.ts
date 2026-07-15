import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlideRenderer } from "../src/components/carousel/slide-renderer";
import { TEMPLATE_DEFS } from "../src/lib/templates";

const registryPath = "src/components/carousel/renderers/registry.ts";

test("every template component key has a renderer", async () => {
  assert.ok(existsSync(registryPath), "renderer registry is missing");
  const { RENDERER_REGISTRY } = await import("../src/components/carousel/renderers/registry");

  const missing = TEMPLATE_DEFS
    .map((template) => template.component)
    .filter((component) => !RENDERER_REGISTRY[component]);

  assert.deepEqual(missing, []);
});

test("unknown template IDs keep the Tahrir fallback", () => {
  const props = {
    slide: { id: "fallback", type: "cover" as const, title: "عنوان", body: "وصف" },
    palette: TEMPLATE_DEFS[0].palettes[0],
    font: "tajawal" as const,
    size: "1080x1080" as const,
    brandKitSettings: {
      enabled: false,
      showLogo: false,
      showAccountName: false,
      showSlideNumber: false,
      showDisclaimer: false,
      placement: "bottom-left" as const,
    },
    brandKitData: {
      instagramHandle: "@typo.ai",
      logoDataUrl: null,
      primaryColor: TEMPLATE_DEFS[0].palettes[0].accent,
      font: "tajawal" as const,
    },
    index: 0,
    total: 1,
  };

  const fallback = renderToStaticMarkup(createElement(SlideRenderer, { ...props, templateId: "missing-template" }));
  const tahrir = renderToStaticMarkup(createElement(SlideRenderer, { ...props, templateId: "tahrir" }));
  assert.equal(fallback, tahrir);
});

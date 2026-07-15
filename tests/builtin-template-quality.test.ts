import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlideRenderer } from "../src/components/carousel/slide-renderer";
import { TEMPLATE_DEFS } from "../src/lib/templates";
import { oppositeHorizontalPlacement, templateLayoutProfile } from "../src/lib/template-layout";

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("all primary template palettes meet readable contrast", () => {
  const failures = TEMPLATE_DEFS.flatMap((template) => template.palettes
    .filter((palette) => contrast(palette.background, palette.text) < 4.5)
    .map((palette) => `${template.id}/${palette.name}`));
  assert.deepEqual(failures, []);
});

test("layout profiles give story slides more vertical space and safer transforms", () => {
  const square = templateLayoutProfile("1080x1080");
  const portrait = templateLayoutProfile("1080x1350");
  const story = templateLayoutProfile("1080x1920");

  assert.equal(square.isStory, false);
  assert.equal(portrait.isPortrait, true);
  assert.equal(story.isStory, true);
  assert.ok(story.paddingY > portrait.paddingY && portrait.paddingY > square.paddingY);
  assert.ok(story.rotationScale < square.rotationScale);
  assert.ok(story.typeScale > portrait.typeScale && portrait.typeScale > square.typeScale);
  assert.equal(story.magazineColumns, 1);
});

test("brand metadata and slide numbers can occupy opposite corners", () => {
  assert.equal(oppositeHorizontalPlacement("top-right"), "top-left");
  assert.equal(oppositeHorizontalPlacement("top-left"), "top-right");
  assert.equal(oppositeHorizontalPlacement("bottom-right"), "bottom-left");
  assert.equal(oppositeHorizontalPlacement("bottom-left"), "bottom-right");
});

test("shared and targeted renderers use the quality baseline", () => {
  for (const templateId of ["engineering", "magazine", "rotated", "tilt", "retro"]) {
    const template = TEMPLATE_DEFS.find((candidate) => candidate.id === templateId)!;
    const render = (size: "1080x1080" | "1080x1920") => renderToStaticMarkup(createElement(SlideRenderer, {
      slide: { id: `${templateId}-${size}`, type: "content", title: "عنوان", body: "وصف" },
      templateId,
      palette: template.palettes[0],
      font: "tajawal",
      size,
      brandKitSettings: { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: false, placement: "bottom-left" },
      brandKitData: { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: template.palettes[0].accent, font: "tajawal" },
      index: 0,
      total: 1,
    }));
    const square = render("1080x1080");
    const story = render("1080x1920");

    assert.match(square, /dir="rtl"/, `${templateId} is not RTL`);
    assert.match(square, /overflow-wrap:anywhere/, `${templateId} lacks overflow containment`);
    assert.notEqual(story, square, `${templateId} is not size-aware`);
  }
});

test("migration keeps the improved bold-statement palette aligned", () => {
  const migration = readFileSync("supabase/migrations/0019_template_quality_palette.sql", "utf8");
  assert.match(migration, /bold-statement/);
  assert.match(migration, /أزرق كامل/);
  assert.match(migration, /#256A9B/);
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlideRenderer } from "../src/components/carousel/slide-renderer";
import { PALETTES, TEMPLATE_DEFS, templatesForMode } from "../src/lib/templates";

const brandKitSettings = {
  enabled: false,
  showLogo: false,
  showAccountName: false,
  showSlideNumber: false,
  showDisclaimer: false,
  placement: "bottom-left" as const,
};

const brandKitData = {
  instagramHandle: "@typo.ai",
  logoDataUrl: null,
  primaryColor: "#F59E0B",
  font: "tajawal" as const,
};

function renderTemplate(templateId: string, imageUrl?: string): string {
  return renderToStaticMarkup(createElement(SlideRenderer, {
    templateId,
    palette: PALETTES[0],
    font: "tajawal" as const,
    size: "1080x1350" as const,
    brandKitSettings,
    brandKitData,
    index: 0,
    total: 1,
    slide: {
      id: "slide-1",
      type: "content" as const,
      title: "عنوان تجريبي",
      body: "نص تجريبي",
      ...(imageUrl ? { imageUrl } : {}),
    },
  }));
}

test("Flow is a general built-in template with four palettes", () => {
  const flow = TEMPLATE_DEFS.find((template) => template.id === "flow");
  assert.ok(flow, "flow template is missing");
  assert.equal(flow.name, "تدفّق");
  assert.equal(flow.category, "general");
  assert.equal(flow.palettes.length, 4);
  assert.equal(templatesForMode("general").some((template) => template.id === "flow"), true);
  assert.equal(templatesForMode("medical").some((template) => template.id === "flow"), false);
});

test("Vibrant is a shared built-in template with four palettes", () => {
  const vibrant = TEMPLATE_DEFS.find((template) => template.id === "vibrant");
  assert.ok(vibrant, "vibrant template is missing");
  assert.equal(vibrant.name, "حيوية");
  assert.equal(vibrant.category, "shared");
  assert.equal(vibrant.palettes.length, 4);
  assert.equal(templatesForMode("general").some((template) => template.id === "vibrant"), true);
  assert.equal(templatesForMode("medical").some((template) => template.id === "vibrant"), true);
});

test("subject-image capability includes Laqta and Vibrant but excludes Flow", async () => {
  const capability = (id: string) => (
    TEMPLATE_DEFS.find((template) => template.id === id) as
      | (typeof TEMPLATE_DEFS[number] & { usesSubjectImages?: boolean })
      | undefined
  )?.usesSubjectImages;

  assert.equal(capability("laqta"), true);
  assert.equal(capability("vibrant"), true);
  assert.notEqual(capability("flow"), true);

  const templatesModule = await import("../src/lib/templates");
  const templateUsesSubjectImages = (
    templatesModule as Record<string, unknown>
  ).templateUsesSubjectImages as ((idOrSlug: string) => boolean) | undefined;
  assert.equal(typeof templateUsesSubjectImages, "function");
  assert.equal(templateUsesSubjectImages!("laqta"), true);
  assert.equal(templateUsesSubjectImages!("vibrant"), true);
  assert.equal(templateUsesSubjectImages!("flow"), false);
});

test("Flow renders its ribbon SVG and editable text tokens", () => {
  const markup = renderTemplate("flow");
  assert.match(markup, /<svg[^>]*data-flow-ribbon="true"/);
  assert.match(markup, /data-slide-title="true"/);
  assert.match(markup, /data-slide-body="true"/);
  assert.match(markup, /عنوان تجريبي/);
  assert.match(markup, /نص تجريبي/);
});

test("Vibrant renders a project image or placeholder with editable text tokens", () => {
  const withImage = renderTemplate("vibrant", "https://signed.example/image.jpg");
  const withoutImage = renderTemplate("vibrant");

  assert.match(withImage, /data-project-image="true"/);
  assert.match(withoutImage, /data-vibrant-placeholder="true"/);
  for (const markup of [withImage, withoutImage]) {
    assert.match(markup, /data-slide-title="true"/);
    assert.match(markup, /data-slide-body="true"/);
    assert.match(markup, /عنوان تجريبي/);
    assert.match(markup, /نص تجريبي/);
  }
});

test("migration seeds Flow and Vibrant with eight palettes", () => {
  const path = "supabase/migrations/0023_seed_flow_vibrant_templates.sql";
  assert.ok(existsSync(path), `${path} is missing`);
  const sql = readFileSync(path, "utf8");

  assert.match(sql, /'flow'[^;]*\b30\b[^;]*'general'/i);
  assert.match(sql, /'vibrant'[^;]*\b31\b[^;]*'shared'/i);

  const paletteBlocks = Array.from(
    sql.matchAll(/INSERT INTO (?:public\.)?template_palettes[^;]*;/gi),
    (match) => match[0],
  );
  assert.equal(paletteBlocks.length, 2, "migration must use one palette insert per template");

  for (const slug of ["flow", "vibrant"]) {
    const block = paletteBlocks.find((candidate) => (
      new RegExp(`WHERE\\s+t\\.slug\\s*=\\s*'${slug}'`, "i").test(candidate)
    ));
    assert.ok(block, `${slug} palette insert is missing`);
    const rows = block.match(/\([^()]*#[\da-f]{6}[^()]*\)/gi) ?? [];
    assert.equal(rows.length, 4, `${slug} must seed exactly four palettes`);
  }
});

test("image gates and export use the generic capability and image marker", () => {
  const projects = readFileSync("src/app/actions/projects.ts", "utf8");
  const needsImageBindings = projects.match(
    /\b(?:const|let)\s+needsImages\s*=\s*templateUsesSubjectImages\([^;\n]+\)/g,
  ) ?? [];
  assert.ok(needsImageBindings.length >= 2, "both project generation paths must bind needsImages to the template capability");
  assert.doesNotMatch(projects, /[!=]==?\s*["']laqta["']/);

  const projectImages = readFileSync("src/app/actions/project-images.ts", "utf8");
  assert.match(
    projectImages,
    /if\s*\(\s*!project\s*\|\|\s*!templateUsesSubjectImages\(\s*template\?\.slug\s*\)\s*\)\s*return/,
    "project image actions must reject templates through the capability helper",
  );
  assert.doesNotMatch(projectImages, /[!=]==?\s*["']laqta["']/);

  const editor = readFileSync("src/app/projects/[id]/edit/page.tsx", "utf8");
  const inlineUiConditions = editor.match(
    /\{\s*templateUsesSubjectImages\(\s*project\.settings\.templateId\s*\)\s*&&/g,
  )?.length ?? 0;
  const editorBinding = editor.match(
    /\bconst\s+(\w+)\s*=\s*templateUsesSubjectImages\(\s*project\.settings\.templateId\s*\)/,
  );
  const boundUiConditions = editorBinding
    ? editor.match(new RegExp(`\\{\\s*${editorBinding[1]}\\s*&&`, "g"))?.length ?? 0
    : 0;
  assert.ok(inlineUiConditions + boundUiConditions >= 2, "editor image UI conditions must use the template capability");
  assert.doesNotMatch(editor, /[!=]==?\s*["']laqta["']/);

  const exportPage = readFileSync("src/app/projects/[id]/export/page.tsx", "utf8");
  const refreshStart = exportPage.indexOf("const refreshProjectImageUrls");
  const refreshEnd = exportPage.indexOf("const exportErrorDescription", refreshStart);
  assert.ok(refreshStart >= 0 && refreshEnd > refreshStart, "signed URL refresh block is missing");
  const refreshBlock = exportPage.slice(refreshStart, refreshEnd);
  assert.match(
    refreshBlock,
    /if\s*\(\s*!templateUsesSubjectImages\(\s*project\.settings\.templateId\s*\)\s*\)\s*return\s*;/,
    "signed URL refresh must use the template capability helper",
  );
  assert.match(refreshBlock, /["']\[data-project-image\]["']/);
  assert.doesNotMatch(exportPage, /[!=]==?\s*["']laqta["']/);

  const exportSource = readFileSync("src/lib/export.ts", "utf8");
  assert.match(exportSource, /img\[data-project-image\]/);
  assert.doesNotMatch(exportPage, /data-laqta-image/);
  assert.doesNotMatch(exportSource, /data-laqta-image/);
});

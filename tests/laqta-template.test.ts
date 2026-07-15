import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlideRenderer } from "../src/components/carousel/slide-renderer";
import { mapSlide } from "../src/lib/db-mappers";
import { inlineImagesForExport, waitForImages } from "../src/lib/export";
import {
  buildPexelsSearchUrl,
  hasSupportedImageSignature,
} from "../src/lib/services/pexels";
import { getTemplate, templatesForMode } from "../src/lib/templates";

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

test("Laqta is a shared built-in template with four palettes", () => {
  assert.equal(templatesForMode("general").some((template) => template.id === "laqta"), true);
  assert.equal(templatesForMode("medical").some((template) => template.id === "laqta"), true);

  const template = getTemplate("laqta");
  assert.equal(template.name, "لقطة");
  assert.equal(template.category, "shared");
  assert.equal(template.palettes.length, 4);
});

test("slide image metadata maps without persisting signed URLs", () => {
  const slide = mapSlide({
    id: "slide-1",
    slide_type: "content",
    title: "عنوان",
    body: "وصف",
    image_path: "user/asset.jpg",
    image_source: "pexels",
    image_query: "modern architecture",
    image_source_id: "123",
    image_source_url: "https://www.pexels.com/photo/123",
    image_photographer: "Photographer",
    image_photographer_url: "https://www.pexels.com/@photographer",
    image_alt: "Modern architecture",
    image_focal_position: "top",
    image_url: "https://signed.example/image.jpg",
  });

  assert.equal(slide.imagePath, "user/asset.jpg");
  assert.equal(slide.imageUrl, "https://signed.example/image.jpg");
  assert.equal(slide.imageSource, "pexels");
  assert.equal(slide.imageQuery, "modern architecture");
  assert.equal(slide.imageFocalPosition, "top");
});

test("Laqta renders a full-bleed positioned image and a safe placeholder", () => {
  const template = getTemplate("laqta");
  const common = {
    templateId: "laqta",
    palette: template.palettes[0],
    font: "tajawal" as const,
    size: "1080x1350" as const,
    brandKitSettings,
    brandKitData,
    index: 0,
    total: 1,
  };

  const withImage = renderToStaticMarkup(createElement(SlideRenderer, {
    ...common,
    slide: {
      id: "slide-1",
      type: "cover" as const,
      title: "عنوان تجريبي",
      body: "وصف تجريبي",
      imageUrl: "https://signed.example/image.jpg",
      imageFocalPosition: "top" as const,
    },
  }));
  assert.match(withImage, /data-project-image="true"/);
  assert.doesNotMatch(withImage, /data-laqta-image/);
  assert.match(withImage, /object-position:top center/);
  assert.match(withImage, /data-slide-title="true"/);
  assert.match(withImage, /data-slide-body="true"/);

  const withoutImage = renderToStaticMarkup(createElement(SlideRenderer, {
    ...common,
    slide: { id: "slide-2", type: "content" as const, title: "عنوان", body: "وصف" },
  }));
  assert.match(withoutImage, /data-laqta-placeholder="true"/);
});

test("Pexels search uses the official API and validates supported image signatures", () => {
  const url = new URL(buildPexelsSearchUrl("  modern clinic  ", 8));
  assert.equal(url.origin, "https://api.pexels.com");
  assert.equal(url.pathname, "/v1/search");
  assert.equal(url.searchParams.get("query"), "modern clinic");
  assert.equal(url.searchParams.get("orientation"), "portrait");
  assert.equal(url.searchParams.get("per_page"), "8");
  assert.throws(() => buildPexelsSearchUrl("", 8));

  assert.equal(hasSupportedImageSignature(new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg"), true);
  assert.equal(hasSupportedImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png"), true);
  assert.equal(hasSupportedImageSignature(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]), "image/webp"), true);
  assert.equal(hasSupportedImageSignature(new Uint8Array([0x3c, 0x73, 0x76, 0x67]), "image/jpeg"), false);
});

test("Laqta migration seeds shared template, image fields, private storage, and duplication", () => {
  const path = "supabase/migrations/0022_laqta_image_template.sql";
  assert.ok(existsSync(path));
  const sql = readFileSync(path, "utf8");

  assert.match(sql, /'laqta'[\s\S]*'لقطة'[\s\S]*'shared'/);
  assert.match(sql, /category IN \('medical', 'general', 'shared'\)/i);
  for (const column of [
    "image_path", "image_source", "image_query", "image_source_id", "image_source_url",
    "image_photographer", "image_photographer_url", "image_alt", "image_focal_position",
  ]) {
    assert.match(sql, new RegExp(`\\b${column}\\b`, "i"));
  }
  assert.match(sql, /'project-images'[\s\S]*false[\s\S]*8388608/i);
  assert.match(sql, /storage\.foldername\(name\)/i);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.duplicate_project/i);
});

test("editor and export expose image controls and wait for image loading", () => {
  const editor = readFileSync("src/app/projects/[id]/edit/page.tsx", "utf8");
  const controls = readFileSync("src/components/carousel/slide-image-controls.tsx", "utf8");
  const exportSource = readFileSync("src/lib/export.ts", "utf8");

  assert.match(editor, /توليد الصور الناقصة/);
  assert.match(controls, /استبدال الصورة/);
  assert.match(controls, /رفع صورة/);
  assert.match(controls, /Photos provided by/);
  assert.match(exportSource, /waitForImages/);
  assert.match(exportSource, /querySelectorAll\("img"\)/);
});

test("generation requests per-slide image queries and image actions enforce ownership", () => {
  const generation = readFileSync("src/lib/services/generation.ts", "utf8");
  const actions = readFileSync("src/app/actions/project-images.ts", "utf8");
  const signedUrls = readFileSync("src/lib/slide-images.ts", "utf8");
  const nextConfig = readFileSync("next.config.mjs", "utf8");

  assert.match(generation, /needsImages/);
  assert.match(generation, /image_query/);
  assert.match(generation, /محايدة وغير دموية أو صادمة/);
  assert.match(actions, /\.eq\("user_id", user\.id\)/);
  assert.match(actions, /getPexelsPhoto\(photoId\)/);
  assert.match(actions, /hasSupportedImageSignature/);
  assert.match(signedUrls, /createSignedUrls/);
  assert.match(nextConfig, /bodySizeLimit:\s*"9mb"/);
});

test("export inlines remote images and rejects broken images instead of producing blank PNGs", async () => {
  const originalFetch = globalThis.fetch;
  const image = {
    src: "https://example.test/signed-image.jpg?token=abc",
    currentSrc: "",
    srcset: "preview.jpg 1x",
    complete: true,
    naturalWidth: 640,
    decode: async () => {},
  };
  const element = { querySelectorAll: () => [image] } as unknown as HTMLElement;

  globalThis.fetch = async () => new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
    status: 200,
    headers: { "content-type": "image/jpeg" },
  });
  try {
    await inlineImagesForExport(element);
    assert.match(image.src, /^data:image\/jpeg;base64,/);
    assert.equal(image.srcset, "");
  } finally {
    globalThis.fetch = originalFetch;
  }

  const broken = {
    complete: true,
    naturalWidth: 0,
    addEventListener: () => {},
  };
  await assert.rejects(
    waitForImages({ querySelectorAll: () => [broken] } as unknown as HTMLElement),
    /تعذر تضمين صورة الشريحة/,
  );
});

test("Laqta cover cropping honors every focal position for every canvas size", async () => {
  const exportModule = await import("../src/lib/export");
  const calculateCoverCrop = (exportModule as Record<string, unknown>).calculateCoverCrop as
    | ((sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number, objectPosition: string) => {
      sx: number; sy: number; sw: number; sh: number;
    })
    | undefined;
  assert.equal(typeof calculateCoverCrop, "function");

  const closeTo = (actual: number, expected: number) =>
    assert.ok(Math.abs(actual - expected) < 0.001, `${actual} != ${expected}`);

  for (const { w, h } of [
    { w: 1080, h: 1080 },
    { w: 1080, h: 1350 },
    { w: 1080, h: 1920 },
  ]) {
    const horizontalCropWidth = 1200 * (w / h);
    const left = calculateCoverCrop!(2400, 1200, w, h, "center left");
    const centeredHorizontal = calculateCoverCrop!(2400, 1200, w, h, "center center");
    const right = calculateCoverCrop!(2400, 1200, w, h, "center right");
    closeTo(left.sx, 0);
    closeTo(centeredHorizontal.sx, (2400 - horizontalCropWidth) / 2);
    closeTo(right.sx, 2400 - horizontalCropWidth);
    closeTo(left.sw, horizontalCropWidth);

    const verticalCropHeight = 900 / (w / h);
    const top = calculateCoverCrop!(900, 2400, w, h, "top center");
    const centeredVertical = calculateCoverCrop!(900, 2400, w, h, "center center");
    const bottom = calculateCoverCrop!(900, 2400, w, h, "bottom center");
    closeTo(top.sy, 0);
    closeTo(centeredVertical.sy, (2400 - verticalCropHeight) / 2);
    closeTo(bottom.sy, 2400 - verticalCropHeight);
    closeTo(top.sh, verticalCropHeight);
  }
});

test("Laqta export captures a transparent overlay then composites it above the photo", () => {
  const source = readFileSync("src/lib/export.ts", "utf8");
  assert.match(source, /querySelector<HTMLImageElement>\("img\[data-project-image\]"\)/);
  assert.match(source, /async function loadProjectImageBackground[\s\S]*const source = image\.src \|\| image\.currentSrc/);
  assert.match(source, /filter:\s*\(node\)\s*=>\s*node !== projectImage/);
  assert.doesNotMatch(source, /data-laqta-image|loadLaqtaBackground|\blaqtaImage\b/);
  assert.match(source, /baseSlide\.style\.backgroundColor = "transparent"/);
  assert.match(source, /finally\s*{[\s\S]*baseSlide\.style\.backgroundColor = previousBackgroundColor/);
  assert.match(source, /URL\.revokeObjectURL\(background\.objectUrl\)/);

  const photoDraw = source.indexOf("context.drawImage(background.image");
  const overlayDraw = source.indexOf("context.drawImage(overlayImage");
  assert.ok(photoDraw >= 0 && overlayDraw > photoDraw, "photo must be drawn before the overlay");
});

test("the shared export gate prevents overlap and releases the queue after failure", async () => {
  const exportModule = await import("../src/lib/export");
  const runExportSerially = (exportModule as Record<string, unknown>).runExportSerially as
    | (<T>(task: () => Promise<T>) => Promise<T>)
    | undefined;
  assert.equal(typeof runExportSerially, "function");

  const events: string[] = [];
  let releaseFirst!: () => void;
  const holdFirst = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = runExportSerially!(async () => {
    events.push("first:start");
    await holdFirst;
    events.push("first:end");
    throw new Error("first failed");
  });
  const firstFailure = assert.rejects(first, /first failed/);
  const second = runExportSerially!(async () => {
    events.push("second:start");
    return "second complete";
  });

  await Promise.resolve();
  assert.deepEqual(events, ["first:start"]);
  releaseFirst();
  await firstFailure;
  assert.equal(await second, "second complete");
  assert.deepEqual(events, ["first:start", "first:end", "second:start"]);

  const source = readFileSync("src/lib/export.ts", "utf8");
  assert.match(source, /return runExportSerially\(\(\) => captureSlideToPng\(element, size\)\)/);
});

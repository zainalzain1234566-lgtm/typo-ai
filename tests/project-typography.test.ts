import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { SlideRenderer } from "../src/components/carousel/slide-renderer";
import { createBlankProject, mapProject, projectToCreateInput } from "../src/lib/db-mappers";
import { TEMPLATE_DEFS } from "../src/lib/templates";

test("legacy projects map their current font and scale to both text roles", () => {
  const project = mapProject({
    id: "p", title: "Title", folder_id: null, content_type: "تعليمي",
    target_audience: null, content_level: "مبتدئ", tone: "مبسطة",
    language: "العربية الفصحى", size: "portrait", slide_count: 6,
    cta_type: null, font_family: "cairo", font_size_scale: 1.2,
    use_brand_kit: false, show_logo: false, show_account_name: false,
    show_slide_number: false, logo_position: "bottom-left", status: "in_progress",
    is_favorite: false, requires_medical_review: false,
    created_at: "2026-01-01", updated_at: "2026-01-01",
  }, []);

  assert.equal(project.settings.titleFont, "cairo");
  assert.equal(project.settings.bodyFont, "cairo");
  assert.equal(project.settings.titleFontSizeScale, 1.2);
  assert.equal(project.settings.bodyFontSizeScale, 1.2);
  assert.equal(project.settings.titleTextAlign, "auto");
  assert.equal(project.settings.bodyTextAlign, "auto");
});

test("new project typography is included in persistence input", () => {
  const project = createBlankProject();
  project.settings.titleFont = "ibm";
  project.settings.bodyFont = "cairo";
  project.settings.titleFontSizeScale = 1.25;
  project.settings.bodyFontSizeScale = 0.9;
  project.settings.titleTextAlign = "center";
  project.settings.bodyTextAlign = "right";

  const input = projectToCreateInput(project, {
    tahrir: { id: "00000000-0000-0000-0000-000000000001", palettes: { p1: "00000000-0000-0000-0000-000000000002" } },
  });

  assert.equal(input?.title_font_family, "ibm-plex-sans-arabic");
  assert.equal(input?.font_family, "cairo");
  assert.equal(input?.title_font_size_scale, 1.25);
  assert.equal(input?.font_size_scale, 0.9);
  assert.equal(input?.title_text_align, "center");
  assert.equal(input?.body_text_align, "right");
});

test("renderer and UI expose independent title and body controls", () => {
  const renderer = readFileSync("src/components/carousel/slide-renderer.tsx", "utf8");
  const controls = readFileSync("src/components/carousel/typography-controls.tsx", "utf8");
  const styles = readFileSync("src/app/globals.css", "utf8");

  assert.match(renderer, /--slide-title-font/);
  assert.match(renderer, /--slide-title-size/);
  assert.match(renderer, /data-slide-title/);
  assert.match(renderer, /data-slide-body/);
  assert.equal(renderer.match(/\{slide\.title\}/g)?.length, renderer.match(/<TitleText>\{slide\.title\}<\/TitleText>/g)?.length);
  assert.equal(renderer.match(/\{slide\.body\}/g)?.length, renderer.match(/<BodyText>\{slide\.body\}<\/BodyText>/g)?.length);
  assert.match(styles, /data-title-align="right"/);
  assert.match(styles, /data-body-align="left"/);
  assert.match(controls, /العنوان الرئيسي/);
  assert.match(controls, /الوصف/);
  assert.match(controls, /تلقائي/);
});

test("all built-in templates render split typography for every slide type and size", () => {
  const missingTitles: string[] = [];
  const unmarkedBodies: string[] = [];
  for (const template of TEMPLATE_DEFS) {
    for (const size of ["1080x1080", "1080x1350", "1080x1920"] as const) {
      for (const type of ["cover", "content", "ending"] as const) {
        const html = renderToStaticMarkup(createElement(SlideRenderer, {
          slide: { id: `${template.id}-${size}-${type}`, type, title: "عنوان تجريبي", body: "وصف تجريبي\n• نقطة أولى" },
          templateId: template.id,
          palette: template.palettes[0],
          font: "cairo",
          titleFont: "ibm",
          bodyFont: "tajawal",
          titleFontSizeScale: 1.3,
          bodyFontSizeScale: 0.8,
          titleTextAlign: "left",
          bodyTextAlign: "right",
          size,
          brandKitSettings: { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: false, placement: "bottom-left" },
          brandKitData: { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: template.palettes[0].accent, font: "tajawal" },
          index: 0,
          total: 1,
        }));

        const caseName = `${template.id}/${size}/${type}`;
        if (html.includes("عنوان تجريبي") && !/data-slide-title="true"/.test(html)) missingTitles.push(caseName);
        if (html.includes("وصف تجريبي") || html.includes("نقطة أولى")) {
          if (!/data-slide-body="true"/.test(html)) unmarkedBodies.push(caseName);
        }
        assert.match(html, /data-title-align="left"/);
        assert.match(html, /data-body-align="right"/);
      }
    }
  }
  assert.deepEqual(missingTitles, []);
  assert.deepEqual(unmarkedBodies, []);
});

test("migration preserves and duplicates split typography", () => {
  const path = "supabase/migrations/0021_split_project_typography.sql";
  assert.ok(existsSync(path));
  const sql = readFileSync(path, "utf8");

  for (const column of ["title_font_family", "title_font_size_scale", "title_text_align", "body_text_align"]) {
    assert.match(sql, new RegExp(`\\b${column}\\b`, "i"));
  }
  assert.match(sql, /title_font_family\s*=\s*font_family/i);
  assert.match(sql, /title_font_size_scale\s*=\s*font_size_scale/i);
  assert.match(sql, /title_text_align IN \('auto', 'right', 'center', 'left'\)/i);
  assert.match(sql, /title_font_size_scale BETWEEN 0\.8 AND 1\.3/i);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.duplicate_project/i);
  assert.match(sql, /font_size_scale[\s\S]*title_font_family[\s\S]*title_font_size_scale/i);
});

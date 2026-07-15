import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("template selection resets its palette and isolates inactive thumbnails", async () => {
  const templatesModulePath = "../src/lib/templates.ts";
  const dbMappersModulePath = "../src/lib/db-mappers.ts";
  const templates = await import(templatesModulePath);
  const dbMappers = await import(dbMappersModulePath);
  const settingsForTemplateSelection = (templates as Record<string, unknown>).settingsForTemplateSelection;
  const paletteForTemplateThumbnail = (templates as Record<string, unknown>).paletteForTemplateThumbnail;

  assert.equal(typeof settingsForTemplateSelection, "function", "template selection helper is missing");
  assert.equal(typeof paletteForTemplateThumbnail, "function", "thumbnail palette helper is missing");

  const selectedTemplate = templates.getTemplate("tahrir");
  const inactiveTemplate = templates.getTemplate("shabaka");
  const settings = (settingsForTemplateSelection as Function)(
    { templateId: "tahrir", paletteId: "p4", untouched: true },
    selectedTemplate,
  );

  assert.deepEqual(settings, {
    templateId: selectedTemplate.id,
    paletteId: selectedTemplate.palettes[0].id,
    untouched: true,
  });

  assert.equal(
    (paletteForTemplateThumbnail as Function)(selectedTemplate, selectedTemplate.id, "p3").id,
    "p3",
  );
  assert.equal(
    (paletteForTemplateThumbnail as Function)(inactiveTemplate, selectedTemplate.id, "p3").id,
    inactiveTemplate.palettes[0].id,
  );

  const project = dbMappers.createBlankProject();
  project.settings = (settingsForTemplateSelection as Function)(project.settings, selectedTemplate);
  const persisted = dbMappers.projectToUpdateInput(project, {
    [selectedTemplate.id]: {
      id: "template-uuid",
      palettes: { [selectedTemplate.palettes[0].id]: "first-palette-uuid" },
    },
  });
  assert.equal(persisted?.template_id, "template-uuid");
  assert.equal(persisted?.palette_id, "first-palette-uuid");
});

test("editor and wizard wire the shared template and brand policies", () => {
  const editor = readFileSync("src/app/projects/[id]/edit/page.tsx", "utf8");
  const wizard = readFileSync("src/app/projects/new/page.tsx", "utf8");
  const templateDialog = editor.slice(editor.indexOf("function TemplateDialog"), editor.indexOf("function BrandDialog"));
  const wizardExport = wizard.slice(wizard.indexOf("function Step6Export"));

  assert.match(templateDialog, /onClick=\{\(\) => update\(\{ settings: settingsForTemplateSelection\(project\.settings, t\) \}\)\}/);
  assert.doesNotMatch(templateDialog, /settingsForTemplateSelection\([^\n]+onClose\(\)/);
  assert.match(templateDialog, /onClick=\{onClose\}>تم<\/Button>/);
  assert.match(wizard, /onClick=\{\(\) => updateSettings\(settingsForTemplateSelection\(project\.settings, t\)\)\}/);
  assert.match(wizard, /<Step6Export project=\{project\} brandKit=\{brandKit\}/);
  assert.match(wizardExport, /paletteWithBrandAccent\(basePal, project\.settings\.brandKit\.enabled, brandKit\.primaryColor, DEFAULT_ACCENT_COLOR\)/);
  assert.match(wizardExport, /brandKitData=\{brandKitData\}/);
});

test("main editor preview width respects both its width and height caps", async () => {
  const templatesModulePath = "../src/lib/templates.ts";
  const templates = await import(templatesModulePath);
  const editorPreviewWidth = (templates as Record<string, unknown>).editorPreviewWidth;

  assert.equal(typeof editorPreviewWidth, "function", "editor preview sizing helper is missing");
  assert.equal((editorPreviewWidth as Function)("1080x1080"), 480);
  assert.equal((editorPreviewWidth as Function)("1080x1350"), 448);
  assert.equal((editorPreviewWidth as Function)("1080x1920"), 315);
});

test("saved brand accent applies only when the project brand kit is enabled", async () => {
  const templatesModulePath = "../src/lib/templates.ts";
  const templates = await import(templatesModulePath);
  const paletteWithBrandAccent = (templates as Record<string, unknown>).paletteWithBrandAccent;
  const basePalette = templates.getPalette("tahrir", "p1");

  assert.equal(typeof paletteWithBrandAccent, "function", "brand palette helper is missing");
  assert.strictEqual((paletteWithBrandAccent as Function)(basePalette, false, "#123456", "#5B4EE5"), basePalette);
  assert.strictEqual((paletteWithBrandAccent as Function)(basePalette, true, "#5B4EE5", "#5B4EE5"), basePalette);
  assert.deepEqual((paletteWithBrandAccent as Function)(basePalette, true, "#123456", "#5B4EE5"), {
    ...basePalette,
    accent: "#123456",
  });
});

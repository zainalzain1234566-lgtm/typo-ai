import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { RENDERER_REGISTRY } from "../src/components/carousel/renderers/registry";
import { contentModeFromValue, defaultTemplateForMode, shouldShowMedicalDisclaimer } from "../src/lib/content-mode";
import { getTemplate, templatesForMode } from "../src/lib/templates";

test("uses general mode and a general template for unknown values", () => {
  assert.equal(contentModeFromValue(undefined), "general");
  assert.equal(contentModeFromValue("anything"), "general");
  assert.equal(defaultTemplateForMode("general"), "shabaka");
});

test("keeps medical mode and its default template", () => {
  assert.equal(contentModeFromValue("medical"), "medical");
  assert.equal(defaultTemplateForMode("medical"), "tahrir");
});

test("shows the medical disclaimer only for medical content", () => {
  assert.equal(shouldShowMedicalDisclaimer(false, true), false);
  assert.equal(shouldShowMedicalDisclaimer(true, false), false);
  assert.equal(shouldShowMedicalDisclaimer(true, true), true);
});

test("offers the free Engineering template only to general accounts", () => {
  assert.equal(templatesForMode("general").some((template) => template.id === "engineering"), true);
  assert.equal(templatesForMode("medical").some((template) => template.id === "engineering"), false);
  assert.equal(getTemplate("engineering").palettes.length, 4);
  assert.equal(getTemplate("missing-template").id, "tahrir");
});

test("seeds the Engineering template and all four palettes", () => {
  const sql = readFileSync("supabase/migrations/0018_seed_engineering_template.sql", "utf8");
  assert.match(sql, /'engineering'[\s\S]*'هندسي'[\s\S]*'general'/);
  assert.equal((sql.match(/\('(?:مخطط كحلي|ورق هندسي|فحمي سماوي|كوبالت أبيض)'/g) ?? []).length, 4);
});

test("connects Engineering to the renderer and filters the catalogue by account mode", () => {
  const catalogue = readFileSync("src/app/templates/page.tsx", "utf8");
  assert.ok(RENDERER_REGISTRY.engineering);
  assert.match(catalogue, /templatesForMode\(preferences\.contentMode\)/);
  assert.doesNotMatch(catalogue, /VISIBLE_TEMPLATES\.map/);
});

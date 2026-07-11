import assert from "node:assert/strict";
import test from "node:test";
import { contentModeFromValue, defaultTemplateForMode, shouldShowMedicalDisclaimer } from "../src/lib/content-mode";

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

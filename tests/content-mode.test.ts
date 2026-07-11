import assert from "node:assert/strict";
import test from "node:test";
import { contentModeFromValue, defaultTemplateForMode } from "../src/lib/content-mode";

test("uses general mode and a general template for unknown values", () => {
  assert.equal(contentModeFromValue(undefined), "general");
  assert.equal(contentModeFromValue("anything"), "general");
  assert.equal(defaultTemplateForMode("general"), "shabaka");
});

test("keeps medical mode and its default template", () => {
  assert.equal(contentModeFromValue("medical"), "medical");
  assert.equal(defaultTemplateForMode("medical"), "tahrir");
});

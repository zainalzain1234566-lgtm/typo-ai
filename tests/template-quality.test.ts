import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildTemplateRepairRequest,
  repairTemplateOnce,
  validateTemplateQuality,
  type TemplateDesignBlocks,
  type TemplateQualitySettings,
} from "../src/lib/services/template-quality";

const settings: TemplateQualitySettings = {
  width: 1080,
  height: 1350,
  showAccountName: true,
  showLogo: true,
  showSlideNumbers: true,
};

const sharedTokens = `
  <span>{{accountName}}</span>
  <img src="{{logoUrl}}" alt="">
  <span>{{slideNumber}} / {{totalSlides}}</span>
`;

const validDesign: TemplateDesignBlocks = {
  css: `.slide { width: 1080px; height: 1350px; position: relative; overflow: hidden; }`,
  htmlCover: `<div class="slide" dir="rtl"><h1>{{title}}</h1><p>{{body}}</p>${sharedTokens}</div>`,
  htmlContent: `<div class="slide" dir="rtl"><h2>{{title}}</h2><p>{{body}}</p>${sharedTokens}</div>`,
  htmlEnding: `<div class="slide" dir="rtl"><h2>{{title}}</h2><p>{{body}}</p><b>{{ctaText}}</b>${sharedTokens}</div>`,
};

test("accepts a complete RTL template system", () => {
  assert.deepEqual(validateTemplateQuality(validDesign, settings), []);
});

test("reports canvas, containment, token, and empty-layout problems", () => {
  const issues = validateTemplateQuality({
    css: `.slide { width: 900px; height: 900px; }`,
    htmlCover: `<div class="slide"><h1>{{headline}}</h1></div>`,
    htmlContent: "",
    htmlEnding: `<div class="slide" dir="rtl">{{title}}</div>`,
  }, settings);
  const codes = new Set(issues.map((issue) => issue.code));

  for (const code of [
    "INVALID_DIMENSIONS",
    "MISSING_POSITIONING",
    "MISSING_OVERFLOW",
    "MISSING_RTL_ROOT",
    "UNKNOWN_TOKEN",
    "EMPTY_LAYOUT",
    "MISSING_TOKEN",
  ] as const) assert.equal(codes.has(code), true, `missing ${code}`);
});

test("repairs an invalid template once and returns the repaired result", async () => {
  let calls = 0;
  const invalid = { ...validDesign, htmlContent: "" };
  const result = await repairTemplateOnce(invalid, settings, async (request) => {
    calls += 1;
    assert.match(request, /EMPTY_LAYOUT/);
    return validDesign;
  });

  assert.equal(calls, 1);
  assert.equal(result.repaired, true);
  assert.deepEqual(result.design, validDesign);
});

test("does not repair a valid template and never retries a failed repair", async () => {
  let validCalls = 0;
  const valid = await repairTemplateOnce(validDesign, settings, async () => {
    validCalls += 1;
    return validDesign;
  });
  assert.equal(validCalls, 0);
  assert.equal(valid.repaired, false);

  let failedCalls = 0;
  await assert.rejects(
    repairTemplateOnce({ ...validDesign, htmlEnding: "" }, settings, async () => {
      failedCalls += 1;
      return { ...validDesign, htmlEnding: "" };
    }),
    /Template quality validation failed/
  );
  assert.equal(failedCalls, 1);
});

test("builds a focused repair request from stable issue codes", () => {
  const request = buildTemplateRepairRequest([
    { code: "MISSING_OVERFLOW", message: "The .slide rule must use overflow: hidden." },
  ]);
  assert.match(request, /MISSING_OVERFLOW/);
  assert.match(request, /Return the full updated design/);
});

test("AI prompts require hierarchy, safe areas, contrast, and text fitting", () => {
  const generation = readFileSync("src/lib/services/generation.ts", "utf8");
  assert.match(generation, /clear visual hierarchy/i);
  assert.match(generation, /safe area/i);
  assert.match(generation, /contrast/i);
  assert.match(generation, /overflow or clipping/i);
});

test("server actions validate once, repair once, and settle all recorded usage", () => {
  const actions = readFileSync("src/app/actions/custom-templates.ts", "utf8");
  assert.match(actions, /repairTemplateOnce/);
  assert.match(actions, /TemplateQualityError/);
  assert.match(actions, /designResult\.status === "fulfilled"\) recordUsage\(recordedUsage, designResult\.value\.usage\)/);
  assert.match(actions, /usagePayload\(\.\.\.recordedUsage\)/);
  assert.match(actions, /providerCost\([\s\S]*recordedUsage/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasSavedSlides } from "../src/lib/template-designer-access";

test("detects legacy templates without saved slide content", () => {
  assert.equal(hasSavedSlides([]), false);
  assert.equal(hasSavedSlides(null), false);
  assert.equal(hasSavedSlides([{ slide_type: "cover" }]), true);
});

test("billing mutation RPCs are service-role only", () => {
  const sql = readFileSync("supabase/migrations/0017_harden_template_designer_billing.sql", "utf8");
  assert.match(sql, /REVOKE ALL ON FUNCTION begin_template_designer_request\(text, text, uuid\) FROM PUBLIC, anon, authenticated/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION begin_template_designer_request_internal[\s\S]*TO service_role/i);
  assert.match(sql, /ALTER TABLE template_designer_model_limits ENABLE ROW LEVEL SECURITY/i);
});

test("settlement is atomic, zero-charge on failure, and serializes versions", () => {
  const sql = readFileSync("supabase/migrations/0017_harden_template_designer_billing.sql", "utf8");
  assert.match(sql, /v_available_for_request :=[\s\S]*credit_balance_microusd[\s\S]*credit_reserved_microusd[\s\S]*v_request\.reserved_microusd/i);
  assert.match(sql, /INSUFFICIENT_FINAL_CREDIT[\s\S]*customer_cost_microusd = 0/i);
  assert.match(sql, /FROM custom_templates[\s\S]*FOR UPDATE[\s\S]*MAX\(version_number\)/i);
  assert.match(sql, /fail_template_designer_request_internal[\s\S]*provider_cost_microusd = p_provider_cost_microusd[\s\S]*customer_cost_microusd = 0/i);
});

test("server actions load the previous version before reserving an edit", () => {
  const source = readFileSync("src/app/actions/custom-templates.ts", "utf8");
  const edit = source.slice(source.indexOf("export async function editTemplateAction"));
  assert.ok(edit.indexOf('from("custom_template_versions")') < edit.indexOf('"begin_template_designer_request_internal"'));
  assert.doesNotMatch(source, /rpc as any\)\("(?:begin|complete|fail)_template_designer_request"/);
});

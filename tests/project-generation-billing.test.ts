import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import test from "node:test";

const migrationPath = "supabase/migrations/0025_project_generation_limits.sql";
const indexMigrationPath = "supabase/migrations/0026_project_generation_indexes.sql";
const accessPath = "src/lib/project-generation-access.ts";

test("project creation access prioritizes active Paid credit and otherwise uses five lifetime Free creations", async () => {
  assert.ok(existsSync(accessPath), `${accessPath} is missing`);
  const { getProjectCreationAccess, PROJECT_CREDIT_RESERVE_MICRO_USD } = await import(pathToFileURL(accessPath).href);

  assert.equal(PROJECT_CREDIT_RESERVE_MICRO_USD, 1_000_000);
  assert.deepEqual(getProjectCreationAccess({ plan: "paid", subscriptionStatus: "active", freeProjectsRemaining: 0, creditBalanceMicroUsd: 1_000_000, operation: "generate" }), { allowed: true, reason: "paid_active" });
  assert.deepEqual(getProjectCreationAccess({ plan: "paid", subscriptionStatus: "active", freeProjectsRemaining: 0, creditBalanceMicroUsd: 999_999, operation: "generate" }), { allowed: false, reason: "insufficient_credit" });
  assert.deepEqual(getProjectCreationAccess({ plan: "paid", subscriptionStatus: "active", freeProjectsRemaining: 0, creditBalanceMicroUsd: 0, operation: "duplicate" }), { allowed: true, reason: "paid_active" });
  assert.deepEqual(getProjectCreationAccess({ plan: "paid", subscriptionStatus: "expired", freeProjectsRemaining: 1, creditBalanceMicroUsd: 9_000_000, operation: "generate" }), { allowed: true, reason: "free_available" });
  assert.deepEqual(getProjectCreationAccess({ plan: "free", subscriptionStatus: "inactive", freeProjectsRemaining: 0, creditBalanceMicroUsd: 0, operation: "duplicate" }), { allowed: false, reason: "free_limit_reached" });
});

test("migration atomically reserves five Free creations and settles Paid provider cost plus twenty percent", () => {
  assert.ok(existsSync(migrationPath), `${migrationPath} is missing`);
  const sql = readFileSync(migrationPath, "utf8");

  for (const token of [
    "free_project_creations_used",
    "free_project_creations_reserved",
    "project_generation_requests",
    "begin_project_generation_request_internal",
    "complete_project_generation_request_internal",
    "fail_project_generation_request_internal",
    "project_request_id",
    "project_charge",
  ]) assert.match(sql, new RegExp(token));

  assert.match(sql, /(?:v_account\.)?free_project_creations_used\s*\+\s*(?:v_account\.)?free_project_creations_reserved\s*<\s*5/i);
  assert.match(sql, /CEIL\(p_provider_cost_microusd\s*\*\s*1\.2\)/i);
  assert.match(sql, /status\s*<>\s*'archived'/i);
  assert.match(sql, /LEAST\(5/i);
  assert.match(sql, /FOR UPDATE/i);
  assert.match(sql, /SET search_path\s*=\s*''/i);
  assert.match(sql, /REVOKE ALL ON FUNCTION (?:public\.)?begin_project_generation_request_internal[\s\S]*FROM PUBLIC, anon, authenticated/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION (?:public\.)?begin_project_generation_request_internal[\s\S]*TO service_role/i);
  assert.match(sql, /REVOKE INSERT ON (?:TABLE )?public\.projects FROM anon, authenticated/i);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.duplicate_project/i);

  assert.ok(existsSync(indexMigrationPath), `${indexMigrationPath} is missing`);
  const indexes = readFileSync(indexMigrationPath, "utf8");
  assert.match(indexes, /project_generation_requests_project_id_idx/i);
  assert.match(indexes, /credit_ledger_project_request_id_idx/i);
});

test("project actions reserve, settle, audit failures, and enrich images only after billing", () => {
  const source = readFileSync("src/app/actions/projects.ts", "utf8");
  for (const token of [
    "createAdminClient",
    "begin_project_generation_request_internal",
    "complete_project_generation_request_internal",
    "fail_project_generation_request_internal",
    "provider_usage",
    "provider_cost_microusd",
  ]) assert.match(source, new RegExp(token));

  const settlement = source.indexOf("complete_project_generation_request_internal");
  const imageEnrichment = source.indexOf("populateMissingSlideImages", settlement);
  assert.ok(settlement > 0 && imageEnrichment > settlement, "project images must run after successful billing settlement");
});

test("application context and public UI expose remaining Free creations and Paid usage pricing", () => {
  const context = readFileSync("src/lib/app-context.tsx", "utf8");
  const projects = readFileSync("src/app/projects/page.tsx", "utf8");
  const wizard = readFileSync("src/app/projects/new/page.tsx", "utf8");
  const pricing = readFileSync("src/app/pricing/page.tsx", "utf8");

  assert.match(context, /freeProjectsRemaining/);
  assert.match(context, /free_project_creations_used/);
  assert.match(context, /free_project_creations_reserved/);
  assert.match(projects, /مشاريع متبقية/);
  assert.match(wizard, /مشاريع متبقية/);
  assert.match(pricing, /خمسة مشاريع مدى الحياة/);
  assert.match(pricing, /تكلفة[^\n]*الفعلية[^\n]*20%/);
});

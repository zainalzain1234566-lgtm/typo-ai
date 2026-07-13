import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "supabase/migrations/0020_fix_new_user_trigger_search_path.sql";

test("signup trigger uses an empty search path and qualified tables", () => {
  assert.ok(existsSync(migrationPath), "migration 0020 must exist");

  const sql = readFileSync(migrationPath, "utf8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)/i);
  assert.match(sql, /SECURITY DEFINER\s+SET search_path = ''/i);

  for (const table of [
    "profiles",
    "brand_kits",
    "user_preferences",
    "account_usage",
    "account_entitlements",
  ]) {
    assert.match(sql, new RegExp(`INSERT INTO public\\.${table}\\b`, "i"));
  }
});

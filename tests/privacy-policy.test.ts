import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(path, "utf8");

test("privacy policy discloses Typo AI data practices and a privacy contact", () => {
  const policy = source("src/app/privacy/page.tsx");
  const seo = source("src/lib/seo.ts");

  for (const text of [
    "15 يوليو 2026",
    "zainalabdinmuneam@gmail.com",
    "Supabase",
    "OpenRouter",
    "Pexels",
    "Telegram",
    "البيانات التي نجمعها",
    "الاحتفاظ بالبيانات وحذفها",
    "المحتوى الطبي والحساس",
  ]) {
    assert.match(policy, new RegExp(text));
  }

  assert.match(policy, /href="mailto:zainalabdinmuneam@gmail\.com"/);
  assert.match(policy, /href="\/settings"/);
  assert.doesNotMatch(policy, /قيد الإعداد/);

  const privacySeo = seo.match(/"\/privacy": \{[\s\S]*?\n  \},/)?.[0] ?? "";
  assert.match(privacySeo, /توضح سياسة خصوصية Typo AI/);
  assert.doesNotMatch(privacySeo, /النص القانوني الكامل قيد الإعداد/);
});

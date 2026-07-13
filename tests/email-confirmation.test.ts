import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("signup confirmation uses an email link and exchanges its auth code", () => {
  const signup = read("src/app/signup/page.tsx");
  const verify = read("src/app/verify-email/page.tsx");
  const callbackPath = "src/app/auth/callback/route.ts";

  assert.match(signup, /emailRedirectTo:\s*`\$\{window\.location\.origin\}\/auth\/callback`/);
  assert.match(signup, /sessionStorage\.setItem\("pendingSignupEmail", data\.email\)/);

  assert.doesNotMatch(verify, /verifyOtp|one-time-code|رمز التحقق/);
  assert.match(verify, /auth\.resend/);
  assert.match(verify, /emailRedirectTo:\s*`\$\{window\.location\.origin\}\/auth\/callback`/);

  assert.ok(existsSync(callbackPath), "the auth callback route must exist");
  const callback = read(callbackPath);
  assert.match(callback, /exchangeCodeForSession\(code\)/);
  assert.match(callback, /\/projects/);
  assert.match(callback, /\/login\?error=email-confirmation/);
});

test("email rate limits have a friendly Arabic message", () => {
  const errors = read("src/lib/error-messages.ts");
  assert.match(errors, /rate limit\|too many requests/i);
  assert.match(errors, /طلبات كثيرة|رسائل كثيرة/);
});

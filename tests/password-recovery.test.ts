import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => existsSync(path) ? readFileSync(path, "utf8") : "";

test("password recovery exchanges the email code before opening the reset form", () => {
  const forgot = read("src/app/forgot-password/page.tsx");
  const action = read("src/app/actions/auth.ts");
  const recovery = read("src/app/auth/recovery/route.ts");

  assert.match(forgot, /redirectTo:\s*`\$\{window\.location\.origin\}\/auth\/recovery`/);
  assert.match(action, /\/auth\/recovery/);
  assert.match(recovery, /exchangeCodeForSession\(code\)/);
  assert.match(recovery, /destination = "\/reset-password"/);
  assert.match(recovery, /NextResponse\.redirect\(new URL\(destination/);
  assert.match(recovery, /\/forgot-password\?error=invalid-recovery-link/);
});

test("password recovery validates the session and never exposes raw auth errors", () => {
  const reset = read("src/app/reset-password/page.tsx");
  const forgot = read("src/app/forgot-password/page.tsx");
  const login = read("src/app/login/page.tsx");

  assert.match(reset, /auth\.getUser\(\)/);
  assert.match(reset, /disabled=\{loading \|\| !sessionReady\}/);
  assert.match(reset, /auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(reset, /\/login\?message=password-updated/);
  assert.doesNotMatch(reset, /setError\(error\.message\)/);
  assert.match(forgot, /friendlyAuthError\(error\.message\)/);
  assert.match(forgot, /invalid-recovery-link/);
  assert.match(login, /password-updated/);
});

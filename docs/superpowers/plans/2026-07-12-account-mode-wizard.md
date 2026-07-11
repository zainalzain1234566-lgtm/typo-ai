# Account Mode Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give General and Medical users distinct carousel-creation experiences while preserving medical review safeguards.

**Architecture:** Persist an account-level `content_mode` in `user_preferences`; the app context drives mode-specific UI and the server derives medical review from the saved preference. Existing projects continue to use `requires_medical_review`.

**Tech Stack:** Next.js App Router, TypeScript, Supabase migrations/Auth/RLS, React, Zod, Node test runner.

## Global Constraints

- Arabic RTL copy; English only in developer-facing artifacts.
- No new runtime or test dependency.
- General users never receive medical prompts, specialty controls, or disclaimers.
- Medical exports and Telegram sends reject `blocked` review results.

---

### Task 1: Persist and expose account mode

**Files:**
- Create: `supabase/migrations/0014_account_content_mode.sql`
- Create: `src/lib/content-mode.ts`
- Create: `tests/content-mode.test.ts`
- Modify: `src/types/database.ts`, `src/lib/app-context.tsx`

- [ ] Write a Node-test-compatible TypeScript test for default/general and medical mode normalization.
- [ ] Run the compiled test and confirm it fails because `content-mode` is missing.
- [ ] Add `ContentMode`, mode helpers, migration, generated-type fields, and context loading.
- [ ] Re-run the compiled test and confirm it passes.

### Task 2: Collect and edit mode

**Files:**
- Modify: `src/app/signup/page.tsx`, `src/app/actions/auth.ts`, `src/lib/validation/auth.ts`, `src/app/settings/page.tsx`

- [ ] Add required General/Medical selection to signup metadata and validation.
- [ ] Add editable mode selection to Settings via the existing preferences action.
- [ ] Keep existing accounts medical through the migration; new signup metadata wins.

### Task 3: Split the creation flow and AI behavior

**Files:**
- Modify: `src/app/projects/new/page.tsx`, `src/lib/templates.ts`, `src/lib/services/generation.ts`, `src/app/actions/projects.ts`

- [ ] Filter wizard types, templates, specialty, disclaimer defaults, and default template by account mode.
- [ ] Generate general carousels with a general prompt and skip medical review.
- [ ] Derive `requires_medical_review` from saved account mode on the server.

### Task 4: Enforce medical export safety and neutral public pages

**Files:**
- Modify: `src/app/projects/[id]/export/page.tsx`, `src/app/actions/projects.ts`, `src/app/actions/telegram.ts`, `src/app/templates/page.tsx`, `src/app/page.tsx`

- [ ] Refuse export and Telegram delivery for blocked medical projects in UI and server actions.
- [ ] Show both template groups publicly; filter authenticated wizard/editor choices by account mode.
- [ ] Replace medical-first landing copy and examples with general carousel copy.

### Task 5: Verify and document

- [ ] Run the account-mode test, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Review the diff for removed medical assumptions in general mode and retained blocked-export enforcement.
- [ ] Commit the implementation on `codex/general-medical-users`.

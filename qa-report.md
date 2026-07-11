# Manual QA Report

Date: 2026-07-11  
Application: Typo AI  
Base URL: http://localhost:3000  
Tester: Senior manual QA workflow  
Scope: Read-only manual exploration; no application fixes made.

## Coverage

Visited: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/templates`, `/pricing`, `/projects`, `/projects/new`, `/projects/new?template=tahrir`, `/settings`, `/projects/1/edit`, and `/projects/1/export`.

Exercised landing FAQs, navigation, menus, template previews and use actions, all visible template previews, project wizard options and step controls, slide-count boundaries, project search and filters, folder dialog, account menu, logout, and password visibility controls. Forms were tested with empty, invalid, valid-format, long, Arabic, English, and special-character inputs where applicable.

Responsive checks were run at 375×812, 639×849, and the default 1280×720 viewport. No horizontal overflow was detected.

## Findings

### QA-001 — Medium — Landing-page generator is non-functional

- URL: http://localhost:3000/
- Steps to reproduce:
  1. Open the landing page.
  2. In the generator card, click `توليد المحتوى`.
- Expected result: The example topic should be editable or the button should start the documented generation flow.
- Actual result: The visible topic is not an input control, the click produces no navigation, state change, message, or generated content.
- Screenshot: [issue-002-generator-no-effect.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-002-generator-no-effect.png)
- Console errors: None observed for this action.
- Suggested root cause: The landing card appears to render a static example string while the button has no connected input state or action handler.

### QA-002 — Medium — Unauthorized generation is exposed as an unhandled error state

- URL: http://localhost:3000/projects/new?template=tahrir
- Steps to reproduce:
  1. Open a project from a template while unauthenticated.
  2. Complete the wizard inputs with valid-format Arabic/English/special-character data.
  3. Click `توليد المحتوى بالذكاء الاصطناعي`.
- Expected result: Redirect to login/signup or a clear localized sign-in requirement before attempting generation.
- Actual result: The wizard displays `تعذر إنشاء المحتوى` and the raw message `غير مصرح`; the page also logs an error.
- Screenshot: [issue-004-unauthorized-generation.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-004-unauthorized-generation.png)
- Console errors: `[Generate] createProjectAction failed غير مصرح`.
- Suggested root cause: The protected server action is called from an unauthenticated page without a client-side auth gate or user-friendly error mapping.

### QA-003 — Medium — “Return to settings” navigates to templates

- URL: http://localhost:3000/projects/new?template=tahrir
- Steps to reproduce:
  1. Trigger the unauthorized generation error.
  2. Click `العودة إلى الإعدادات`.
- Expected result: Navigate to `http://localhost:3000/settings`.
- Actual result: Navigate to `http://localhost:3000/templates`.
- Screenshot: [issue-004-unauthorized-generation.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-004-unauthorized-generation.png)
- Console errors: None added by the navigation.
- Suggested root cause: The error-state action is wired to the templates route instead of the settings route.

### QA-004 — High — Settings page renders blank

- URL: http://localhost:3000/settings
- Steps to reproduce:
  1. Open `/settings` directly or choose `الإعدادات` from the account menu.
- Expected result: A usable settings page with account or application settings.
- Actual result: The page is blank except for an alert landmark; no heading, controls, or navigation content is rendered.
- Screenshot: [issue-005-settings-blank.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-005-settings-blank.png)
- Console errors: None observed while loading the page.
- Suggested root cause: The settings route mounts no page content or is gated by a missing loading/auth branch.

### QA-005 — High — Verification code fields do not retain a six-digit code

- URL: http://localhost:3000/verify-email
- Steps to reproduce:
  1. Open the verification page.
  2. Enter `1`, `2`, `3`, `4`, `5`, and `6` into the six visible code boxes as a real user would.
  3. Inspect the fields before submitting.
- Expected result: Each box retains one digit and the complete six-digit code can be submitted.
- Actual result: Only the final typed digit remains in the first box; the other five boxes remain empty, so a complete code cannot be entered.
- Screenshot: [issue-006-otp-input.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-006-otp-input.png)
- Console errors: None observed for the verification interaction.
- Suggested root cause: The six inputs appear to share or overwrite one controlled value instead of updating by field index.

### QA-006 — Medium — Valid plus-addresses are rejected by signup

- URL: http://localhost:3000/signup
- Steps to reproduce:
  1. Enter `QA Test` as the name.
  2. Enter `qa+special@example.com` as the email.
  3. Enter matching valid-format passwords and accept the terms checkbox.
  4. Click `إنشاء الحساب`.
- Expected result: The RFC-valid plus-address is accepted, or a localized validation message explains a deliberate product restriction.
- Actual result: Signup remains on the form and displays the raw English backend message `Email address "qa+special@example.com" is invalid`.
- Screenshot: [issue-010-plus-email-rejected.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-010-plus-email-rejected.png)
- Console errors: None observed for this submission.
- Suggested root cause: Backend email validation/provider configuration rejects plus-addresses, and the raw provider error is surfaced without localization.

### QA-007 — Medium — Terms and privacy links are dead placeholders

- URL: http://localhost:3000/signup
- Steps to reproduce:
  1. Click `الشروط والأحكام`.
  2. Click `سياسة الخصوصية`.
- Expected result: Open the corresponding legal document or an in-page modal.
- Actual result: Both links use `href="#"`, leave the page unchanged, and open no document or modal.
- Screenshot: [issue-010-plus-email-rejected.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-010-plus-email-rejected.png)
- Console errors: None observed for either click.
- Suggested root cause: Legal links are still placeholder anchors instead of real routes or modal triggers.

### QA-008 — Medium — Icon-only controls have no accessible names

- URLs: http://localhost:3000/login, http://localhost:3000/signup, http://localhost:3000/, and http://localhost:3000/verify-email
- Steps to reproduce:
  1. Inspect the login page password visibility control and mobile menu control.
  2. Inspect the equivalent controls on signup and the verification inputs.
- Expected result: Every interactive icon-only control has an accessible name such as `aria-label`, visible text, or an associated label.
- Actual result: The menu and password-eye buttons expose no accessible name; the six verification textboxes also expose no labels or placeholders.
- Screenshot: [issue-008-unlabeled-controls.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-008-unlabeled-controls.png)
- Console errors: None observed.
- Suggested root cause: Icon buttons and OTP inputs are rendered without accessible labeling attributes.

### QA-009 — Low — Future wizard steps look enabled but are inert

- URL: http://localhost:3000/projects/new
- Steps to reproduce:
  1. Open the project wizard at step 1.
  2. Click steps 2 through 6 in the progress bar before completing step 1.
- Expected result: Future steps should either navigate consistently or be visibly disabled until prerequisites are complete.
- Actual result: The controls are enabled in the DOM and visually interactive, but clicks leave the wizard on step 1 with no explanation.
- Screenshot: [issue-009-inert-step-tabs.png](/Users/zainalabdinmuneam/typo/qa-screenshots/issue-009-inert-step-tabs.png)
- Console errors: None observed.
- Suggested root cause: Step buttons lack a disabled state or guarded-click feedback while prerequisite validation is incomplete.

## Console and network notes

- No additional console errors were observed during the landing, auth-form, template, filter, folder, or responsive checks.
- The only application error observed during testing was the unauthorized generation error recorded in QA-002.
- No failed network request was exposed in the browser UI or console during the tested flows.

## Final result

The application is broadly navigable and the main forms provide useful client-side validation, but the high-severity settings and email-verification issues block core account flows. The medium-severity generation, signup, legal-link, and accessibility issues should be addressed before release.

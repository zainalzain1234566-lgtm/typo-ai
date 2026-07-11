# General and Medical Account Modes

## Goal

Let each user choose a General or Medical account mode. The selected mode
controls the new-project wizard, template selection, AI generation, and
medical safety workflow.

## Account Mode

- Store `content_mode` in `user_preferences` as `general` or `medical`.
- Signup requires a self-selected mode and stores it in Supabase user metadata.
- The signup trigger copies that value into `user_preferences`.
- Settings lets a user change the mode later.
- Existing users are migrated to `medical`; newly created rows default to
  `general` if metadata is absent.

## Wizard and Templates

- General users see the original general content types: educational, story,
  awareness, list, steps, tips, comparison, and concept explanation.
- Medical users see the medical content types: medical awareness, myth busting,
  disease explanation, medical steps, and medical tips, plus the medical
  specialty selector.
- Shared fields (audience, level, tone, language, slide count, CTA) remain for
  both modes.
- General users see general templates; medical users see medical templates.
- Public template browsing shows both groups. Existing projects keep their
  saved template and remain editable after an account-mode change.

## Generation and Export

- The server determines whether a new project requires medical review from the
  authenticated user's saved mode, not from client input.
- General generation uses a general Arabic carousel prompt and skips the
  medical review call and disclaimer.
- Medical generation keeps the existing medical prompt, specialty data,
  disclaimer, and second-pass review.
- A medical project with review status `blocked` cannot be exported or sent to
  Telegram. The server actions enforce this rule as well as the UI.

## Presentation and Compatibility

- The public landing page becomes general carousel-product copy; medical
  capability remains visible only where it is relevant to medical accounts.
- Do not add verification, subscriptions, roles, or a second wizard.
- Use the existing `requires_medical_review` project field to preserve the
  behavior of existing projects; no project-table mode column is needed.

## Validation

- Typecheck, lint, and production build must pass.
- Manually validate each account mode's wizard options, template filter,
  generation path, and export behavior. The repository has no configured
  automated test runner, so no dependency is added solely for this change.

# DEVELOPMENT.md

> Practical guide for developing and extending the Typo AI project.

---

## 1. Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Supabase project (URL + keys)
- An OpenRouter API key

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with required variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Run database migrations
# → Go to Supabase Dashboard → SQL Editor
# → Run each file in supabase/migrations/ in order (0001 → 0012)

# Start dev server
npm run dev
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_API_KEY=your-openrouter-key
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-v4-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (default: ON)
NEXT_PUBLIC_MEDICAL_MODE=true
```

### Scripts

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run typecheck  # tsc --noEmit (type checking)
npm run lint       # ESLint
```

**Always run both after changes:**
```bash
npm run typecheck && npm run build
```

---

## 2. Code Conventions

### Language
- **All code**: TypeScript, strict mode
- **All UI text**: Arabic (RTL). User-facing strings in components and error messages are Arabic.
- **Comments**: Minimal. Only `// ponytail:` comments for deliberate simplifications.
- **No comments unless explicitly requested.**

### File Organization
- Server Actions: `"use server"` at top, in `src/app/actions/`
- Client components: `"use client"` at top
- No barrel exports — direct imports from source files
- Types co-located in `src/lib/types.ts` (frontend) and `src/types/database.ts` (DB)

### Styling
- Tailwind CSS with custom theme tokens: `accent`, `surface`, `ink` (see `tailwind.config.ts`)
- Inline styles for template components (slide-renderer.tsx) — because they render to PNG and need pixel-perfect control
- `cn()` utility from `src/lib/utils.ts` for conditional class merging

### Naming
- Components: PascalCase (`Tahrir`, `ClinicalClean`)
- Functions/variables: camelCase
- Files: kebab-case for pages, camelCase for libs
- DB columns: snake_case
- Frontend types/interfaces: PascalCase

### Server Actions Pattern
Every server action follows this structure:
```typescript
export async function someAction(input: Record<string, unknown>) {
  log("TAG", "action description", { key: input.someField });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = someSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  // ... business logic ...

  if (error) return { success: false, error: "Arabic error message" };
  revalidatePath("/some-path");
  return { success: true };
}
```

### Logger
Use `log(tag, msg, meta?)` and `logError(tag, msg, err?)` from `src/lib/logger.ts`.

Available tags: `AUTH`, `PROJECT`, `SLIDE`, `EXPORT`, `SETTINGS`, `TELEGRAM`, `MW`, `ERROR`.

Logs are suppressed in production except for `ERROR`.

---

## 3. How-To: Common Tasks

### 3.1 Add a New Template

Requires changes in 3 places:

**Step 1: `src/lib/templates.ts`**
```typescript
// 1. Add a palette array (4 palettes)
const NEW_TEMPLATE_PALETTES: Palette[] = [
  { id: "p1", name: "اسم اللوحة", background: "#...", text: "#...", accent: "#...", secondary: "#..." },
  // ... 3 more
];

// 2. Add to TEMPLATE_DEFS array
{ id: "new-template", name: "اسم القالب", description: "...", palettes: NEW_TEMPLATE_PALETTES, fonts: ["tajawal", "cairo", "ibm"], component: "new-template", category: "medical" },
```

**Step 2: `src/components/carousel/slide-renderer.tsx`**
```typescript
// 1. Add the component
const NewTemplate = forwardRef<HTMLDivElement, SlideRenderProps>(function NewTemplate(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        {/* Template content */}
      </BaseSlide>
    </div>
  );
});

// 2. Register in the renderers map inside SlideRenderer
const renderers = {
  // ... existing entries
  "new-template": NewTemplate,
};
```

**Step 3: SQL migration** (`supabase/migrations/`)
```sql
INSERT INTO templates (slug, name_ar, description_ar, component_key, sort_order, supported_sizes, supported_fonts)
VALUES ('new-template', 'اسم القالب', '...', 'new-template', 99, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('اسم', '#bg', '#txt', '#acc', '#sec', 1),
  -- ... 3 more
) AS v(name, bg, txt, acc, sec, ord)
WHERE t.slug = 'new-template'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);
```

Run the migration in Supabase Dashboard → SQL Editor.

### 3.2 Add a New Content Type

**Step 1: `src/lib/types.ts`**
```typescript
export type ContentType =
  | "تعليمي" | "قصة" | "توعوي" | "قائمة" | "خطوات" | "نصائح" | "مقارنة" | "شرح مفهوم"
  | "تفكيك الخرافات" | "شرح مرض" | "نوع جديد";
```

**Step 2: `src/lib/validation/projects.ts`**
```typescript
export const CONTENT_TYPES = [..., "نوع جديد"] as const;
```

**Step 3: `src/lib/services/generation.ts`**
```typescript
const CONTENT_TYPE_INSTRUCTIONS: Record<string, string> = {
  // ... existing
  "نوع جديد": "نوع المحتوى: نوع جديد. وصف التعليمات هنا.",
};
```

**Step 4**: Add to the wizard UI in `src/app/projects/new/page.tsx` (the content type selector).

### 3.3 Add a New Page

1. Create directory: `src/app/new-page/page.tsx`
2. If protected, add route guard — the middleware already protects `/projects` and `/settings`
3. Add to middleware `protectedRoutes` or `authRoutes` arrays in `src/lib/supabase/middleware.ts` if needed

### 3.4 Add a New Server Action

1. Create or edit file in `src/app/actions/`
2. Add `"use server"` at the top
3. Follow the Server Actions Pattern above
4. Add Zod validation in `src/lib/validation/`
5. Use `log()` / `logError()` for observability

### 3.5 Add a New Database Column

1. Write a migration SQL file in `supabase/migrations/` (idempotent: use `ADD COLUMN IF NOT EXISTS`)
2. Run it in Supabase Dashboard
3. Update `src/types/database.ts` (add to Row, Insert, Update)
4. Update relevant mapper in `src/lib/db-mappers.ts` if the column needs DB↔frontend mapping
5. Update relevant Zod schema in `src/lib/validation/`

### 3.6 Modify the AI System Prompt

Edit `SYSTEM_PROMPT` in `src/lib/services/generation.ts`.

The prompt is in Arabic and includes:
- General rules (dialect, structure, slide types)
- Medical safety rules (4 rules)
- JSON output schema

Content-type-specific instructions are in `CONTENT_TYPE_INSTRUCTIONS` (separate from the system prompt).

### 3.7 Add a Telegram Feature

Telegram integration is already built. To extend:

- **Settings UI**: `src/app/settings/page.tsx` — telegram section
- **Server actions**: `src/app/actions/telegram.ts`
- **Export button**: `src/app/projects/[id]/export/page.tsx` — "Send to Telegram" button
- **DB columns**: `user_preferences.telegram_bot_token`, `telegram_chat_id`, `telegram_enabled`
- **Token security**: Token is stored in DB, read server-side only, never sent to browser

---

## 4. Template Component Patterns

### 4.1 Basic Structure

```tsx
const MyTemplate = forwardRef<HTMLDivElement, SlideRenderProps>(function MyTemplate(
  { slide, palette, font, size, brandKitSettings, brandKitData, index, total, fontSizeScale = 1, medical }, ref
) {
  const isCover = slide.type === "cover";
  const isEnding = slide.type === "ending";

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <BaseSlide slide={slide} palette={palette} font={font} settings={brandKitSettings} data={brandKitData} index={index} total={total} fontSizeScale={fontSizeScale}>
        <div dir="rtl" style={{ padding: "80px 72px", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Content */}
        </div>
      </BaseSlide>
    </div>
  );
});
```

### 4.2 Key Helpers

| Helper | Usage |
|--------|-------|
| `fs(px, fontSizeScale)` | Returns `"{scaled}px"` — always use for font sizes |
| `fontMap[font]` | Returns CSS variable for selected font |
| `fontMap.ibm` / `fontMap.cairo` | Hardcode display fonts (overrides user selection for headlines) |
| `BaseSlide` | Universal wrapper — always use |
| `BrandOverlay` | Auto-rendered by `BaseSlide` — don't render manually |
| `SlideNumber` | Auto-rendered by `BaseSlide` |
| `DisclaimerFooter` | `variant="inline"` inside templates, `variant="overlay"` in ScaledSlide/export |
| `PhysicianMark` | Pass `medical?.specialty` — returns null if no specialty |
| `SourceBadge` | Pass `medical?.source` — returns null if no source |

### 4.3 Slide Type Branching

```tsx
{isCover && <CoverContent />}
{!isCover && !isEnding && <ContentSlide />}
{isEnding && <CTAContent />}
```

### 4.4 Body Parsing

Some templates parse `slide.body` for structured content:

- **MythFact**: Looks for `خرافة:` and `حقيقة:` prefixes, splits into myth/fact blocks
- **NumberedSteps**: Splits on `\n` — if >1 line, renders as list; otherwise single step
- **EditorialHealth**: Splits on `\n` — renders each line as a paragraph

### 4.5 RTL Considerations

- Always set `dir="rtl"` on the content wrapper
- Badges, numbers, and accents that sit "at the start" go on the **right**
- `transformOrigin: "top right"` for scaled slides
- Mixed Arabic/English: use `unicode-bidi: plaintext` where needed

---

## 5. Debugging Tips

### 5.1 Logger

The logger outputs to server console (terminal). Tags are color-coded:

```
[14:23:05.123] PROJECT  create attempt {"title":"..."}
[14:23:05.456] AUTH     signIn attempt {"email":"..."}
[14:23:06.789] ERROR    [PROJECT] generation failed — AI provider 500: ...
```

In production, only ERROR logs are shown.

### 5.2 Common Issues

**"AI_API_KEY is not set"**: Ensure `.env.local` has `AI_API_KEY` and the dev server is restarted.

**"القالب غير موجود" (Template not found)**: The template slug in code doesn't match what's seeded in the DB. Run the seed migration or check `component_key` matches.

**Slides don't render in export**: Check that `exportRefs.current` has elements. The export page renders slides off-screen at `left: -99999px` — they must be mounted.

**Fonts missing in PNG export**: `waitForFonts()` awaits `document.fonts.ready` + 200ms timeout. If fonts still don't appear, the `next/font` CSS variables may not be applied to the off-screen container.

**Medical review always returns `needs_review`**: The review AI call may be failing silently. Check server logs for `TELEGRAM` or `PROJECT` tagged errors. On parse failure, it defaults to `needs_review` (safe default).

**Telegram send fails**: Ensure the bot token and chat ID are set in Settings and `telegram_enabled` is true. The user must have sent at least one message to the bot first (Telegram requirement).

### 5.3 Type Checking

```bash
npm run typecheck   # tsc --noEmit
```

If you see type errors in `database.ts`, the generated types may be out of sync with migrations. Regenerate or manually update.

### 5.4 Build Verification

```bash
npm run build
```

This runs ESLint + type checking + static generation. All 14 routes must generate successfully.

---

## 6. Testing

**No test framework is configured.** Verification is manual:

1. `npm run typecheck` — TypeScript correctness
2. `npm run build` — Full build including static generation
3. Manual testing of the full flow: signup → create project → edit → export

For non-trivial logic (branches, loops, parsers), the ponytail convention is to leave ONE runnable check (an `assert`-based `demo()` or one `test_*.py`). Not yet applied in this codebase.

---

## 7. Deployment

### Build

```bash
npm run build
```

Produces `.next/` directory. 14 routes (12 static, 2 dynamic).

### Environment

Ensure all env vars are set in the deployment environment:
- Supabase URL + keys
- AI API key + base URL + model
- App URL (must match the deployed domain for OpenRouter `HTTP-Referer` header)
- `NEXT_PUBLIC_MEDICAL_MODE` (optional, default ON)

### Supabase

No additional configuration needed beyond running migrations. RLS policies and triggers are set up in migrations.

### Git

```bash
git remote add origin https://github.com/zainalzain12364566-lgtm/typo-ai.git
git push -u origin main
```

---

## 8. Architecture Decisions Reference

| Decision | Rationale |
|----------|-----------|
| Cookie-based auth (not token) | `@supabase/ssr` handles refresh in middleware; no client-side token management |
| Server Actions (not API routes) | Next.js-native, simpler, no separate route files |
| Single-file templates | Shared helpers, no registry file overhead, 25 templates manageable in one file |
| DB mapper layer | Isolates DB schema from frontend; frontend uses slugs not UUIDs |
| Medical mode as feature flag | Non-medical features hidden, not removed; can be toggled with env var |
| Two-pass AI (generate + review) | Content quality + safety; review is non-blocking (safe default) |
| Per-user Telegram tokens | Users bring their own bot; no app-level Telegram config needed |
| Zero-dep logger | No pino/winston dependency; 34 lines, color-coded, production-suppressed |
| Idempotent migrations (0011+) | Safe to re-run in Dashboard without errors |
| Inline styles in templates | PNG export needs pixel-perfect control; Tailwind classes don't survive `html-to-image` |

---

## 9. File Quick Reference

| Need to... | Edit this file |
|-----------|---------------|
| Add a template | `src/lib/templates.ts` + `src/components/carousel/slide-renderer.tsx` + SQL migration |
| Change AI prompt | `src/lib/services/generation.ts` |
| Add a content type | `src/lib/types.ts` + `src/lib/validation/projects.ts` + `src/lib/services/generation.ts` + `src/app/projects/new/page.tsx` |
| Change auth flow | `src/lib/supabase/middleware.ts` + `src/app/actions/auth.ts` |
| Add a DB column | SQL migration + `src/types/database.ts` + `src/lib/db-mappers.ts` + Zod schema |
| Change export | `src/lib/export.ts` + `src/app/projects/[id]/export/page.tsx` |
| Change settings | `src/app/settings/page.tsx` + `src/app/actions/auth.ts` + `src/lib/validation/settings.ts` |
| Change feature flags | `src/lib/feature-flags.ts` |
| Add a UI component | `src/components/ui/` (shadcn-style) |
| Change global styles | `src/app/globals.css` + `tailwind.config.ts` |
| Change fonts | `src/app/layout.tsx` (next/font imports) + `tailwind.config.ts` |
| Change logger | `src/lib/logger.ts` |
| Change landing page | `src/app/page.tsx` |

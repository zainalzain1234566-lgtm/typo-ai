# ARCHITECTURE.md

> Full system architecture for the Typo AI project. Read this first to understand how everything fits together.

---

## 1. What is Typo AI?

Typo AI is an Arabic-first web application for generating Instagram carousel posts using AI. A user writes a topic, configures content settings (type, audience, tone, dialect, slide count), picks a template, and the app:

1. Calls an AI model (DeepSeek via OpenRouter) to write all slide content (titles, bodies, CTAs) + caption + hashtags
2. Runs a medical accuracy review pass (second AI call) to flag diagnostic claims, drug dosages, cure claims, absolute language, unsafe advice
3. Saves everything to Supabase (PostgreSQL)
4. Renders slides as React components and exports them as PNG (single or ZIP) via `html-to-image`
5. Optionally sends exported slides to a user-configured Telegram bot

The app is currently repositioned as a **medical/health content tool** ("Medical Mode"). When medical mode is ON (default), only medical-tagged templates are visible, non-medical features (folders, favorites, stats, duplicate, extra sizes) are hidden, and the AI system prompt enforces 4 medical safety rules.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.20 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 3.4 + CSS variables for fonts |
| Animation | Framer Motion 11 |
| Forms | React Hook Form + Zod 3.24 |
| Auth + DB | Supabase (PostgreSQL + Auth + Storage + RLS) via `@supabase/ssr` 0.12 |
| AI | OpenRouter API → DeepSeek (`deepseek/deepseek-v4-flash`) |
| Export | `html-to-image` (PNG) + `jszip` (ZIP archives) |
| Icons | `lucide-react` |
| Fonts | 7 Google Fonts via `next/font/google`: Tajawal, Cairo, IBM Plex Sans Arabic, Playfair Display, Space Grotesk, IBM Plex Mono, Courier Prime |

**No test framework is configured.** Verification is `tsc --noEmit` + `next build`.

---

## 3. Directory Structure

```
typo/
├── middleware.ts                  # Auth session refresh + route guards
├── tailwind.config.ts             # Custom colors: accent, surface, ink + fonts
├── description.md                  # Arabic project description (original)
├── ARCHITECTURE.md                 # ← This file
├── DATABASE.md                    # Full DB schema + migrations reference
├── DEVELOPMENT.md                  # Dev guide, conventions, how-to-extend
├── supabase/
│   └── migrations/                 # 12 SQL migrations (0001–0012)
│       ├── 0001_tables.sql         # Core tables
│       ├── 0002_triggers.sql       # updated_at triggers + auto-profile on signup
│       ├── 0003_rls.sql            # Row Level Security policies
│       ├── 0004_storage.sql        # Storage buckets (avatars, logos, exports)
│       ├── 0005_rpcs.sql           # RPC functions (stats, reorder, duplicate)
│       ├── 0006_indexes.sql        # Performance indexes
│       ├── 0007_seed_templates.sql # 10 original templates + palettes
│       ├── 0008_increment_usage.sql # Usage counter RPC
│       ├── 0009_font_size.sql      # font_size_scale column
│       ├── 0010_seed_new_styles.sql # 10 new style templates + palettes
│       ├── 0011_medical_wedge.sql  # Medical layer (4 new tables, RLS, seeds)
│       └── 0012_telegram_settings.sql # Telegram integration columns
├── src/
│   ├── app/                        # Next.js App Router pages + server actions
│   │   ├── layout.tsx              # Root layout (RTL, fonts, providers)
│   │   ├── page.tsx                # Landing page (medical-themed)
│   │   ├── globals.css             # Global styles
│   │   ├── actions/                # Server Actions ("use server")
│   │   │   ├── auth.ts             # signUp, signIn, signOut, profile, brandKit, prefs, folders, deleteAccount
│   │   │   ├── projects.ts         # createProject, updateProject, deleteProject, duplicateProject, slides CRUD, export tracking
│   │   │   └── telegram.ts         # sendToTelegram, testTelegram
│   │   ├── login/                  # Auth pages
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   ├── pricing/                # Pricing page
│   │   ├── projects/
│   │   │   ├── page.tsx             # Projects list (dashboard)
│   │   │   ├── new/page.tsx         # 5-step wizard (topic → content → size → template → review)
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx   # Slide editor (edit text, reorder, change template/palette/font)
│   │   │       └── export/page.tsx # Export to PNG/ZIP/Telegram
│   │   ├── templates/page.tsx      # Template gallery
│   │   └── settings/page.tsx       # Settings (profile, brand kit, preferences, telegram, delete)
│   ├── components/
│   │   ├── carousel/
│   │   │   └── slide-renderer.tsx   # ALL 25 template components + shared subcomponents (~2300 lines)
│   │   ├── layout/
│   │   │   ├── app-navbar.tsx       # Authenticated nav bar
│   │   │   ├── marketing-navbar.tsx # Public nav bar
│   │   │   ├── auth-guard.tsx       # Route protection wrapper
│   │   │   └── footer.tsx
│   │   ├── ui/                     # shadcn-style primitives (button, input, dialog, etc.)
│   │   └── auth/auth-visual.tsx     # Animated carousel preview on auth pages
│   ├── lib/
│   │   ├── app-context.tsx         # Global client context (user, brandKit, preferences, telegram, stats)
│   │   ├── db-mappers.ts           # DB rows ↔ frontend types mapping (slug/UUID, size enum, slide type)
│   │   ├── export.ts               # PNG/ZIP export + slidesToBlobs for Telegram
│   │   ├── feature-flags.ts        # Medical mode feature flags
│   │   ├── logger.ts                # Zero-dep colored logger (8 tags)
│   │   ├── templates.ts            # TEMPLATE_DEFS array, palettes, VISIBLE_TEMPLATES, helpers
│   │   ├── types.ts                 # Frontend type definitions
│   │   ├── utils.ts                 # cn() class merger
│   │   ├── supabase/
│   │   │   ├── server.ts            # createClient() + createAdminClient() (service-role)
│   │   │   ├── client.ts            # createClient() (browser)
│   │   │   └── middleware.ts        # Session refresh + route guards
│   │   ├── services/
│   │   │   └── generation.ts        # AI provider (OpenRouter), SYSTEM_PROMPT, medical review
│   │   └── validation/
│   │       ├── auth.ts              # Zod schemas for auth forms
│   │       ├── projects.ts          # Zod schemas for project CRUD + constants (types, tones, etc.)
│   │       ├── settings.ts          # Zod schemas for brand kit + preferences + telegram
│   │       └── slides.ts            # Zod schemas for slide operations
│   └── types/
│       └── database.ts              # Supabase generated types (Row/Insert/Update per table)
└── types/                           # (empty — reserved)
```

---

## 4. Application Flow

### 4.1 Content Generation Flow

```
User writes topic
    ↓
Wizard Step 1: Topic + specialty selection
    ↓
Wizard Step 2: Content settings (type, audience, level, tone, language, slide count, CTA)
    ↓
Wizard Step 3: Size selection (portrait 4:5 only in medical mode)
    ↓
Wizard Step 4: Template + palette + font selection
    ↓
Wizard Step 5: Review → Generate
    ↓
createProjectAction (server action)
    ├── Validate with Zod (createProjectSchema)
    ├── Insert project row (status: in_progress)
    ├── Insert generation_job row (status: pending)
    ├── Call ExternalAIProvider.generate()
    │   ├── Build Arabic SYSTEM_PROMPT (medical safety rules + dialect rules)
    │   ├── Build user prompt (content type instructions + settings)
    │   ├── POST to OpenRouter /chat/completions
    │   ├── Extract JSON from response (strip markdown fences)
    │   └── Validate parsed response
    ├── Insert slides into DB
    ├── Call reviewMedicalContent() (second AI call)
    │   ├── Send slides to AI for medical accuracy review
    │   ├── Parse verdict: pass / needs_review / blocked
    │   └── Save to medical_review_results table
    ├── Update project review_status
    ├── Save caption + hashtags
    ├── Update generation_job (status: completed)
    └── revalidatePath("/projects")
    ↓
Redirect to /projects/[id]/edit
```

### 4.2 Export Flow

```
Edit page (change text, reorder slides, switch template/palette/font)
    ↓
Export page
    ├── Renders slides at 1080px native size (off-screen)
    ├── Awaits document.fonts.ready
    ├── For single PNG: html-to-image toPng() → downloadDataUrl()
    ├── For ZIP: loop all slides → JSZip → download
    ├── For Telegram: slidesToBlobs() → FormData → sendToTelegramAction
    │   └── Server reads bot token from user_preferences (never sent to browser)
    │       └── Chunks into groups of 10 → Telegram sendMediaGroup API
    └── recordExportAction() → updates project status + usage counter
```

### 4.3 Auth Flow

```
Middleware (every request)
    ├── Refresh Supabase session (cookie-based)
    ├── Check auth state
    ├── If unauthenticated + protected route → redirect /login?redirect=...
    └── If authenticated + auth route → redirect /projects
    ↓
AppProvider (client context)
    ├── On mount: supabase.auth.getSession()
    ├── If session: loadUserData() → fetch profile, brand_kit, user_preferences, stats
    ├── Listen to onAuthStateChange
    └── Expose: user, isAuthenticated, brandKit, preferences, telegramEnabled, stats
```

---

## 5. Template System

All 25 template components live in a single file: `src/components/carousel/slide-renderer.tsx` (~2300 lines). There is no separate templates directory or registry file.

### 5.1 Template Categories

| Category | Count | IDs |
|----------|-------|-----|
| Medical (original) | 8 | tahrir, wadeh, noqta, itar, mujaz, academy, hadith, tabayun |
| Medical (spec) | 5 | clinical-clean, numbered-steps, myth-fact, editorial-health, bold-statement |
| General | 12 | shabaka, unwan, hero, editorial, split, stacked, cards, rotated, terminal, magazine, tilt, retro |

When `FEATURE_FLAGS.medicalMode` is true (default), `VISIBLE_TEMPLATES` filters to only the 13 medical templates.

### 5.2 Template Registration

Adding a template requires 3 changes:
1. **`src/lib/templates.ts`**: Add a `TEMPLATE_DEFS` entry with `id`, `name`, `description`, `palettes`, `fonts`, `component`, `category`
2. **`src/components/carousel/slide-renderer.tsx`**: Add a `forwardRef` component + register it in the `renderers` map inside `SlideRenderer`
3. **`supabase/migrations/`**: Add a seed migration for the template + palettes in the DB

### 5.3 Component Props

```typescript
interface SlideRenderProps {
  slide: Slide;              // { id, type, title, body, ctaText? }
  templateId: string;        // slug matching renderers map key
  palette: Palette;          // { id, name, background, text, accent, secondary }
  font: FontFamily;          // "tajawal" | "cairo" | "ibm"
  size: CarouselSize;        // "1080x1080" | "1080x1350" | "1080x1920"
  brandKitSettings: BrandKitSettings; // { enabled, showLogo, showAccountName, showSlideNumber, showDisclaimer, placement }
  brandKitData: BrandKit;    // { instagramHandle, logoDataUrl, primaryColor, font, disclaimerText? }
  index: number;
  total: number;
  fontSizeScale?: number;    // 0.7–1.5, default 1
  medical?: MedicalProps;   // { specialty?, source? } — for medical templates only
}
```

### 5.4 Slide Types

`SlideType = "cover" | "content" | "ending"`

- **Cover**: First slide. Largest headline, hook, physician mark.
- **Content**: Body slides (2–8). Consistent structure per template.
- **Ending**: Last slide. CTA + brand presence + disclaimer.

In the DB, slide types are `cover`, `content`, `summary`, `cta`. The mapper (`db-mappers.ts:slideTypeDbToFe`) maps `summary` and `cta` both to `ending`.

### 5.5 Shared Subcomponents

Defined in `slide-renderer.tsx`, used by the 5 medical spec templates:

| Component | Purpose |
|-----------|---------|
| `BaseSlide` | Universal wrapper — sets bg/text/font, renders `BrandOverlay` + `SlideNumber` |
| `BrandOverlay` | Logo image + Instagram handle, positioned per `settings.placement` |
| `SlideNumber` | `{index+1} / {total}`, gated by `settings.showSlideNumber` |
| `DisclaimerFooter` | Medical disclaimer — `overlay` variant (preview/export) + `inline` variant (inside templates) |
| `PhysicianMark` | "من إعداد طبيب • {specialty}" badge, derived from `medical.specialty` slug lookup |
| `SourceBadge` | "المصدر: {source}" chip, derived from `medical.source` |

### 5.6 Palette System

Each template has exactly 4 palettes. The `Palette` type has 4 color slots:

```typescript
interface Palette {
  id: string;          // "p1".."p4"
  name: string;        // Arabic display name
  background: string;  // hex
  text: string;        // hex
  accent: string;      // hex (primary accent / myth-red / step accent)
  secondary: string;  // hex (muted / fact-green / number-tint / soft-bg-block)
}
```

The spec's custom color names (myth-red, fact-green, number-tint, soft-bg-block, muted) are mapped onto the existing `accent`/`secondary` slots — no type changes needed.

---

## 6. Supabase Architecture

### 6.1 Client Creation

| Function | File | Key | Context |
|----------|------|-----|---------|
| `createClient()` | `lib/supabase/server.ts` | publishable | Server Components, Server Actions — RLS enforced, cookie session |
| `createAdminClient()` | `lib/supabase/server.ts` | service-role | Bypasses RLS — only for admin operations (deleteAccount) |
| `createClient()` | `lib/supabase/client.ts` | publishable | Client components — RLS enforced, browser session |
| `createServerClient()` | `lib/supabase/middleware.ts` | publishable | Middleware — session refresh |

### 6.2 RLS Strategy

- **All user-data tables**: `auth.uid() = user_id` (or `id` for profiles) on SELECT/INSERT/UPDATE/DELETE
- **Templates + template_palettes**: Public read (`is_active = true`), no user writes
- **hooks_library**: Public read (`is_active = true`), no user writes
- **specialties**: No RLS (reference data, public)
- **Storage buckets**: Per-user folders (`storage.foldername(name)[1] = auth.uid()::text`)

### 6.3 DB ↔ Frontend Mapping

The `db-mappers.ts` file bridges two different representations:

| Concept | DB | Frontend |
|---------|----|---------| 
| Template ID | UUID | slug string (e.g., "tahrir") |
| Palette ID | UUID | "p1".."p4" (sort_order-based) |
| Size | enum: `square`, `portrait`, `story` | pixel string: `1080x1080`, `1080x1350`, `1080x1920` |
| Font | `ibm-plex-sans-arabic` | `ibm` |
| Slide type | `cover`, `content`, `summary`, `cta` | `cover`, `content`, `ending` |
| Project status | `in_progress`, `completed`, `archived` | `draft`, `completed` |
| Hashtags | space-separated string | `string[]` |

`fetchTemplateLookup()` builds a slug→UUID map at runtime so the frontend can work with slugs while the DB uses UUIDs.

---

## 7. AI Integration

### 7.1 Provider

`src/lib/services/generation.ts` implements `ExternalAIProvider`:

- **Gateway**: OpenRouter (`https://openrouter.ai/api/v1`)
- **Model**: `deepseek/deepseek-v4-flash` (configurable via `AI_MODEL` env)
- **Headers**: `Authorization: Bearer {key}`, `HTTP-Referer: {app_url}`, `X-Title: "Typo AI"`
- **Response handling**: JSON may be wrapped in markdown fences (`\`\`\`json ... \`\`\``) — `extractJSON()` strips them
- **Validation**: `validateAIResponse()` ensures slides array exists, truncates fields (title 300, body 2000, cta 200)

### 7.2 System Prompt

Arabic-language system prompt with:
- Dialect enforcement rules (no mixing dialects)
- Slide structure rules (cover first, summary/cta last)
- 4 medical safety rules (no drug dosages, no diagnoses, no absolute language, mandatory disclaimer)
- JSON output schema

### 7.3 Content Type Instructions

10 content types with specific structural guidance:

| Type | Instruction Summary |
|------|---------------------|
| تعليمي (educational) | Build gradually, each slide builds on previous |
| قصة (story) | Narrative arc: setup → conflict → resolution |
| توعوي (awareness) | Start with striking fact, explain impacts, end with behavior change CTA |
| قائمة (list) | Each slide = one numbered item |
| خطوات (steps) | Each slide = one step in order |
| نصائح (tips) | Each slide = one actionable, specific tip |
| مقارنة (comparison) | Compare specific aspect per slide |
| شرح مفهوم (concept explainer) | Define → explain with example → apply to real case |
| تفكيك الخرافات (myth busting) | State myth → correct with fact, cite sources |
| شرح مرض (disease explainer) | Define → symptoms → causes → prevention/treatment |

### 7.4 Medical Review (Second AI Pass)

After content generation, `reviewMedicalContent()` sends the generated slides to the AI again with a medical reviewer system prompt. It checks for:

| Flag Type | Trigger |
|-----------|---------|
| `diagnostic_claim` | "you are diagnosed with..." |
| `drug_dosage` | "take 500mg" |
| `cure_claim` | "cures", "heals" → suggest "may help with" |
| `absolute_language` | "must", "never", "always" |
| `unsafe_advice` | Any advice that could harm patients |

Verdict: `pass` (no issues), `needs_review` (non-dangerous issues), `blocked` (dangerous). Saved to `medical_review_results` table + `projects.review_status` column.

---

## 8. Feature Flags

`src/lib/feature-flags.ts`:

```typescript
const MEDICAL_MODE = process.env.NEXT_PUBLIC_MEDICAL_MODE !== "false";

export const FEATURE_FLAGS = {
  medicalMode: MEDICAL_MODE,        // ON by default
  folders: !MEDICAL_MODE,           // Hidden in medical mode
  favorites: !MEDICAL_MODE,         // Hidden in medical mode
  stats: !MEDICAL_MODE,             // Hidden in medical mode
  duplicateProject: !MEDICAL_MODE,  // Hidden in medical mode
  extraSizes: !MEDICAL_MODE,        // Only portrait 4:5 in medical mode
};
```

Set `NEXT_PUBLIC_MEDICAL_MODE=false` to disable medical mode and show all features.

---

## 9. Routes

| Route | Type | Auth | Purpose |
|-------|------|------|---------|
| `/` | Static | Public | Landing page (medical-themed with Stethoscope branding, teal theme) |
| `/login` | Static | Auth only | Login form |
| `/signup` | Static | Auth only | Signup form |
| `/forgot-password` | Static | Auth only | Password reset request |
| `/reset-password` | Static | Auth only | Password reset form |
| `/verify-email` | Static | Auth only | Email verification notice |
| `/pricing` | Static | Public | Pricing tiers |
| `/projects` | Static | Protected | Projects list dashboard |
| `/projects/new` | Static | Protected | 5-step creation wizard |
| `/projects/[id]/edit` | Dynamic | Protected | Slide editor |
| `/projects/[id]/export` | Dynamic | Protected | Export page (PNG/ZIP/Telegram) |
| `/templates` | Static | Public | Template gallery |
| `/settings` | Static | Protected | Settings (profile, brand kit, preferences, telegram, delete) |

---

## 10. Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Generation (required)
AI_API_KEY=your-openrouter-api-key
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-v4-flash

# App URL (required for OpenRouter HTTP-Referer header)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Medical Mode (optional, default: ON)
NEXT_PUBLIC_MEDICAL_MODE=true
```

---

## 11. Key Design Decisions

1. **Cookie-based sessions** via `@supabase/ssr` — no client-side token management. Middleware refreshes session on every request.

2. **Server Actions for all mutations** — no API routes. All writes go through `"use server"` functions with Zod validation + auth checks.

3. **Service-role key is server-only** — `createAdminClient()` is used exclusively for account deletion. All other server-side operations use the publishable key with RLS.

4. **Single-file template system** — all 25 templates in one 2300-line file. This is deliberate: templates share helpers (`BaseSlide`, `BrandOverlay`, `fs()`, `fontMap`), and splitting them would require a registry file + imports per template.

5. **DB ↔ Frontend mapper layer** (`db-mappers.ts`) — isolates the DB schema from the frontend. The frontend never sees UUIDs for templates/palettes; it works with slugs and `p1`–`p4` IDs.

6. **Medical mode as default** — the app is repositioned as a medical content tool. Non-medical features are feature-flagged off, not removed.

7. **Two-pass AI generation** — content generation + medical accuracy review are separate AI calls. The review is non-blocking (failure defaults to `needs_review`, not `blocked`).

8. **Per-user Telegram tokens** — bot tokens are stored in `user_preferences` (not app-level env). The token is read server-side only and never reaches the browser.

9. **Zero-dep logger** (`lib/logger.ts`) — 8 colored tags (AUTH, PROJECT, SLIDE, EXPORT, SETTINGS, TELEGRAM, MW, ERROR). Suppressed in production except for errors.

10. **Idempotent migrations** — migrations 0011 and 0012 use `IF NOT EXISTS`, `DROP POLICY IF EXISTS` + `CREATE`, `ON CONFLICT DO NOTHING` so they're safe to re-run.

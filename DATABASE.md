# DATABASE.md

> Complete database schema, migrations reference, and data flow for the Typo AI Supabase project.

---

## 1. Connection

- **Supabase URL**: `ldcowzhrgubttuwzbvpo.supabase.co`
- **Client creation**: `@supabase/ssr` cookie-based sessions
- **Keys**:
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — used in all client + server contexts, RLS enforced
  - `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, used ONLY in `createAdminClient()` for account deletion

---

## 2. Migrations

12 SQL migrations in `supabase/migrations/`. Run manually in Supabase Dashboard → SQL Editor.

| # | File | What it does |
|---|------|-------------|
| 0001 | `0001_tables.sql` | Creates 11 core tables: profiles, brand_kits, user_preferences, folders, templates, template_palettes, favorite_templates, projects, slides, export_records, generation_jobs, account_usage |
| 0002 | `0002_triggers.sql` | `update_updated_at()` trigger function + triggers on all tables. `handle_new_user()` trigger: auto-creates profile + brand_kit + user_preferences + account_usage on auth signup |
| 0003 | `0003_rls.sql` | Enables RLS on all tables. Per-user policies (`auth.uid() = user_id`). Templates/public read policies |
| 0004 | `0004_storage.sql` | 3 storage buckets: `avatars`, `brand-logos`, `project-exports` (all private). Per-user folder policies |
| 0005 | `0005_rpcs.sql` | 3 RPC functions: `get_dashboard_stats()`, `reorder_project_slides()`, `duplicate_project()` |
| 0006 | `0006_indexes.sql` | 14 indexes on projects, slides, folders, favorite_templates, export_records, generation_jobs |
| 0007 | `0007_seed_templates.sql` | Seeds 10 original templates + 4 shared palettes each (40 palette rows) |
| 0008 | `0008_increment_usage.sql` | `increment_usage(p_user_id, p_field)` RPC — increments projects_created / generations_used / exports_used |
| 0009 | `0009_font_size.sql` | Adds `font_size_scale real` column to projects (0.7–1.5, default 1.0) |
| 0010 | `0010_seed_new_styles.sql` | Seeds 10 new style templates (hero, editorial, split, stacked, cards, rotated, terminal, magazine, tilt, retro) + 4 style-specific palettes each (40 palette rows) |
| 0011 | `0011_medical_wedge.sql` | **Medical layer**: 4 new tables (specialties, medical_review_results, content_sources, hooks_library), modified tables (templates.category, brand_kits.disclaimer_text, projects.specialty_slug/review_status/show_disclaimer), RLS, seeds (8 specialties, 16 hooks) |
| 0012 | `0012_telegram_settings.sql` | Adds telegram_bot_token, telegram_chat_id, telegram_enabled columns to user_preferences. Extends export_records CHECK for 'telegram' type |

**Migrations 0011 and 0012 are idempotent** — safe to re-run (DROP IF EXISTS + CREATE, IF NOT EXISTS, ON CONFLICT DO NOTHING).

---

## 3. Tables Overview

### 3.1 Core User Tables

#### `profiles`
User profile, linked to `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = `auth.users.id`, ON DELETE CASCADE |
| display_name | text | Required |
| avatar_path | text | Storage path in `avatars` bucket |
| instagram_username | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now(), trigger-updated |

**RLS**: `auth.uid() = id` on SELECT/INSERT/UPDATE.

**Auto-created** by `handle_new_user()` trigger when a new auth user signs up.

---

#### `brand_kits`
Visual identity per user (1:1 with profiles).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid UNIQUE | FK → profiles, ON DELETE CASCADE |
| instagram_username | text | |
| logo_path | text | Storage path in `brand-logos` bucket |
| primary_color | text | Hex color |
| default_font | text | CHECK IN ('tajawal', 'cairo', 'ibm-plex-sans-arabic'), DEFAULT 'tajawal' |
| disclaimer_text | text | Added in migration 0011 |
| show_disclaimer | boolean | DEFAULT true, added in 0011 |
| default_specialty | text | FK → specialties(slug), added in 0011 |

**RLS**: `auth.uid() = user_id` on all operations.

---

#### `user_preferences`
Default settings per user (1:1 with profiles).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid UNIQUE | FK → profiles |
| default_language | text | DEFAULT 'ar-fusha' |
| default_tone | text | DEFAULT 'simple' |
| default_level | text | DEFAULT 'beginner' |
| default_size | text | CHECK IN ('square', 'portrait', 'story'), DEFAULT 'portrait' |
| default_slide_count | integer | CHECK 2–10, DEFAULT 6 |
| preferred_template_id | uuid | |
| telegram_bot_token | text | Added in 0012, nullable |
| telegram_chat_id | text | Added in 0012, nullable |
| telegram_enabled | boolean | DEFAULT false, added in 0012 |

**RLS**: `auth.uid() = user_id` on SELECT/INSERT/UPDATE.

---

#### `account_usage`
Usage counters per user (1:1 with profiles).

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid PK | FK → profiles |
| projects_created | integer | DEFAULT 0 |
| generations_used | integer | DEFAULT 0 |
| exports_used | integer | DEFAULT 0 |
| period_start | timestamptz | DEFAULT now() |
| period_end | timestamptz | Nullable |

**RLS**: `auth.uid() = user_id` on SELECT/UPDATE.

Incremented via `increment_usage(p_user_id, p_field)` RPC.

---

### 3.2 Organization Tables

#### `folders`
Project organization folders.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → profiles |
| name | text | |
| created_at, updated_at | timestamptz | |

**Constraints**: UNIQUE(user_id, name).

**RLS**: `auth.uid() = user_id` on all operations.

---

#### `favorite_templates`
User's favorited templates (many-to-many).

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → profiles, PK part |
| template_id | uuid | FK → templates, PK part |
| created_at | timestamptz | |

**PK**: (user_id, template_id).

**RLS**: `auth.uid() = user_id` on SELECT/INSERT/DELETE.

---

### 3.3 Template System Tables

#### `templates`
Design templates (reference data, seeded via migrations).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | e.g., 'tahrir', 'clinical-clean' |
| name_ar | text | Arabic display name |
| description_ar | text | |
| component_key | text UNIQUE | Matches renderer map key |
| thumbnail_path | text | |
| is_active | boolean | DEFAULT true |
| sort_order | integer | |
| supported_sizes | text[] | e.g., {'square','portrait','story'} |
| supported_fonts | text[] | |
| category | text | CHECK IN ('medical', 'general'), DEFAULT 'general'. Added in 0011 |
| specialty_slug | text | FK → specialties(slug). Added in 0011 |

**RLS**: Public read (`is_active = true`), no user writes.

**Seeded**: 20 templates in migrations 0007 + 0010. 5 more spec templates need to be added to DB (they exist in code but not yet seeded in a migration).

---

#### `template_palettes`
Color palettes per template (4 per template).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| template_id | uuid | FK → templates, ON DELETE CASCADE |
| name_ar | text | Arabic palette name |
| background_color | text | Hex |
| text_color | text | Hex |
| accent_color | text | Hex |
| secondary_color | text | Hex |
| sort_order | integer | 1–4, maps to palette ID "p1"–"p4" |

**RLS**: Public read, no user writes.

---

### 3.4 Project Tables

#### `projects`
The main content table.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → profiles |
| folder_id | uuid | FK → folders, ON DELETE SET NULL |
| template_id | uuid | FK → templates, ON DELETE SET NULL |
| palette_id | uuid | FK → template_palettes, ON DELETE SET NULL |
| title | text | |
| topic | text | Original user topic input |
| content_type | text | One of 10 types (see below) |
| target_audience | text | Nullable |
| content_level | text | 'مبتدئ', 'متوسط', 'متقدم' |
| tone | text | One of 8 tones |
| language | text | One of 5 languages/dialects |
| size | text | CHECK IN ('square', 'portrait', 'story') |
| width | integer | 1080 |
| height | integer | 1080, 1350, or 1920 |
| slide_count | integer | CHECK 2–10 |
| cta_type | text | Nullable, one of 5 CTA options |
| font_family | text | DEFAULT 'tajawal' |
| font_size_scale | real | CHECK 0.7–1.5, DEFAULT 1.0. Added in 0009 |
| use_brand_kit | boolean | DEFAULT true |
| show_logo | boolean | DEFAULT true |
| show_account_name | boolean | DEFAULT true |
| show_slide_number | boolean | DEFAULT true |
| show_disclaimer | boolean | DEFAULT true. Added in 0011 |
| logo_position | text | One of 4 corners |
| account_name_position | text | One of 4 corners |
| caption | text | AI-generated Instagram caption |
| hashtags | text | Space-separated |
| status | text | CHECK IN ('in_progress', 'completed', 'archived') |
| is_favorite | boolean | DEFAULT false |
| specialty_slug | text | FK → specialties(slug). Added in 0011 |
| requires_medical_review | boolean | DEFAULT true. Added in 0011 |
| review_status | text | CHECK IN ('pending', 'pass', 'needs_review', 'blocked'). Added in 0011 |
| last_exported_at | timestamptz | |
| created_at, updated_at | timestamptz | |

**RLS**: `auth.uid() = user_id` on all operations.

---

#### `slides`
Individual slides within a project.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid | FK → projects, ON DELETE CASCADE |
| user_id | uuid | FK → profiles |
| position | integer | CHECK >= 1, UNIQUE(project_id, position) |
| slide_type | text | CHECK IN ('cover', 'content', 'summary', 'cta') |
| title | text | |
| body | text | |
| cta_text | text | For summary/cta slides |
| has_source | boolean | DEFAULT false. Added in 0011 |
| created_at, updated_at | timestamptz | |

**RLS**: `auth.uid() = user_id` on all operations.

**Slide type mapping** (DB → frontend):
- `cover` → `"cover"`
- `content` → `"content"`
- `summary` → `"ending"`
- `cta` → `"ending"`

---

### 3.5 Tracking Tables

#### `export_records`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → profiles |
| project_id | uuid | FK → projects |
| export_type | text | CHECK IN ('single_png', 'zip', 'telegram') — extended in 0012 |
| slide_id | uuid | FK → slides, for single exports |
| file_path | text | |
| created_at | timestamptz | |

**RLS**: `auth.uid() = user_id` on SELECT/INSERT.

---

#### `generation_jobs`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | FK → profiles |
| project_id | uuid | FK → projects |
| provider | text | |
| model | text | |
| status | text | CHECK IN ('pending', 'processing', 'completed', 'failed') |
| request_payload | jsonb | |
| response_payload | jsonb | |
| error_message | text | |
| prompt_tokens | integer | |
| completion_tokens | integer | |
| created_at | timestamptz | |
| completed_at | timestamptz | |

**RLS**: `auth.uid() = user_id` on SELECT/INSERT/UPDATE.

---

### 3.6 Medical Layer Tables (added in migration 0011)

#### `specialties`
Reference table — 8 seeded medical specialties.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | 'general', 'dentistry', 'dermatology', 'nutrition', 'pediatrics', 'cardiology', 'neurology', 'mental_health' |
| name_ar | text | Arabic name |
| name_en | text | English name |
| icon | text | |
| sort_order | integer | |

**No RLS** (public reference data).

---

#### `medical_review_results`
AI medical accuracy review output.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid | FK → projects, ON DELETE CASCADE |
| slide_id | uuid | FK → slides, ON DELETE CASCADE (nullable) |
| user_id | uuid | FK → profiles |
| verdict | text | CHECK IN ('pending', 'pass', 'needs_review', 'blocked') |
| flags | jsonb | Array of MedicalFlag objects |
| summary | text | Arabic summary |
| reviewed_at | timestamptz | |
| created_at | timestamptz | |

**Indexes**: project_id, user_id.

**RLS**: `auth.uid() = user_id` on all operations.

**Flag structure** (JSONB):
```json
{
  "slideIndex": 0,
  "type": "diagnostic_claim | drug_dosage | cure_claim | absolute_language | unsafe_advice",
  "originalText": "...",
  "reason": "...",
  "suggestion": "..."
}
```

---

#### `content_sources`
Citation tracking per slide.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid | FK → projects, ON DELETE CASCADE |
| slide_id | uuid | FK → slides, ON DELETE SET NULL |
| user_id | uuid | FK → profiles |
| source_type | text | CHECK IN ('who', 'cdc', 'mayo_clinic', 'journal', 'guideline', 'textbook', 'general') |
| title | text | |
| url | text | |

**RLS**: `auth.uid() = user_id` on all operations.

---

#### `hooks_library`
Pre-written medical content hooks (read-only for users).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category | text | 'awareness', 'myth_busting', 'condition_explainer', 'tips', 'steps', 'mental_health' |
| hook_text_ar | text | Arabic hook text |
| specialty | text | FK → specialties(slug) |
| is_active | boolean | DEFAULT true |
| usage_count | integer | DEFAULT 0 |

**Unique index**: (category, hook_text_ar).

**RLS**: Public read (`is_active = true`), no user writes.

**Seeded**: 16 hooks across categories and specialties.

---

## 4. RPC Functions

### `get_dashboard_stats()`
- **Returns**: `jsonb` — `{ total_projects, completed_projects, export_count, favorite_templates }`
- **Security**: SECURITY DEFINER, uses `auth.uid()`
- **Called from**: `app-context.tsx` on login

### `reorder_project_slides(p_project_id, p_ordered_slide_ids)`
- **Returns**: `SETOF slides` (reordered)
- **Security**: SECURITY DEFINER, checks ownership
- **Validations**: All slides belong to project, all included, cover first, ending last
- **Algorithm**: Two-phase update (temporary positions + 10000, then final positions) to avoid UNIQUE constraint violations

### `duplicate_project(p_project_id)`
- **Returns**: `uuid` (new project ID)
- **Security**: SECURITY DEFINER, checks ownership
- **Copies**: All project fields + all slides

### `increment_usage(p_user_id, p_field)`
- **Returns**: void
- **Fields**: 'projects_created', 'generations_used', 'exports_used'

### `handle_new_user()` (trigger function)
- **Trigger**: `AFTER INSERT ON auth.users`
- **Creates**: profile + brand_kit + user_preferences + account_usage

### `update_updated_at()` (trigger function)
- **Trigger**: `BEFORE UPDATE` on all tables with `updated_at`

---

## 5. Storage Buckets

| Bucket | Public | Purpose | Path Pattern |
|--------|--------|---------|-------------|
| `avatars` | No | User profile pictures | `{user_id}/filename` |
| `brand-logos` | No | Brand kit logos | `{user_id}/filename` |
| `project-exports` | No | Exported files (unused — exports go to client download) | `{user_id}/filename` |

All buckets enforce per-user access: `storage.foldername(name)[1] = auth.uid()::text`.

---

## 6. Enums and Constants

### Content Types (10)
`تعليمي`, `قصة`, `توعوي`, `قائمة`, `خطوات`, `نصائح`, `مقارنة`, `شرح مفهوم`, `تفكيك الخرافات`, `شرح مرض`

### Languages (5)
`العربية الفصحى`, `اللهجة العراقية`, `اللهجة الخليجية`, `اللهجة المصرية`, `الإنجليزية`

### Tones (8)
`مبسطة`, `احترافية`, `ودية`, `رسمية`, `تحفيزية`, `قصصية`, `مباشرة`, `أكاديمية`

### Levels (3)
`مبتدئ`, `متوسط`, `متقدم`

### CTA Options (5)
`بدون CTA`, `احفظ المنشور`, `شارك المنشور`, `تابع الحساب`, `اكتب رأيك`

### Sizes (3)
| DB | Frontend | Dimensions |
|----|----------|------------|
| `square` | `1080x1080` | 1080 × 1080 (1:1) |
| `portrait` | `1080x1350` | 1080 × 1350 (4:5) |
| `story` | `1080x1920` | 1080 × 1920 (9:16) |

### Fonts (3)
| DB | Frontend | CSS Variable |
|----|----------|-------------|
| `tajawal` | `tajawal` | `--font-tajawal` |
| `cairo` | `cairo` | `--font-cairo` |
| `ibm-plex-sans-arabic` | `ibm` | `--font-ibm` |

### Placements (4)
`top-right`, `top-left`, `bottom-right`, `bottom-left`

### Specialties (8)
| Slug | Arabic Name |
|------|-------------|
| `general` | طب عام |
| `dentistry` | طب الأسنان |
| `dermatology` | الجلدية |
| `nutrition` | التغذية |
| `pediatrics` | طب الأطفال |
| `cardiology` | أمراض القلب |
| `neurology` | الأعصاب |
| `mental_health` | الصحة النفسية |

---

## 7. Entity Relationships

```
auth.users
  └── profiles (1:1)
        ├── brand_kits (1:1)
        ├── user_preferences (1:1)
        ├── account_usage (1:1)
        ├── folders (1:N)
        ├── favorite_templates (N:N → templates)
        ├── projects (1:N)
        │     ├── slides (1:N)
        │     ├── generation_jobs (1:N)
        │     ├── export_records (1:N)
        │     ├── medical_review_results (1:N)
        │     └── content_sources (1:N)
        └── (all user data cascade-deleted when profile is deleted)

templates (reference, seeded)
  ├── template_palettes (1:N, 4 per template)
  └── specialty (N:1 → specialties, optional)

specialties (reference, seeded, 8 rows)
hooks_library (reference, seeded, 16 rows)
```

---

## 8. Running Migrations

Migrations are NOT run automatically. They must be executed manually in the Supabase Dashboard SQL Editor.

**Order matters** — run them in sequence 0001 → 0012.

Migrations 0011 and 0012 are idempotent (safe to re-run). Earlier migrations may fail on re-run if objects already exist (some use `IF NOT EXISTS` / `ON CONFLICT`, but not all).

To check what's been applied:
```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

---

## 9. TypeScript Types

Supabase-generated types are in `src/types/database.ts`. They define `Row`, `Insert`, and `Update` for each table.

**Note**: The types file does NOT include the medical layer tables (specialties, medical_review_results, content_sources, hooks_library) or the columns added in migrations 0011–0012 (except telegram columns on user_preferences which were manually added). The code uses `any` types in `db-mappers.ts` to bridge this gap.

To regenerate types from Supabase:
```bash
npx supabase gen types typescript --project-id ldcowzhrgubttuwzbvpo > src/types/database.ts
```
Then manually add the medical layer tables and telegram columns.

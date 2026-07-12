# Graph Report - typo  (2026-07-12)

## Corpus Check
- 116 files · ~90,642 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1127 nodes · 1885 edges · 216 communities (48 shown, 168 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52112dea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Auth & Account Actions
- Export & ZIP Pipeline
- BM25 Search Core
- Database Schema & Storage
- Forgot Password Flow
- Templates Demo Data
- Slide Renderer Templates
- Slide CRUD Actions
- App Middleware & Fonts
- Wizard Steps & Brand Dialog
- TypeScript Build Config
- Project Creation Schema
- Lint & Dev Dependencies
- DB-to-Frontend Mapping
- Core App Routes Overview
- UI Library Dependencies
- Projects Page & Actions
- Template Favorites & Export Step
- Architecture Tech Stack
- Feature Flags & Conventions
- Wizard Content Options
- Slide Render Props Demo
- AI Generation Integration
- Brand Kit & Slide Editor
- Package Manifest
- QA: Generator No Effect Bug
- Slide Template Components
- Desktop Landing Page
- Export/Settings/Telegram Pages
- Code Inspector Dev Tool
- Two-Pass Medical Review
- Account Mode Wizard Plan
- QA: Mobile Menu Bug
- QA: OTP Verification Screen
- App Context & Auth Middleware
- ESLint Config
- UI-UX Pro Max Skill
- QA: Unlabeled Controls
- Opencode Plugin Dependency
- Carousel Wizard & Unauthorized Bug
- QA: Invalid Project Route
- QA: Reset Link Nav Bug
- QA: Raw Reset Error
- Mobile Home Medical Badge
- QA: Mobile Home Empty State
- Database Types (dup A)
- Database Types (dup B)
- QA: Empty Topic Advances Bug
- Env Vars & Deployment
- Logger Utility
- Hookform Resolvers Dependency
- html-to-image Dependency
- lucide-react Dependency
- Next.js Env Types
- React Dependency
- sanitize-html Dependency
- Supabase SSR Dependency
- Tailwind Config (dup A)
- App Navbar Component
- Auth Guard Component
- Auth Visual Component
- DB-Frontend Mapping Note
- Export Utility
- Marketing Navbar Component
- Forgot Password Page
- Pricing Page
- Reset Password Page
- Slide Type Enum
- SQL Migrations Directory
- Tailwind Config (dup B)
- Class Utility Helper
- Settings Validation
- Slides Validation
- Overlay Levels Config
- Overlay Placements Config
- Slide Body Parsing
- Code Conventions Doc
- Debugging Tips Doc
- Getting Started Doc
- RTL Considerations Doc
- npm Scripts
- QA: Blank Settings Page
- QA: Inert Step Tabs
- QA: Plus-Address Email Rejected
- lib/feature-flags.ts (FEATURE_FLAGS)
- Framer Motion 11
- lib/services/generation.ts (ExternalAIProvider)
- 7 Google Fonts via next/font/google
- html-to-image + jszip export
- Medical Mode
- Medical Review (second AI pass)
- middleware.ts
- Next.js 14.2.20 App Router
- OpenRouter -> DeepSeek deepseek-v4-flash
- Palette interface
- PhysicianMark component
- Slide editor (projects/[id]/edit/page.tsx)
- 5-step project creation wizard (projects/new/page.tsx)
- React Hook Form + Zod 3.24
- RLS Strategy
- Landing page (app/page.tsx)
- /login page
- Settings page (settings/page.tsx)
- /signup page
- Template gallery (templates/page.tsx)
- /verify-email page
- Server Actions for all mutations
- SlideRenderProps interface
- slide-renderer.tsx (25 template components)
- SlideNumber component
- SourceBadge component
- src/app/actions/auth.ts
- src/app/actions/projects.ts
- src/app/actions/telegram.ts
- Supabase (Auth+DB+Storage+RLS)
- lib/supabase/client.ts
- lib/supabase/middleware.ts
- lib/supabase/server.ts (createClient/createAdminClient)
- Arabic SYSTEM_PROMPT
- Tailwind CSS 3.4
- Single-file Template System
- lib/templates.ts (TEMPLATE_DEFS)
- Two-pass AI generation
- lib/types.ts
- TypeScript 5
- Typo AI
- lib/validation/auth.ts
- lib/validation/projects.ts
- avatars storage bucket
- brand-logos storage bucket
- project-exports storage bucket
- Fonts (tajawal/cairo/ibm-plex-sans-arabic)
- 0001_tables.sql - Creates 11 core tables
- 0002_triggers.sql - update_updated_at() + handle_new_user() triggers
- 0003_rls.sql - Enables RLS on all tables
- 0004_storage.sql - 3 storage buckets + per-user folder policies
- 0005_rpcs.sql - get_dashboard_stats, reorder_project_slides, duplicate_project RPCs
- 0006_indexes.sql - 14 performance indexes
- 0007_seed_templates.sql - Seeds 10 original templates + 40 palette rows
- 0008_increment_usage.sql - increment_usage() RPC
- 0009_font_size.sql - Adds font_size_scale column to projects
- 0010_seed_new_styles.sql - Seeds 10 new style templates + 40 palette rows
- 0011_medical_wedge.sql - Medical layer: 4 new tables, modified tables, RLS, seeds
- 0012_telegram_settings.sql - Adds telegram columns to user_preferences
- duplicate_project() RPC
- get_dashboard_stats() RPC
- handle_new_user() trigger function
- increment_usage() RPC
- reorder_project_slides() RPC
- update_updated_at() trigger function
- Sizes (square/portrait/story)
- account_usage table
- brand_kits table
- content_sources table
- export_records table
- favorite_templates table
- folders table
- generation_jobs table
- hooks_library table
- medical_review_results table
- profiles table
- projects table
- slides table
- specialties table
- template_palettes table
- templates table
- user_preferences table
- Generated types gap (medical layer missing)
- 20 design templates
- AI content generation feature
- Brand Kit feature
- Database schema overview table
- Export feature (PNG/ZIP)
- Project management (folders, favorites, duplicate)
- Slide editor feature
- Typo AI (Arabic description)
- End-to-end workflow diagram
- Deployment
- How-To: Add a New Content Type
- How-To: Add a New Database Column
- How-To: Add a New Page
- How-To: Add a New Server Action
- How-To: Add a Telegram Feature
- How-To: Add a New Template
- How-To: Modify the AI System Prompt
- Logger usage (log/logError)
- Ponytail convention (minimal comments, one runnable check)
- Template Component Patterns
- Testing approach
- codex/general-medical-users branch
- tests/content-mode.test.ts (new)
- src/lib/content-mode.ts (new)
- supabase/migrations/0014_account_content_mode.sql (new)
- content_mode field
- General account mode
- Medical account mode (spec)
- requires_medical_review project field (reused)
- Validation requirements (typecheck/lint/build)
- Master + Overrides persistence pattern (--persist)
- scripts/search.py
- ui-reasoning.csv (reasoning rules)
- QA-001: Landing-page generator is non-functional
- QA-002: Unauthorized generation exposes unhandled error
- QA-003: 'Return to settings' navigates to templates
- QA-004: Settings page renders blank
- QA-005: Verification code fields don't retain digits
- QA-006: Valid plus-addresses rejected by signup
- QA-007: Terms/privacy links are dead placeholders
- QA-008: Icon-only controls have no accessible names
- QA-009: Future wizard steps look enabled but are inert
- custom-templates.ts
- isolated-preview.tsx
- page.tsx
- version-history.tsx
- chat-panel.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 57 edges
2. `log()` - 36 edges
3. `createClient()` - 36 edges
4. `logError()` - 25 edges
5. `getPalette()` - 21 edges
6. `Button` - 19 edges
7. `useApp()` - 19 edges
8. `EditorPage()` - 16 edges
9. `SettingsPage()` - 16 edges
10. `DesignerWorkspace()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updateSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `captureAllToZip()` --references--> `jszip`  [EXTRACTED]
  src/components/template-designer/capture.ts → package.json
- `exportAllToZip()` --references--> `jszip`  [EXTRACTED]
  src/lib/export.ts → package.json
- `Hero()` --calls--> `getPalette()`  [EXTRACTED]
  src/app/page.tsx → src/lib/templates.ts
- `TemplatePreviews()` --calls--> `getPalette()`  [EXTRACTED]
  src/app/page.tsx → src/lib/templates.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Account Mode Wizard: spec -> plan -> schema** — docs_superpowers_specs_2026_07_11_account_mode_wizard_design, docs_superpowers_plans_2026_07_12_account_mode_wizard, docs_superpowers_specs_2026_07_11_account_mode_wizard_design_content_mode, database_table_user_preferences [INFERRED 0.85]
- **Manual QA validates architecture-documented routes** — qa_report, architecture_route_settings, architecture_route_verify_email, architecture_projects_new_wizard [INFERRED 0.80]
- **Medical safety review pipeline (prompt -> review -> storage -> migration)** — architecture_system_prompt, architecture_medical_review_second_pass, database_table_medical_review_results, database_migration_0011_medical_wedge [INFERRED 0.85]

## Communities (216 total, 168 thin omitted)

### Community 0 - "Auth & Account Actions"
Cohesion: 0.06
Nodes (68): createFolderAction(), deleteAccountAction(), deleteFolderAction(), forgotPasswordAction(), renameFolderAction(), resetPasswordAction(), signInAction(), signOutAction() (+60 more)

### Community 1 - "Export & ZIP Pipeline"
Cohesion: 0.21
Nodes (12): getCustomTemplateAction(), captureAllToZip(), captureIframePng(), DesignerWorkspace(), makeClientId(), dataUrlToBlob(), customerCostMicroUsd(), DesignerAccessInput (+4 more)

### Community 2 - "BM25 Search Core"
Cohesion: 0.05
Nodes (42): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+34 more)

### Community 3 - "Database Schema & Storage"
Cohesion: 0.04
Nodes (46): 1. Connection, 2. Migrations, 3.1 Core User Tables, 3.2 Organization Tables, 3.3 Template System Tables, 3.4 Project Tables, 3.5 Tracking Tables, 3.6 Medical Layer Tables (added in migration 0011) (+38 more)

### Community 4 - "Forgot Password Flow"
Cohesion: 0.05
Nodes (46): ForgotPasswordPage(), FormData, schema, FormData, LoginContent(), schema, demoBkSettings, demoBrandKit (+38 more)

### Community 5 - "Templates Demo Data"
Cohesion: 0.11
Nodes (18): BOLD_STATEMENT_PALETTES, CARDS_PALETTES, CLINICAL_CLEAN_PALETTES, EDITORIAL_HEALTH_PALETTES, EDITORIAL_PALETTES, HERO_PALETTES, MAGAZINE_PALETTES, MYTH_FACT_PALETTES (+10 more)

### Community 6 - "Slide Renderer Templates"
Cohesion: 0.05
Nodes (37): Academy, BoldStatement, BrandOverlay(), Cards, ClinicalClean, decorFont, DisclaimerFooter(), Editorial (+29 more)

### Community 7 - "Slide CRUD Actions"
Cohesion: 0.14
Nodes (28): deleteSlideAction(), duplicateSlideAction(), reorderSlidesAction(), updateProjectAction(), updateSlideAction(), EditorPage(), ALL_CONTENT_TYPES, ALL_LANGUAGES (+20 more)

### Community 8 - "App Middleware & Fonts"
Cohesion: 0.15
Nodes (15): config, middleware(), cairo, courier, grotesk, ibm, metadata, mono (+7 more)

### Community 9 - "Wizard Steps & Brand Dialog"
Cohesion: 0.07
Nodes (32): BrandDialog(), Step1Topic(), Step2Customize(), Step3Size(), Step4Template(), ProjectCard(), SectionCard(), navItems (+24 more)

### Community 10 - "TypeScript Build Config"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, **/*.ts (+19 more)

### Community 11 - "Project Creation Schema"
Cohesion: 0.14
Nodes (13): CONTENT_TYPES, CreateProjectInput, createProjectSchema, CTA_OPTIONS, FONTS, LANGUAGES, LEVELS, PLACEMENTS (+5 more)

### Community 12 - "Lint & Dev Dependencies"
Cohesion: 0.06
Nodes (30): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+22 more)

### Community 13 - "DB-to-Frontend Mapping"
Cohesion: 0.09
Nodes (38): ALL_LANGUAGES, ALL_TONES, demoBkSettings, demoSlide, LEVELS, SECTIONS, SlideRenderProps, createBlankProject() (+30 more)

### Community 14 - "Core App Routes Overview"
Cohesion: 0.05
Nodes (39): 1. Getting Started, 2. Code Conventions, 3.1 Add a New Template, 3.2 Add a New Content Type, 3.3 Add a New Page, 3.4 Add a New Server Action, 3.5 Add a New Database Column, 3.6 Modify the AI System Prompt (+31 more)

### Community 15 - "UI Library Dependencies"
Cohesion: 0.06
Nodes (33): class-variance-authority, clsx, framer-motion, @hookform/resolvers, html-to-image, jszip, lucide-react, next (+25 more)

### Community 16 - "Projects Page & Actions"
Cohesion: 0.11
Nodes (26): buildDesignBrief(), buildPrompt(), callChatCompletion(), ChatCompletionOptions, ChatMessage, CONTENT_TYPE_INSTRUCTIONS, editSystemPrompt(), editTemplateSystem() (+18 more)

### Community 17 - "Template Favorites & Export Step"
Cohesion: 0.16
Nodes (16): toggleTemplateFavoriteAction(), TemplateDialog(), Step6Export(), demoBkSettings, demoBrandKit, demoContent, demoEnding, demoSlide (+8 more)

### Community 18 - "Architecture Tech Stack"
Cohesion: 0.07
Nodes (27): 10. Environment Variables, 11. Key Design Decisions, 1. What is Typo AI?, 2. Tech Stack, 3. Directory Structure, 4.1 Content Generation Flow, 4.2 Export Flow, 4.3 Auth Flow (+19 more)

### Community 19 - "Feature Flags & Conventions"
Cohesion: 0.25
Nodes (7): Account Mode, General and Medical Account Modes, Generation and Export, Goal, Presentation and Compatibility, Validation, Wizard and Templates

### Community 20 - "Wizard Content Options"
Cohesion: 0.15
Nodes (16): DEFAULT_DESIGNER_SETTINGS, DENSITY_LABELS, DesignerSettingsProps, FONT_SIZE_LABELS, AI_MODEL_IDS, aiModelSchema, CANVAS_SIZE_DIMENSIONS, CANVAS_SIZES (+8 more)

### Community 21 - "Slide Render Props Demo"
Cohesion: 0.22
Nodes (11): ScaledSlide(), AppContext, AppContextValue, AppData, AppUser, Stats, CONTENT_MODES, ContentMode (+3 more)

### Community 23 - "Brand Kit & Slide Editor"
Cohesion: 0.09
Nodes (21): 20 قالبًا تصميميًا, Typo AI — وصف المشروع, إدارة المشاريع, الترخيص, التشغيل, التصدير, التصدير, التقنيات (+13 more)

### Community 24 - "Package Manifest"
Cohesion: 0.13
Nodes (14): Console and network notes, Coverage, Final result, Findings, Manual QA Report, QA-001 — Medium — Landing-page generator is non-functional, QA-002 — Medium — Unauthorized generation is exposed as an unhandled error state, QA-003 — Medium — “Return to settings” navigates to templates (+6 more)

### Community 25 - "QA: Generator No Effect Bug"
Cohesion: 0.27
Nodes (10): استعرض القوالب (Browse Templates) Button, Bug: Clicking Generate Produces No Visible Effect, Generated Content Template Previews (3 slide cards), Doctor Consultation Disclaimer Footer Item (تنبيه استشارة الطبيب), توليد المحتوى (Generate Content) Button, Automatic Medical Review Badge (مراجعة طبية تلقائية على كل محتوى), QA Screenshot: Generator Has No Effect (Issue 002), ابدأ مجانًا (Start Free) CTA Button (+2 more)

### Community 27 - "Desktop Landing Page"
Cohesion: 0.31
Nodes (9): Typo AI Desktop Home Page (Screenshot), Three Generated Carousel Preview Cards, Content Generator Input Widget (topic field + 'Generate Content' button + carousel previews), CTA Buttons: 'Start Free' and 'Browse Templates', Hero Headline: 'Turn any health topic into an accurate, publish-ready carousel', Concept: Medical Account Mode (disclaimer-gated experience), Badge: 'Medically-made tool - by a doctor', Trust Note: 'Automatic medical review on all content' (+1 more)

### Community 31 - "Account Mode Wizard Plan"
Cohesion: 0.25
Nodes (7): Account Mode Wizard Implementation Plan, Global Constraints, Task 1: Persist and expose account mode, Task 2: Collect and edit mode, Task 3: Split the creation flow and AI behavior, Task 4: Enforce medical export safety and neutral public pages, Task 5: Verify and document

### Community 32 - "QA: Mobile Menu Bug"
Cohesion: 0.47
Nodes (6): Content Generation Form (topic input + "Generate Content" button), Hamburger Menu Button (top-left, orange outline), "Doctor-verified medical content tool" tagline and hero headline (Arabic, RTL), Reported Mobile Menu Bug (Issue 001) — nature of defect not visually evident in screenshot, Issue 001: Mobile Menu QA Screenshot, Typo AI Logo/Branding (top-right)

### Community 33 - "QA: OTP Verification Screen"
Cohesion: 0.47
Nodes (6): Confirm Email Button (تأكيد البريد), Email Verification Screen (Arabic RTL), 6-Digit OTP Code Input Field, Resend Code Action (إعادة إرسال الرمز), Issue 006 - OTP Input Screenshot, Typo AI Branding/Navbar

### Community 35 - "ESLint Config"
Cohesion: 0.40
Nodes (4): extends, rules, @next/next/no-img-element, next/core-web-vitals

### Community 36 - "UI-UX Pro Max Skill"
Cohesion: 0.07
Nodes (29): Accessibility, Available Domains, Available Stacks, Common Rules for Professional UI, Example Workflow, How to Use This Skill, Icons & Visual Elements, Interaction (+21 more)

### Community 37 - "QA: Unlabeled Controls"
Cohesion: 0.50
Nodes (5): Accessibility Issue: Missing Control Labels, Unlabeled Password Visibility Toggle (Eye Icon), QA Screenshot: Unlabeled Controls (Issue 008), Typo AI Sign-In Page (Arabic RTL), Typo AI Product

### Community 38 - "Opencode Plugin Dependency"
Cohesion: 0.50
Nodes (3): @opencode-ai/plugin, dependencies, @opencode-ai/plugin

### Community 39 - "Carousel Wizard & Unauthorized Bug"
Cohesion: 0.67
Nodes (4): Carousel Creation Wizard (6-step flow), Retry Generation Action (إعادة المحاولة), Size and Slides Step (Step 3 of Carousel Wizard), Unauthorized Generation Bug

### Community 40 - "QA: Invalid Project Route"
Cohesion: 0.67
Nodes (4): Invalid Project Route Bug (no error/redirect handling), "My Projects" (مشاريعي) Dashboard UI - Empty State, Issue 007: Invalid Project Route Screenshot, Typo AI Application (RTL Arabic UI)

### Community 41 - "QA: Reset Link Nav Bug"
Cohesion: 0.50
Nodes (4): Issue 011: Reset Link Page Navigation Bug, Password Reset Flow, Reset Password Page Screenshot (Issue 011 - Reset Link No Nav), Typo AI Product Branding

### Community 42 - "QA: Raw Reset Error"
Cohesion: 0.83
Nodes (4): "Auth session missing!" raw error message, Password Reset Page (إعادة تعيين كلمة المرور), Issue 012: Raw Reset Error Screenshot, Typo AI product (Arabic RTL web app)

### Community 43 - "Mobile Home Medical Badge"
Cohesion: 0.67
Nodes (4): Made-by-a-Doctor Tool Badge, Generate Content CTA with Migraine Example Prompt, Automatic Medical Review Disclaimer Badge, Typo AI Mobile Home Screen (After Wait)

### Community 44 - "QA: Mobile Home Empty State"
Cohesion: 0.50
Nodes (4): Empty/Blank Content Area Below Header, Hamburger Menu Icon, Mobile Home Screen (Typo AI), Typo AI Header Branding

### Community 45 - "Database Types (dup A)"
Cohesion: 0.50
Nodes (3): Database, Json, Tables

### Community 46 - "Database Types (dup B)"
Cohesion: 0.50
Nodes (3): Database, Json, Tables

### Community 47 - "QA: Empty Topic Advances Bug"
Cohesion: 1.00
Nodes (3): Content-to-Carousel Wizard (Arabic RTL, 6-step), Issue 003: Empty Topic Advances Past Step 1, Medical Specialty Selector (طب عام selected)

### Community 211 - "custom-templates.ts"
Cohesion: 0.24
Nodes (16): DesignerAccess, editTemplateAction(), generateTemplateAction(), getAccess(), getMyCustomTemplatesAction(), getTemplateDesignerAccessAction(), providerCost(), requireUser() (+8 more)

### Community 212 - "isolated-preview.tsx"
Cohesion: 0.23
Nodes (12): DESIGNER_SAMPLE_VALUES, IsolatedTemplatePreview(), IsolatedTemplatePreviewProps, ScaledIsolatedPreview(), ScaledIsolatedPreviewProps, MergeOptions, mergeSlides(), buildSrcDoc() (+4 more)

### Community 213 - "page.tsx"
Cohesion: 0.45
Nodes (8): ExportPage(), Badge(), downloadDataUrl(), exportAllToZip(), exportSlideToPng(), slidesToBlobs(), waitForFonts(), SIZES

### Community 214 - "version-history.tsx"
Cohesion: 0.43
Nodes (5): DesignerVersion, SOURCE_LABELS, VersionHistory(), VersionHistoryProps, GeneratedSlide

### Community 215 - "chat-panel.tsx"
Cohesion: 0.40
Nodes (5): ChatMessage, ChatPanel(), ChatPanelProps, AVAILABLE_AI_MODELS, DESIGNER_PROGRESS_MESSAGES

## Ambiguous Edges - Review These
- `Content Generator Input Widget (topic field + 'Generate Content' button + carousel previews)` → `Concept: Medical Account Mode (disclaimer-gated experience)`  [AMBIGUOUS]
  qa-screenshots/desktop-home.png · relation: conceptually_related_to
- `Hamburger Menu Button (top-left, orange outline)` → `Reported Mobile Menu Bug (Issue 001) — nature of defect not visually evident in screenshot`  [AMBIGUOUS]
  qa-screenshots/issue-001-mobile-menu.png · relation: conceptually_related_to
- `Issue 006 - OTP Input Screenshot` → `6-Digit OTP Code Input Field`  [AMBIGUOUS]
  qa-screenshots/issue-006-otp-input.png · relation: semantically_similar_to
- `Invalid Project Route Bug (no error/redirect handling)` → `"My Projects" (مشاريعي) Dashboard UI - Empty State`  [AMBIGUOUS]
  qa-screenshots/issue-007-invalid-project-route.png · relation: conceptually_related_to
- `Reset Password Page Screenshot (Issue 011 - Reset Link No Nav)` → `Issue 011: Reset Link Page Navigation Bug`  [AMBIGUOUS]
  qa-screenshots/issue-011-reset-link-no-nav.png · relation: conceptually_related_to

## Knowledge Gaps
- **571 isolated node(s):** `extends`, `next/core-web-vitals`, `@next/next/no-img-element`, `@opencode-ai/plugin`, `config` (+566 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **168 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Content Generator Input Widget (topic field + 'Generate Content' button + carousel previews)` and `Concept: Medical Account Mode (disclaimer-gated experience)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Hamburger Menu Button (top-left, orange outline)` and `Reported Mobile Menu Bug (Issue 001) — nature of defect not visually evident in screenshot`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Issue 006 - OTP Input Screenshot` and `6-Digit OTP Code Input Field`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Invalid Project Route Bug (no error/redirect handling)` and `"My Projects" (مشاريعي) Dashboard UI - Empty State`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Reset Password Page Screenshot (Issue 011 - Reset Link No Nav)` and `Issue 011: Reset Link Page Navigation Bug`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `UI Library Dependencies` to `Lint & Dev Dependencies`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `jszip` connect `UI Library Dependencies` to `Export & ZIP Pipeline`, `page.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
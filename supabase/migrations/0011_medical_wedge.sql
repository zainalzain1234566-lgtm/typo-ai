-- Migration 0011: Medical Wedge — new tables, modified tables, RLS, seeds
-- Idempotent: safe to re-run
-- =============================================================

-- ============ specialties (reference table) ============
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ medical_review_results ============
CREATE TABLE IF NOT EXISTS medical_review_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slide_id uuid REFERENCES slides(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verdict text NOT NULL DEFAULT 'pending'
    CHECK (verdict IN ('pending', 'pass', 'needs_review', 'blocked')),
  flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_review_project ON medical_review_results(project_id);
CREATE INDEX IF NOT EXISTS idx_medical_review_user ON medical_review_results(user_id);

-- ============ content_sources ============
CREATE TABLE IF NOT EXISTS content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slide_id uuid REFERENCES slides(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type text NOT NULL DEFAULT 'general'
    CHECK (source_type IN ('who', 'cdc', 'mayo_clinic', 'journal', 'guideline', 'textbook', 'general')),
  title text NOT NULL,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_sources_project ON content_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_user ON content_sources(user_id);

-- ============ hooks_library ============
CREATE TABLE IF NOT EXISTS hooks_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  hook_text_ar text NOT NULL,
  specialty text REFERENCES specialties(slug) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hooks_unique ON hooks_library(category, hook_text_ar);
CREATE INDEX IF NOT EXISTS idx_hooks_category ON hooks_library(category);
CREATE INDEX IF NOT EXISTS idx_hooks_specialty ON hooks_library(specialty);

-- ============ Modified: templates ============
ALTER TABLE templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'
  CHECK (category IN ('medical', 'general'));
ALTER TABLE templates ADD COLUMN IF NOT EXISTS specialty_slug text REFERENCES specialties(slug) ON DELETE SET NULL;

UPDATE templates SET category = 'medical' WHERE slug IN ('tahrir', 'wadeh', 'noqta', 'itar', 'mujaz', 'academy', 'hadith', 'tabayun');

-- ============ Modified: brand_kits ============
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS disclaimer_text text;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS show_disclaimer boolean NOT NULL DEFAULT true;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS default_specialty text REFERENCES specialties(slug) ON DELETE SET NULL;

-- ============ Modified: projects ============
ALTER TABLE projects ADD COLUMN IF NOT EXISTS specialty_slug text REFERENCES specialties(slug) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requires_medical_review boolean NOT NULL DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_disclaimer boolean NOT NULL DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'pending'
  CHECK (review_status IN ('pending', 'pass', 'needs_review', 'blocked'));

-- ============ Modified: slides ============
ALTER TABLE slides ADD COLUMN IF NOT EXISTS has_source boolean NOT NULL DEFAULT false;

-- ============ RLS: medical_review_results ============
ALTER TABLE medical_review_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_medical_reviews" ON medical_review_results;
DROP POLICY IF EXISTS "users_insert_own_medical_reviews" ON medical_review_results;
DROP POLICY IF EXISTS "users_update_own_medical_reviews" ON medical_review_results;
DROP POLICY IF EXISTS "users_delete_own_medical_reviews" ON medical_review_results;

CREATE POLICY "users_select_own_medical_reviews" ON medical_review_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_medical_reviews" ON medical_review_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_medical_reviews" ON medical_review_results
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_medical_reviews" ON medical_review_results
  FOR DELETE USING (auth.uid() = user_id);

-- ============ RLS: content_sources ============
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_sources" ON content_sources;
DROP POLICY IF EXISTS "users_insert_own_sources" ON content_sources;
DROP POLICY IF EXISTS "users_update_own_sources" ON content_sources;
DROP POLICY IF EXISTS "users_delete_own_sources" ON content_sources;

CREATE POLICY "users_select_own_sources" ON content_sources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_sources" ON content_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_sources" ON content_sources
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_sources" ON content_sources
  FOR DELETE USING (auth.uid() = user_id);

-- ============ RLS: hooks_library (read-only for users) ============
ALTER TABLE hooks_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_hooks" ON hooks_library;

CREATE POLICY "users_read_hooks" ON hooks_library
  FOR SELECT USING (is_active = true);

-- ============ Seed: specialties ============
INSERT INTO specialties (slug, name_ar, name_en, sort_order) VALUES
  ('general', 'طب عام', 'General Health', 1),
  ('dentistry', 'طب الأسنان', 'Dentistry', 2),
  ('dermatology', 'الجلدية', 'Dermatology', 3),
  ('nutrition', 'التغذية', 'Nutrition', 4),
  ('pediatrics', 'طب الأطفال', 'Pediatrics', 5),
  ('cardiology', 'أمراض القلب', 'Cardiology', 6),
  ('neurology', 'الأعصاب', 'Neurology', 7),
  ('mental_health', 'الصحة النفسية', 'Mental Health', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============ Seed: hooks_library ============
INSERT INTO hooks_library (category, hook_text_ar, specialty, is_active) VALUES
  ('awareness', 'هل تعلم أن % من الناس لا يعرفون أعراض هذا المرض؟', 'general', true),
  ('awareness', 'صدمت عندما عرفت الحقيقة عن...', 'general', true),
  ('awareness', 'هذا العرض الذي تتجاهله قد يكون إنذارًا', 'cardiology', true),
  ('myth_busting', 'خرافة شائعة يصدقها الكثيرون: ...', 'general', true),
  ('myth_busting', 'هل سمعت أن السكر يسبب فرط الحركة؟ الحقيقة مختلفة', 'pediatrics', true),
  ('myth_busting', 'لا، ليس كل ما تسمعه عن التغذية صحيح', 'nutrition', true),
  ('condition_explainer', 'ما هو مرض... وكيف يؤثر على حياتك؟', 'general', true),
  ('condition_explainer', 'دعنا نفهم معًا ما يحدث في جسمك عند...', 'cardiology', true),
  ('tips', 'نصيحة طبية بسيطة قد تغير يومك', 'general', true),
  ('tips', '٥ عادات صباحية يحبها قلبك', 'cardiology', true),
  ('tips', 'كيف تحمي أسنانك في ٣ خطوات؟', 'dentistry', true),
  ('steps', 'خطوات بسيطة للعناية ببشرتك', 'dermatology', true),
  ('steps', 'ماذا تفعل عند الإصابة بـ...؟', 'general', true),
  ('awareness', 'صحة طفلك تبدأ من هنا', 'pediatrics', true),
  ('awareness', 'لا تتجاهل هذه العلامات على بشرتك', 'dermatology', true),
  ('mental_health', 'الصحة النفسية ليست رفاهية — تعرف على كيفية العناية بها', 'mental_health', true)
ON CONFLICT (category, hook_text_ar) DO NOTHING;

-- ============ Seed: default disclaimer text in brand_kits ============
UPDATE brand_kits SET disclaimer_text = 'هذا المحتوى للتوعية فقط ولا يغني عن استشارة الطبيب'
  WHERE disclaimer_text IS NULL;

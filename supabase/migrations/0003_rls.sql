-- Migration 0003: RLS Policies
-- ===========================

-- Enable RLS on all user-data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_usage ENABLE ROW LEVEL SECURITY;

-- Templates: public read, no user writes
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_palettes ENABLE ROW LEVEL SECURITY;

-- ============ profiles ============
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============ brand_kits ============
CREATE POLICY "brand_kits_select_own" ON brand_kits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "brand_kits_insert_own" ON brand_kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_kits_update_own" ON brand_kits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "brand_kits_delete_own" ON brand_kits
  FOR DELETE USING (auth.uid() = user_id);

-- ============ user_preferences ============
CREATE POLICY "prefs_select_own" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prefs_insert_own" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============ folders ============
CREATE POLICY "folders_select_own" ON folders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "folders_insert_own" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "folders_update_own" ON folders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "folders_delete_own" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- ============ templates (public read) ============
CREATE POLICY "templates_select_all" ON templates
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "palettes_select_all" ON template_palettes
  FOR SELECT TO anon, authenticated USING (true);

-- ============ favorite_templates ============
CREATE POLICY "fav_templates_select_own" ON favorite_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fav_templates_insert_own" ON favorite_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fav_templates_delete_own" ON favorite_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ============ projects ============
CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============ slides ============
CREATE POLICY "slides_select_own" ON slides
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "slides_insert_own" ON slides
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "slides_update_own" ON slides
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "slides_delete_own" ON slides
  FOR DELETE USING (auth.uid() = user_id);

-- ============ export_records ============
CREATE POLICY "exports_select_own" ON export_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exports_insert_own" ON export_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ generation_jobs ============
CREATE POLICY "genjobs_select_own" ON generation_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "genjobs_insert_own" ON generation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "genjobs_update_own" ON generation_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- ============ account_usage ============
CREATE POLICY "usage_select_own" ON account_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_update_own" ON account_usage
  FOR UPDATE USING (auth.uid() = user_id);

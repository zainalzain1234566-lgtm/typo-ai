-- Migration 0001: Extensions and Tables
-- =============================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_path text,
  instagram_username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ brand_kits ============
CREATE TABLE IF NOT EXISTS brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_username text,
  logo_path text,
  primary_color text,
  default_font text NOT NULL DEFAULT 'tajawal'
    CHECK (default_font IN ('tajawal', 'cairo', 'ibm-plex-sans-arabic')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ user_preferences ============
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  default_language text NOT NULL DEFAULT 'ar-fusha',
  default_tone text NOT NULL DEFAULT 'simple',
  default_level text NOT NULL DEFAULT 'beginner',
  default_size text NOT NULL DEFAULT 'portrait'
    CHECK (default_size IN ('square', 'portrait', 'story')),
  default_slide_count integer NOT NULL DEFAULT 6
    CHECK (default_slide_count BETWEEN 2 AND 10),
  preferred_template_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ folders ============
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- ============ templates ============
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  description_ar text,
  component_key text NOT NULL UNIQUE,
  thumbnail_path text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  supported_sizes text[] NOT NULL,
  supported_fonts text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ template_palettes ============
CREATE TABLE IF NOT EXISTS template_palettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  background_color text NOT NULL,
  text_color text NOT NULL,
  accent_color text NOT NULL,
  secondary_color text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ favorite_templates ============
CREATE TABLE IF NOT EXISTS favorite_templates (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);

-- ============ projects ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  palette_id uuid REFERENCES template_palettes(id) ON DELETE SET NULL,
  title text NOT NULL,
  topic text NOT NULL,
  content_type text NOT NULL,
  target_audience text,
  content_level text NOT NULL,
  tone text NOT NULL,
  language text NOT NULL,
  size text NOT NULL
    CHECK (size IN ('square', 'portrait', 'story')),
  width integer NOT NULL,
  height integer NOT NULL,
  slide_count integer NOT NULL
    CHECK (slide_count BETWEEN 2 AND 10),
  cta_type text,
  font_family text NOT NULL DEFAULT 'tajawal',
  use_brand_kit boolean NOT NULL DEFAULT true,
  show_logo boolean NOT NULL DEFAULT true,
  show_account_name boolean NOT NULL DEFAULT true,
  show_slide_number boolean NOT NULL DEFAULT true,
  logo_position text NOT NULL DEFAULT 'bottom-right',
  account_name_position text NOT NULL DEFAULT 'bottom-left',
  caption text,
  hashtags text,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'archived')),
  is_favorite boolean NOT NULL DEFAULT false,
  last_exported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ slides ============
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position integer NOT NULL,
  slide_type text NOT NULL
    CHECK (slide_type IN ('cover', 'content', 'summary', 'cta')),
  title text,
  body text,
  cta_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, position),
  CHECK (position >= 1)
);

-- ============ export_records ============
CREATE TABLE IF NOT EXISTS export_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  export_type text NOT NULL
    CHECK (export_type IN ('single_png', 'zip')),
  slide_id uuid REFERENCES slides(id) ON DELETE SET NULL,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ generation_jobs ============
CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  provider text,
  model text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ============ account_usage ============
CREATE TABLE IF NOT EXISTS account_usage (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  projects_created integer NOT NULL DEFAULT 0,
  generations_used integer NOT NULL DEFAULT 0,
  exports_used integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

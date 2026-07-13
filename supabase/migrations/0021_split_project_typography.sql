-- Split project typography into independent title and body controls.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS title_font_family text,
  ADD COLUMN IF NOT EXISTS title_font_size_scale real,
  ADD COLUMN IF NOT EXISTS title_text_align text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS body_text_align text NOT NULL DEFAULT 'auto';

UPDATE public.projects
SET
  title_font_family = font_family,
  title_font_size_scale = font_size_scale
WHERE title_font_family IS NULL OR title_font_size_scale IS NULL;

ALTER TABLE public.projects
  ALTER COLUMN title_font_family SET DEFAULT 'tajawal',
  ALTER COLUMN title_font_family SET NOT NULL,
  ALTER COLUMN title_font_size_scale SET DEFAULT 1.0,
  ALTER COLUMN title_font_size_scale SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_title_font_family_check') THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_title_font_family_check
      CHECK (title_font_family IN ('tajawal', 'cairo', 'ibm-plex-sans-arabic'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_title_font_size_scale_check') THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_title_font_size_scale_check
      CHECK (title_font_size_scale BETWEEN 0.8 AND 1.3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_title_text_align_check') THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_title_text_align_check
      CHECK (title_text_align IN ('auto', 'right', 'center', 'left'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_body_text_align_check') THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_body_text_align_check
      CHECK (body_text_align IN ('auto', 'right', 'center', 'left'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.duplicate_project(p_project_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_new_id uuid := gen_random_uuid();
  v_old_project public.projects%ROWTYPE;
  v_slide public.slides%ROWTYPE;
BEGIN
  SELECT * INTO v_old_project
  FROM public.projects
  WHERE id = p_project_id AND user_id = v_user_id;

  IF v_old_project.id IS NULL THEN
    RAISE EXCEPTION 'PROJECT_NOT_FOUND';
  END IF;

  INSERT INTO public.projects (
    id, user_id, folder_id, template_id, palette_id,
    title, topic, content_type, target_audience, content_level,
    tone, language, size, width, height, slide_count, cta_type,
    font_family, font_size_scale, title_font_family, title_font_size_scale,
    title_text_align, body_text_align,
    use_brand_kit, show_logo, show_account_name, show_slide_number,
    logo_position, account_name_position, caption, hashtags,
    specialty_slug, requires_medical_review, show_disclaimer, review_status,
    status, is_favorite
  ) VALUES (
    v_new_id, v_user_id, v_old_project.folder_id, v_old_project.template_id, v_old_project.palette_id,
    'نسخة من ' || v_old_project.title, v_old_project.topic, v_old_project.content_type,
    v_old_project.target_audience, v_old_project.content_level,
    v_old_project.tone, v_old_project.language, v_old_project.size,
    v_old_project.width, v_old_project.height, v_old_project.slide_count,
    v_old_project.cta_type,
    v_old_project.font_family, v_old_project.font_size_scale,
    v_old_project.title_font_family, v_old_project.title_font_size_scale,
    v_old_project.title_text_align, v_old_project.body_text_align,
    v_old_project.use_brand_kit, v_old_project.show_logo,
    v_old_project.show_account_name, v_old_project.show_slide_number,
    v_old_project.logo_position, v_old_project.account_name_position,
    v_old_project.caption, v_old_project.hashtags,
    v_old_project.specialty_slug, v_old_project.requires_medical_review,
    v_old_project.show_disclaimer, v_old_project.review_status,
    'in_progress', false
  );

  FOR v_slide IN
    SELECT * FROM public.slides WHERE project_id = p_project_id ORDER BY position
  LOOP
    INSERT INTO public.slides (project_id, user_id, position, slide_type, title, body, cta_text, has_source)
    VALUES (
      v_new_id, v_user_id, v_slide.position, v_slide.slide_type,
      v_slide.title, v_slide.body, v_slide.cta_text, v_slide.has_source
    );
  END LOOP;

  RETURN v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.duplicate_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.duplicate_project(uuid) TO authenticated;

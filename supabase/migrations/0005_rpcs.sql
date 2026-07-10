-- Migration 0005: RPC Functions
-- =============================

-- ============ get_dashboard_stats ============
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_total integer;
  v_completed integer;
  v_exports integer;
  v_fav_templates integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthenticated');
  END IF;

  SELECT COUNT(*) INTO v_total FROM projects WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_completed FROM projects WHERE user_id = v_user_id AND status = 'completed';
  SELECT COUNT(*) INTO v_exports FROM export_records WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_fav_templates FROM favorite_templates WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'total_projects', v_total,
    'completed_projects', v_completed,
    'export_count', v_exports,
    'favorite_templates', v_fav_templates
  );
END;
$$;

-- ============ reorder_project_slides ============
CREATE OR REPLACE FUNCTION reorder_project_slides(
  p_project_id uuid,
  p_ordered_slide_ids uuid[]
)
RETURNS SETOF slides
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_project_owner uuid;
  v_slide_count integer;
  v_first_type text;
  v_last_type text;
  v_id uuid;
  v_pos integer := 1;
BEGIN
  -- Check ownership
  SELECT user_id INTO v_project_owner FROM projects WHERE id = p_project_id;
  IF v_project_owner IS NULL OR v_project_owner != v_user_id THEN
    RAISE EXCEPTION 'PROJECT_NOT_FOUND';
  END IF;

  -- Check all slides belong to project
  SELECT COUNT(*) INTO v_slide_count FROM slides
  WHERE project_id = p_project_id AND id = ANY(p_ordered_slide_ids);
  IF v_slide_count != array_length(p_ordered_slide_ids, 1) THEN
    RAISE EXCEPTION 'SLIDES_MISMATCH';
  END IF;

  -- Check all project slides are included
  SELECT COUNT(*) INTO v_slide_count FROM slides WHERE project_id = p_project_id;
  IF v_slide_count != array_length(p_ordered_slide_ids, 1) THEN
    RAISE EXCEPTION 'SLIDES_INCOMPLETE';
  END IF;

  -- Check cover is first
  SELECT slide_type INTO v_first_type FROM slides
  WHERE id = p_ordered_slide_ids[1];
  IF v_first_type != 'cover' THEN
    RAISE EXCEPTION 'COVER_MUST_BE_FIRST';
  END IF;

  -- Check ending is last (summary or cta)
  SELECT slide_type INTO v_last_type FROM slides
  WHERE id = p_ordered_slide_ids[array_length(p_ordered_slide_ids, 1)];
  IF v_last_type NOT IN ('summary', 'cta') THEN
    RAISE EXCEPTION 'ENDING_MUST_BE_LAST';
  END IF;

  -- Apply temporary positions to avoid unique constraint violations
  FOREACH v_id IN ARRAY p_ordered_slide_ids LOOP
    UPDATE slides SET position = position + 10000 WHERE id = v_id AND project_id = p_project_id;
  END LOOP;

  -- Apply final positions
  FOREACH v_id IN ARRAY p_ordered_slide_ids LOOP
    UPDATE slides SET position = v_pos WHERE id = v_id AND project_id = p_project_id;
    v_pos := v_pos + 1;
  END LOOP;

  RETURN QUERY
  SELECT * FROM slides WHERE project_id = p_project_id ORDER BY position;
END;
$$;

-- ============ duplicate_project ============
CREATE OR REPLACE FUNCTION duplicate_project(
  p_project_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_project_owner uuid;
  v_new_id uuid;
  v_old_project RECORD;
  v_slide RECORD;
BEGIN
  -- Check ownership
  SELECT * INTO v_old_project FROM projects WHERE id = p_project_id;
  IF v_old_project.user_id IS NULL OR v_old_project.user_id != v_user_id THEN
    RAISE EXCEPTION 'PROJECT_NOT_FOUND';
  END IF;

  -- Create new project
  v_new_id := gen_random_uuid();
  INSERT INTO projects (
    id, user_id, folder_id, template_id, palette_id,
    title, topic, content_type, target_audience, content_level,
    tone, language, size, width, height, slide_count, cta_type,
    font_family, use_brand_kit, show_logo, show_account_name, show_slide_number,
    logo_position, account_name_position, caption, hashtags,
    status, is_favorite
  ) VALUES (
    v_new_id, v_user_id, v_old_project.folder_id, v_old_project.template_id, v_old_project.palette_id,
    'نسخة من ' || v_old_project.title, v_old_project.topic, v_old_project.content_type,
    v_old_project.target_audience, v_old_project.content_level,
    v_old_project.tone, v_old_project.language, v_old_project.size,
    v_old_project.width, v_old_project.height, v_old_project.slide_count,
    v_old_project.cta_type, v_old_project.font_family,
    v_old_project.use_brand_kit, v_old_project.show_logo,
    v_old_project.show_account_name, v_old_project.show_slide_number,
    v_old_project.logo_position, v_old_project.account_name_position,
    v_old_project.caption, v_old_project.hashtags,
    'in_progress', false
  );

  -- Copy slides
  FOR v_slide IN SELECT * FROM slides WHERE project_id = p_project_id ORDER BY position LOOP
    INSERT INTO slides (project_id, user_id, position, slide_type, title, body, cta_text)
    VALUES (
      v_new_id, v_user_id, v_slide.position, v_slide.slide_type,
      v_slide.title, v_slide.body, v_slide.cta_text
    );
  END LOOP;

  RETURN v_new_id;
END;
$$;

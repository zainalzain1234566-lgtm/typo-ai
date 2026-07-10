-- Migration 0008: increment_usage RPC
-- ===================================

CREATE OR REPLACE FUNCTION increment_usage(p_user_id uuid, p_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_field = 'projects_created' THEN
    UPDATE account_usage SET projects_created = projects_created + 1 WHERE user_id = p_user_id;
  ELSIF p_field = 'generations_used' THEN
    UPDATE account_usage SET generations_used = generations_used + 1 WHERE user_id = p_user_id;
  ELSIF p_field = 'exports_used' THEN
    UPDATE account_usage SET exports_used = exports_used + 1 WHERE user_id = p_user_id;
  END IF;
END;
$$;

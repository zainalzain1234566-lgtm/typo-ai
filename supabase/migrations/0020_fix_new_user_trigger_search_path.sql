-- Keep Auth-trigger table resolution independent of the caller's search path.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.brand_kits (user_id) VALUES (NEW.id);

  INSERT INTO public.user_preferences (user_id, content_mode)
  VALUES (
    NEW.id,
    CASE WHEN NEW.raw_user_meta_data->>'content_mode' = 'medical' THEN 'medical' ELSE 'general' END
  );

  INSERT INTO public.account_usage (user_id) VALUES (NEW.id);
  INSERT INTO public.account_entitlements (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

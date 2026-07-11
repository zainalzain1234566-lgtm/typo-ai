-- Migration 0014: General and medical account modes

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS content_mode text NOT NULL DEFAULT 'general'
  CHECK (content_mode IN ('general', 'medical'));

-- The product was medical-only before this migration; preserve that experience.
UPDATE user_preferences SET content_mode = 'medical';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO brand_kits (user_id)
  VALUES (NEW.id);

  INSERT INTO user_preferences (user_id, content_mode)
  VALUES (
    NEW.id,
    CASE WHEN NEW.raw_user_meta_data->>'content_mode' = 'medical' THEN 'medical' ELSE 'general' END
  );

  INSERT INTO account_usage (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

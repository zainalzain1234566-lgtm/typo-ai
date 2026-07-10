-- Migration 0002: Triggers
-- ========================

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER brand_kits_updated_at BEFORE UPDATE ON brand_kits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER slides_updated_at BEFORE UPDATE ON slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER account_usage_updated_at BEFORE UPDATE ON account_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on auth user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO brand_kits (user_id)
  VALUES (NEW.id);

  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO account_usage (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Migration 0004: Storage Buckets and Policies
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', false),
  ('brand-logos', 'brand-logos', false),
  ('project-exports', 'project-exports', false)
ON CONFLICT (id) DO NOTHING;

-- ============ avatars ============
CREATE POLICY "avatar_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatar_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatar_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatar_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============ brand-logos ============
CREATE POLICY "logo_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "logo_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "logo_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "logo_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============ project-exports ============
CREATE POLICY "exports_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "exports_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "exports_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

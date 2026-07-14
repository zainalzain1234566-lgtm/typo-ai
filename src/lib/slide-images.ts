import type { SupabaseClient } from "@supabase/supabase-js";

const PROJECT_IMAGE_BUCKET = "project-images";

export async function attachSignedImageUrls<T extends { image_path?: string | null }>(
  supabase: SupabaseClient,
  rows: T[],
  expiresInSeconds = 60 * 60 * 24,
): Promise<Array<T & { image_url?: string }>> {
  const paths = Array.from(new Set(rows.map((row) => row.image_path).filter((path): path is string => Boolean(path))));
  if (paths.length === 0) return rows;

  const { data, error } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .createSignedUrls(paths, expiresInSeconds);
  if (error || !data) return rows;

  const urls = new Map(data.map((entry) => [entry.path, entry.signedUrl ?? undefined]));
  return rows.map((row) => ({ ...row, image_url: row.image_path ? urls.get(row.image_path) : undefined }));
}

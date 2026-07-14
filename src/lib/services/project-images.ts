import type { SupabaseClient } from "@supabase/supabase-js";
import {
  downloadPexelsPhoto,
  getPexelsPhoto,
  searchPexelsPhotos,
  type PexelsPhotoOption,
} from "@/lib/services/pexels";

export const PROJECT_IMAGE_BUCKET = "project-images";

type ImageSlide = {
  id: string;
  title?: string | null;
  image_query?: string | null;
  image_path?: string | null;
  image_source_id?: string | null;
};

const extensionFor = (mime: string) => mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";

export async function storePexelsPhotoForSlide(
  supabase: SupabaseClient,
  userId: string,
  slideId: string,
  photo: PexelsPhotoOption,
  query: string,
): Promise<string> {
  const downloaded = await downloadPexelsPhoto(photo);
  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(downloaded.contentType)}`;
  const { error: uploadError } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .upload(path, downloaded.bytes, { contentType: downloaded.contentType, upsert: false });
  if (uploadError) throw new Error(`IMAGE_STORAGE_FAILED: ${uploadError.message}`);

  const { error: updateError } = await supabase
    .from("slides")
    .update({
      image_path: path,
      image_source: "pexels",
      image_query: query.trim().slice(0, 160),
      image_source_id: photo.id,
      image_source_url: photo.sourceUrl,
      image_photographer: photo.photographer,
      image_photographer_url: photo.photographerUrl,
      image_alt: photo.alt || query.trim().slice(0, 300),
      image_focal_position: "center",
    })
    .eq("id", slideId)
    .eq("user_id", userId);

  if (updateError) {
    await supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([path]);
    throw new Error(`IMAGE_METADATA_FAILED: ${updateError.message}`);
  }
  return path;
}

export async function selectAndStorePexelsPhoto(
  supabase: SupabaseClient,
  userId: string,
  slideId: string,
  photoId: string,
  query: string,
): Promise<string> {
  const photo = await getPexelsPhoto(photoId);
  return storePexelsPhotoForSlide(supabase, userId, slideId, photo, query);
}

export async function populateMissingSlideImages(
  supabase: SupabaseClient,
  userId: string,
  slides: ImageSlide[],
): Promise<{ generated: number; failed: number }> {
  const usedIds = new Set(slides.map((slide) => slide.image_source_id).filter(Boolean) as string[]);
  let generated = 0;
  let failed = 0;

  for (let offset = 0; offset < slides.length; offset += 3) {
    const batch = slides.slice(offset, offset + 3);
    await Promise.all(batch.map(async (slide) => {
      const query = slide.image_query?.trim() || slide.title?.trim();
      if (!query || slide.image_path) return;
      try {
        const candidates = await searchPexelsPhotos(query, 12);
        const selected = candidates.find((photo) => !usedIds.has(photo.id));
        if (!selected) throw new Error("PEXELS_NO_UNIQUE_RESULTS");
        usedIds.add(selected.id);
        await storePexelsPhotoForSlide(supabase, userId, slide.id, selected, query);
        generated++;
      } catch {
        failed++;
      }
    }));
  }

  return { generated, failed };
}

export async function removeProjectImageIfUnreferenced(
  supabase: SupabaseClient,
  userId: string,
  path?: string | null,
): Promise<void> {
  if (!path || !path.startsWith(`${userId}/`)) return;
  const { count } = await supabase
    .from("slides")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("image_path", path);
  if (count === 0) await supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([path]);
}


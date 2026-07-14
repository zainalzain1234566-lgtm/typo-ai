"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getPexelsPhoto,
  hasSupportedImageSignature,
  searchPexelsPhotos,
} from "@/lib/services/pexels";
import {
  populateMissingSlideImages,
  PROJECT_IMAGE_BUCKET,
  removeProjectImageIfUnreferenced,
  storePexelsPhotoForSlide,
} from "@/lib/services/project-images";
import type { ImageFocalPosition } from "@/lib/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function authenticatedSlide(slideId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" } as const;
  const { data: slide } = await supabase
    .from("slides")
    .select("id, project_id, title, image_query, image_path")
    .eq("id", slideId)
    .eq("user_id", user.id)
    .single();
  if (!slide) return { error: "الشريحة غير موجودة" } as const;
  return { supabase, user, slide } as const;
}

function imageError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("PEXELS_API_KEY_MISSING")) return "خدمة الصور غير مهيأة بعد";
  if (message.includes("PEXELS_RATE_LIMITED")) return "تم بلوغ حد خدمة الصور مؤقتًا، حاول لاحقًا";
  if (message.includes("NO_UNIQUE") || message.includes("NO_RESULTS")) return "لم نجد صورة مناسبة، جرّب عبارة بحث أخرى";
  return "تعذر جلب الصورة، حاول مرة أخرى";
}

export async function searchPexelsImagesAction(slideId: string, query: string) {
  const auth = await authenticatedSlide(slideId);
  if ("error" in auth) return { success: false, error: auth.error };
  try {
    const photos = await searchPexelsPhotos(query, 12);
    return { success: true, photos };
  } catch (error) {
    return { success: false, error: imageError(error) };
  }
}

export async function selectPexelsImageAction(slideId: string, photoId: string, query: string) {
  const auth = await authenticatedSlide(slideId);
  if ("error" in auth) return { success: false, error: auth.error };
  const normalizedQuery = query.trim().replace(/\s+/g, " ");
  if (!normalizedQuery || normalizedQuery.length > 160) return { success: false, error: "عبارة البحث غير صحيحة" };
  try {
    const photo = await getPexelsPhoto(photoId);
    await storePexelsPhotoForSlide(auth.supabase, auth.user.id, slideId, photo, normalizedQuery);
    await removeProjectImageIfUnreferenced(auth.supabase, auth.user.id, auth.slide.image_path);
    revalidatePath(`/projects/${auth.slide.project_id}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, error: imageError(error) };
  }
}

export async function uploadSlideImageAction(formData: FormData) {
  const slideId = String(formData.get("slideId") ?? "");
  const file = formData.get("file");
  const auth = await authenticatedSlide(slideId);
  if ("error" in auth) return { success: false, error: auth.error };
  if (!(file instanceof File)) return { success: false, error: "اختر ملف صورة" };
  if (!MIME_EXTENSIONS[file.type] || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "الصورة يجب أن تكون JPEG أو PNG أو WebP وبحجم لا يتجاوز 8MB" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasSupportedImageSignature(bytes, file.type)) return { success: false, error: "ملف الصورة غير صالح" };
  const path = `${auth.user.id}/${crypto.randomUUID()}.${MIME_EXTENSIONS[file.type]}`;
  const { error: uploadError } = await auth.supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { success: false, error: "تعذر رفع الصورة" };

  const { error: updateError } = await auth.supabase
    .from("slides")
    .update({
      image_path: path,
      image_source: "upload",
      image_source_id: null,
      image_source_url: null,
      image_photographer: null,
      image_photographer_url: null,
      image_alt: auth.slide.title || "صورة الشريحة",
      image_focal_position: "center",
    })
    .eq("id", slideId)
    .eq("user_id", auth.user.id);
  if (updateError) {
    await auth.supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([path]);
    return { success: false, error: "تعذر حفظ الصورة" };
  }

  await removeProjectImageIfUnreferenced(auth.supabase, auth.user.id, auth.slide.image_path);
  revalidatePath(`/projects/${auth.slide.project_id}/edit`);
  return { success: true };
}

export async function generateMissingProjectImagesAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: project } = await supabase
    .from("projects")
    .select("id, template:templates(slug)")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
  const template = project?.template as unknown as { slug?: string } | null;
  if (!project || template?.slug !== "laqta") return { success: false, error: "هذا الإجراء متاح لقالب لقطة فقط" };

  const { data: slides, error } = await supabase
    .from("slides")
    .select("id, title, image_query, image_path, image_source_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("position");
  if (error || !slides) return { success: false, error: "تعذر جلب الشرائح" };
  const missing = slides.filter((slide) => !slide.image_path);
  if (missing.length === 0) return { success: true, generated: 0, failed: 0 };

  try {
    const result = await populateMissingSlideImages(supabase, user.id, slides);
    revalidatePath(`/projects/${projectId}/edit`);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: imageError(error) };
  }
}

export async function updateSlideImagePositionAction(slideId: string, focalPosition: ImageFocalPosition) {
  const allowed: ImageFocalPosition[] = ["center", "top", "bottom", "left", "right"];
  if (!allowed.includes(focalPosition)) return { success: false, error: "موضع الصورة غير صحيح" };
  const auth = await authenticatedSlide(slideId);
  if ("error" in auth) return { success: false, error: auth.error };
  const { error } = await auth.supabase
    .from("slides")
    .update({ image_focal_position: focalPosition })
    .eq("id", slideId)
    .eq("user_id", auth.user.id);
  if (error) return { success: false, error: "تعذر حفظ موضع الصورة" };
  return { success: true };
}

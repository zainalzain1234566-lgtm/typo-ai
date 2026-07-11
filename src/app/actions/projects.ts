"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createProjectSchema, updateProjectSchema, SIZE_MAP } from "@/lib/validation/projects";
import { getGenerationProvider, type GenerationInput, reviewMedicalContent } from "@/lib/services/generation";
import { reorderSlidesSchema, updateSlideSchema } from "@/lib/validation/slides";
import { log, logError } from "@/lib/logger";
import { AI_DEFAULT_BASE_URL, AI_DEFAULT_MODEL } from "@/lib/constants";

// ============= Create project with generation =============

export async function createProjectAction(input: Record<string, unknown>) {
  log("PROJECT", "create attempt", { title: input.title, templateId: input.template_id });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    const firstErr = parsed.error.errors[0];
    const field = firstErr.path.join(".");
    logError("PROJECT", `validation failed: ${field}: ${firstErr.message}`, input);
    return { success: false, error: `الحقل "${field}" — ${firstErr.message}` };
  }

  const dims = SIZE_MAP[parsed.data.size as keyof typeof SIZE_MAP];
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("content_mode")
    .eq("user_id", user.id)
    .single();
  const isMedical = preferences?.content_mode === "medical";

  // Validate template exists
  const { data: template } = await supabase
    .from("templates")
    .select("id, category")
    .eq("id", parsed.data.template_id)
    .eq("is_active", true)
    .single();
  if (!template || template.category !== (isMedical ? "medical" : "general")) {
    logError("PROJECT", "template not found", parsed.data.template_id);
    return { success: false, error: "القالب غير موجود" };
  }

  // Validate palette belongs to template
  const { data: palette } = await supabase
    .from("template_palettes")
    .select("id")
    .eq("id", parsed.data.palette_id)
    .eq("template_id", parsed.data.template_id)
    .single();
  if (!palette) {
    logError("PROJECT", "palette not found", parsed.data.palette_id);
    return { success: false, error: "اللوحة اللونية غير صحيحة" };
  }

  // Insert project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      folder_id: parsed.data.folder_id ?? null,
      template_id: parsed.data.template_id,
      palette_id: parsed.data.palette_id,
      title: parsed.data.title,
      topic: parsed.data.topic,
      content_type: parsed.data.content_type,
      target_audience: parsed.data.target_audience ?? null,
      content_level: parsed.data.content_level,
      tone: parsed.data.tone,
      language: parsed.data.language,
      size: parsed.data.size,
      width: dims.width,
      height: dims.height,
      slide_count: parsed.data.slide_count,
      cta_type: parsed.data.cta_type,
      font_family: parsed.data.font_family,
      use_brand_kit: parsed.data.use_brand_kit,
      show_logo: parsed.data.show_logo,
      show_account_name: parsed.data.show_account_name,
      show_slide_number: parsed.data.show_slide_number,
      show_disclaimer: isMedical && parsed.data.show_disclaimer,
      logo_position: parsed.data.logo_position,
      account_name_position: parsed.data.account_name_position,
      specialty_slug: isMedical ? parsed.data.specialty_slug ?? null : null,
      requires_medical_review: isMedical,
      review_status: isMedical ? "pending" : null,
      status: "in_progress",
    })
    .select()
    .single();

  if (projectError) {
    logError("PROJECT", "insert failed", projectError.message);
    return { success: false, error: "تعذر إنشاء المشروع" };
  }
  log("PROJECT", "inserted", { projectId: project.id });

  // Increment usage
  await supabase.rpc("increment_usage", { p_user_id: user.id, p_field: "projects_created" });

  // Create generation job
  const { data: genJob, error: genJobErr } = await supabase
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      project_id: project.id,
      status: "pending",
    })
    .select()
    .single();

  if (genJobErr || !genJob) {
    logError("PROJECT", "gen_job insert failed", genJobErr?.message ?? "no data returned");
    return { success: false, error: "تعذر إنشاء مهمة التوليد" };
  }

  // Generate content
  await supabase
    .from("generation_jobs")
    .update({ status: "processing" })
    .eq("id", genJob.id);

  try {
    const provider = getGenerationProvider();
    const genInput: GenerationInput = {
      topic: parsed.data.topic,
      contentType: parsed.data.content_type,
      targetAudience: parsed.data.target_audience ?? "",
      level: parsed.data.content_level,
      tone: parsed.data.tone,
      language: parsed.data.language,
      slideCount: parsed.data.slide_count,
      ctaType: parsed.data.cta_type,
      isMedical,
    };

    const generated = await provider.generate(genInput);
    log("PROJECT", "content generated", { slides: generated.slides.length, provider: "external" });

    // Insert slides
    const slideRows = generated.slides.map((s, i) => ({
      project_id: project.id,
      user_id: user.id,
      position: i + 1,
      slide_type: s.slide_type,
      title: s.title,
      body: s.body,
      cta_text: s.cta_text ?? null,
    }));
    const { error: slidesError } = await supabase.from("slides").insert(slideRows);
    if (slidesError) {
      logError("PROJECT", "slides insert failed", slidesError.message);
      throw new Error(`slides insert: ${slidesError.message}`);
    }
    log("PROJECT", "slides inserted", { count: slideRows.length });

    // ============ Medical accuracy pass ============
    if (isMedical) try {
      const apiKey = process.env.AI_API_KEY!;
      const baseUrl = process.env.AI_BASE_URL || AI_DEFAULT_BASE_URL;
      const model = process.env.AI_MODEL || AI_DEFAULT_MODEL;
      const review = await reviewMedicalContent(generated.slides, apiKey, baseUrl, model);
      log("PROJECT", "medical review", { verdict: review.verdict, flags: review.flags.length });

      await supabase.from("medical_review_results").insert({
        project_id: project.id,
        user_id: user.id,
        verdict: review.verdict,
        flags: review.flags,
        summary: review.summary,
        reviewed_at: new Date().toISOString(),
      });

      await supabase.from("projects").update({ review_status: review.verdict }).eq("id", project.id);
    } catch (reviewErr) {
      const msg = reviewErr instanceof Error ? reviewErr.message : String(reviewErr);
      logError("PROJECT", "medical review failed", msg);
    }

    // Save caption and hashtags
    await supabase
      .from("projects")
      .update({ caption: generated.caption, hashtags: generated.hashtags.join(" ") })
      .eq("id", project.id);

    await supabase
      .from("generation_jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", genJob.id);

    await supabase.rpc("increment_usage", { p_user_id: user.id, p_field: "generations_used" });

    log("PROJECT", "create success", { projectId: project.id, slides: generated.slides.length });
    revalidatePath("/projects");
    return { success: true, projectId: project.id };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logError("PROJECT", "generation failed", errMsg);
    await supabase
      .from("generation_jobs")
      .update({ status: "failed", error_message: errMsg.slice(0, 500), completed_at: new Date().toISOString() })
      .eq("id", genJob.id);
    // Project has no slides and generation failed — don't leave it stuck in "in_progress"
    await supabase.from("projects").update({ status: "archived" }).eq("id", project.id);
    return { success: false, error: errMsg.slice(0, 200) };
  }
}

// ============= Update project =============

export async function updateProjectAction(input: Record<string, unknown>) {
  log("PROJECT", "update", { id: input.id });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { id, review_status: _reviewStatus, ...updates } = parsed.data;
  const { error } = await supabase.from("projects").update(updates).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: "تعذر حفظ المشروع" };
  return { success: true };
}

// ============= Delete project =============

export async function deleteProjectAction(id: string) {
  log("PROJECT", "delete", { id });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: "تعذر حذف المشروع" };
  revalidatePath("/projects");
  return { success: true };
}

// ============= Duplicate project =============

export async function duplicateProjectAction(projectId: string) {
  log("PROJECT", "duplicate", { projectId });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: newId, error } = await supabase.rpc("duplicate_project", { p_project_id: projectId });
  if (error || !newId) return { success: false, error: "تعذر تكرار المشروع" };

  revalidatePath("/projects");
  return { success: true, projectId: newId };
}

// ============= Toggle favorite =============

export async function toggleProjectFavoriteAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: project } = await supabase
    .from("projects")
    .select("is_favorite")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!project) return { success: false, error: "المشروع غير موجود" };

  const { error } = await supabase
    .from("projects")
    .update({ is_favorite: !project.is_favorite })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: "تعذر التحديث" };
  return { success: true };
}

// ============= Move to folder =============

export async function moveToFolderAction(projectId: string, folderId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { error } = await supabase
    .from("projects")
    .update({ folder_id: folderId })
    .eq("id", projectId)
    .eq("user_id", user.id);
  if (error) return { success: false, error: "تعذر نقل المشروع" };
  revalidatePath("/projects");
  return { success: true };
}

// ============= Toggle template favorite =============

export async function toggleTemplateFavoriteAction(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: existing } = await supabase
    .from("favorite_templates")
    .select("template_id")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .single();

  if (existing) {
    await supabase.from("favorite_templates").delete().eq("user_id", user.id).eq("template_id", templateId);
  } else {
    await supabase.from("favorite_templates").insert({ user_id: user.id, template_id: templateId });
  }
  return { success: true };
}

// ============= Slide operations =============

export async function updateSlideAction(input: Record<string, unknown>) {
  log("SLIDE", "update", { id: input.id });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = updateSlideSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { id, ...updates } = parsed.data;
  const { error } = await supabase.from("slides").update(updates).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: "تعذر حفظ الشريحة" };
  return { success: true };
}

export async function reorderSlidesAction(projectId: string, orderedSlideIds: string[]) {
  log("SLIDE", "reorder", { projectId, count: orderedSlideIds.length });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = reorderSlidesSchema.safeParse({ project_id: projectId, ordered_slide_ids: orderedSlideIds });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { data, error } = await supabase.rpc("reorder_project_slides", {
    p_project_id: projectId,
    p_ordered_slide_ids: orderedSlideIds,
  });
  if (error) return { success: false, error: "تعذر إعادة ترتيب الشرائح" };
  return { success: true, data };
}

export async function addSlideAction(projectId: string, afterPosition: number, topic: string, contentType: string) {
  log("SLIDE", "add", { projectId, afterPosition });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  // Check project ownership and slide count
  const { data: project } = await supabase
    .from("projects")
    .select("slide_count, topic, content_type, language, tone, content_level, target_audience, cta_type, requires_medical_review")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
  if (!project) return { success: false, error: "المشروع غير موجود" };
  if (project.slide_count >= 10) return { success: false, error: "وصلت للحد الأقصى (10 شرائح)" };

  // Generate content for new slide using the project's real settings
  const provider = getGenerationProvider();
  let generated;
  try {
    generated = await provider.generate({
      topic: topic || project.topic,
      contentType: contentType || project.content_type,
      targetAudience: project.target_audience ?? "",
      level: project.content_level,
      tone: project.tone,
      language: project.language,
      slideCount: 3,
      ctaType: project.cta_type,
      isMedical: project.requires_medical_review,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("SLIDE", "add generation failed", msg);
    return { success: false, error: "تعذر توليد محتوى الشريحة" };
  }

  // Find the ending slide position to insert before it
  const { data: slides } = await supabase
    .from("slides")
    .select("id, position, slide_type")
    .eq("project_id", projectId)
    .order("position");

  if (!slides) return { success: false, error: "تعذر جلب الشرائح" };

  const endingSlide = slides.find((s) => s.slide_type === "summary" || s.slide_type === "cta");
  const insertPosition = endingSlide ? endingSlide.position : slides.length + 1;

  // Shift slides after insert position
  const toShift = slides.filter((s) => s.position >= insertPosition);
  for (const s of toShift) {
    await supabase.from("slides").update({ position: s.position + 10000 }).eq("id", s.id).eq("user_id", user.id);
  }
  for (const s of toShift) {
    await supabase.from("slides").update({ position: s.position + 1 }).eq("id", s.id).eq("user_id", user.id);
  }

  // Insert new slide
  const newSlide = generated.slides[1] || { title: "شريحة جديدة", body: "نص الشريحة" };
  const { data: inserted, error } = await supabase
    .from("slides")
    .insert({
      project_id: projectId,
      user_id: user.id,
      position: insertPosition,
      slide_type: "content",
      title: newSlide.title,
      body: newSlide.body,
    })
    .select()
    .single();

  if (error) return { success: false, error: "تعذر إضافة الشريحة" };

  // Update project slide count
  await supabase
    .from("projects")
    .update({ slide_count: project.slide_count + 1 })
    .eq("id", projectId)
    .eq("user_id", user.id);

  return { success: true, data: inserted };
}

export async function duplicateSlideAction(slideId: string) {
  log("SLIDE", "duplicate", { slideId });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  // Get the slide
  const { data: slide } = await supabase
    .from("slides")
    .select("*")
    .eq("id", slideId)
    .eq("user_id", user.id)
    .single();
  if (!slide) return { success: false, error: "الشريحة غير موجودة" };

  // Check project slide count
  const { data: project } = await supabase
    .from("projects")
    .select("slide_count")
    .eq("id", slide.project_id)
    .single();
  if (project && project.slide_count >= 10) return { success: false, error: "وصلت للحد الأقصى" };

  // Don't duplicate cover or ending as-is; convert to content
  const dupType = slide.slide_type === "cover" || slide.slide_type === "summary" || slide.slide_type === "cta"
    ? "content"
    : slide.slide_type;

  // Shift slides after current position
  const { data: slides } = await supabase
    .from("slides")
    .select("id, position")
    .eq("project_id", slide.project_id)
    .order("position");

  const toShift = slides?.filter((s) => s.position > slide.position) ?? [];
  for (const s of toShift) {
    await supabase.from("slides").update({ position: s.position + 10000 }).eq("id", s.id).eq("user_id", user.id);
  }
  for (const s of toShift) {
    await supabase.from("slides").update({ position: s.position + 1 }).eq("id", s.id).eq("user_id", user.id);
  }

  // Insert duplicate
  const { data: inserted, error } = await supabase
    .from("slides")
    .insert({
      project_id: slide.project_id,
      user_id: user.id,
      position: slide.position + 1,
      slide_type: dupType,
      title: slide.title,
      body: slide.body,
      cta_text: dupType === "content" ? null : slide.cta_text,
    })
    .select()
    .single();

  if (error) return { success: false, error: "تعذر تكرار الشريحة" };

  // Update project slide count
  if (project) {
    await supabase
      .from("projects")
      .update({ slide_count: project.slide_count + 1 })
      .eq("id", slide.project_id)
      .eq("user_id", user.id);
  }

  return { success: true, data: inserted };
}

export async function deleteSlideAction(slideId: string) {
  log("SLIDE", "delete", { slideId });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: slide } = await supabase
    .from("slides")
    .select("*")
    .eq("id", slideId)
    .eq("user_id", user.id)
    .single();
  if (!slide) return { success: false, error: "الشريحة غير موجودة" };

  // Can't delete cover or ending
  if (slide.slide_type === "cover") return { success: false, error: "لا يمكن حذف الغلاف" };
  if (slide.slide_type === "summary" || slide.slide_type === "cta")
    return { success: false, error: "لا يمكن حذف الخاتمة" };

  // Check project has at least 2 slides
  const { count } = await supabase
    .from("slides")
    .select("*", { count: "exact", head: true })
    .eq("project_id", slide.project_id);
  if (count && count <= 2) return { success: false, error: "الحد الأدنى شريحتان" };

  // Delete and reorder
  await supabase.from("slides").delete().eq("id", slideId).eq("user_id", user.id);

  // Reorder remaining slides
  const { data: remaining } = await supabase
    .from("slides")
    .select("id")
    .eq("project_id", slide.project_id)
    .order("position");

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase.from("slides").update({ position: i + 1 }).eq("id", remaining[i].id).eq("user_id", user.id);
    }
  }

  // Update project slide count
  const newCount = (count ?? 1) - 1;
  await supabase
    .from("projects")
    .update({ slide_count: newCount })
    .eq("id", slide.project_id)
    .eq("user_id", user.id);

  return { success: true };
}

// ============= Export tracking =============

export async function recordExportAction(projectId: string, exportType: "single_png" | "zip", slideId?: string) {
  log("EXPORT", "record", { projectId, exportType, slideId });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: project } = await supabase
    .from("projects")
    .select("requires_medical_review, review_status")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
  if (!project) return { success: false, error: "المشروع غير موجود" };
  if (project.requires_medical_review && project.review_status === "blocked") {
    return { success: false, error: "المحتوى الطبي محظور حتى تتم مراجعته" };
  }

  // Create export record
  const { error: recordError } = await supabase.from("export_records").insert({
    user_id: user.id,
    project_id: projectId,
    export_type: exportType,
    slide_id: slideId ?? null,
  });
  if (recordError) return { success: false, error: "تعذر تسجيل التصدير" };

  // Update project status and last_exported_at
  await supabase
    .from("projects")
    .update({ status: "completed", last_exported_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  // Increment usage
  await supabase.rpc("increment_usage", { p_user_id: user.id, p_field: "exports_used" });

  revalidatePath("/projects");
  return { success: true };
}

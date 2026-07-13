"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { log, logError } from "@/lib/logger";
import {
  generateTemplateSystem,
  editTemplateSystem,
  getGenerationProvider,
  GenerationError,
  type ProviderUsage,
  type TemplateGenerationResult,
  type GenerationInput,
} from "@/lib/services/generation";
import { sanitizeTemplateHtml, sanitizeTemplateCss } from "@/lib/services/template-sandbox";
import {
  CANVAS_SIZE_DIMENSIONS,
  generateCustomTemplateSchema,
  editCustomTemplateSchema,
  type CustomTemplateSettings,
} from "@/lib/validation/custom-templates";
import { resolveDesignerModel } from "@/lib/template-designer-access";
import {
  repairTemplateOnce,
  TemplateQualityError,
  type TemplateQualitySettings,
} from "@/lib/services/template-quality";

function sanitizeResult(result: TemplateGenerationResult): TemplateGenerationResult {
  return {
    css: sanitizeTemplateCss(result.css),
    htmlCover: sanitizeTemplateHtml(result.htmlCover),
    htmlContent: sanitizeTemplateHtml(result.htmlContent),
    htmlEnding: sanitizeTemplateHtml(result.htmlEnding),
    aiMessage: result.aiMessage,
    usage: result.usage,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

type DesignerAccess = {
  plan: "free" | "paid";
  subscriptionStatus: "inactive" | "active" | "expired" | "canceled";
  freeUsesRemaining: number;
  creditBalanceMicroUsd: number;
  subscriptionExpiresAt: string | null;
};

async function getAccess(supabase: Awaited<ReturnType<typeof createClient>>): Promise<DesignerAccess | null> {
  const { data, error } = await (supabase.rpc as any)("get_template_designer_access");
  return error ? null : data as DesignerAccess;
}

function providerCost(...costs: Array<number | null | undefined>) {
  if (costs.some((cost) => cost === null || cost === undefined)) throw new Error("AI provider did not return usage cost");
  return costs.reduce<number>((total, cost) => total + Number(cost), 0);
}

function usagePayload(...usage: Array<ProviderUsage | undefined>) {
  return usage.filter(Boolean).map((item) => ({
    requestId: item!.requestId,
    model: item!.model,
    promptTokens: item!.promptTokens,
    completionTokens: item!.completionTokens,
    costMicroUsd: item!.costMicroUsd,
  }));
}

function usageFromError(error: unknown): ProviderUsage | undefined {
  return error instanceof GenerationError ? error.usage : undefined;
}

function recordUsage(usages: ProviderUsage[], usage?: ProviderUsage) {
  if (usage && !usages.includes(usage)) usages.push(usage);
}

function qualitySettings(settings: CustomTemplateSettings): TemplateQualitySettings {
  const dimensions = CANVAS_SIZE_DIMENSIONS[settings.size];
  return {
    width: dimensions.width,
    height: dimensions.height,
    showAccountName: settings.showAccountName,
    showLogo: settings.showLogo,
    showSlideNumbers: settings.showSlideNumbers,
  };
}

async function validateAndRepairDesign(
  raw: TemplateGenerationResult,
  settings: CustomTemplateSettings,
  model: string,
  usages: ProviderUsage[]
): Promise<TemplateGenerationResult> {
  recordUsage(usages, raw.usage);
  const initial = sanitizeResult(raw);
  const checked = await repairTemplateOnce(initial, qualitySettings(settings), async (request) => {
    try {
      const repaired = await editTemplateSystem(settings, request, {
        css: initial.css,
        htmlCover: initial.htmlCover,
        htmlContent: initial.htmlContent,
        htmlEnding: initial.htmlEnding,
      }, model);
      recordUsage(usages, repaired.usage);
      return sanitizeResult(repaired);
    } catch (error) {
      recordUsage(usages, usageFromError(error));
      throw error;
    }
  });
  return checked.design;
}

function auditedProviderCost(usages: ProviderUsage[]): number {
  return usages.reduce((total, usage) => total + (usage.costMicroUsd ?? 0), 0);
}

async function settleFailure(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  requestId: string,
  usages: ProviderUsage[],
  error: string
) {
  const { error: settlementError } = await (admin.rpc as any)("fail_template_designer_request_internal", {
    p_user_id: userId,
    p_request_id: requestId,
    p_provider_usage: usagePayload(...usages),
    p_provider_cost_microusd: auditedProviderCost(usages),
    p_error_message: error,
  });
  if (settlementError) logError("CUSTOM_TEMPLATE", "failure settlement failed", settlementError.message);
}

export async function getTemplateDesignerAccessAction() {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const data = await getAccess(supabase);
  return data ? { success: true, data } : { success: false, error: "تعذر تحميل حالة الاشتراك" };
}

export async function getMyCustomTemplatesAction() {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data, error } = await (supabase.from("custom_templates") as any)
    .select("id, name, settings, created_at, updated_at, custom_template_versions(version_number, created_at)")
    .order("updated_at", { ascending: false });
  return error ? { success: false, error: "تعذر تحميل القوالب" } : { success: true, data };
}

export async function getCustomTemplateAction(templateId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data, error } = await (supabase.from("custom_templates") as any)
    .select("id, name, settings, custom_template_versions(version_number, css, html_cover, html_content, html_ending, raw_slides, ai_message, source, created_at)")
    .eq("id", templateId)
    .single();
  if (error || !data) return { success: false, error: "القالب غير موجود" };
  const versions = [...(data.custom_template_versions ?? [])].sort((a: any, b: any) => a.version_number - b.version_number);
  return { success: true, data: { ...data, custom_template_versions: versions } };
}

// AI carousel generation reserves an allowed trial or credit balance,
// then saves each successful design as a reusable custom template.

export async function generateTemplateAction(input: Record<string, unknown>) {
  log("CUSTOM_TEMPLATE", "generate attempt");
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = generateCustomTemplateSchema.safeParse(input);
  if (!parsed.success) {
    const firstErr = parsed.error.errors[0];
    logError("CUSTOM_TEMPLATE", `validation failed: ${firstErr.path.join(".")}: ${firstErr.message}`, input);
    return { success: false, error: `الحقل "${firstErr.path.join(".")}" — ${firstErr.message}` };
  }
  const { settings, message, model } = parsed.data;
  const access = await getAccess(supabase);
  if (!access) return { success: false, error: "تعذر تحميل حالة الاشتراك" };
  const selectedModel = resolveDesignerModel(access.plan, access.subscriptionStatus, model);
  const admin = createAdminClient();
  const { data: reservation, error: reservationError } = await (admin.rpc as any)("begin_template_designer_request_internal", {
    p_user_id: user.id,
    p_operation: "generate",
    p_model: selectedModel,
  });
  if (reservationError || !reservation?.requestId) {
    return { success: false, error: "انتهت التجربة المجانية أو لا يوجد رصيد كافٍ" };
  }

  const recordedUsage: ProviderUsage[] = [];
  try {
    // Content generation reuses the same engine that powers /projects/new —
    // no separate content model needed. Design generation is the new
    // from-scratch HTML/CSS system. Run in parallel, merge client-side
    // (see src/components/template-designer/merge.ts) since the client
    // needs the raw per-slide content again for design-only edits later.
    // Both calls use the same user-picked model (or the env default if none picked).
    const contentInput: GenerationInput = {
      topic: settings.topic,
      contentType: "توعوي",
      targetAudience: "",
      level: "متوسط",
      tone: "ودية",
      language: "العربية الفصحى",
      slideCount: settings.slideCount,
      ctaType: "احفظ المنشور",
      isMedical: false,
    };

    const [carouselResult, designResult] = await Promise.allSettled([
      getGenerationProvider(selectedModel).generate(contentInput),
      generateTemplateSystem(settings, message, selectedModel),
    ]);
    if (carouselResult.status === "fulfilled") recordUsage(recordedUsage, carouselResult.value.usage);
    if (designResult.status === "fulfilled") recordUsage(recordedUsage, designResult.value.usage);
    if (carouselResult.status === "rejected") {
      const usage = usageFromError(carouselResult.reason);
      recordUsage(recordedUsage, usage);
      throw carouselResult.reason;
    }
    if (designResult.status === "rejected") {
      const usage = usageFromError(designResult.reason);
      recordUsage(recordedUsage, usage);
      throw designResult.reason;
    }
    const carousel = carouselResult.value;
    if (!carousel.usage) throw new Error("AI provider did not return carousel usage");
    const design = await validateAndRepairDesign(designResult.value, settings, selectedModel, recordedUsage);
    const totalCost = providerCost(...recordedUsage.map((usage) => usage.costMicroUsd));
    const { data: saved, error: saveError } = await (admin.rpc as any)("complete_template_designer_request_internal", {
      p_user_id: user.id,
      p_request_id: reservation.requestId,
      p_provider_usage: usagePayload(...recordedUsage),
      p_provider_cost_microusd: totalCost,
      p_template_payload: {
        title: settings.topic,
        topic: settings.topic,
        settings,
        css: design.css,
        htmlCover: design.htmlCover,
        htmlContent: design.htmlContent,
        htmlEnding: design.htmlEnding,
        rawSlides: carousel.slides,
        aiMessage: design.aiMessage,
      },
    });
    if (saveError) throw new Error(saveError.message);
    if (saved?.success === false) return { success: false, error: "الرصيد المتبقي لا يغطي التكلفة النهائية" };
    if (!saved?.templateId) throw new Error("Could not save template");
    log("CUSTOM_TEMPLATE", "generate success", { slideCount: carousel.slides.length });
    return {
      success: true,
      data: { ...design, slides: carousel.slides, caption: carousel.caption, hashtags: carousel.hashtags, templateId: saved.templateId },
      access: await getAccess(supabase),
    };
  } catch (err) {
    const message2 = err instanceof Error ? err.message : String(err);
    recordUsage(recordedUsage, usageFromError(err));
    logError("CUSTOM_TEMPLATE", "generate failed", message2);
    await settleFailure(admin, user.id, reservation.requestId, recordedUsage, message2);
    return {
      success: false,
      error: err instanceof TemplateQualityError
        ? "لم يجتز التصميم فحص الجودة بعد محاولة الإصلاح، حاول مرة أخرى"
        : "تعذر توليد التصميم، حاول مرة أخرى",
    };
  }
}

// Design-only edit — content stays fixed; the client re-merges the
// returned css/layouts with the content it already has from generate().
export async function editTemplateAction(input: Record<string, unknown>) {
  log("CUSTOM_TEMPLATE", "edit attempt");
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = editCustomTemplateSchema.safeParse(input);
  if (!parsed.success) {
    const firstErr = parsed.error.errors[0];
    logError("CUSTOM_TEMPLATE", `validation failed: ${firstErr.path.join(".")}: ${firstErr.message}`, input);
    return { success: false, error: `الحقل "${firstErr.path.join(".")}" — ${firstErr.message}` };
  }

  const access = await getAccess(supabase);
  if (!access) return { success: false, error: "تعذر تحميل حالة الاشتراك" };
  const selectedModel = resolveDesignerModel(access.plan, access.subscriptionStatus, parsed.data.model);
  const { data: previous, error: previousError } = await (supabase.from("custom_template_versions") as any)
    .select("raw_slides")
    .eq("custom_template_id", parsed.data.templateId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (previousError || !previous) return { success: false, error: "تعذر تحميل محتوى النسخة السابقة" };

  const admin = createAdminClient();
  const { data: reservation, error: reservationError } = await (admin.rpc as any)("begin_template_designer_request_internal", {
    p_user_id: user.id,
    p_operation: "edit",
    p_model: selectedModel,
    p_template_id: parsed.data.templateId,
  });
  if (reservationError || !reservation?.requestId) return { success: false, error: "يلزم اشتراك فعّال ورصيد كافٍ لتعديل القالب" };

  const recordedUsage: ProviderUsage[] = [];
  try {
    const raw = await editTemplateSystem(
      parsed.data.settings,
      parsed.data.message,
      {
        css: parsed.data.currentCss,
        htmlCover: parsed.data.currentHtmlCover,
        htmlContent: parsed.data.currentHtmlContent,
        htmlEnding: parsed.data.currentHtmlEnding,
      },
      selectedModel
    );
    const result = await validateAndRepairDesign(raw, parsed.data.settings, selectedModel, recordedUsage);
    const totalCost = providerCost(...recordedUsage.map((usage) => usage.costMicroUsd));
    const { data: saved, error: saveError } = await (admin.rpc as any)("complete_template_designer_request_internal", {
      p_user_id: user.id,
      p_request_id: reservation.requestId,
      p_provider_usage: usagePayload(...recordedUsage),
      p_provider_cost_microusd: totalCost,
      p_template_payload: {
        title: parsed.data.settings.topic,
        topic: parsed.data.settings.topic,
        settings: parsed.data.settings,
        css: result.css,
        htmlCover: result.htmlCover,
        htmlContent: result.htmlContent,
        htmlEnding: result.htmlEnding,
        rawSlides: previous.raw_slides,
        aiMessage: result.aiMessage,
      },
    });
    if (saveError) throw new Error(saveError.message);
    if (saved?.success === false) return { success: false, error: "الرصيد المتبقي لا يغطي التكلفة النهائية" };
    if (!saved?.templateId) throw new Error("Could not save template");
    log("CUSTOM_TEMPLATE", "edit success");
    return { success: true, data: { ...result, templateId: saved.templateId }, access: await getAccess(supabase) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    recordUsage(recordedUsage, usageFromError(err));
    logError("CUSTOM_TEMPLATE", "edit failed", message);
    await settleFailure(admin, user.id, reservation.requestId, recordedUsage, message);
    return {
      success: false,
      error: err instanceof TemplateQualityError
        ? "لم يجتز التعديل فحص الجودة بعد محاولة الإصلاح، حاول مرة أخرى"
        : "تعذر تعديل التصميم، حاول مرة أخرى",
    };
  }
}

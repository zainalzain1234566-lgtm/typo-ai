"use server";

import { createClient } from "@/lib/supabase/server";
import { log, logError } from "@/lib/logger";
import {
  generateTemplateSystem,
  editTemplateSystem,
  getGenerationProvider,
  type TemplateGenerationResult,
  type GenerationInput,
} from "@/lib/services/generation";
import { sanitizeTemplateHtml, sanitizeTemplateCss } from "@/lib/services/template-sandbox";
import { generateCustomTemplateSchema, editCustomTemplateSchema } from "@/lib/validation/custom-templates";

function sanitizeResult(result: TemplateGenerationResult): TemplateGenerationResult {
  return {
    css: sanitizeTemplateCss(result.css),
    htmlCover: sanitizeTemplateHtml(result.htmlCover),
    htmlContent: sanitizeTemplateHtml(result.htmlContent),
    htmlEnding: sanitizeTemplateHtml(result.htmlEnding),
    aiMessage: result.aiMessage,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// One-shot AI carousel generator: no DB writes anywhere in this file.
// The user gives topic/colors/slideCount/size, gets real content + a
// from-scratch AI-designed visual system fused together, and the result
// is downloaded or sent — nothing is persisted as a reusable "template".

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

    const [carousel, rawDesign] = await Promise.all([
      getGenerationProvider(model).generate(contentInput),
      generateTemplateSystem(settings, message, model),
    ]);
    const design = sanitizeResult(rawDesign);

    await supabase.rpc("increment_usage", { p_user_id: user.id, p_field: "generations_used" });
    log("CUSTOM_TEMPLATE", "generate success", { slideCount: carousel.slides.length });
    return { success: true, data: { ...design, slides: carousel.slides, caption: carousel.caption, hashtags: carousel.hashtags } };
  } catch (err) {
    const message2 = err instanceof Error ? err.message : String(err);
    logError("CUSTOM_TEMPLATE", "generate failed", message2);
    return { success: false, error: "تعذر توليد التصميم، حاول مرة أخرى" };
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
      parsed.data.model
    );
    const result = sanitizeResult(raw);
    await supabase.rpc("increment_usage", { p_user_id: user.id, p_field: "generations_used" });
    log("CUSTOM_TEMPLATE", "edit success");
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("CUSTOM_TEMPLATE", "edit failed", message);
    return { success: false, error: "تعذر تعديل التصميم، حاول مرة أخرى" };
  }
}

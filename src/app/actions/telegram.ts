"use server";

import { createClient } from "@/lib/supabase/server";
import { log, logError } from "@/lib/logger";
import { APP_NAME } from "@/lib/constants";

const TELEGRAM_API = "https://api.telegram.org";

export async function getTelegramConfig(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("telegram_bot_token, telegram_chat_id, telegram_enabled")
    .eq("user_id", user.id)
    .single();

  if (!prefs?.telegram_bot_token || !prefs?.telegram_chat_id || !prefs.telegram_enabled) {
    return null;
  }

  return { userId: user.id, botToken: prefs.telegram_bot_token, chatId: prefs.telegram_chat_id };
}

// Shared by both project export-to-Telegram and the AI Template Designer's
// direct-preview-to-Telegram flow. Sends photo files as media-group albums
// (Telegram caps sendMediaGroup at 10 photos per call, so chunk).
export async function sendPhotosToTelegram(
  botToken: string,
  chatId: string,
  files: File[],
  filenamePrefix = "slide"
): Promise<{ success: true } | { success: false; error: string }> {
  if (files.length === 0) {
    return { success: false, error: "لا توجد صور للإرسال" };
  }

  try {
    for (let chunkStart = 0; chunkStart < files.length; chunkStart += 10) {
      const chunk = files.slice(chunkStart, chunkStart + 10);
      const tgFormData = new FormData();
      tgFormData.append("chat_id", chatId);

      const mediaArr: { type: string; media: string }[] = [];
      chunk.forEach((file, i) => {
        const key = `photo${i}`;
        tgFormData.append(key, file, `${filenamePrefix}-${chunkStart + i + 1}.png`);
        mediaArr.push({ type: "photo", media: `attach://${key}` });
      });
      tgFormData.append("media", JSON.stringify(mediaArr));

      const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMediaGroup`, {
        method: "POST",
        body: tgFormData,
      });

      const json = await res.json();
      if (!json.ok) {
        logError("TELEGRAM", "sendMediaGroup failed", JSON.stringify(json));
        return { success: false, error: json.description ?? "فشل الإرسال إلى تلغرام" };
      }
    }
    return { success: true };
  } catch (err) {
    logError("TELEGRAM", "send error", err instanceof Error ? err.message : String(err));
    return { success: false, error: "تعذر الإرسال إلى تلغرام" };
  }
}

export async function sendToTelegramAction(projectId: string, formData: FormData) {
  log("TELEGRAM", "send attempt", { projectId });

  const supabase = await createClient();
  const config = await getTelegramConfig(supabase);
  if (!config) {
    return { success: false, error: "لم يتم إعداد تلغرام. راجع الإعدادات." };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("requires_medical_review, review_status")
    .eq("id", projectId)
    .eq("user_id", config.userId)
    .single();
  if (!project) return { success: false, error: "المشروع غير موجود" };
  if (project.requires_medical_review && project.review_status === "blocked") {
    return { success: false, error: "المحتوى الطبي محظور حتى تتم مراجعته" };
  }

  const files: File[] = [];
  for (const entry of Array.from(formData.entries())) {
    if (entry[1] instanceof File) files.push(entry[1]);
  }

  const result = await sendPhotosToTelegram(config.botToken, config.chatId, files, "slide");
  if (!result.success) return result;

  await supabase.from("export_records").insert({
    user_id: config.userId,
    project_id: projectId,
    export_type: "telegram",
  });
  await supabase
    .from("projects")
    .update({ status: "completed", last_exported_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", config.userId);
  await supabase.rpc("increment_usage", { p_user_id: config.userId, p_field: "exports_used" });

  log("TELEGRAM", "send success", { projectId, slideCount: files.length });
  return { success: true };
}

// Sends the AI Template Designer's live-preview PNGs directly to the
// user's configured Telegram bot — no projectId, no `projects`/
// `export_records` writes, since this flow is deliberately decoupled
// from the project data model (see migration 0015's header comment).
export async function sendDesignerPngsToTelegramAction(formData: FormData) {
  log("TELEGRAM", "designer send attempt");

  const supabase = await createClient();
  const config = await getTelegramConfig(supabase);
  if (!config) {
    return { success: false, error: "لم يتم إعداد تلغرام. راجع الإعدادات." };
  }

  const files: File[] = [];
  for (const entry of Array.from(formData.entries())) {
    if (entry[1] instanceof File) files.push(entry[1]);
  }

  const result = await sendPhotosToTelegram(config.botToken, config.chatId, files, "template");
  if (result.success) {
    log("TELEGRAM", "designer send success", { count: files.length });
  }
  return result;
}

export async function getTelegramStatusAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" } as const;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("telegram_chat_id, telegram_enabled, telegram_bot_token")
    .eq("user_id", user.id)
    .single();

  return {
    success: true,
    data: {
      hasToken: !!prefs?.telegram_bot_token,
      chatId: prefs?.telegram_chat_id ?? "",
      enabled: !!prefs?.telegram_enabled,
    },
  } as const;
}

export async function testSavedTelegramAction() {
  const supabase = await createClient();
  const config = await getTelegramConfig(supabase);
  if (!config) {
    return { success: false, error: "لم يتم إعداد تلغرام. راجع الإعدادات." };
  }
  return sendTestMessage(config.botToken, config.chatId);
}

export async function testTelegramAction(botToken: string, chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  log("TELEGRAM", "test attempt", { chatId });

  if (!botToken || !chatId) {
    return { success: false, error: "الرمز ومعرّف المحادثة مطلوبان" };
  }

  return sendTestMessage(botToken, chatId);
}

async function sendTestMessage(botToken: string, chatId: string) {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ تم ربط بوت تلغرام بنجاح مع ${APP_NAME}`,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      logError("TELEGRAM", "test failed", JSON.stringify(json));
      return { success: false, error: json.description ?? "فشل الاتصال" };
    }

    log("TELEGRAM", "test success", { chatId });
    return { success: true };
  } catch (err) {
    logError("TELEGRAM", "test error", err instanceof Error ? err.message : String(err));
    return { success: false, error: "تعذر الاتصال بتلغرام" };
  }
}

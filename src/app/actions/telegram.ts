"use server";

import { createClient } from "@/lib/supabase/server";
import { log, logError } from "@/lib/logger";

const TELEGRAM_API = "https://api.telegram.org";

async function getTelegramConfig(supabase: Awaited<ReturnType<typeof createClient>>) {
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

export async function sendToTelegramAction(projectId: string, formData: FormData) {
  log("TELEGRAM", "send attempt", { projectId });

  const supabase = await createClient();
  const config = await getTelegramConfig(supabase);
  if (!config) {
    return { success: false, error: "لم يتم إعداد تلغرام. راجع الإعدادات." };
  }

  const files: File[] = [];
  for (const entry of Array.from(formData.entries())) {
    if (entry[1] instanceof File) files.push(entry[1]);
  }

  if (files.length === 0) {
    return { success: false, error: "لا توجد شرائح للإرسال" };
  }

  try {
    // Telegram sendMediaGroup max 10 photos per album
    for (let chunkStart = 0; chunkStart < files.length; chunkStart += 10) {
      const chunk = files.slice(chunkStart, chunkStart + 10);
      const tgFormData = new FormData();
      tgFormData.append("chat_id", config.chatId);

      const mediaArr: { type: string; media: string }[] = [];
      chunk.forEach((file, i) => {
        const key = `photo${i}`;
        tgFormData.append(key, file, `slide-${chunkStart + i + 1}.png`);
        mediaArr.push({ type: "photo", media: `attach://${key}` });
      });
      tgFormData.append("media", JSON.stringify(mediaArr));

      const res = await fetch(`${TELEGRAM_API}/bot${config.botToken}/sendMediaGroup`, {
        method: "POST",
        body: tgFormData,
      });

      const json = await res.json();
      if (!json.ok) {
        logError("TELEGRAM", "sendMediaGroup failed", JSON.stringify(json));
        return { success: false, error: json.description ?? "فشل الإرسال إلى تلغرام" };
      }
    }

    // Record export
    await supabase.from("export_records").insert({
      user_id: config.userId,
      project_id: projectId,
      export_type: "telegram",
    });
    await supabase
      .from("projects")
      .update({ status: "completed", last_exported_at: new Date().toISOString() })
      .eq("id", projectId);
    await supabase.rpc("increment_usage", { p_user_id: config.userId, p_field: "exports_used" });

    log("TELEGRAM", "send success", { projectId, slideCount: files.length });
    return { success: true };
  } catch (err) {
    logError("TELEGRAM", "send error", err instanceof Error ? err.message : String(err));
    return { success: false, error: "تعذر الإرسال إلى تلغرام" };
  }
}

export async function testTelegramAction(botToken: string, chatId: string) {
  log("TELEGRAM", "test attempt", { chatId });

  if (!botToken || !chatId) {
    return { success: false, error: "الرمز ومعرّف المحادثة مطلوبان" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ تم ربط بوت تلغرام بنجاح مع Typo AI",
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

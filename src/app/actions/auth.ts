"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from "@/lib/validation/auth";
import { updateBrandKitSchema, updatePreferencesSchema, folderSchema } from "@/lib/validation/settings";
import { log, logError } from "@/lib/logger";

export async function signUpAction(formData: FormData) {
  log("AUTH", "signUp attempt", { email: formData.get("email") });
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    logError("AUTH", "signUp validation failed", parsed.error.errors[0].message);
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.name } },
  });

  if (error) {
    logError("AUTH", "signUp failed", error.message);
    return { success: false, error: error.message };
  }
  log("AUTH", "signUp success", { userId: data.user?.id });
  return { success: true, userId: data.user?.id };
}

export async function signInAction(formData: FormData) {
  log("AUTH", "signIn attempt", { email: formData.get("email") });
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    logError("AUTH", "signIn validation failed", parsed.error.errors[0].message);
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    logError("AUTH", "signIn failed", error.message);
    return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }
  log("AUTH", "signIn success", { email: parsed.data.email });
  return { success: true };
}

export async function signOutAction() {
  log("AUTH", "signOut");
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    logError("AUTH", "forgotPassword failed", error.message);
    return { success: false, error: error.message };
  }
  log("AUTH", "forgotPassword sent", { email: parsed.data.email });
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logError("AUTH", "resetPassword failed", error.message);
    return { success: false, error: error.message };
  }
  log("AUTH", "resetPassword success");
  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = updateProfileSchema.safeParse({
    display_name: formData.get("display_name"),
    instagram_username: formData.get("instagram_username") || null,
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      instagram_username: parsed.data.instagram_username,
    })
    .eq("id", user.id);

  if (error) {
    logError("SETTINGS", "updateProfile failed", error.message);
    return { success: false, error: "تعذر حفظ التغييرات" };
  }
  log("SETTINGS", "updateProfile success", { userId: user.id });
  revalidatePath("/settings");
  return { success: true };
}

export async function updateBrandKitAction(input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = updateBrandKitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { error } = await supabase.from("brand_kits").update(parsed.data).eq("user_id", user.id);
  if (error) {
    logError("SETTINGS", "updateBrandKit failed", error.message);
    return { success: false, error: "تعذر حفظ الهوية" };
  }
  log("SETTINGS", "updateBrandKit success", { userId: user.id });
  return { success: true };
}

export async function updatePreferencesAction(input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = updatePreferencesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { error } = await supabase.from("user_preferences").update(parsed.data).eq("user_id", user.id);
  if (error) {
    logError("SETTINGS", "updatePreferences failed", error.message);
    return { success: false, error: "تعذر حفظ الإعدادات" };
  }
  log("SETTINGS", "updatePreferences success", { userId: user.id });
  return { success: true };
}

export async function createFolderAction(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = folderSchema.safeParse({ name });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { data, error } = await supabase.from("folders").insert({ user_id: user.id, name: parsed.data.name }).select().single();
  if (error) {
    logError("SETTINGS", "createFolder failed", error.message);
    return { success: false, error: "تعذر إنشاء المجلد" };
  }
  log("SETTINGS", "createFolder success", { name });
  revalidatePath("/projects");
  return { success: true, data };
}

export async function renameFolderAction(id: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = folderSchema.safeParse({ name });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { error } = await supabase.from("folders").update({ name }).eq("id", id).eq("user_id", user.id);
  if (error) {
    logError("SETTINGS", "renameFolder failed", error.message);
    return { success: false, error: "تعذر تعديل المجلد" };
  }
  log("SETTINGS", "renameFolder success", { id, name });
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteFolderAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  // Projects have ON DELETE SET NULL on folder_id, so they won't be deleted
  const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    logError("SETTINGS", "deleteFolder failed", error.message);
    return { success: false, error: "تعذر حذف المجلد" };
  }
  log("SETTINGS", "deleteFolder success", { id });
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  // Profile cascade will delete all user data
  log("AUTH", "deleteAccount", { userId: user.id });
  const admin = createAdminClient();
  const { error: profileError } = await admin.from("profiles").delete().eq("id", user.id);
  if (profileError) {
    logError("AUTH", "deleteAccount profile delete failed", profileError.message);
    return { success: false, error: "تعذر حذف الحساب" };
  }
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    logError("AUTH", "deleteAccount auth delete failed", authError.message);
    return { success: false, error: "تعذر حذف الحساب بالكامل، الرجاء المحاولة لاحقًا" };
  }

  await supabase.auth.signOut();
  revalidatePath("/");
  return { success: true };
}

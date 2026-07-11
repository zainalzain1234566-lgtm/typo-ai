import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  content_mode: z.enum(["general", "medical"]).default("general"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirm: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((d) => d.password === d.confirm, { message: "كلمتا المرور غير متطابقتين", path: ["confirm"] });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  display_name: z.string().min(2, "الاسم مطلوب"),
  instagram_username: z.string().optional().nullable(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/error-messages";

const schema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirm: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  contentMode: z.enum(["general", "medical"]),
  agree: z.literal(true, { errorMap: () => ({ message: "يجب الموافقة على الشروط" }) }),
}).refine((d) => d.password === d.confirm, { message: "كلمتا المرور غير متطابقتين", path: ["confirm"] });
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agree: false as any, contentMode: "general" },
  });
  const pass = watch("password") ?? "";
  const contentMode = watch("contentMode");

  const reqs = [
    { label: "6 أحرف على الأقل", met: pass.length >= 6 },
    { label: "يحتوي على أرقام", met: /\d/.test(pass) },
    { label: "يحتوي على أحرف", met: /[a-zA-Z\u0600-\u06FF]/.test(pass) },
  ];

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.name, content_mode: data.contentMode } },
    });
    setLoading(false);
    if (error) {
      setServerError(friendlyAuthError(error.message));
    } else {
      router.push("/verify-email");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <AuthVisual />
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-extrabold text-ink">إنشاء حساب</h1>
            <p className="mt-2 text-sm text-ink-muted">ابدأ رحلتك مع Typo AI مجانًا</p>

            {serverError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <input type="hidden" {...register("contentMode")} />
              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" placeholder="اسمك الكامل" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>مجال المحتوى</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button type="button" onClick={() => setValue("contentMode", "general")} className={`rounded-xl border-2 px-3 py-3 text-sm font-medium ${contentMode === "general" ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted"}`}>
                    محتوى عام
                  </button>
                  <button type="button" onClick={() => setValue("contentMode", "medical")} className={`rounded-xl border-2 px-3 py-3 text-sm font-medium ${contentMode === "medical" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-stone-200 text-ink-muted"}`}>
                    محتوى طبي
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" {...register("password")} className="pl-10" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                <div className="mt-2 space-y-1">
                  {reqs.map((r) => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      {r.met ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-stone-300" />}
                      <span className={r.met ? "text-green-700" : "text-ink-subtle"}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
                <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
                {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox {...register("agree")} />
                <span className="text-sm text-ink-muted leading-relaxed">
                  أوافق على <Link href="/terms" className="text-accent hover:underline">الشروط والأحكام</Link> و<Link href="/privacy" className="text-accent hover:underline">سياسة الخصوصية</Link>
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-600">{errors.agree.message}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-accent font-medium hover:underline">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

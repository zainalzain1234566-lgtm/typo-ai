"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/error-messages";

const schema = z.object({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirm: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((d) => d.password === d.confirm, { message: "كلمتا المرور غير متطابقتين", path: ["confirm"] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>;
}

function ResetContent() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const pass = watch("password") ?? "";
  const reqs = [
    { label: "6 أحرف على الأقل", met: pass.length >= 6 },
    { label: "يحتوي على أرقام", met: /\d/.test(pass) },
    { label: "يحتوي على أحرف", met: /[a-zA-Z\u0600-\u06FF]/.test(pass) },
  ];

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data, error: sessionError } = await supabase.auth.getUser();
        if (!active) return;
        if (sessionError || !data.user) {
          setError("رابط الاستعادة غير صالح أو منتهي. اطلب رابطًا جديدًا.");
        } else {
          setSessionReady(true);
        }
      } catch {
        if (active) setError("تعذر التحقق من رابط الاستعادة. يرجى المحاولة مرة أخرى.");
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    void checkSession();
    return () => { active = false; };
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!sessionReady) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setLoading(false);
    if (error) {
      setError(friendlyAuthError(error.message));
    } else {
      await supabase.auth.signOut({ scope: "local" });
      router.replace("/login?message=password-updated");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <AuthVisual />
        <main id="main-content" className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-extrabold text-ink">إعادة تعيين كلمة المرور</h1>
            <p className="mt-2 text-sm text-ink-muted">أدخل كلمة المرور الجديدة</p>
            {checkingSession && <p className="mt-4 text-sm text-ink-muted">جارٍ التحقق من رابط الاستعادة...</p>}
            {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {!checkingSession && !sessionReady && (
              <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">طلب رابط استعادة جديد</Link>
            )}
            {sessionReady && <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error password-requirements" : "password-requirements"} {...register("password")} className="pl-12" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-ink-subtle hover:text-ink cursor-pointer">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" role="alert" className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                <div id="password-requirements" className="mt-2 space-y-1">
                  {reqs.map((r) => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      {r.met ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-stone-300" />}
                      <span className={r.met ? "text-green-700" : "text-ink-subtle"}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">تأكيد كلمة المرور الجديدة</Label>
                <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "confirm-error" : undefined} {...register("confirm")} />
                {errors.confirm && <p id="confirm-error" role="alert" className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading || !sessionReady}>
                {loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
              </Button>
            </form>}
            <p className="mt-6 text-center text-sm text-ink-muted">
              <Link href="/login" className="text-accent font-medium hover:underline">العودة إلى تسجيل الدخول</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

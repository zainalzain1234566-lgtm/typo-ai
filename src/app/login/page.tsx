"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-ink-muted">جارٍ تحميل صفحة تسجيل الدخول...</p>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");
  const redirect = requestedRedirect && /^\/(?![\\/])/.test(requestedRedirect)
    ? requestedRedirect
    : "/projects";
  const confirmationError = searchParams.get("error") === "email-confirmation"
    ? "تعذر تأكيد البريد الإلكتروني. قد يكون الرابط منتهيًا أو مستخدمًا بالفعل."
    : null;
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(confirmationError);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } else {
      router.push(redirect);
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
            <h1 className="text-2xl font-extrabold text-ink">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-ink-muted">مرحبًا بعودتك إلى Typo AI</p>

            {error && (
              <div id="login-error" role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
                {errors.email && <p id="email-error" role="alert" className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="mb-0">كلمة المرور</Label>
                  <Link href="/forgot-password" className="text-xs text-accent hover:underline">نسيت كلمة المرور؟</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} className="pl-12" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} className="absolute left-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-ink-subtle hover:text-ink cursor-pointer">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" role="alert" className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              ليس لديك حساب؟{" "}
              <Link href="/signup" className="text-accent font-medium hover:underline">أنشئ حسابًا</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

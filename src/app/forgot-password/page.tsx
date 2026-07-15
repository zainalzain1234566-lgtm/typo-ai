"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/error-messages";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "invalid-recovery-link") {
      setServerError("رابط الاستعادة غير صالح أو منتهي. اطلب رابطًا جديدًا.");
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/recovery`,
      });
      if (error) setServerError(friendlyAuthError(error.message));
      else setSent(true);
    } catch {
      setServerError("تعذر إرسال رابط الاستعادة، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <AuthVisual />
        <main id="main-content" className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-ink">تم إرسال الرابط</h1>
                <p className="mt-2 text-sm text-ink-muted">تحقق من بريدك الإلكتروني وافتح رابط الاستعادة المرسل إليك لإعادة تعيين كلمة المرور.</p>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "mt-6 w-full")}>
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h1 className="text-2xl font-extrabold text-ink">نسيت كلمة المرور؟</h1>
                <p className="mt-2 text-sm text-ink-muted">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
                {serverError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
                    {errors.email && <p id="email-error" role="alert" className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-ink-muted">
                  <Link href="/login" className="text-accent font-medium hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> العودة إلى تسجيل الدخول
                  </Link>
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

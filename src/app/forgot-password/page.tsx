"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <AuthVisual />
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-ink">تم إرسال الرابط</h1>
                <p className="mt-2 text-sm text-ink-muted">تحقق من بريدك الإلكتروني للحصول على رابط استعادة كلمة المرور</p>
                <Link href="/reset-password" className="block mt-6">
                  <Button className="w-full" size="lg">المتابعة لإعادة التعيين</Button>
                </Link>
                <Link href="/login" className="block mt-3">
                  <Button variant="ghost" className="w-full">العودة إلى تسجيل الدخول</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h1 className="text-2xl font-extrabold text-ink">نسيت كلمة المرور؟</h1>
                <p className="mt-2 text-sm text-ink-muted">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
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
        </div>
      </div>
    </div>
  );
}

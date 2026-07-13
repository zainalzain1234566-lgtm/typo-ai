"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/error-messages";

export default function VerifyEmailPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(sessionStorage.getItem("pendingSignupEmail") ?? "");
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const resend = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setCountdown(30);
    setSuccess("تم إرسال رابط تأكيد جديد");
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <main id="main-content" className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink">تحقق من بريدك الإلكتروني</h1>
          <p className="mt-2 text-sm text-ink-muted">
            أرسلنا رابط التأكيد إلى <span className="font-medium text-ink">{email || "بريدك الإلكتروني"}</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">افتح الرسالة واضغط على رابط التأكيد لإكمال إنشاء حسابك.</p>
          {error && <div id="verification-error" role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <p aria-live="polite" className="mt-4 text-sm text-green-700">{success}</p>}
          {email ? (
            <Button onClick={resend} variant="ghost" className="mt-6 w-full" disabled={loading || countdown > 0}>
              {loading ? "جارٍ الإرسال..." : countdown > 0 ? `إعادة الإرسال خلال ${countdown} ثانية` : <><RefreshCw className="w-4 h-4" /> إعادة إرسال الرابط</>}
            </Button>
          ) : (
            <Link href="/signup" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
              العودة إلى إنشاء الحساب
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

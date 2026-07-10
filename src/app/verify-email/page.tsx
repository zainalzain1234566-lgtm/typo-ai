"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
    inputsRef.current[0]?.focus();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((c, i) => (next[i] = c));
    setCode(next);
  };

  const onSubmit = async () => {
    const token = code.join("");
    if (token.length !== 6) {
      setError("أدخل الرمز كاملاً (6 أرقام)");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/projects");
      router.refresh();
    }
  };

  const resend = async () => {
    setCountdown(30);
    setCode(["", "", "", "", "", ""]);
    setError(null);
    await supabase.auth.resend({ type: "signup", email });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink">تحقق من بريدك الإلكتروني</h1>
          <p className="mt-2 text-sm text-ink-muted">
            أرسلنا رمز التحقق إلى <span className="font-medium text-ink">{email || "بريدك"}</span>
          </p>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="mt-6 flex gap-2 justify-center" dir="ltr">
            {code.map((c, i) => (
              <Input key={i} ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={c}
                onChange={(e) => handleInput(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold" />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <Button onClick={onSubmit} className="w-full" size="lg" disabled={loading}>
              {loading ? "جارٍ التحقق..." : "تأكيد البريد"}
            </Button>
            <Button onClick={resend} variant="ghost" className="w-full" disabled={countdown > 0}>
              {countdown > 0 ? `إعادة الإرسال خلال ${countdown} ثانية` : <><RefreshCw className="w-4 h-4" /> إعادة إرسال الرمز</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

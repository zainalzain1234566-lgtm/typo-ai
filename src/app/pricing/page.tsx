"use client";

import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const features = [
  "إنشاء مشاريع كاروسيل",
  "الوصول إلى القوالب الحالية",
  "تنزيل الصور دون علامة مائية",
  "إنشاء Caption وHashtags",
  "حفظ المشاريع",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">الأسعار</h1>
          <p className="mt-3 text-ink-muted">ابدأ مجانًا اليوم</p>
        </div>
        <div className="rounded-2xl border-2 border-accent/30 bg-white p-8 shadow-soft max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">الخطة الحالية</span>
          </div>
          <h2 className="text-2xl font-extrabold text-ink">الخطة المجانية</h2>
          <div className="my-6">
            <span className="text-5xl font-extrabold text-ink">مجانًا</span>
          </div>
          <div className="space-y-3 text-right mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-ink">{f}</span>
              </div>
            ))}
          </div>
          <Link href="/signup">
            <Button size="lg" className="w-full">ابدأ مجانًا</Button>
          </Link>
          <p className="mt-4 text-xs text-ink-subtle">سيتم الإعلان عن الخطط المستقبلية لاحقًا.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

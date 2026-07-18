import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { getWhatsAppUpgradeUrl } from "@/lib/whatsapp";
import { createPageMetadata, ROUTE_SEO } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata(ROUTE_SEO["/pricing"]);

const features = [
  "خمسة مشاريع مدى الحياة",
  "الوصول إلى القوالب الحالية",
  "تنزيل الصور دون علامة مائية",
  "إنشاء Caption وHashtags",
  "حفظ المشاريع",
];

const paidFeatures = [
  "كل مزايا الخطة المجانية",
  "عدد غير محدود من المشاريع",
  "توليد المشاريع بالذكاء الاصطناعي: التكلفة الفعلية + 20%",
  "الوصول إلى مصمم القوالب بالذكاء الاصطناعي",
  "قوالب HTML وCSS مخصصة بالذكاء الاصطناعي",
  "حفظ القوالب ضمن قوالبي",
  "الاستخدام بحسب الرصيد: تكلفة النموذج الفعلية + 20%",
];

export default function PricingPage() {
  const upgradeUrl = getWhatsAppUpgradeUrl();
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">الأسعار</h1>
          <p className="mt-3 text-ink-muted">ابدأ مجانًا اليوم</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-accent/30 bg-white p-8 shadow-soft text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">الخطة المجانية</span>
            </div>
            <h2 className="text-2xl font-extrabold text-ink">مجانًا</h2>
            <div className="space-y-3 text-right my-8">
              {features.concat("توليدان مجانيان مدى الحياة في مصمم القوالب").map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div>
                  <span className="text-sm text-ink">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full")}>ابدأ مجانًا</Link>
          </div>
          <div className="rounded-2xl border-2 border-accent bg-white p-8 shadow-soft text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 mb-4 text-white"><Sparkles className="w-4 h-4" /><span className="text-sm font-medium">الخطة المدفوعة</span></div>
            <h2 className="text-2xl font-extrabold text-ink">ادفع حسب الاستخدام</h2>
            <div className="space-y-3 text-right my-8">
              {paidFeatures.map((f) => (
                <div key={f} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div><span className="text-sm text-ink">{f}</span></div>
              ))}
            </div>
            {upgradeUrl ? (
              <a href={upgradeUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                اشترك عبر واتساب
              </a>
            ) : (
              <Button size="lg" className="w-full" disabled>تواصل للاشتراك</Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

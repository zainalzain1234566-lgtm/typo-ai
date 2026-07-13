import Link from "next/link";
import { Sparkles, ArrowLeft, Check, ChevronDown, FileText, Download, Wand2, Layout, Hash, Globe, ShieldCheck, Stethoscope, AlertCircle, Quote } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { VISIBLE_TEMPLATES, getPalette } from "@/lib/templates";
import type { Slide, BrandKit, BrandKitSettings } from "@/lib/types";
import { getWhatsAppUpgradeUrl } from "@/lib/whatsapp";
import { HOME_FAQS, createHomeJsonLd } from "@/lib/home-content";
import { createPageMetadata, getSiteUrl, ROUTE_SEO } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata(ROUTE_SEO["/"]);

const demoSlide: Slide = { id: "d1", type: "cover", title: "كيف تبني حضورك الرقمي؟", body: "دليل مبسّط لصناعة محتوى مؤثر" };
const demoSlides: Slide[] = [
  { id: "d1", type: "cover", title: "كيف تبني حضورك الرقمي؟", body: "دليل مبسّط لصناعة محتوى مؤثر" },
  { id: "d2", type: "content", title: "ابدأ بفكرة واضحة", body: "حدد ما يحتاجه جمهورك قبل كتابة المحتوى" },
  { id: "d3", type: "content", title: "نظّم رسالتك", body: "حوّل الفكرة إلى نقاط سهلة القراءة والمشاركة" },
];
const demoBrandKit: BrandKit = { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: "#0D9488", font: "tajawal" };
const demoBkSettings: BrandKitSettings = { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: true, placement: "bottom-left" };

const features = [
  { icon: ShieldCheck, title: "محتوى منظم", desc: "حوّل فكرتك العامة أو المتخصصة إلى تسلسل واضح من الشرائح" },
  { icon: Stethoscope, title: "عام أو طبي", desc: "اختر تجربة المحتوى المناسبة لمجالك عند إنشاء حسابك" },
  { icon: AlertCircle, title: "تحكم كامل", desc: "عدّل النص والتصميم والخطوط قبل تنزيل مشروعك" },
  { icon: Wand2, title: "كتابة بالذكاء الاصطناعي", desc: "حوّل موضوعك إلى مسودة شرائح قابلة للمراجعة والتعديل" },
  { icon: Layout, title: "قوالب احترافية", desc: "قوالب عربية نظيفة لمجالات وصنّاع محتوى مختلفين" },
  { icon: Download, title: "تصدير PNG وZIP", desc: "نزّل شريحة واحدة أو الكل دفعة واحدة" },
  { icon: Hash, title: "Caption وHashtags", desc: "وصف وهاشتاغات جاهزة للنسخ" },
  { icon: Globe, title: "دعم اللهجات العربية", desc: "فصحى، عراقية، خليجية — اكتب بلهجة جمهورك" },
];

const steps = [
  { icon: FileText, title: "اكتب موضوعك", desc: "مثال: كيف تبدأ مشروعًا صغيرًا؟" },
  { icon: Sparkles, title: "خصّص المحتوى", desc: "اختر التخصص، اللهجة، والأسلوب" },
  { icon: ShieldCheck, title: "راجع المحتوى", desc: "عدّل النصوص والتصميم قبل النشر" },
  { icon: Download, title: "نزّل التصميم", desc: "صدّر كصور PNG جاهزة للنشر" },
];

export default function LandingPage() {
  const jsonLd = createHomeJsonLd(getSiteUrl());

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      {jsonLd.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
      <main id="main-content">
        <Hero />
        <TrustMark />
        <HowItWorks />
        <MedicalReview />
        <TemplatePreviews />
        <Features />
        <Examples />
        <WorkflowDemo />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 mb-6">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">للمحتوى العام والطبي باللغة العربية</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink leading-tight text-balance">
              حوّل أي فكرة إلى كاروسيل عربي قابل للتعديل
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-md">
              اكتب موضوعك، وحدّد الجمهور والأسلوب واللهجة، ثم راجع الشرائح وعدّلها قبل تنزيلها. مناسب لصنّاع المحتوى والعلامات التجارية والمختصين الصحيين.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                ابدأ مجانًا <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/templates" className={buttonVariants({ size: "lg", variant: "outline" })}>
                استعرض القوالب
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-subtle flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              شرائح جاهزة للتعديل والتنزيل
            </p>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-lift">
              <div className="mb-3">
                <div className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-ink-muted bg-stone-50">
                  مثال: كيف تبني علامة تجارية قوية؟
                </div>
                <div className="mt-2 flex gap-2">
                  <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "flex-1 w-full")}>
                    توليد المحتوى
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {demoSlides.map((s, i) => {
                  const tmpl = VISIBLE_TEMPLATES[i % 3];
                  const pal = getPalette(tmpl.id, "p1");
                  return (
                    <div key={s.id} className="relative" style={{ transform: `translateY(${i * 8}px)`, zIndex: 3 - i }}>
                      <ScaledSlide
                        width={120}
                        slide={s}
                        templateId={tmpl.id}
                        palette={pal}
                        font="tajawal"
                        size="1080x1350"
                        brandKitSettings={demoBkSettings}
                        brandKitData={demoBrandKit}
                        index={i}
                        total={3}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustMark() {
  return (
    <section className="py-8 border-t border-stone-100 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-ink-muted">مناسب للمحتوى العام والطبي</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-ink-muted">كتابة بالذكاء الاصطناعي</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-ink-muted">تعديل وتصدير بسهولة</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-ink-muted">دعم اللهجات العربية</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="workflow" className="scroll-mt-20 py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">كيف يعمل</h2>
          <p className="mt-3 text-ink-muted">أربع خطوات من الفكرة إلى التصميم الجاهز</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-stone-200">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MedicalReview() {
  return (
    <section className="py-14 md:py-20 border-t border-stone-100 bg-teal-50/30">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1.5 mb-4">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">مسودة تساعدك على البدء والمراجعة</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">من الفكرة إلى التصميم</h2>
          <p className="mt-3 text-ink-muted">كل ما تحتاجه لكتابة وتنظيم وتصدير كاروسيل قابل للتعديل</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">فكرة واضحة</h3>
            <p className="text-sm text-ink-muted">ابدأ بموضوع عام أو متخصص وحدد جمهورك والأسلوب المناسب لرسالتك.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <Quote className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">مسودة متسلسلة</h3>
            <p className="text-sm text-ink-muted">يساعدك Typo AI على إعداد شرائح مترابطة ووصف وهاشتاغات يمكنك تحريرها.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">مراجعة قبل النشر</h3>
            <p className="text-sm text-ink-muted">يتطلب أي ناتج طبي من الذكاء الاصطناعي مراجعة مختص مؤهل قبل النشر، ولا يُعد نصيحة أو تشخيصًا طبيًا.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplatePreviews() {
  return (
    <section id="templates" className="scroll-mt-20 py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">قوالب احترافية</h2>
          <p className="mt-3 text-ink-muted">قوالب نظيفة للمحتوى العام والمتخصص والطبي</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VISIBLE_TEMPLATES.slice(0, 8).map((tmpl, i) => {
            const pal = getPalette(tmpl.id, ["p1", "p2", "p3", "p4"][i % 4]);
            return (
              <div key={tmpl.id} className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-soft">
                <div className="p-2">
                  <ScaledSlide
                    width={160}
                    slide={demoSlide}
                    templateId={tmpl.id}
                    palette={pal}
                    font="tajawal"
                    size="1080x1080"
                    brandKitSettings={demoBkSettings}
                    brandKitData={demoBrandKit}
                    index={0}
                    total={1}
                  />
                </div>
                <div className="px-3 py-2 text-center">
                  <span className="text-sm font-medium text-ink">{tmpl.name}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/templates" className={buttonVariants({ variant: "outline" })}>
            استعرض جميع القوالب <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">مميزات Typo AI</h2>
          <p className="mt-3 text-ink-muted">أدوات عملية لإنشاء كاروسيل عربي ومراجعته وتصديره</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Examples() {
  return (
    <section id="examples" className="py-14 md:py-20 border-t border-stone-100 bg-surface-tinted/50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">أمثلة على الكاروسيل العربي</h2>
          <p className="mt-3 text-ink-muted">نماذج عامة وطبية بإعدادات مختلفة</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tmpl: "tahrir", pal: "p1", title: "كيف تبني حضورك الرقمي؟", body: "دليل عملي مبسّط" },
            { tmpl: "academy", pal: "p2", title: "أساسيات إدارة الوقت", body: "خطوات قابلة للتطبيق" },
            { tmpl: "wadeh", pal: "p4", title: "أسئلة قبل نشر محتوى طبي", body: "راجع المصادر مع مختص" },
          ].map((ex, i) => {
            const tmpl = VISIBLE_TEMPLATES.find((t) => t.id === ex.tmpl)!;
            const pal = getPalette(ex.tmpl, ex.pal);
            const s: Slide = { id: `ex${i}`, type: "cover", title: ex.title, body: ex.body };
            return (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft overflow-hidden">
                <ScaledSlide
                  width={300}
                  slide={s}
                  templateId={tmpl.id}
                  palette={pal}
                  font={["tajawal", "cairo", "ibm"][i] as any}
                  size="1080x1350"
                  brandKitSettings={demoBkSettings}
                  brandKitData={demoBrandKit}
                  index={0}
                  total={1}
                />
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-ink">{tmpl.name}</span>
                  <span className="text-xs text-ink-muted">{pal.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowDemo() {
  return (
    <section className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">رحلة إنشاء المحتوى</h2>
          <p className="mt-3 text-ink-muted">من الموضوع إلى التصدير في دقائق</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-10 shadow-soft">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "أدخل الموضوع", desc: "اكتب فكرتك العامة أو المتخصصة", icon: FileText },
              { step: "02", title: "اختر الإعدادات", desc: "التخصص، اللهجة، الأسلوب", icon: Sparkles },
              { step: "03", title: "راجع المسودة", desc: "تحقق من النص والمصادر قبل النشر", icon: ShieldCheck },
              { step: "04", title: "نزّل التصميم", desc: "PNG أو ZIP جاهز للنشر", icon: Download },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-3xl font-extrabold text-teal-600/20 mb-2">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-ink-muted">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 -left-3 text-stone-200">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const upgradeUrl = getWhatsAppUpgradeUrl();
  const freePlan = ["إنشاء مشاريع كاروسيل", "الوصول إلى القوالب الحالية", "تنزيل الصور دون علامة مائية", "إنشاء Caption وHashtags", "توليدان مجانيان مدى الحياة في مصمم القوالب"];
  const paidPlan = ["كل مزايا الخطة المجانية", "مصمم القوالب بالذكاء الاصطناعي", "قوالب HTML وCSS مخصصة", "حفظ القوالب ضمن قوالبي", "تكلفة النموذج الفعلية + 20% حسب الرصيد"];
  return (
    <section id="pricing" className="scroll-mt-20 py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">الأسعار</h2>
          <p className="mt-3 text-ink-muted">ابدأ مجانًا اليوم</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[{ name: "الخطة المجانية", items: freePlan }, { name: "الخطة المدفوعة", items: paidPlan }].map((plan, index) => (
            <div key={plan.name} className="rounded-2xl border-2 border-teal-500/30 bg-white p-8 shadow-soft text-center">
              <h3 className="text-2xl font-extrabold text-ink">{plan.name}</h3>
              <p className="my-4 text-ink-muted">{index === 0 ? "مجانًا" : "ادفع حسب الاستخدام"}</p>
              <div className="space-y-3 text-right mb-8">
                {plan.items.map((f) => <div key={f} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div><span className="text-sm text-ink">{f}</span></div>)}
              </div>
              {index === 0 ? (
                <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                  ابدأ مجانًا
                </Link>
              ) : upgradeUrl ? (
                <a href={upgradeUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                  اشترك عبر واتساب
                </a>
              ) : (
                <Button size="lg" className="w-full" disabled>تواصل للاشتراك</Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/pricing" className={buttonVariants({ variant: "link" })}>
            عرض تفاصيل الأسعار كاملة <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">الأسئلة الشائعة</h2>
          <p className="mt-3 text-ink-muted">إجابات على أكثر الأسئلة شيوعًا</p>
        </div>
        <div className="space-y-3">
          {HOME_FAQS.map((faq, index) => (
            <details key={faq.question} open={index === 0} className="group rounded-xl border border-stone-200 bg-white overflow-hidden">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5 text-right hover:bg-stone-50/50 transition-colors marker:content-none">
                <span className="font-semibold text-ink">{faq.question}</span>
                <ChevronDown aria-hidden="true" className="w-5 h-5 text-ink-subtle transition-transform shrink-0 group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-teal-700 p-10 md:p-16 text-center">
          <Stethoscope className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">جاهز لتحوّل فكرتك إلى كاروسيل؟</h2>
          <p className="mt-3 text-white text-lg">أنشئ مسودتك، راجعها، ثم نزّل التصميم في مكان واحد</p>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 bg-white text-accent hover:bg-white")}
          >
            ابدأ مجانًا الآن
          </Link>
        </div>
      </div>
    </section>
  );
}

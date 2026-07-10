"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Check, ChevronDown, FileText, Palette, Download, Wand2, Layout, Image as ImageIcon, Type, Save, Hash, Globe, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { TEMPLATE_DEFS, getPalette } from "@/lib/templates";
import type { Slide, BrandKit, BrandKitSettings } from "@/lib/types";

const demoSlide: Slide = { id: "d1", type: "cover", title: "كيف يعمل الذكاء الاصطناعي؟", body: "دليل مبسّط لفهم الأساسيات" };
const demoSlides: Slide[] = [
  { id: "d1", type: "cover", title: "كيف يعمل الذكاء الاصطناعي؟", body: "دليل مبسّط لفهم الأساسيات" },
  { id: "d2", type: "content", title: "البيانات هي الأساس", body: "يعتمد الذكاء الاصطناعي على كميات ضخمة من البيانات." },
  { id: "d3", type: "content", title: "التعلم الآلي", body: "النماذج تتعلم الأنماط من البيانات تلقائيًا." },
];
const demoBrandKit: BrandKit = { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: "#6D5EFC", font: "tajawal" };
const demoBkSettings: BrandKitSettings = { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, placement: "bottom-left" };

const features = [
  { icon: Wand2, title: "كتابة المحتوى بالذكاء الاصطناعي", desc: "حوّل فكرتك إلى شرائح مكتوبة تلقائيًا" },
  { icon: Layout, title: "قوالب HTML جاهزة", desc: "10 قوالب احترافية قابلة للتخصيص" },
  { icon: ImageIcon, title: "مقاسات Instagram", desc: "مربع، عمودي، وستوري بدقة عالية" },
  { icon: Type, title: "تعديل النص بسهولة", desc: "حرّك أعد ترتيب الشرائح كما تريد" },
  { icon: Palette, title: "هوية بصرية محفوظة", desc: "احفظ شعارك وألوانك لكل المشاريع" },
  { icon: Download, title: "تصدير PNG وZIP", desc: "نزّل شريحة واحدة أو الكل دفعة واحدة" },
  { icon: Hash, title: "إنشاء Caption وHashtags", desc: "وصف وهاشتاغات جاهزة للنسخ" },
  { icon: Globe, title: "دعم كامل للغة العربية", desc: "واجهة عربية وRTL وخطوط متنوعة" },
];

const steps = [
  { icon: MousePointerClick, title: "اكتب الموضوع", desc: "أدخل فكرتك واختر نوع المحتوى" },
  { icon: Sparkles, title: "خصّص المحتوى", desc: "حدد الجمهور والأسلوب واللغة" },
  { icon: Layout, title: "اختر القالب", desc: "تصميم جاهز بألوان وخطوط قابلة للتغيير" },
  { icon: Download, title: "نزّل التصميم", desc: "صدّر كصور PNG جاهزة للنشر" },
];

const faqs = [
  { q: "هل أحتاج إلى خبرة في التصميم؟", a: "لا، Typo AI مصمم ليكون سهل الاستخدام لأي شخص. كل ما تحتاجه هو فكرتك." },
  { q: "ما المقاسات المدعومة؟", a: "ندعم ثلاثة مقاسات: منشور مربع 1080×1080، منشور عمودي 1080×1350، وستوري Instagram 1080×1920." },
  { q: "هل يمكن تعديل النص بعد إنشائه؟", a: "نعم، يمكنك تعديل جميع النصوص بعد إنشائها من محرر الشرائح." },
  { q: "هل يمكن تغيير القالب دون فقدان المحتوى؟", a: "نعم، تغيير القالب يغيّر التصميم فقط بينما يبقى المحتوى كما هو." },
  { q: "كيف يتم تنزيل الشرائح؟", a: "يمكنك تنزيل كل شريحة كصورة PNG أو تنزيل جميع الشرائح في ملف ZIP واحد." },
  { q: "هل توجد علامة مائية؟", a: "لا، جميع الصور المنزّلة خالية من العلامة المائية." },
  { q: "هل الخدمة مجانية؟", a: "نعم، الخطة الحالية مجانية تمامًا. سيتم الإعلان عن الخطط المستقبلية لاحقًا." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <Hero />
      <HowItWorks />
      <TemplatePreviews />
      <Features />
      <Examples />
      <WorkflowDemo />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">مدعوم بالذكاء الاصطناعي</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink leading-tight text-balance">
              حوّل أي فكرة إلى كاروسيل جاهز للنشر
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-md">
              اكتب موضوعك، حدّد أسلوب المحتوى، واختر القالب. يتولى Typo AI كتابة الشرائح وتجهيزها للتنزيل خلال دقائق.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">ابدأ مجانًا <ArrowLeft className="w-4 h-4" /></Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline">استعرض القوالب</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-subtle flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              لا تحتاج إلى أي خبرة في التصميم
            </p>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-lift">
              <div className="mb-3">
                <div className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-ink-muted bg-stone-50">
                  مثال: كيف يعمل الذكاء الاصطناعي؟
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" className="flex-1">توليد المحتوى</Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {demoSlides.map((s, i) => {
                  const tmpl = TEMPLATE_DEFS[i % 3];
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">كيف يعمل</h2>
          <p className="mt-3 text-ink-muted">أربع خطوات بسيطة من الفكرة إلى التصميم</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-2xl font-extrabold text-stone-200">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplatePreviews() {
  return (
    <section className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">قوالب احترافية</h2>
          <p className="mt-3 text-ink-muted">10 قوالب متنوعة لكل أنواع المحتوى</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TEMPLATE_DEFS.slice(0, 10).map((tmpl, i) => {
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
          <Link href="/templates">
            <Button variant="outline">استعرض جميع القوالب <ArrowLeft className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">مميزات Typo AI</h2>
          <p className="mt-3 text-ink-muted">كل ما تحتاجه لإنشاء كاروسيل احترافي</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.1 }}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </motion.div>
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">أمثلة على الكاروسيل</h2>
          <p className="mt-3 text-ink-muted">نماذج جاهزة بإعدادات مختلفة</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tmpl: "tahrir", pal: "p1", title: "كيف يعمل الذكاء الاصطناعي؟", body: "دليل مبسّط" },
            { tmpl: "tabayun", pal: "p2", title: "5 نصائح للنوم الصحي", body: "نصائح عملية" },
            { tmpl: "hadith", pal: "p4", title: "ابدأ مشروعك الأول", body: "خطوة بخطوة" },
          ].map((ex, i) => {
            const tmpl = TEMPLATE_DEFS.find((t) => t.id === ex.tmpl)!;
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">رحلة إنشاء المشروع</h2>
          <p className="mt-3 text-ink-muted">من الفكرة إلى التصدير في دقائق</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-10 shadow-soft">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "أدخل الموضوع", desc: "اكتب فكرتك في حقل واحد", icon: FileText },
              { step: "02", title: "اختر الإعدادات", desc: "النوع، الجمهور، الأسلوب", icon: Sparkles },
              { step: "03", title: "صدّر النتيجة", desc: "شاهد الشرائح وعدّلها", icon: Save },
              { step: "04", title: "نزّل التصميم", desc: "PNG أو ZIP جاهز للنشر", icon: Download },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-3xl font-extrabold text-accent/20 mb-2">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-accent" />
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
  return (
    <section className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">الأسعار</h2>
          <p className="mt-3 text-ink-muted">ابدأ مجانًا اليوم</p>
        </div>
        <div className="rounded-2xl border-2 border-accent/30 bg-white p-8 shadow-soft max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">الخطة الحالية</span>
          </div>
          <h3 className="text-2xl font-extrabold text-ink">الخطة المجانية</h3>
          <div className="my-6">
            <span className="text-5xl font-extrabold text-ink">مجانًا</span>
          </div>
          <div className="space-y-3 text-right mb-8">
            {["إنشاء مشاريع كاروسيل", "الوصول إلى القوالب الحالية", "تنزيل الصور دون علامة مائية", "إنشاء Caption وHashtags", "حفظ المشاريع"].map((f) => (
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
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">الأسئلة الشائعة</h2>
          <p className="mt-3 text-ink-muted">إجابات على أكثر الأسئلة شيوعًا</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-right cursor-pointer hover:bg-stone-50/50 transition-colors"
              >
                <span className="font-semibold text-ink">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-ink-subtle transition-transform shrink-0 ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </div>
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
        <div className="rounded-3xl bg-accent p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">جاهز لتبدأ؟</h2>
          <p className="mt-3 text-white/80 text-lg">أنشئ أول كاروسيل لك في دقائق</p>
          <Link href="/signup" className="inline-block mt-6">
            <Button size="lg" variant="secondary" className="bg-white text-accent hover:bg-stone-50">ابدأ مجانًا الآن</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

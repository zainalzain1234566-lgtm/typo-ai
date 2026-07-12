"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Check, ChevronDown, FileText, Palette, Download, Wand2, Layout, Image as ImageIcon, Type, Save, Hash, Globe, ShieldCheck, Stethoscope, AlertCircle, BookMarked, Quote } from "lucide-react";
import { useState } from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { VISIBLE_TEMPLATES, getPalette } from "@/lib/templates";
import type { Slide, BrandKit, BrandKitSettings } from "@/lib/types";
import { getWhatsAppUpgradeUrl } from "@/lib/whatsapp";

const demoSlide: Slide = { id: "d1", type: "cover", title: "كيف تبني حضورك الرقمي؟", body: "دليل مبسّط لصناعة محتوى مؤثر" };
const demoSlides: Slide[] = [
  { id: "d1", type: "cover", title: "كيف تبني حضورك الرقمي؟", body: "دليل مبسّط لصناعة محتوى مؤثر" },
  { id: "d2", type: "content", title: "ابدأ بفكرة واضحة", body: "حدد ما يحتاجه جمهورك قبل كتابة المحتوى" },
  { id: "d3", type: "content", title: "نظّم رسالتك", body: "حوّل الفكرة إلى نقاط سهلة القراءة والمشاركة" },
];
const demoBrandKit: BrandKit = { instagramHandle: "@dr.health", logoDataUrl: null, primaryColor: "#0D9488", font: "tajawal" };
const demoBkSettings: BrandKitSettings = { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: true, placement: "bottom-left" };

const features = [
  { icon: ShieldCheck, title: "محتوى منظم", desc: "حوّل فكرتك إلى تسلسل واضح من الشرائح الجاهزة للنشر" },
  { icon: Stethoscope, title: "مناسب لمجالك", desc: "اختر تجربة محتوى عام أو طبي عند إنشاء حسابك" },
  { icon: AlertCircle, title: "تحكم كامل", desc: "عدّل النص والتصميم والخطوط قبل تنزيل مشروعك" },
  { icon: Wand2, title: "كتابة بالذكاء الاصطناعي", desc: "حوّل موضوعك الصحي إلى شرائح مكتوبة تلقائيًا" },
  { icon: Layout, title: "قوالب احترافية", desc: "قوالب طبية نظيفة بألوان وخطوط عربية" },
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

const faqs = [
  { q: "هل المحتوى الطبي دقيق؟", a: "نعم، يمر كل محتوى بمرحلة مراجعة طبية تلقائية تستخدم الذكاء الاصطناعي لرصد الادعاءات الخطرة، الجرعات الخاطئة، واللغة المطلقة. الأداة صُممت بواسطة طبيب لضمان أعلى مستوى من الدقة." },
  { q: "هل أحتاج إلى خبرة في التصميم؟", a: "لا، Typo AI مصمم ليكون سهل الاستخدام لأي صانع محتوى صحي. كل ما تحتاجه هو موضوعك." },
  { q: "ما اللهجات المدعومة؟", a: "ندعم العربية الفصحى، اللهجة العراقية، واللهجة الخليجية — لتصل لجمهورك بالطريقة الأنسب." },
  { q: "هل يمكن تعديل النص بعد إنشائه؟", a: "نعم، يمكنك تعديل جميع النصوص بعد إنشائها من محرر الشرائح." },
  { q: "هل يضاف تنبيه طبي تلقائيًا؟", a: "نعم، يُضاف تنبيه \"استشر طبيبك\" على كل كاروسيل تلقائيًا، ويمكنك تخصيصه أو إخفاؤه." },
  { q: "ما المقاسات المدعومة؟", a: "ندعم مقاس المنشور العمودي 1080×1350 (4:5) الأنسب لإنستغرام." },
  { q: "كيف يتم تنزيل الشرائح؟", a: "يمكنك تنزيل كل شريحة كصورة PNG أو تنزيل جميع الشرائح في ملف ZIP واحد." },
  { q: "هل توجد علامة مائية؟", a: "لا، جميع الصور المنزّلة خالية من العلامة المائية." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
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
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 mb-6">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">أداة طبية الصنع — بواسطة طبيب</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink leading-tight text-balance">
              حوّل أي فكرة إلى كاروسيل احترافي وجاهز للنشر
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-md">
              اكتب موضوعك، حدّد الجمهور والأسلوب واللهجة، ويتولى Typo AI كتابة الشرائح وتجهيزها للتنزيل.
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
              شرائح جاهزة للتعديل والتنزيل
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-lift">
              <div className="mb-3">
                <div className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-ink-muted bg-stone-50">
                  مثال: كيف تبني علامة تجارية قوية؟
                </div>
                <div className="mt-2 flex gap-2">
                  <Link href="/signup" className="flex-1">
                    <Button size="sm" className="w-full">توليد المحتوى</Button>
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
          </motion.div>
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
    <section id="how" className="py-14 md:py-20 border-t border-stone-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">كيف يعمل</h2>
          <p className="mt-3 text-ink-muted">أربع خطوات من الموضوع الصحي إلى التصميم الجاهز</p>
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
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-teal-600" />
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

function MedicalReview() {
  return (
    <section className="py-14 md:py-20 border-t border-stone-100 bg-teal-50/30">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1.5 mb-4">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">الميزة التي لا يملكها المنافسون</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">من الفكرة إلى التصميم</h2>
          <p className="mt-3 text-ink-muted">كل ما تحتاجه لكتابة وتنظيم وتصدير كاروسيل احترافي</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">فكرة واضحة</h3>
            <p className="text-sm text-ink-muted">ابدأ بموضوعك وحدد جمهورك والأسلوب المناسب لرسالتك.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <Quote className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">محتوى متسلسل</h3>
            <p className="text-sm text-ink-muted">يحوله Typo AI إلى شرائح مترابطة ووصف وهاشتاغات جاهزة.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold text-ink mb-2">تصميم قابل للتعديل</h3>
            <p className="text-sm text-ink-muted">اختر القالب والألوان والخط ثم نزّل الصور عندما تصبح جاهزة.</p>
          </div>
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
          <p className="mt-3 text-ink-muted">قوالب نظيفة ومناسبة للمحتوى الصحي</p>
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
          <p className="mt-3 text-ink-muted">كل ما تحتاجه لإنشاء كاروسيل صحي دقيق واحترافي</p>
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
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-teal-600" />
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">أمثلة على الكاروسيل الصحي</h2>
          <p className="mt-3 text-ink-muted">نماذج جاهزة بإعدادات مختلفة</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tmpl: "tahrir", pal: "p1", title: "أسباب الصداع النصفي", body: "دليل مبسّط" },
            { tmpl: "academy", pal: "p2", title: "٥ علامات لنقص فيتامين د", body: "متى تستشير الطبيب؟" },
            { tmpl: "wadeh", pal: "p4", title: "خرافة: السكر يسبب فرط الحركة", body: "الحقيقة العلمية" },
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">رحلة إنشاء المحتوى الصحي</h2>
          <p className="mt-3 text-ink-muted">من الموضوع إلى التصدير في دقائق</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-10 shadow-soft">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "أدخل الموضوع", desc: "اكتب فكرتك الصحية", icon: FileText },
              { step: "02", title: "اختر الإعدادات", desc: "التخصص، اللهجة، الأسلوب", icon: Sparkles },
              { step: "03", title: "مراجعة طبية", desc: "فحص تلقائي للمحتوى", icon: ShieldCheck },
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
    <section className="py-14 md:py-20 border-t border-stone-100">
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
              {index === 0 ? <Link href="/signup"><Button size="lg" className="w-full">ابدأ مجانًا</Button></Link> : upgradeUrl ? <a href={upgradeUrl} target="_blank" rel="noreferrer"><Button size="lg" className="w-full">اشترك عبر واتساب</Button></a> : <Button size="lg" className="w-full" disabled>تواصل للاشتراك</Button>}
            </div>
          ))}
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
        <div className="rounded-3xl bg-teal-600 p-10 md:p-16 text-center">
          <Stethoscope className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">جاهز لتنشئ محتوى صحيًا دقيقًا؟</h2>
          <p className="mt-3 text-white/80 text-lg">أنشئ أول كاروسيل طبي لك في دقائق</p>
          <Link href="/signup" className="inline-block mt-6">
            <Button size="lg" variant="secondary" className="bg-white text-teal-600 hover:bg-stone-50">ابدأ مجانًا الآن</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

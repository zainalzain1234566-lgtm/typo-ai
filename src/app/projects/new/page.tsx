"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sparkles, Loader2, Plus, Copy, Trash2, GripVertical,
  Type, BookOpen, Lightbulb, List, GitCompare, Footprints, Heart, BookMarked,
  Users, GraduationCap, MessageSquare, Languages, Square, RectangleVertical,
  RectangleHorizontal, Minus, Palette, Check, Eye, EyeOff, Settings as SettingsIcon,
  ShieldQuestion, ShieldCheck,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { TypographyControls } from "@/components/carousel/typography-controls";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/toast";
import {
  TEMPLATE_DEFS, getPalette, paletteForTemplateThumbnail, paletteWithBrandAccent, settingsForTemplateSelection,
  SIZES, templatesForMode, ALL_FONTS,
} from "@/lib/templates";
import { PROGRESS_MESSAGES } from "@/lib/services/generation";
import {
  createBlankProject, useTemplateLookup, projectToCreateInput,
  projectToUpdateInput, mapProject, mapSlide,
} from "@/lib/db-mappers";
import { attachSignedImageUrls } from "@/lib/slide-images";
import { friendlyAuthError } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import { defaultTemplateForMode } from "@/lib/content-mode";
import { getProjectCreationAccess } from "@/lib/project-generation-access";
import type { Project, Slide, ContentType, Tone, Language, ContentLevel, CarouselSize, CTAOption, FontFamily, Placement, SlideType } from "@/lib/types";
import {
  createProjectAction, updateProjectAction, updateSlideAction,
  addSlideAction, duplicateSlideAction, deleteSlideAction, reorderSlidesAction,
} from "@/app/actions/projects";

const ALL_CONTENT_TYPES: { id: ContentType; icon: any; desc: string }[] = [
  { id: "توعوي", icon: Lightbulb, desc: "توعية صحية" },
  { id: "تفكيك الخرافات", icon: ShieldQuestion, desc: "تصحيح خرافات طبية" },
  { id: "شرح مرض", icon: BookOpen, desc: "شرح حالة طبية" },
  { id: "خطوات", icon: Footprints, desc: "خطوات عملية" },
  { id: "نصائح", icon: Heart, desc: "نصائح وإرشادات" },
  { id: "تعليمي", icon: Type, desc: "محتوى تعليمي مبسّط" },
  { id: "قصة", icon: BookMarked, desc: "سرد قصة ملهمة" },
  { id: "قائمة", icon: List, desc: "قائمة منظمة من النقاط" },
  { id: "مقارنة", icon: GitCompare, desc: "مقارنة بين خيارين" },
  { id: "شرح مفهوم", icon: Type, desc: "تبسيط مفهوم معقد" },
];
const MEDICAL_CONTENT_TYPES = ALL_CONTENT_TYPES.slice(0, 5);
const GENERAL_CONTENT_TYPES = ALL_CONTENT_TYPES.filter((type) => !["تفكيك الخرافات", "شرح مرض"].includes(type.id));
const ALL_TONES: Tone[] = ["مبسطة", "احترافية", "ودية", "رسمية", "تحفيزية", "قصصية", "مباشرة", "أكاديمية"];
const ALL_LANGUAGES: Language[] = ["العربية الفصحى", "اللهجة العراقية", "اللهجة الخليجية", "اللهجة المصرية", "الإنجليزية"];
const MEDICAL_LANGUAGES = ALL_LANGUAGES.slice(0, 3);
const TONES = ALL_TONES;
const LEVELS: ContentLevel[] = ["مبتدئ", "متوسط", "متقدم"];
const CTAS: CTAOption[] = ["بدون CTA", "احفظ المنشور", "شارك المنشور", "تابع الحساب", "اكتب رأيك"];

const SPECIALTIES = [
  { slug: "general", name: "طب عام" },
  { slug: "dentistry", name: "طب الأسنان" },
  { slug: "dermatology", name: "الجلدية" },
  { slug: "nutrition", name: "التغذية" },
  { slug: "pediatrics", name: "طب الأطفال" },
  { slug: "cardiology", name: "أمراض القلب" },
  { slug: "neurology", name: "الأعصاب" },
  { slug: "mental_health", name: "الصحة النفسية" },
];

const STEPS = [
  { title: "الموضوع", num: "1" },
  { title: "تخصيص المحتوى", num: "2" },
  { title: "المقاس والشرائح", num: "3" },
  { title: "القالب والهوية", num: "4" },
  { title: "المراجعة", num: "5" },
  { title: "التصدير", num: "6" },
];

export default function NewProjectWizard() {
  return (
    <Suspense fallback={
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">إنشاء مشروع كاروسيل</h1>
          <p className="mt-2 text-sm text-ink-muted">جارٍ تجهيز خطوات إنشاء المشروع...</p>
        </div>
      </main>
    }>
      <WizardContent />
    </Suspense>
  );
}

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brandKit, supabase, preferences, billing, refresh } = useApp();
  const { toast } = useToast();
  const lookup = useTemplateLookup(supabase);
  const lookupReady = Object.keys(lookup).length > 0;
  const isMedical = preferences.contentMode === "medical";
  const modeTemplates = useMemo(() => templatesForMode(preferences.contentMode), [preferences.contentMode]);

  const [project, setProject] = useState<Project>(() => {
    const p = createBlankProject();
    const templateParam = searchParams.get("template");
    if (templateParam) p.settings.templateId = templateParam;
    p.settings.titleFont = brandKit.font as FontFamily;
    p.settings.bodyFont = brandKit.font as FontFamily;
    p.settings.brandKit.enabled = false;
    return p;
  });

  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState("");
  const [genFailed, setGenFailed] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [dbProjectId, setDbProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const generationAccess = getProjectCreationAccess({
    operation: "generate",
    plan: billing.plan,
    subscriptionStatus: billing.subscriptionStatus,
    freeProjectsRemaining: billing.freeProjectsRemaining,
    creditBalanceMicroUsd: billing.creditBalanceMicroUsd,
  });
  const paidActive = billing.plan === "paid" && billing.subscriptionStatus === "active";

  useEffect(() => {
    const requestedTemplate = searchParams.get("template");
    const templateId = requestedTemplate && modeTemplates.some((template) => template.id === requestedTemplate)
      ? requestedTemplate
      : defaultTemplateForMode(preferences.contentMode);
    setProject((prev) => prev.slides.length > 0 || prev.title !== "مشروع بدون عنوان" ? prev : {
      ...prev,
      settings: {
        ...prev.settings,
        templateId,
        brandKit: { ...prev.settings.brandKit, showDisclaimer: isMedical },
      },
    });
  }, [preferences.contentMode, isMedical, modeTemplates, searchParams]);

  const update = (updates: Partial<typeof project>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  };
  const updateSettings = (updates: Partial<typeof project.settings>) => {
    setProject((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  // Fetch a project + its slides from DB and map to frontend type
  const fetchProject = useCallback(async (id: string): Promise<Project | null> => {
    const { data: row } = await supabase
      .from("projects")
      .select("*, template:templates(slug), palette:template_palettes(sort_order)")
      .eq("id", id)
      .single();
    if (!row) return null;
    const { data: slideRows } = await supabase
      .from("slides")
      .select("*")
      .eq("project_id", id)
      .order("position");
    return mapProject(row, await attachSignedImageUrls(supabase, slideRows ?? []));
  }, [supabase]);

  const handleGenerate = async () => {
    if (!generationAccess.allowed) {
      setGenFailed(true);
      setGenMessage(generationAccess.reason === "insufficient_credit"
        ? "رصيدك غير كافٍ لإنشاء مشروع جديد"
        : "استخدمت المشاريع المجانية الخمسة. قم بالترقية لإنشاء المزيد");
      return;
    }
    setGenerating(true);
    setGenFailed(false);
    setGenProgress(0);
    let msgIdx = 0;
    setGenMessage(PROGRESS_MESSAGES[0]);

    const interval = setInterval(() => {
      msgIdx++;
      if (msgIdx < PROGRESS_MESSAGES.length) {
        setGenMessage(PROGRESS_MESSAGES[msgIdx]);
        setGenProgress((msgIdx / PROGRESS_MESSAGES.length) * 100);
      }
    }, 500);

    const input = projectToCreateInput(project, lookup);
    if (!input) {
      clearInterval(interval);
      console.error("[Generate] projectToCreateInput returned null — lookup not ready", { templateId: project.settings.templateId, paletteId: project.settings.paletteId, lookup });
      setGenerating(false);
      setGenFailed(true);
      return;
    }

    const result = await createProjectAction(input);
    clearInterval(interval);
    setGenProgress(100);

    if (!result.success) {
      console.error("[Generate] createProjectAction failed", result.error);
      setGenFailed(true);
      setGenMessage(result.error ? friendlyAuthError(result.error) : "فشل التوليد");
      setGenerating(false);
      return;
    }

    // Fetch the created project with generated slides
    setDbProjectId(result.projectId!);
    const fetched = await fetchProject(result.projectId!);
    if (fetched) {
      // Preserve user-selected template/palette/font (createProjectAction used defaults)
      fetched.settings.templateId = project.settings.templateId;
      fetched.settings.paletteId = project.settings.paletteId;
      fetched.settings.titleFont = project.settings.titleFont;
      fetched.settings.bodyFont = project.settings.bodyFont;
      fetched.settings.titleFontSizeScale = project.settings.titleFontSizeScale;
      fetched.settings.bodyFontSizeScale = project.settings.bodyFontSizeScale;
      fetched.settings.titleTextAlign = project.settings.titleTextAlign;
      fetched.settings.bodyTextAlign = project.settings.bodyTextAlign;
      fetched.settings.brandKit = project.settings.brandKit;
      setProject(fetched);
    }
    await refresh();
    setGenerating(false);
    toast({ type: "success", title: "تم إنشاء المحتوى", description: `${fetched?.slides.length ?? 0} شرائح جاهزة للمراجعة` });
  };

  const saveAll = async (markCompleted: boolean) => {
    if (!dbProjectId) return;
    setSaving(true);
    const finalProject = markCompleted ? { ...project, status: "completed" as const } : project;
    const input = projectToUpdateInput(finalProject, lookup);
    if (input) await updateProjectAction(input);
    // Save all slides
    for (const slide of project.slides) {
      await updateSlideAction({
        id: slide.id,
        title: slide.title,
        body: slide.body,
        cta_text: slide.ctaText ?? null,
      });
    }
    setSaving(false);
  };

  const handleSaveAndExport = async () => {
    await saveAll(true);
    if (dbProjectId) router.push(`/projects/${dbProjectId}/export`);
  };

  const handleSaveAndEdit = async () => {
    await saveAll(false);
    if (dbProjectId) router.push(`/projects/${dbProjectId}/edit`);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return project.title.trim().length > 0;
      case 2: return project.settings.audience.trim().length > 0;
      case 3: return project.slides.length > 0;
      case 4: return true;
      case 5: return project.slides.length >= 2;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  aria-label={`الانتقال إلى خطوة ${s.num}: ${s.title}`}
                  aria-current={step === parseInt(s.num) ? "step" : undefined}
                  onClick={() => setStep(parseInt(s.num))}
                  disabled={step < parseInt(s.num)}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center gap-2 transition-colors",
                    step === parseInt(s.num) ? "text-accent" : step > parseInt(s.num) ? "text-green-600 cursor-pointer" : "text-ink-subtle cursor-not-allowed opacity-50"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                    step === parseInt(s.num) ? "border-accent bg-accent text-white" : step > parseInt(s.num) ? "border-green-600 bg-green-600 text-white" : "border-stone-300 bg-white text-stone-400"
                  )}>
                    {step > parseInt(s.num) ? <Check className="w-4 h-4" /> : s.num}
                  </span>
                  <span className="text-sm font-medium hidden md:inline">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2 transition-colors", step > parseInt(s.num) ? "bg-green-600" : "bg-stone-200")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="sr-only">إنشاء مشروع كاروسيل</h1>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">
          <span className="font-medium text-ink">
            {paidActive
              ? `الرصيد المتاح: $${(billing.creditBalanceMicroUsd / 1_000_000).toFixed(2)}`
              : `${billing.freeProjectsRemaining} من 5 مشاريع متبقية`}
            {generationAccess.reason === "insufficient_credit" && (
              <span className="mt-1 block text-red-700">الرصيد غير كافٍ لإنشاء مشروع جديد</span>
            )}
          </span>
          {!generationAccess.allowed && (
            <button type="button" onClick={() => router.push("/pricing")} className="min-h-11 font-semibold text-accent underline underline-offset-4">
              ترقية الخطة
            </button>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1Topic project={project} update={update} updateSettings={updateSettings} isMedical={isMedical} contentTypes={isMedical ? MEDICAL_CONTENT_TYPES : GENERAL_CONTENT_TYPES} />}
            {step === 2 && <Step2Customize project={project} updateSettings={updateSettings} languages={isMedical ? MEDICAL_LANGUAGES : ALL_LANGUAGES} />}
            {step === 3 && (
              <Step3Size project={project} updateSettings={updateSettings}
                generating={generating} genMessage={genMessage} genProgress={genProgress}                 genFailed={genFailed}
                onGenerate={handleGenerate} onRetry={handleGenerate}
                lookupReady={lookupReady} isMedical={isMedical}
              />
            )}
            {step === 4 && <Step4Template project={project} updateSettings={updateSettings} brandKit={brandKit} templates={modeTemplates} isMedical={isMedical} />}
            {step === 5 && <Step5Review project={project} update={update} setProject={setProject} dbProjectId={dbProjectId} onRefresh={fetchProject} />}
            {step === 6 && <Step6Export project={project} brandKit={brandKit} templates={modeTemplates} isMedical={isMedical} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200 flex-wrap gap-3">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowRight className="w-4 h-4" /> السابق
            </Button>
          ) : <div />}
          {step < 6 ? (
            <Button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}>
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleSaveAndEdit} disabled={saving || !dbProjectId}>
                حفظ وتعديل
              </Button>
              <Button onClick={handleSaveAndExport} disabled={saving || !dbProjectId}>
                <Sparkles className="w-4 h-4" /> حفظ وتصدير
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ============ STEP 1: Topic ============

function Step1Topic({ project, update, updateSettings, isMedical, contentTypes }: {
  project: Project;
  update: (u: Partial<Project>) => void;
  updateSettings: (u: Partial<Project["settings"]>) => void;
  isMedical: boolean;
  contentTypes: typeof ALL_CONTENT_TYPES;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-ink mb-1">ما الموضوع الذي تريد تحويله إلى كاروسيل؟</h2>
      <p className="text-ink-muted mb-6">اكتب موضوعك واختر نوع المحتوى</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="topic">موضوع المحتوى</Label>
          <Input
            id="topic"
            placeholder="مثال: أسباب الصداع النصفي"
            value={project.title}
            onChange={(e) => update({ title: e.target.value })}
            autoFocus
          />
        </div>

        {isMedical && (
          <div>
            <Label>التخصص الطبي</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SPECIALTIES.map((sp) => (
                <button
                  key={sp.slug}
                  type="button"
                  onClick={() => updateSettings({ specialty: sp.slug })}
                  aria-pressed={project.settings.specialty === sp.slug}
                  className={cn(
                    "min-h-11 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                    project.settings.specialty === sp.slug ? "border-teal-500 bg-teal-50 text-teal-700" : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                  )}
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>نوع المحتوى</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {contentTypes.map((ct) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => updateSettings({ contentType: ct.id })}
                aria-pressed={project.settings.contentType === ct.id}
                className={cn(
                  "rounded-xl border-2 p-4 text-center transition-all cursor-pointer",
                  project.settings.contentType === ct.id ? "border-accent bg-accent-soft" : "border-stone-200 bg-white hover:border-stone-300"
                )}
              >
                <ct.icon className={cn("w-6 h-6 mx-auto mb-2", project.settings.contentType === ct.id ? "text-accent" : "text-ink-muted")} />
                <span className={cn("text-sm font-medium block", project.settings.contentType === ct.id ? "text-accent" : "text-ink")}>{ct.id}</span>
                <span className="text-xs text-ink-subtle mt-0.5 block">{ct.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>الإجراء المطلوب (CTA)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CTAS.map((cta) => (
              <button
                key={cta}
                type="button"
                onClick={() => updateSettings({ cta: cta })}
                aria-pressed={project.settings.cta === cta}
                className={cn(
                  "min-h-11 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                  project.settings.cta === cta ? "border-accent bg-accent text-white" : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                )}
              >
                {cta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 2: Content Customization ============

function Step2Customize({ project, updateSettings, languages }: {
  project: Project;
  updateSettings: (u: Partial<Project["settings"]>) => void;
  languages: Language[];
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-ink mb-1">خصّص أسلوب المحتوى</h2>
      <p className="text-ink-muted mb-6">حدد جمهورك ودرجة المحتوى وأسلوبه</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="audience">الجمهور المستهدف</Label>
          <Input
            id="audience"
            placeholder="مثال: طلاب الطب، أصحاب المشاريع، صناع المحتوى"
            value={project.settings.audience}
            onChange={(e) => updateSettings({ audience: e.target.value })}
            autoFocus
          />
        </div>

        <div>
          <Label>مستوى المحتوى</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateSettings({ level: level })}
                aria-pressed={project.settings.level === level}
                className={cn(
                  "rounded-xl border-2 py-3 text-sm font-medium transition-all cursor-pointer",
                  project.settings.level === level ? "border-accent bg-accent-soft text-accent" : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                )}
              >
                <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>أسلوب الكتابة</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => updateSettings({ tone: tone })}
                aria-pressed={project.settings.tone === tone}
                className={cn(
                  "min-h-11 rounded-xl border-2 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  project.settings.tone === tone ? "border-accent bg-accent text-white" : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                )}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>اللغة</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => updateSettings({ language: lang })}
                aria-pressed={project.settings.language === lang}
                className={cn(
                  "min-h-11 rounded-xl border-2 py-2.5 text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  project.settings.language === lang ? "border-accent bg-accent text-white" : "border-stone-200 bg-white text-ink-muted hover:bg-stone-50"
                )}
              >
                <Languages className="w-4 h-4" />
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 3: Size & Slide Count + Generation ============

function Step3Size({ project, updateSettings, generating, genMessage, genProgress, genFailed, onGenerate, onRetry, lookupReady, isMedical }: {
  project: Project;
  updateSettings: (u: Partial<Project["settings"]>) => void;
  generating: boolean;
  genMessage: string;
  genProgress: number;
  genFailed: boolean;
  onGenerate: () => void;
  onRetry: () => void;
  lookupReady: boolean;
  isMedical: boolean;
}) {
  const router = useRouter();
  const sizeIcons: Record<CarouselSize, any> = {
    "1080x1080": Square,
    "1080x1350": RectangleVertical,
    "1080x1920": RectangleHorizontal,
  };
  const contentCount = project.settings.slideCount - 2;
  const structure = project.settings.cta === "بدون CTA"
    ? `غلاف + ${contentCount} شرائح محتوى + خاتمة`
    : `غلاف + ${contentCount} شرائح محتوى + CTA`;
  const isRecommended = project.settings.slideCount === 6 || project.settings.slideCount === 7;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-ink mb-1">اختر المقاس وعدد الشرائح</h2>
      <p className="text-ink-muted mb-6">حدد حجم الكاروسيل وعدد الشرائح المطلوبة</p>

      <div className="space-y-6">
        <div>
          <Label>المقاس</Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {SIZES.filter((s) => !isMedical || s.id === "1080x1350").map((s) => {
              const Icon = sizeIcons[s.id as CarouselSize] ?? Square;
              const active = project.settings.size === s.id;
              const ratioH = s.h / s.w;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateSettings({ size: s.id as CarouselSize })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border-2 p-4 text-center transition-all cursor-pointer",
                    active ? "border-accent bg-accent-soft" : "border-stone-200 bg-white hover:border-stone-300"
                  )}
                >
                  <div className="flex justify-center mb-3">
                    <div
                      className={cn("rounded border-2", active ? "border-accent" : "border-stone-300")}
                      style={{ width: `${50 / Math.max(ratioH, 1)}px`, height: `${50 * ratioH / Math.max(ratioH, 1) * Math.min(1, 1/ratioH) * (ratioH >= 1 ? 1 : ratioH)}px` }}
                    />
                  </div>
                  <span className={cn("text-sm font-medium block", active ? "text-accent" : "text-ink")}>{s.label}</span>
                  <span className="text-xs text-ink-subtle">{s.ratio} · {s.w}×{s.h}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>عدد الشرائح: <span className="text-accent">{project.settings.slideCount}</span></Label>
          <div className="flex items-center gap-4 mt-3">
            <Button type="button" aria-label="تقليل عدد الشرائح" variant="outline" size="icon" disabled={project.settings.slideCount <= 2} onClick={() => updateSettings({ slideCount: Math.max(2, project.settings.slideCount - 1) })}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 h-2 rounded-full bg-stone-100 relative">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((project.settings.slideCount - 2) / 8) * 100}%` }} />
            </div>
            <Button type="button" aria-label="زيادة عدد الشرائح" variant="outline" size="icon" disabled={project.settings.slideCount >= 10} onClick={() => updateSettings({ slideCount: Math.min(10, project.settings.slideCount + 1) })}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between mt-1 text-xs text-ink-subtle">
            <span>الحد الأدنى: 2</span>
            {isRecommended && <span className="text-green-600 font-medium">موصى به ✓</span>}
            <span>الحد الأقصى: 10</span>
          </div>
          <p className="text-sm text-ink-muted mt-3 text-center bg-stone-50 rounded-xl py-2.5">{structure}</p>
        </div>

        {project.slides.length === 0 && !generating && !genFailed && (
          <Button size="lg" className="w-full" onClick={onGenerate} disabled={!lookupReady}>
            <Sparkles className="w-5 h-5" /> {lookupReady ? "توليد المحتوى بالذكاء الاصطناعي" : "جارٍ تحميل القوالب..."}
          </Button>
        )}

        {generating && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <p className="font-medium text-ink">{genMessage}...</p>
            <div className="mt-4 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${genProgress}%` }} />
            </div>
          </div>
        )}

        {genFailed && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-lg font-bold text-red-700">تعذر إنشاء المحتوى</h3>
            <p className="text-sm text-red-600 mt-1 font-mono text-right" dir="rtl">{genMessage || "حدث خطأ أثناء إنشاء الشرائح."}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={onRetry}><Sparkles className="w-4 h-4" /> إعادة المحاولة</Button>
              <Button variant="outline" onClick={() => router.push("/settings")}>العودة إلى الإعدادات</Button>
            </div>
          </div>
        )}

        {project.slides.length > 0 && !generating && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
            </div>
            <div>
              <p className="font-medium text-green-800">تم إنشاء {project.slides.length} شرائح</p>
              <p className="text-sm text-green-600">انتقل للخطوة التالية لاختيار القالب</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STEP 4: Template & Brand ============

function Step4Template({ project, updateSettings, brandKit, templates, isMedical }: {
  project: Project;
  updateSettings: (u: Partial<Project["settings"]>) => void;
  brandKit: any;
  templates: typeof TEMPLATE_DEFS;
  isMedical: boolean;
}) {
  const tmpl = templates.find((t) => t.id === project.settings.templateId) ?? templates[0];
  const basePal = getPalette(project.settings.templateId, project.settings.paletteId);
  const pal = paletteWithBrandAccent(basePal, project.settings.brandKit.enabled, brandKit.primaryColor, DEFAULT_ACCENT_COLOR);
  const previewSlide = project.slides[0] ?? { id: "p", type: "cover" as SlideType, title: project.title, body: "" };
  const brandKitData = { instagramHandle: brandKit.instagramHandle, logoDataUrl: brandKit.logoUrl, primaryColor: brandKit.primaryColor, font: project.settings.bodyFont, disclaimerText: brandKit.disclaimerText };

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-ink mb-1">اختر القالب والهوية</h2>
      <p className="text-ink-muted mb-6">خصص التصميم والألوان والخطوط</p>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 order-1">
          <h3 className="text-sm font-bold text-ink mb-3">القوالب</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto thin-scrollbar pr-1">
            {templates.map((t) => {
              const p = paletteForTemplateThumbnail(t, project.settings.templateId, project.settings.paletteId);
              const active = project.settings.templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateSettings(settingsForTemplateSelection(project.settings, t))}
                  aria-pressed={active}
                  className={cn(
                    "w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                    active ? "border-accent" : "border-stone-200 hover:border-stone-300"
                  )}
                >
                  <div className="flex">
                    <ScaledSlide
                      width={80}
                      slide={previewSlide}
                      templateId={t.id}
                      palette={p}
                      font={project.settings.bodyFont}
                      titleFont={project.settings.titleFont}
                      size="1080x1080"
                      brandKitSettings={project.settings.brandKit}
                      brandKitData={brandKitData}
                      medical={{ isMedical, specialty: project.settings.specialty, source: project.settings.source }}
                      index={0}
                      total={project.slides.length || 1}
                      bodyFontSizeScale={project.settings.bodyFontSizeScale}
                      titleFontSizeScale={project.settings.titleFontSizeScale}
                      titleTextAlign={project.settings.titleTextAlign}
                      bodyTextAlign={project.settings.bodyTextAlign}
                    />
                    <div className="flex-1 flex items-center px-3 text-right">
                      <span className={cn("text-sm font-medium", active ? "text-accent" : "text-ink")}>{t.name}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 order-2 flex flex-col items-center justify-center bg-stone-50 rounded-2xl p-6 min-h-[400px] overflow-hidden">
          <ScaledSlide
            width={350}
            slide={previewSlide}
            templateId={project.settings.templateId}
            palette={pal}
            font={project.settings.bodyFont}
            titleFont={project.settings.titleFont}
            size={project.settings.size}
            brandKitSettings={project.settings.brandKit}
            brandKitData={brandKitData}
            medical={{ isMedical, specialty: project.settings.specialty, source: project.settings.source }}
            index={0}
            total={project.slides.length || 1}
            bodyFontSizeScale={project.settings.bodyFontSizeScale}
            titleFontSizeScale={project.settings.titleFontSizeScale}
            titleTextAlign={project.settings.titleTextAlign}
            bodyTextAlign={project.settings.bodyTextAlign}
          />
        </div>

        <div className="lg:col-span-3 order-3 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-ink mb-2">اللوحة اللونية</h3>
            <div className="grid grid-cols-2 gap-2">
              {tmpl.palettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateSettings({ paletteId: p.id })}
                  aria-pressed={project.settings.paletteId === p.id}
                  className={cn(
                    "rounded-xl border-2 p-2 transition-all cursor-pointer",
                    project.settings.paletteId === p.id ? "border-accent" : "border-stone-200 hover:border-stone-300"
                  )}
                >
                  <div className="flex gap-1 mb-1.5">
                    <span className="flex-1 h-5 rounded" style={{ backgroundColor: p.background }} />
                    <span className="flex-1 h-5 rounded" style={{ backgroundColor: p.accent }} />
                    <span className="flex-1 h-5 rounded" style={{ backgroundColor: p.secondary }} />
                  </div>
                  <span className="text-xs text-ink-muted">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <TypographyControls settings={project.settings} onChange={updateSettings} />

          <div>
            <h3 className="text-sm font-bold text-ink mb-2">الهوية المحفوظة</h3>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <Checkbox checked={project.settings.brandKit.enabled} onCheckedChange={(v) => updateSettings({ brandKit: { ...project.settings.brandKit, enabled: !!v } })} />
              <span className="text-sm text-ink">استخدام الهوية المحفوظة</span>
            </label>
            {project.settings.brandKit.enabled && (
              <div className="space-y-2 pl-2 border-r-2 border-stone-100 pr-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={project.settings.brandKit.showLogo} onCheckedChange={(v) => updateSettings({ brandKit: { ...project.settings.brandKit, showLogo: !!v } })} />
                  <span className="text-sm text-ink-muted">إظهار الشعار</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={project.settings.brandKit.showAccountName} onCheckedChange={(v) => updateSettings({ brandKit: { ...project.settings.brandKit, showAccountName: !!v } })} />
                  <span className="text-sm text-ink-muted">إظهار اسم الحساب</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={project.settings.brandKit.showSlideNumber} onCheckedChange={(v) => updateSettings({ brandKit: { ...project.settings.brandKit, showSlideNumber: !!v } })} />
                  <span className="text-sm text-ink-muted">إظهار رقم الشريحة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={project.settings.brandKit.showDisclaimer} onCheckedChange={(v) => updateSettings({ brandKit: { ...project.settings.brandKit, showDisclaimer: !!v } })} />
                  <span className="text-sm text-ink-muted">تنبيه استشارة الطبيب</span>
                </label>
                <div>
                  <span className="text-xs text-ink-muted block mb-1">موضعه</span>
                  <div className="grid grid-cols-2 gap-1">
                    {(["top-right", "top-left", "bottom-right", "bottom-left"] as Placement[]).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateSettings({ brandKit: { ...project.settings.brandKit, placement: pos } })}
                        aria-pressed={project.settings.brandKit.placement === pos}
                        className={cn(
                          "min-h-11 rounded-lg border px-2 py-1.5 text-xs transition-colors cursor-pointer",
                          project.settings.brandKit.placement === pos ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted hover:bg-stone-50"
                        )}
                      >
                        {({ "top-right": "أعلى اليمين", "top-left": "أعلى اليسار", "bottom-right": "أسفل اليمين", "bottom-left": "أسفل اليسار" } as Record<Placement, string>)[pos]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 5: Review ============

function Step5Review({ project, update, setProject, dbProjectId, onRefresh }: {
  project: Project;
  update: (u: Partial<Project>) => void;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  dbProjectId: string | null;
  onRefresh: (id: string) => Promise<Project | null>;
}) {
  const { toast } = useToast();
  const slides = project.slides;

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    update({ slides: slides.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };

  const handleAddSlide = async () => {
    if (!dbProjectId) return;
    if (slides.length >= 10) {
      toast({ type: "error", title: "وصلت للحد الأقصى" });
      return;
    }
    const result = await addSlideAction(dbProjectId, slides.length, project.title, project.settings.contentType);
    if (result.success) {
      const refreshed = await onRefresh(dbProjectId);
      if (refreshed) setProject(refreshed);
      toast({ type: "success", title: "تمت إضافة شريحة" });
    } else {
      toast({ type: "error", title: result.error ?? "تعذر إضافة الشريحة" });
    }
  };

  const handleDuplicateSlide = async (id: string) => {
    if (!dbProjectId) return;
    if (slides.length >= 10) {
      toast({ type: "error", title: "وصلت للحد الأقصى" });
      return;
    }
    const result = await duplicateSlideAction(id);
    if (result.success) {
      const refreshed = await onRefresh(dbProjectId);
      if (refreshed) setProject(refreshed);
      toast({ type: "success", title: "تم تكرار الشريحة" });
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!dbProjectId) return;
    const slide = slides.find((s) => s.id === id);
    if (slide?.type === "cover" || slide?.type === "ending") {
      toast({ type: "error", title: "لا يمكن حذف هذه الشريحة" });
      return;
    }
    if (slides.length <= 2) {
      toast({ type: "error", title: "الحد الأدنى شريحتان" });
      return;
    }
    const result = await deleteSlideAction(id);
    if (result.success) {
      const refreshed = await onRefresh(dbProjectId);
      if (refreshed) setProject(refreshed);
      toast({ type: "success", title: "تم حذف الشريحة" });
    } else {
      toast({ type: "error", title: result.error ?? "تعذر الحذف" });
    }
  };

  const moveSlide = async (id: string, dir: "up" | "down") => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= slides.length) return;
    if (slides[idx].type === "cover" || slides[target].type === "cover") return;
    if (slides[idx].type === "ending" || slides[target].type === "ending") return;
    // Optimistic local update
    const next = [...slides];
    [next[idx], next[target]] = [next[target], next[idx]];
    update({ slides: next });
    // Persist reorder
    if (dbProjectId) {
      await reorderSlidesAction(dbProjectId, next.map((s) => s.id));
    }
  };

  const copyAll = () => {
    const text = slides.map((s) => `${s.title}\n${s.body}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast({ type: "success", title: "تم نسخ المحتوى كاملًا" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">مراجعة وتعديل الشرائح</h2>
          <p className="text-ink-muted">عدّل النصوص قبل اختيار القالب</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyAll}><Copy className="w-4 h-4" /> نسخ الكل</Button>
      </div>

      {project.reviewStatus === "blocked" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-4 flex items-start gap-3">
          <ShieldQuestion className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">المراجعة الطبية: ممنوع</p>
            <p className="text-sm text-red-600">قد يحتوي المحتوى على معلومات غير آمنة. راجع الشرائح بعناية قبل النشر.</p>
          </div>
        </div>
      )}
      {project.reviewStatus === "needs_review" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-4 flex items-start gap-3">
          <ShieldQuestion className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">المراجعة الطبية: يحتاج مراجعة</p>
            <p className="text-sm text-amber-600">بعض الادعاءات قد تحتاج تعديلًا. راجع الشرائح قبل النشر.</p>
          </div>
        </div>
      )}
      {project.reviewStatus === "pass" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 mb-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <p className="font-medium text-green-800">المراجعة الطبية: مقبول ✓</p>
        </div>
      )}

      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={slide.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <GripVertical className="w-5 h-5 text-stone-300 shrink-0" />
              <Badge className={cn(
                slide.type === "cover" ? "bg-accent-soft text-accent" : slide.type === "ending" ? "bg-green-100 text-green-700" : "bg-stone-100 text-ink-muted"
              )}>
                {slide.type === "cover" ? "غلاف" : slide.type === "ending" ? "خاتمة / CTA" : `شريحة ${i}`}
              </Badge>
              <span className="text-xs text-ink-subtle">{i + 1} / {slides.length}</span>
              <div className="flex-1" />
              {slide.type !== "cover" && slide.type !== "ending" && (
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="نقل الشريحة إلى السابق" onClick={() => moveSlide(slide.id, "up")} disabled={i === 1} className="flex min-h-11 min-w-11 items-center justify-center text-ink-subtle hover:text-ink disabled:opacity-30 cursor-pointer"><ArrowRight className="w-4 h-4" /></button>
                  <button type="button" aria-label="نقل الشريحة إلى التالي" onClick={() => moveSlide(slide.id, "down")} disabled={i === slides.length - 2} className="flex min-h-11 min-w-11 items-center justify-center text-ink-subtle hover:text-ink disabled:opacity-30 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
                  <button type="button" aria-label="تكرار الشريحة" onClick={() => handleDuplicateSlide(slide.id)} className="flex min-h-11 min-w-11 items-center justify-center text-ink-subtle hover:text-ink cursor-pointer"><Copy className="w-4 h-4" /></button>
                  <button type="button" aria-label="حذف الشريحة" onClick={() => handleDeleteSlide(slide.id)} className="flex min-h-11 min-w-11 items-center justify-center text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Input value={slide.title} onChange={(e) => updateSlide(slide.id, { title: e.target.value })} placeholder="عنوان الشريحة" />
              <Textarea value={slide.body} onChange={(e) => updateSlide(slide.id, { body: e.target.value })} placeholder="نص الشريحة" rows={2} />
              {slide.type === "ending" && slide.ctaText && (
                <Input value={slide.ctaText} onChange={(e) => updateSlide(slide.id, { ctaText: e.target.value })} placeholder="نص CTA" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={handleAddSlide} disabled={slides.length >= 10 || !dbProjectId}>
          <Sparkles className="w-4 h-4" /> إضافة شريحة بالذكاء الاصطناعي
        </Button>
      </div>
    </div>
  );
}

// ============ STEP 6: Export Link ============

function Step6Export({ project, brandKit, templates, isMedical }: { project: Project; brandKit: any; templates: typeof TEMPLATE_DEFS; isMedical: boolean }) {
  const basePal = getPalette(project.settings.templateId, project.settings.paletteId);
  const pal = paletteWithBrandAccent(basePal, project.settings.brandKit.enabled, brandKit.primaryColor, DEFAULT_ACCENT_COLOR);
  const brandKitData = { instagramHandle: brandKit.instagramHandle, logoDataUrl: brandKit.logoUrl, primaryColor: brandKit.primaryColor, font: project.settings.bodyFont, disclaimerText: brandKit.disclaimerText };
  const coverSlide = project.slides[0];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-extrabold text-ink mb-1">جاهز للتصدير</h2>
      <p className="text-ink-muted mb-6">راجع الإعدادات النهائية</p>

      <div className="flex justify-center mb-6">
        {coverSlide && (
          <ScaledSlide
            width={250}
            slide={coverSlide}
            templateId={project.settings.templateId}
            palette={pal}
            font={project.settings.bodyFont}
            titleFont={project.settings.titleFont}
            size={project.settings.size}
            brandKitSettings={project.settings.brandKit}
            brandKitData={brandKitData}
            medical={{ isMedical, specialty: project.settings.specialty, source: project.settings.source }}
            index={0}
            total={project.slides.length}
            bodyFontSizeScale={project.settings.bodyFontSizeScale}
            titleFontSizeScale={project.settings.titleFontSizeScale}
            titleTextAlign={project.settings.titleTextAlign}
            bodyTextAlign={project.settings.bodyTextAlign}
          />
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft text-right space-y-3">
        <div className="flex justify-between"><span className="text-ink-muted">اسم المشروع</span><span className="font-medium text-ink">{project.title}</span></div>
        <div className="flex justify-between"><span className="text-ink-muted">عدد الشرائح</span><span className="font-medium text-ink">{project.slides.length}</span></div>
        <div className="flex justify-between"><span className="text-ink-muted">المقاس</span><span className="font-medium text-ink">{({ "1080x1080": "1080×1080", "1080x1350": "1080×1350", "1080x1920": "1080×1920" } as Record<string, string>)[project.settings.size]}</span></div>
        <div className="flex justify-between"><span className="text-ink-muted">القالب</span><span className="font-medium text-ink">{templates.find((t) => t.id === project.settings.templateId)?.name}</span></div>
        <div className="flex justify-between"><span className="text-ink-muted">خط العنوان</span><span className="font-medium text-ink">{ALL_FONTS.find((f) => f.id === project.settings.titleFont)?.name}</span></div>
        <div className="flex justify-between"><span className="text-ink-muted">خط الوصف</span><span className="font-medium text-ink">{ALL_FONTS.find((f) => f.id === project.settings.bodyFont)?.name}</span></div>
      </div>

      <p className="text-sm text-ink-muted mt-4">سيتم حفظ المشروع ونقلك لصفحة التصدير</p>
    </div>
  );
}

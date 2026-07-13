"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Loader2, Check, Copy, ArrowRight, ArrowLeft, Hash, FileText,
  CheckCircle2, Package, Image as ImageIcon, Pencil, Sparkles, Send,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScaledSlide, SlideRenderer, DisclaimerFooter } from "@/components/carousel/slide-renderer";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/toast";
import { TEMPLATE_DEFS, getPalette, SIZES } from "@/lib/templates";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import { exportSlideToPng, downloadDataUrl, exportAllToZip, slidesToBlobs, waitForFonts } from "@/lib/export";
import { mapProject } from "@/lib/db-mappers";
import { updateProjectAction, recordExportAction } from "@/app/actions/projects";
import { sendToTelegramAction } from "@/app/actions/telegram";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, brandKit, telegramEnabled, preferences } = useApp();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [sendingTg, setSendingTg] = useState(false);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadProject = useCallback(async () => {
    const { data: row } = await supabase
      .from("projects")
      .select("*, template:templates(slug), palette:template_palettes(sort_order)")
      .eq("id", projectId)
      .single();
    if (!row) { router.replace("/projects"); return; }
    const { data: slideRows } = await supabase
      .from("slides")
      .select("*")
      .eq("project_id", projectId)
      .order("position");
    setProject(mapProject(row, slideRows ?? []));
  }, [supabase, projectId, router]);

  useEffect(() => {
    loadProject();
    waitForFonts().then(() => setFontsReady(true));
  }, [loadProject]);

  const saveCaptionHashtags = async () => {
    if (!project) return;
    await updateProjectAction({
      id: project.id,
      caption: project.caption,
      hashtags: project.hashtags.join(" "),
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <AppNavbar />
        <main id="main-content" className="flex items-center justify-center h-[60vh]" aria-label="جارٍ تحميل صفحة التصدير">
          <h1 className="sr-only">تصدير مشروع كاروسيل</h1>
          <div className="w-8 h-8 border-[3px] border-stone-200 border-t-accent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const basePal = getPalette(project.settings.templateId, project.settings.paletteId);
  const pal = brandKit.primaryColor && brandKit.primaryColor !== DEFAULT_ACCENT_COLOR ? { ...basePal, accent: brandKit.primaryColor } : basePal;
  const brandKitData = { instagramHandle: brandKit.instagramHandle, logoDataUrl: brandKit.logoUrl, primaryColor: brandKit.primaryColor, font: project.settings.bodyFont, disclaimerText: brandKit.disclaimerText };
  const tmpl = TEMPLATE_DEFS.find((t) => t.id === project.settings.templateId);
  const sizeLabel = { "1080x1080": "1080×1080", "1080x1350": "1080×1350", "1080x1920": "1080×1920" }[project.settings.size];
  const exportBlocked = project.reviewStatus === "blocked";

  const handleExportOne = async (idx: number) => {
    if (exportBlocked) {
      toast({ type: "error", title: "المحتوى الطبي يحتاج مراجعة قبل التصدير" });
      return;
    }
    if (!exportRefs.current[idx]) return;
    setExportingIdx(idx);
    try {
      const dataUrl = await exportSlideToPng(exportRefs.current[idx]!, project.settings.size);
      await downloadDataUrl(dataUrl, `slide-${String(idx + 1).padStart(2, "0")}.png`);
      toast({ type: "success", title: "تم تنزيل الشريحة", description: `slide-${String(idx + 1).padStart(2, "0")}.png` });
    } catch {
      toast({ type: "error", title: "فشل التصدير", description: "حاول مرة أخرى" });
    }
    setExportingIdx(null);
  };

  const handleExportAll = async () => {
    if (exportBlocked) {
      toast({ type: "error", title: "المحتوى الطبي يحتاج مراجعة قبل التصدير" });
      return;
    }
    const validRefs = exportRefs.current.filter((r): r is HTMLDivElement => !!r);
    if (validRefs.length === 0) return;
    setExporting(true);
    try {
      await exportAllToZip(validRefs, project.settings.size);
      await recordExportAction(project.id, "zip");
      setShowSuccess(true);
      toast({ type: "success", title: "تم تنزيل الملف", description: "typo-carousel.zip" });
    } catch {
      toast({ type: "error", title: "فشل التصدير", description: "حاول مرة أخرى" });
    }
    setExporting(false);
  };

  const handleSendTelegram = async () => {
    if (exportBlocked) {
      toast({ type: "error", title: "المحتوى الطبي يحتاج مراجعة قبل الإرسال" });
      return;
    }
    const validRefs = exportRefs.current.filter((r): r is HTMLDivElement => !!r);
    if (validRefs.length === 0) return;
    setSendingTg(true);
    try {
      const blobs = await slidesToBlobs(validRefs, project.settings.size);
      const formData = new FormData();
      blobs.forEach((blob, i) => {
        formData.append(`slide-${i}`, blob, `slide-${String(i + 1).padStart(2, "0")}.png`);
      });
      const result = await sendToTelegramAction(project.id, formData);
      if (result.success) {
        setShowSuccess(true);
        toast({ type: "success", title: "تم الإرسال إلى تلغرام" });
      } else {
        toast({ type: "error", title: result.error ?? "فشل الإرسال" });
      }
    } catch {
      toast({ type: "error", title: "فشل الإرسال", description: "حاول مرة أخرى" });
    }
    setSendingTg(false);
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(project.caption);
    toast({ type: "success", title: "تم نسخ الوصف" });
  };
  const copyHashtags = () => {
    navigator.clipboard.writeText(project.hashtags.join(" "));
    toast({ type: "success", title: "تم نسخ الهاشتاغات" });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />

      <div style={{ position: "fixed", left: "-99999px", top: 0, width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        {project.slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => { exportRefs.current[i] = el; }}
            style={{ width: "1080px", height: `${SIZES.find((s) => s.id === project.settings.size)?.h ?? 1080}px`, position: "relative" }}
          >
            <SlideRenderer
              slide={slide}
              templateId={project.settings.templateId}
              palette={pal}
              font={project.settings.bodyFont}
              titleFont={project.settings.titleFont}
              size={project.settings.size}
              brandKitSettings={project.settings.brandKit}
              brandKitData={brandKitData}
              medical={{ isMedical: preferences.contentMode === "medical", specialty: project.settings.specialty, source: project.settings.source }}
              index={i}
              total={project.slides.length}
              bodyFontSizeScale={project.settings.bodyFontSizeScale}
              titleFontSizeScale={project.settings.titleFontSizeScale}
              titleTextAlign={project.settings.titleTextAlign}
              bodyTextAlign={project.settings.bodyTextAlign}
            />
            {preferences.contentMode === "medical" && project.settings.brandKit.showDisclaimer && (
              <DisclaimerFooter
                variant="overlay"
                text={brandKitData.disclaimerText || ""}
                palette={pal}
                font={project.settings.bodyFont}
              />
            )}
          </div>
        ))}
      </div>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              onClick={() => setShowSuccess(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl bg-white p-8 max-w-md w-full text-center shadow-lift"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-ink">تم تجهيز مشروعك</h2>
                <p className="mt-2 text-ink-muted">أصبحت الشرائح جاهزة للنشر على Instagram.</p>
                <div className="flex gap-3 mt-6">
                  <Button className="flex-1" onClick={() => router.push("/projects")}>العودة إلى المشاريع</Button>
                  <Button variant="outline" onClick={() => setShowSuccess(false)}>متابعة</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">تصدير المشروع</h1>
          <p className="mt-1 text-ink-muted">نزّل الشرائح وانسخ الوصف والهاشتاغات</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-ink-subtle block">اسم المشروع</span>
              <span className="font-bold text-ink mt-0.5 block">{project.title}</span>
            </div>
            <div>
              <span className="text-xs text-ink-subtle block">عدد الشرائح</span>
              <span className="font-bold text-ink mt-0.5 block">{project.slides.length} شريحة</span>
            </div>
            <div>
              <span className="text-xs text-ink-subtle block">المقاس</span>
              <span className="font-bold text-ink mt-0.5 block">{sizeLabel}</span>
            </div>
            <div>
              <span className="text-xs text-ink-subtle block">القالب</span>
              <span className="font-bold text-ink mt-0.5 block">{tmpl?.name}</span>
            </div>
          </div>
        </div>

        {exportBlocked && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">
            هذا المحتوى الطبي محظور من التصدير حتى تتم مراجعته وتعديله.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
          {project.slides.map((slide, i) => (
            <div key={slide.id} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-soft">
              <ScaledSlide
                width={280}
                slide={slide}
                templateId={project.settings.templateId}
                palette={pal}
                font={project.settings.bodyFont}
                titleFont={project.settings.titleFont}
                size={project.settings.size}
                brandKitSettings={project.settings.brandKit}
                brandKitData={brandKitData}
                medical={{ isMedical: preferences.contentMode === "medical", specialty: project.settings.specialty, source: project.settings.source }}
                index={i}
                total={project.slides.length}
                bodyFontSizeScale={project.settings.bodyFontSizeScale}
                titleFontSizeScale={project.settings.titleFontSizeScale}
                titleTextAlign={project.settings.titleTextAlign}
                bodyTextAlign={project.settings.bodyTextAlign}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-muted">{i + 1} / {project.slides.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportOne(i)}
                  disabled={exportBlocked || exportingIdx === i || !fontsReady}
                >
                  {exportingIdx === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  تنزيل PNG
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> وصف المنشور</h2>
              <Button variant="ghost" size="sm" onClick={copyCaption}><Copy className="w-3.5 h-3.5" /> نسخ</Button>
            </div>
            <Textarea
              value={project.caption}
              onChange={(e) => setProject((prev) => prev ? { ...prev, caption: e.target.value } : prev)}
              onBlur={saveCaptionHashtags}
              rows={5}
              placeholder="وصف المنشور..."
            />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink flex items-center gap-2"><Hash className="w-4 h-4 text-accent" /> الهاشتاغات</h2>
              <Button variant="ghost" size="sm" onClick={copyHashtags}><Copy className="w-3.5 h-3.5" /> نسخ</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.hashtags.map((tag, i) => (
                <Badge key={i} className="bg-accent-soft text-accent text-sm py-1.5 px-3">{tag}</Badge>
              ))}
            </div>
            <Textarea
              value={project.hashtags.join(" ")}
              onChange={(e) => setProject((prev) => prev ? { ...prev, hashtags: e.target.value.split(/\s+/).filter(Boolean) } : prev)}
              onBlur={saveCaptionHashtags}
              rows={3}
              className="mt-3"
              placeholder="الهاشتاغات..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={handleExportAll} disabled={exportBlocked || exporting || !fontsReady}>
            {exporting ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ التصدير...</> : <><Package className="w-5 h-5" /> تنزيل جميع الشرائح ZIP</>}
          </Button>
          {telegramEnabled && (
            <Button size="lg" variant="outline" onClick={handleSendTelegram} disabled={exportBlocked || sendingTg || !fontsReady}>
              {sendingTg ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الإرسال...</> : <><Send className="w-5 h-5" /> إرسال إلى تلغرام</>}
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => router.push(`/projects/${project.id}/edit`)}>
            <Pencil className="w-4 h-4" /> العودة إلى التعديل
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/projects")}>
            <ArrowRight className="w-4 h-4" /> العودة إلى المشاريع
          </Button>
        </div>

        {!fontsReady && (
          <p className="mt-4 text-sm text-ink-subtle flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            جارٍ تحميل الخطوط...
          </p>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus, Copy, Trash2, ChevronRight, ChevronLeft, Download, Save, GripVertical,
  Palette, Settings as SettingsIcon, Eye, EyeOff, X, Check, Sparkles, Layers,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/toast";
import { TEMPLATE_DEFS, getPalette, ALL_FONTS } from "@/lib/templates";
import {
  mapProject, useTemplateLookup, projectToUpdateInput, FONT_FE_TO_DB,
} from "@/lib/db-mappers";
import { cn } from "@/lib/utils";
import type { Slide, FontFamily, Placement, Project } from "@/lib/types";
import {
  updateProjectAction, updateSlideAction, addSlideAction,
  duplicateSlideAction, deleteSlideAction, reorderSlidesAction,
} from "@/app/actions/projects";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, brandKit } = useApp();
  const lookup = useTemplateLookup(supabase);
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [templateDialog, setTemplateDialog] = useState(false);
  const [brandDialog, setBrandDialog] = useState(false);

  const fetchProject = useCallback(async () => {
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
    const mapped = mapProject(row, slideRows ?? []);
    setProject(mapped);
  }, [supabase, projectId, router]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Auto-save (debounced) — project settings + all slides
  useEffect(() => {
    if (!project) return;
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      const input = projectToUpdateInput(project, lookup);
      if (input) await updateProjectAction(input);
      for (const slide of project.slides) {
        await updateSlideAction({ id: slide.id, title: slide.title, body: slide.body, cta_text: slide.ctaText ?? null });
      }
      setSaveStatus("saved");
    }, 800);
    return () => clearTimeout(timer);
  }, [project, lookup]); // eslint-disable-line

  const update = useCallback((updates: Partial<Project>) => {
    setProject((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setProject((prev) => prev ? { ...prev, slides: prev.slides.map((s) => s.id === id ? { ...s, ...updates } : s) } : prev);
  };

  const handleDuplicateSlide = async (id: string) => {
    if (project && project.slides.length >= 10) { toast({ type: "error", title: "وصلت للحد الأقصى" }); return; }
    const result = await duplicateSlideAction(id);
    if (result.success) { await fetchProject(); toast({ type: "success", title: "تم تكرار الشريحة" }); }
    else toast({ type: "error", title: result.error ?? "تعذر التكرار" });
  };

  const handleDeleteSlide = async (id: string) => {
    if (!project) return;
    if (project.slides.length <= 2) { toast({ type: "error", title: "لا يمكن حذف الشريحة", description: "الحد الأدنى شريحتان" }); return; }
    const slide = project.slides.find((s) => s.id === id);
    if (slide?.type === "cover" || slide?.type === "ending") { toast({ type: "error", title: "لا يمكن حذف هذه الشريحة" }); return; }
    const result = await deleteSlideAction(id);
    if (result.success) {
      if (currentSlideIdx > 0) setCurrentSlideIdx(currentSlideIdx - 1);
      await fetchProject();
      toast({ type: "success", title: "تم حذف الشريحة" });
    } else toast({ type: "error", title: result.error ?? "تعذر الحذف" });
  };

  const handleAddSlide = async () => {
    if (!project) return;
    if (project.slides.length >= 10) { toast({ type: "error", title: "وصلت للحد الأقصى" }); return; }
    const result = await addSlideAction(project.id, project.slides.length, project.title, project.settings.contentType);
    if (result.success) { await fetchProject(); toast({ type: "success", title: "تمت إضافة شريحة" }); }
    else toast({ type: "error", title: result.error ?? "تعذر الإضافة" });
  };

  const handleMoveSlide = async (id: string, dir: "up" | "down") => {
    if (!project) return;
    const idx = project.slides.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= project.slides.length) return;
    const slide = project.slides[idx];
    const targetSlide = project.slides[target];
    if (slide.type === "cover" || targetSlide.type === "cover") return;
    if (slide.type === "ending" || targetSlide.type === "ending") return;
    // Optimistic reorder
    const slides = [...project.slides];
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    setProject({ ...project, slides });
    await reorderSlidesAction(project.id, slides.map((s) => s.id));
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <AppNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-[3px] border-stone-200 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentSlide = project.slides[currentSlideIdx];
  const pal = getPalette(project.settings.templateId, project.settings.paletteId);
  const brandKitData = { instagramHandle: brandKit.instagramHandle, logoDataUrl: brandKit.logoUrl, primaryColor: brandKit.primaryColor, font: project.settings.font };
  const tmpl = TEMPLATE_DEFS.find((t) => t.id === project.settings.templateId);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <input
              value={project.title}
              onChange={(e) => update({ title: e.target.value })}
              className="text-lg font-bold text-ink bg-transparent border-none outline-none focus:bg-white focus:border focus:border-stone-200 focus:px-2 focus:py-1 focus:rounded-lg transition-all"
            />
            <span className="text-xs text-ink-subtle flex items-center gap-1">
              {saveStatus === "saving" ? "جارٍ الحفظ..." : saveStatus === "saved" ? <><Check className="w-3 h-3 text-green-600" /> تم الحفظ الآن</> : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTemplateDialog(true)}><Palette className="w-4 h-4" /> تغيير القالب</Button>
            <Button variant="ghost" size="sm" onClick={() => setBrandDialog(true)}><SettingsIcon className="w-4 h-4" /> إعدادات الهوية</Button>
            <Button size="sm" onClick={() => router.push(`/projects/${project.id}/export`)}><Download className="w-4 h-4" /> تصدير</Button>
          </div>
        </div>

        <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {project.slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIdx(i)}
              className={cn("shrink-0 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer", currentSlideIdx === i ? "border-accent" : "border-stone-200")}
            >
              <ScaledSlide
                width={60}
                slide={slide}
                templateId={project.settings.templateId}
                palette={pal}
                font={project.settings.font}
                size={project.settings.size}
                brandKitSettings={project.settings.brandKit}
                brandKitData={brandKitData}
                index={i}
                total={project.slides.length}
              />
            </button>
          ))}
          <button onClick={handleAddSlide} className="shrink-0 w-[60px] h-[60px] rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-accent">
            <Plus className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          <div className="hidden lg:block lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-3 max-h-[600px] overflow-y-auto thin-scrollbar">
              <div className="space-y-2">
                {project.slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={cn(
                      "rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                      currentSlideIdx === i ? "border-accent" : "border-stone-200 hover:border-stone-300"
                    )}
                    onClick={() => setCurrentSlideIdx(i)}
                  >
                    <div className="relative">
                      <ScaledSlide
                        width={120}
                        slide={slide}
                        templateId={project.settings.templateId}
                        palette={pal}
                        font={project.settings.font}
                        size={project.settings.size}
                        brandKitSettings={project.settings.brandKit}
                        brandKitData={brandKitData}
                        index={i}
                        total={project.slides.length}
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5">{i + 1}</span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-ink-muted">{slide.type === "cover" ? "غلاف" : slide.type === "ending" ? "خاتمة" : "محتوى"}</span>
                      {slide.type !== "cover" && slide.type !== "ending" && (
                        <div className="flex gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSlide(slide.id, "up"); }} disabled={i === 1} className="p-0.5 text-stone-400 hover:text-ink disabled:opacity-30 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSlide(slide.id, "down"); }} disabled={i === project.slides.length - 2} className="p-0.5 text-stone-400 hover:text-ink disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(slide.id); }} className="p-0.5 text-stone-400 hover:text-ink cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSlide(slide.id); }} className="p-0.5 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={handleAddSlide} disabled={project.slides.length >= 10} className="w-full rounded-xl border-2 border-dashed border-stone-300 p-4 flex items-center justify-center gap-2 text-ink-muted hover:border-accent hover:text-accent cursor-pointer disabled:opacity-50">
                  <Plus className="w-4 h-4" /> <span className="text-sm">إضافة شريحة</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col items-center justify-center min-h-[500px]">
              {currentSlide && (
                <div className="flex flex-col items-center">
                  <ScaledSlide
                    width={350}
                    slide={currentSlide}
                    templateId={project.settings.templateId}
                    palette={pal}
                    font={project.settings.font}
                    size={project.settings.size}
                    brandKitSettings={project.settings.brandKit}
                    brandKitData={brandKitData}
                    index={currentSlideIdx}
                    total={project.slides.length}
                  />
                  <div className="flex items-center gap-4 mt-4">
                    <Button variant="outline" size="icon" disabled={currentSlideIdx === 0} onClick={() => setCurrentSlideIdx(currentSlideIdx - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-ink-muted">{currentSlideIdx + 1} / {project.slides.length}</span>
                    <Button variant="outline" size="icon" disabled={currentSlideIdx === project.slides.length - 1} onClick={() => setCurrentSlideIdx(currentSlideIdx + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
              <h3 className="font-bold text-ink flex items-center gap-2"><Layers className="w-4 h-4" /> تعديل الشريحة</h3>
              {currentSlide && (
                <>
                  <Badge className={cn(
                    currentSlide.type === "cover" ? "bg-accent-soft text-accent" : currentSlide.type === "ending" ? "bg-green-100 text-green-700" : "bg-stone-100 text-ink-muted"
                  )}>
                    {currentSlide.type === "cover" ? "غلاف" : currentSlide.type === "ending" ? "خاتمة / CTA" : `شريحة ${currentSlideIdx}`}
                  </Badge>
                  <div>
                    <Label htmlFor="slide-title">عنوان الشريحة</Label>
                    <Input id="slide-title" value={currentSlide.title} onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="slide-body">النص</Label>
                    <Textarea id="slide-body" value={currentSlide.body} onChange={(e) => updateSlide(currentSlide.id, { body: e.target.value })} rows={4} />
                  </div>
                  {currentSlide.type === "ending" && currentSlide.ctaText && (
                    <div>
                      <Label htmlFor="slide-cta">نص CTA</Label>
                      <Input id="slide-cta" value={currentSlide.ctaText} onChange={(e) => updateSlide(currentSlide.id, { ctaText: e.target.value })} />
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-stone-100 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleAddSlide} disabled={project.slides.length >= 10}>
                  <Sparkles className="w-4 h-4" /> إضافة شريحة بالذكاء الاصطناعي
                </Button>
                {currentSlide && currentSlide.type !== "cover" && currentSlide.type !== "ending" && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleDuplicateSlide(currentSlide.id)}>
                      <Copy className="w-4 h-4" /> تكرار الشريحة
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => handleDeleteSlide(currentSlide.id)}>
                      <Trash2 className="w-4 h-4" /> حذف الشريحة
                    </Button>
                  </>
                )}
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  const text = project.slides.map((s) => `${s.title}\n${s.body}`).join("\n\n---\n\n");
                  navigator.clipboard.writeText(text);
                  toast({ type: "success", title: "تم نسخ النص كاملًا" });
                }}>
                  <Copy className="w-4 h-4" /> نسخ النص كاملًا
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <Button className="w-full shadow-lift" size="lg" onClick={() => router.push(`/projects/${project.id}/export`)}>
            <Download className="w-5 h-5" /> تصدير
          </Button>
        </div>
      </div>

      <TemplateDialog open={templateDialog} onClose={() => setTemplateDialog(false)} project={project} update={update} brandKitData={brandKitData} />
      <BrandDialog open={brandDialog} onClose={() => setBrandDialog(false)} project={project} update={update} />
    </div>
  );
}

// ============= Template Dialog =============

function TemplateDialog({ open, onClose, project, update, brandKitData }: {
  open: boolean;
  onClose: () => void;
  project: Project;
  update: (u: Partial<Project>) => void;
  brandKitData: any;
}) {
  const previewSlide = project.slides[0];

  return (
    <Dialog open={open} onClose={onClose} title="تغيير القالب" description="اختر قالبًا جديدًا. لن يتأثر المحتوى.">
      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto thin-scrollbar">
        {TEMPLATE_DEFS.map((t) => {
          const p = getPalette(t.id, project.settings.paletteId);
          const active = project.settings.templateId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { update({ settings: { ...project.settings, templateId: t.id } }); onClose(); }}
              className={cn("rounded-xl overflow-hidden border-2 transition-all cursor-pointer", active ? "border-accent" : "border-stone-200 hover:border-stone-300")}
            >
              {previewSlide && (
                <ScaledSlide
                  width={100}
                  slide={previewSlide}
                  templateId={t.id}
                  palette={p}
                  font={project.settings.font}
                  size="1080x1080"
                  brandKitSettings={project.settings.brandKit}
                  brandKitData={brandKitData}
                  index={0}
                  total={project.slides.length}
                />
              )}
              <div className="px-2 py-1 text-center">
                <span className={cn("text-xs font-medium", active ? "text-accent" : "text-ink")}>{t.name}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <Label>اللوحة اللونية</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {(TEMPLATE_DEFS.find((t) => t.id === project.settings.templateId) ?? TEMPLATE_DEFS[0]).palettes.map((p) => (
            <button
              key={p.id}
              onClick={() => update({ settings: { ...project.settings, paletteId: p.id } })}
              className={cn("rounded-xl border-2 p-2 cursor-pointer transition-colors", project.settings.paletteId === p.id ? "border-accent" : "border-stone-200 hover:border-stone-300")}
            >
              <div className="flex gap-1 mb-1">
                <span className="flex-1 h-4 rounded" style={{ backgroundColor: p.background }} />
                <span className="flex-1 h-4 rounded" style={{ backgroundColor: p.accent }} />
                <span className="flex-1 h-4 rounded" style={{ backgroundColor: p.secondary }} />
              </div>
              <span className="text-xs text-ink-muted">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Label>الخط</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {ALL_FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => update({ settings: { ...project.settings, font: f.id as FontFamily } })}
              className={cn("rounded-xl border-2 py-2 text-sm font-medium cursor-pointer transition-colors", project.settings.font === f.id ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink hover:bg-stone-50")}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

// ============= Brand Dialog =============

function BrandDialog({ open, onClose, project, update }: {
  open: boolean;
  onClose: () => void;
  project: Project;
  update: (u: Partial<Project>) => void;
}) {
  const bk = project.settings.brandKit;
  const setBk = (updates: Partial<typeof bk>) => update({ settings: { ...project.settings, brandKit: { ...bk, ...updates } } });

  return (
    <Dialog open={open} onClose={onClose} title="إعدادات الهوية" description="خصّص الهوية البصرية لهذا المشروع">
      <div className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={bk.enabled} onCheckedChange={(v) => setBk({ enabled: !!v })} />
          <span className="text-sm text-ink">استخدام الهوية المحفوظة</span>
        </label>
        {bk.enabled && (
          <div className="space-y-3 pl-2 border-r-2 border-stone-100 pr-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={bk.showLogo} onCheckedChange={(v) => setBk({ showLogo: !!v })} />
              <span className="text-sm text-ink-muted">إظهار الشعار</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={bk.showAccountName} onCheckedChange={(v) => setBk({ showAccountName: !!v })} />
              <span className="text-sm text-ink-muted">إظهار اسم الحساب</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={bk.showSlideNumber} onCheckedChange={(v) => setBk({ showSlideNumber: !!v })} />
              <span className="text-sm text-ink-muted">إظهار رقم الشريحة</span>
            </label>
            <div>
              <Label>الموضع</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(["top-right", "top-left", "bottom-right", "bottom-left"] as Placement[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setBk({ placement: pos })}
                    className={cn("rounded-lg border-2 px-2 py-1.5 text-xs cursor-pointer transition-colors", bk.placement === pos ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted hover:bg-stone-50")}
                  >
                    {({ "top-right": "أعلى اليمين", "top-left": "أعلى اليسار", "bottom-right": "أسفل اليمين", "bottom-left": "أسفل اليسار" } as Record<Placement, string>)[pos]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <Button className="w-full" onClick={onClose}>تم</Button>
      </div>
    </Dialog>
  );
}

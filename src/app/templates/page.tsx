"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Eye, Check } from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { TEMPLATE_DEFS, getPalette, SIZES, ALL_FONTS, VISIBLE_TEMPLATES } from "@/lib/templates";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { useApp } from "@/lib/app-context";
import { toggleTemplateFavoriteAction } from "@/app/actions/projects";
import { cn } from "@/lib/utils";
import type { Slide, BrandKit, BrandKitSettings, CarouselSize } from "@/lib/types";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";

const demoBrandKit: BrandKit = { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: DEFAULT_ACCENT_COLOR, font: "tajawal" };
const demoBkSettings: BrandKitSettings = { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: true, placement: "bottom-left" };
const demoSlide: Slide = { id: "d", type: "cover", title: "كيف تطور حضورك الرقمي؟", body: "دليل مبسّط لصناعة محتوى أفضل" };
const demoContent: Slide = { id: "d2", type: "content", title: "ابدأ بفكرة واضحة", body: "حدد ما يريد جمهورك معرفته قبل كتابة المحتوى" };
const demoEnding: Slide = { id: "d3", type: "ending", title: "شارك الفكرة", body: "حوّل معرفتك إلى محتوى مفيد", ctaText: "احفظ المنشور" };

export default function TemplatesPage() {
  const router = useRouter();
  const { supabase, ready } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<CarouselSize>("1080x1080");
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(async () => {
    const { data } = await supabase.from("favorite_templates").select("template_id");
    if (data) setFavorites(data.map((r: any) => r.template_id));
  }, [supabase]);

  useEffect(() => {
    if (ready) loadFavorites();
  }, [ready, loadFavorites]);

  const tmpl = preview ? VISIBLE_TEMPLATES.find((t) => t.id === preview) : null;

  const handleToggleFavorite = async (templateId: string) => {
    setFavorites((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
    await toggleTemplateFavoriteAction(templateId);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">القوالب</h1>
          <p className="mt-2 text-ink-muted">اختر قالبًا لبدء مشروعك أو استعرض التصاميم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VISIBLE_TEMPLATES.map((t, i) => {
            const pal = getPalette(t.id, ["p1", "p2", "p3", "p4"][i % 4]);
            const isFav = favorites.includes(t.id);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-soft"
              >
                <div className="p-4 bg-stone-50/50">
                  <ScaledSlide
                    width={300}
                    slide={demoSlide}
                    templateId={t.id}
                    palette={pal}
                    font="tajawal"
                    size="1080x1080"
                    brandKitSettings={demoBkSettings}
                    brandKitData={demoBrandKit}
                    index={0}
                    total={1}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-ink">{t.name}</h3>
                    {!FEATURE_FLAGS.favorites && (
                      <button
                        onClick={() => handleToggleFavorite(t.id)}
                        className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", isFav ? "text-red-500" : "text-ink-subtle hover:text-ink")}
                      >
                        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted mb-3">{t.description}</p>
                  <div className="flex gap-1.5 mb-3">
                    {t.palettes.map((p) => (
                      <span key={p.id} className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: p.accent }} title={p.name} />
                    ))}
                  </div>
              <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreview(t.id)}>
                      <Eye className="w-4 h-4" /> معاينة
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => router.push(`/projects/new?template=${t.id}`)}>
                      استخدم القالب
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!preview} onClose={() => setPreview(null)} className="max-w-3xl" title={tmpl?.name} description={tmpl?.description}>
        {tmpl && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {SIZES.filter((s) => !FEATURE_FLAGS.medicalMode || s.id === "1080x1350").map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPreviewSize(s.id as CarouselSize)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    previewSize === s.id ? "bg-accent text-white" : "bg-stone-100 text-ink-muted hover:bg-stone-200"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink mb-3">تصاميم الشرائح</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
                {[
                  { slide: demoSlide, label: "الغلاف" },
                  { slide: demoContent, label: "المحتوى" },
                  { slide: demoEnding, label: "الخاتمة / CTA" },
                ].map(({ slide, label }, i) => {
                  const pal = getPalette(tmpl.id, "p1");
                  return (
                    <div key={i} className="text-center w-full max-w-[200px]">
                      <ScaledSlide
                        width={200}
                        slide={slide}
                        templateId={tmpl.id}
                        palette={pal}
                        font="tajawal"
                        size={previewSize}
                        brandKitSettings={demoBkSettings}
                        brandKitData={demoBrandKit}
                        index={i}
                        total={3}
                      />
                      <span className="text-xs text-ink-muted mt-2 block">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink mb-3">اللوحات اللونية</h4>
              <div className="grid grid-cols-4 gap-3">
                {tmpl.palettes.map((p) => (
                  <div key={p.id} className="rounded-xl border border-stone-200 overflow-hidden">
                    <div className="flex h-12">
                      <div className="flex-1" style={{ backgroundColor: p.background }} />
                      <div className="flex-1" style={{ backgroundColor: p.accent }} />
                      <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                      <div className="flex-1" style={{ backgroundColor: p.text }} />
                    </div>
                    <div className="px-2 py-1.5 text-xs text-ink-muted text-center">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink mb-3">الخطوط المدعومة</h4>
              <div className="flex gap-2">
                {tmpl.fonts.map((f) => {
                  const fontDef = ALL_FONTS.find((x) => x.id === f)!;
                  return (
                    <Badge key={f} className="bg-stone-100 text-ink-muted">
                      {fontDef.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => { router.push(`/projects/new?template=${tmpl.id}`); }}>
                <Check className="w-4 h-4" /> استخدم القالب
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

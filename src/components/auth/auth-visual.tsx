"use client";

import { motion } from "framer-motion";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { TEMPLATE_DEFS, getPalette } from "@/lib/templates";
import type { Slide, BrandKit, BrandKitSettings } from "@/lib/types";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";

const demoBrandKit: BrandKit = { instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: DEFAULT_ACCENT_COLOR, font: "tajawal" };
const demoBkSettings: BrandKitSettings = { enabled: false, showLogo: false, showAccountName: false, showSlideNumber: false, showDisclaimer: true, placement: "bottom-left" };

const slides: Slide[] = [
  { id: "a1", type: "cover", title: "كيف يعمل الذكاء الاصطناعي؟", body: "دليل مبسّط" },
  { id: "a2", type: "content", title: "البيانات هي الأساس", body: "الذكاء الاصطناعي يعتمد على البيانات" },
  { id: "a3", type: "ending", title: "تابعنا للمزيد", body: "شاركنا اهتمامك بالتقنية" },
];

const configs = [
  { tmpl: "tahrir", pal: "p1", font: "tajawal" as const },
  { tmpl: "tabayun", pal: "p2", font: "ibm" as const },
  { tmpl: "hadith", pal: "p4", font: "cairo" as const },
];

export function AuthVisual() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-bl from-accent-soft to-surface-tinted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm"
      >
        <h2 className="text-2xl font-extrabold text-ink mb-2 text-center">
          أنشئ كاروسيل احترافي
        </h2>
        <p className="text-sm text-ink-muted text-center mb-8">
          حوّل أفكارك إلى شرائح جاهزة للنشر
        </p>
        <div className="grid grid-cols-3 gap-3">
          {slides.map((s, i) => {
            const c = configs[i];
            const tmpl = TEMPLATE_DEFS.find((t) => t.id === c.tmpl)!;
            const pal = getPalette(c.tmpl, c.pal);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                style={{ transform: `translateY(${i * 12}px)` }}
              >
                <ScaledSlide
                  width={140}
                  slide={s}
                  templateId={tmpl.id}
                  palette={pal}
                  font={c.font}
                  size="1080x1350"
                  brandKitSettings={demoBkSettings}
                  brandKitData={demoBrandKit}
                  index={i}
                  total={3}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, ChevronLeft, Code2, Download, FileArchive, Send, RotateCcw, Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { generateTemplateAction, editTemplateAction, getCustomTemplateAction } from "@/app/actions/custom-templates";
import { sendDesignerPngsToTelegramAction } from "@/app/actions/telegram";
import { downloadDataUrl, dataUrlToBlob } from "@/lib/export";
import { CANVAS_SIZE_DIMENSIONS, type CustomTemplateSettings } from "@/lib/validation/custom-templates";
import { ChatPanel, type ChatMessage } from "./chat-panel";
import { DesignerSettings, DEFAULT_DESIGNER_SETTINGS } from "./designer-settings";
import { IsolatedTemplatePreview, ScaledIsolatedPreview } from "./isolated-preview";
import { VersionHistory } from "./version-history";
import { CodeInspector } from "./code-inspector";
import { captureIframePng, captureAllToZip } from "./capture";
import { mergeSlides } from "./merge";
import type { DesignerVersion } from "./types";
import { useApp } from "@/lib/app-context";
import { getDesignerAccess, hasSavedSlides } from "@/lib/template-designer-access";
import { getWhatsAppUpgradeUrl } from "@/lib/whatsapp";

let clientIdCounter = 0;
function makeClientId() {
  clientIdCounter += 1;
  return `local-${Date.now()}-${clientIdCounter}`;
}

// AI carousel generator: successful results are saved server-side as
// reusable custom templates while previews and exports remain client-side.
export function DesignerWorkspace() {
  const { toast } = useToast();
  const { billing, refresh } = useApp();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<CustomTemplateSettings>(DEFAULT_DESIGNER_SETTINGS);
  const [model, setModel] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [versions, setVersions] = useState<DesignerVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [legacyTemplate, setLegacyTemplate] = useState(false);

  const visibleIframeRef = useRef<HTMLIFrameElement>(null);
  const hiddenIframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const currentVersion = versions.find((v) => v.id === currentVersionId) ?? null;
  const dims = CANVAS_SIZE_DIMENSIONS[settings.size];
  const hasDesign = !!currentVersion;
  const currentSlideHtml = currentVersion?.slides[currentSlideIndex] ?? "";
  const operation = currentVersion ? "edit" : "generate";
  const designerAccess = getDesignerAccess({ operation, ...billing });
  const upgradeUrl = getWhatsAppUpgradeUrl();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (!templateId) {
      setLegacyTemplate(false);
      setCurrentTemplateId(null);
      return;
    }
    let active = true;
    void getCustomTemplateAction(templateId).then((res) => {
      if (!active || !res.success || !res.data) return;
      const latest = res.data.custom_template_versions.at(-1);
      if (!latest) return;
      const layouts = { cover: latest.html_cover, content: latest.html_content, ending: latest.html_ending };
      const rawSlides = latest.raw_slides;
      setSettings(res.data.settings);
      setCurrentTemplateId(res.data.id);
      if (!hasSavedSlides(rawSlides)) {
        setLegacyTemplate(true);
        setVersions([]);
        setCurrentVersionId(null);
        return;
      }
      const version: DesignerVersion = {
        id: makeClientId(),
        versionNumber: latest.version_number,
        css: latest.css,
        layouts,
        rawSlides,
        slides: mergeSlides(rawSlides, layouts),
        aiMessage: latest.ai_message,
        source: latest.source,
        createdAt: latest.created_at,
      };
      setLegacyTemplate(false);
      setVersions([version]);
      setCurrentVersionId(version.id);
    });
    return () => { active = false; };
  }, [searchParams]);

  const handleSend = useCallback(
    async (message: string) => {
      if (legacyTemplate) return;
      if (!designerAccess.allowed) {
        toast({ type: "error", title: designerAccess.reason === "insufficient_credit" ? "لا يوجد رصيد كافٍ" : "انتهت التجربة المجانية" });
        return;
      }
      if (currentVersion && !currentTemplateId) {
        toast({ type: "error", title: "تعذر العثور على القالب المحفوظ" });
        return;
      }
      setLoading(true);
      setMessages((prev) => [...prev, { role: "user", content: message }]);
      try {
        if (!currentVersion) {
          const res = await generateTemplateAction({ settings, message, model });
          if (!res.success || !res.data) {
            toast({ type: "error", title: res.error ?? "تعذر توليد التصميم" });
            return;
          }
          const layouts = { cover: res.data.htmlCover, content: res.data.htmlContent, ending: res.data.htmlEnding };
          const slides = mergeSlides(res.data.slides, layouts);
          const version: DesignerVersion = {
            id: makeClientId(),
            versionNumber: 1,
            css: res.data.css,
            layouts,
            rawSlides: res.data.slides,
            slides,
            aiMessage: res.data.aiMessage,
            source: "generate",
            createdAt: new Date().toISOString(),
          };
          setVersions([version]);
          setCurrentTemplateId(res.data.templateId);
          setCurrentVersionId(version.id);
          setCurrentSlideIndex(0);
          setMessages((prev) => [...prev, { role: "assistant", content: res.data!.aiMessage || `تم توليد ${slides.length} شرائح` }]);
          await refresh();
        } else {
          // Design-only edit — content stays fixed, re-merge with the same rawSlides.
          const res = await editTemplateAction({
            templateId: currentTemplateId,
            settings,
            message,
            currentCss: currentVersion.css,
            currentHtmlCover: currentVersion.layouts.cover,
            currentHtmlContent: currentVersion.layouts.content,
            currentHtmlEnding: currentVersion.layouts.ending,
            model,
          });
          if (!res.success || !res.data) {
            toast({ type: "error", title: res.error ?? "تعذر تعديل التصميم" });
            return;
          }
          const layouts = { cover: res.data.htmlCover, content: res.data.htmlContent, ending: res.data.htmlEnding };
          const slides = mergeSlides(currentVersion.rawSlides, layouts);
          const version: DesignerVersion = {
            id: makeClientId(),
            versionNumber: currentVersion.versionNumber + 1,
            css: res.data.css,
            layouts,
            rawSlides: currentVersion.rawSlides,
            slides,
            aiMessage: res.data.aiMessage,
            source: "edit",
            createdAt: new Date().toISOString(),
          };
          setVersions((prev) => [...prev, version]);
          setCurrentTemplateId(res.data.templateId);
          setCurrentVersionId(version.id);
          setMessages((prev) => [...prev, { role: "assistant", content: res.data!.aiMessage || "تم تحديث التصميم" }]);
          await refresh();
        }
      } finally {
        setLoading(false);
      }
    },
    [currentVersion, currentTemplateId, settings, model, toast, designerAccess, refresh, legacyTemplate]
  );

  const handleReset = () => {
    setVersions([]);
    setCurrentVersionId(null);
    setCurrentSlideIndex(0);
    setMessages([]);
    setCurrentTemplateId(null);
    setLegacyTemplate(false);
  };

  const handleDownloadCurrent = async () => {
    if (!visibleIframeRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await captureIframePng(visibleIframeRef.current, dims.width, dims.height);
      await downloadDataUrl(dataUrl, `${settings.topic || "carousel"}-${currentSlideIndex + 1}.png`);
    } catch {
      toast({ type: "error", title: "تعذر تنزيل الصورة" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!currentVersion) return;
    setDownloadingAll(true);
    try {
      await captureAllToZip(hiddenIframeRefs.current, dims.width, dims.height, `${settings.topic || "carousel"}.zip`);
    } catch {
      toast({ type: "error", title: "تعذر تنزيل الملف المضغوط" });
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleSendTelegram = async () => {
    if (!currentVersion) return;
    setSendingTelegram(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < hiddenIframeRefs.current.length; i++) {
        const iframe = hiddenIframeRefs.current[i];
        if (!iframe) continue;
        const dataUrl = await captureIframePng(iframe, dims.width, dims.height);
        formData.append(`photo${i}`, dataUrlToBlob(dataUrl), `slide-${i + 1}.png`);
      }
      const res = await sendDesignerPngsToTelegramAction(formData);
      if (res.success) {
        toast({ type: "success", title: "تم الإرسال إلى تلغرام" });
      } else {
        toast({ type: "error", title: res.error });
      }
    } catch {
      toast({ type: "error", title: "تعذر الإرسال إلى تلغرام" });
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <AppNavbar />
      <div dir="rtl" className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-0 max-w-[1600px] w-full mx-auto">
        {/* Settings pane (left) */}
        <aside className="border-l border-stone-200 bg-white overflow-y-auto order-3 lg:order-1">
          <DesignerSettings settings={settings} onChange={setSettings} disabled={loading || hasDesign || legacyTemplate} />
          <div className="mx-4 mb-4 rounded-xl border border-accent/20 bg-accent-soft/40 p-3 text-sm text-ink-muted">
            {billing.plan === "paid" && billing.subscriptionStatus === "active" ? (
              <p>الرصيد المتاح: ${(billing.creditBalanceMicroUsd / 1_000_000).toFixed(2)}</p>
            ) : (
              <p>التصاميم المجانية المتبقية: {Math.max(0, billing.freeUsesRemaining)} من 2</p>
            )}
            {!designerAccess.allowed && upgradeUrl && (
              <Link href={upgradeUrl} target="_blank" className="mt-2 inline-block font-bold text-accent underline">
                ترقية عبر واتساب
              </Link>
            )}
          </div>
          {(hasDesign || legacyTemplate) && (
            <div className="p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full" onClick={handleReset} disabled={loading}>
                <RotateCcw className="w-4 h-4" /> توليد جديد
              </Button>
            </div>
          )}
        </aside>

        {/* Preview pane (center) */}
        <main id="main-content" className="flex flex-col order-1 lg:order-2 p-6 gap-4">
          <h1 className="sr-only">مصمم القوالب بالذكاء الاصطناعي</h1>
          <div className="flex items-center justify-center gap-3">
            {hasDesign && (
              <>
                <button
                  type="button"
                  aria-label="الشريحة التالية"
                  onClick={() => setCurrentSlideIndex((i) => Math.min(i + 1, currentVersion!.slides.length - 1))}
                  disabled={currentSlideIndex >= currentVersion!.slides.length - 1}
                  className="min-h-11 min-w-11 rounded-lg border border-stone-200 flex items-center justify-center text-ink-muted hover:border-stone-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-ink min-w-[70px] text-center">
                  {currentSlideIndex + 1} / {currentVersion!.slides.length}
                </span>
                <button
                  type="button"
                  aria-label="الشريحة السابقة"
                  onClick={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
                  disabled={currentSlideIndex <= 0}
                  className="min-h-11 min-w-11 rounded-lg border border-stone-200 flex items-center justify-center text-ink-muted hover:border-stone-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            {hasDesign ? (
              <ScaledIsolatedPreview
                width={dims.width}
                height={dims.height}
                maxWidth={420}
                html={currentSlideHtml}
                css={currentVersion!.css}
                values={{}}
                iframeRef={visibleIframeRef}
              />
            ) : legacyTemplate ? (
              <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="font-bold text-amber-900">هذا القالب من إصدار قديم</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  لم تُحفظ بيانات الشرائح اللازمة للتعديل أو التصدير. يمكنك إنشاء قالب جديد مع بقاء القالب القديم محفوظًا.
                </p>
                <Link href="/templates/designer" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground">
                  إنشاء قالب جديد
                </Link>
              </div>
            ) : (
              <div className="text-center text-ink-subtle max-w-xs">
                <p className="text-sm">اكتب الموضوع في الإعدادات أو المحادثة، وسيولّد الذكاء الاصطناعي المحتوى والتصميم معًا</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCodeOpen(true)} disabled={!hasDesign}>
              <Code2 className="w-4 h-4" /> عرض الكود
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCurrent} disabled={!hasDesign || downloading}>
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} تنزيل الشريحة الحالية
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={!hasDesign || downloadingAll}>
              {downloadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />} تنزيل الكل (ZIP)
            </Button>
            <Button size="sm" onClick={handleSendTelegram} disabled={!hasDesign || sendingTelegram}>
              {sendingTelegram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال إلى تلغرام
            </Button>
          </div>
        </main>

        {/* Chat pane (right) */}
        <aside className="border-r border-stone-200 bg-white flex flex-col order-2 lg:order-3 h-[calc(100vh-4rem)] lg:sticky lg:top-16">
          <div className="flex-1 min-h-0">
            {legacyTemplate ? (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm leading-6 text-ink-muted">
                التعديل بالذكاء الاصطناعي غير متاح لهذا القالب القديم لأن محتوى الشرائح غير محفوظ.
              </div>
            ) : (
              <ChatPanel
                messages={messages}
                loading={loading}
                onSend={handleSend}
                placeholder={hasDesign ? "صف التعديل المطلوب على التصميم..." : "صف التصميم الذي تريده (اختياري)..."}
                model={model}
                onModelChange={setModel}
                canChooseModel={billing.plan === "paid" && billing.subscriptionStatus === "active"}
              />
            )}
          </div>
          <VersionHistory versions={versions} currentVersionId={currentVersionId} onSelect={(v) => setCurrentVersionId(v.id)} disabled={loading} />
        </aside>
      </div>

      {/* Always-mounted, off-screen full-resolution copies of every slide —
          used purely for PNG capture (single/all/Telegram), independent of
          whichever slide is currently scaled into view above. */}
      {currentVersion && (
        <div style={{ position: "fixed", top: 0, left: -99999, pointerEvents: "none" }} aria-hidden>
          {currentVersion.slides.map((html, i) => (
            <IsolatedTemplatePreview
              key={currentVersion.id + i}
              html={html}
              css={currentVersion.css}
              width={dims.width}
              height={dims.height}
              values={{}}
              iframeRef={(el) => {
                hiddenIframeRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      )}

      {hasDesign && (
        <CodeInspector
          open={codeOpen}
          onClose={() => setCodeOpen(false)}
          css={currentVersion!.css}
          htmlCover={currentVersion!.layouts.cover}
          htmlContent={currentVersion!.layouts.content}
          htmlEnding={currentVersion!.layouts.ending}
        />
      )}
    </div>
  );
}

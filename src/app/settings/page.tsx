"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User as UserIcon, Lock, Palette, Sliders, Trash2, Upload, Check, AlertTriangle,
  Instagram, Type as TypeIcon, RotateCcw, Send, Loader2,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/toast";
import { TEMPLATE_DEFS, getPalette, ALL_FONTS, SIZES, templatesForMode } from "@/lib/templates";
import { FONT_FE_TO_DB, SIZE_FE_TO_DB } from "@/lib/db-mappers";
import { cn } from "@/lib/utils";
import type { FontFamily, Tone, Language, ContentLevel, CarouselSize, Slide, BrandKitSettings } from "@/lib/types";
import {
  updateProfileAction, updateBrandKitAction, updatePreferencesAction, deleteAccountAction,
} from "@/app/actions/auth";
import { testTelegramAction, testSavedTelegramAction, getTelegramStatusAction } from "@/app/actions/telegram";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_ACCENT_COLOR, DEFAULT_DISCLAIMER_TEXT } from "@/lib/constants";
import { contentModeFromValue, type ContentMode } from "@/lib/content-mode";
import { formatAvailableCredit, planLabel } from "@/lib/billing-display";

const SECTIONS = [
  { id: "account", label: "الحساب", icon: UserIcon },
  { id: "password", label: "كلمة المرور", icon: Lock },
  { id: "brand", label: "الهوية البصرية", icon: Palette },
  { id: "defaults", label: "الإعدادات الافتراضية", icon: Sliders },
  { id: "telegram", label: "تلغرام", icon: Send },
  { id: "delete", label: "حذف الحساب", icon: Trash2 },
];

const ALL_TONES: Tone[] = ["مبسطة", "احترافية", "ودية", "رسمية", "تحفيزية", "قصصية", "مباشرة", "أكاديمية"];
const ALL_LANGUAGES: Language[] = ["العربية الفصحى", "اللهجة العراقية", "اللهجة الخليجية", "اللهجة المصرية", "الإنجليزية"];
const TONES = ALL_TONES;
const LANGUAGES = ALL_LANGUAGES;
const LEVELS: ContentLevel[] = ["مبتدئ", "متوسط", "متقدم"];

const demoSlide: Slide = { id: "s", type: "cover", title: "معاينة الهوية", body: "نص تجريبي للمعاينة" };
const demoBkSettings: BrandKitSettings = { enabled: true, showLogo: true, showAccountName: true, showSlideNumber: true, showDisclaimer: true, placement: "bottom-left" };

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, brandKit, preferences, billing, ready, refresh } = useApp();
  const [active, setActive] = useState("account");
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [igHandle, setIgHandle] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_ACCENT_COLOR);
  const [brandFont, setBrandFont] = useState<FontFamily>("tajawal");
  const [disclaimerText, setDisclaimerText] = useState(DEFAULT_DISCLAIMER_TEXT);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const [defLang, setDefLang] = useState<Language>("العربية الفصحى");
  const [defTone, setDefTone] = useState<Tone>("مبسطة");
  const [defLevel, setDefLevel] = useState<ContentLevel>("مبتدئ");
  const [defSize, setDefSize] = useState<CarouselSize>("1080x1350");
  const [defSlideCount, setDefSlideCount] = useState(6);
  const [defTemplate, setDefTemplate] = useState("tahrir");
  const [contentMode, setContentMode] = useState<ContentMode>("general");

  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgEnabled, setTgEnabled] = useState(false);
  const [tgTesting, setTgTesting] = useState(false);
  const [hasSavedToken, setHasSavedToken] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name); setAvatarUrl(user.avatarUrl); }
  }, [user]);
  useEffect(() => {
    setIgHandle(brandKit.instagramHandle);
    setLogoUrl(brandKit.logoUrl);
    setPrimaryColor(brandKit.primaryColor);
    setBrandFont(brandKit.font as FontFamily);
    setDisclaimerText(brandKit.disclaimerText ?? DEFAULT_DISCLAIMER_TEXT);
  }, [brandKit]);
  useEffect(() => {
    if (preferences) {
      setDefLang(preferences.language as Language);
      setDefTone(preferences.tone as Tone);
      setDefLevel(preferences.level as ContentLevel);
      const sizeMap: Record<string, CarouselSize> = { square: "1080x1080", portrait: "1080x1350", story: "1080x1920" };
      setDefSize(sizeMap[preferences.size] ?? "1080x1350");
      setDefSlideCount(preferences.slideCount);
      setContentMode(contentModeFromValue(preferences.contentMode));
    }
  }, [preferences]);

  // Load telegram status via server action — the bot token itself never reaches the browser
  useEffect(() => {
    if (!user) return;
    getTelegramStatusAction().then((result) => {
      if (result.success) {
        setHasSavedToken(result.data.hasToken);
        setTgChatId(result.data.chatId);
        setTgEnabled(result.data.enabled);
      }
    });
  }, [user]);

  if (!ready || !user) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center" aria-label="جارٍ تحميل إعدادات الحساب">
        <h1 className="sr-only">إعدادات الحساب</h1>
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-accent" />
      </main>
    );
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveAccount = async () => {
    const formData = new FormData();
    formData.set("display_name", name);
    formData.set("instagram_username", igHandle || "");
    const result = await updateProfileAction(formData);
    if (result.success) {
      if (avatarFile) {
        const supabase = createClient();
        const ext = avatarFile.name.split(".").pop() || "png";
        const path = `${user.id}/avatar.${ext}`;
        await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
      }
      refresh();
      toast({ type: "success", title: "تم حفظ التغييرات" });
    } else {
      toast({ type: "error", title: result.error ?? "تعذر الحفظ" });
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveBrandKit = async () => {
    let logoPath: string | null = null;
    if (logoFile) {
      const supabase = createClient();
      const ext = logoFile.name.split(".").pop() || "png";
      logoPath = `${user.id}/logo.${ext}`;
      await supabase.storage.from("brand-logos").upload(logoPath, logoFile, { upsert: true });
    }
    const result = await updateBrandKitAction({
      instagram_username: igHandle || null,
      logo_path: logoPath ?? undefined,
      primary_color: primaryColor,
      default_font: FONT_FE_TO_DB[brandFont],
      disclaimer_text: disclaimerText,
      show_disclaimer: showDisclaimer,
    });
    if (result.success) {
      refresh();
      toast({ type: "success", title: "تم حفظ الهوية البصرية" });
    } else {
      toast({ type: "error", title: result.error ?? "تعذر الحفظ" });
    }
  };

  const changePassword = async () => {
    if (newPass.length < 6) { toast({ type: "error", title: "كلمة المرور قصيرة جدًا" }); return; }
    if (newPass !== confirmPass) { toast({ type: "error", title: "كلمتا المرور غير متطابقتين" }); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { toast({ type: "error", title: error.message }); return; }
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    toast({ type: "success", title: "تم تغيير كلمة المرور" });
  };

  const saveDefaults = async () => {
    const result = await updatePreferencesAction({
      default_language: defLang,
      default_tone: defTone,
      default_level: defLevel,
      default_size: SIZE_FE_TO_DB[defSize],
      default_slide_count: defSlideCount,
      content_mode: contentMode,
    });
    if (result.success) { await refresh(); toast({ type: "success", title: "تم حفظ الإعدادات الافتراضية" }); }
    else toast({ type: "error", title: result.error ?? "تعذر الحفظ" });
  };

  const saveTelegram = async () => {
    // Only send the token if the user typed a new one — an empty field means "keep the saved token"
    const payload: Record<string, unknown> = {
      telegram_chat_id: tgChatId || null,
      telegram_enabled: tgEnabled,
    };
    if (tgToken) payload.telegram_bot_token = tgToken;

    const result = await updatePreferencesAction(payload);
    if (result.success) {
      if (tgToken) { setHasSavedToken(true); setTgToken(""); }
      refresh();
      toast({ type: "success", title: "تم حفظ إعدادات تلغرام" });
    } else {
      toast({ type: "error", title: result.error ?? "تعذر الحفظ" });
    }
  };

  const testTelegram = async () => {
    setTgTesting(true);
    const result = tgToken
      ? await testTelegramAction(tgToken, tgChatId)
      : hasSavedToken
      ? await testSavedTelegramAction()
      : { success: false, error: "أدخل الرمز ومعرّف المحادثة أولاً" };
    if (result.success) toast({ type: "success", title: "تم الإرسال! تحقق من تلغرام" });
    else toast({ type: "error", title: result.error ?? "فشل الاتصال" });
    setTgTesting(false);
  };

  const handleDelete = async () => {
    const result = await deleteAccountAction();
    if (result.success) router.push("/");
    else toast({ type: "error", title: result.error ?? "تعذر الحذف" });
  };

  const previewPal = { id: "p1", name: "preview", background: "#FAFAF9", text: "#1C1917", accent: primaryColor, secondary: "#E8E6FE" };
  const modeTemplates = templatesForMode(contentMode);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-6">الإعدادات</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-stone-200 bg-white p-2 space-y-1 lg:sticky lg:top-20 flex lg:flex-col overflow-x-auto no-scrollbar">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  aria-pressed={active === s.id}
                  className={cn(
                    "min-h-11 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                    active === s.id
                      ? s.id === "delete" ? "bg-red-50 text-red-600" : "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-stone-50"
                  )}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {active === "account" && (
                <SectionCard title="الحساب" desc="معلومات حسابك الأساسية">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center text-2xl font-bold text-accent overflow-hidden">
                        {avatarUrl ? <img src={avatarUrl} alt="صورة الحساب" width={80} height={80} decoding="async" className="w-full h-full object-cover" /> : name[0] ?? "م"}
                      </div>
                      <label aria-label="تغيير صورة الحساب" className="absolute bottom-0 right-0 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white border border-stone-200 cursor-pointer hover:bg-stone-50">
                        <Upload className="w-3.5 h-3.5 text-ink-muted" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                      </label>
                    </div>
                    <div>
                      <p className="font-bold text-ink">{name}</p>
                      <p className="text-sm text-ink-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <p className="text-xs text-ink-muted">نوع الحساب</p>
                      <p className="mt-1 font-bold text-ink">{planLabel(billing.plan)}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <p className="text-xs text-ink-muted">رصيدي</p>
                      <p className="mt-1 font-bold text-ink" dir="ltr">{formatAvailableCredit(billing.creditBalanceMicroUsd)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>الاسم</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <Button onClick={saveAccount}><Check className="w-4 h-4" /> حفظ التغييرات</Button>
                  </div>
                </SectionCard>
              )}

              {active === "password" && (
                <SectionCard title="كلمة المرور" desc="غيّر كلمة المرور الخاصة بك">
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label>كلمة المرور الحالية</Label>
                      <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                      <Label>كلمة المرور الجديدة</Label>
                      <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                      <Label>تأكيد كلمة المرور الجديدة</Label>
                      <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="••••••••" />
                    </div>
                    <Button onClick={changePassword}><Lock className="w-4 h-4" /> حفظ كلمة المرور</Button>
                  </div>
                </SectionCard>
              )}

              {active === "brand" && (
                <SectionCard title="الهوية البصرية" desc="احفظ هويتك لتطبيقها على المشاريع">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="instagram-handle">اسم حساب Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                          <Input id="instagram-handle" value={igHandle} onChange={(e) => setIgHandle(e.target.value)} className="pr-10" placeholder="@username" autoComplete="off" />
                        </div>
                      </div>
                      <div>
                        <Label>الشعار</Label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                            {logoUrl ? <img src={logoUrl} alt="شعار الحساب" width={64} height={64} decoding="async" className="w-full h-full object-contain" /> : <Upload className="w-5 h-5 text-stone-300" />}
                          </div>
                          <label className="cursor-pointer">
                            <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-ink hover:bg-stone-50 text-sm font-medium px-3 cursor-pointer">
                              رفع الشعار
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                          </label>
                          {logoUrl && (
                            <Button variant="ghost" size="sm" onClick={() => { setLogoUrl(null); setLogoFile(null); }}>إزالة</Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>اللون الرئيسي</Label>
                        <div className="flex items-center gap-3">
                          <input type="color" aria-label="اللون الرئيسي" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-11 w-12 rounded-lg border border-stone-200 cursor-pointer" />
                          <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-[140px]" />
                        </div>
                      </div>
                      <div>
                        <Label>الخط الافتراضي</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {ALL_FONTS.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setBrandFont(f.id as FontFamily)}
                              aria-pressed={brandFont === f.id}
                              className={cn("min-h-11 rounded-xl border-2 py-2 text-sm font-medium cursor-pointer transition-colors", brandFont === f.id ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink hover:bg-stone-50")}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>تنبيه طبي</Label>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                          <Checkbox checked={showDisclaimer} onCheckedChange={(v) => setShowDisclaimer(!!v)} />
                          <span className="text-sm text-ink-muted">إظهار تنبيه استشارة الطبيب على كل كاروسيل</span>
                        </label>
                        <Textarea
                          value={disclaimerText}
                          onChange={(e) => setDisclaimerText(e.target.value)}
                          placeholder="نص التنبيه الطبي"
                          rows={2}
                        />
                      </div>
                      <Button onClick={saveBrandKit}><Check className="w-4 h-4" /> حفظ الهوية</Button>
                    </div>
                    <div className="flex items-center justify-center bg-stone-50 rounded-xl p-4">
                      <ScaledSlide
                        width={220}
                        slide={demoSlide}
                        templateId="wadeh"
                        palette={previewPal}
                        font={brandFont}
                        size="1080x1080"
                        brandKitSettings={demoBkSettings}
                        brandKitData={{ instagramHandle: igHandle, logoDataUrl: logoUrl, primaryColor, font: brandFont, disclaimerText }}
                        medical={{ isMedical: contentMode === "medical" }}
                        index={0}
                        total={1}
                      />
                    </div>
                  </div>
                </SectionCard>
              )}

              {active === "defaults" && (
                <SectionCard title="الإعدادات الافتراضية" desc="القيم الافتراضية للمشاريع الجديدة">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>مجال المحتوى</Label>
                        <select value={contentMode} onChange={(e) => setContentMode(e.target.value as ContentMode)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          <option value="general">محتوى عام</option>
                          <option value="medical">محتوى طبي</option>
                        </select>
                      </div>
                      <div>
                        <Label>اللغة</Label>
                        <select value={defLang} onChange={(e) => setDefLang(e.target.value as Language)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>الأسلوب</Label>
                        <select value={defTone} onChange={(e) => setDefTone(e.target.value as Tone)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>المستوى</Label>
                        <select value={defLevel} onChange={(e) => setDefLevel(e.target.value as ContentLevel)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>المقاس</Label>
                        <select value={defSize} onChange={(e) => setDefSize(e.target.value as CarouselSize)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          {SIZES.filter((s) => contentMode !== "medical" || s.id === "1080x1350").map((s) => <option key={s.id} value={s.id}>{s.label} ({s.ratio})</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>عدد الشرائح: {defSlideCount}</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Button type="button" aria-label="تقليل عدد الشرائح" variant="outline" size="icon" disabled={defSlideCount <= 2} onClick={() => setDefSlideCount(Math.max(2, defSlideCount - 1))}>-</Button>
                          <div className="flex-1 h-2 rounded-full bg-stone-100"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((defSlideCount - 2) / 8) * 100}%` }} /></div>
                          <Button type="button" aria-label="زيادة عدد الشرائح" variant="outline" size="icon" disabled={defSlideCount >= 10} onClick={() => setDefSlideCount(Math.min(10, defSlideCount + 1))}>+</Button>
                        </div>
                      </div>
                      <div>
                        <Label>القالب المفضل</Label>
                        <select value={defTemplate} onChange={(e) => setDefTemplate(e.target.value)} className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer">
                          {modeTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveDefaults}><Check className="w-4 h-4" /> حفظ</Button>
                      <Button variant="outline" onClick={() => { setDefLang("العربية الفصحى"); setDefTone("مبسطة"); setDefLevel("مبتدئ"); setDefSize("1080x1350"); setDefSlideCount(6); setDefTemplate("tahrir"); toast({ type: "info", title: "تمت الاستعادة" }); }}>
                        <RotateCcw className="w-4 h-4" /> استعادة الإعدادات الافتراضية
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {active === "telegram" && (
                <SectionCard title="تلغرام" desc="اربط بوت تلغرام لإرسال الشرائح مباشرة إلى حسابك">
                  <div className="space-y-4 max-w-lg">
                    <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-ink-muted">
                      <p className="font-medium text-ink mb-1">كيفية الإعداد:</p>
                      <p>1. أنشئ بوت من <span className="font-mono">@BotFather</span> واحصل على الرمز</p>
                      <p>2. أرسل رسالة للبوت ثم احصل على معرّف المحادثة من <span className="font-mono">@userinfobot</span></p>
                    </div>
                    <div>
                      <Label>رمز البوت (Bot Token)</Label>
                      <Input
                        type="password"
                        value={tgToken}
                        onChange={(e) => setTgToken(e.target.value)}
                        placeholder={hasSavedToken ? "•••••••• (رمز محفوظ — اتركه فارغًا للإبقاء عليه)" : "123456:ABC-DEF..."}
                      />
                    </div>
                    <div>
                      <Label>معرّف المحادثة (Chat ID)</Label>
                      <Input
                        value={tgChatId}
                        onChange={(e) => setTgChatId(e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={tgEnabled} onCheckedChange={(v) => setTgEnabled(!!v)} />
                      <span className="text-sm text-ink-muted">تفعيل الإرسال إلى تلغرام</span>
                    </label>
                    <div className="flex gap-2">
                      <Button onClick={saveTelegram}><Check className="w-4 h-4" /> حفظ</Button>
                      <Button variant="outline" onClick={testTelegram} disabled={tgTesting}>
                        {tgTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        اختبار الاتصال
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {active === "delete" && (
                <SectionCard title="حذف الحساب" desc="إجراء لا يمكن التراجع عنه" destructive>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700 font-medium">سيتم حذف الحساب وجميع المشاريع نهائيًا ولا يمكن التراجع عن ذلك.</p>
                      </div>
                    </div>
                    <Button variant="destructive" className="mt-4" onClick={() => setDeleteDialog(true)}>
                      <Trash2 className="w-4 h-4" /> حذف الحساب
                    </Button>
                  </div>
                </SectionCard>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} title="تأكيد حذف الحساب" description="سيتم حذف كل شيء نهائيًا. هل أنت متأكد؟">
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" /> نعم، احذف حسابي
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setDeleteDialog(false)}>إلغاء</Button>
        </div>
      </Dialog>
    </div>
  );
}

function SectionCard({ title, desc, children, destructive }: {
  title: string;
  desc: string;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-white p-6 shadow-soft", destructive ? "border-red-200" : "border-stone-200")}>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="text-sm text-ink-muted mt-1 mb-5">{desc}</p>
      {children}
    </div>
  );
}

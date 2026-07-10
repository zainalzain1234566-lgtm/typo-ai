"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_ACCENT_COLOR, DEFAULT_DISCLAIMER_TEXT } from "@/lib/constants";

// ============= Types (matching frontend expectations) =============

export interface AppUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  avatarUrl: string | null;
}

export interface Stats {
  totalProjects: number;
  completedProjects: number;
  exportCount: number;
  favoriteTemplates: number;
}

export interface AppData {
  user: AppUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  stats: Stats;
  brandKit: {
    instagramHandle: string;
    logoUrl: string | null;
    primaryColor: string;
    font: string;
    disclaimerText: string;
  };
  preferences: {
    language: string;
    tone: string;
    level: string;
    size: string;
    slideCount: number;
    preferredTemplateId: string | null;
  };
  telegramEnabled: boolean;
}

interface AppContextValue extends AppData {
  supabase: SupabaseClient;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, completedProjects: 0, exportCount: 0, favoriteTemplates: 0 });
  const [brandKit, setBrandKit] = useState<{ instagramHandle: string; logoUrl: string | null; primaryColor: string; font: string; disclaimerText: string }>({ instagramHandle: "", logoUrl: null, primaryColor: DEFAULT_ACCENT_COLOR, font: "tajawal", disclaimerText: DEFAULT_DISCLAIMER_TEXT });
  const [preferences, setPreferences] = useState({ language: "العربية الفصحى", tone: "مبسطة", level: "مبتدئ", size: "portrait", slideCount: 6, preferredTemplateId: null });
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    console.log("[APP] loadUserData start", { userId });
    // Load profile
    const { data: profile, error: profileErr } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profileErr) console.error("[APP] profile load error", profileErr.message);
    // Load brand kit
    const { data: bk, error: bkErr } = await supabase.from("brand_kits").select("*").eq("user_id", userId).single();
    if (bkErr) console.error("[APP] brand_kit load error", bkErr.message);
    // Load preferences
    const { data: prefs, error: prefsErr } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single();
    if (prefsErr) console.error("[APP] user_preferences load error", prefsErr.message);
    // Load stats
    const { data: statsData, error: statsErr } = await supabase.rpc("get_dashboard_stats");
    if (statsErr) console.error("[APP] get_dashboard_stats error", statsErr.message);
    console.log("[APP] loadUserData loaded", { hasProfile: !!profile, hasBK: !!bk, hasPrefs: !!prefs, hasStats: !!statsData });

    if (profile) {
      let avatarUrl: string | null = null;
      if (profile.avatar_path) {
        const { data: urlData } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_path, 3600);
        avatarUrl = urlData?.signedUrl ?? null;
      }

      setUser({
        id: userId,
        name: profile.display_name,
        email: "", // email comes from auth, not profile
        verified: true,
        avatarUrl,
      });
    }

    if (bk) {
      let logoUrl: string | null = null;
      if (bk.logo_path) {
        const { data: urlData } = await supabase.storage.from("brand-logos").createSignedUrl(bk.logo_path, 3600);
        logoUrl = urlData?.signedUrl ?? null;
      }
      setBrandKit({
        instagramHandle: bk.instagram_username ?? "",
        logoUrl,
        primaryColor: bk.primary_color ?? DEFAULT_ACCENT_COLOR,
        font: bk.default_font ?? "tajawal",
        disclaimerText: bk.disclaimer_text ?? DEFAULT_DISCLAIMER_TEXT,
      });
    }

    if (prefs) {
      setPreferences({
        language: prefs.default_language ?? "العربية الفصحى",
        tone: prefs.default_tone ?? "مبسطة",
        level: prefs.default_level ?? "مبتدئ",
        size: prefs.default_size ?? "portrait",
        slideCount: prefs.default_slide_count ?? 6,
        preferredTemplateId: prefs.preferred_template_id ?? "tahrir",
      });
      setTelegramEnabled(!!prefs.telegram_enabled);
    }

    if (statsData && typeof statsData === "object") {
      const s = statsData as Record<string, number>;
      setStats({
        totalProjects: s.total_projects ?? 0,
        completedProjects: s.completed_projects ?? 0,
        exportCount: s.export_count ?? 0,
        favoriteTemplates: s.favorite_templates ?? 0,
      });
    }
  }, [supabase]);

  const refresh = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadUserData(authUser.id);
      setUser((prev) => prev ? { ...prev, email: authUser.email ?? "" } : { id: authUser.id, name: "", email: authUser.email ?? "", verified: true, avatarUrl: null });
    } else {
      setUser(null);
    }
  }, [supabase, loadUserData]);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[APP] auth event", event, { hasSession: !!session });
      if (event === "SIGNED_IN" && session?.user) {
        if (mounted) {
          setUser({ id: session.user.id, name: session.user.user_metadata?.display_name ?? "", email: session.user.email ?? "", verified: true, avatarUrl: null });
          await loadUserData(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) setUser(null);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, name: session.user.user_metadata?.display_name ?? "", email: session.user.email ?? "", verified: true, avatarUrl: null });
        await loadUserData(session.user.id);
      }
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadUserData]);

  const value: AppContextValue = {
    user,
    isAuthenticated: !!user,
    ready,
    stats,
    brandKit,
    preferences,
    telegramEnabled,
    supabase,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

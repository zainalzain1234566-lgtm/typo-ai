"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { AppData, User, BrandKit, Stats, Project, Folder, Placement, FontFamily } from "./types";
import { loadData, saveData, resetData } from "./storage";
import { defaultData } from "./mock-data";
import {
  upsertProject, deleteProject, duplicateProject,
  createFolder, renameFolder, deleteFolder,
  signup, login, verifyEmail, updatePassword, updateUser, logout, deleteAccount,
  updateBrandKit, getStats, addExportRecord,
} from "./storage";
import { uid } from "./utils";

interface AppContextValue {
  data: AppData;
  ready: boolean;
  user: User | null;
  isAuthenticated: boolean;
  stats: Stats;
  // auth
  doSignup: (name: string, email: string, password: string) => string | null;
  doLogin: (email: string, password: string) => string | null;
  doVerifyEmail: (code: string) => string | null;
  doUpdatePassword: (email: string, newPassword: string) => void;
  doLogout: () => void;
  doUpdateUser: (updates: Partial<User>) => void;
  doDeleteAccount: () => void;
  // projects
  saveProject: (p: Project) => void;
  removeProject: (id: string) => void;
  cloneProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  moveToFolder: (id: string, folderId: string | null) => void;
  recordExport: (id: string) => void;
  // folders
  addFolder: (name: string) => void;
  editFolder: (id: string, name: string) => void;
  removeFolder: (id: string) => void;
  // brand kit
  setBrandKit: (updates: Partial<BrandKit>) => void;
  // templates
  toggleTemplateFavorite: (templateId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // --- Auth ---
  const doSignup = useCallback((name: string, email: string, password: string) => {
    let error: string | null = null;
    update((d) => {
      const r = signup(d, name, email, password);
      error = r.error ?? null;
      return r.error ? d : r.data;
    });
    return error;
  }, [update]);

  const doLogin = useCallback((email: string, password: string) => {
    let error: string | null = null;
    update((d) => {
      const r = login(d, email, password);
      error = r.error ?? null;
      return r.error ? d : r.data;
    });
    return error;
  }, [update]);

  const doVerifyEmail = useCallback((code: string) => {
    let error: string | null = null;
    update((d) => {
      const r = verifyEmail(d, code);
      error = r.error ?? null;
      return r.error ? d : r.data;
    });
    return error;
  }, [update]);

  const doUpdatePassword = useCallback((email: string, newPassword: string) => {
    update((d) => updatePassword(d, email, newPassword));
  }, [update]);

  const doLogout = useCallback(() => {
    update((d) => logout(d));
  }, [update]);

  const doUpdateUser = useCallback((updates: Partial<User>) => {
    update((d) => updateUser(d, updates));
  }, [update]);

  const doDeleteAccount = useCallback(() => {
    update((d) => deleteAccount(d));
    resetData();
  }, [update]);

  // --- Projects ---
  const saveProject = useCallback((p: Project) => {
    update((d) => upsertProject(d, p));
  }, [update]);

  const removeProject = useCallback((id: string) => {
    update((d) => deleteProject(d, id));
  }, [update]);

  const cloneProject = useCallback((id: string) => {
    update((d) => duplicateProject(d, id));
  }, [update]);

  const toggleFavorite = useCallback((id: string) => {
    update((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
    }));
  }, [update]);

  const moveToFolder = useCallback((id: string, folderId: string | null) => {
    update((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, folderId } : p)),
    }));
  }, [update]);

  const recordExport = useCallback((id: string) => {
    update((d) => addExportRecord(d, id));
  }, [update]);

  // --- Folders ---
  const addFolder = useCallback((name: string) => {
    update((d) => createFolder(d, name));
  }, [update]);

  const editFolder = useCallback((id: string, name: string) => {
    update((d) => renameFolder(d, id, name));
  }, [update]);

  const removeFolder = useCallback((id: string) => {
    update((d) => deleteFolder(d, id));
  }, [update]);

  // --- Brand Kit ---
  const setBrandKit = useCallback((updates: Partial<BrandKit>) => {
    update((d) => updateBrandKit(d, updates));
  }, [update]);

  // --- Templates ---
  const toggleTemplateFavorite = useCallback((templateId: string) => {
    update((d) => {
      const exists = d.favoriteTemplates.includes(templateId);
      return {
        ...d,
        favoriteTemplates: exists
          ? d.favoriteTemplates.filter((t) => t !== templateId)
          : [...d.favoriteTemplates, templateId],
      };
    });
  }, [update]);

  const user = data.currentUserId ? data.users.find((u) => u.id === data.currentUserId) ?? null : null;
  const stats = getStats(data);

  const value: AppContextValue = {
    data, ready, user, isAuthenticated: !!user, stats,
    doSignup, doLogin, doVerifyEmail, doUpdatePassword, doLogout, doUpdateUser, doDeleteAccount,
    saveProject, removeProject, cloneProject, toggleFavorite, moveToFolder, recordExport,
    addFolder, editFolder, removeFolder,
    setBrandKit, toggleTemplateFavorite,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Helper to create a new blank project
export function createBlankProject(): Project {
  const now = new Date().toISOString();
  return {
    id: uid("proj"),
    title: "مشروع بدون عنوان",
    folderId: null,
    status: "draft",
    favorite: false,
    exportCount: 0,
    createdAt: now,
    updatedAt: now,
    settings: {
      contentType: "تعليمي",
      audience: "",
      level: "مبتدئ",
      tone: "مبسطة",
      language: "العربية الفصحى",
      size: "1080x1350",
      slideCount: 6,
      cta: "تابع الحساب",
      templateId: "tahrir",
      paletteId: "p1",
      font: "tajawal",
      brandKit: {
        enabled: false,
        showLogo: false,
        showAccountName: false,
        showSlideNumber: false,
        placement: "bottom-left",
      },
    },
    slides: [],
    caption: "",
    hashtags: [],
  };
}

import type { AppData, Project, Folder, User, BrandKit, ExportRecord, Stats } from "./types";
import { defaultData } from "./mock-data";
import { uid } from "./utils";

const STORAGE_KEY = "typo_ai_data_v1";

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = defaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============= Project ops =============

export function getProjects(data: AppData): Project[] {
  return data.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProject(data: AppData, id: string): Project | undefined {
  return data.projects.find((p) => p.id === id);
}

export function upsertProject(data: AppData, project: Project): AppData {
  const idx = data.projects.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  const projects = idx >= 0
    ? data.projects.map((p) => (p.id === project.id ? updated : p))
    : [...data.projects, updated];
  return { ...data, projects };
}

export function deleteProject(data: AppData, id: string): AppData {
  return { ...data, projects: data.projects.filter((p) => p.id !== id) };
}

export function duplicateProject(data: AppData, id: string): AppData {
  const p = getProject(data, id);
  if (!p) return data;
  const copy: Project = {
    ...p,
    id: uid("proj"),
    title: `${p.title} (نسخة)`,
    exportCount: 0,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slides: p.slides.map((s) => ({ ...s, id: uid("s") })),
  };
  return { ...data, projects: [...data.projects, copy] };
}

// ============= Folder ops =============

export function getFolders(data: AppData): Folder[] {
  return data.folders;
}

export function createFolder(data: AppData, name: string): AppData {
  return { ...data, folders: [...data.folders, { id: uid("f"), name }] };
}

export function renameFolder(data: AppData, id: string, name: string): AppData {
  return { ...data, folders: data.folders.map((f) => (f.id === id ? { ...f, name } : f)) };
}

export function deleteFolder(data: AppData, id: string): AppData {
  if (id === "f_all") return data;
  return {
    ...data,
    folders: data.folders.filter((f) => f.id !== id),
    projects: data.projects.map((p) => (p.folderId === id ? { ...p, folderId: null } : p)),
  };
}

// ============= User/Auth ops =============

export function getCurrentUser(data: AppData): User | null {
  if (!data.currentUserId) return null;
  return data.users.find((u) => u.id === data.currentUserId) ?? null;
}

export function signup(data: AppData, name: string, email: string, password: string): { data: AppData; error?: string } {
  if (data.users.some((u) => u.email === email)) {
    return { data, error: "هذا البريد الإلكتروني مسجل بالفعل" };
  }
  const user: User = {
    id: uid("user"),
    name,
    email,
    password,
    verified: false,
    avatarDataUrl: null,
    createdAt: new Date().toISOString(),
  };
  return { data: { ...data, users: [...data.users, user], currentUserId: user.id } };
}

export function login(data: AppData, email: string, password: string): { data: AppData; error?: string } {
  const user = data.users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return { data, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }
  return { data: { ...data, currentUserId: user.id } };
}

export function verifyEmail(data: AppData, _code: string): { data: AppData; error?: string } {
  if (!data.currentUserId) return { data, error: "لا يوجد مستخدم حالي" };
  return {
    data: {
      ...data,
      users: data.users.map((u) => (u.id === data.currentUserId ? { ...u, verified: true } : u)),
    },
  };
}

export function updatePassword(data: AppData, email: string, newPassword: string): AppData {
  return {
    ...data,
    users: data.users.map((u) => (u.email === email ? { ...u, password: newPassword } : u)),
  };
}

export function updateUser(data: AppData, updates: Partial<User>): AppData {
  if (!data.currentUserId) return data;
  return {
    ...data,
    users: data.users.map((u) => (u.id === data.currentUserId ? { ...u, ...updates } : u)),
  };
}

export function logout(data: AppData): AppData {
  return { ...data, currentUserId: null };
}

export function deleteAccount(data: AppData): AppData {
  if (!data.currentUserId) return data;
  return {
    ...defaultData(),
    users: data.users.filter((u) => u.id !== data.currentUserId),
    currentUserId: null,
  };
}

// ============= Brand Kit ops =============

export function updateBrandKit(data: AppData, updates: Partial<BrandKit>): AppData {
  return { ...data, brandKit: { ...data.brandKit, ...updates } };
}

// ============= Stats =============

export function getStats(data: AppData): Stats {
  return {
    totalProjects: data.projects.length,
    completedProjects: data.projects.filter((p) => p.status === "completed").length,
    exportCount: data.exportRecords.length,
    favoriteTemplates: data.favoriteTemplates.length,
  };
}

// ============= Export records =============

export function addExportRecord(data: AppData, projectId: string): AppData {
  const project = getProject(data, projectId);
  if (!project) return data;
  const record: ExportRecord = {
    id: uid("exp"),
    projectId,
    projectTitle: project.title,
    slideCount: project.slides.length,
    size: project.settings.size,
    exportedAt: new Date().toISOString(),
  };
  const projects = data.projects.map((p) =>
    p.id === projectId ? { ...p, exportCount: p.exportCount + 1, status: "completed" as const } : p
  );
  return { ...data, exportRecords: [record, ...data.exportRecords], projects };
}

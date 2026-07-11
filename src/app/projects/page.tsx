"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Star, MoreVertical, FolderOpen, Copy, Download, Trash2, Heart,
  FileText, CheckCircle2, Image as ImageIcon, FolderPlus, Pencil, Folder, X,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ScaledSlide } from "@/components/carousel/slide-renderer";
import { useApp } from "@/lib/app-context";
import { mapProject, mapFolder } from "@/lib/db-mappers";
import { getPalette } from "@/lib/templates";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { cn, relativeTime } from "@/lib/utils";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import type { Project, Folder as FolderType } from "@/lib/types";
import {
  deleteProjectAction, duplicateProjectAction, toggleProjectFavoriteAction,
  moveToFolderAction,
} from "@/app/actions/projects";
import {
  createFolderAction, renameFolderAction, deleteFolderAction,
} from "@/app/actions/auth";

type SortKey = "newest" | "oldest" | "modified" | "name";

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, stats, ready } = useApp();

  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("modified");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [folderDialog, setFolderDialog] = useState<{ mode: "create" } | { mode: "edit"; id: string; name: string } | null>(null);
  const [folderName, setFolderName] = useState("");

  const loadData = useCallback(async () => {
    const [{ data: rawProjects }, { data: rawFolders }] = await Promise.all([
      supabase.from("projects").select("*, template:templates(slug), palette:template_palettes(sort_order)").order("updated_at", { ascending: false }),
      supabase.from("folders").select("*").order("name"),
    ]);

    if (rawFolders) setFolders(rawFolders.map(mapFolder));

    if (rawProjects) {
      const projectIds = rawProjects.map((p: any) => p.id);
      const { data: allSlides } = await supabase
        .from("slides")
        .select("*")
        .in("project_id", projectIds)
        .order("position");

      const slidesByProject: Record<string, any[]> = {};
      for (const s of allSlides ?? []) {
        if (!slidesByProject[s.project_id]) slidesByProject[s.project_id] = [];
        slidesByProject[s.project_id].push(s);
      }

      setProjects(rawProjects.map((p: any) => mapProject(p, slidesByProject[p.id] ?? [])));
    }
  }, [supabase]);

  useEffect(() => {
    if (ready) loadData();
  }, [ready, loadData]);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (sizeFilter !== "all") list = list.filter((p) => p.settings.size === sizeFilter);
    if (folderFilter !== "all") {
      if (folderFilter === "none") list = list.filter((p) => !p.folderId);
      else list = list.filter((p) => p.folderId === folderFilter);
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "modified": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "name": return a.title.localeCompare(b.title, "ar");
      }
    });
    return list;
  }, [projects, search, sizeFilter, folderFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProjectAction(deleteTarget);
    toast({ type: "success", title: "تم حذف المشروع" });
    setDeleteTarget(null);
    loadData();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateProjectAction(id);
    toast({ type: "success", title: "تم تكرار المشروع" });
    loadData();
  };

  const handleFavorite = async (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, favorite: !p.favorite } : p));
    await toggleProjectFavoriteAction(id);
  };

  const handleMove = async (projectId: string, folderId: string | null) => {
    await moveToFolderAction(projectId, folderId);
    toast({ type: "success", title: "تم نقل المشروع" });
    loadData();
  };

  const handleFolderSubmit = async () => {
    if (!folderName.trim()) return;
    if (folderDialog?.mode === "create") {
      await createFolderAction(folderName.trim());
      toast({ type: "success", title: "تم إنشاء المجلد" });
    } else if (folderDialog?.mode === "edit") {
      await renameFolderAction(folderDialog.id, folderName.trim());
      toast({ type: "success", title: "تم تعديل المجلد" });
    }
    setFolderDialog(null);
    setFolderName("");
    loadData();
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolderAction(id);
    toast({ type: "success", title: "تم حذف المجلد" });
    loadData();
  };

  const statCards = [
    { label: "إجمالي المشاريع", value: stats.totalProjects, icon: FileText },
    { label: "المشاريع المكتملة", value: stats.completedProjects, icon: CheckCircle2 },
    { label: "عدد مرات التصدير", value: stats.exportCount, icon: Download },
    { label: "القوالب المفضلة", value: stats.favoriteTemplates, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink">مشاريعي</h1>
            <p className="mt-1 text-ink-muted">أنشئ محتوى جديدًا أو أكمل العمل على مشاريعك السابقة.</p>
          </div>
          <Button size="lg" onClick={() => router.push("/projects/new")}>
            <Plus className="w-5 h-5" /> مشروع جديد
          </Button>
        </div>

        {!FEATURE_FLAGS.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-ink">{s.value}</span>
                  <s.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm text-ink-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {!FEATURE_FLAGS.folders && (
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setFolderFilter("all")}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  folderFilter === "all" ? "bg-accent text-white" : "bg-white border border-stone-200 text-ink-muted hover:bg-stone-50"
                )}
              >
                جميع المشاريع
              </button>
              {folders.map((f) => (
                <div key={f.id} className="shrink-0 flex items-center group">
                  <button
                    onClick={() => setFolderFilter(f.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                      folderFilter === f.id ? "bg-accent text-white" : "bg-white border border-stone-200 text-ink-muted hover:bg-stone-50"
                    )}
                  >
                    <Folder className="w-4 h-4" />
                    {f.name}
                  </button>
                  <Dropdown
                    trigger={<button className="p-1.5 text-ink-subtle hover:text-ink cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><MoreVertical className="w-3.5 h-3.5" /></button>}
                  >
                    <DropdownItem onClick={() => { setFolderDialog({ mode: "edit", id: f.id, name: f.name }); setFolderName(f.name); }}>
                      <Pencil className="w-4 h-4" /> إعادة تسمية
                    </DropdownItem>
                    <DropdownItem onClick={() => handleDeleteFolder(f.id)} destructive>
                      <Trash2 className="w-4 h-4" /> حذف
                    </DropdownItem>
                  </Dropdown>
                </div>
              ))}
              <button
                onClick={() => { setFolderDialog({ mode: "create" }); setFolderName(""); }}
                className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-dashed border-stone-300 text-ink-muted hover:bg-stone-50 cursor-pointer flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" /> مجلد جديد
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <Input placeholder="ابحث في المشاريع..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          {!FEATURE_FLAGS.extraSizes && (
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer"
            >
              <option value="all">كل المقاسات</option>
              <option value="1080x1080">مربع</option>
              <option value="1080x1350">عمودي</option>
              <option value="1080x1920">ستوري</option>
            </select>
          )}
          {!FEATURE_FLAGS.folders && (
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer"
            >
              <option value="all">كل المجلدات</option>
              <option value="none">بدون مجلد</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-ink cursor-pointer"
          >
            <option value="modified">الأخير تعديلًا</option>
            <option value="newest">الأحدث إنشاءً</option>
            <option value="oldest">الأقدم إنشاءً</option>
            <option value="name">الاسم</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <button
            onClick={() => router.push("/projects/new")}
            className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/50 p-8 min-h-[280px] flex flex-col items-center justify-center gap-3 hover:border-accent hover:bg-accent-soft/30 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 text-accent" />
            </div>
            <span className="font-semibold text-ink">مشروع جديد</span>
            <span className="text-sm text-ink-muted">ابدأ من فكرة جديدة</span>
          </button>

          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              folders={folders}
              onOpen={() => router.push(`/projects/${p.id}/edit`)}
              onDuplicate={() => handleDuplicate(p.id)}
              onDelete={() => setDeleteTarget(p.id)}
              onExport={() => router.push(`/projects/${p.id}/export`)}
              onFavorite={() => handleFavorite(p.id)}
              onMove={(folderId) => handleMove(p.id, folderId)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-ink-muted">لا توجد مشاريع بعد</p>
            <Button className="mt-4" onClick={() => router.push("/projects/new")}>
              <Plus className="w-4 h-4" /> أنشئ مشروعك الأول
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف المشروع" description="سيتم حذف المشروع نهائيًا ولا يمكن التراجع عن ذلك.">
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" /> حذف نهائي
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
        </div>
      </Dialog>

      <Dialog open={!!folderDialog} onClose={() => setFolderDialog(null)} title={folderDialog?.mode === "create" ? "مجلد جديد" : "إعادة تسمية المجلد"}>
        <Input
          placeholder="اسم المجلد"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <Button className="flex-1" onClick={handleFolderSubmit}>حفظ</Button>
          <Button variant="outline" className="flex-1" onClick={() => setFolderDialog(null)}>إلغاء</Button>
        </div>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project, folders, onOpen, onDuplicate, onDelete, onExport, onFavorite, onMove }: {
  project: Project;
  folders: { id: string; name: string }[];
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onFavorite: () => void;
  onMove: (folderId: string | null) => void;
}) {
  const coverSlide = project.slides[0];
  const pal = getPalette(project.settings.templateId, project.settings.paletteId);
  const folder = folders.find((f) => f.id === project.folderId);
  const sizeLabel = { "1080x1080": "مربع", "1080x1350": "عمودي", "1080x1920": "ستوري" }[project.settings.size];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-soft group transition-shadow hover:shadow-card">
      <div className="relative bg-stone-50 p-3" onClick={onOpen}>
        <div className="cursor-pointer">
          {coverSlide ? (
            <ScaledSlide
              width={280}
              slide={coverSlide}
              templateId={project.settings.templateId}
              palette={pal}
              font={project.settings.font}
              size={project.settings.size}
              brandKitSettings={project.settings.brandKit}
              brandKitData={{ instagramHandle: "@typo.ai", logoDataUrl: null, primaryColor: DEFAULT_ACCENT_COLOR, font: project.settings.font }}
              medical={{ isMedical: project.isMedical, specialty: project.settings.specialty, source: project.settings.source }}
              index={0}
              total={project.slides.length}
              fontSizeScale={project.settings.fontSizeScale}
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-ink-subtle">
              <FileText className="w-10 h-10" />
            </div>
          )}
        </div>
        {!FEATURE_FLAGS.favorites && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            className={cn("absolute top-4 left-4 p-2 rounded-full bg-white/90 backdrop-blur cursor-pointer transition-colors", project.favorite ? "text-red-500" : "text-ink-subtle hover:text-ink")}
          >
            <Heart className={cn("w-4 h-4", project.favorite && "fill-current")} />
          </button>
        )}
        <div className="absolute top-4 right-4">
          <Dropdown
            trigger={
              <button className="p-2 rounded-full bg-white/90 backdrop-blur cursor-pointer text-ink-muted hover:text-ink">
                <MoreVertical className="w-4 h-4" />
              </button>
            }
          >
            <DropdownItem onClick={onOpen}><FileText className="w-4 h-4" /> فتح المشروع</DropdownItem>
            {!FEATURE_FLAGS.duplicateProject && <DropdownItem onClick={onDuplicate}><Copy className="w-4 h-4" /> تكرار المشروع</DropdownItem>}
            <DropdownItem onClick={onExport}><Download className="w-4 h-4" /> تصدير</DropdownItem>
            {!FEATURE_FLAGS.folders && (
              <>
                <DropdownSeparator />
                <div className="px-3 py-1 text-xs text-ink-subtle">نقل إلى مجلد</div>
                <DropdownItem onClick={() => onMove(null)}><FolderOpen className="w-4 h-4" /> بدون مجلد</DropdownItem>
                {folders.map((f) => (
                  <DropdownItem key={f.id} onClick={() => onMove(f.id)}>
                    <Folder className="w-4 h-4" /> {f.name}
                  </DropdownItem>
                ))}
              </>
            )}
            {!FEATURE_FLAGS.favorites && (
              <>
                <DropdownSeparator />
                <DropdownItem onClick={onFavorite}>
                  <Star className="w-4 h-4" /> {project.favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                </DropdownItem>
              </>
            )}
            <DropdownSeparator />
            <DropdownItem onClick={onDelete} destructive>
              <Trash2 className="w-4 h-4" /> حذف
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="p-4" onClick={onOpen}>
        <h3 className="font-bold text-ink truncate cursor-pointer hover:text-accent transition-colors">{project.title}</h3>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge className="bg-stone-100 text-ink-muted">{project.slides.length} شرائح</Badge>
          <Badge className="bg-stone-100 text-ink-muted">{sizeLabel}</Badge>
          {project.status === "completed" ? (
            <Badge className="bg-green-100 text-green-700">مكتمل</Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700">مسودة</Badge>
          )}
          {project.reviewStatus === "pass" && <Badge className="bg-green-100 text-green-700">مراجعة طبية: مقبول</Badge>}
          {project.reviewStatus === "needs_review" && <Badge className="bg-amber-100 text-amber-700">مراجعة طبية: يحتاج مراجعة</Badge>}
          {project.reviewStatus === "blocked" && <Badge className="bg-red-100 text-red-700">مراجعة طبية: ممنوع</Badge>}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-ink-subtle">
          <span>{relativeTime(project.updatedAt)}</span>
          {!FEATURE_FLAGS.folders && folder && <span className="flex items-center gap-1"><Folder className="w-3 h-3" /> {folder.name}</span>}
        </div>
      </div>
    </div>
  );
}

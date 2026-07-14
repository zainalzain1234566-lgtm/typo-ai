"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  searchPexelsImagesAction,
  selectPexelsImageAction,
  updateSlideImagePositionAction,
  uploadSlideImageAction,
} from "@/app/actions/project-images";
import type { ImageFocalPosition, Slide } from "@/lib/types";
import type { PexelsPhotoOption } from "@/lib/services/pexels";
import { cn } from "@/lib/utils";

const FOCAL_LABELS: Record<ImageFocalPosition, string> = {
  center: "وسط",
  top: "أعلى",
  bottom: "أسفل",
  right: "يمين",
  left: "يسار",
};

async function resizeUpload(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= 2160) { bitmap.close(); return file; }
  const scale = 2160 / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  return blob ? new File([blob], "slide-image.jpg", { type: "image/jpeg" }) : file;
}

export function SlideImageControls({ slide, onChanged }: { slide: Slide; onChanged: () => Promise<void> }) {
  const { toast } = useToast();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(slide.imageQuery || slide.title);
  const [photos, setPhotos] = useState<PexelsPhotoOption[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true);
    const result = await searchPexelsImagesAction(slide.id, query);
    setBusy(false);
    if (!result.success) return toast({ type: "error", title: result.error ?? "تعذر البحث عن الصور" });
    setPhotos(result.photos ?? []);
  };

  const choose = async (photo: PexelsPhotoOption) => {
    setBusy(true);
    const result = await selectPexelsImageAction(slide.id, photo.id, query);
    setBusy(false);
    if (!result.success) return toast({ type: "error", title: result.error ?? "تعذر استبدال الصورة" });
    setSearchOpen(false);
    await onChanged();
    toast({ type: "success", title: "تم استبدال الصورة" });
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const resized = await resizeUpload(file);
      const form = new FormData();
      form.set("slideId", slide.id);
      form.set("file", resized);
      const result = await uploadSlideImageAction(form);
      if (!result.success) toast({ type: "error", title: result.error ?? "تعذر رفع الصورة" });
      else { await onChanged(); toast({ type: "success", title: "تم رفع الصورة" }); }
    } catch {
      toast({ type: "error", title: "تعذر تجهيز الصورة" });
    }
    setBusy(false);
  };

  const setFocal = async (position: ImageFocalPosition) => {
    const result = await updateSlideImagePositionAction(slide.id, position);
    if (!result.success) return toast({ type: "error", title: result.error ?? "تعذر حفظ موضع الصورة" });
    await onChanged();
  };

  return (
    <div className="space-y-3 border-t border-stone-100 pt-4">
      <Label>صورة الشريحة</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setSearchOpen(true)} disabled={busy}>
          <Search className="h-4 w-4" /> استبدال الصورة
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()} disabled={busy}>
          <Upload className="h-4 w-4" /> رفع صورة
        </Button>
      </div>
      <input
        ref={uploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }}
      />

      {slide.imagePath && (
        <div>
          <span className="text-xs text-ink-muted">موضع الصورة</span>
          <div className="mt-1 grid grid-cols-5 gap-1">
            {(Object.keys(FOCAL_LABELS) as ImageFocalPosition[]).map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => void setFocal(position)}
                className={cn("min-h-11 rounded-lg border text-[11px]", (slide.imageFocalPosition ?? "center") === position ? "border-accent bg-accent-soft text-accent" : "border-stone-200 text-ink-muted")}
              >
                {FOCAL_LABELS[position]}
              </button>
            ))}
          </div>
        </div>
      )}

      {slide.imageSource === "pexels" && (
        <p className="text-xs text-ink-muted">
          Photo by{" "}
          <a href={slide.imagePhotographerUrl} target="_blank" rel="noreferrer" className="underline">{slide.imagePhotographer || "Pexels photographer"}</a>
          {" "}on <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a>
        </p>
      )}

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} title="اختيار صورة من Pexels" description="ابحث عن صورة مناسبة لمحتوى الشريحة">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} dir="ltr" aria-label="عبارة البحث عن الصورة" />
            <Button type="button" onClick={() => void search()} disabled={busy || !query.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              بحث
            </Button>
          </div>
          {photos.length > 0 ? (
            <div className="grid max-h-[430px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {photos.map((photo) => (
                <button key={photo.id} type="button" onClick={() => void choose(photo)} disabled={busy} className="overflow-hidden rounded-xl border border-stone-200 text-right hover:border-accent">
                  {/* Remote search previews are transient and intentionally not optimized. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.thumbnailUrl} alt={photo.alt || "صورة من Pexels"} className="aspect-[4/5] w-full object-cover" loading="lazy" decoding="async" />
                  <span className="block truncate p-2 text-xs text-ink-muted">{photo.photographer}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-32 items-center justify-center gap-2 rounded-xl bg-stone-50 text-sm text-ink-muted">
              <ImageIcon className="h-5 w-5" /> اكتب عبارة بحث لعرض الصور
            </div>
          )}
          <p className="text-xs text-ink-muted">Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a></p>
        </div>
      </Dialog>
    </div>
  );
}

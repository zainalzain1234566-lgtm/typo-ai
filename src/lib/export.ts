import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { CarouselSize } from "./types";
import { SIZES } from "./templates";

export async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  await (document as any).fonts?.ready;
  await new Promise((r) => setTimeout(r, 200));
}

export async function exportSlideToPng(element: HTMLElement, size: CarouselSize): Promise<string> {
  await waitForFonts();
  const dims = SIZES.find((s) => s.id === size) ?? SIZES[0];
  return toPng(element, {
    width: dims.w,
    height: dims.h,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: "scale(1)",
      transformOrigin: "top right",
    },
  });
}

export async function downloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function slidesToBlobs(
  slideElements: HTMLElement[],
  size: CarouselSize
): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const el of slideElements) {
    const png = await exportSlideToPng(el, size);
    blobs.push(dataUrlToBlob(png));
  }
  return blobs;
}

export async function exportAllToZip(
  slideElements: HTMLElement[],
  size: CarouselSize
): Promise<void> {
  const zip = new JSZip();
  for (let i = 0; i < slideElements.length; i++) {
    const png = await exportSlideToPng(slideElements[i], size);
    const num = String(i + 1).padStart(2, "0");
    zip.file(`slide-${num}.png`, dataUrlToBlob(png));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "typo-carousel.zip";
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

import type { CarouselSize } from "./types";
import { SIZES } from "./templates";

const EXPORT_IMAGE_ERROR = "تعذر تضمين صورة الشريحة. أعد المحاولة.";
const PROJECT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
let exportQueue: Promise<void> = Promise.resolve();

export function runExportSerially<T>(task: () => Promise<T>): Promise<T> {
  const result = exportQueue.then(task);
  exportQueue = result.then(() => undefined, () => undefined);
  return result;
}

export function calculateCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  objectPosition: string,
) {
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const sw = sourceRatio > targetRatio ? sourceHeight * targetRatio : sourceWidth;
  const sh = sourceRatio > targetRatio ? sourceHeight : sourceWidth / targetRatio;
  const availableX = sourceWidth - sw;
  const availableY = sourceHeight - sh;
  const position = objectPosition.toLowerCase();

  return {
    sx: position.includes("left") ? 0 : position.includes("right") ? availableX : availableX / 2,
    sy: position.includes("top") ? 0 : position.includes("bottom") ? availableY : availableY / 2,
    sw,
    sh,
  };
}

export async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  await (document as any).fonts?.ready;
  await new Promise((r) => setTimeout(r, 200));
}

export async function waitForImages(element: HTMLElement, excludedImage?: HTMLImageElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img")).filter((image) => image !== excludedImage);
  await Promise.all(images.map((image) => {
    if (image.complete) {
      return image.naturalWidth > 0
        ? Promise.resolve()
        : Promise.reject(new Error(EXPORT_IMAGE_ERROR));
    }
    return new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => {
        if (image.naturalWidth > 0) resolve();
        else reject(new Error(EXPORT_IMAGE_ERROR));
      }, { once: true });
      image.addEventListener("error", () => reject(new Error(EXPORT_IMAGE_ERROR)), { once: true });
    });
  }));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const binaryChunks: string[] = [];
  const chunkSize = 8192;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    let chunk = "";
    const end = Math.min(offset + chunkSize, bytes.length);
    for (let index = offset; index < end; index++) {
      chunk += String.fromCharCode(bytes[index]);
    }
    binaryChunks.push(chunk);
  }
  return `data:${blob.type};base64,${btoa(binaryChunks.join(""))}`;
}

async function loadBrowserImage(source: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(EXPORT_IMAGE_ERROR)), { once: true });
    image.src = source;
  });
  if (typeof image.decode === "function") {
    try {
      await image.decode();
    } catch {
      if (image.naturalWidth === 0) throw new Error(EXPORT_IMAGE_ERROR);
    }
  }
  if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error(EXPORT_IMAGE_ERROR);
  return image;
}

async function loadProjectImageBackground(image: HTMLImageElement) {
  const source = image.src || image.currentSrc;
  if (!source) throw new Error(EXPORT_IMAGE_ERROR);

  try {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) throw new Error(EXPORT_IMAGE_ERROR);
    const blob = await response.blob();
    if (blob.size === 0 || !PROJECT_IMAGE_TYPES.has(blob.type)) throw new Error(EXPORT_IMAGE_ERROR);

    const objectUrl = URL.createObjectURL(blob);
    try {
      return { image: await loadBrowserImage(objectUrl), objectUrl };
    } catch {
      URL.revokeObjectURL(objectUrl);
      throw new Error(EXPORT_IMAGE_ERROR);
    }
  } catch {
    throw new Error(EXPORT_IMAGE_ERROR);
  }
}

export async function inlineImagesForExport(element: HTMLElement, excludedImage?: HTMLImageElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img")).filter((image) => image !== excludedImage);
  await Promise.all(images.map(async (image) => {
    const source = image.currentSrc || image.src;
    if (!source || source.startsWith("data:")) return;

    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) throw new Error(EXPORT_IMAGE_ERROR);

      const blob = await response.blob();
      if (blob.size === 0 || !blob.type.startsWith("image/")) {
        throw new Error(EXPORT_IMAGE_ERROR);
      }

      image.srcset = "";
      image.src = await blobToDataUrl(blob);
      if (typeof image.decode === "function") await image.decode();
      if (image.naturalWidth === 0) throw new Error(EXPORT_IMAGE_ERROR);
    } catch {
      throw new Error(EXPORT_IMAGE_ERROR);
    }
  }));
}

export function exportSlideToPng(element: HTMLElement, size: CarouselSize): Promise<string> {
  return runExportSerially(() => captureSlideToPng(element, size));
}

async function captureSlideToPng(element: HTMLElement, size: CarouselSize): Promise<string> {
  const { toPng } = await import("html-to-image");
  await waitForFonts();
  const dims = SIZES.find((s) => s.id === size) ?? SIZES[0];
  const captureOptions = {
    width: dims.w,
    height: dims.h,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: "scale(1)",
      transformOrigin: "top right",
    },
  };
  const projectImage = element.querySelector<HTMLImageElement>("img[data-project-image]");

  if (!projectImage) {
    await inlineImagesForExport(element);
    await waitForImages(element);
    return toPng(element, captureOptions);
  }

  const baseSlide = projectImage.parentElement;
  if (!baseSlide) throw new Error(EXPORT_IMAGE_ERROR);
  const background = await loadProjectImageBackground(projectImage);
  const previousBackgroundColor = baseSlide.style.backgroundColor;

  try {
    await inlineImagesForExport(element, projectImage);
    await waitForImages(element, projectImage);
    baseSlide.style.backgroundColor = "transparent";

    const overlayDataUrl = await toPng(element, {
      ...captureOptions,
      filter: (node) => node !== projectImage,
    });
    const overlayImage = await loadBrowserImage(overlayDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = dims.w * 2;
    canvas.height = dims.h * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(EXPORT_IMAGE_ERROR);

    const crop = calculateCoverCrop(
      background.image.naturalWidth,
      background.image.naturalHeight,
      dims.w,
      dims.h,
      projectImage.style.objectPosition || "center center",
    );
    context.drawImage(background.image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
    context.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    throw new Error(EXPORT_IMAGE_ERROR);
  } finally {
    baseSlide.style.backgroundColor = previousBackgroundColor;
    URL.revokeObjectURL(background.objectUrl);
  }
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
  const { default: JSZip } = await import("jszip");
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

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

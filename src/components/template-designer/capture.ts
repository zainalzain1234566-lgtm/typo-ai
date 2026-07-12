import { toPng } from "html-to-image";
import JSZip from "jszip";
import { dataUrlToBlob } from "@/lib/export";

// Captures a rasterized PNG of a sandboxed preview iframe's own content.
// Unlike the main app's exportSlideToPng (src/lib/export.ts), no
// transform-cancelling is needed here: the iframe's internal document
// renders at true native pixel dimensions regardless of any CSS
// transform: scale() applied to the iframe element's ancestors in the
// parent document (ScaledIsolatedPreview scales the iframe visually,
// it does not shrink what's actually rendered inside it).
//
// OPEN QUESTION, flagged in the implementation plan: html-to-image reads
// computed styles via `window.getComputedStyle` in one internal path
// (clone-node.js) rather than consistently via `node.ownerDocument
// .defaultView`, so whether this produces a correct (non-blank, correct
// font/color) capture across a same-origin sandboxed-iframe document
// boundary needs a real visual check in a browser — this cannot be
// verified without one.
export async function captureIframePng(iframe: HTMLIFrameElement, width: number, height: number): Promise<string> {
  const doc = iframe.contentDocument;
  if (!doc || !doc.body) throw new Error("تعذر الوصول إلى محتوى المعاينة");

  await (doc as any).fonts?.ready;
  await new Promise((r) => setTimeout(r, 200));

  return toPng(doc.body, {
    width,
    height,
    pixelRatio: 2,
    cacheBust: true,
  });
}

// Captures every slide iframe in order and downloads a single zip —
// mirrors the JSZip pattern in src/lib/export.ts's exportAllToZip, adapted
// for sandboxed-iframe capture instead of plain DOM-node capture.
export async function captureAllToZip(
  iframes: (HTMLIFrameElement | null)[],
  width: number,
  height: number,
  zipFilename: string
): Promise<void> {
  const zip = new JSZip();
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    if (!iframe) continue;
    const dataUrl = await captureIframePng(iframe, width, height);
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, dataUrlToBlob(dataUrl));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = zipFilename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

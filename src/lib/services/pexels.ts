const PEXELS_API_ORIGIN = "https://api.pexels.com";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export interface PexelsPhotoOption {
  id: string;
  width: number;
  height: number;
  alt: string;
  thumbnailUrl: string;
  downloadUrl: string;
  sourceUrl: string;
  photographer: string;
  photographerUrl: string;
}

export function buildPexelsSearchUrl(query: string, perPage = 8): string {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 160) throw new Error("INVALID_IMAGE_QUERY");
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 20) throw new Error("INVALID_RESULT_COUNT");
  const url = new URL("/v1/search", PEXELS_API_ORIGIN);
  url.searchParams.set("query", normalized);
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

export function hasSupportedImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mimeType === "image/webp") {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return false;
}

function apiKey(): string {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY_MISSING");
  return key;
}

function parsePhoto(raw: any): PexelsPhotoOption | null {
  const id = String(raw?.id ?? "");
  const downloadUrl = String(raw?.src?.large2x ?? raw?.src?.portrait ?? "");
  const thumbnailUrl = String(raw?.src?.medium ?? raw?.src?.small ?? "");
  if (!/^\d+$/.test(id) || !downloadUrl.startsWith("https://images.pexels.com/") || !thumbnailUrl.startsWith("https://images.pexels.com/")) return null;
  return {
    id,
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    alt: String(raw.alt ?? "").slice(0, 300),
    thumbnailUrl,
    downloadUrl,
    sourceUrl: String(raw.url ?? "").startsWith("https://www.pexels.com/") ? String(raw.url) : "https://www.pexels.com/",
    photographer: String(raw.photographer ?? "").slice(0, 200),
    photographerUrl: String(raw.photographer_url ?? "").startsWith("https://www.pexels.com/") ? String(raw.photographer_url) : "https://www.pexels.com/",
  };
}

async function pexelsRequest(url: string): Promise<any> {
  const response = await fetch(url, { headers: { Authorization: apiKey() }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (response.status === 429) throw new Error("PEXELS_RATE_LIMITED");
  if (!response.ok) throw new Error(`PEXELS_REQUEST_FAILED_${response.status}`);
  return response.json();
}

export async function searchPexelsPhotos(query: string, perPage = 8): Promise<PexelsPhotoOption[]> {
  const data = await pexelsRequest(buildPexelsSearchUrl(query, perPage));
  return (Array.isArray(data?.photos) ? data.photos : []).map(parsePhoto).filter(Boolean) as PexelsPhotoOption[];
}

export async function getPexelsPhoto(photoId: string): Promise<PexelsPhotoOption> {
  if (!/^\d+$/.test(photoId)) throw new Error("INVALID_PEXELS_PHOTO_ID");
  const photo = parsePhoto(await pexelsRequest(`${PEXELS_API_ORIGIN}/v1/photos/${photoId}`));
  if (!photo) throw new Error("INVALID_PEXELS_RESPONSE");
  return photo;
}

export async function downloadPexelsPhoto(photo: PexelsPhotoOption): Promise<{ bytes: Uint8Array; contentType: "image/jpeg" | "image/png" | "image/webp" }> {
  if (!photo.downloadUrl.startsWith("https://images.pexels.com/")) throw new Error("INVALID_PEXELS_IMAGE_URL");
  const response = await fetch(photo.downloadUrl, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`PEXELS_IMAGE_FAILED_${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_IMAGE_BYTES) throw new Error("IMAGE_TOO_LARGE");
  const contentType = response.headers.get("content-type")?.split(";")[0] as "image/jpeg" | "image/png" | "image/webp";
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES || !hasSupportedImageSignature(bytes, contentType)) throw new Error("INVALID_IMAGE_FILE");
  return { bytes, contentType };
}

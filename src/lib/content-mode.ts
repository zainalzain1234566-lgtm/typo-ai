export const CONTENT_MODES = ["general", "medical"] as const;

export type ContentMode = (typeof CONTENT_MODES)[number];

export function contentModeFromValue(value: unknown): ContentMode {
  return value === "medical" ? "medical" : "general";
}

export function defaultTemplateForMode(mode: ContentMode): string {
  return mode === "medical" ? "tahrir" : "shabaka";
}

export function shouldShowMedicalDisclaimer(isMedical: boolean, showDisclaimer: boolean): boolean {
  return isMedical && showDisclaimer;
}

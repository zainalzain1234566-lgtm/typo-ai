export interface TemplateDesignBlocks {
  css: string;
  htmlCover: string;
  htmlContent: string;
  htmlEnding: string;
}

export interface TemplateQualitySettings {
  width: number;
  height: number;
  showAccountName: boolean;
  showLogo: boolean;
  showSlideNumbers: boolean;
}

export type TemplateQualityCode =
  | "EMPTY_CSS"
  | "EMPTY_LAYOUT"
  | "MISSING_SLIDE_RULE"
  | "INVALID_DIMENSIONS"
  | "MISSING_POSITIONING"
  | "MISSING_OVERFLOW"
  | "MISSING_RTL_ROOT"
  | "MISSING_TOKEN"
  | "UNKNOWN_TOKEN";

export interface TemplateQualityIssue {
  code: TemplateQualityCode;
  message: string;
}

const ALLOWED_TOKENS = new Set([
  "title", "body", "slideNumber", "totalSlides", "accountName", "logoUrl", "ctaText",
]);

function hasDeclaration(rule: string, property: string, value: string): boolean {
  return new RegExp(`${property}\\s*:\\s*${value}\\s*(?:;|$)`, "i").test(rule);
}

export function validateTemplateQuality(
  design: TemplateDesignBlocks,
  settings: TemplateQualitySettings
): TemplateQualityIssue[] {
  const issues: TemplateQualityIssue[] = [];
  const css = design.css.trim();
  if (!css) issues.push({ code: "EMPTY_CSS", message: "Shared CSS must not be empty." });

  const slideRule = css.match(/\.slide\s*\{([\s\S]*?)\}/i)?.[1];
  if (!slideRule) {
    issues.push({ code: "MISSING_SLIDE_RULE", message: "Shared CSS must define a .slide rule." });
  } else {
    if (!hasDeclaration(slideRule, "width", `${settings.width}px`) || !hasDeclaration(slideRule, "height", `${settings.height}px`)) {
      issues.push({ code: "INVALID_DIMENSIONS", message: `The .slide rule must be exactly ${settings.width}x${settings.height}px.` });
    }
    if (!hasDeclaration(slideRule, "position", "relative")) {
      issues.push({ code: "MISSING_POSITIONING", message: "The .slide rule must use position: relative." });
    }
    if (!hasDeclaration(slideRule, "overflow", "hidden")) {
      issues.push({ code: "MISSING_OVERFLOW", message: "The .slide rule must use overflow: hidden." });
    }
  }

  const layouts = [
    ["cover", design.htmlCover, ["title", "body"]],
    ["content", design.htmlContent, ["title", "body"]],
    ["ending", design.htmlEnding, ["title", "body", "ctaText"]],
  ] as const;
  const sharedRequired = [
    ...(settings.showAccountName ? ["accountName"] : []),
    ...(settings.showLogo ? ["logoUrl"] : []),
    ...(settings.showSlideNumbers ? ["slideNumber", "totalSlides"] : []),
  ];

  for (const [name, html, layoutRequired] of layouts) {
    if (!html.trim()) {
      issues.push({ code: "EMPTY_LAYOUT", message: `The ${name} layout must not be empty.` });
      continue;
    }
    const rootAttributes = html.match(/^\s*<div\b([^>]*)>/i)?.[1] ?? "";
    const className = rootAttributes.match(/class\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const direction = rootAttributes.match(/dir\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (!className.split(/\s+/).includes("slide") || direction.toLowerCase() !== "rtl") {
      issues.push({ code: "MISSING_RTL_ROOT", message: `The ${name} layout must start with <div class="slide" dir="rtl">.` });
    }

    for (const token of Array.from(html.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g), (match) => match[1])) {
      if (!ALLOWED_TOKENS.has(token)) {
        issues.push({ code: "UNKNOWN_TOKEN", message: `The ${name} layout uses unknown token {{${token}}}.` });
      }
    }
    for (const token of [...layoutRequired, ...sharedRequired]) {
      if (!html.includes(`{{${token}}}`)) {
        issues.push({ code: "MISSING_TOKEN", message: `The ${name} layout must include {{${token}}}.` });
      }
    }
  }

  return issues;
}

export function buildTemplateRepairRequest(issues: TemplateQualityIssue[]): string {
  const list = issues.map((issue) => `- ${issue.code}: ${issue.message}`).join("\n");
  return `Repair only these template quality problems:\n${list}\nReturn the full updated design in the required fenced-block format and preserve everything else.`;
}

export class TemplateQualityError extends Error {
  constructor(public readonly issues: TemplateQualityIssue[]) {
    super(`Template quality validation failed: ${issues.map((issue) => issue.code).join(", ")}`);
    this.name = "TemplateQualityError";
  }
}

export async function repairTemplateOnce<T extends TemplateDesignBlocks>(
  design: T,
  settings: TemplateQualitySettings,
  repair: (request: string) => Promise<T>
): Promise<{ design: T; repaired: boolean }> {
  const issues = validateTemplateQuality(design, settings);
  if (issues.length === 0) return { design, repaired: false };

  const repaired = await repair(buildTemplateRepairRequest(issues));
  const remaining = validateTemplateQuality(repaired, settings);
  if (remaining.length > 0) throw new TemplateQualityError(remaining);
  return { design: repaired, repaired: true };
}

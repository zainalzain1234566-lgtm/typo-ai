import sanitizeHtml from "sanitize-html";

// This is the real security boundary for AI-generated template HTML/CSS —
// applied server-side immediately after every generate/edit call, before
// the content is ever returned to the client or written to the DB. The
// iframe sandbox in isolated-preview.tsx is defense in depth on top of
// this, not the primary control, since the AI can hallucinate or be
// prompt-injected into emitting disallowed markup despite instructions.
export function sanitizeTemplateHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "strong", "em", "b", "i", "br", "hr", "img",
    ],
    allowedAttributes: {
      "*": ["class", "id", "style", "dir", "data-token"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["data", "https"],
    disallowedTagsMode: "discard",
    exclusiveFilter: (frame) =>
      ["script", "iframe", "embed", "object", "link", "meta", "form", "input", "button", "svg", "foreignobject", "style"].includes(frame.tag),
    transformTags: {
      "*": (tagName, attribs) => {
        for (const key of Object.keys(attribs)) {
          if (key.toLowerCase().startsWith("on")) delete attribs[key];
        }
        return { tagName, attribs };
      },
    },
  });
}

export function sanitizeTemplateCss(css: string): string {
  return css
    .replace(/@import[^;]*;/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/url\s*\(\s*['"]?\s*javascript:[^)]*\)/gi, "")
    .replace(/<\/?script[^>]*>/gi, "");
}

// Closed token set — plain string substitution, not a template engine.
// No loops/conditionals means no injection surface beyond the values
// themselves, which substituteTokens() HTML-escapes below.
export const TEMPLATE_TOKENS = [
  "title", "body", "slideNumber", "totalSlides", "accountName", "logoUrl", "ctaText",
] as const;
export type TemplateToken = (typeof TEMPLATE_TOKENS)[number];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function substituteTokens(html: string, values: Partial<Record<TemplateToken, string>>): string {
  let out = html;
  for (const token of TEMPLATE_TOKENS) {
    const value = escapeHtml(values[token] ?? "");
    out = out.split(`{{${token}}}`).join(value);
  }
  return out;
}

const FONT_STYLESHEET_URL =
  "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Cairo:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap";

// Wraps html+css for rendering inside a sandboxed iframe (see
// components/template-designer/isolated-preview.tsx). Callers must pass
// ALREADY-sanitized content — sanitizeTemplateHtml/sanitizeTemplateCss run
// once server-side, in the generate/edit/save actions, before content
// ever reaches the client; this function does not re-sanitize (kept pure
// string assembly so it's safe to call from client components without
// pulling the server-oriented sanitize-html parser into the browser
// bundle). The iframe is a separate Document with no access to the parent
// app's next/font CSS variables (those are self-hosted under Next's build
// output, nothing is vendored to public/), so fonts are loaded
// independently here via the standard Google Fonts CSS2 link — a
// sandboxed iframe without allow-scripts can still fetch external
// stylesheets/fonts, since sandbox restricts script execution/navigation/
// forms, not resource loading.
export function buildSrcDoc(html: string, css: string, width: number, height: number): string {
  return `<!doctype html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${FONT_STYLESHEET_URL}" />
<style>
  :root {
    --font-tajawal: 'Tajawal', sans-serif;
    --font-cairo: 'Cairo', sans-serif;
    --font-ibm: 'IBM Plex Sans Arabic', sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; }
  ${css}
</style>
</head>
<body>
${html}
</body>
</html>`;
}

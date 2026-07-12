import { AI_DEFAULT_BASE_URL, AI_DEFAULT_MODEL, APP_NAME } from "@/lib/constants";
import { logError } from "@/lib/logger";
import {
  CANVAS_SIZE_DIMENSIONS,
  TEMPLATE_FONT_NAMES,
  type CustomTemplateSettings,
} from "@/lib/validation/custom-templates";

export interface GenerationInput {
  topic: string;
  contentType: string;
  targetAudience: string;
  level: string;
  tone: string;
  language: string;
  slideCount: number;
  ctaType: string | null;
  isMedical: boolean;
}

export interface GeneratedSlide {
  slide_type: "cover" | "content" | "summary" | "cta";
  title: string;
  body: string;
  cta_text?: string | null;
}

export interface GeneratedCarousel {
  slides: GeneratedSlide[];
  caption: string;
  hashtags: string[];
  usage?: ProviderUsage;
}

export interface ProviderUsage {
  requestId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costMicroUsd: number | null;
}

export class GenerationError extends Error {
  constructor(message: string, public readonly usage?: ProviderUsage) {
    super(message);
    this.name = "GenerationError";
  }
}

export interface GenerationProvider {
  generate(input: GenerationInput): Promise<GeneratedCarousel>;
}

// ============= Shared chat-completion fetch =============
// Single place for the fetch + header-building + non-OK-handling logic
// that was previously duplicated between ExternalAIProvider.generate and
// reviewMedicalContent. Used by both existing carousel-copy generation
// and the newer template-designer generate/edit calls.

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

async function callChatCompletion(
  apiKey: string,
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  opts: ChatCompletionOptions = {}
): Promise<{ content: string; usage: ProviderUsage }> {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4000,
  };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (baseUrl.includes("openrouter")) {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    headers["X-Title"] = APP_NAME;
    // Ask OpenRouter to route to the fastest backend for this model instead
    // of its default price-weighted selection — direct lever for latency.
    body.provider = { sort: "throughput" };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI provider ${response.status}: ${errText.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;
  const usage: ProviderUsage = {
    requestId: String(data.id ?? ""),
    model: String(data.model ?? model),
    promptTokens: Number(data.usage?.prompt_tokens ?? 0),
    completionTokens: Number(data.usage?.completion_tokens ?? 0),
    costMicroUsd: typeof data.usage?.cost === "number" && Number.isFinite(data.usage.cost)
      ? Math.round(data.usage.cost * 1_000_000)
      : null,
  };
  if (!content) {
    if (finishReason === "length") {
      throw new GenerationError(`AI response truncated before any content was emitted (hit max_tokens=${opts.maxTokens ?? 4000}) — the model likely spent its whole budget on internal reasoning tokens. Retry with a higher max_tokens.`, usage);
    }
    throw new GenerationError(`Empty AI response: ${JSON.stringify(data).slice(0, 300)}`, usage);
  }
  return { content, usage };
}

// ============= External AI Provider =============

export class ExternalAIProvider implements GenerationProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(modelOverride?: string) {
    this.apiKey = process.env.AI_API_KEY!;
    this.baseUrl = process.env.AI_BASE_URL || AI_DEFAULT_BASE_URL;
    this.model = modelOverride || process.env.AI_MODEL || AI_DEFAULT_MODEL;
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL) {
      logError("PROJECT", "NEXT_PUBLIC_APP_URL is not set in production — OpenRouter HTTP-Referer will fall back to localhost");
    }
  }

  async generate(input: GenerationInput): Promise<GeneratedCarousel> {
    const prompt = buildPrompt(input);
    const isJsonSupported = !this.baseUrl.includes("openrouter") || this.model.includes("gpt-4") || this.model.includes("claude");

    const systemPrompt = input.isMedical ? MEDICAL_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT;
    const messages: ChatMessage[] = [
      { role: "system", content: isJsonSupported ? systemPrompt : `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no code fences.` },
      { role: "user", content: prompt },
    ];

    const completion = await callChatCompletion(this.apiKey, this.baseUrl, this.model, messages, {
      maxTokens: 4000,
      jsonMode: isJsonSupported,
    });

    try {
      const parsed = JSON.parse(extractJSON(completion.content));
      return { ...validateAIResponse(parsed), usage: completion.usage };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GenerationError(`Invalid carousel response: ${message}\nContent preview: ${completion.content.slice(0, 500)}`, completion.usage);
    }
  }
}

// ============= Factory =============

export function getGenerationProvider(modelOverride?: string): GenerationProvider {
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is not set. Add it to .env.local");
  }
  return new ExternalAIProvider(modelOverride);
}

function getAIConfig(modelOverride?: string) {
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is not set. Add it to .env.local");
  }
  return {
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL || AI_DEFAULT_BASE_URL,
    model: modelOverride || process.env.AI_MODEL || AI_DEFAULT_MODEL,
  };
}

// ============= Validation =============

function extractJSON(content: string): string {
  const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return cleaned;

  // Balanced-brace scan for the first complete top-level object, skipping
  // braces inside string literals. Some models (e.g. mimo-v2.5) append
  // trailing prose after valid JSON despite "return JSON only" — naive
  // first-to-last-brace slicing swallows that trailing text and breaks
  // JSON.parse with "Unexpected non-whitespace character after JSON".
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(firstBrace, i + 1);
    }
  }
  // Unbalanced (truncated response) — fall back to old behavior rather than nothing.
  const lastBrace = cleaned.lastIndexOf("}");
  return lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
}

function validateAIResponse(raw: any): GeneratedCarousel {
  if (!raw.slides || !Array.isArray(raw.slides)) throw new Error("Invalid AI response: missing slides");

  const slides: GeneratedSlide[] = raw.slides.map((s: any, _i: number) => ({
    slide_type: ["cover", "content", "summary", "cta"].includes(s.slide_type) ? s.slide_type : "content",
    title: String(s.title || "").slice(0, 300),
    body: String(s.body || "").slice(0, 2000),
    cta_text: s.cta_text ? String(s.cta_text).slice(0, 200) : null,
  }));

  return {
    slides,
    caption: String(raw.caption || "").slice(0, 2000),
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map((h: any) => String(h)).slice(0, 30) : [],
  };
}

const MEDICAL_SYSTEM_PROMPT = `أنت كاتب محتوى طبي محترف متخصص في كاروسيلات إنستغرام باللغة العربية.
مهمتك: إنشاء محتوى كاروسيل طبي جذاب ومتناسق بناءً على المواصفات المحددة.

قواعد صارمة:
1. اكتب كل المحتوى (العناوين، النصوص، الـ caption، الـ hashtags) باللهجة أو اللغة المحددة فقط. لا تخلط بين اللهجات.
2. إذا كانت اللغة "العربية الفصحى" استخدم العربية الفصحى. إذا كانت "اللهجة المصرية" اكتب بلهجة مصرية. إذا كانت "اللهجة العراقية" اكتب بلهجة عراقية. وهكذا.
3. التزم بنوع المحتوى المحدد في بنية الشرائح وطريقة عرض المعلومات.
4. التزم بالنبرة المحددة في كل النصوص.
5. كل شريحة يجب أن يكون لها عنوان قصير وجذاب ونص واضح.
6. الشريحة الأولى غلاف (cover): عنوان رئيسي لافت + جملة تشويقية.
7. الشريحة الأخيرة ملخص (summary) أو دعوة لاتخاذ إجراء (cta).

قواعد طبية صارمة:
8. لا تذكر جرعات أدوية محددة. اكتب "استشر طبيبك لتحديد الجرعة المناسبة".
9. لا تنصح بتشخيص حالة. اكتب "قد تكون هذه الأعراض دليلًا على..." بدل "أنت مصاب بـ".
10. تجنب اللغة المطلقة. استخدم "قد يساعد" بدل "يعالج"، و"يُنصح بـ" بدل "يجب".
11. أضف تنبيهًا في الشريحة الأخيرة: "هذا المحتوى للتوعية فقط ولا يغني عن استشارة الطبيب".

أرجع JSON فقط بالصيغة التالية:
{
  "slides": [
    { "slide_type": "cover|content|summary|cta", "title": "...", "body": "...", "cta_text": "..." }
  ],
  "caption": "...",
  "hashtags": ["...", "..."]
}`;

const GENERAL_SYSTEM_PROMPT = `أنت كاتب محتوى محترف متخصص في كاروسيلات إنستغرام باللغة العربية.
مهمتك: إنشاء محتوى جذاب ومتناسق بناءً على المواصفات المحددة.

قواعد صارمة:
1. اكتب كل المحتوى (العناوين، النصوص، الـ caption، الـ hashtags) باللغة أو اللهجة المحددة فقط.
2. التزم بنوع المحتوى والنبرة والجمهور المحدد.
3. كل شريحة يجب أن يكون لها عنوان قصير وجذاب ونص واضح.
4. الشريحة الأولى غلاف (cover)، والأخيرة ملخص (summary) أو دعوة لاتخاذ إجراء (cta).

أرجع JSON فقط بالصيغة التالية:
{
  "slides": [
    { "slide_type": "cover|content|summary|cta", "title": "...", "body": "...", "cta_text": "..." }
  ],
  "caption": "...",
  "hashtags": ["...", "..."]
}`;

const CONTENT_TYPE_INSTRUCTIONS: Record<string, string> = {
  "تعليمي": "نوع المحتوى: تعليمي. ابدأ بفكرة بسيطة ثم اشرح تدريجيًا. كل شريحة تبني على ما قبلها. استخدم أمثلة توضيحية ملموسة.",
  "قصة": "نوع المحتوى: قصة. ابنِ سردًا قصصيًا: تمهيد → صراع → حل. كل شريحة جزء من القصة. اجعل القارئ يريد التمرير للشريحة التالية.",
  "توعوي": "نوع المحتوى: توعوي. ابدأ بحقيقة أو إحصائية لافتة. اشرح الآثار والمخاطر. اختم بدعوة للتوعية أو تغيير سلوك.",
  "قائمة": "نوع المحتوى: قائمة. كل شريحة = عنصر واحد مرقم في القائمة. عنوان العنصر في الأعلى والشرح تحته. اجعل العناصر قصيرة ومباشرة.",
  "خطوات": "نوع المحتوى: خطوات. كل شريحة = خطوة واحدة بالترتيب. رقم الخطوة واضح. ابدأ بالخطوة الأولى وانتهق بالأخيرة.",
  "نصائح": "نوع المحتوى: نصائح. كل شريحة = نصيحة واحدة عملية وقابلة للتطبيق. اجعل النصيحة محددة وليست عامة.",
  "مقارنة": "نوع المحتوى: مقارنة. قارن بين شيئين أو أكثر. كل شريحة تقارن جانبًا محددًا (مثلاً: السعر، المميزات، العيوب). اذكر الطرفين في كل شريحة بشكل واضح.",
  "شرح مفهوم": "نوع المحتوى: شرح مفهوم. عرّف المفهوم → اشرحه بمثال بسيط → طبّقه على حالة واقعية. اجعل المفهوم المعقد سهل الفهم.",
  "تفكيك الخرافات": "نوع المحتوى: تفكيك الخرافات. كل شريحة تعالج خرافة طبية شائعة وتصححها بالحقيقة العلمية. ابدأ بالخرافة ثم اذكر الحقيقة. استخدم مصادر موثوقة (WHO, CDC, Mayo Clinic). تجنب الجزم المطلق واذكر المصادر عند الإمكان.",
  "شرح مرض": "نوع المحتوى: شرح مرض. ابدأ بتعريف المرض → أعراضه الشائعة → أسبابه → طرق الوقاية/العلاج. اجعل المعلومات دقيقة طبيًا. تجنب ذكر جرعات أدوية محددة. أضف تنبيهًا بضرورة استشارة الطبيب.",
};

function buildPrompt(input: GenerationInput): string {
  const contentInstr = CONTENT_TYPE_INSTRUCTIONS[input.contentType] || `نوع المحتوى: ${input.contentType}. التزم بطريقة عرض مناسبة لهذا النوع.`;
  const audienceLine = input.targetAudience
    ? `الجمهور المستهدف: ${input.targetAudience}`
    : "";
  const levelLine = `المستوى: ${input.level}`;
  const toneLine = `النبرة: ${input.tone}. التزم بهذه النبرة في كل النصوص.`;
  const langLine = `اللغة/اللهجة: ${input.language}. اكتب كل المحتوى بهذه اللهجة/اللغة فقط.`;
  const ctaLine = input.ctaType && input.ctaType !== "بدون CTA"
    ? `دعوة الإجراء: ${input.ctaType}. ضعها في الشريحة الأخيرة.`
    : "دعوة الإجراء: بدون. الشريحة الأخيرة تكون ملخص (summary).";

  return `أنشئ كاروسيل إنستغرام عن: "${input.topic}"

${contentInstr}
${audienceLine}
${levelLine}
${toneLine}
${langLine}
عدد الشرائح: ${input.slideCount}
${ctaLine}

أرجع JSON فقط بدون أي نص إضافي.`;
}

export const PROGRESS_MESSAGES = [
  "نحلل الموضوع", "نكتب هيكل المحتوى", "نرتب الشرائح", "ندقق النص", "نراجع طبيًا", "نجهز المحتوى للمعاينة",
];

// AI Template Designer: content + design are generated in parallel, so the
// messaging reflects both rather than the medical-review-specific steps above.
export const DESIGNER_PROGRESS_MESSAGES = [
  "نحلل الموضوع", "نكتب محتوى الشرائح", "نصمم الهوية البصرية", "نبني تخطيط الشرائح", "نراجع التناسق", "نجهز المعاينة",
];

// ============= Medical Accuracy Pass =============

export interface MedicalReviewResult {
  verdict: "pass" | "needs_review" | "blocked";
  flags: MedicalFlag[];
  summary: string;
}

export interface MedicalFlag {
  slideIndex: number;
  type: "diagnostic_claim" | "drug_dosage" | "cure_claim" | "absolute_language" | "unsafe_advice";
  originalText: string;
  reason: string;
  suggestion?: string;
}

const MEDICAL_REVIEW_PROMPT = `أنت مراجع طبي محترف. مهمتك فحص محتوى كاروسيل طبي للتأكد من سلامته قبل النشر.

قواعد الفحص:
1. ادعاءات تشخيصية: أي عبارة تنصح بتشخيص حالة ("يعني أنك مصاب بـ") → علّم كـ diagnostic_claim
2. جرعات أدوية: أي ذكر لجرعة محددة ("خذ 500mg") → علّم كـ drug_dosage
3. ادعاءات شفاء مطلقة: "يعالج"، "يشفي"، "يقضي على" → علّم كـ cure_claim، واقترح "قد يساعد في"
4. لغة مطلقة: "يجب"، "لا بد"، "لن يحدث أبدًا" → علّم كـ absolute_language
5. نصائح غير آمنة: أي نصيحة قد تضر المريض → علّم كـ unsafe_advice

أرجع JSON فقط:
{
  "verdict": "pass" | "needs_review" | "blocked",
  "flags": [
    { "slideIndex": 0, "type": "...", "originalText": "...", "reason": "...", "suggestion": "..." }
  ],
  "summary": "ملخص قصير بالعربية"
}

- "pass": لا توجد مشاكل
- "needs_review": توجد ادعاءات تحتاج تعديل لكنها ليست خطرة
- "blocked": توجد معلومات خطرة (جرعات، تشخيص، نصائح غير آمنة)`;

export async function reviewMedicalContent(
  slides: GeneratedSlide[],
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<MedicalReviewResult> {
  const content = slides
    .map((s, i) => `شريحة ${i + 1} (${s.slide_type}):\nالعنوان: ${s.title}\nالنص: ${s.body}${s.cta_text ? `\nCTA: ${s.cta_text}` : ""}`)
    .join("\n\n");

  const completion = await callChatCompletion(
    apiKey,
    baseUrl,
    model,
    [
      { role: "system", content: MEDICAL_REVIEW_PROMPT },
      { role: "user", content: `افحص هذا المحتوى الطبي:\n\n${content}` },
    ],
    { temperature: 0.3, maxTokens: 2000 }
  );

  const jsonStr = extractJSON(completion.content);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { verdict: "needs_review", flags: [], summary: "تعذر فحص المحتوى طبيًا — يُنصح بالمراجعة اليدوية" };
  }

  return {
    verdict: ["pass", "needs_review", "blocked"].includes(parsed.verdict) ? parsed.verdict : "needs_review",
    flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 20) : [],
    summary: String(parsed.summary || "").slice(0, 500),
  };
}

// ============= AI Template Designer =============
// Generates/edits a 3-layout (cover/content/ending) HTML+CSS template
// system. Output is NOT JSON — several KB of HTML/CSS escaped as a JSON
// string value is fragile (unescaped newlines/quotes break JSON.parse),
// so this uses a labeled fenced-code-block contract instead, parsed by
// extractTemplateBlocks() below. Raw output is untrusted until it passes
// through sanitizeTemplateHtml/sanitizeTemplateCss (template-sandbox.ts)
// in the calling server action — this module only generates, it does not
// sanitize or persist.

interface TemplateBlocks {
  css: string;
  htmlCover: string;
  htmlContent: string;
  htmlEnding: string;
  aiMessage: string;
}

export interface TemplateGenerationResult extends TemplateBlocks {
  usage: ProviderUsage;
}

const TEMPLATE_FORMAT_SPEC = `OUTPUT FORMAT — follow exactly, nothing else in your response:
\`\`\`css
(shared CSS for all three layouts — one visual identity)
\`\`\`
\`\`\`html:cover
(HTML for the cover/opening slide)
\`\`\`
\`\`\`html:content
(HTML for a middle/content slide — this ONE markup is reused for every
 content slide in the carousel; do not hardcode slide-specific text)
\`\`\`
\`\`\`html:ending
(HTML for the closing/CTA slide)
\`\`\`
\`\`\`meta
{"ai_message": "<one short Arabic sentence describing the design>"}
\`\`\`

HARD CONSTRAINTS:
1. Output ONLY HTML and CSS. NEVER output <script>, on*="" event handler
   attributes, javascript: URLs, <iframe>, <embed>, <object>, <form>,
   <link rel="import">, or any CSS @import/expression()/url(javascript:).
   Any such output will be stripped server-side and breaks the design —
   do not rely on it.
2. All three HTML fragments share the same CSS and must look like one
   coherent visual system (same color palette, same font, same shape
   language/corner radii/spacing rhythm) — vary composition, not identity.
3. Every fragment is a root <div class="slide"> sized exactly {{WIDTH}}x{{HEIGHT}}px
   via CSS. Do not use viewport units (vw/vh).
4. Text direction: the root slide div must have dir="rtl" and all text
   right-aligned (text-align: right) unless a specific element is
   deliberately centered for design reasons.
5. Font: reference exactly one of these CSS variable names (already
   declared in the preview shell): var(--font-tajawal), var(--font-cairo),
   var(--font-ibm). {{FONT_INSTRUCTION}}
6. Use ONLY these placeholder tokens, written literally with double curly
   braces, wherever dynamic content belongs — do not invent new token
   names:
   {{title}}       — slide headline
   {{body}}        — slide body text (may contain line breaks)
   {{slideNumber}} — current slide number, e.g. "3"
   {{totalSlides}} — total slide count, e.g. "8"
   {{accountName}} — Instagram handle, e.g. "@clinic.name"
   {{logoUrl}}     — logo image URL for an <img src="{{logoUrl}}">
   {{ctaText}}     — call-to-action text (ending layout only)
   The cover layout should use {{title}} + optionally {{body}} as a
   subtitle. The content layout must use {{title}} + {{body}}. The ending
   layout should use {{title}}/{{body}} for closing message + {{ctaText}}.
   Place {{accountName}}/{{logoUrl}} only if the settings below say to
   show them. Place {{slideNumber}}/{{totalSlides}} only if slide numbers
   should show.
7. No absolute/fixed positioning that could escape the {{WIDTH}}x{{HEIGHT}}px
   container. No external resource links except the font variables above.`;

// Colors/font/visualStyle/textDensity are optional "let the AI decide"
// inputs — only topic/slideCount/size are treated as firm requirements.
// An empty instruction slot tends to make models default to a bland/safe
// look, so absence is spelled out as explicit creative permission rather
// than just omitting the line.
function buildDesignBrief(settings: CustomTemplateSettings): string {
  const dims = CANVAS_SIZE_DIMENSIONS[settings.size];
  const lines = [
    `DESIGN BRIEF (from user settings):`,
    `- Topic: ${settings.topic}`,
    `- Slide count: ${settings.slideCount} slides`,
    `- Canvas size: ${dims.label} (${dims.width}x${dims.height}px)`,
  ];

  if (settings.colors.length > 0) {
    lines.push(`- Color direction: ${settings.colors.join(", ")}`);
  } else {
    lines.push(`- Colors: not specified — choose a cohesive palette yourself that fits the topic. Avoid a generic/safe default; make a deliberate choice.`);
  }

  if (settings.visualStyle) {
    lines.push(`- Visual style: ${settings.visualStyle}`);
  } else {
    lines.push(`- Visual style: not specified — use your own creative judgment for layout, shapes, and decorative language. Be distinctive, not generic.`);
  }

  if (settings.fontFamily) {
    lines.push(`- Font: ${TEMPLATE_FONT_NAMES[settings.fontFamily]}, CSS variable: var(--font-${settings.fontFamily})`);
  } else {
    lines.push(`- Font: not specified — pick whichever of Tajawal/Cairo/IBM Plex Sans Arabic fits the design best.`);
  }
  if (settings.fontSizePreference) lines.push(`- Font size preference: ${settings.fontSizePreference}`);
  if (settings.textDensity) lines.push(`- Text density: ${settings.textDensity}`);

  lines.push(`- Show account name: ${settings.showAccountName}`);
  lines.push(`- Show logo: ${settings.showLogo}`);
  lines.push(`- Show slide numbers: ${settings.showSlideNumbers}`);

  return lines.join("\n");
}

function fontInstruction(settings: CustomTemplateSettings): string {
  return settings.fontFamily
    ? `Use: var(--font-${settings.fontFamily}).`
    : `No font was specified — choose whichever of the three fits the design best.`;
}

function generateSystemPrompt(settings: CustomTemplateSettings): string {
  const dims = CANVAS_SIZE_DIMENSIONS[settings.size];
  return `You are an expert UI/visual designer generating a complete, self-contained
Instagram-carousel template SYSTEM in HTML + CSS for an Arabic-language app.

${TEMPLATE_FORMAT_SPEC.replace(/{{WIDTH}}/g, String(dims.width)).replace(/{{HEIGHT}}/g, String(dims.height)).replace(/{{FONT_INSTRUCTION}}/g, fontInstruction(settings))}

Also incorporate any free-text design direction from the user's message below.`;
}

function editSystemPrompt(settings: CustomTemplateSettings, current: { css: string; htmlCover: string; htmlContent: string; htmlEnding: string }): string {
  const dims = CANVAS_SIZE_DIMENSIONS[settings.size];
  return `You are editing an EXISTING Instagram-carousel template system. The user
will describe a change in natural language. Apply ONLY that change and
preserve everything else about the current design — same overall visual
identity, same layout structure, same tokens — unless the user explicitly
asks for a full redesign.

Return the FULL updated design in the exact same fenced-block format as
generation (see format spec below). Do not return partial snippets, diffs,
or omit unchanged layouts.

${TEMPLATE_FORMAT_SPEC.replace(/{{WIDTH}}/g, String(dims.width)).replace(/{{HEIGHT}}/g, String(dims.height)).replace(/{{FONT_INSTRUCTION}}/g, fontInstruction(settings))}

CURRENT DESIGN:
\`\`\`css
${current.css}
\`\`\`
\`\`\`html:cover
${current.htmlCover}
\`\`\`
\`\`\`html:content
${current.htmlContent}
\`\`\`
\`\`\`html:ending
${current.htmlEnding}
\`\`\`

Respond with the updated design in the required format, plus a one-sentence
Arabic ai_message describing what you changed (e.g. "كبّرت حجم العنوان في كل الشرائح").`;
}

function extractFencedBlock(content: string, label: string): string {
  // Allow optional whitespace between the backticks and the label — some
  // models (e.g. minimax-m3) emit "``` css" instead of "```css" despite
  // the format spec showing no gap.
  const re = new RegExp("```\\s*" + label + "\\s*\\r?\\n([\\s\\S]*?)```", "i");
  const match = content.match(re);
  if (!match) {
    throw new Error(`Template response missing required "${label}" block. Response preview: ${content.slice(0, 400)}`);
  }
  return match[1].trim();
}

function extractTemplateBlocks(content: string): TemplateBlocks {
  const css = extractFencedBlock(content, "css");
  const htmlCover = extractFencedBlock(content, "html:cover");
  const htmlContent = extractFencedBlock(content, "html:content");
  const htmlEnding = extractFencedBlock(content, "html:ending");

  let aiMessage = "";
  try {
    const metaRaw = extractFencedBlock(content, "meta");
    const meta = JSON.parse(metaRaw);
    aiMessage = String(meta.ai_message || "");
  } catch {
    aiMessage = "";
  }

  return { css, htmlCover, htmlContent, htmlEnding, aiMessage };
}

export async function generateTemplateSystem(settings: CustomTemplateSettings, message: string, modelOverride?: string): Promise<TemplateGenerationResult> {
  const { apiKey, baseUrl, model } = getAIConfig(modelOverride);
  const prompt = message ? `${buildDesignBrief(settings)}\n\nUser's design brief: "${message}"` : buildDesignBrief(settings);

  const completion = await callChatCompletion(
    apiKey,
    baseUrl,
    model,
    [
      { role: "system", content: generateSystemPrompt(settings) },
      { role: "user", content: prompt },
    ],
    { temperature: 0.8, maxTokens: 50000 }
  );

  try {
    return { ...extractTemplateBlocks(completion.content), usage: completion.usage };
  } catch (error) {
    throw new GenerationError(error instanceof Error ? error.message : String(error), completion.usage);
  }
}

export async function editTemplateSystem(
  settings: CustomTemplateSettings,
  message: string,
  current: { css: string; htmlCover: string; htmlContent: string; htmlEnding: string },
  modelOverride?: string
): Promise<TemplateGenerationResult> {
  const { apiKey, baseUrl, model } = getAIConfig(modelOverride);

  const completion = await callChatCompletion(
    apiKey,
    baseUrl,
    model,
    [
      { role: "system", content: editSystemPrompt(settings, current) },
      { role: "user", content: `USER'S REQUESTED EDIT: "${message}"` },
    ],
    { temperature: 0.7, maxTokens: 50000 }
  );

  try {
    return { ...extractTemplateBlocks(completion.content), usage: completion.usage };
  } catch (error) {
    throw new GenerationError(error instanceof Error ? error.message : String(error), completion.usage);
  }
}

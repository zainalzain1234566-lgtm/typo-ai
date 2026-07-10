export interface GenerationInput {
  topic: string;
  contentType: string;
  targetAudience: string;
  level: string;
  tone: string;
  language: string;
  slideCount: number;
  ctaType: string | null;
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
}

export interface GenerationProvider {
  generate(input: GenerationInput): Promise<GeneratedCarousel>;
}

// ============= External AI Provider =============

export class ExternalAIProvider implements GenerationProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY!;
    this.baseUrl = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    this.model = process.env.AI_MODEL || "openai/gpt-4o-mini";
  }

  async generate(input: GenerationInput): Promise<GeneratedCarousel> {
    const prompt = buildPrompt(input);
    const isJsonSupported = !this.baseUrl.includes("openrouter") || this.model.includes("gpt-4") || this.model.includes("claude");

    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    };
    if (isJsonSupported) {
      body.response_format = { type: "json_object" };
    }
    if (!isJsonSupported) {
      (body.messages as Array<{ role: string; content: string }>)[0].content += "\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no code fences.";
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (this.baseUrl.includes("openrouter")) {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      headers["X-Title"] = "Typo AI";
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
    if (!content) throw new Error(`Empty AI response: ${JSON.stringify(data).slice(0, 300)}`);

    const jsonStr = extractJSON(content);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      throw new Error(`JSON parse failed: ${(parseErr as Error).message}\nContent preview: ${content.slice(0, 500)}`);
    }
    return validateAIResponse(parsed);
  }
}

// ============= Factory =============

export function getGenerationProvider(): GenerationProvider {
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is not set. Add it to .env.local");
  }
  return new ExternalAIProvider();
}

// ============= Validation =============

function extractJSON(content: string): string {
  let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
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

const SYSTEM_PROMPT = `أنت كاتب محتوى محترف متخصص في كاروسيلات إنستغرام باللغة العربية.
مهمتك: إنشاء محتوى كاروسيل جذاب ومتناسق بناءً على المواصفات المحددة.

قواعد صارمة:
1. اكتب كل المحتوى (العناوين، النصوص، الـ caption، الـ hashtags) باللهجة أو اللغة المحددة فقط. لا تخلط بين اللهجات.
2. إذا كانت اللغة "العربية الفصحى" استخدم العربية الفصحى. إذا كانت "اللهجة المصرية" اكتب بلهجة مصرية. إذا كانت "اللهجة العراقية" اكتب بلهجة عراقية. وهكذا.
3. التزم بنوع المحتوى المحدد في بنية الشرائح وطريقة عرض المعلومات.
4. التزم بالنبرة المحددة في كل النصوص.
5. كل شريحة يجب أن يكون لها عنوان قصير وجذاب ونص واضح.
6. الشريحة الأولى غلاف (cover): عنوان رئيسي لافت + جملة تشويقية.
7. الشريحة الأخيرة ملخص (summary) أو دعوة لاتخاذ إجراء (cta).

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
  "نحلل الموضوع", "نكتب هيكل المحتوى", "نرتب الشرائح", "ندقق النص", "نجهز المحتوى للمعاينة",
];

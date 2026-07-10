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

// ============= Mock Provider =============

export class MockGenerationProvider implements GenerationProvider {
  async generate(input: GenerationInput): Promise<GeneratedCarousel> {
    await new Promise((r) => setTimeout(r, 2000));

    const { topic, contentType, ctaType, slideCount } = input;
    const contentCount = slideCount - 2;
    const slides: GeneratedSlide[] = [];

    slides.push({
      slide_type: "cover",
      title: topic,
      body: coverSubtitle(contentType),
    });

    const blocks = buildContent(topic, contentType, Math.max(1, contentCount));
    for (let i = 0; i < contentCount; i++) {
      const block = blocks[i % blocks.length];
      slides.push({ slide_type: "content", title: block.title, body: block.body });
    }

    if (ctaType === "بدون CTA" || !ctaType) {
      slides.push({
        slide_type: "summary",
        title: "خلاصة",
        body: `تعرّفنا على أهم جوانب ${topic}. ابدأ بالتطبيق اليوم ولا تؤجّل.`,
      });
    } else {
      slides.push({
        slide_type: "cta",
        title: ctaTitle(ctaType),
        body: ctaBody(ctaType, topic),
        cta_text: ctaType,
      });
    }

    const caption = captionIntro(contentType, topic) + "\n\n" + captionAsk(ctaType);
    const hashtags = generateHashtags(topic, contentType);

    return { slides, caption, hashtags };
  }
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
  const mode = process.env.AI_GENERATION_MODE || "mock";
  if (mode === "provider" && process.env.AI_API_KEY) {
    return new ExternalAIProvider();
  }
  return new MockGenerationProvider();
}

// ============= Validation =============

function extractJSON(content: string): string {
  // Strip markdown code fences
  let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // If still has extra text, find the JSON object boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function validateAIResponse(raw: any): GeneratedCarousel {
  if (!raw.slides || !Array.isArray(raw.slides)) throw new Error("Invalid AI response: missing slides");

  const slides: GeneratedSlide[] = raw.slides.map((s: any, i: number) => ({
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

const SYSTEM_PROMPT = `You are an Arabic content creator specializing in Instagram carousels. Generate carousel content in Arabic. Return JSON with: slides array (each with slide_type: cover/content/summary/cta, title, body, cta_text), caption string, hashtags array. The first slide must be cover, the last must be summary or cta.`;

function buildPrompt(input: GenerationInput): string {
  return `Create an Instagram carousel in Arabic about: "${input.topic}"
Content type: ${input.contentType}
Target audience: ${input.targetAudience}
Level: ${input.level}
Tone: ${input.tone}
Language: ${input.language}
Number of slides: ${input.slideCount}
CTA: ${input.ctaType || "none"}

Return JSON with slides, caption, and hashtags.`;
}

// ============= Mock content builders (reused from original mock-ai) =============

function coverSubtitle(type: string): string {
  const map: Record<string, string> = {
    "تعليمي": "دليل شامل ومبسّط", "قصة": "قصة ملهمة", "توعوي": "معلومات تهمّك",
    "قائمة": "أهم النقاط", "خطوات": "خطوة بخطوة", "نصائح": "نصائح عملية",
    "مقارنة": "مقارنة شاملة", "شرح مفهوم": "شرح مبسّط",
  };
  return map[type] ?? "كاروسيل تعليمي";
}

function buildContent(topic: string, type: string, count: number): { title: string; body: string }[] {
  const templates: Record<string, { title: string; body: string }[]> = {
    "تعليمي": [
      { title: `ما هو ${topic}؟`, body: `${topic} هو مفهوم أساسي يساعدنا على فهم العالم من حولنا.` },
      { title: `لماذا يهمّك ${topic}؟`, body: `فهم ${topic} يفتح آفاقًا جديدة في التفكير.` },
      { title: `أساسيات ${topic}`, body: `يعتمد ${topic} على عدة مبادئ رئيسية.` },
      { title: `كيف يعمل ${topic}؟`, body: `يعمل ${topic} من خلال آلية منظمة.` },
      { title: `أمثلة على ${topic}`, body: `نجد ${topic} في العديد من المواقف اليومية.` },
      { title: `${topic} في المستقبل`, body: `يتطور ${topic} باستمرار وسيكون له دور أكبر.` },
      { title: `كيف تبدأ مع ${topic}`, body: `ابدأ بفهم الأساسيات ثم طبّقها عمليًا.` },
      { title: `نصيحة ختامية`, body: `لا تتوقف عن التعلم، فكل سؤال جديد يقودك إلى فهم أعمق.` },
    ],
    "قصة": [
      { title: "البداية", body: `كل شيء بدأ بفكرة بسيطة عن ${topic}.` },
      { title: "التحدي", body: `سرعان ما ظهرت عقبات حول ${topic}.` },
      { title: "المحاولة", body: `جرّبنا نهجًا مختلفًا للتعامل مع ${topic}.` },
      { title: "نقطة التحوّل", body: `اكتشفنا زاوية جديدة لـ${topic}.` },
      { title: "النجاح", body: `أصبح ${topic} واضحًا وقابلًا للتطبيق.` },
      { title: "الدرس", body: `علّمنا ${topic} أن الإصرار مفتاح كل إنجاز.` },
    ],
    "توعوي": [
      { title: `هل تعلم عن ${topic}؟`, body: `هناك حقائق مهمة عن ${topic}.` },
      { title: "العلامات المبكرة", body: `التعرف المبكر على ${topic} يصنع فرقًا.` },
      { title: "مفاهيم خاطئة", body: `معلومات غير دقيقة حول ${topic} تحتاج تصحيحًا.` },
      { title: "ماذا تفعل؟", body: `إليك الخطوات الصحيحة للتعامل مع ${topic}.` },
      { title: "الوقاية", body: `الوقاية من ${topic} أبسط مما تتوقع.` },
      { title: "انشر الوعي", body: `شارك هذه المعلومات لمساعدة الآخرين.` },
    ],
    "قائمة": [
      { title: "1", body: `أول نقطة حول ${topic}.` },
      { title: "2", body: `ثانيًا، التطبيق العملي لـ${topic}.` },
      { title: "3", body: `ثالثًا، تواصل مع مهتمين بـ${topic}.` },
      { title: "4", body: `رابعًا، خصّص وقتًا لـ${topic}.` },
      { title: "5", body: `خامسًا، قيّم تقدّمك في ${topic}.` },
      { title: "6", body: `سادسًا، لا تخف من طرح الأسئلة.` },
      { title: "7", body: `سابعًا، وثّق رحلتك.` },
      { title: "8", body: `ثامنًا، احتفل بكل إنجاز.` },
    ],
    "خطوات": [
      { title: `الخطوة 1: التحضير`, body: `اجمع ما تحتاجه عن ${topic}.` },
      { title: `الخطوة 2: التخطيط`, body: `ضع خطة واضحة لـ${topic}.` },
      { title: `الخطوة 3: البدء`, body: `ابدأ بأول مهمة في ${topic}.` },
      { title: `الخطوة 4: التطبيق`, body: `نفّذ خطة ${topic} خطوة بخطوة.` },
      { title: `الخطوة 5: المراجعة`, body: `راجع ما أنجزته في ${topic}.` },
      { title: `الخطوة 6: التحسين`, body: `طوّر أسلوبك في ${topic}.` },
      { title: `الخطوة 7: الإتمام`, body: `أنهِ ${topic} بثقة.` },
    ],
    "نصائح": [
      { title: `ابدأ مبكرًا`, body: `لا تنتظر للبدء مع ${topic}.` },
      { title: `قسّم المهمة`, body: `قسّم ${topic} إلى أجزاء صغيرة.` },
      { title: `تعلّم من الأخطاء`, body: `كل خطأ في ${topic} فرصة للتعلم.` },
      { title: `اطلب المساعدة`, body: `لا تتردد في طلب المساعدة في ${topic}.` },
      { title: `كن صبورًا`, body: `الإتقان في ${topic} يحتاج وقتًا.` },
      { title: `استمر`, body: `الاستمرارية في ${topic} أهم من الكمال.` },
    ],
    "مقارنة": [
      { title: `وجه 1 من ${topic}`, body: `الجانب الأول من ${topic} يتميّز بالبساطة.` },
      { title: `وجه 2 من ${topic}`, body: `الجانب الآخر يوفّر مرونة أكبر.` },
      { title: `المميزات`, body: `لكل جانب من ${topic} مميزات.` },
      { title: `العيوب`, body: `فهم عيوب كل جانب من ${topic} يساعدك.` },
      { title: `التكلفة`, body: `تختلف تكلفة كل خيار من ${topic}.` },
      { title: `النتيجة`, body: `الخيار الأفضل من ${topic} يعتمد على أهدافك.` },
    ],
    "شرح مفهوم": [
      { title: `تعريف ${topic}`, body: `${topic} هو مفهوم يمكن فهمه بتقسيمه.` },
      { title: `المكونات`, body: `يتكوّن ${topic} من عناصر أساسية.` },
      { title: `كيف يعمل؟`, body: `آلية عمل ${topic} منظمة.` },
      { title: `مثال مبسّط`, body: `تخيّل ${topic} كآلة بسيطة.` },
      { title: `في الواقع`, body: `نرى ${topic} في تطبيقات يومية.` },
      { title: `الفائدة`, body: `فهم ${topic} يساعدك على قرارات أفضل.` },
    ],
  };
  const blocks = templates[type] ?? templates["تعليمي"];
  return blocks.slice(0, count);
}

function ctaTitle(cta: string): string {
  const map: Record<string, string> = {
    "احفظ المنشور": "احفظ هذه النصائح", "شارك المنشور": "شارك مع من يهمّه",
    "تابع الحساب": "تابعنا للمزيد", "اكتب رأيك": "ما رأيك؟",
  };
  return map[cta] ?? "خاتمة";
}

function ctaBody(cta: string, topic: string): string {
  const map: Record<string, string> = {
    "احفظ المنشور": `لا تنسَ حفظ هذا المنشور حول ${topic}.`,
    "شارك المنشور": `إذا وجدت هذا المحتوى مفيدًا، شاركه.`,
    "تابع الحساب": `تابعنا للمزيد حول ${topic}.`,
    "اكتب رأيك": `أخبرنا: ما هي تجربتك مع ${topic}؟`,
  };
  return map[cta] ?? `نتمنى أن تكون استفدت.`;
}

function captionIntro(type: string, topic: string): string {
  const map: Record<string, string> = {
    "تعليمي": `تعرف على ${topic} بطريقة مبسّطة! 📚`,
    "قصة": `قصة ملهمة عن ${topic} 📖`,
    "توعوي": `معلومات مهمة عن ${topic} 👀`,
    "قائمة": `أهم ما تحتاج معرفته عن ${topic} ✅`,
    "خطوات": `دليلك خطوة بخطوة لـ${topic} 🎯`,
    "نصائح": `نصائح عملية حول ${topic} 💡`,
    "مقارنة": `مقارنة شاملة حول ${topic} ⚖️`,
    "شرح مفهوم": `شرح مبسّط لمفهوم ${topic} 🧠`,
  };
  return map[type] ?? `محتوى عن ${topic}`;
}

function captionAsk(cta: string | null): string {
  const map: Record<string, string> = {
    "احفظ المنشور": "احفظ المنشور لمراجعته لاحقًا!",
    "شارك المنشور": "شاركه مع من قد يستفيد!",
    "تابع الحساب": "تابعنا للمزيد!",
    "اكتب رأيك": "اكتب رأيك في التعليقات!",
    "بدون CTA": "",
  };
  return cta ? (map[cta] ?? "") : "";
}

function generateHashtags(topic: string, type: string): string[] {
  const base = topic.replace(/\s+/g, "_");
  const typeMap: Record<string, string[]> = {
    "تعليمي": ["#تعلم", "#محتوى_تعليمي", "#علم"],
    "قصة": ["#قصص", "#قصة", "#سرد"],
    "توعوي": ["#توعية", "#معلومة", "#صحة"],
    "قائمة": ["#قائمة", "#أفضل", "#نصائح"],
    "خطوات": ["#خطوات", "#دليل", "#كيف"],
    "نصائح": ["#نصائح", "#إرشادات", "#نصيحة"],
    "مقارنة": ["#مقارنة", "#فرق", "#أيهم"],
    "شرح مفهوم": ["#شرح", "#مفهوم", "#تبسيط"],
  };
  return [`#${base}`, ...(typeMap[type] ?? ["#محتوى"])];
}

export const PROGRESS_MESSAGES = [
  "نحلل الموضوع", "نكتب هيكل المحتوى", "نرتب الشرائح", "ندقق النص", "نجهز المحتوى للمعاينة",
];

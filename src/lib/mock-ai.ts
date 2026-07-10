import type { Slide, ProjectSettings, ContentType, Tone, Language } from "./types";
import { uid } from "./utils";

// ============= Mock AI Content Generation =============
// Rule-based generation: varies by topic, type, tone, language, level, slide count, CTA

interface GenParams {
  topic: string;
  settings: Pick<ProjectSettings, "contentType" | "tone" | "language" | "level" | "slideCount" | "cta">;
  fail?: boolean;
}

export function generateSlides(params: GenParams): Slide[] {
  const { topic, settings } = params;
  const total = settings.slideCount;
  const contentCount = total - 2; // cover + ending
  const slides: Slide[] = [];

  // Cover slide
  slides.push({
    id: uid("s"),
    type: "cover",
    title: topic,
    body: coverSubtitle(settings.contentType, settings.tone),
  });

  // Content slides based on content type
  const contentBlocks = buildContent(topic, settings, Math.max(1, contentCount));
  for (let i = 0; i < contentCount; i++) {
    const block = contentBlocks[i] ?? contentBlocks[contentBlocks.length % contentBlocks.length];
    slides.push({
      id: uid("s"),
      type: "content",
      title: block.title,
      body: block.body,
    });
  }

  // Ending / CTA slide
  if (settings.cta === "بدون CTA") {
    slides.push({
      id: uid("s"),
      type: "ending",
      title: "خلاصة",
      body: summaryText(topic),
    });
  } else {
    slides.push({
      id: uid("s"),
      type: "ending",
      title: ctaTitle(settings.cta),
      body: ctaBody(settings.cta, topic),
      ctaText: settings.cta,
    });
  }

  return slides;
}

export function generateExtraSlide(
  topic: string,
  settings: Pick<ProjectSettings, "contentType" | "tone" | "language" | "level">,
  index: number
): Slide {
  const blocks = buildContent(topic, settings, 10);
  const block = blocks[index % blocks.length];
  return {
    id: uid("s"),
    type: "content",
    title: block.title,
    body: block.body,
  };
}

export function generateCaption(topic: string, settings: Pick<ProjectSettings, "contentType" | "tone" | "language" | "cta">): string {
  const intro = captionIntro(settings.contentType, topic);
  const ask = captionAsk(settings.cta ?? "تابع الحساب");
  return `${intro}\n\n${ask}\n\n#${topic.replace(/\s+/g, "_")}`;
}

export function generateHashtags(topic: string, contentType: ContentType): string[] {
  const base = topic.replace(/\s+/g, "_");
  const typeMap: Record<ContentType, string[]> = {
    "تعليمي": ["#تعلم", "#محتوى_تعليمي", "#علم"],
    "قصة": ["#قصص", "#قصة", "#سرد"],
    "توعوي": ["#توعية", "#معلومة", "#صحة"],
    "قائمة": ["#قائمة", "#أفضل", "#نصائح"],
    "خطوات": ["#خطوات", "#دليل", "#كيف"],
    "نصائح": ["#نصائح", "#إرشادات", "#نصيحة"],
    "مقارنة": ["#مقارنة", "#فرق", "#أيهم"],
    "شرح مفهوم": ["#شرح", "#مفهوم", "#تبسيط"],
  };
  return [`#${base}`, ...typeMap[contentType]];
}

// ============= Content builders =============

type ContentGenSettings = Pick<ProjectSettings, "contentType" | "tone" | "language" | "level">;

function buildContent(
  topic: string,
  settings: ContentGenSettings,
  count: number
): { title: string; body: string }[] {
  const builders: Record<ContentType, (t: string, s: ContentGenSettings, n: number) => { title: string; body: string }[]> = {
    "تعليمي": buildEducational,
    "قصة": buildStory,
    "توعوي": buildAwareness,
    "قائمة": buildList,
    "خطوات": buildSteps,
    "نصائح": buildTips,
    "مقارنة": buildComparison,
    "شرح مفهوم": buildConcept,
  };
  return builders[settings.contentType](topic, settings, count);
}

function buildEducational(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const templates = [
    { title: `ما هو ${topic}؟`, body: `${topic} هو مفهوم أساسي يساعدنا على فهم العالم من حولنا بشكل أعمق وأوضح.` },
    { title: `لماذا يهمّك ${topic}؟`, body: `فهم ${topic} يفتح لك آفاقًا جديدة في التفكير واتخاذ قرارات أفضل.` },
    { title: `أساسيات ${topic}`, body: `يعتمد ${topic} على عدة مبادئ رئيسية تشكّل أساسه النظري والعملي.` },
    { title: `كيف يعمل ${topic}؟`, body: `يعمل ${topic} من خلال آلية منظمة تربط بين المبادئ والتطبيق العملي.` },
    { title: `أمثلة على ${topic}`, body: `نجد ${topic} في العديد من المواقف اليومية والتطبيقات العملية.` },
    { title: `أخطاء شائعة حول ${topic}`, body: `هناك مفاهيم خاطئة منتشرة عن ${topic} يجب تصحيحها لفهم أفضل.` },
    { title: `${topic} في المستقبل`, body: `يتطور ${topic} باستمرار وسيكون له دور أكبر في المستقبل القريب.` },
    { title: `كيف تبدأ مع ${topic}`, body: `ابدأ بفهم الأساسيات ثم طبّقها عمليًا خطوة بخطوة.` },
    { title: `مصادر للتعمّق في ${topic}`, body: `توجد كتب ودورات ومقالات متخصصة تساعدك على التعمّق أكثر.` },
    { title: `نصيحة ختامية حول ${topic}`, body: `لا تتوقف عن التعلم، فكل سؤال جديد يقودك إلى فهم أعمق.` },
  ];
  return templates.slice(0, n);
}

function buildStory(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const parts = [
    { title: "البداية", body: `كل شيء بدأ بفكرة بسيطة عن ${topic}. لم يكن أحد يتوقع ما سيحدث لاحقًا.` },
    { title: "التحدي", body: `سرعان ما ظهرت عقبات لم تكن في الحسبان حول ${topic}. كان القرار صعبًا.` },
    { title: "المحاولة الأولى", body: `جرّبنا نهجًا مختلفًا للتعامل مع ${topic}، لكن النتائج لم تكن كما توقعنا.` },
    { title: "نقطة التحوّل", body: `ثم حدث ما غيّر كل شيء. اكتشفنا زاوية جديدة لـ${topic} لم ننتبه لها.` },
    { title: "النجاح", body: `أخيرًا، بدأت القطع تتجمع. أصبح ${topic} واضحًا وقابلًا للتطبيق.` },
    { title: "الدرس المستفاد", body: `علّمنا ${topic} أن الإصرار والصبر هما مفتاح كل إنجاز.` },
    { title: "ما بعد النجاح", body: `لم نتوقف عند النجاح، بل بدأنا نطبّق ما تعلّمناه على مجالات أخرى.` },
    { title: "نصيحة من القلب", body: `إذا كنت تواجه تحديًا مع ${topic}، لا تستسلم. الحل أقرب مما تظن.` },
  ];
  return parts.slice(0, n);
}

function buildAwareness(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const items = [
    { title: `هل تعلم عن ${topic}؟`, body: `هناك حقائق مهمة عن ${topic} قد لا يعرفها الكثيرون.` },
    { title: `العلامات المبكرة`, body: `التعرف المبكر على ${topic} يصنع فرقًا كبيرًا في النتائج.` },
    { title: `مفاهيم خاطئة`, body: `انتشرت معلومات غير دقيقة حول ${topic} نحتاج إلى تصحيحها.` },
    { title: `ماذا تفعل؟`, body: `إذا واجهت ${topic}، إليك الخطوات الصحيحة للتعامل معه.` },
    { title: `ماذا لا تفعل؟`, body: `تجنّب هذه الأخطاء الشائعة عند التعامل مع ${topic}.` },
    { title: `متى تستشير؟`, body: `في بعض الحالات، يجب طلب المساعدة المتخصصة بخصوص ${topic}.` },
    { title: `الوقاية`, body: `الوقاية من ${topic} أبسط مما تتوقع باتباع عادات يومية بسيطة.` },
    { title: `انشر الوعي`, body: `شارك هذه المعلومات لتساعد الآخرين على فهم ${topic} بشكل صحيح.` },
  ];
  return items.slice(0, n);
}

function buildList(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const items = [
    { title: "1", body: `أول نقطة حول ${topic} تركّز على الأساسيات.` },
    { title: "2", body: `ثانيًا، لا تنسَ التطبيق العملي لما تتعلمه عن ${topic}.` },
    { title: "3", body: `ثالثًا، التواصل مع آخرين مهتمين بـ${topic} يثري تجربتك.` },
    { title: "4", body: `رابعًا، خصّص وقتًا منتظمًا للتعمّق في ${topic}.` },
    { title: "5", body: `خامسًا، قيّم تقدّمك بانتظام في فهم ${topic}.` },
    { title: "6", body: `سادسًا، لا تخف من طرح الأسئلة حول ${topic}.` },
    { title: "7", body: `سابعًا، وثّق رحلتك مع ${topic} لمراجعتها لاحقًا.` },
    { title: "8", body: `ثامنًا، احتفل بكل إنجاز صغير في ${topic}.` },
  ];
  return items.slice(0, n);
}

function buildSteps(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const steps = [
    { title: `الخطوة 1: التحضير`, body: `قبل البدء مع ${topic}، اجمع كل ما تحتاجه من معلومات وأدوات.` },
    { title: `الخطوة 2: التخطيط`, body: `ضع خطة واضحة لكيفية التعامل مع ${topic} حدّد أهدافك بدقة.` },
    { title: `الخطوة 3: البدء`, body: `ابدأ بأول مهمة في ${topic}. لا تؤجّل، الخطوة الأولى هي الأصعب.` },
    { title: `الخطوة 4: التطبيق`, body: `نفّذ خطة ${topic} خطوة بخطوة مع التركيز على الجودة.` },
    { title: `الخطوة 5: المراجعة`, body: `بعد كل مرحلة من ${topic}، راجع ما أنجزته وعدّل ما يلزم.` },
    { title: `الخطوة 6: التحسين`, body: `طوّر أسلوبك في ${topic} بناءً على ما تعلّمته من التجربة.` },
    { title: `الخطوة 7: الإتمام`, body: `أنهِ ${topic} بثقة وتأكد من تحقيق جميع أهدافك.` },
    { title: `الخطوة 8: التكرار`, body: `طبّق ما تعلّمته من ${topic} في مشاريع جديدة لتثبيت المعرفة.` },
  ];
  return steps.slice(0, n);
}

function buildTips(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const tips = [
    { title: `ابدأ مبكرًا`, body: `لا تنتظر الوقت المثالي للبدء مع ${topic}. ابدأ بما لديك الآن.` },
    { title: `قسّم المهمة`, body: `قسّم ${topic} إلى أجزاء صغيرة قابلة للإنجاز.` },
    { title: `تعلّم من الأخطاء`, body: `كل خطأ في ${topic} هو فرصة للتعلم والتحسّن.` },
    { title: `اطلب المساعدة`, body: `لا تتردد في طلب المساعدة من خبراء في ${topic}.` },
    { title: `كن صبورًا`, body: `الإتقان في ${topic} يحتاج وقتًا، فلا تستعجل النتائج.` },
    { title: `تابع التقدّم`, body: `سجّل إنجازاتك في ${topic} لتبقى متحفّزًا.` },
    { title: `شارك المعرفة`, body: `علّم الآخرين ما تعلّمته عن ${topic} لتثبّت فهمك.` },
    { title: `استمر`, body: `الاستمرارية في ${topic} أهم من الكمال في كل خطوة.` },
  ];
  return tips.slice(0, n);
}

function buildComparison(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const items = [
    { title: `وجه 1 من ${topic}`, body: `الجانب الأول من ${topic} يتميّز بالبساطة والسهولة في التنفيذ.` },
    { title: `وجه 2 من ${topic}`, body: `الجانب الآخر من ${topic} يوفّر مرونة أكبر وخيارات أوسع.` },
    { title: `المميزات`, body: `لكل جانب من ${topic} مميزات تناسب مواقف مختلفة.` },
    { title: `العيوب`, body: `فهم عيوب كل جانب من ${topic} يساعدك على الاختيار الصحيح.` },
    { title: `التكلفة`, body: `تختلف تكلفة كل خيار من ${topic} حسب احتياجاتك.` },
    { title: `النتيجة`, body: `الخيار الأفضل من ${topic} يعتمد على أهدافك وظروفك.` },
    { title: `التوصية`, body: `بناءً على المقارنة، اختر ما يناسبك من ${topic} بحكمة.` },
    { title: `خلاصة المقارنة`, body: `لا يوجد خيار واحد مثالي لـ${topic}. الاختيار يعتمد على السياق.` },
  ];
  return items.slice(0, n);
}

function buildConcept(topic: string, s: ContentGenSettings, n: number): { title: string; body: string }[] {
  const items = [
    { title: `تعريف ${topic}`, body: `${topic} ببساطة هو مفهوم يمكن فهمه من خلال تقسيمه إلى أجزاء أصغر.` },
    { title: `المكونات`, body: `يتكوّن ${topic} من عناصر أساسية تعمل معًا بانسجام.` },
    { title: `كيف يعمل؟`, body: `آلية عمل ${topic} تعتمد على تفاعل العناصر بشكل منظم.` },
    { title: `مثال مبسّط`, body: `تخيّل ${topic} كأنه آلة بسيطة، كل قطعة لها دور محدد.` },
    { title: `في الواقع`, body: `نرى ${topic} في تطبيقات يومية قد لا ننتبه لها.` },
    { title: `الفائدة`, body: `فهم ${topic} يساعدك على اتخاذ قرارات أفضل وأكثر وعيًا.` },
    { title: `الحدود`, body: `لكل مفهوم حدود، و${topic} ليس استثناءً.` },
    { title: `ما بعد المفهوم`, body: `بعد فهم ${topic}، يمكنك التوسّع إلى مفاهيم أكثر تقدمًا.` },
  ];
  return items.slice(0, n);
}

// ============= Helpers =============

function coverSubtitle(type: ContentType, tone: Tone): string {
  const map: Record<ContentType, string> = {
    "تعليمي": "دليل شامل ومبسّط",
    "قصة": "قصة ملهمة",
    "توعوي": "معلومات تهمّك",
    "قائمة": "أهم النقاط",
    "خطوات": "خطوة بخطوة",
    "نصائح": "نصائح عملية",
    "مقارنة": "مقارنة شاملة",
    "شرح مفهوم": "شرح مبسّط",
  };
  return map[type] ?? "كاروسيل تعليمي";
}

function summaryText(topic: string): string {
  return `تعرّفنا على أهم جوانب ${topic}. ابدأ بالتطبيق اليوم ولا تؤجّل.`;
}

function ctaTitle(cta: string): string {
  const map: Record<string, string> = {
    "احفظ المنشور": "احفظ هذه النصائح",
    "شارك المنشور": "شارك مع من يهمّه",
    "تابع الحساب": "تابعنا للمزيد",
    "اكتب رأيك": "ما رأيك؟",
  };
  return map[cta] ?? "خاتمة";
}

function ctaBody(cta: string, topic: string): string {
  const map: Record<string, string> = {
    "احفظ المنشور": `لا تنسَ حفظ هذا المنشور للرجوع إليه لاحقًا حول ${topic}.`,
    "شارك المنشور": `إذا وجدت هذا المحتوى مفيدًا، شاركه مع أصدقائك.`,
    "تابع الحساب": `تابعنا للمزيد من المحتوى حول ${topic} ومواضيع مشابهة.`,
    "اكتب رأيك": `أخبرنا في التعليقات: ما هي تجربتك مع ${topic}؟`,
  };
  return map[cta] ?? `نتمنى أن تكون استفدت من هذا المحتوى.`;
}

function captionIntro(type: ContentType, topic: string): string {
  const map: Record<ContentType, string> = {
    "تعليمي": `تعرف على ${topic} بطريقة مبسّطة وواضحة! 📚`,
    "قصة": `قصة ملهمة عن ${topic} 📖`,
    "توعوي": `معلومات مهمة عن ${topic} قد تغيّر نظرتك 👀`,
    "قائمة": `أهم ما تحتاج معرفته عن ${topic} ✅`,
    "خطوات": `دليلك خطوة بخطوة لـ${topic} 🎯`,
    "نصائح": `نصائح عملية حول ${topic} 💡`,
    "مقارنة": `مقارنة شاملة حول ${topic} ⚖️`,
    "شرح مفهوم": `شرح مبسّط لمفهوم ${topic} 🧠`,
  };
  return map[type] ?? `محتوى عن ${topic}`;
}

function captionAsk(cta: string): string {
  const map: Record<string, string> = {
    "احفظ المنشور": "احفظ المنشور لمراجعته لاحقًا!",
    "شارك المنشور": "شاركه مع من قد يستفيد منه!",
    "تابع الحساب": "تابعنا للمزيد!",
    "اكتب رأيك": "اكتب رأيك في التعليقات!",
    "بدون CTA": "",
  };
  return map[cta] ?? "";
}

// ============= Progress messages =============

export const PROGRESS_MESSAGES = [
  "نحلل الموضوع",
  "نكتب هيكل المحتوى",
  "نرتب الشرائح",
  "ندقق النص",
  "نجهز المحتوى للمعاينة",
];

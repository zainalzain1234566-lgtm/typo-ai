export const HOME_FAQS = [
  {
    question: "هل يدعم Typo AI المحتوى العام والطبي؟",
    answer: "نعم. يمكنك إنشاء مسودات لمحتوى عام أو طبي ثم تعديل النص والتصميم بما يناسب جمهورك ومجالك.",
  },
  {
    question: "هل يمكن الاعتماد على المحتوى الطبي كما هو؟",
    answer: "لا. كل ناتج طبي يولده الذكاء الاصطناعي يحتاج إلى مراجعة مختص مؤهل قبل النشر، ولا يُعد نصيحة أو تشخيصًا طبيًا.",
  },
  {
    question: "هل أحتاج إلى خبرة في التصميم؟",
    answer: "لا. اختر قالبًا، واكتب موضوعك، ثم راجع الشرائح وعدّل النصوص والألوان والخطوط من المحرر.",
  },
  {
    question: "ما اللهجات المدعومة؟",
    answer: "يدعم Typo AI العربية الفصحى واللهجتين العراقية والخليجية لتكييف المسودة مع جمهورك.",
  },
  {
    question: "هل يمكن تعديل النص بعد إنشائه؟",
    answer: "نعم. يمكنك تعديل جميع النصوص والتصميم بعد إنشاء المسودة وقبل تنزيل الشرائح.",
  },
  {
    question: "ما مقاسات التصميم المدعومة؟",
    answer: "يدعم المحرر مقاسات الكاروسيل المتاحة داخله، ومنها المقاس العمودي 1080×1350 والمقاس المربع 1080×1080.",
  },
  {
    question: "كيف أنزّل الشرائح؟",
    answer: "يمكنك تنزيل شريحة بصيغة PNG أو تنزيل جميع شرائح المشروع معًا في ملف ZIP.",
  },
] as const;

type WebSiteSchema = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string;
};

type SoftwareApplicationSchema = {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  inLanguage: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
};

type FAQPageSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

export type HomeJsonLdSchema = WebSiteSchema | SoftwareApplicationSchema | FAQPageSchema;

export function createHomeJsonLd(siteUrl: string): HomeJsonLdSchema[] {
  const url = siteUrl.replace(/\/$/, "");

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Typo AI",
      url,
      inLanguage: "ar",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Typo AI",
      url,
      description: "أداة ويب عربية لإنشاء مسودات كاروسيل عامة وطبية وتعديلها وتصديرها.",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      inLanguage: "ar",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQS.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ];
}

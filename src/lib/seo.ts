import type { Metadata } from "next";

const ROUTE_PATHS = [
  "/",
  "/templates",
  "/pricing",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/projects",
  "/projects/new",
  "/projects/[id]/edit",
  "/projects/[id]/export",
  "/settings",
  "/templates/mine",
  "/templates/designer",
] as const;

export type SeoRoute = (typeof ROUTE_PATHS)[number];

export type PageSeo = {
  path: SeoRoute;
  title: string;
  description: string;
  index: boolean;
  follow: boolean;
  noarchive?: true;
};

export const ROUTE_SEO = {
  "/": {
    path: "/",
    title: "Typo AI — إنشاء كاروسيل عربي بالذكاء الاصطناعي",
    description:
      "أنشئ شرائح كاروسيل عربية قابلة للتعديل باستخدام قوالب جاهزة أو تصاميم مخصصة بالذكاء الاصطناعي للمحتوى العام والطبي.",
    index: true,
    follow: true,
  },
  "/templates": {
    path: "/templates",
    title: "قوالب كاروسيل عربية",
    description:
      "استعرض قوالب Typo AI للمحتوى العام والطبي واختر التصميم والألوان والخط المناسب لك.",
    index: true,
    follow: true,
  },
  "/pricing": {
    path: "/pricing",
    title: "الأسعار وخطط الاستخدام",
    description:
      "قارن الخطة المجانية وخطة الدفع حسب الاستخدام، وتعرّف على رصيد مصمم القوالب بالذكاء الاصطناعي.",
    index: true,
    follow: true,
  },
  "/privacy": {
    path: "/privacy",
    title: "سياسة الخصوصية",
    description: "صفحة سياسة الخصوصية لخدمة Typo AI؛ النص القانوني الكامل قيد الإعداد.",
    index: false,
    follow: true,
  },
  "/terms": {
    path: "/terms",
    title: "الشروط والأحكام",
    description: "صفحة شروط استخدام Typo AI؛ النص القانوني الكامل قيد الإعداد.",
    index: false,
    follow: true,
  },
  "/login": {
    path: "/login",
    title: "تسجيل الدخول",
    description: "سجّل الدخول للوصول إلى مشاريعك وقوالبك في Typo AI.",
    index: false,
    follow: true,
  },
  "/signup": {
    path: "/signup",
    title: "إنشاء حساب",
    description: "أنشئ حساب Typo AI للبدء في إنشاء مشاريع كاروسيل عربية.",
    index: false,
    follow: true,
  },
  "/forgot-password": {
    path: "/forgot-password",
    title: "استعادة كلمة المرور",
    description: "اطلب رابطًا آمنًا لاستعادة كلمة مرور حساب Typo AI.",
    index: false,
    follow: true,
  },
  "/reset-password": {
    path: "/reset-password",
    title: "تعيين كلمة مرور جديدة",
    description: "عيّن كلمة مرور جديدة من رابط الاستعادة المرسل إلى بريدك.",
    index: false,
    follow: true,
  },
  "/verify-email": {
    path: "/verify-email",
    title: "التحقق من البريد الإلكتروني",
    description: "أكمل التحقق من بريدك الإلكتروني لتفعيل حساب Typo AI.",
    index: false,
    follow: true,
  },
  "/projects": {
    path: "/projects",
    title: "مشاريعي",
    description: "اعرض مشاريع الكاروسيل المحفوظة في حسابك ونظّمها.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/projects/new": {
    path: "/projects/new",
    title: "إنشاء مشروع كاروسيل",
    description: "أنشئ مشروعًا جديدًا وحدد المحتوى والقالب وإعدادات التصدير.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/projects/[id]/edit": {
    path: "/projects/[id]/edit",
    title: "تعديل مشروع كاروسيل",
    description: "عدّل شرائح مشروع الكاروسيل وتصميمه وإعداداته.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/projects/[id]/export": {
    path: "/projects/[id]/export",
    title: "تصدير مشروع كاروسيل",
    description: "نزّل شرائح مشروع الكاروسيل وانسخ الوصف والهاشتاغات.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/settings": {
    path: "/settings",
    title: "إعدادات الحساب",
    description: "أدر الحساب والهوية البصرية والتفضيلات والرصيد.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/templates/mine": {
    path: "/templates/mine",
    title: "قوالبي",
    description: "اعرض القوالب المخصصة المحفوظة وأعد استخدامها.",
    index: false,
    follow: false,
    noarchive: true,
  },
  "/templates/designer": {
    path: "/templates/designer",
    title: "مصمم القوالب بالذكاء الاصطناعي",
    description: "أنشئ أو عدّل قالب كاروسيل مخصصًا باستخدام الذكاء الاصطناعي.",
    index: false,
    follow: false,
    noarchive: true,
  },
} satisfies Record<SeoRoute, PageSeo>;

export const INDEXABLE_PAGES = [
  ROUTE_SEO["/"],
  ROUTE_SEO["/templates"],
  ROUTE_SEO["/pricing"],
] as const satisfies readonly PageSeo[];

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!configuredUrl) return "http://localhost:3000";

  const url = /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function createPageMetadata(page: PageSeo): Metadata {
  const robots: Metadata["robots"] = page.noarchive
    ? { index: page.index, follow: page.follow, noarchive: true }
    : { index: page.index, follow: page.follow };

  const socialMetadata: Pick<Metadata, "alternates" | "openGraph" | "twitter"> = page.follow ? {
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName: "Typo AI",
      locale: "ar_IQ",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Typo AI — إنشاء كاروسيل عربي بالذكاء الاصطناعي",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/opengraph-image"],
    },
  } : {
    // Explicit nulls prevent private child routes from inheriting a public
    // parent canonical or social card in Next.js' metadata merge.
    alternates: null,
    openGraph: null,
    twitter: null,
  };

  return {
    title: page.title,
    description: page.description,
    robots,
    ...socialMetadata,
  };
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description: "تعذر العثور على الصفحة المطلوبة في Typo AI.",
  robots: { index: false, follow: false, noarchive: true },
  alternates: null,
  openGraph: null,
  twitter: null,
};

const links = [
  { href: "/", label: "العودة إلى الرئيسية" },
  { href: "/templates", label: "استعراض القوالب" },
  { href: "/pricing", label: "عرض الأسعار" },
];

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-7xl font-extrabold text-accent" aria-hidden="true">
          404
        </p>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">الصفحة غير موجودة</h1>
        <p className="mt-3 text-ink-muted">ربما تغيّر الرابط أو نُقلت الصفحة التي تبحث عنها.</p>
        <nav aria-label="روابط مفيدة" className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                index === 0
                  ? "rounded-xl bg-accent px-5 py-3 font-bold text-white transition-colors hover:bg-accent/90"
                  : "rounded-xl border border-stone-300 bg-white px-5 py-3 font-bold text-ink transition-colors hover:bg-stone-50"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

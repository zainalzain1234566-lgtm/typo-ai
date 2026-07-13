import Link from "next/link";

const footerLinkClass = "inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-xs">
            <Link href="/" aria-label="Typo AI - الرئيسية" className="inline-flex min-h-11 items-center text-xl font-extrabold text-ink">
              Typo <span className="ms-1 text-accent">AI</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              منصة عربية لإنشاء كاروسيل عام أو متخصص وتعديل الشرائح وتنزيلها دون خبرة مسبقة في التصميم.
            </p>
          </div>

          <nav aria-labelledby="footer-product-heading">
            <h2 id="footer-product-heading" className="mb-3 text-sm font-bold text-ink">المنتج</h2>
            <ul className="space-y-2">
              <li><Link href="/" className={footerLinkClass}>الرئيسية</Link></li>
              <li><Link href="/templates" className={footerLinkClass}>القوالب</Link></li>
              <li><Link href="/pricing" className={footerLinkClass}>الأسعار</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal-heading">
            <h2 id="footer-legal-heading" className="mb-3 text-sm font-bold text-ink">قانوني</h2>
            <ul className="space-y-2">
              <li><Link href="/privacy" className={footerLinkClass}>سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className={footerLinkClass}>شروط الاستخدام</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-account-heading">
            <h2 id="footer-account-heading" className="mb-3 text-sm font-bold text-ink">الحساب</h2>
            <ul className="space-y-2">
              <li><Link href="/login" className={footerLinkClass}>تسجيل الدخول</Link></li>
              <li><Link href="/signup" className={footerLinkClass}>إنشاء حساب</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-stone-100 pt-6 text-center">
          <p className="text-xs text-ink-subtle">© {new Date().getFullYear()} Typo AI — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}

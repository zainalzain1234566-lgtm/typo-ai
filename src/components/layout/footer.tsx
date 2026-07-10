import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="max-w-xs">
            <span className="text-xl font-extrabold text-ink">Typo <span className="text-accent">AI</span></span>
            <p className="text-sm text-ink-muted mt-3 leading-relaxed">
              منصة عربية لإنشاء كاروسيل Instagram بسهولة دون خبرة في التصميم.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="text-sm font-bold text-ink mb-3">المنتج</h4>
              <div className="flex flex-col gap-2">
                <Link href="/projects" className="text-sm text-ink-muted hover:text-ink transition-colors">المشاريع</Link>
                <Link href="/templates" className="text-sm text-ink-muted hover:text-ink transition-colors">القوالب</Link>
                <Link href="/pricing" className="text-sm text-ink-muted hover:text-ink transition-colors">الأسعار</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink mb-3">الحساب</h4>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-sm text-ink-muted hover:text-ink transition-colors">تسجيل الدخول</Link>
                <Link href="/signup" className="text-sm text-ink-muted hover:text-ink transition-colors">إنشاء حساب</Link>
                <Link href="/settings" className="text-sm text-ink-muted hover:text-ink transition-colors">الإعدادات</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-ink-subtle">© {new Date().getFullYear()} Typo AI — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}

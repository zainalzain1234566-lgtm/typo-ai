import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink">الشروط والأحكام</h1>
        <p className="mt-4 text-ink-muted">محتوى هذه الصفحة قيد الإعداد. سيتم نشر الشروط والأحكام الكاملة قريبًا.</p>
      </main>
      <Footer />
    </div>
  );
}

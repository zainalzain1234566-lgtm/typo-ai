"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Button } from "@/components/ui/button";
import { getMyCustomTemplatesAction } from "@/app/actions/custom-templates";

type SavedTemplate = { id: string; name: string; settings: { topic?: string }; updated_at: string; custom_template_versions: { version_number: number }[] };

export default function MyTemplatesPage() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getMyCustomTemplatesAction().then((res) => {
      if (res.success) setTemplates(res.data as SavedTemplate[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNavbar />
      <main dir="rtl" className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold text-ink">قوالبي</h1>
        <p className="mt-2 text-ink-muted">القوالب التي أنشأتها بالذكاء الاصطناعي محفوظة هنا دائمًا.</p>
        {loading ? <p className="mt-8 text-ink-muted">جارٍ التحميل...</p> : templates.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-ink-muted">لا توجد قوالب محفوظة بعد.</p>
            <Link href="/templates/designer" className="mt-4 inline-block"><Button>إنشاء قالب جديد</Button></Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <article key={template.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
                <h2 className="font-bold text-ink">{template.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{template.settings?.topic ?? ""}</p>
                <p className="mt-3 text-xs text-ink-subtle">{template.custom_template_versions?.length ?? 0} نسخة</p>
                <Link href={`/templates/designer?template=${template.id}`} className="mt-4 block"><Button className="w-full">فتح القالب</Button></Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

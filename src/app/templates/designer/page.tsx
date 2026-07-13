"use client";

import { Suspense } from "react";
import { DesignerWorkspace } from "@/components/template-designer/designer-workspace";

export default function TemplateDesignerPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">مصمم القوالب بالذكاء الاصطناعي</h1>
          <p className="mt-2 text-sm text-ink-muted">جارٍ تجهيز مساحة التصميم...</p>
        </div>
      </main>
    }>
      <DesignerWorkspace />
    </Suspense>
  );
}

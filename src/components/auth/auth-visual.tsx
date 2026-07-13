const cards = [
  {
    eyebrow: "فكرة",
    title: "ابدأ برسالة واضحة",
    body: "حدّد ما يحتاجه جمهورك",
    className: "bg-[#173B4D] text-white",
  },
  {
    eyebrow: "تنظيم",
    title: "حوّلها إلى شرائح",
    body: "راجع النص ورتّب النقاط",
    className: "bg-[#FFF4D8] text-[#4A3417]",
  },
  {
    eyebrow: "تصدير",
    title: "جهّزها للنشر",
    body: "اختر القالب ونزّل الصور",
    className: "bg-[#5B4EE5] text-white",
  },
] as const;

export function AuthVisual() {
  return (
    <aside className="hidden flex-col items-center justify-center bg-gradient-to-bl from-accent-soft to-surface-tinted p-12 lg:flex">
      <div className="max-w-md animate-fade-in">
        <p className="mb-2 text-center text-2xl font-extrabold text-ink">
          أنشئ كاروسيل احترافي
        </p>
        <p className="mb-8 text-center text-sm text-ink-muted">
          حوّل أفكارك إلى شرائح قابلة للمراجعة وجاهزة للتنزيل
        </p>

        <div aria-hidden="true" className="grid grid-cols-3 items-start gap-3" dir="rtl">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`aspect-[4/5] rounded-2xl p-4 shadow-lift ${card.className}`}
              style={{ transform: `translateY(${index * 12}px)` }}
            >
              <div className="flex h-full flex-col">
                <span className="text-[10px] font-bold opacity-70">{card.eyebrow}</span>
                <div className="my-3 h-px bg-current opacity-20" />
                <p className="text-sm font-extrabold leading-snug">{card.title}</p>
                <p className="mt-2 text-[10px] leading-relaxed opacity-75">{card.body}</p>
                <div className="mt-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  <span className="h-1 w-8 rounded-full bg-current opacity-30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

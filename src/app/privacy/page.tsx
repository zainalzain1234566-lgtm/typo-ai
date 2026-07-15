import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNavbar />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
        <article dir="rtl" className="text-right">
          <header className="border-b border-stone-200 pb-8 text-center">
            <h1 className="text-3xl font-extrabold text-ink md:text-4xl">سياسة الخصوصية</h1>
            <p className="mt-3 text-sm text-ink-muted">تاريخ السريان: 15 يوليو 2026</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
              تشرح هذه السياسة كيف تتعامل Typo AI مع البيانات عند استخدام الموقع والخدمات المرتبطة به.
            </p>
          </header>

          <div className="mt-10 space-y-10 text-sm leading-8 text-ink-muted">
            <section>
              <h2 className="text-xl font-bold text-ink">1. من نحن وكيف تتواصل معنا</h2>
              <p className="mt-3">
                تشير «Typo AI» إلى المنصة التي تساعد المستخدمين على إنشاء وتحرير وتصدير محتوى كاروسيل. لأي سؤال أو طلب متعلق بالخصوصية أو بياناتك الشخصية، راسلنا على{" "}
                <a href="mailto:zainalabdinmuneam@gmail.com" className="font-medium text-accent hover:underline">zainalabdinmuneam@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">2. البيانات التي نجمعها</h2>
              <ul className="mt-3 list-disc space-y-2 pr-6">
                <li>بيانات الحساب، مثل البريد الإلكتروني ومعرّفات المصادقة واسم العرض.</li>
                <li>بيانات الملف الشخصي والهوية البصرية، مثل اسم المستخدم والشعار والصورة الشخصية والألوان والتفضيلات.</li>
                <li>المحتوى الذي تدخله أو تنشئه، بما في ذلك الموضوعات والمطالبات والمشاريع والشرائح والنصوص والتعليقات والوسوم والقوالب المخصصة.</li>
                <li>الصور التي ترفعها أو تختارها من Pexels، وبيانات المصدر اللازمة لعرضها وإدارتها.</li>
                <li>بيانات الخطة والرصيد والاستخدام والتكلفة المرتبطة بإنشاء القوالب بالذكاء الاصطناعي. لا نعالج بيانات بطاقات الدفع داخل Typo AI حاليًا.</li>
                <li>بيانات إعداد Telegram الاختيارية، مثل رمز البوت ومعرّف المحادثة، إذا قررت ربط حسابك بالخدمة.</li>
                <li>ملفات تعريف الارتباط الضرورية لإدارة جلسة تسجيل الدخول وحماية الحساب.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">3. كيفية استخدام البيانات</h2>
              <p className="mt-3">
                نستخدم البيانات لتشغيل حسابك، حفظ مشاريعك وقوالبك، تنفيذ طلبات إنشاء المحتوى والصور، توفير الرصيد والخطة، حماية الخدمة من إساءة الاستخدام، والرد على طلبات الدعم والخصوصية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">4. متى نشارك البيانات</h2>
              <p className="mt-3">نشارك البيانات بالقدر اللازم لتقديم الخدمة مع مزودي الخدمة التاليين:</p>
              <ul className="mt-3 list-disc space-y-2 pr-6">
                <li><strong className="text-ink">Supabase:</strong> للمصادقة وقاعدة البيانات والتخزين وإدارة الجلسات ورسائل الحساب.</li>
                <li><strong className="text-ink">OpenRouter ومزودو نماذج الذكاء الاصطناعي المهيأون:</strong> لمعالجة الطلبات التي ترسلها لإنشاء المحتوى أو تصميم القوالب.</li>
                <li><strong className="text-ink">Pexels:</strong> للبحث عن صور مرتبطة بموضوع الشريحة عند استخدام القوالب المصورة.</li>
                <li><strong className="text-ink">Telegram:</strong> فقط عندما تربط بوتك وتختار إرسال الصور المصدّرة إلى محادثتك.</li>
                <li><strong className="text-ink">مزودو الاستضافة والبريد:</strong> لتشغيل الموقع وإرسال رسائل تأكيد البريد واستعادة كلمة المرور.</li>
              </ul>
              <p className="mt-3">لا نبيع بياناتك الشخصية أو نؤجرها. وعند فتح رابط WhatsApp للترقية، تتعامل مع WhatsApp مباشرةً وفق سياسة الخصوصية الخاصة بها.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">5. المحتوى الطبي والحساس</h2>
              <p className="mt-3">
                لا تُدخل بيانات تعريفية عن المرضى أو سجلات طبية أو معلومات صحية حساسة في المطالبات أو المشاريع. Typo AI ليست نظام سجلات طبية، والمحتوى الطبي المُنشأ يحتاج إلى مراجعة مهنية مستقلة قبل استخدامه أو نشره.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">6. الاحتفاظ بالبيانات وحذفها</h2>
              <p className="mt-3">
                نحتفظ ببيانات حسابك ومشاريعك ما دام حسابك نشطًا أو ما دام ذلك لازمًا لتقديم الخدمة. يمكنك حذف حسابك من{" "}
                <Link href="/settings" className="font-medium text-accent hover:underline">إعدادات الحساب</Link>؛ وعندها تُحذف سجلات الحساب المرتبطة من أنظمة التطبيق الفعالة. قد تبقى نسخ محدودة ومؤقتة في سجلات الأمان أو النسخ الاحتياطية وفق ممارسات مزودي الخدمة أو الالتزامات القانونية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">7. حقوقك وخياراتك</h2>
              <p className="mt-3">
                يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها، أو طلب معلومات عن طريقة معالجتها، عبر مراسلتنا على البريد المذكور أعلاه. قد نطلب معلومات معقولة للتحقق من هويتك قبل تنفيذ الطلب. يمكنك أيضًا تعديل معظم بيانات ملفك وتفضيلاتك أو حذف حسابك من الإعدادات.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">8. ملفات تعريف الارتباط</h2>
              <p className="mt-3">
                نستخدم ملفات تعريف الارتباط الضرورية لتسجيل الدخول والمحافظة على أمان جلسة الحساب. لا نستخدم عمدًا ملفات تعريف ارتباط إعلانية داخل المنتج في وضعه الحالي.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">9. المعالجة الدولية</h2>
              <p className="mt-3">
                قد تعالج خدماتنا أو مزودو الخدمة البيانات في دول غير بلدك. عند استخدام خدمات خارجية مثل مزودي الذكاء الاصطناعي أو Supabase أو Pexels أو Telegram، تخضع المعالجة أيضًا لسياساتهم وإجراءاتهم الخاصة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">10. الأطفال</h2>
              <p className="mt-3">
                لا تستهدف Typo AI الأطفال. لا تنشئ حسابًا أو تقدم بيانات طفل ما لم يكن ذلك مسموحًا به في بلدك وتحت إشراف ولي أمر أو وصي عند الاقتضاء.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">11. التحديثات على هذه السياسة</h2>
              <p className="mt-3">
                قد نحدّث هذه السياسة عند تغير الخدمة أو ممارسات البيانات. سننشر النسخة المحدّثة هنا ونغير تاريخ السريان أعلاه.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

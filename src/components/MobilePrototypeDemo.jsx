import { useMemo, useState } from "react";

const tabs = [
  { id: "home", label: "الرئيسية", icon: "⌂" },
  { id: "projects", label: "المشاريع", icon: "▣" },
  { id: "pricing", label: "التسعير", icon: "◫" },
  { id: "account", label: "الحساب", icon: "◌" },
];

const taskSets = {
  home: [
    { title: "مشروع فيلا الياسمين", meta: "جاهز للمراجعة", tone: "from-[#15345f] to-[#0d2344]" },
    { title: "تحديث مورد خرسانة", meta: "3 تنبيهات جديدة", tone: "from-[#875d13] to-[#c89a36]" },
    { title: "مقارنة أسعار السوق", meta: "فرصة توفير 8%", tone: "from-[#0f766e] to-[#134e4a]" },
  ],
  projects: [
    { title: "برج سكني", meta: "12 بندًا محفوظًا", tone: "from-[#243b64] to-[#142844]" },
    { title: "مستودع لوجستي", meta: "RFQ قيد الإرسال", tone: "from-[#9a3412] to-[#c2410c]" },
    { title: "مبنى إداري", meta: "جاهز للتصدير", tone: "from-[#4c1d95] to-[#6d28d9]" },
  ],
  pricing: [
    { title: "تسعير بند خرسانة", meta: "PDF + RFQ", tone: "from-[#0f2c56] to-[#1d4c8f]" },
    { title: "تسعير مبنى", meta: "سيناريوهين محفوظين", tone: "from-[#7c2d12] to-[#b45309]" },
    { title: "QS Premium", meta: "وصول كامل", tone: "from-[#1d4ed8] to-[#1e3a8a]" },
  ],
  account: [
    { title: "الحساب الاحترافي", meta: "الحالة: نشط", tone: "from-[#14532d] to-[#166534]" },
    { title: "إعدادات الإشعارات", meta: "3 خيارات مفعلة", tone: "from-[#1f2937] to-[#111827]" },
    { title: "أحدث التصديرات", meta: "آخر ملف قبل 10 دقائق", tone: "from-[#334155] to-[#0f172a]" },
  ],
};

function DemoCard({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`w-full rounded-[26px] bg-gradient-to-br ${item.tone} px-5 py-4 text-right text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-black">{item.title}</p>
          <p className="mt-1 text-[11px] text-white/70">{item.meta}</p>
        </div>
        <span className="rounded-full bg-white/12 px-3 py-1 text-[10px] font-bold">Open</span>
      </div>
    </button>
  );
}

export default function MobilePrototypeDemo() {
  const [activeTab, setActiveTab] = useState("pricing");
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = useMemo(() => taskSets[activeTab] || taskSets.pricing, [activeTab]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#efe8d8_0%,#f8f5ee_38%,#f1ede4_100%)] px-4 py-6">
      <div className="mx-auto max-w-[440px]">
        <div className="mb-4 rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#9d8b67]">Mobile Demo</p>
              <h1 className="mt-1 text-[23px] font-black text-[#0f2647]">نموذج موبايل تجريبي</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("screen");
                window.location.href = url.toString();
              }}
              className="rounded-2xl border border-[#d7cfbf] bg-white px-4 py-2 text-[12px] font-bold text-[#0f2647]"
            >
              رجوع
            </button>
          </div>
          <p className="mt-3 text-right text-[12px] leading-6 text-[#6d6d6d]">
            هذه شاشة تجريبية سريعة داخل التطبيق. نقدر نعدّل الأقسام أو الأزرار أو شكل البطاقات لحظيًا ونشوف النتيجة هنا مباشرة.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[390px] rounded-[42px] border-[10px] border-[#10213e] bg-[#f8f5ef] p-3 shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
          <div className="mx-auto mb-3 h-1.5 w-24 rounded-full bg-[#c8baa0]" />

          <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#fbfaf6_0%,#f4efe6_100%)]">
            <div className="bg-[linear-gradient(135deg,#12294d_0%,#173564_55%,#1c4884_100%)] px-5 pb-6 pt-5 text-white">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/55">Taseera Lab</p>
                  <p className="mt-1 text-[20px] font-black">واجهة تجريبية</p>
                </div>
                <div className="rounded-[18px] bg-white/10 px-3 py-2 text-center">
                  <div className="text-[10px] text-white/60">Quick Score</div>
                  <div className="text-[18px] font-black text-[#f0ca67]">92</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-white/10 p-3 text-right">
                  <p className="text-[10px] text-white/55">المهام المفتوحة</p>
                  <p className="mt-1 text-[20px] font-black">7</p>
                </div>
                <div className="rounded-[22px] bg-[#f0ca67] p-3 text-right text-[#12294d]">
                  <p className="text-[10px] text-[#12294d]/60">تصديرات اليوم</p>
                  <p className="mt-1 text-[20px] font-black">14</p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-4">
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-bold transition ${
                      activeTab === tab.id
                        ? "bg-[#10213e] text-[#f0ca67]"
                        : "bg-white text-[#5f6775] shadow-sm"
                    }`}
                  >
                    <span className="ml-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {cards.map((item) => (
                  <DemoCard key={item.title} item={item} onOpen={setSelectedCard} />
                ))}
              </div>

              <div className="mt-4 rounded-[24px] border border-[#eadfca] bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-[12px] font-black text-[#0f2647]">ملاحظات التجربة</p>
                <p className="mt-2 text-[11px] leading-6 text-[#667085]">
                  جرّب تبديل التبويبات أو افتح بطاقة من فوق. لو هذا الاتجاه مناسب، أقدر أحوله مباشرة إلى شاشة فعلية داخل التطبيق بدل نسخة تجريبية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedCard ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-6 pt-16 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="w-full max-w-[420px] rounded-[30px] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#d7cfbf]" />
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9d8b67]">Bottom Sheet</p>
                <h2 className="mt-1 text-[22px] font-black text-[#10213e]">{selectedCard.title}</h2>
                <p className="mt-2 text-[13px] leading-7 text-[#667085]">
                  هذا مثال لتجربة تفاعل موبايل سريع. نقدر نحول هذه النافذة إلى تفاصيل مشروع، نموذج RFQ، أو شاشة تصدير حسب اللي تبغاه.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button className="rounded-[18px] bg-[linear-gradient(135deg,#10213e_0%,#1e3f73_100%)] px-4 py-3 text-[13px] font-black text-[#f0ca67]">
                  الإجراء الرئيسي
                </button>
                <button className="rounded-[18px] border border-[#d7cfbf] bg-[#faf8f3] px-4 py-3 text-[13px] font-bold text-[#10213e]">
                  إجراء ثانوي
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

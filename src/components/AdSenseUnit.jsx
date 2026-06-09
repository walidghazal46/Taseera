import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-6810176545596111";

// ─── AdSense Web Slot IDs ────────────────────────────────────────────────────
// هذه الـ slots خاصة بالموقع فقط (adsense.google.com)
// خطوات الحصول عليها:
//   1. سجّل دخول على adsense.google.com
//   2. إعلانات ← حسب وحدة الإعلان ← إنشاء وحدة إعلانية جديدة (Display ads)
//   3. انسخ رقم الـ slot (مثال: 1234567890) واستبدله هنا
// ⚠️ ملاحظة: slot IDs من AdMob (admob.google.com) لا تعمل هنا — هي مختلفة
export const AD_SLOTS = {
  default:           "XXXXXXXXXX", // ← استبدل بـ slot ID من AdSense (ليس AdMob)
  companiesMain:     "XXXXXXXXXX",
  suppliersMain:     "XXXXXXXXXX",
  analysisTop:       "XXXXXXXXXX",
  analysisActions:   "XXXXXXXXXX",
  analysisBottom:    "XXXXXXXXXX",
  areaForm:          "XXXXXXXXXX",
  areaResults:       "XXXXXXXXXX",
  areaSection:       "XXXXXXXXXX",
  csiDiv28:          "XXXXXXXXXX",
  selfPricing:       "XXXXXXXXXX",
};

export default function AdSenseUnit({ className = "", slotId }) {
  const ref    = useRef(null);
  const pushed = useRef(false);
  const slot   = slotId || AD_SLOTS.default;

  // لا تحمّل الإعلان إذا الـ Slot ID لسه placeholder
  const isReal = slot && slot !== "XXXXXXXXXX";

  useEffect(() => {
    if (!isReal || pushed.current) return;
    try {
      if (ref.current && ref.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch {
      // AdSense script not yet loaded
    }
  }, [isReal]);

  if (!isReal) {
    // في بيئة التطوير نُظهر placeholder بدل إرسال طلب فارغ
    if (process.env.NODE_ENV === "development") {
      return (
        <div className={`overflow-hidden rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center ${className}`}
          style={{ minHeight: 90 }}>
          <span className="text-[11px] text-slate-400 font-mono">AdSense — Slot ID مطلوب</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

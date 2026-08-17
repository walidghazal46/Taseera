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
  default:           "4497722161",
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

function isLocalAdPreview() {
  if (typeof window === "undefined") return false;
  const { hostname, protocol } = window.location;
  return (
    protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  );
}

export default function AdSenseUnit({ className = "", slotId }) {
  const ref    = useRef(null);
  const pushed = useRef(false);
  const slot   = slotId || AD_SLOTS.default;
  const localPreview = isLocalAdPreview();

  // لا تحمّل الإعلان إذا الـ Slot ID لسه placeholder
  const isReal = slot && slot !== "XXXXXXXXXX";

  useEffect(() => {
    if (!isReal || localPreview || pushed.current) return;
    try {
      if (ref.current && ref.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch {
      // AdSense script not yet loaded
    }
  }, [isReal, localPreview]);

  if (!isReal || localPreview) {
    if (!isReal && process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-dashed border-sky-200 bg-white/70 flex flex-col items-center justify-center text-center ${className}`}
        style={{ minHeight: 96, fontFamily: "'Cairo','Tajawal',sans-serif" }}
      >
        <span className="text-[11px] font-black tracking-[0.16em] text-[#8b98bd]">مساحة إعلانية</span>
        <span className="mt-1 text-[11px] font-bold text-[#9a8455]">Google AdSense</span>
      </div>
    );
  }

  if (!isReal) {
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-2xl bg-white/70 ${className}`} style={{ minHeight: 96 }}>
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

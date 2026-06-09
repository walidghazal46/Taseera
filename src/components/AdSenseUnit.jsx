import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-6810176545596111";

// Slot IDs من حساب AdSense/AdMob
export const AD_SLOTS = {
  default:           "3409229133",
  companiesMain:     "3409229133",
  suppliersMain:     "3409229133",
  analysisTop:       "3409229133",
  analysisActions:   "3409229133",
  analysisBottom:    "3409229133",
  areaForm:          "3409229133",
  areaResults:       "3409229133",
  areaSection:       "3409229133",
  csiDiv28:          "3409229133",
  selfPricing:       "3409229133",
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

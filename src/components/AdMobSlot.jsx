import { useEffect, useId, useRef } from "react";
import ManagedAdBanner from "./ManagedAdBanner";

const AD_UNIT_ID = "ca-app-pub-6810176545596111/3409229133";
const REGISTRY_KEY = "__taseeraAdMobSlots";

function ensureRegistry() {
  if (!window[REGISTRY_KEY]) {
    window[REGISTRY_KEY] = new Map();
  }
  return window[REGISTRY_KEY];
}

function syncAdMobSlots() {
  if (!window.TaseeraAndroid?.updateAdMobSlots) return;

  const registry = ensureRegistry();
  const slots = [];
  const footer = document.querySelector(".app-footer-safe");
  const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight;

  registry.forEach(({ element, adUnitId }, id) => {
    if (!element?.isConnected) return;
    const rect = element.getBoundingClientRect();
    slots.push({
      id,
      adUnitId,
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      visible:
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < footerTop &&
        rect.bottom <= footerTop - 4 &&
        rect.left < window.innerWidth,
    });
  });

  try {
    window.TaseeraAndroid.updateAdMobSlots(JSON.stringify(slots));
  } catch {
    // Android bridge may be unavailable during early page boot.
  }
}

export default function AdMobSlot({ slotId, className = "", adBanner, canManageAds = false, onManageAds }) {
  const generatedId = useId().replace(/:/g, "");
  const id = slotId || `admob-${generatedId}`;
  const ref = useRef(null);
  const hasManagedAd = Boolean(adBanner?.enabled && adBanner?.imageUrl);

  useEffect(() => {
    const registry = ensureRegistry();
    if (hasManagedAd) {
      registry.delete(id);
      syncAdMobSlots();
      return undefined;
    }

    registry.set(id, { element: ref.current, adUnitId: AD_UNIT_ID });

    const handleLayoutChange = () => syncAdMobSlots();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleLayoutChange) : null;
    if (ref.current && observer) observer.observe(ref.current);

    window.addEventListener("resize", handleLayoutChange);
    window.addEventListener("scroll", handleLayoutChange, true);
    const interval = window.setInterval(handleLayoutChange, 600);
    handleLayoutChange();

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleLayoutChange);
      window.removeEventListener("scroll", handleLayoutChange, true);
      window.clearInterval(interval);
      registry.delete(id);
      syncAdMobSlots();
    };
  }, [id, hasManagedAd]);

  if (hasManagedAd) {
    return (
      <ManagedAdBanner
        adBanner={adBanner}
        slotId={id}
        className={className}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
      />
    );
  }

  return (
    <section
      ref={ref}
      data-admob-slot={id}
      className={`relative mx-auto w-full max-w-[336px] overflow-hidden rounded-[22px] border border-sky-100 bg-white/72 shadow-[0_10px_30px_rgba(8,37,85,0.08)] ${className}`}
      style={{
        minHeight: 64,
        fontFamily: "'Cairo','Tajawal',sans-serif",
      }}
      aria-label="مساحة إعلان"
    >
      {canManageAds && (
        <button
          type="button"
          onClick={() => onManageAds?.(id, adBanner)}
          className="absolute left-3 top-3 z-10 rounded-full border border-sky-200 bg-white/85 px-3 py-1 text-[10px] font-black text-[#082555] shadow-sm"
        >
          إدارة
        </button>
      )}
      {!window.TaseeraAndroid && (
        <div className="flex h-16 flex-col items-center justify-center gap-1 text-center text-[#8b98bd]">
          <span className="text-[11px] font-black tracking-[0.24em]">ADMOB</span>
          <span className="text-[12px] font-bold">مساحة إعلان داخل التطبيق</span>
          <span className="text-[10px] font-bold text-[#9a8455]">لإضافة إعلان هنا تواصل معنا 00201064463650</span>
        </div>
      )}
    </section>
  );
}

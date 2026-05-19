import { useEffect, useMemo, useRef, useState } from "react";
import CountryPicker from "../components/CountryPicker";
import PageHeader from "../components/PageHeader";
import PricingWorkspace from "../components/PricingWorkspace";
import { getAppText } from "../data/appText";
import { COUNTRY_NAME_TO_CODE } from "../data/csiData";

export default function PricingPage(props) {
  const text = getAppText(props.settings?.language);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const workspaceBackHandlerRef = useRef(() => false);

  const handleSelectCountry = (country) => {
    props.onUpdateSetting?.("country", country);
    setSelectedCountry(country);
  };

  useEffect(() => {
    if (!props.navigationBridge?.registerBackHandler) return undefined;
    return props.navigationBridge.registerBackHandler(() => {
      if (workspaceBackHandlerRef.current?.()) return true;
      if (selectedCountry) {
        setSelectedCountry(null);
        return true;
      }
      return false;
    });
  }, [props.navigationBridge, selectedCountry]);

  const bridgedNavigation = useMemo(() => ({
    ...(props.navigationBridge || {}),
    registerBackHandler: (handler) => {
      workspaceBackHandlerRef.current = handler || (() => false);
      return () => {
        if (workspaceBackHandlerRef.current === handler) {
          workspaceBackHandlerRef.current = () => false;
        }
      };
    },
  }), [props.navigationBridge]);

  if (!selectedCountry) {
    const isAr = props.settings?.language !== "en";
    return (
      <div className="flex flex-col gap-4">

        {/* ── مجتمع التسعير card — يظهر فوق قايمة الدول ── */}
        <button
          type="button"
          onClick={() => props.onNavigate?.("community")}
          className="group relative overflow-hidden rounded-[22px] active:scale-[0.98] transition-transform duration-150 text-right"
          style={{ background: "linear-gradient(130deg,#065f46 0%,#047857 55%,#059669 100%)", minHeight: 110, fontFamily: "'Cairo','Tajawal',sans-serif" }}
          dir="rtl"
        >
          {/* pattern */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }} />
          <div className="relative flex items-center gap-4 px-5 py-5">
            {/* icon */}
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl text-[26px] ring-1 ring-emerald-400/30"
              style={{ background: "linear-gradient(145deg,#047857,#065f46)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15),0 4px 16px rgba(5,150,105,0.35)" }}>
              👥
            </div>
            {/* text */}
            <div className="flex-1">
              <h3 className="text-[17px] font-black text-white leading-tight">
                {isAr ? "مجتمع التسعير" : "Pricing Community"}
              </h3>
              <span className="inline-flex mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                style={{ background: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}>
                COMMUNITY · LIVE
              </span>
              <p className="mt-1 text-[13px] leading-relaxed text-white/90">
                {isAr
                  ? "شارك واكتشف أسعاراً حقيقية من مقاولين حول العالم"
                  : "Share and discover real prices from contractors worldwide"}
              </p>
            </div>
            {/* arrow */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-white/50 group-hover:text-white transition-colors">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        </button>

        <CountryPicker
          language={props.settings?.language}
          icon="💰"
          titleAr="اختر دولة التسعير"
          titleEn="Select Pricing Country"
          subtitleAr="اختر الدولة لتحديد أسعار ومعايير التسعير المناسبة"
          subtitleEn="Choose a country to apply the correct pricing standards"
          onSelect={handleSelectCountry}
          sessionMeta={props.sessionMeta}
          authMode={props.authMode}
          section="pricing"
        />
      </div>
    );
  }

  const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || "sa";

  const accessStatus = props.accessStatus;
  const isAdmin = props.isAdmin;
  const isAr = props.settings?.language !== "en";
  const daysLeft = accessStatus?.daysLeft;

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(isAr ? "ar-SA" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const badge = (() => {
    if (isAdmin) return {
      icon: "∞",
      label: isAr ? "صلاحية كاملة" : "Full Access",
      sub: isAr ? "بدون انتهاء" : "No expiry",
      gradient: "from-emerald-500 to-teal-500",
      bg: "border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50",
      iconCls: "text-emerald-600",
      labelCls: "text-emerald-800",
      subCls: "text-emerald-600",
    };
    if (daysLeft != null && daysLeft > 0) {
      const endDate = accessStatus?.trialEndDate ? formatDate(accessStatus.trialEndDate) : null;
      return {
        icon: daysLeft <= 3 ? "⚡" : "⏳",
        label: isAr ? `${daysLeft} ${daysLeft === 1 ? "يوم متبقي" : "أيام متبقية"}` : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
        sub: endDate ? (isAr ? `تنتهي ${endDate}` : `Expires ${endDate}`) : (isAr ? "فترة تجريبية" : "Free Trial"),
        bg: daysLeft <= 3 ? "border-orange-200 bg-gradient-to-l from-orange-50 to-amber-50" : "border-blue-200 bg-gradient-to-l from-blue-50 to-indigo-50",
        iconCls: daysLeft <= 3 ? "text-orange-500" : "text-blue-500",
        labelCls: daysLeft <= 3 ? "text-orange-800" : "text-blue-800",
        subCls: daysLeft <= 3 ? "text-orange-500" : "text-blue-500",
      };
    }
    if (accessStatus?.canAccess) {
      const endDate = accessStatus?.packageEndDate ? formatDate(accessStatus.packageEndDate) : null;
      return {
        icon: "✅",
        label: isAr ? "اشتراك فعّال" : "Active Subscription",
        sub: endDate ? (isAr ? `تنتهي ${endDate}` : `Expires ${endDate}`) : (isAr ? "غير محدود" : "Unlimited"),
        bg: "border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50",
        iconCls: "text-emerald-500",
        labelCls: "text-emerald-800",
        subCls: "text-emerald-600",
      };
    }
    return null;
  })();

  return (
    <div className="grid gap-2.5">
      <PageHeader
        eyebrow={text.pages.pricing.eyebrow}
        title=""
        description={text.pages.pricing.description}
      />
      {badge && (
        <div className={`grid gap-2 ${isAdmin ? "grid-cols-1" : "grid-cols-2"}`}>
          {/* Badge 1 — access status */}
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 ${badge.bg}`}
            style={{ height: 52, fontFamily: "'Cairo','Tajawal',sans-serif" }}
            dir={isAr ? "rtl" : "ltr"}
          >
            <span className={`text-xl ${badge.iconCls}`}>{badge.icon}</span>
            <div className="flex flex-col justify-center">
              <span className={`text-[13px] font-black leading-tight ${badge.labelCls}`}>{badge.label}</span>
              <span className={`text-[10px] font-semibold leading-tight ${badge.subCls}`}>{badge.sub}</span>
            </div>
          </div>

          {/* Badge 2 — packages (hidden for admin) */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => props.onOpenSubscription?.()}
              className="flex items-center gap-3 rounded-2xl border px-4 border-violet-200 bg-gradient-to-l from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 active:scale-[0.97] transition-all"
              style={{ height: 52, fontFamily: "'Cairo','Tajawal',sans-serif" }}
              dir={isAr ? "rtl" : "ltr"}
            >
              <span className="text-xl text-violet-500">📦</span>
              <div className="flex flex-col justify-center text-start">
                <span className="text-[13px] font-black leading-tight text-violet-800">
                  {isAr ? "الباقات" : "Packages"}
                </span>
                <span className="text-[10px] font-semibold leading-tight text-violet-500">
                  {isAr ? "اشترك الآن" : "Subscribe now"}
                </span>
              </div>
            </button>
          )}
        </div>
      )}
      <PricingWorkspace {...props} navigationBridge={bridgedNavigation} initialCountry={countryCode} />
    </div>
  );
}

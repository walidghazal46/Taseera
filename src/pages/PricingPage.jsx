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
    return (
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
      )}
      <PricingWorkspace {...props} navigationBridge={bridgedNavigation} initialCountry={countryCode} />
    </div>
  );
}

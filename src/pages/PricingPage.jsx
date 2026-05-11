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
  const isAr = props.settings?.language !== "en";
  const daysLeft = accessStatus?.daysLeft;
  const showTrialBadge = daysLeft != null && daysLeft > 0;

  return (
    <div className="grid gap-2.5">
      <PageHeader
        eyebrow={text.pages.pricing.eyebrow}
        title=""
        description={text.pages.pricing.description}
      />
      {showTrialBadge && (
        <div
          className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4"
          style={{ height: 40, fontFamily: "'Cairo','Tajawal',sans-serif" }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <span className="text-xs font-bold text-blue-700">
            {isAr ? "الفترة التجريبية" : "Free Trial"}
          </span>
          <span className="text-xs font-black text-blue-900">
            {isAr
              ? `${daysLeft} ${daysLeft === 1 ? "يوم متبقي" : "أيام متبقية"}`
              : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
          </span>
        </div>
      )}
      <PricingWorkspace {...props} navigationBridge={bridgedNavigation} initialCountry={countryCode} />
    </div>
  );
}

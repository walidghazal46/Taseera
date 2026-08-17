import { useState } from "react";
import AdSenseUnit from "../components/AdSenseUnit";
import CompaniesPanel from "../components/CompaniesPanel";
import CountryPicker from "../components/CountryPicker";
import ManagedAdBanner from "../components/ManagedAdBanner";
import PageHeader from "../components/PageHeader";
import { getAppText } from "../data/appText";

export default function CompaniesPage(props) {
  const text = getAppText(props.settings?.language);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleSelectCountry = (country) => {
    props.onUpdateSetting?.("country", country);
    setSelectedCountry(country);
  };

  if (!selectedCountry) {
    return (
      <CountryPicker
        language={props.settings?.language}
        icon="🏢"
        titleAr="اختر دولة العمل"
        titleEn="Select Work Country"
        subtitleAr="ابدأ من الدولة المناسبة ثم تابع إلى دليل الشركات والمشاريع"
        subtitleEn="Start with your country then browse companies and projects"
        onSelect={handleSelectCountry}
        sessionMeta={props.sessionMeta}
        authMode={props.authMode}
        section="companies"
        renderAfterCountry={(country) => (
          country.value === "السعودية" || country.value === "مصر" ? (
            <AdSenseUnit className="mt-2 shrink-0" />
          ) : country.value === "الإمارات" ? (
            <ManagedAdBanner
              slotId="companiesCountryPickerAfterUae"
              adBanner={props.adBanners?.companiesCountryPickerAfterUae}
              canManageAds={props.canManageAds}
              onManageAds={props.onOpenAdSettings}
              className="mt-2 mb-24 shrink-0 lg:mb-6"
              placeholderTitle="إعلان بعد مربع الإمارات في صفحة الشركات"
            />
          ) : null
        )}
      />
    );
  }

  return (
    <div className="grid gap-3 pb-2">
      <PageHeader
        eyebrow={text.pages.companies.eyebrow}
        title=""
        description={text.pages.companies.description}
      />
      <CompaniesPanel {...props} initialCountry={selectedCountry} />
    </div>
  );
}

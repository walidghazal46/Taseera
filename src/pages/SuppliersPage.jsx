import { useState } from "react";
import AdSenseUnit from "../components/AdSenseUnit";
import CountryPicker from "../components/CountryPicker";
import ManagedAdBanner from "../components/ManagedAdBanner";
import PageHeader from "../components/PageHeader";
import SuppliersPanel from "../components/SuppliersPanel";
import { getAppText } from "../data/appText";

export default function SuppliersPage(props) {
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
        onSelect={handleSelectCountry}
        sessionMeta={props.sessionMeta}
        authMode={props.authMode}
        section="suppliers"
        renderAfterCountry={(country) => (
          country.value === "السعودية" || country.value === "مصر" ? (
            <AdSenseUnit className="mt-2 shrink-0" />
          ) : country.value === "الإمارات" ? (
            <ManagedAdBanner
              slotId="suppliersCountryPickerAfterUae"
              adBanner={props.adBanners?.suppliersCountryPickerAfterUae}
              canManageAds={props.canManageAds}
              onManageAds={props.onOpenAdSettings}
              className="mt-2 mb-24 shrink-0 lg:mb-6"
              placeholderTitle="إعلان بعد مربع الإمارات في صفحة الموردين"
            />
          ) : null
        )}
      />
    );
  }

  return (
    <div className="grid gap-3 pb-2">
      <PageHeader
        eyebrow={text.pages.suppliers.eyebrow}
        title=""
        description={text.pages.suppliers.description}
        density="tight"
      />
      <SuppliersPanel {...props} initialCountry={selectedCountry} />
    </div>
  );
}

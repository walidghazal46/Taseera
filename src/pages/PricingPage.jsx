import { useState } from "react";
import CountryPicker from "../components/CountryPicker";
import PageHeader from "../components/PageHeader";
import PricingWorkspace from "../components/PricingWorkspace";
import { getAppText } from "../data/appText";
import { COUNTRY_NAME_TO_CODE } from "../data/csiData";

export default function PricingPage(props) {
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
        icon="💰"
        titleAr="اختر دولة التسعير"
        titleEn="Select Pricing Country"
        subtitleAr="اختر الدولة لتحديد أسعار ومعايير التسعير المناسبة"
        subtitleEn="Choose a country to apply the correct pricing standards"
        onSelect={handleSelectCountry}
      />
    );
  }

  const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || "sa";

  return (
    <div className="grid gap-2.5">
      <PageHeader
        eyebrow={text.pages.pricing.eyebrow}
        title=""
        description={text.pages.pricing.description}
      />
      <PricingWorkspace {...props} initialCountry={countryCode} />
    </div>
  );
}

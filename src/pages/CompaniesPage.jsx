import { useState } from "react";
import CompaniesPanel from "../components/CompaniesPanel";
import CountryPicker from "../components/CountryPicker";
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
      <CompaniesPanel {...props} />
    </div>
  );
}

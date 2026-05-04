import { useState } from "react";
import CountryPicker from "../components/CountryPicker";
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
      <div style={{ margin: "-1.5rem -1rem 0" }}>
        <CountryPicker
          language={props.settings?.language}
          onSelect={handleSelectCountry}
          sessionMeta={props.sessionMeta}
          authMode={props.authMode}
          section="suppliers"
        />
      </div>
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

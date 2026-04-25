import { useState } from "react";
import CountryPicker from "../components/CountryPicker";
import PageHeader from "../components/PageHeader";
import SuppliersPanel from "../components/SuppliersPanel";
import { getAppText } from "../data/appText";

export default function SuppliersPage(props) {
  const text = getAppText(props.settings?.language);
  const [selectedCountry, setSelectedCountry] = useState(null);

  if (!selectedCountry) {
    return <CountryPicker language={props.settings?.language} onSelect={setSelectedCountry} />;
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

import PageHeader from "../components/PageHeader";
import SuppliersPanel from "../components/SuppliersPanel";
import { getAppText } from "../data/appText";

export default function SuppliersPage(props) {
  const text = getAppText(props.settings?.language);

  return (
    <div className="grid gap-3 pb-2">
      <PageHeader
        eyebrow={text.pages.suppliers.eyebrow}
        title=""
        description={text.pages.suppliers.description}
        density="tight"
      />
      <SuppliersPanel {...props} />
    </div>
  );
}

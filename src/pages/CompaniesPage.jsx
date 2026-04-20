import CompaniesPanel from "../components/CompaniesPanel";
import PageHeader from "../components/PageHeader";
import { getAppText } from "../data/appText";

export default function CompaniesPage(props) {
  const text = getAppText(props.settings?.language);

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

import PageHeader from "../components/PageHeader";
import PricingWorkspace from "../components/PricingWorkspace";
import { getAppText } from "../data/appText";

export default function PricingPage(props) {
  const text = getAppText(props.settings?.language);

  return (
    <div className="grid min-h-full gap-2.5">
      <PageHeader
        eyebrow={text.pages.pricing.eyebrow}
        title=""
        description={text.pages.pricing.description}
      />
      <PricingWorkspace {...props} />
    </div>
  );
}

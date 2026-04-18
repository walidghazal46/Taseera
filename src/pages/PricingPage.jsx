import PageHeader from "../components/PageHeader";
import PricingWorkspace from "../components/PricingWorkspace";

export default function PricingPage(props) {
  return (
    <div className="grid min-h-full gap-3">
      <PageHeader
        eyebrow="التسعير"
        title="تحليل وتسعير بنود المقاولات"
        description="اختر البند، حلل التكاليف المباشرة وغير المباشرة، أضف الربح، وقارن السعر مع السوق للوصول إلى قرار أسرع وأدق."
      />
      <PricingWorkspace {...props} />
    </div>
  );
}

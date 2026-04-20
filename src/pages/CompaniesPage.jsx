import CompaniesPanel from "../components/CompaniesPanel";
import PageHeader from "../components/PageHeader";

export default function CompaniesPage(props) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden">
      <PageHeader
        eyebrow="الشركات"
        title=""
        description="استعرض الشركات والمقاولين، اختر المشروع المناسب للتسعير، وأنشئ شركات أو مشاريع جديدة داخل نفس التجربة."
      />
      <CompaniesPanel {...props} />
    </div>
  );
}

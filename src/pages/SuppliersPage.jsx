import PageHeader from "../components/PageHeader";
import SuppliersPanel from "../components/SuppliersPanel";

export default function SuppliersPage(props) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden">
      <PageHeader
        eyebrow="الموردين"
        title="دليل الموردين وعروض الأسعار"
        description="اعرض الموردين المرتبطين بالسوق، وافتح بياناتهم، وقارن بينهم للوصول إلى أفضل جهة توريد لكل بند."
      />
      <SuppliersPanel {...props} />
    </div>
  );
}

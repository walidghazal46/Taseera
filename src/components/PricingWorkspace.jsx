import { useEffect, useMemo, useState } from "react";

import { BoxIcon, PricingIcon, TruckIcon, UserIcon } from "./icons";
import { resourcesDatabase } from "../data/sampleData";
import { computeItemPricing } from "../data/pricingEngine";

const categoryOptions = [
  { label: "أعمال إنشائية", enabled: true },
  { label: "أعمال معمارية", enabled: true },
  { label: "أعمال كهربائية", enabled: true },
  { label: "أعمال ميكانيكية", enabled: true },
];

function money(value) {
  return `${Number(value || 0).toLocaleString("en-US")} ريال`;
}

function Indicator({ tone }) {
  const map = {
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    red: "bg-red-500",
  };

  return <span className={`h-2.5 w-2.5 rounded-full ${map[tone]}`} />;
}

function MiniChart() {
  return (
    <div className="mt-1.5 h-14 rounded-[12px] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe1_100%)] p-2">
      <div className="relative h-full w-full">
        <div className="absolute inset-x-0 bottom-3 h-[2px] bg-[#d6c1a0]" />
        <div className="absolute bottom-3 left-0 right-0 h-9">
          <svg viewBox="0 0 220 60" className="h-full w-full">
            <path
              d="M0 42 C20 44, 35 20, 54 26 S90 48, 112 30 S152 16, 174 32 S198 44, 220 24"
              fill="none"
              stroke="#c9a15b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="176" cy="32" r="4" fill="#22c55e" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, value, tone = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f4ecdf] text-[#b8893d]">
          {icon}
        </span>
        <p className="text-[11px] font-bold text-slate-900">{title}</p>
      </div>
      {value ? <p className={`text-[11px] font-bold ${tone}`}>{value}</p> : null}
    </div>
  );
}

function ResourceRow({ line, onPriceChange, expanded, onToggleFormula }) {
  return (
    <div className="rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
      <div className="grid grid-cols-[1.8fr_.8fr_.9fr_1fr] items-center gap-1">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-slate-900">
            {line.resource?.icon} {line.resource?.name}
          </p>
          <p className="text-[9px] text-slate-500">
            {line.consumptionRate} {line.resource?.unit}
          </p>
        </div>
        <p className="text-[10px] text-slate-600">{line.resource?.category === "material" ? "مواد" : line.resource?.category === "labor" ? "عمالة" : "معدات"}</p>
        <input
          value={line.unitPrice}
          onChange={(event) => onPriceChange(line.resource.id, event.target.value)}
          className="w-full rounded-[8px] border border-[#eadfca] px-1.5 py-1 text-[10px] outline-none"
        />
        <button
          type="button"
          onClick={() => onToggleFormula(line.resourceId)}
          className="text-left text-[10px] font-bold text-slate-900"
        >
          {money(line.lineCost)}
        </button>
      </div>
      {expanded ? (
        <div className="mt-1 rounded-[8px] bg-[#faf6ef] px-2 py-1 text-[9px] text-slate-600">
          {`${line.consumptionRate} × ${Number(line.unitPrice).toLocaleString("en-US")} × ${line.locationFactor} = ${Number(line.lineCost).toLocaleString("en-US")} ريال`}
        </div>
      ) : null}
    </div>
  );
}

function CostPill({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-[#b8893d]">{icon}</span>
        <span className="text-[10px] text-slate-600">{label}</span>
      </div>
      <span className="text-[10px] font-bold text-slate-900">{money(value)}</span>
    </div>
  );
}

function CategoryCard({ label, count, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[94%] justify-self-center rounded-[16px] border px-3 py-2 text-right shadow-sm transition ${
        active ? "border-[#d8b16c] bg-[#fff8ee]" : "border-[#eadfca] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="rounded-full bg-[#f4ecdf] px-2 py-0.5 text-[9px] font-bold text-[#b8893d]">
          {count}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <p className="truncate text-[11px] font-bold text-slate-900">{label}</p>
          <span className="shrink-0 text-[16px] leading-none">{icon}</span>
        </div>
      </div>
    </button>
  );
}

export default function PricingWorkspace({
  authMode,
  pricingCatalog,
  selectedPricingItemId,
  onSelectPricingItem,
  settings,
}) {
  const [filter, setFilter] = useState("أعمال إنشائية");
  const [activeSection, setActiveSection] = useState("items");
  const [itemsView, setItemsView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [profit, setProfit] = useState(settings?.profitPercent ?? 15);
  const [resourceOverrides, setResourceOverrides] = useState({});
  const [expandedFormulaId, setExpandedFormulaId] = useState(null);

  const selectedItem = useMemo(
    () => pricingCatalog.find((item) => item.id === selectedPricingItemId) || pricingCatalog[0],
    [pricingCatalog, selectedPricingItemId]
  );

  const categoryCounts = useMemo(
    () =>
      categoryOptions.map((option) => ({
        ...option,
        count: pricingCatalog.filter((item) => item.category === option.label).length,
      })),
    [pricingCatalog]
  );

  const categoryCatalog = useMemo(
    () => pricingCatalog.filter((item) => item.category === filter),
    [pricingCatalog, filter]
  );

  const filteredCatalog = useMemo(
    () =>
      categoryCatalog.filter((item) => {
        if (itemsView === "featured" && item.source?.sourceName) {
          return false;
        }

        if (itemsView === "imported" && !item.source?.sourceName) {
          return false;
        }

        if (!searchTerm.trim()) {
          return true;
        }

        const query = searchTerm.trim();
        return (
          item.name.includes(query) ||
          item.code?.toLowerCase().includes(query.toLowerCase()) ||
          item.source?.sourceCategory?.includes(query)
        );
      }),
    [categoryCatalog, itemsView, searchTerm]
  );
  const isComingSoonCategory = !categoryOptions.find((option) => option.label === filter)?.enabled;

  const itemViewCounts = useMemo(
    () => ({
      all: categoryCatalog.length,
      featured: categoryCatalog.filter((item) => !item.source?.sourceName).length,
      imported: categoryCatalog.filter((item) => item.source?.sourceName).length,
    }),
    [categoryCatalog]
  );

  const pageSize = 5;
  const totalItemPages = Math.max(1, Math.ceil(filteredCatalog.length / pageSize));
  const pagedCatalog = filteredCatalog.slice(
    (itemsPage - 1) * pageSize,
    itemsPage * pageSize
  );

  useEffect(() => {
    if (!filteredCatalog.some((item) => item.id === selectedPricingItemId) && filteredCatalog[0]) {
      onSelectPricingItem(filteredCatalog[0].id);
    }
  }, [filteredCatalog, onSelectPricingItem, selectedPricingItemId]);

  useEffect(() => {
    setItemsPage(1);
  }, [filter, itemsView, searchTerm]);

  useEffect(() => {
    if (itemsPage > totalItemPages) {
      setItemsPage(totalItemPages);
    }
  }, [itemsPage, totalItemPages]);

  useEffect(() => {
    setProfit(selectedItem ? settings?.profitPercent ?? 15 : 15);
    setQuantity(1);
    setResourceOverrides({});
    setExpandedFormulaId(null);
  }, [selectedItem, settings?.profitPercent]);

  const result = useMemo(
    () =>
      computeItemPricing({
        item: selectedItem,
        resources: resourcesDatabase,
        quantity: Number(quantity) || 0,
        overheadPercent: settings?.overheadPercent ?? 0,
        profitPercent: Number(profit) || 0,
        locationFactor: settings?.locationFactor ?? 1,
        overrides: resourceOverrides,
      }),
    [profit, quantity, resourceOverrides, selectedItem, settings?.locationFactor, settings?.overheadPercent]
  );

  const changePrice = (resourceId, value) => {
    setResourceOverrides((current) => ({
      ...current,
      [resourceId]: Number(value) || 0,
    }));
  };

  return (
    <div className="grid gap-2 pb-2">
      <div className="rounded-[20px] bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-2.5 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
        <div className="mb-1.5 flex gap-1 rounded-[14px] bg-white/10 p-1">
          {[
            { id: "items", label: "البنود" },
            { id: "analysis", label: "التحليل" },
            { id: "market", label: "السوق" },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 rounded-[11px] px-2 py-1.5 text-[10px] font-bold transition ${
                activeSection === section.id ? "bg-[#d8b16c] text-white" : "text-white/75"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {isComingSoonCategory ? (
        <div className="rounded-[18px] border border-dashed border-[#d9c59b] bg-white/90 p-4 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-900">{filter}</p>
          <p className="mt-1 text-xs text-slate-500">
            قريبًا بعد تجميع وتحليل الداتا الخاصة ببنود هذا القسم.
          </p>
        </div>
      ) : (
        <>
          {activeSection === "items" ? (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                {categoryCounts.map((category) => (
                  <CategoryCard
                    key={category.label}
                    label={category.label}
                    count={category.count}
                    icon={
                      category.label === "أعمال إنشائية"
                        ? "🏗️"
                        : category.label === "أعمال معمارية"
                          ? "🧱"
                          : category.label === "أعمال كهربائية"
                            ? "⚡"
                            : "🛠️"
                    }
                    active={filter === category.label}
                    onClick={() => setFilter(category.label)}
                  />
                ))}
              </div>

              <div className="rounded-[18px] border border-[#eadfca] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <div className="flex gap-1 rounded-[14px] bg-[#f8f5ee] p-1">
                  {[
                    { id: "all", label: "كل البنود", count: itemViewCounts.all },
                    { id: "featured", label: "أساسية", count: itemViewCounts.featured },
                    { id: "imported", label: "مستوردة", count: itemViewCounts.imported },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setItemsView(tab.id)}
                      className={`flex-1 rounded-[11px] px-2 py-1.5 text-[10px] font-bold transition ${
                        itemsView === tab.id
                          ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <span>{tab.label}</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px]">
                          {tab.count}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 rounded-[12px] bg-[#fff8ee] px-2 py-2">
                  <div className="flex items-center gap-2">
                    <p className="whitespace-nowrap text-[10px] font-semibold text-slate-700">
                      {filter}
                    </p>
                    <div className="flex-1 rounded-[10px] border border-[#eadfca] bg-white px-2 py-1">
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={`ابحث داخل ${filter}`}
                        className="w-full bg-transparent text-[10px] text-slate-700 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <p className="text-[#b8893d]">{filteredCatalog.length} بند ظاهر</p>
                    <p className="text-slate-500">
                      صفحة {itemsPage} من {totalItemPages}
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid gap-1.5">
                  {pagedCatalog.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectPricingItem(item.id);
                        setActiveSection("analysis");
                      }}
                      className={`mx-auto grid h-[44px] w-[96%] grid-rows-[auto_auto_auto] rounded-[14px] border px-2 py-1 text-right shadow-sm ${
                        item.id === selectedPricingItemId
                          ? "border-[#d8b16c] bg-[#fffaf1]"
                          : "border-[#eadfca] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="line-clamp-1 text-[10px] font-bold leading-4 text-slate-900">{item.name}</p>
                        <span className="text-[13px] leading-none">{item.icon}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-slate-500">
                        <span>{item.code}</span>
                        <span>{item.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold leading-none text-[#b8893d]">
                          {`متوسط ${item.marketAverage}`}
                        </span>
                        <span className="rounded-full bg-[#d5ab61] px-1.5 py-0.5 text-[8px] font-bold leading-none text-white">
                          فتح
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setItemsPage((current) => Math.max(1, current - 1))}
                    disabled={itemsPage === 1}
                    className={`rounded-[12px] px-3 py-1.5 text-[10px] font-bold ${
                      itemsPage === 1
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "border border-[#d8b16c] bg-white text-[#b8893d]"
                    }`}
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItemsPage((current) => Math.min(totalItemPages, current + 1))
                    }
                    disabled={itemsPage === totalItemPages}
                    className={`rounded-[12px] px-3 py-1.5 text-[10px] font-bold ${
                      itemsPage === totalItemPages
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                    }`}
                  >
                    التالي
                  </button>
                </div>
              </div>

              {!filteredCatalog.length ? (
                <div className="rounded-[14px] border border-dashed border-[#dec89a] bg-[#fffdfa] px-3 py-4 text-center text-[11px] text-slate-500">
                  لا توجد نتائج مطابقة للبحث داخل هذا القسم.
                </div>
              ) : null}
            </>
          ) : null}

          {(activeSection === "analysis" || activeSection === "market") && (
            <div className="rounded-[20px] border border-[#dec89a] bg-white p-2.5 shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
        <div className="rounded-[16px] bg-[linear-gradient(180deg,#1b2f56_0%,#132443_100%)] px-3 py-2 text-white">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#d8b16c]">{selectedItem.code}</span>
            <p className="truncate text-[13px] font-bold">{selectedItem.name}</p>
            <span className="text-[#d8b16c]">›</span>
          </div>
          {selectedItem.source?.sourceName ? (
            <p className="mt-1 text-[9px] text-white/70">
              مستورد من {selectedItem.source.sourceName} - {selectedItem.source.currency}
            </p>
          ) : null}
        </div>

        <div className="mt-2 grid gap-2">
          {activeSection === "analysis" ? (
            <>
          <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-1.5">
            <SectionTitle
              icon={<PricingIcon className="h-3 w-3" />}
              title="مدخلات المشروع"
              value={`${selectedItem.unit}`}
            />
            <div className="mt-1 grid grid-cols-4 gap-1">
              <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                <p className="text-[9px] text-slate-500">الكمية</p>
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="mt-0.5 w-full border-0 p-0 text-[11px] font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                <p className="text-[9px] text-slate-500">Overhead</p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-900">%{settings?.overheadPercent ?? 0}</p>
              </div>
              <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                <p className="text-[9px] text-slate-500">Profit</p>
                <div className="mt-0.5 flex items-center justify-center gap-0.5">
                  <span className="text-[11px] font-bold text-slate-900">%</span>
                  <input
                  value={profit}
                  onChange={(event) => setProfit(event.target.value)}
                  className="w-full border-0 bg-transparent p-0 text-center text-[11px] font-bold text-slate-900 outline-none"
                />
                </div>
              </div>
              <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                <p className="text-[9px] text-slate-500">Factor</p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-900">{settings?.locationFactor ?? 1}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
            <SectionTitle
              icon={<BoxIcon className="h-3 w-3" />}
              title="تحليل الموارد"
              value={`${result.recipeLines.length} موارد`}
            />
            <div className="mt-1.5 grid gap-1">
              {result.recipeLines.map((line) => (
                <ResourceRow
                  key={line.resourceId}
                  line={line}
                  onPriceChange={changePrice}
                  expanded={expandedFormulaId === line.resourceId}
                  onToggleFormula={(resourceId) =>
                    setExpandedFormulaId((current) =>
                      current === resourceId ? null : resourceId
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
            <SectionTitle
              icon={<UserIcon className="h-3 w-3" />}
              title="التكاليف المباشرة"
              value={money(result.totalDirectCost)}
            />
            <div className="mt-1.5 grid gap-1">
              <CostPill icon={<BoxIcon className="h-3 w-3" />} label="مواد" value={result.materialCost} />
              <CostPill icon={<UserIcon className="h-3 w-3" />} label="عمالة" value={result.laborCost} />
              <CostPill icon={<TruckIcon className="h-3 w-3" />} label="معدات" value={result.equipmentCost} />
            </div>
          </div>

          <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
            <SectionTitle
              icon={<TruckIcon className="h-3 w-3" />}
              title="التكاليف غير المباشرة"
              value={money(result.totalIndirectCost)}
            />
            <div className="mt-1.5 grid gap-1">
              {result.indirectLines.map((line) => (
                <div key={line.name} className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                  <span className="text-[10px] text-slate-600">{line.name}</span>
                  <span className="text-[10px] font-bold text-slate-900">{money(line.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-1">
            <SectionTitle
              icon={<PricingIcon className="h-3 w-3" />}
              title="أسعار السوق"
              value={money(selectedItem.marketAverage)}
            />
            <div className="mt-0.5 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <Indicator tone={selectedItem.marketStatusColor} />
                <span className="font-semibold text-slate-700">{selectedItem.marketStatus}</span>
              </div>
              <span className="text-slate-500">مقارنة سوقية</span>
            </div>
            <div className="mt-0">
              <MiniChart />
            </div>
          </div>

          <div className="rounded-[16px] bg-[linear-gradient(135deg,#d8b16c_0%,#c1964d_100%)] p-2 text-slate-950 shadow-[0_18px_30px_rgba(201,161,91,0.28)]">
            <SectionTitle
              icon={<PricingIcon className="h-3 w-3" />}
              title="السعر النهائي"
              value={money(result.projectTotal)}
              tone="text-slate-950"
            />
              <div className="mt-1 grid grid-cols-3 gap-1">
                <div className="rounded-[10px] bg-white/60 px-2 py-1">
                  <p className="text-[9px] text-slate-700">سعر الوحدة</p>
                  <p className="mt-0.5 text-[11px] font-bold">{money(result.costBeforeProfit)}</p>
                </div>
                <div className="rounded-[10px] bg-white/60 px-2 py-1">
                  <p className="text-[9px] text-slate-700">الربح</p>
                  <p className="mt-0.5 text-[11px] font-bold">{money(result.profitValue)}</p>
                </div>
                <div className="rounded-[10px] bg-white/60 px-2 py-1">
                  <p className="text-[9px] text-slate-700">الإجمالي</p>
                  <p className="mt-0.5 text-[11px] font-bold">{money(result.finalUnitPrice)}</p>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                authMode === "guest"
                  ? "cursor-not-allowed border border-[#e8dcc6] bg-slate-100 text-slate-400"
                  : "border border-[#d8b16c] bg-white text-[#b8893d]"
              }`}
              disabled={authMode === "guest"}
            >
              حفظ التحليل
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                authMode === "guest"
                  ? "cursor-not-allowed bg-slate-300 text-white"
                  : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
              }`}
              disabled={authMode === "guest"}
            >
              طلب عرض سعر
            </button>
          </div>

          {authMode === "guest" ? (
            <div className="rounded-[12px] border border-[#eadfca] bg-[#fff7eb] px-2.5 py-1.5 text-[10px] text-slate-600">
              يمكنك الاستعراض والتعديل، لكن الحفظ وطلب العروض يحتاجان تسجيل الدخول.
            </div>
          ) : null}
            </>
          ) : (
            <>
              <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                <SectionTitle
                  icon={<PricingIcon className="h-3 w-3" />}
                  title="أسعار السوق"
                  value={money(selectedItem.marketAverage)}
                />
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Indicator tone={selectedItem.marketStatusColor} />
                    <span className="font-semibold text-slate-700">{selectedItem.marketStatus}</span>
                  </div>
                  <span className="text-slate-500">مقارنة سوقية</span>
                </div>
                <MiniChart />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                  <p className="text-[9px] text-slate-500">الاستشاري</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                    {money(selectedItem.source?.consultantPrice || selectedItem.marketAverage)}
                  </p>
                </div>
                <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                  <p className="text-[9px] text-slate-500">المتوسط</p>
                  <p className="mt-0.5 text-[11px] font-bold text-[#b8893d]">
                    {money(selectedItem.marketAverage)}
                  </p>
                </div>
                <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                  <p className="text-[9px] text-slate-500">المصمم</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                    {money(selectedItem.source?.designerPrice || selectedItem.marketAverage)}
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                <SectionTitle
                  icon={<BoxIcon className="h-3 w-3" />}
                  title="مرجع البند"
                  value={selectedItem.source?.currency || "محلي"}
                />
                <div className="mt-1 grid gap-1">
                  <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                    <span className="text-[10px] text-slate-600">التصنيف الفرعي</span>
                    <span className="text-[10px] font-bold text-slate-900">
                      {selectedItem.source?.sourceCategory || "بند أساسي"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                    <span className="text-[10px] text-slate-600">الملف</span>
                    <span className="max-w-[60%] truncate text-[10px] font-bold text-slate-900">
                      {selectedItem.source?.sourceName || "كتالوج افتراضي"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

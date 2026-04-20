import { useEffect, useMemo, useState } from "react";

import { BoxIcon, PricingIcon, TruckIcon, UserIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";
import { resourcesDatabase } from "../data/sampleData";
import { computeItemPricing } from "../data/pricingEngine";

const baseCategoryOptions = [
  { label: "أعمال إنشائية", enabled: true, icon: "🏗️" },
  { label: "أعمال معمارية", enabled: true, icon: "🧱" },
  { label: "أعمال كهربائية", enabled: true, icon: "⚡" },
  { label: "أعمال ميكانيكية", enabled: true, icon: "🛠️" },
];

function getPricingCopy(language) {
  return language === "en"
    ? {
        currency: "SAR",
        items: "Items",
        analysis: "Analysis",
        market: "Market",
        comingSoon: "Coming soon after collecting and analyzing the data for this section.",
        noProject: "No project selected",
        noSourceProject: "No project",
        chooseCompany: "Choose a company",
        noSourceCompany: "No company",
        savedAnalyses: "Saved analyses",
        rfqs: "RFQ requests",
        allItems: "All items",
        featured: "Core",
        imported: "Imported",
        searchIn: "Search within",
        visibleItems: "visible items",
        page: "Page",
        of: "of",
        previous: "Previous",
        next: "Next",
        noSearchResults: "No matching search results in this section.",
        projectInputs: "Project inputs",
        quantity: "Quantity",
        overhead: "Overhead",
        profit: "Profit",
        factor: "Factor",
        resourceAnalysis: "Resource breakdown",
        resources: "resources",
        directCosts: "Direct costs",
        indirectCosts: "Indirect costs",
        marketPrices: "Market prices",
        marketComparison: "Market comparison",
        finalPrice: "Final price",
        unitPrice: "Unit price",
        total: "Total",
        saveAnalysis: "Save analysis",
        requestQuote: "Request quote",
        guestHint: "You can browse and edit, but saving and RFQs require sign-in.",
        consultant: "Consultant",
        average: "Average",
        designer: "Designer",
        itemReference: "Item reference",
        local: "Local",
        subcategory: "Subcategory",
        coreItem: "Core item",
        file: "File",
        defaultCatalog: "Default catalog",
        backToAnalysis: "Back to analysis",
        createPriceRequest: "Create RFQ",
        material: "Material",
        labor: "Labor",
        equipment: "Equipment",
        good: "Good",
        averageStatus: "Average",
        high: "High",
      }
    : {
        currency: "ريال",
        items: "البنود",
        analysis: "التحليل",
        market: "السوق",
        comingSoon: "قريبًا بعد تجميع وتحليل الداتا الخاصة ببنود هذا القسم.",
        noProject: "بدون مشروع محدد",
        noSourceProject: "بدون مشروع",
        chooseCompany: "اختر شركة",
        noSourceCompany: "بدون شركة",
        savedAnalyses: "التحليلات المحفوظة",
        rfqs: "طلبات الأسعار",
        allItems: "كل البنود",
        featured: "أساسية",
        imported: "مستوردة",
        searchIn: "ابحث داخل",
        visibleItems: "بند ظاهر",
        page: "صفحة",
        of: "من",
        previous: "السابق",
        next: "التالي",
        noSearchResults: "لا توجد نتائج مطابقة للبحث داخل هذا القسم.",
        projectInputs: "مدخلات المشروع",
        quantity: "الكمية",
        overhead: "Overhead",
        profit: "Profit",
        factor: "Factor",
        resourceAnalysis: "تحليل الموارد",
        resources: "موارد",
        directCosts: "التكاليف المباشرة",
        indirectCosts: "التكاليف غير المباشرة",
        marketPrices: "أسعار السوق",
        marketComparison: "مقارنة سوقية",
        finalPrice: "السعر النهائي",
        unitPrice: "سعر الوحدة",
        total: "الإجمالي",
        saveAnalysis: "حفظ التحليل",
        requestQuote: "طلب عرض سعر",
        guestHint: "يمكنك الاستعراض والتعديل، لكن الحفظ وطلب العروض يحتاجان تسجيل الدخول.",
        consultant: "الاستشاري",
        average: "المتوسط",
        designer: "المصمم",
        itemReference: "مرجع البند",
        local: "محلي",
        subcategory: "التصنيف الفرعي",
        coreItem: "بند أساسي",
        file: "الملف",
        defaultCatalog: "كتالوج افتراضي",
        backToAnalysis: "الرجوع إلى التحليل",
        createPriceRequest: "إنشاء طلب سعر",
        material: "مواد",
        labor: "عمالة",
        equipment: "معدات",
        good: "جيد",
        averageStatus: "متوسط",
        high: "مرتفع",
      };
}

function money(value, copy) {
  return `${Number(value || 0).toLocaleString("en-US")} ${copy.currency}`;
}

function translateCategoryLabel(label, language) {
  const map = {
    "أعمال إنشائية": language === "en" ? "Structural Works" : "أعمال إنشائية",
    "أعمال معمارية": language === "en" ? "Architectural Works" : "أعمال معمارية",
    "أعمال كهربائية": language === "en" ? "Electrical Works" : "أعمال كهربائية",
    "أعمال ميكانيكية": language === "en" ? "Mechanical Works" : "أعمال ميكانيكية",
  };

  return map[label] || label;
}

function translateMarketStatus(status, copy) {
  const map = {
    جيد: copy.good,
    متوسط: copy.averageStatus,
    مرتفع: copy.high,
  };

  return map[status] || status;
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
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f4ecdf] text-[#b8893d]">
          {icon}
        </span>
        <p className="text-[22px] font-bold text-slate-900 min-[390px]:text-[23px]">{title}</p>
      </div>
      {value ? (
        <p className={`text-[22px] font-bold ${tone} min-[390px]:text-[23px]`}>{value}</p>
      ) : null}
    </div>
  );
}

function ResourceRow({ line, onPriceChange, expanded, onToggleFormula, copy }) {
  const categoryLabel =
    line.resource?.category === "material"
      ? copy.material
      : line.resource?.category === "labor"
        ? copy.labor
        : copy.equipment;

  return (
    <div className="rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
      <div className="grid grid-cols-[1.6fr_.75fr_.95fr_1fr] items-center gap-1 min-[390px]:grid-cols-[1.8fr_.8fr_.9fr_1fr]">
        <div className="min-w-0">
          <p className="truncate text-[21px] font-semibold text-slate-900 min-[390px]:text-[22px]">
            {line.resource?.icon} {line.resource?.name}
          </p>
          <p className="text-[17px] text-slate-500 min-[390px]:text-[21px]">
            {line.consumptionRate} {line.resource?.unit}
          </p>
        </div>
        <p className="text-[21px] text-slate-600 min-[390px]:text-[22px]">{categoryLabel}</p>
        <input
          value={line.unitPrice}
          onChange={(event) => onPriceChange(line.resource.id, event.target.value)}
          className="w-full rounded-[8px] border border-[#eadfca] px-1.5 py-1 text-[21px] outline-none min-[390px]:text-[22px]"
        />
        <button
          type="button"
          onClick={() => onToggleFormula(line.resourceId)}
          className="text-left text-[21px] font-bold text-slate-900 min-[390px]:text-[22px]"
        >
          {money(line.lineCost, copy)}
        </button>
      </div>
      {expanded ? (
        <div className="mt-1 rounded-[8px] bg-[#faf6ef] px-2 py-1 text-[17px] text-slate-600 min-[390px]:text-[21px]">
          {`${line.consumptionRate} × ${Number(line.unitPrice).toLocaleString("en-US")} × ${line.locationFactor} = ${Number(line.lineCost).toLocaleString("en-US")} ${copy.currency}`}
        </div>
      ) : null}
    </div>
  );
}

function CostPill({ icon, label, value, copy }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-[#b8893d]">{icon}</span>
        <span className="text-[22px] text-slate-600">{label}</span>
      </div>
      <span className="text-[22px] font-bold text-slate-900">{money(value, copy)}</span>
    </div>
  );
}

function CategoryCard({ label, count, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[94%] justify-self-center rounded-[14px] border px-2.5 py-1.5 text-right shadow-sm transition min-[390px]:rounded-[16px] min-[390px]:px-3 min-[390px]:py-2 ${
        active ? "border-[#d8b16c] bg-[#fff8ee]" : "border-[#eadfca] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="rounded-full bg-[#f4ecdf] px-2 py-0.5 text-[17px] font-bold text-[#b8893d] min-[390px]:text-[21px]">
          {count}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <p className="truncate text-[22px] font-bold text-slate-900 min-[390px]:text-[23px]">{label}</p>
          <span className="shrink-0 text-[30px] leading-none min-[390px]:text-[35px]">{icon}</span>
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
  company,
  project,
  savedAnalyses,
  rfqRequests,
  navigationBridge,
  onSaveAnalysis,
  onCreateRfq,
}) {
  const language = settings?.language;
  const copy = getPricingCopy(language);
  const [filter, setFilter] = useState("أعمال إنشائية");
  const [itemsView, setItemsView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [profit, setProfit] = useState(settings?.profitPercent ?? 15);
  const [resourceOverrides, setResourceOverrides] = useState({});
  const [expandedFormulaId, setExpandedFormulaId] = useState(null);
  const pricingNavigation = useBackStack({
    initialEntry: { section: "items" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = pricingNavigation.currentEntry.section;

  const categoryOptions = useMemo(
    () =>
      baseCategoryOptions.map((option) => ({
        ...option,
        translatedLabel: translateCategoryLabel(option.label, language),
      })),
    [language]
  );

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
    [categoryOptions, pricingCatalog]
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

  const pageSize = 3;
  const totalItemPages = Math.max(1, Math.ceil(filteredCatalog.length / pageSize));
  const pagedCatalog = filteredCatalog.slice((itemsPage - 1) * pageSize, itemsPage * pageSize);

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
    <div className="grid gap-1.5 pb-2">
      <div className="rounded-[20px] bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-2 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
        <div className="mb-1.5 flex gap-1 rounded-[14px] bg-white/10 p-1">
          {[
            { id: "items", label: copy.items },
            { id: "analysis", label: copy.analysis },
            { id: "market", label: copy.market },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => pricingNavigation.navigate({ section: section.id })}
              className={`flex-1 rounded-[11px] px-2 py-1.5 text-[22px] font-bold transition ${
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
          <p className="text-sm font-bold text-slate-900">{translateCategoryLabel(filter, language)}</p>
          <p className="mt-1 text-xs text-slate-500">{copy.comingSoon}</p>
        </div>
      ) : (
        <>
          {activeSection === "items" ? (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                {categoryCounts.map((category) => (
                  <CategoryCard
                    key={category.label}
                    label={category.translatedLabel}
                    count={category.count}
                    icon={category.icon}
                    active={filter === category.label}
                    onClick={() => setFilter(category.label)}
                  />
                ))}
              </div>

              <div className="rounded-[18px] border border-[#eadfca] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <div className="mb-2 rounded-[14px] bg-[#fff8ec] px-3 py-2 text-[22px] text-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{project?.name || copy.noProject}</span>
                    <span className="text-[#b8893d]">{company?.name || copy.chooseCompany}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[17px] text-slate-500 min-[390px]:text-[21px]">
                    <span>{copy.savedAnalyses}: {savedAnalyses?.length || 0}</span>
                    <span>{copy.rfqs}: {rfqRequests?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-1 rounded-[14px] bg-[#f8f5ee] p-1">
                  {[
                    { id: "all", label: copy.allItems, count: itemViewCounts.all },
                    { id: "featured", label: copy.featured, count: itemViewCounts.featured },
                    { id: "imported", label: copy.imported, count: itemViewCounts.imported },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setItemsView(tab.id)}
                      className={`flex-1 rounded-[11px] px-2 py-1.5 text-[22px] font-bold transition ${
                        itemsView === tab.id
                          ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <span>{tab.label}</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[17px]">
                          {tab.count}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 rounded-[12px] bg-[#fff8ee] px-2 py-2">
                  <div className="flex items-center gap-2">
                    <p className="whitespace-nowrap text-[22px] font-semibold text-slate-700">
                      {translateCategoryLabel(filter, language)}
                    </p>
                    <div className="flex-1 rounded-[10px] border border-[#eadfca] bg-white px-2 py-1">
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={`${copy.searchIn} ${translateCategoryLabel(filter, language)}`}
                        className="w-full bg-transparent text-[22px] text-slate-700 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[22px]">
                    <p className="text-[#b8893d]">{filteredCatalog.length} {copy.visibleItems}</p>
                    <p className="text-slate-500">
                      {copy.page} {itemsPage} {copy.of} {totalItemPages}
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {pagedCatalog.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectPricingItem(item.id);
                        pricingNavigation.navigate({ section: "analysis" });
                      }}
                      className={`flex min-h-[80px] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border px-2.5 py-2.5 text-center shadow-sm transition ${
                        item.id === selectedPricingItemId
                          ? "border-[#d8b16c] bg-[#fffaf1] shadow-[0_12px_24px_rgba(216,177,108,0.18)]"
                          : "border-[#eadfca] bg-white"
                      }`}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f7efe2] text-[29px] leading-none">
                        {item.icon}
                      </span>
                      <p className="line-clamp-2 min-h-[2.15rem] text-[22px] font-bold leading-4 text-slate-900">
                        {item.name}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setItemsPage((current) => Math.max(1, current - 1))}
                    disabled={itemsPage === 1}
                    className={`rounded-[12px] px-3 py-1.5 text-[22px] font-bold ${
                      itemsPage === 1
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "border border-[#d8b16c] bg-white text-[#b8893d]"
                    }`}
                  >
                    {copy.previous}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemsPage((current) => Math.min(totalItemPages, current + 1))}
                    disabled={itemsPage === totalItemPages}
                    className={`rounded-[12px] px-3 py-1.5 text-[22px] font-bold ${
                      itemsPage === totalItemPages
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                    }`}
                  >
                    {copy.next}
                  </button>
                </div>
              </div>

              {!filteredCatalog.length ? (
                <div className="rounded-[14px] border border-dashed border-[#dec89a] bg-[#fffdfa] px-3 py-4 text-center text-[23px] text-slate-500">
                  {copy.noSearchResults}
                </div>
              ) : null}
            </>
          ) : null}

          {(activeSection === "analysis" || activeSection === "market") && (
            <div className="rounded-[20px] border border-[#dec89a] bg-white p-2 shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
              <div className="rounded-[16px] bg-[linear-gradient(180deg,#1b2f56_0%,#132443_100%)] px-3 py-2 text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[21px] text-[#d8b16c] min-[390px]:text-[22px]">{selectedItem.code}</span>
                  <p className="truncate text-[27px] font-bold min-[390px]:text-[29px]">{selectedItem.name}</p>
                  <span className="text-[#d8b16c]">›</span>
                </div>
                {selectedItem.source?.sourceName ? (
                  <p className="mt-1 text-[21px] text-white/70">
                    {selectedItem.source.sourceName} - {selectedItem.source.currency}
                  </p>
                ) : null}
                <p className="mt-1 text-[21px] text-white/70">
                  {project?.name || copy.noSourceProject} - {company?.name || copy.noSourceCompany}
                </p>
              </div>

              <div className="mt-2 grid gap-2">
                {activeSection === "analysis" ? (
                  <>
                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<PricingIcon className="h-3 w-3" />}
                        title={copy.projectInputs}
                        value={`${selectedItem.unit}`}
                      />
                      <div className="mt-1 grid grid-cols-2 gap-1 min-[400px]:grid-cols-4">
                        <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                          <p className="text-[21px] text-slate-500">{copy.quantity}</p>
                          <input
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            className="mt-0.5 w-full border-0 p-0 text-[27px] font-bold text-slate-900 outline-none"
                          />
                        </div>
                        <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                          <p className="text-[21px] text-slate-500">{copy.overhead}</p>
                          <p className="mt-0.5 text-[23px] font-bold text-slate-900">%{settings?.overheadPercent ?? 0}</p>
                        </div>
                        <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                          <p className="text-[21px] text-slate-500">{copy.profit}</p>
                          <div className="mt-0.5 flex items-center justify-center gap-0.5">
                            <span className="text-[23px] font-bold text-slate-900">%</span>
                            <input
                              value={profit}
                              onChange={(event) => setProfit(event.target.value)}
                              className="w-full border-0 bg-transparent p-0 text-center text-[27px] font-bold text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                        <div className="rounded-[10px] bg-white px-2 py-1 shadow-sm">
                          <p className="text-[21px] text-slate-500">{copy.factor}</p>
                          <p className="mt-0.5 text-[23px] font-bold text-slate-900">{settings?.locationFactor ?? 1}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<BoxIcon className="h-3 w-3" />}
                        title={copy.resourceAnalysis}
                        value={`${result.recipeLines.length} ${copy.resources}`}
                      />
                      <div className="mt-1.5 grid gap-1">
                        {result.recipeLines.map((line) => (
                          <ResourceRow
                            key={line.resourceId}
                            line={line}
                            copy={copy}
                            onPriceChange={changePrice}
                            expanded={expandedFormulaId === line.resourceId}
                            onToggleFormula={(resourceId) =>
                              setExpandedFormulaId((current) => (current === resourceId ? null : resourceId))
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<UserIcon className="h-3 w-3" />}
                        title={copy.directCosts}
                        value={money(result.totalDirectCost, copy)}
                      />
                      <div className="mt-1.5 grid gap-1">
                        <CostPill icon={<BoxIcon className="h-3 w-3" />} label={copy.material} value={result.materialCost} copy={copy} />
                        <CostPill icon={<UserIcon className="h-3 w-3" />} label={copy.labor} value={result.laborCost} copy={copy} />
                        <CostPill icon={<TruckIcon className="h-3 w-3" />} label={copy.equipment} value={result.equipmentCost} copy={copy} />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<TruckIcon className="h-3 w-3" />}
                        title={copy.indirectCosts}
                        value={money(result.totalIndirectCost, copy)}
                      />
                      <div className="mt-1.5 grid gap-1">
                        {result.indirectLines.map((line) => (
                          <div key={line.name} className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                            <span className="text-[22px] text-slate-600">{line.name}</span>
                            <span className="text-[22px] font-bold text-slate-900">{money(line.value, copy)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-1">
                      <SectionTitle
                        icon={<PricingIcon className="h-3 w-3" />}
                        title={copy.marketPrices}
                        value={money(selectedItem.marketAverage, copy)}
                      />
                      <div className="mt-0.5 flex items-center justify-between text-[22px]">
                        <div className="flex items-center gap-1.5">
                          <Indicator tone={selectedItem.marketStatusColor} />
                          <span className="font-semibold text-slate-700">
                            {translateMarketStatus(selectedItem.marketStatus, copy)}
                          </span>
                        </div>
                        <span className="text-slate-500">{copy.marketComparison}</span>
                      </div>
                      <div className="mt-0">
                        <MiniChart />
                      </div>
                    </div>

                    <div className="rounded-[16px] bg-[linear-gradient(135deg,#d8b16c_0%,#c1964d_100%)] p-2 text-slate-950 shadow-[0_18px_30px_rgba(201,161,91,0.28)]">
                      <SectionTitle
                        icon={<PricingIcon className="h-3 w-3" />}
                        title={copy.finalPrice}
                        value={money(result.projectTotal, copy)}
                        tone="text-slate-950"
                      />
                      <div className="mt-1 grid grid-cols-1 gap-1 min-[390px]:grid-cols-3">
                        <div className="rounded-[10px] bg-white/60 px-2 py-1">
                          <p className="text-[21px] text-slate-700">{copy.unitPrice}</p>
                          <p className="mt-0.5 text-[23px] font-bold">{money(result.costBeforeProfit, copy)}</p>
                        </div>
                        <div className="rounded-[10px] bg-white/60 px-2 py-1">
                          <p className="text-[21px] text-slate-700">{copy.profit}</p>
                          <p className="mt-0.5 text-[23px] font-bold">{money(result.profitValue, copy)}</p>
                        </div>
                        <div className="rounded-[10px] bg-white/60 px-2 py-1">
                          <p className="text-[21px] text-slate-700">{copy.total}</p>
                          <p className="mt-0.5 text-[23px] font-bold">{money(result.finalUnitPrice, copy)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 min-[390px]:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          onSaveAnalysis?.({
                            item: selectedItem,
                            result,
                            quantity,
                            profit,
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-[22px] font-bold ${
                          authMode === "guest"
                            ? "cursor-not-allowed border border-[#e8dcc6] bg-slate-100 text-slate-400"
                            : "border border-[#d8b16c] bg-white text-[#b8893d]"
                        }`}
                        disabled={authMode === "guest"}
                      >
                        {copy.saveAnalysis}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onCreateRfq?.({
                            item: selectedItem,
                            source: "pricing-workspace",
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-[22px] font-bold ${
                          authMode === "guest"
                            ? "cursor-not-allowed bg-slate-300 text-white"
                            : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                        }`}
                        disabled={authMode === "guest"}
                      >
                        {copy.requestQuote}
                      </button>
                    </div>

                    {authMode === "guest" ? (
                      <div className="rounded-[12px] border border-[#eadfca] bg-[#fff7eb] px-2.5 py-1.5 text-[22px] text-slate-600">
                        {copy.guestHint}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<PricingIcon className="h-3 w-3" />}
                        title={copy.marketPrices}
                        value={money(selectedItem.marketAverage, copy)}
                      />
                      <div className="mt-1 flex items-center justify-between text-[22px]">
                        <div className="flex items-center gap-1.5">
                          <Indicator tone={selectedItem.marketStatusColor} />
                          <span className="font-semibold text-slate-700">
                            {translateMarketStatus(selectedItem.marketStatus, copy)}
                          </span>
                        </div>
                        <span className="text-slate-500">{copy.marketComparison}</span>
                      </div>
                      <MiniChart />
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 min-[390px]:grid-cols-3">
                      <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-[21px] text-slate-500">{copy.consultant}</p>
                        <p className="mt-0.5 text-[23px] font-bold text-slate-900">
                          {money(selectedItem.source?.consultantPrice || selectedItem.marketAverage, copy)}
                        </p>
                      </div>
                      <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-[21px] text-slate-500">{copy.average}</p>
                        <p className="mt-0.5 text-[23px] font-bold text-[#b8893d]">
                          {money(selectedItem.marketAverage, copy)}
                        </p>
                      </div>
                      <div className="rounded-[12px] border border-[#eadfca] bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-[21px] text-slate-500">{copy.designer}</p>
                        <p className="mt-0.5 text-[23px] font-bold text-slate-900">
                          {money(selectedItem.source?.designerPrice || selectedItem.marketAverage, copy)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#eadfca] bg-[#fffdfa] p-2">
                      <SectionTitle
                        icon={<BoxIcon className="h-3 w-3" />}
                        title={copy.itemReference}
                        value={selectedItem.source?.currency || copy.local}
                      />
                      <div className="mt-1 grid gap-1">
                        <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                          <span className="text-[22px] text-slate-600">{copy.subcategory}</span>
                          <span className="text-[22px] font-bold text-slate-900">
                            {selectedItem.source?.sourceCategory || copy.coreItem}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-1.5 shadow-sm">
                          <span className="text-[22px] text-slate-600">{copy.file}</span>
                          <span className="max-w-[60%] truncate text-[22px] font-bold text-slate-900">
                            {selectedItem.source?.sourceName || copy.defaultCatalog}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => pricingNavigation.navigate({ section: "analysis" })}
                        className="rounded-full border border-[#d8b16c] bg-white px-3 py-1.5 text-[22px] font-bold text-[#b8893d]"
                      >
                        {copy.backToAnalysis}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onCreateRfq?.({
                            item: selectedItem,
                            source: "market-comparison",
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-[22px] font-bold ${
                          authMode === "guest"
                            ? "cursor-not-allowed bg-slate-300 text-white"
                            : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                        }`}
                        disabled={authMode === "guest"}
                      >
                        {copy.createPriceRequest}
                      </button>
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

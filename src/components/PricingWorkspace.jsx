import { useEffect, useMemo, useState } from "react";
import { BoxIcon, PricingIcon, TruckIcon, UserIcon, SaveIcon, TagIcon, TrendingUpIcon } from "./icons";
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
        currency: "SAR", items: "Items", analysis: "Analysis", market: "Market",
        comingSoon: "Coming soon.", noProject: "No project selected",
        noSourceProject: "No project", chooseCompany: "Select company",
        noSourceCompany: "No company", savedAnalyses: "Saved", rfqs: "RFQs",
        allItems: "All", featured: "Core", imported: "Imported",
        searchIn: "Search", visibleItems: "items", page: "Page", of: "of",
        previous: "Prev", next: "Next", noSearchResults: "No results found.",
        projectInputs: "Project Inputs", quantity: "Qty", overhead: "Overhead",
        profit: "Profit", factor: "Factor", resourceAnalysis: "Resources",
        resources: "resources", directCosts: "Direct Costs",
        indirectCosts: "Indirect Costs", marketPrices: "Market Prices",
        marketComparison: "Market comparison", finalPrice: "Final Price",
        unitPrice: "Unit Price", total: "Total", saveAnalysis: "Save",
        requestQuote: "Request Quote",
        guestHint: "Browse freely — saving and RFQs require sign-in.",
        consultant: "Consultant", average: "Average", designer: "Designer",
        itemReference: "Reference", local: "Local", subcategory: "Subcategory",
        coreItem: "Core item", file: "File", defaultCatalog: "Default catalog",
        backToAnalysis: "← Analysis", createPriceRequest: "Create RFQ",
        material: "Material", labor: "Labor", equipment: "Equipment",
        good: "Good", averageStatus: "Average", high: "High",
      }
    : {
        currency: "ريال", items: "البنود", analysis: "التحليل", market: "السوق",
        comingSoon: "قريبًا.", noProject: "بدون مشروع محدد",
        noSourceProject: "بدون مشروع", chooseCompany: "اختر شركة",
        noSourceCompany: "بدون شركة", savedAnalyses: "محفوظة", rfqs: "طلبات",
        allItems: "كل البنود", featured: "أساسية", imported: "مستوردة",
        searchIn: "ابحث", visibleItems: "بند", page: "صفحة", of: "من",
        previous: "السابق", next: "التالي", noSearchResults: "لا توجد نتائج.",
        projectInputs: "مدخلات المشروع", quantity: "الكمية", overhead: "Overhead",
        profit: "Profit", factor: "Factor", resourceAnalysis: "تحليل الموارد",
        resources: "موارد", directCosts: "التكاليف المباشرة",
        indirectCosts: "التكاليف غير المباشرة", marketPrices: "أسعار السوق",
        marketComparison: "مقارنة سوقية", finalPrice: "السعر النهائي",
        unitPrice: "سعر الوحدة", total: "الإجمالي", saveAnalysis: "حفظ",
        requestQuote: "طلب عرض سعر",
        guestHint: "يمكنك الاستعراض، لكن الحفظ وطلب العروض يحتاجان تسجيل دخول.",
        consultant: "الاستشاري", average: "المتوسط", designer: "المصمم",
        itemReference: "مرجع البند", local: "محلي", subcategory: "التصنيف الفرعي",
        coreItem: "بند أساسي", file: "الملف", defaultCatalog: "كتالوج افتراضي",
        backToAnalysis: "التحليل ←", createPriceRequest: "إنشاء طلب سعر",
        material: "مواد", labor: "عمالة", equipment: "معدات",
        good: "جيد", averageStatus: "متوسط", high: "مرتفع",
      };
}

function fmt(value, copy) {
  return `${Number(value || 0).toLocaleString("en-US")} ${copy.currency}`;
}

function translateCat(label, language) {
  const map = {
    "أعمال إنشائية": language === "en" ? "Structural Works" : "أعمال إنشائية",
    "أعمال معمارية": language === "en" ? "Architectural Works" : "أعمال معمارية",
    "أعمال كهربائية": language === "en" ? "Electrical Works" : "أعمال كهربائية",
    "أعمال ميكانيكية": language === "en" ? "Mechanical Works" : "أعمال ميكانيكية",
  };
  return map[label] || label;
}

function translateStatus(status, copy) {
  return { جيد: copy.good, متوسط: copy.averageStatus, مرتفع: copy.high }[status] || status;
}

function StatusDot({ tone }) {
  const colors = { green: "bg-emerald-500", yellow: "bg-amber-400", red: "bg-red-500" };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[tone] || "bg-slate-400"}`} />;
}

function MiniSparkline() {
  return (
    <svg viewBox="0 0 200 48" className="h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a843" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 36 C18 38, 32 18, 50 22 S82 40, 100 28 S138 14, 158 26 S178 38, 200 20"
        fill="url(#sg)" stroke="none" />
      <path d="M0 36 C18 38, 32 18, 50 22 S82 40, 100 28 S138 14, 158 26 S178 38, 200 20"
        fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" />
      <circle cx="160" cy="26" r="3" fill="#22c55e" />
    </svg>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
      <span className="text-[10px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{label}</span>
      <span className="text-[10px] font-bold text-slate-900" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{value}</span>
    </div>
  );
}

function ResourceLine({ line, onPriceChange, expanded, onToggle, copy }) {
  const catLabel = line.resource?.category === "material" ? copy.material
    : line.resource?.category === "labor" ? copy.labor : copy.equipment;
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
      <div className="grid grid-cols-[1fr_auto_80px_auto] items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {line.resource?.icon} {line.resource?.name}
          </p>
          <p className="text-[9px] text-slate-400">{line.consumptionRate} {line.resource?.unit}</p>
        </div>
        <span className="rounded-full bg-[#f0e8d8] px-2 py-0.5 text-[8px] font-bold text-[#b8893d]">
          {catLabel}
        </span>
        <input value={line.unitPrice} onChange={(e) => onPriceChange(line.resource.id, e.target.value)}
          className="w-full rounded-xl border border-[#e8dcc8] px-2 py-1.5 text-center text-[10px] font-bold text-slate-900 outline-none focus:border-[#d4a843]" />
        <button type="button" onClick={() => onToggle(line.resourceId)}
          className="text-[10px] font-bold text-slate-900 whitespace-nowrap" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {fmt(line.lineCost, copy)}
        </button>
      </div>
      {expanded && (
        <p className="mt-1.5 rounded-xl bg-[#faf6ef] px-2.5 py-1.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {`${line.consumptionRate} × ${Number(line.unitPrice).toLocaleString()} × ${line.locationFactor} = ${Number(line.lineCost).toLocaleString()} ${copy.currency}`}
        </p>
      )}
    </div>
  );
}

export default function PricingWorkspace({
  authMode, pricingCatalog, selectedPricingItemId, onSelectPricingItem,
  settings, company, project, savedAnalyses, rfqRequests,
  navigationBridge, onSaveAnalysis, onCreateRfq,
}) {
  const language = settings?.language;
  const copy = getPricingCopy(language);
  const [filter, setFilter] = useState("أعمال إنشائية");
  const [itemsView, setItemsView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [profit, setProfit] = useState(settings?.profitPercent ?? 15);
  const [overrides, setOverrides] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const nav = useBackStack({
    initialEntry: { section: "items" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = nav.currentEntry.section;

  const catOptions = useMemo(() =>
    baseCategoryOptions.map((o) => ({ ...o, translatedLabel: translateCat(o.label, language) })), [language]);

  const selectedItem = useMemo(() =>
    pricingCatalog.find((i) => i.id === selectedPricingItemId) || pricingCatalog[0], [pricingCatalog, selectedPricingItemId]);

  const catCounts = useMemo(() =>
    catOptions.map((o) => ({ ...o, count: pricingCatalog.filter((i) => i.category === o.label).length })), [catOptions, pricingCatalog]);

  const catCatalog = useMemo(() => pricingCatalog.filter((i) => i.category === filter), [pricingCatalog, filter]);

  const filtered = useMemo(() =>
    catCatalog.filter((i) => {
      if (itemsView === "featured" && i.source?.sourceName) return false;
      if (itemsView === "imported" && !i.source?.sourceName) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim();
      return i.name.includes(q) || i.code?.toLowerCase().includes(q.toLowerCase()) || i.source?.sourceCategory?.includes(q);
    }), [catCatalog, itemsView, searchTerm]);

  const viewCounts = useMemo(() => ({
    all: catCatalog.length,
    featured: catCatalog.filter((i) => !i.source?.sourceName).length,
    imported: catCatalog.filter((i) => i.source?.sourceName).length,
  }), [catCatalog]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((itemsPage - 1) * pageSize, itemsPage * pageSize);

  const result = useMemo(() =>
    computeItemPricing({
      item: selectedItem, resources: resourcesDatabase,
      quantity: Number(quantity) || 0,
      overheadPercent: settings?.overheadPercent ?? 0,
      profitPercent: Number(profit) || 0,
      locationFactor: settings?.locationFactor ?? 1,
      overrides,
    }), [profit, quantity, overrides, selectedItem, settings?.locationFactor, settings?.overheadPercent]);

  useEffect(() => {
    if (!filtered.some((i) => i.id === selectedPricingItemId) && filtered[0]) {
      onSelectPricingItem(filtered[0].id);
    }
  }, [filtered, onSelectPricingItem, selectedPricingItemId]);

  useEffect(() => { setItemsPage(1); }, [filter, itemsView, searchTerm]);
  useEffect(() => { if (itemsPage > totalPages) setItemsPage(totalPages); }, [itemsPage, totalPages]);
  useEffect(() => {
    setProfit(selectedItem ? settings?.profitPercent ?? 15 : 15);
    setQuantity(1); setOverrides({}); setExpandedId(null);
  }, [selectedItem, settings?.profitPercent]);

  const tabs = [
    { id: "items", label: copy.items },
    { id: "analysis", label: copy.analysis },
    { id: "market", label: copy.market },
  ];

  return (
    <div className="space-y-3 pb-2">
      {/* Tab navigation */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="flex gap-1 rounded-xl bg-white/10 p-1">
          {tabs.map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => nav.navigate({ section: tab.id })}
              className={`flex-1 rounded-[10px] px-2 py-2 text-[10px] font-bold transition-all ${
                activeSection === tab.id ? "bg-[#d4a843] text-white shadow-[0_2px_8px_rgba(212,168,67,0.35)]" : "text-white/70"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS view */}
      {activeSection === "items" && (
        <>
          {/* Category grid */}
          <div className="grid grid-cols-2 gap-2">
            {catCounts.map((cat) => (
              <button key={cat.label} type="button" onClick={() => setFilter(cat.label)}
                className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-right transition-all ${
                  filter === cat.label
                    ? "border-[#d4a843] bg-gradient-to-br from-[#fffbf0] to-white shadow-[0_4px_16px_rgba(212,168,67,0.2)]"
                    : "border-[#e8dcc8] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                }`}>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  filter === cat.label ? "bg-[#d4a843] text-white" : "bg-[#f5ede0] text-[#b8893d]"
                }`}>
                  {cat.count}
                </span>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {cat.translatedLabel}
                  </p>
                  <span className="text-[16px]">{cat.icon}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Items panel */}
          <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            {/* Project context */}
            <div className="flex items-center justify-between bg-[#faf6ef] px-4 py-2.5 border-b border-[#f0e8d8]">
              <span className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {project?.name || copy.noProject}
              </span>
              <span className="text-[9px] text-[#b8893d]" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {company?.name || copy.chooseCompany}
              </span>
            </div>

            <div className="p-3 space-y-3">
              {/* Sub-tabs */}
              <div className="flex gap-1 rounded-xl bg-[#f5ede0] p-1">
                {[
                  { id: "all", label: copy.allItems, count: viewCounts.all },
                  { id: "featured", label: copy.featured, count: viewCounts.featured },
                  { id: "imported", label: copy.imported, count: viewCounts.imported },
                ].map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setItemsView(tab.id)}
                    className={`flex-1 rounded-[10px] px-1.5 py-1.5 text-[9px] font-bold transition-all ${
                      itemsView === tab.id ? "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white" : "text-slate-500"
                    }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {tab.label} <span className="opacity-60 ml-0.5">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-[#e8dcc8] bg-[#faf6ef] px-3 py-2">
                <span className="text-slate-400 text-[10px]">🔍</span>
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`${copy.searchIn} ${translateCat(filter, language)}`}
                  className="w-full bg-transparent text-[10px] text-slate-700 placeholder:text-slate-400 outline-none"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }} />
                <span className="text-[9px] text-[#b8893d] font-bold shrink-0">{filtered.length} {copy.visibleItems}</span>
              </div>

              {/* Item grid */}
              <div className="grid grid-cols-2 gap-2">
                {paged.map((item) => {
                  const isActive = item.id === selectedPricingItemId;
                  return (
                    <button key={item.id} type="button"
                      onClick={() => { onSelectPricingItem(item.id); nav.navigate({ section: "analysis" }); }}
                      className={`flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                        isActive
                          ? "border-[#d4a843] bg-gradient-to-br from-[#fffbf0] to-white shadow-[0_4px_16px_rgba(212,168,67,0.25)]"
                          : "border-[#e8dcc8] bg-white shadow-sm"
                      }`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-[14px] ${
                        isActive ? "bg-[#d4a843]/20" : "bg-[#f5ede0]"
                      }`}>
                        {item.icon}
                      </span>
                      <p className="line-clamp-2 text-[9px] font-bold leading-snug text-slate-800"
                        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                        {item.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              {!paged.length && (
                <div className="rounded-2xl border border-dashed border-[#d4a843]/40 py-6 text-center text-[10px] text-slate-400"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.noSearchResults}
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setItemsPage((p) => Math.max(1, p - 1))} disabled={itemsPage === 1}
                  className={`flex-1 rounded-xl py-2 text-[10px] font-bold transition ${
                    itemsPage === 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "border border-[#d4a843] text-[#b8893d]"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.previous}
                </button>
                <span className="text-[9px] text-slate-400 shrink-0">{copy.page} {itemsPage} {copy.of} {totalPages}</span>
                <button type="button" onClick={() => setItemsPage((p) => Math.min(totalPages, p + 1))} disabled={itemsPage === totalPages}
                  className={`flex-1 rounded-xl py-2 text-[10px] font-bold transition ${
                    itemsPage === totalPages ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.next}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ANALYSIS + MARKET views */}
      {(activeSection === "analysis" || activeSection === "market") && (
        <div className="space-y-3">
          {/* Item header card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold text-[#d4a843] uppercase tracking-wider">{selectedItem.code}</p>
                  <h3 className="mt-0.5 text-[13px] font-bold text-white leading-snug"
                    style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {selectedItem.name}
                  </h3>
                  {selectedItem.source?.sourceName && (
                    <p className="mt-0.5 text-[9px] text-white/50" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      {selectedItem.source.sourceName}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-left">
                  <div className="flex items-center gap-1">
                    <StatusDot tone={selectedItem.marketStatusColor} />
                    <span className="text-[9px] text-white/70">{translateStatus(selectedItem.marketStatus, copy)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold text-[#d4a843]">{fmt(selectedItem.marketAverage, copy)}</p>
                </div>
              </div>
              <p className="mt-2 text-[9px] text-white/40" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {project?.name || copy.noSourceProject} • {company?.name || copy.noSourceCompany}
              </p>
            </div>
            <div className="flex border-t border-white/10">
              <div className="flex-1 px-3 py-1.5 text-center">
                <p className="text-[8px] text-white/40">{copy.savedAnalyses}</p>
                <p className="text-[11px] font-bold text-[#d4a843]">{savedAnalyses?.length || 0}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1 px-3 py-1.5 text-center">
                <p className="text-[8px] text-white/40">{copy.rfqs}</p>
                <p className="text-[11px] font-bold text-[#d4a843]">{rfqRequests?.length || 0}</p>
              </div>
            </div>
          </div>

          {activeSection === "analysis" && (
            <>
              {/* Inputs */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0e8d8]"><PricingIcon className="h-3.5 w-3.5 text-[#b8893d]" /></span>
                  <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.projectInputs} · {selectedItem.unit}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: copy.quantity, element: <input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-transparent text-[12px] font-bold text-slate-900 outline-none text-center" /> },
                    { label: copy.overhead, element: <p className="text-[11px] font-bold text-slate-900 text-center">%{settings?.overheadPercent ?? 0}</p> },
                    { label: copy.profit, element: <div className="flex items-center justify-center gap-0.5"><span className="text-[10px] font-bold">%</span><input value={profit} onChange={(e) => setProfit(e.target.value)} className="w-10 bg-transparent text-[12px] font-bold text-slate-900 outline-none text-center" /></div> },
                    { label: copy.factor, element: <p className="text-[11px] font-bold text-slate-900 text-center">{settings?.locationFactor ?? 1}</p> },
                  ].map(({ label, element }) => (
                    <div key={label} className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] px-1.5 py-2">
                      <p className="text-[8px] text-slate-400 text-center mb-1" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{label}</p>
                      {element}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-3 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0e8d8]"><BoxIcon className="h-3.5 w-3.5 text-[#b8893d]" /></span>
                    <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{copy.resourceAnalysis}</p>
                  </div>
                  <span className="text-[9px] text-[#b8893d]">{result.recipeLines.length} {copy.resources}</span>
                </div>
                {result.recipeLines.map((line) => (
                  <ResourceLine key={line.resourceId} line={line} copy={copy}
                    onPriceChange={(id, val) => setOverrides((c) => ({ ...c, [id]: Number(val) || 0 }))}
                    expanded={expandedId === line.resourceId}
                    onToggle={(id) => setExpandedId((c) => c === id ? null : id)} />
                ))}
              </div>

              {/* Direct costs */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-3 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0e8d8]"><UserIcon className="h-3.5 w-3.5 text-[#b8893d]" /></span>
                    <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{copy.directCosts}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">{fmt(result.totalDirectCost, copy)}</span>
                </div>
                {[
                  { icon: <BoxIcon className="h-3 w-3" />, label: copy.material, value: result.materialCost },
                  { icon: <UserIcon className="h-3 w-3" />, label: copy.labor, value: result.laborCost },
                  { icon: <TruckIcon className="h-3 w-3" />, label: copy.equipment, value: result.equipmentCost },
                ].map(({ icon, label, value }) => (
                  <InfoRow key={label} label={<span className="flex items-center gap-1">{icon}{label}</span>} value={fmt(value, copy)} />
                ))}
              </div>

              {/* Indirect costs */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-3 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0e8d8]"><TruckIcon className="h-3.5 w-3.5 text-[#b8893d]" /></span>
                    <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{copy.indirectCosts}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">{fmt(result.totalIndirectCost, copy)}</span>
                </div>
                {result.indirectLines.map((line) => (
                  <InfoRow key={line.name} label={line.name} value={fmt(line.value, copy)} />
                ))}
              </div>

              {/* Market prices */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0e8d8]"><TrendingUpIcon className="h-3.5 w-3.5 text-[#b8893d]" /></span>
                    <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{copy.marketPrices}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={selectedItem.marketStatusColor} />
                    <span className="text-[9px] font-semibold text-slate-600">{translateStatus(selectedItem.marketStatus, copy)}</span>
                    <span className="text-[10px] font-bold text-slate-900">{fmt(selectedItem.marketAverage, copy)}</span>
                  </div>
                </div>
                <MiniSparkline />
              </div>

              {/* Final price */}
              <div className="overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(212,168,67,0.3)]">
                <div className="bg-gradient-to-r from-[#c49830] to-[#d4a843] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#7a5c10]" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      {copy.finalPrice}
                    </p>
                    <p className="text-[16px] font-bold text-white">{fmt(result.projectTotal, copy)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 bg-[#b8852a]">
                  {[
                    { label: copy.unitPrice, value: fmt(result.costBeforeProfit, copy) },
                    { label: copy.profit, value: fmt(result.profitValue, copy) },
                    { label: copy.total, value: fmt(result.finalUnitPrice, copy) },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-2 py-2 text-center border-l border-white/10 first:border-0">
                      <p className="text-[8px] text-white/60" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{label}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => onSaveAnalysis?.({ item: selectedItem, result, quantity, profit })}
                  disabled={authMode === "guest"}
                  className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-bold transition ${
                    authMode === "guest" ? "cursor-not-allowed bg-slate-100 text-slate-400" : "border border-[#d4a843] bg-white text-[#b8893d] shadow-sm"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  <SaveIcon className="h-4 w-4" /> {copy.saveAnalysis}
                </button>
                <button type="button" onClick={() => onCreateRfq?.({ item: selectedItem, source: "pricing-workspace" })}
                  disabled={authMode === "guest"}
                  className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-bold transition ${
                    authMode === "guest" ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white shadow-[0_4px_12px_rgba(13,37,69,0.25)]"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  <TagIcon className="h-4 w-4" /> {copy.requestQuote}
                </button>
              </div>

              {authMode === "guest" && (
                <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] px-3 py-2.5 text-[10px] text-slate-500"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.guestHint}
                </div>
              )}
            </>
          )}

          {activeSection === "market" && (
            <>
              {/* Market chart */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.marketPrices}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={selectedItem.marketStatusColor} />
                    <span className="text-[9px] font-semibold text-slate-600">
                      {translateStatus(selectedItem.marketStatus, copy)}
                    </span>
                  </div>
                </div>
                <MiniSparkline />
              </div>

              {/* Price comparison */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: copy.consultant, value: selectedItem.source?.consultantPrice || selectedItem.marketAverage },
                  { label: copy.average, value: selectedItem.marketAverage, highlight: true },
                  { label: copy.designer, value: selectedItem.source?.designerPrice || selectedItem.marketAverage },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`rounded-2xl border p-2.5 text-center shadow-sm ${
                    highlight ? "border-[#d4a843] bg-[#fffbf0]" : "border-[#e8dcc8] bg-white"
                  }`}>
                    <p className="text-[9px] text-slate-400 mb-1" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{label}</p>
                    <p className={`text-[10px] font-bold ${highlight ? "text-[#b8893d]" : "text-slate-800"}`}
                      style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      {fmt(value, copy)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reference info */}
              <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-3 shadow-sm space-y-1.5">
                <p className="text-[10px] font-bold text-slate-700 mb-2" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.itemReference}
                </p>
                <InfoRow label={copy.subcategory} value={selectedItem.source?.sourceCategory || copy.coreItem} />
                <InfoRow label={copy.file} value={selectedItem.source?.sourceName || copy.defaultCatalog} />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => nav.navigate({ section: "analysis" })}
                  className="rounded-2xl border border-[#d4a843] bg-white py-3 text-[10px] font-bold text-[#b8893d]"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.backToAnalysis}
                </button>
                <button type="button" onClick={() => onCreateRfq?.({ item: selectedItem, source: "market-comparison" })}
                  disabled={authMode === "guest"}
                  className={`rounded-2xl py-3 text-[10px] font-bold ${
                    authMode === "guest" ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.createPriceRequest}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

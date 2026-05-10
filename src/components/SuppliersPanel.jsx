import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { PhoneIcon, MailIcon, ShareIcon, SearchIcon, ChevronLeftIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";
import AdSenseUnit from "./AdSenseUnit";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";
const COUNTRY_VALUES = {
  sa: "السعودية",
  eg: "مصر",
  ae: "الإمارات",
};

function normalizeCountry(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return COUNTRY_VALUES.sa;
  if (["السعودية", "saudi arabia", "ksa", "sa"].includes(text)) return COUNTRY_VALUES.sa;
  if (["مصر", "egypt", "eg"].includes(text)) return COUNTRY_VALUES.eg;
  if (["الإمارات", "الامارات", "uae", "u.a.e.", "united arab emirates", "ae"].includes(text)) return COUNTRY_VALUES.ae;
  return String(value || "").trim();
}

function getSuppliersCopy(language) {
  return language === "en"
    ? {
        all: "All", other: "Other", directory: "Directory", addSupplier: "Add Supplier",
        supplierSpecialties: "Supplier Specialties", showingNow: "Showing", outOf: "of",
        searchPlaceholder: "Search by supplier name or specialty",
        countryFilter: "Country", chooseCountry: "Choose country",
        saudiArabia: "Saudi Arabia", egypt: "Egypt", uae: "U.A.E.",
        cityFilter: "City", allCities: "All Cities", specialtyFilter: "Specialty",
        chooseCity: "Choose city", chooseSpecialty: "Choose specialty",
        materials: "Materials", rating: "Rating", contact: "Contact", rfq: "Request Quote",
        guestRfqHint: "RFQs are available to everyone.", previous: "Prev", next: "Next",
        page: "Page", noResults: "No matching results in this specialty.",
        addSupplierTitle: "Add New Supplier", supplierName: "Supplier Name",
        writeSupplierName: "Enter supplier name", category: "Category",
        location: "Location", phone: "Phone", email: "Email",
        contactPerson: "Contact Person", contactName: "Contact name",
        website: "Website", saveSupplier: "Save Supplier", specialty: "Specialty",
        summary: "Summary", call: "Call", mail: "Email", share: "Share", close: "Close",
      }
    : {
        all: "الكل", other: "أخرى", directory: "الدليل", addSupplier: "إضافة مورد",
        supplierSpecialties: "تخصصات الموردين", showingNow: "يظهر الآن", outOf: "من أصل",
        searchPlaceholder: "ابحث باسم المورد أو تخصصه",
        countryFilter: "الدولة", chooseCountry: "اختر الدولة",
        saudiArabia: "السعودية", egypt: "مصر", uae: "الإمارات",
        cityFilter: "المدينة", allCities: "كل المدن", specialtyFilter: "التخصص",
        chooseCity: "اختر المدينة", chooseSpecialty: "اختر التخصص",
        materials: "المواد", rating: "التقييم", contact: "تواصل", rfq: "طلب عرض سعر",
        guestRfqHint: "طلب عروض الأسعار متاح للجميع.",
        previous: "السابق", next: "التالي", page: "صفحة",
        noResults: "لا توجد نتائج مطابقة داخل هذا التخصص.",
        addSupplierTitle: "إضافة مورد جديد", supplierName: "اسم المورد",
        writeSupplierName: "اكتب اسم المورد", category: "التصنيف",
        location: "الموقع", phone: "الهاتف", email: "البريد",
        contactPerson: "مسؤول التواصل", contactName: "اسم المسؤول",
        website: "الموقع الإلكتروني", saveSupplier: "حفظ المورد",
        specialty: "التخصص", summary: "نبذة", call: "اتصال",
        mail: "بريد", share: "مشاركة", close: "إغلاق",
      };
}

function StarRow({ rating }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-[11px] leading-none ${i < filled ? "text-[#C9A84C]" : "text-[#DDD3C0]"}`}>★</span>
      ))}
      {rating > 0 && (
        <span className="ms-1 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500" style={{ fontFamily: AR }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-xl border border-[#E2D8C4] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#082555] outline-none transition-all duration-150 hover:border-[#C9A84C]/60 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 placeholder:text-slate-300"
        style={{ fontFamily: AR }}
      />
    </label>
  );
}

function FilterSelect({ label, value, options, onChange, ariaLabel }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-[#9A8A6A]" style={{ fontFamily: AR }}>
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          aria-label={ariaLabel || label}
          className="h-9 w-full appearance-none rounded-xl border border-[#E2D8C4] bg-white px-3 text-[11px] font-bold text-[#082555] outline-none transition-all duration-150 hover:border-[#C9A84C]/50 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20"
          style={{ fontFamily: AR }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[9px] text-[#9A8A6A]">▾</span>
      </div>
    </label>
  );
}

function InlineAdBanner({ adBanner, canManageAds = false, onEdit, onToggleVisibility, onRemove, language = "ar" }) {
  const hasContent = adBanner?.enabled && adBanner?.imageUrl;
  const isEn = language === "en";

  return (
    <div className="relative rounded-2xl border-2 border-[#E2D8C4] bg-white p-2.5 shadow-sm overflow-hidden">
      {canManageAds ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit?.()}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            {isEn ? "Edit" : "تعديل"}
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility?.(true)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            {isEn ? "Show" : "إظهار"}
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility?.(false)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            {isEn ? "Hide" : "إخفاء"}
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm(isEn ? "Do you want to remove this ad content?" : "هل تريد إزالة محتوى هذا الإعلان؟");
              if (!ok) return;
              onRemove?.();
            }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 shadow-sm"
            style={{ fontFamily: AR }}
          >
            {isEn ? "Remove" : "إزالة"}
          </button>
        </div>
      ) : null}

      {hasContent ? (
        <>
          <button
            type="button"
            onClick={() => {
              if (!adBanner?.targetUrl) return;
              window.open(adBanner.targetUrl, "_blank", "noopener,noreferrer");
            }}
            className="mx-auto block h-[230px] w-full max-w-[608px] overflow-hidden rounded-xl bg-[#F7F3EC]"
          >
            <img
              src={adBanner.imageUrl}
              alt={adBanner.alt || adBanner.title || "suppliers-ad-banner"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
          {adBanner.title ? (
            <p className="mt-2 text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
              {adBanner.title}
            </p>
          ) : null}
        </>
      ) : canManageAds ? (
        <div className="mx-auto flex h-[230px] w-full max-w-[608px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d4a843]/35 bg-[#fff9ec] px-4 py-5 text-center">
          <p className="text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
            {isEn ? "Ad Space" : "مساحة إعلانية"}
          </p>
        </div>
      ) : (
        <AdSenseUnit />
      )}
    </div>
  );
}

export default function SuppliersPanel({
  suppliers, authMode, settings, onAddSupplier, onContactSupplier, onCreateRfq, navigationBridge, initialCountry, sessionMeta, isActive,
}) {
  const copy = getSuppliersCopy(settings?.language);
  const isEn = settings?.language === "en";
  const canManageAds = false;
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCountry, setActiveCountry] = useState(normalizeCountry(initialCountry || settings?.country || COUNTRY_VALUES.sa));
  const [activeGroup, setActiveGroup] = useState(copy.all);
  const [activeCity, setActiveCity] = useState(copy.allCities);
  const [form, setForm] = useState({ name: "", category: "", location: "", phone: "", email: "", contactPerson: "", website: "" });
  const [suppliersAdBanner] = useState(null);

  const nav = useBackStack({
    initialEntry: { section: "directory" },
    registerBackHandler: (handler) => isActive ? navigationBridge?.registerBackHandler?.(handler) : null,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
    onEntryChange: navigationBridge?.onEntryChange,
  });
  const activeSection = nav.currentEntry.section;

  useEffect(() => {
    if (activeSection === "directory") setSelectedSupplier(null);
  }, [activeSection]);

  const submitSupplier = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    onAddSupplier(form);
    setForm({ name: "", category: "", location: "", phone: "", email: "", contactPerson: "", website: "" });
    nav.reset({ section: "directory" });
  };

  const countrySuppliers = useMemo(
    () => suppliers.filter((supplier) => normalizeCountry(supplier.country) === normalizeCountry(activeCountry)),
    [activeCountry, suppliers]
  );

  const groupOptions = useMemo(() => {
    const counts = countrySuppliers.reduce((acc, s) => {
      const key = s.group || copy.other;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: copy.all, count: countrySuppliers.length },
      ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
    ];
  }, [copy.all, copy.other, countrySuppliers]);

  const cityOptions = useMemo(() => {
    const counts = countrySuppliers.reduce((acc, supplier) => {
      const city = supplier.location || copy.other;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return [
      { value: copy.allCities, label: `${copy.allCities} (${countrySuppliers.length})` },
      ...Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0], "ar"))
        .map(([label, count]) => ({ value: label, label: `${label} (${count})` })),
    ];
  }, [copy.allCities, copy.other, countrySuppliers]);

  const specialtyOptions = useMemo(
    () =>
      groupOptions.map((group) => ({
        value: group.label,
        label: `${group.label} (${group.count})`,
      })),
    [groupOptions]
  );

  const filtered = useMemo(() =>
    countrySuppliers.filter((s) => {
      if (activeGroup !== copy.all && s.group !== activeGroup) return false;
      if (activeCity !== copy.allCities && s.location !== activeCity) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim();
      return s.name.includes(q) || s.category.includes(q) || s.group?.includes(q) || s.location?.includes(q) || s.materials?.some((m) => m.includes(q));
    }), [activeCity, activeGroup, copy.all, copy.allCities, countrySuppliers, searchTerm]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    navigationBridge?.onEntryChange?.();
  }, [activeSection, selectedSupplier, navigationBridge]);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [activeCity, activeCountry, activeGroup, searchTerm]);
  useEffect(() => { setActiveGroup(copy.all); }, [copy.all]);
  useEffect(() => { setActiveCity(copy.allCities); }, [copy.allCities]);
  useEffect(() => {
    setActiveGroup(copy.all);
    setActiveCity(copy.allCities);
  }, [activeCountry, copy.all, copy.allCities]);

  useEffect(() => {
    const nextCountry = normalizeCountry(initialCountry || settings?.country || COUNTRY_VALUES.sa);
    setActiveCountry(nextCountry);
  }, [initialCountry, settings?.country]);

  const handleToggleAdVisibility = useCallback(async (nextEnabled) => {
    return null;
  }, []);

  const handleEditAd = useCallback(async () => {
    return null;
  }, []);

  const handleRemoveAd = useCallback(async () => {
    return null;
  }, []);

  if (activeSection === "supplier-detail" && selectedSupplier) {
    return (
      <div className="w-full min-w-0 space-y-3 overflow-hidden animate-in slide-in-from-right-4 duration-200">
        {/* Back header */}
        <div className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082555] to-[#0d3070] px-4 py-3 shadow-[0_8px_24px_rgba(8,37,85,0.22)]">
          <button
            type="button"
            onClick={() => nav.reset({ section: "directory" })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-[15px] font-black text-white" style={{ fontFamily: AR }}>{selectedSupplier.name}</p>
            <p className="truncate text-[10px] font-bold text-[#C9A84C]" style={{ fontFamily: AR }}>{selectedSupplier.category}</p>
          </div>
          {selectedSupplier.logo && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C] text-[16px] font-black text-[#082555]">
              {selectedSupplier.logo}
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid w-full grid-cols-2 gap-2" style={{ minWidth: 0 }}>
          {[
            { label: copy.specialty, value: selectedSupplier.category },
            { label: copy.location,  value: selectedSupplier.location  },
            { label: copy.phone,     value: selectedSupplier.phone     },
            { label: copy.email,     value: selectedSupplier.email     },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0 overflow-hidden rounded-xl border border-[#E2D8C4] bg-white p-3">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#9A8A6A]" style={{ fontFamily: AR }}>{label}</p>
              <p className="w-full break-all text-[12px] font-bold leading-snug text-[#082555]" style={{ fontFamily: AR, wordBreak: "break-all", overflowWrap: "anywhere" }}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>

        {selectedSupplier.contactPerson && (
          <div className="min-w-0 overflow-hidden rounded-xl border border-[#E2D8C4] bg-white p-3">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#9A8A6A]" style={{ fontFamily: AR }}>{copy.contactPerson}</p>
            <p className="truncate text-[12px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{selectedSupplier.contactPerson}</p>
          </div>
        )}

        {selectedSupplier.description && (
          <div className="min-w-0 overflow-hidden rounded-xl border border-[#E2D8C4] bg-white p-3">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#9A8A6A]" style={{ fontFamily: AR }}>{copy.summary}</p>
            <p className="text-[12px] leading-relaxed text-[#082555]" style={{ fontFamily: AR }}>{selectedSupplier.description}</p>
          </div>
        )}

        {selectedSupplier.website && (
          <div className="min-w-0 overflow-hidden rounded-xl border border-[#E2D8C4] bg-white p-3">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#9A8A6A]" style={{ fontFamily: AR }}>{copy.website}</p>
            <p className="w-full break-all text-[12px] font-bold text-[#C9A84C]" style={{ fontFamily: AR, wordBreak: "break-all", overflowWrap: "anywhere" }}>
              {selectedSupplier.website}
            </p>
          </div>
        )}

        {/* Contact actions */}
        <div className="grid w-full grid-cols-3 gap-3">
          {[
            { type: "phone", icon: <PhoneIcon className="h-5 w-5" />, label: copy.call,  cls: "border border-[#E2D8C4] bg-white text-[#082555] hover:border-[#C9A84C] hover:bg-[#FFF9EC]" },
            { type: "email", icon: <MailIcon  className="h-5 w-5" />, label: copy.mail,  cls: "border border-[#E2D8C4] bg-white text-[#082555] hover:border-[#C9A84C] hover:bg-[#FFF9EC]" },
            { type: "share", icon: <ShareIcon className="h-5 w-5 text-[#C9A84C]" />, label: copy.share, cls: "bg-gradient-to-br from-[#082555] to-[#0d3070] text-white shadow-md" },
          ].map(({ type, icon, label, cls }) => (
            <button
              key={type} type="button"
              onClick={() => onContactSupplier?.(selectedSupplier, type)}
              className={`flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold transition-all duration-150 active:scale-[0.97] ${cls}`}
              style={{ fontFamily: AR }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <InlineAdBanner
          adBanner={suppliersAdBanner}
          canManageAds={canManageAds}
          language={settings?.language || "ar"}
          onEdit={handleEditAd}
          onToggleVisibility={handleToggleAdVisibility}
          onRemove={handleRemoveAd}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab bar  */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#082555] to-[#0d3070] shadow-[0_8px_24px_rgba(8,37,85,0.22)] p-1.5">
        <div className="flex gap-1.5">
          {[
            { id: "directory", label: copy.directory, icon: "📋" },
            { id: "add", label: copy.addSupplier, icon: "➕" },
          ].map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => nav.navigate({ section: tab.id })}
              className={`flex flex-1 items-center justify-center gap-2 min-h-[46px] rounded-xl px-3 py-2 text-[12px] font-bold transition-all duration-200 ${
                activeSection === tab.id
                  ? "bg-[#C9A84C] text-[#082555] shadow-[0_2px_10px_rgba(201,168,76,0.4)]"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              }`} style={{ fontFamily: AR }}>
              <span className="text-sm leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "directory" && (
        <>
          {/* Search & filters */}
          <div className="overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-[#F0E8D8] bg-[#FAFAF8] px-4 py-2.5">
              <p className="text-[11px] font-bold text-[#082555] uppercase tracking-wider" style={{ fontFamily: AR }}>
                {copy.supplierSpecialties}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#C9A84C]/12 px-2.5 py-0.5 text-[10px] font-bold text-[#8B6A1F]" style={{ fontFamily: AR }}>
                  {activeCountry}
                </span>
                <span className="rounded-full bg-[#082555]/8 px-2.5 py-0.5 text-[10px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                  {countrySuppliers.length}
                </span>
                <span className="rounded-full bg-[#082555]/8 px-2.5 py-0.5 text-[10px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                  {filtered.length} / {suppliers.length}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-2.5">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8A6A]" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="h-10 w-full rounded-xl border border-[#E2D8C4] bg-[#F7F3EC] ps-10 pe-4 text-[12px] font-medium text-[#082555] outline-none transition-all duration-150 hover:border-[#C9A84C]/50 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20"
                  style={{ fontFamily: AR }} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FilterSelect
                  label={copy.specialtyFilter}
                  value={activeGroup}
                  options={specialtyOptions}
                  onChange={(e) => setActiveGroup(e.target.value)}
                  ariaLabel={copy.chooseSpecialty}
                />
                <FilterSelect
                  label={copy.cityFilter}
                  value={activeCity}
                  options={cityOptions}
                  onChange={(e) => setActiveCity(e.target.value)}
                  ariaLabel={copy.chooseCity}
                />
              </div>
            </div>
          </div>

          {/* Supplier cards */}
          <div className="space-y-2.5">
            {paged.map((supplier) => (
              <div key={supplier.id}
                className="group overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-sm transition-all duration-200 hover:border-[#C9A84C]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)]">
                <div className="p-4">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#082555] to-[#0d3070] text-[17px] shadow-md ring-1 ring-[#082555]/20">
                      {supplier.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-bold text-[#082555] leading-snug" style={{ fontFamily: AR }}>
                            {supplier.name}
                          </h3>
                          <span className="mt-1 inline-block rounded-full bg-[#C9A84C]/12 px-2 py-0.5 text-[10px] font-bold text-[#8B6914]" style={{ fontFamily: AR }}>
                            {supplier.group}
                          </span>
                        </div>
                        <StarRow rating={supplier.rating || 0} />
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]" style={{ fontFamily: AR }}>
                          <span className="text-[#C9A84C] text-[10px]">📦</span>
                          <span className="font-medium">{supplier.materials?.join("، ") || supplier.category || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]" style={{ fontFamily: AR }}>
                          <span className="text-[#082555]/50 text-[10px]">📍</span>
                          <span>{supplier.location || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-[#F0E8D8] bg-[#FAFAF8] px-4 py-2.5">
                  <button type="button" onClick={() => { setSelectedSupplier(supplier); nav.navigate({ section: "supplier-detail" }); }}
                    className="flex-1 h-9 rounded-xl border border-[#E2D8C4] bg-white text-[11px] font-bold text-[#082555] transition-all duration-150 hover:border-[#C9A84C] hover:bg-[#FFF9EC] hover:text-[#8B6914] active:scale-[0.98]"
                    style={{ fontFamily: AR }}>
                    {copy.contact}
                  </button>
                  <button type="button"
                    onClick={() => onCreateRfq?.({ supplier, source: "supplier-directory" })}
                    className="flex-1 h-9 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#D4B85A] text-[11px] font-bold text-[#082555] shadow-sm transition-all duration-150 hover:shadow-md hover:from-[#D4B85A] hover:to-[#E8C97A] active:scale-[0.98]"
                    style={{ fontFamily: AR }}>
                    {copy.rfq}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!paged.length && (
            <div className="rounded-2xl border border-dashed border-[#E2D8C4] bg-[#FAFAF8] py-10 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-[12px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>{copy.noResults}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`flex h-10 flex-1 items-center justify-center rounded-xl text-[12px] font-bold transition-all duration-150 ${
                  page === 1
                    ? "border border-[#E2D8C4] bg-white text-[#D4C9B0] cursor-not-allowed"
                    : "border border-[#C9A84C] bg-white text-[#C9A84C] hover:bg-[#FFF9EC] active:scale-[0.98]"
                }`} style={{ fontFamily: AR }}>
                {copy.previous}
              </button>
              <div className="flex h-10 min-w-[60px] items-center justify-center rounded-xl bg-[#082555] px-3 text-[11px] font-bold text-white" style={{ fontFamily: MONO }}>
                {page} / {totalPages}
              </div>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className={`flex h-10 flex-1 items-center justify-center rounded-xl text-[12px] font-bold transition-all duration-150 ${
                  page === totalPages
                    ? "border border-[#E2D8C4] bg-white text-[#D4C9B0] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#082555] to-[#0d3070] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                }`} style={{ fontFamily: AR }}>
                {copy.next}
              </button>
            </div>
          )}

          <InlineAdBanner
            adBanner={suppliersAdBanner}
            canManageAds={canManageAds}
            language={settings?.language || "ar"}
            onEdit={handleEditAd}
            onToggleVisibility={handleToggleAdVisibility}
            onRemove={handleRemoveAd}
          />
        </>
      )}

      {activeSection === "add" && (
        <div className="overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#082555] to-[#0d3070] px-5 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-base">➕</span>
            <p className="text-[13px] font-bold text-white" style={{ fontFamily: AR }}>{copy.addSupplierTitle}</p>
          </div>
          <form onSubmit={submitSupplier} className="space-y-3.5 p-5">
            <FormField label={copy.supplierName} value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder={copy.writeSupplierName} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label={copy.category} value={form.category}
                onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder={isEn ? "Electrical materials" : "مواد كهربائية"} />
              <FormField label={copy.location} value={form.location}
                onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder={isEn ? "Riyadh" : "الرياض"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={copy.phone} value={form.phone}
                onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} placeholder="+9665…" />
              <FormField label={copy.email} value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="name@co.sa" />
            </div>
            <FormField label={copy.contactPerson} value={form.contactPerson}
              onChange={(e) => setForm((c) => ({ ...c, contactPerson: e.target.value }))} placeholder={copy.contactName} />
            <FormField label={copy.website} value={form.website}
              onChange={(e) => setForm((c) => ({ ...c, website: e.target.value }))} placeholder="https://…" />
            <button type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#082555] to-[#0d3070] text-[13px] font-bold text-white shadow-md transition-all duration-150 hover:shadow-lg active:scale-[0.98]"
              style={{ fontFamily: AR }}>
              {copy.saveSupplier}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { PhoneIcon, MailIcon, ShareIcon, PlusIcon, SearchIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

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
        guestRfqHint: "RFQs available after sign-in.", previous: "Prev", next: "Next",
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
        guestRfqHint: "طلب عروض الأسعار متاح بعد تسجيل الدخول.",
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
        <span key={i} className={`text-[12px] ${i < filled ? "text-[#C9A84C]" : "text-[#E2D8C4]"}`}>★</span>
      ))}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold text-[#082555] mr-1" style={{ fontFamily: AR }}>
        {label}
      </span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        className="min-h-[48px] w-full rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 py-2.5 text-[14px] font-medium text-[#082555] outline-none transition focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/10"
        style={{ fontFamily: AR }} />
    </label>
  );
}

function FilterSelect({ label, value, options, onChange, ariaLabel }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#9A8A6A] mr-1" style={{ fontFamily: AR }}>
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          aria-label={ariaLabel || label}
          className="min-h-[40px] w-full appearance-none rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 pl-10 text-[12px] font-bold text-[#082555] outline-none transition focus:border-[#C9A84C]"
          style={{ fontFamily: AR }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#9A8A6A]">
          ▾
        </span>
      </div>
    </label>
  );
}

export default function SuppliersPanel({
  suppliers, authMode, settings, onAddSupplier, onContactSupplier, onCreateRfq, navigationBridge,
}) {
  const copy = getSuppliersCopy(settings?.language);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCountry, setActiveCountry] = useState(normalizeCountry(settings?.country || COUNTRY_VALUES.sa));
  const [activeGroup, setActiveGroup] = useState(copy.all);
  const [activeCity, setActiveCity] = useState(copy.allCities);
  const [form, setForm] = useState({ name: "", category: "", location: "", phone: "", email: "", contactPerson: "", website: "" });

  const nav = useBackStack({
    initialEntry: { section: "directory" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = nav.currentEntry.section;

  const submitSupplier = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    onAddSupplier(form);
    setForm({ name: "", category: "", location: "", phone: "", email: "", contactPerson: "", website: "" });
    nav.reset({ section: "directory" });
  };

  const countryOptions = useMemo(() => ([
    { value: COUNTRY_VALUES.sa, label: copy.saudiArabia },
    { value: COUNTRY_VALUES.eg, label: copy.egypt },
    { value: COUNTRY_VALUES.ae, label: copy.uae },
  ]), [copy.egypt, copy.saudiArabia, copy.uae]);

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

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [activeCity, activeCountry, activeGroup, searchTerm]);
  useEffect(() => { setActiveGroup(copy.all); }, [copy.all]);
  useEffect(() => { setActiveCity(copy.allCities); }, [copy.allCities]);
  useEffect(() => {
    setActiveGroup(copy.all);
    setActiveCity(copy.allCities);
  }, [activeCountry, copy.all, copy.allCities]);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="rounded-2xl bg-[#082555] p-1.5 shadow-xl">
        <div className="flex gap-1.5">
          {[{ id: "directory", label: copy.directory }, { id: "add", label: copy.addSupplier }].map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => nav.navigate({ section: tab.id })}
              className={`flex-1 min-h-[44px] rounded-xl px-2 py-2 text-[13px] font-bold transition-all duration-300 ${
                activeSection === tab.id ? "bg-[#C9A84C] text-[#082555] shadow-md" : "text-[#9A8A6A] hover:text-white"
              }`} style={{ fontFamily: AR }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "directory" && (
        <>
          {/* Search & filters */}
          <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white px-3 py-2 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[12px] font-bold text-[#082555] uppercase tracking-wider" style={{ fontFamily: AR }}>
                {copy.supplierSpecialties}
              </p>
              <p className="text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: MONO }}>
                {filtered.length} {copy.outOf} {suppliers.length}
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9A8A6A]" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="min-h-[40px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] pr-12 pl-4 text-[12px] font-medium text-[#082555] outline-none transition focus:border-[#C9A84C]"
                style={{ fontFamily: AR }} />
            </div>

            <div className="mb-2">
              <FilterSelect
                label={copy.countryFilter}
                value={activeCountry}
                options={countryOptions}
                onChange={(e) => setActiveCountry(e.target.value)}
                ariaLabel={copy.chooseCountry}
              />
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

          {/* Supplier cards */}
          <div className="space-y-3">
            {paged.map((supplier) => (
              <div key={supplier.id}
                className="overflow-hidden rounded-2xl border-2 border-[#E2D8C4] bg-white shadow-sm hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#082555] text-[18px] font-bold text-[#C9A84C] shadow-lg">
                      {supplier.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="text-[14px] font-bold text-[#082555] leading-snug"
                            style={{ fontFamily: AR }}>
                            {supplier.name}
                          </h3>
                          <p className="mt-1 text-[11px] font-bold text-[#C9A84C]"
                            style={{ fontFamily: AR }}>
                            {supplier.group}
                          </p>
                        </div>
                        <div className="shrink-0 text-left">
                          <p className="text-[12px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{supplier.rating || "—"}</p>
                          <StarRow rating={supplier.rating || 0} />
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] font-medium text-[#9A8A6A] leading-relaxed"
                        style={{ fontFamily: AR }}>
                        <span className="font-bold text-[#5A4E38]">{copy.materials}:</span> {supplier.materials?.join("، ") || supplier.category}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-[#9A8A6A] leading-relaxed"
                        style={{ fontFamily: AR }}>
                        <span className="font-bold text-[#5A4E38]">{copy.location}:</span> {supplier.location || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t-2 border-[#E2D8C4] bg-[#FAFAFA] px-4 py-3">
                  <button type="button" onClick={() => setSelectedSupplier(supplier)}
                    className="flex-1 min-h-[40px] rounded-xl border-2 border-[#E2D8C4] bg-white text-[12px] font-bold text-[#082555] transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                    style={{ fontFamily: AR }}>
                    {copy.contact}
                  </button>
                  <button type="button"
                    onClick={() => onCreateRfq?.({ supplier, source: "supplier-directory" })}
                    disabled={authMode === "guest"}
                    className={`flex-1 min-h-[40px] rounded-xl text-[12px] font-bold transition-all shadow-md ${
                      authMode === "guest"
                        ? "cursor-not-allowed bg-[#F7F3EC] text-[#9A8A6A] border-2 border-[#E2D8C4]"
                        : "bg-[#C9A84C] text-[#082555] hover:bg-[#E8C97A]"
                    }`} style={{ fontFamily: AR }}>
                    {copy.rfq}
                  </button>
                </div>
                {authMode === "guest" && (
                  <p className="px-4 pb-3 text-[10px] font-bold text-red-500/70" style={{ fontFamily: AR }}>
                    ⚠ {copy.guestRfqHint}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!paged.length && (
            <div className="rounded-3xl border-2 border-dashed border-[#E2D8C4] bg-[#F7F3EC] py-12 text-center">
              <p className="text-[13px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {copy.noResults}
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className={`flex-1 min-h-[48px] rounded-2xl py-2 text-[13px] font-bold transition shadow-sm ${
                page === 1 ? "bg-white border-2 border-[#E2D8C4] text-[#E2D8C4] cursor-not-allowed" : "border-2 border-[#C9A84C] bg-white text-[#C9A84C] hover:bg-[#F5EDD8]"
              }`} style={{ fontFamily: AR }}>
              {copy.previous}
            </button>
            <div className="bg-white border-2 border-[#E2D8C4] rounded-xl px-4 py-2 text-[11px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
               {page} / {totalPages}
            </div>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className={`flex-1 min-h-[48px] rounded-2xl py-2 text-[13px] font-bold transition shadow-lg ${
                page === totalPages ? "bg-white border-2 border-[#E2D8C4] text-[#E2D8C4] cursor-not-allowed" : "bg-[#082555] text-white hover:bg-[#2D2821]"
              }`} style={{ fontFamily: AR }}>
              {copy.next}
            </button>
          </div>
        </>
      )}

      {activeSection === "add" && (
        <div className="overflow-hidden rounded-3xl border-2 border-[#E2D8C4] bg-white shadow-xl">
          <div className="flex items-center gap-3 bg-[#082555] px-6 py-4">
            <PlusIcon className="h-5 w-5 text-[#C9A84C]" />
            <p className="text-[14px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: AR }}>
              {copy.addSupplierTitle}
            </p>
          </div>
          <form onSubmit={submitSupplier} className="space-y-4 p-6">
            <FormField label={copy.supplierName} value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder={copy.writeSupplierName} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label={copy.category} value={form.category}
                onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder="مواد كهربائية" />
              <FormField label={copy.location} value={form.location}
                onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="الرياض" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              className="w-full min-h-[52px] rounded-2xl bg-[#082555] py-3 text-[14px] font-bold text-white shadow-lg transition hover:bg-[#2D2821] active:scale-[0.98]"
              style={{ fontFamily: AR }}>
              {copy.saveSupplier}
            </button>
          </form>
        </div>
      )}

      {/* Supplier detail modal */}
      {selectedSupplier && (
        <Modal title={selectedSupplier.name} onClose={() => setSelectedSupplier(null)} closeLabel={copy.close}>
          <div className="space-y-3">
            {[
              { label: copy.specialty, value: selectedSupplier.category },
              { label: copy.summary, value: selectedSupplier.description },
              { label: copy.location, value: selectedSupplier.location },
              { label: copy.phone, value: selectedSupplier.phone },
              { label: copy.email, value: selectedSupplier.email },
              { label: copy.website, value: selectedSupplier.website },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-[#9A8A6A] mb-1 uppercase tracking-wider" style={{ fontFamily: AR }}>{label}</p>
                <p className="text-[13px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{value || "—"}</p>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "phone")}
                className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#E2D8C4] bg-white text-[11px] font-bold text-[#082555] transition hover:border-[#C9A84C] hover:bg-[#F5EDD8]"
                style={{ fontFamily: AR }}>
                <PhoneIcon className="h-5 w-5 text-[#C9A84C]" />
                {copy.call}
              </button>
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "email")}
                className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#E2D8C4] bg-white text-[11px] font-bold text-[#082555] transition hover:border-[#C9A84C] hover:bg-[#F5EDD8]"
                style={{ fontFamily: AR }}>
                <MailIcon className="h-5 w-5 text-[#C9A84C]" />
                {copy.mail}
              </button>
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "share")}
                className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl bg-[#082555] text-[11px] font-bold text-white shadow-lg transition hover:bg-[#2D2821]"
                style={{ fontFamily: AR }}>
                <ShareIcon className="h-5 w-5 text-[#C9A84C]" />
                {copy.share}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

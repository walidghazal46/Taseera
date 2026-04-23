import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { PhoneIcon, MailIcon, ShareIcon, PlusIcon, SearchIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

function getSuppliersCopy(language) {
  return language === "en"
    ? {
        all: "All", other: "Other", directory: "Directory", addSupplier: "Add Supplier",
        supplierSpecialties: "Supplier Specialties", showingNow: "Showing", outOf: "of",
        searchPlaceholder: "Search by supplier name or specialty",
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
        <span key={i} className={`text-[10px] ${i < filled ? "text-[#d4a843]" : "text-slate-200"}`}>★</span>
      ))}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-600" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {label}
      </span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }} />
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
  const [activeGroup, setActiveGroup] = useState(copy.all);
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

  const groupOptions = useMemo(() => {
    const counts = suppliers.reduce((acc, s) => {
      const key = s.group || copy.other;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: copy.all, count: suppliers.length },
      ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
    ];
  }, [copy.all, copy.other, suppliers]);

  const filtered = useMemo(() =>
    suppliers.filter((s) => {
      if (activeGroup !== copy.all && s.group !== activeGroup) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim();
      return s.name.includes(q) || s.category.includes(q) || s.group?.includes(q) || s.materials?.some((m) => m.includes(q));
    }), [activeGroup, copy.all, searchTerm, suppliers]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [activeGroup, searchTerm]);
  useEffect(() => { setActiveGroup(copy.all); }, [copy.all]);

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="flex gap-1 rounded-xl bg-white/10 p-1">
          {[{ id: "directory", label: copy.directory }, { id: "add", label: copy.addSupplier }].map((tab) => (
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

      {activeSection === "directory" && (
        <>
          {/* Search & filters */}
          <div className="rounded-2xl border border-[#e8dcc8] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.supplierSpecialties}
              </p>
              <p className="text-[9px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.showingNow} {paged.length} {copy.outOf} {filtered.length}
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-[#e8dcc8] bg-[#faf6ef] px-3 py-2">
              <SearchIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-transparent text-[10px] text-slate-700 placeholder:text-slate-400 outline-none"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }} />
            </div>

            {/* Group chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {groupOptions.map((g) => (
                <button key={g.label} type="button" onClick={() => setActiveGroup(g.label)}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${
                    activeGroup === g.label
                      ? "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white shadow-sm"
                      : "border border-[#e8dcc8] bg-[#faf6ef] text-slate-600"
                  }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {g.label} <span className="opacity-60">({g.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Supplier cards */}
          <div className="space-y-2">
            {paged.map((supplier) => (
              <div key={supplier.id}
                className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="p-3">
                  <div className="flex items-start gap-2.5">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d2545] to-[#162e52] text-[13px] font-bold text-[#d4a843] shadow-sm">
                      {supplier.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="text-[11px] font-bold text-slate-900 leading-snug"
                            style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                            {supplier.name}
                          </h3>
                          <p className="mt-0.5 text-[9px] font-semibold text-[#b8893d]"
                            style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                            {supplier.group}
                          </p>
                        </div>
                        <div className="shrink-0 text-left">
                          <p className="text-[10px] font-bold text-[#b8893d]">{supplier.rating || "—"}</p>
                          <StarRow rating={supplier.rating || 0} />
                        </div>
                      </div>
                      <p className="mt-1 text-[9px] text-slate-500"
                        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                        {copy.materials}: {supplier.materials?.join("، ") || supplier.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-[#f0e8d8] bg-[#faf6ef] px-3 py-2">
                  <button type="button" onClick={() => setSelectedSupplier(supplier)}
                    className="flex-1 rounded-xl border border-[#d4a843]/50 bg-white py-1.5 text-[9px] font-bold text-[#b8893d]"
                    style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.contact}
                  </button>
                  <button type="button"
                    onClick={() => onCreateRfq?.({ supplier, source: "supplier-directory" })}
                    disabled={authMode === "guest"}
                    className={`flex-1 rounded-xl py-1.5 text-[9px] font-bold ${
                      authMode === "guest"
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "bg-gradient-to-r from-[#c49830] to-[#d4a843] text-white shadow-[0_2px_8px_rgba(212,168,67,0.3)]"
                    }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.rfq}
                  </button>
                </div>
                {authMode === "guest" && (
                  <p className="px-3 pb-2 text-[8px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.guestRfqHint}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!paged.length && (
            <div className="rounded-2xl border border-dashed border-[#d4a843]/40 bg-[#faf6ef] py-8 text-center">
              <p className="text-[11px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.noResults}
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold transition ${
                page === 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "border border-[#d4a843] bg-white text-[#b8893d]"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.previous}
            </button>
            <span className="text-[9px] text-slate-500 shrink-0" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.page} {page} / {totalPages}
            </span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold transition ${
                page === totalPages ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.next}
            </button>
          </div>
        </>
      )}

      {activeSection === "add" && (
        <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#0d2545] to-[#162e52] px-4 py-3">
            <PlusIcon className="h-4 w-4 text-[#d4a843]" />
            <p className="text-[12px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.addSupplierTitle}
            </p>
          </div>
          <form onSubmit={submitSupplier} className="space-y-3 p-4">
            <FormField label={copy.supplierName} value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder={copy.writeSupplierName} />
            <div className="grid grid-cols-2 gap-2">
              <FormField label={copy.category} value={form.category}
                onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder="مواد كهربائية" />
              <FormField label={copy.location} value={form.location}
                onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="الرياض" />
            </div>
            <div className="grid grid-cols-2 gap-2">
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
              className="w-full rounded-xl bg-gradient-to-r from-[#0d2545] to-[#162e52] py-3 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(13,37,69,0.25)] transition active:scale-[0.98]"
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.saveSupplier}
            </button>
          </form>
        </div>
      )}

      {/* Supplier detail modal */}
      {selectedSupplier && (
        <Modal title={selectedSupplier.name} onClose={() => setSelectedSupplier(null)} closeLabel={copy.close}>
          <div className="space-y-2">
            {[
              { label: copy.specialty, value: selectedSupplier.category },
              { label: copy.summary, value: selectedSupplier.description },
              { label: copy.location, value: selectedSupplier.location },
              { label: copy.phone, value: selectedSupplier.phone },
              { label: copy.email, value: selectedSupplier.email },
              { label: copy.website, value: selectedSupplier.website },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[#e8dcc8] bg-white p-3">
                <p className="text-[9px] text-slate-400 mb-0.5" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{label}</p>
                <p className="text-[11px] font-semibold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{value || "—"}</p>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "phone")}
                className="flex flex-col items-center gap-1 rounded-xl border border-[#e8dcc8] bg-white py-3 text-[9px] font-bold text-[#b8893d]"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                <PhoneIcon className="h-4 w-4" />
                {copy.call}
              </button>
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "email")}
                className="flex flex-col items-center gap-1 rounded-xl border border-[#e8dcc8] bg-white py-3 text-[9px] font-bold text-[#b8893d]"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                <MailIcon className="h-4 w-4" />
                {copy.mail}
              </button>
              <button type="button" onClick={() => onContactSupplier?.(selectedSupplier, "share")}
                className="flex flex-col items-center gap-1 rounded-xl bg-gradient-to-br from-[#0d2545] to-[#162e52] py-3 text-[9px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                <ShareIcon className="h-4 w-4" />
                {copy.share}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

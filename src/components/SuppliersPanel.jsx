import { useEffect, useMemo, useState } from "react";

import Modal from "./Modal";
import useBackStack from "../hooks/useBackStack";

function getSuppliersCopy(language) {
  return language === "en"
    ? {
        all: "All",
        other: "Other",
        directory: "Directory",
        addSupplier: "Add supplier",
        supplierSpecialties: "Supplier specialties",
        showingNow: "Showing",
        outOf: "out of",
        searchPlaceholder: "Search by supplier name or specialty",
        materials: "Materials",
        rating: "Rating",
        contact: "Contact",
        rfq: "Request quote",
        guestRfqHint: "RFQs become available after signing in.",
        previous: "Previous",
        next: "Next",
        page: "Page",
        noResults: "No matching results in this specialty.",
        addSupplierTitle: "Add new supplier",
        supplierName: "Supplier name",
        writeSupplierName: "Enter supplier name",
        category: "Category",
        location: "Location",
        phone: "Phone",
        email: "Email",
        contactPerson: "Contact person",
        contactName: "Contact name",
        website: "Website",
        saveSupplier: "Save supplier",
        specialty: "Specialty",
        summary: "Summary",
        call: "Call",
        mail: "Email",
        share: "Share",
        close: "Close",
      }
    : {
        all: "الكل",
        other: "أخرى",
        directory: "الدليل",
        addSupplier: "إضافة مورد",
        supplierSpecialties: "تخصصات الموردين",
        showingNow: "يظهر الآن",
        outOf: "من أصل",
        searchPlaceholder: "ابحث باسم المورد أو تخصصه",
        materials: "المواد",
        rating: "التقييم",
        contact: "تواصل",
        rfq: "طلب عرض سعر",
        guestRfqHint: "طلب عروض الأسعار متاح بعد تسجيل الدخول.",
        previous: "السابق",
        next: "التالي",
        page: "صفحة",
        noResults: "لا توجد نتائج مطابقة داخل هذا التخصص.",
        addSupplierTitle: "إضافة مورد جديد",
        supplierName: "اسم المورد",
        writeSupplierName: "اكتب اسم المورد",
        category: "التصنيف",
        location: "الموقع",
        phone: "الهاتف",
        email: "البريد",
        contactPerson: "مسؤول التواصل",
        contactName: "اسم المسؤول",
        website: "الموقع الإلكتروني",
        saveSupplier: "حفظ المورد",
        specialty: "التخصص",
        summary: "نبذة",
        call: "اتصال",
        mail: "بريد",
        share: "مشاركة",
        close: "إغلاق",
      };
}

function Stars({ rating }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-[#d9b36a]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < filled ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-semibold text-slate-600">{label}</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-[12px] border border-[#eadfca] bg-white px-3 py-2 text-[10px] text-slate-900 outline-none min-[390px]:text-[11px]"
      />
    </label>
  );
}

export default function SuppliersPanel({
  suppliers,
  authMode,
  settings,
  onAddSupplier,
  onContactSupplier,
  onCreateRfq,
  navigationBridge,
}) {
  const copy = getSuppliersCopy(settings?.language);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [directoryPage, setDirectoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState(copy.all);
  const [formState, setFormState] = useState({
    name: "",
    category: "",
    location: "",
    phone: "",
    email: "",
    contactPerson: "",
    website: "",
  });
  const suppliersNavigation = useBackStack({
    initialEntry: { section: "directory" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = suppliersNavigation.currentEntry.section;

  const submitSupplier = (event) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.category.trim()) {
      return;
    }

    onAddSupplier(formState);
    setFormState({
      name: "",
      category: "",
      location: "",
      phone: "",
      email: "",
      contactPerson: "",
      website: "",
    });
    suppliersNavigation.reset({ section: "directory" });
  };

  const groupOptions = useMemo(() => {
    const counts = suppliers.reduce((accumulator, supplier) => {
      const key = supplier.group || copy.other;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return [
      { label: copy.all, count: suppliers.length },
      ...Object.entries(counts)
        .sort((left, right) => right[1] - left[1])
        .map(([label, count]) => ({ label, count })),
    ];
  }, [copy.all, copy.other, suppliers]);

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        if (activeGroup !== copy.all && supplier.group !== activeGroup) {
          return false;
        }

        if (!searchTerm.trim()) {
          return true;
        }

        const query = searchTerm.trim();
        return (
          supplier.name.includes(query) ||
          supplier.category.includes(query) ||
          supplier.group?.includes(query) ||
          supplier.materials?.some((material) => material.includes(query))
        );
      }),
    [activeGroup, copy.all, searchTerm, suppliers]
  );

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));
  const pagedSuppliers = useMemo(
    () =>
      filteredSuppliers.slice((directoryPage - 1) * pageSize, directoryPage * pageSize),
    [directoryPage, filteredSuppliers]
  );

  useEffect(() => {
    if (directoryPage > totalPages) {
      setDirectoryPage(totalPages);
    }
  }, [directoryPage, totalPages]);

  useEffect(() => {
    setDirectoryPage(1);
  }, [activeGroup, searchTerm]);

  useEffect(() => {
    setActiveGroup(copy.all);
  }, [copy.all]);

  return (
    <div className="grid gap-2">
      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-2.5 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
        <div className="flex gap-1 rounded-[16px] bg-white/10 p-1 min-[390px]:gap-1.5">
          {[
            { id: "directory", label: copy.directory },
            { id: "add", label: copy.addSupplier },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => suppliersNavigation.navigate({ section: tab.id })}
              className={`flex-1 rounded-[12px] px-2 py-1.5 text-[9px] font-bold transition min-[390px]:text-[10px] ${
                activeSection === tab.id ? "bg-[#d8b16c] text-white" : "text-white/75"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "directory" ? (
        <div className="flex min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 pb-2">
          <div className="rounded-[16px] border border-[#eadfca] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold text-slate-900">{copy.supplierSpecialties}</p>
              <p className="text-[9px] text-slate-500 min-[390px]:text-[10px]">
                {copy.showingNow} {pagedSuppliers.length} {copy.outOf} {filteredSuppliers.length}
              </p>
            </div>
            <div className="mt-2 rounded-[12px] border border-[#eadfca] bg-[#fffdfa] px-2.5 py-2">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-transparent text-[10px] text-slate-700 placeholder:text-slate-400 outline-none min-[390px]:text-[11px]"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {groupOptions.map((group) => (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => setActiveGroup(group.label)}
                  className={`rounded-full px-2.5 py-1 text-[8px] font-bold transition min-[390px]:text-[9px] ${
                    activeGroup === group.label
                      ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
                      : "border border-[#eadfca] bg-[#fff8ee] text-slate-600"
                  }`}
                >
                  {group.label} ({group.count})
                </button>
              ))}
            </div>
          </div>

          {pagedSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="rounded-[16px] border border-[#eadfca] bg-white p-2 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start gap-1">
                <div className="grid h-6 w-6 place-items-center rounded-[9px] bg-[linear-gradient(135deg,#1b2f56_0%,#10213e_100%)] text-[11px] font-bold text-[#d8b16c]">
                  {supplier.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h3 className="text-[10px] font-bold leading-4 text-slate-900 min-[390px]:text-[11px]">{supplier.name}</h3>
                      <p className="mt-0.5 text-[8px] font-semibold leading-3 text-[#b8893d]">
                        {supplier.group}
                      </p>
                      <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                        {copy.materials}: {supplier.materials?.join("، ") || supplier.category}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] text-slate-400">{copy.rating}</p>
                      <p className="text-[9px] font-bold text-[#b8893d] min-[390px]:text-[10px]">{supplier.rating || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-0.5 leading-none">
                    <Stars rating={supplier.rating || 0} />
                  </div>

                  <div className="mt-0.5 grid grid-cols-1 gap-1 min-[380px]:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSupplier(supplier)}
                      className="flex-1 rounded-full border border-[#d8b16c] px-2 py-1 text-[9px] font-semibold leading-4 text-[#b8893d]"
                    >
                      {copy.contact}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onCreateRfq?.({
                          supplier,
                          source: "supplier-directory",
                        })
                      }
                      className={`flex-1 rounded-full px-2 py-1 text-[9px] font-semibold leading-4 ${
                        authMode === "guest"
                          ? "cursor-not-allowed bg-slate-300 text-white"
                          : "bg-[linear-gradient(135deg,#d8b16c_0%,#b88c45_100%)] text-white"
                      }`}
                      disabled={authMode === "guest"}
                    >
                      {copy.rfq}
                    </button>
                  </div>
                  {authMode === "guest" ? (
                    <p className="mt-0.5 text-[7px] leading-3 text-slate-500">
                      {copy.guestRfqHint}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-[#eadfca] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <button
              type="button"
              onClick={() => setDirectoryPage((current) => Math.max(1, current - 1))}
              disabled={directoryPage === 1}
              className={`rounded-[12px] px-3 py-1 text-[9px] font-bold min-[390px]:text-[10px] ${
                directoryPage === 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "border border-[#d8b16c] bg-white text-[#b8893d]"
              }`}
            >
              {copy.previous}
            </button>
            <p className="text-[9px] text-slate-500 min-[390px]:text-[10px]">
              {copy.page} {directoryPage} {copy.outOf} {totalPages}
            </p>
            <button
              type="button"
              onClick={() =>
                setDirectoryPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={directoryPage === totalPages}
              className={`rounded-[12px] px-3 py-1 text-[9px] font-bold min-[390px]:text-[10px] ${
                directoryPage === totalPages
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
              }`}
            >
              {copy.next}
            </button>
          </div>
          {!pagedSuppliers.length ? (
            <div className="rounded-[16px] border border-dashed border-[#eadfca] bg-white px-3 py-5 text-center text-[10px] text-slate-500">
              {copy.noResults}
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={submitSupplier}
          className="grid gap-2 overflow-y-auto rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
        >
          <p className="text-[10px] font-bold text-slate-900 min-[390px]:text-[11px]">{copy.addSupplierTitle}</p>
          <InputField
            label={copy.supplierName}
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            placeholder={copy.writeSupplierName}
          />
          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            <InputField
              label={copy.category}
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({ ...current, category: event.target.value }))
              }
              placeholder="مواد كهربائية"
            />
            <InputField
              label={copy.location}
              value={formState.location}
              onChange={(event) =>
                setFormState((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="الرياض"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            <InputField
              label={copy.phone}
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+9665..."
            />
            <InputField
              label={copy.email}
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="name@company.sa"
            />
          </div>
          <InputField
            label={copy.contactPerson}
            value={formState.contactPerson}
            onChange={(event) =>
              setFormState((current) => ({ ...current, contactPerson: event.target.value }))
            }
            placeholder={copy.contactName}
          />
          <InputField
            label={copy.website}
            value={formState.website}
            onChange={(event) =>
              setFormState((current) => ({ ...current, website: event.target.value }))
            }
            placeholder="https://company.sa"
          />
          <button
            type="submit"
            className="rounded-[14px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[11px] font-bold text-white"
          >
            {copy.saveSupplier}
          </button>
        </form>
      )}

      {selectedSupplier ? (
        <Modal
          title={selectedSupplier.name}
          onClose={() => setSelectedSupplier(null)}
          closeLabel={copy.close}
        >
          <div className="grid gap-2">
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.specialty}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.category}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.summary}</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{selectedSupplier.description}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.location}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.location}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.phone}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.phone}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.email}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.email}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{copy.website}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.website}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
              <button
                type="button"
                onClick={() => onContactSupplier?.(selectedSupplier, "phone")}
                className="rounded-[10px] border border-[#d8b16c] bg-white px-3 py-2 text-[10px] font-bold text-[#b8893d]"
              >
                {copy.call}
              </button>
              <button
                type="button"
                onClick={() => onContactSupplier?.(selectedSupplier, "email")}
                className="rounded-[10px] border border-[#d8b16c] bg-white px-3 py-2 text-[10px] font-bold text-[#b8893d]"
              >
                {copy.mail}
              </button>
              <button
                type="button"
                onClick={() => onContactSupplier?.(selectedSupplier, "share")}
                className="rounded-[10px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[10px] font-bold text-white"
              >
                {copy.share}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

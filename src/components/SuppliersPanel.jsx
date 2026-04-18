import { useEffect, useMemo, useState } from "react";

import Modal from "./Modal";

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
        className="rounded-[12px] border border-[#eadfca] bg-white px-3 py-2 text-[11px] text-slate-900 outline-none"
      />
    </label>
  );
}

export default function SuppliersPanel({ suppliers, authMode, onAddSupplier }) {
  const [activeSection, setActiveSection] = useState("directory");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [directoryPage, setDirectoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("الكل");
  const [formState, setFormState] = useState({
    name: "",
    category: "",
    location: "",
    phone: "",
    email: "",
    contactPerson: "",
  });

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
    });
    setActiveSection("directory");
  };

  const groupOptions = useMemo(() => {
    const counts = suppliers.reduce((accumulator, supplier) => {
      const key = supplier.group || "أخرى";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return [
      { label: "الكل", count: suppliers.length },
      ...Object.entries(counts)
        .sort((left, right) => right[1] - left[1])
        .map(([label, count]) => ({ label, count })),
    ];
  }, [suppliers]);

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        if (activeGroup !== "الكل" && supplier.group !== activeGroup) {
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
    [activeGroup, searchTerm, suppliers]
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

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-2 overflow-hidden">
      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-3 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
        <div className="flex gap-1.5 rounded-[16px] bg-white/10 p-1">
          {[
            { id: "directory", label: "الدليل" },
            { id: "add", label: "إضافة مورد" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 rounded-[12px] px-2 py-1.5 text-[10px] font-bold transition ${
                activeSection === tab.id ? "bg-[#d8b16c] text-white" : "text-white/75"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "directory" ? (
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 pb-2">
          <div className="rounded-[16px] border border-[#eadfca] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold text-slate-900">تخصصات الموردين</p>
              <p className="text-[10px] text-slate-500">
                يظهر الآن {pagedSuppliers.length} من أصل {filteredSuppliers.length}
              </p>
            </div>
            <div className="mt-2 rounded-[12px] border border-[#eadfca] bg-[#fffdfa] px-2 py-1.5">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث باسم المورد أو تخصصه"
                className="w-full bg-transparent text-[10px] text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {groupOptions.map((group) => (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => setActiveGroup(group.label)}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${
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
              className="rounded-[16px] border border-[#eadfca] bg-white p-1 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start gap-1">
                <div className="grid h-6 w-6 place-items-center rounded-[9px] bg-[linear-gradient(135deg,#1b2f56_0%,#10213e_100%)] text-[11px] font-bold text-[#d8b16c]">
                  {supplier.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h3 className="text-[10px] font-bold leading-4 text-slate-900">{supplier.name}</h3>
                      <p className="mt-0.5 text-[8px] font-semibold leading-3 text-[#b8893d]">
                        {supplier.group}
                      </p>
                      <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                        المواد: {supplier.materials?.join("، ") || supplier.category}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] text-slate-400">التقييم</p>
                      <p className="text-[10px] font-bold text-[#b8893d]">{supplier.rating || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-0.5 leading-none">
                    <Stars rating={supplier.rating || 0} />
                  </div>

                  <div className="mt-0.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSupplier(supplier)}
                      className="flex-1 rounded-full border border-[#d8b16c] px-2 py-0.5 text-[8px] font-semibold leading-4 text-[#b8893d]"
                    >
                      تواصل
                    </button>
                    <button
                      type="button"
                      className={`flex-1 rounded-full px-2 py-0.5 text-[8px] font-semibold leading-4 ${
                        authMode === "guest"
                          ? "cursor-not-allowed bg-slate-300 text-white"
                          : "bg-[linear-gradient(135deg,#d8b16c_0%,#b88c45_100%)] text-white"
                      }`}
                      disabled={authMode === "guest"}
                    >
                      طلب عرض سعر
                    </button>
                  </div>
                  {authMode === "guest" ? (
                    <p className="mt-0.5 text-[7px] leading-3 text-slate-500">
                      طلب عروض الأسعار متاح بعد تسجيل الدخول.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 rounded-[16px] border border-[#eadfca] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <button
              type="button"
              onClick={() => setDirectoryPage((current) => Math.max(1, current - 1))}
              disabled={directoryPage === 1}
              className={`rounded-[12px] px-3 py-1 text-[10px] font-bold ${
                directoryPage === 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "border border-[#d8b16c] bg-white text-[#b8893d]"
              }`}
            >
              السابق
            </button>
            <p className="text-[10px] text-slate-500">
              صفحة {directoryPage} من {totalPages}
            </p>
            <button
              type="button"
              onClick={() =>
                setDirectoryPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={directoryPage === totalPages}
              className={`rounded-[12px] px-3 py-1 text-[10px] font-bold ${
                directoryPage === totalPages
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
              }`}
            >
              التالي
            </button>
          </div>
          {!pagedSuppliers.length ? (
            <div className="rounded-[16px] border border-dashed border-[#eadfca] bg-white px-3 py-5 text-center text-[10px] text-slate-500">
              لا توجد نتائج مطابقة داخل هذا التخصص.
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={submitSupplier}
          className="grid gap-2 overflow-y-auto rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
        >
          <p className="text-[11px] font-bold text-slate-900">إضافة مورد جديد</p>
          <InputField
            label="اسم المورد"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="اكتب اسم المورد"
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="التصنيف"
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({ ...current, category: event.target.value }))
              }
              placeholder="مواد كهربائية"
            />
            <InputField
              label="الموقع"
              value={formState.location}
              onChange={(event) =>
                setFormState((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="الرياض"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="الهاتف"
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+9665..."
            />
            <InputField
              label="البريد"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="name@company.sa"
            />
          </div>
          <InputField
            label="مسؤول التواصل"
            value={formState.contactPerson}
            onChange={(event) =>
              setFormState((current) => ({ ...current, contactPerson: event.target.value }))
            }
            placeholder="اسم المسؤول"
          />
          <button
            type="submit"
            className="rounded-[14px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[11px] font-bold text-white"
          >
            حفظ المورد
          </button>
        </form>
      )}

      {selectedSupplier ? (
        <Modal title={selectedSupplier.name} onClose={() => setSelectedSupplier(null)}>
          <div className="grid gap-2">
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">التخصص</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.category}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">نبذة</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{selectedSupplier.description}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">الموقع</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.location}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">الهاتف</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.phone}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">البريد الإلكتروني</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.email}</p>
            </div>
            <div className="rounded-[10px] bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">الموقع الإلكتروني</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">{selectedSupplier.website}</p>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

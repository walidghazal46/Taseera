import { useEffect, useMemo, useState } from "react";

import { FolderIcon, SearchIcon, StarIcon } from "./icons";

function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-white/18 px-3 py-2 text-xs text-white/80 shadow-inner">
      <SearchIcon className="h-3.5 w-3.5" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-white placeholder:text-white/60 outline-none"
      />
    </div>
  );
}

function Stars({ rating }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-[#d9b36a]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < filled ? "" : "opacity-35"}>
          <StarIcon className="h-3.5 w-3.5" />
        </span>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#eadfca] bg-white px-3 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] text-slate-500">{label}</p>
        <p className="text-[12px] font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function CompanyReviewPage({ company, onBack }) {
  if (!company) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-[#d8b16c] bg-[linear-gradient(180deg,#fffaf1_0%,#ffffff_100%)] p-3 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] border border-[#efe1c8] bg-[linear-gradient(135deg,#f8efdf_0%,#ffffff_100%)] text-xl shadow-sm">
            {company.logo}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-[13px] font-bold text-slate-900">{company.name}</h3>
              <span className="rounded-full bg-[#f6efe4] px-2 py-0.5 text-[9px] font-semibold text-[#b8893d]">
                {company.type === "Contractor" ? "مقاول" : "استشاري"}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-[#b8893d]">{company.specialization}</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">{company.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[#eadfca] px-2.5 py-1 text-[9px] font-bold text-slate-500"
        >
          رجوع
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
          <p className="text-[9px] text-slate-500">المقرات الرئيسية</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-900">
            {(company.headquarters || []).join(" - ")}
          </p>
        </div>
        <div className="rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
          <p className="text-[9px] text-slate-500">الموقع الإلكتروني</p>
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[11px] font-semibold text-[#b8893d] underline"
            >
              زيارة الموقع
            </a>
          ) : (
            <p className="mt-1 text-[11px] font-semibold text-slate-400">غير متاح حاليًا</p>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">المشاريع الرئيسية</p>
          <p className="text-[9px] text-slate-500">{company.projectsCount} مشروع</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(company.keyProjects || []).map((project) => (
            <span
              key={project}
              className="rounded-full border border-[#eadfca] bg-[#fcf8ef] px-2 py-0.5 text-[9px] text-slate-600"
            >
              {project}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <p className="text-[10px] font-bold text-slate-900">المشاريع داخل النظام</p>
        <div className="mt-2 grid gap-1.5">
          {company.projects?.length ? (
            company.projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2 rounded-[12px] bg-[#faf6ef] px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-slate-900">{project.name}</p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    {project.location} - {project.stage}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] text-[#b8893d]">
                  {project.budget || "بدون ميزانية"}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-[12px] bg-[#faf6ef] px-2.5 py-2 text-[9px] text-slate-500">
              لا توجد مشاريع مسجلة لهذه الشركة بعد.
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">التقييم العام</p>
          <span className="text-[11px] font-bold text-[#b8893d]">{company.rating}/5</span>
        </div>
        <div className="mt-1 rounded-[12px] bg-[#f8f5ee] px-2.5 py-1.5">
          <Stars rating={company.rating} />
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">التقييم وتجارب العملاء</p>
          <span className="text-[9px] text-slate-500">3 تقييمات</span>
        </div>
        <div className="mt-2 grid gap-1.5">
          {[
            "التسعير كان واضحًا والتواصل مع الشركة سريع طوال المشروع.",
            "جودة التنفيذ ممتازة لكن نحتاج سرعة أعلى في تحديث الجداول.",
            "شركة مناسبة للمشاريع الكبيرة ولديها حضور جيد في التنسيق والمتابعة.",
          ].map((review, index) => (
            <div
              key={`${company.id}-review-${index}`}
              className="rounded-[12px] bg-[#faf6ef] px-2.5 py-2 text-[10px] leading-5 text-slate-600"
            >
              {review}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyCard({ company, selected, onSelectCompany, onShowDetails }) {
  return (
    <div
      className={`w-full rounded-[18px] border p-2 text-right shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition ${
        selected
          ? "border-[#d8b16c] bg-[linear-gradient(180deg,#fffaf1_0%,#fffdfa_100%)]"
          : "border-[#eadfca] bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)]"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-[#efe1c8] bg-[linear-gradient(135deg,#f8efdf_0%,#ffffff_100%)] text-sm shadow-sm">
          {company.logo}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelectCompany(company.id)}
            className="w-full text-right"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-bold text-slate-900">{company.name}</h3>
                <p className="mt-0.5 text-[9px] font-medium text-[#b8893d]">
                  {company.specialization}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#f0dfbf] bg-[#fcf6ea] px-2 py-0.5 text-[9px] text-slate-600">
                {company.type === "Contractor" ? "مقاول" : "استشاري"}
              </span>
            </div>

            <p className="mt-0.5 line-clamp-1 text-[9px] leading-4 text-slate-500">
              {company.description}
            </p>
          </button>

          <div className="mt-1 flex flex-wrap gap-1">
            {company.headquarters?.slice(0, 1).map((city) => (
              <span
                key={city}
                className="rounded-full bg-[#f8f5ee] px-2 py-0.5 text-[9px] text-slate-600"
              >
                {city}
              </span>
            ))}
            {company.keyProjects?.slice(0, 1).map((project) => (
              <span
                key={project}
                className="rounded-full border border-[#eadfca] px-2 py-0.5 text-[9px] text-slate-500"
              >
                {project}
              </span>
            ))}
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="rounded-[10px] bg-[#f8f5ee] px-2 py-0.5">
                <Stars rating={company.rating} />
                <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-500">
                  <FolderIcon className="h-3 w-3" />
                  <span>{company.projectsCount} مشروع</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowDetails(company.id)}
              className="rounded-full border border-[#d8b16c] bg-white px-2.5 py-0.5 text-[9px] font-semibold text-[#b8893d] shadow-sm"
            >
              التقييم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPanel({
  companies,
  company,
  selectedCompanyId,
  selectedProjectId,
  onSelectCompany,
  onSelectProject,
  onAddCompany,
  onAddProject,
}) {
  const [activeSection, setActiveSection] = useState("directory");
  const [query, setQuery] = useState("");
  const [companyForm, setCompanyForm] = useState({
    name: "",
    type: "Contractor",
    country: "السعودية",
    specialization: "",
    headquarters: "",
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    stage: "تسعير",
    budget: "",
  });
  const [directoryPage, setDirectoryPage] = useState(1);
  const [detailCompanyId, setDetailCompanyId] = useState(null);

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) {
      return companies;
    }

    return companies.filter((entry) =>
      [
        entry.name,
        entry.specialization,
        entry.description,
        ...(entry.headquarters || []),
        ...(entry.keyProjects || []),
      ]
        .filter(Boolean)
        .some((value) => value.includes(normalized))
    );
  }, [companies, query]);

  const directoryPageSize = 7;
  const totalDirectoryPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / directoryPageSize)
  );
  const pagedCompanies = filteredCompanies.slice(
    (directoryPage - 1) * directoryPageSize,
    directoryPage * directoryPageSize
  );

  const summary = useMemo(
    () => ({
      total: companies.length,
      contractors: companies.filter((entry) => entry.type === "Contractor").length,
      consultants: companies.filter((entry) => entry.type === "Consultant").length,
    }),
    [companies]
  );

  const detailCompany = useMemo(
    () => companies.find((entry) => entry.id === detailCompanyId) || null,
    [companies, detailCompanyId]
  );

  const tabs = [
    { id: "directory", label: "الدليل" },
    { id: "projects", label: "المشاريع" },
    { id: "create", label: "إضافة" },
  ];

  useEffect(() => {
    if (directoryPage > totalDirectoryPages) {
      setDirectoryPage(totalDirectoryPages);
    }
  }, [directoryPage, totalDirectoryPages]);

  useEffect(() => {
    setDetailCompanyId(null);
  }, [directoryPage, query]);

  const submitCompany = (event) => {
    event.preventDefault();
    if (!companyForm.name.trim() || !companyForm.country.trim() || !companyForm.specialization.trim()) {
      return;
    }

    onAddCompany(companyForm);
    setCompanyForm({
      name: "",
      type: "Contractor",
      country: "السعودية",
      specialization: "",
      headquarters: "",
    });
    setActiveSection("projects");
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setDirectoryPage(1);
  };

  const submitProject = (event) => {
    event.preventDefault();
    if (!company || !projectForm.name.trim() || !projectForm.location.trim()) {
      return;
    }

    onAddProject(company.id, projectForm);
    setProjectForm({
      name: "",
      location: "",
      stage: "تسعير",
      budget: "",
    });
  };

  const openDetailPage = (companyId) => {
    setDetailCompanyId(companyId);
    setActiveSection("details");
  };

  const closeDetailPage = () => {
    setDetailCompanyId(null);
    setActiveSection("directory");
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-2 overflow-hidden">
      {activeSection !== "details" ? (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-3 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
          <div className="flex gap-1.5 rounded-[16px] bg-white/10 p-1">
            {tabs.map((tab) => (
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

          {activeSection === "directory" ? (
            <div className="mt-2 grid gap-2">
              <SearchBar
                placeholder="ابحث باسم الشركة أو التخصص أو المدينة"
                value={query}
                onChange={handleQueryChange}
              />
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="إجمالي الشركات" value={summary.total} />
                <StatCard label="مقاولين" value={summary.contractors} />
                <StatCard label="استشاريين" value={summary.consultants} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-3 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-[#d8b16c]">تفاصيل الشركة</p>
              <h3 className="mt-1 text-[15px] font-bold text-white">التقييم وتجارب العملاء</h3>
            </div>
            <button
              type="button"
              onClick={closeDetailPage}
              className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold text-white/85"
            >
              رجوع
            </button>
          </div>
        </div>
      )}

      {activeSection === "directory" ? (
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 pb-2">
          <div className="flex items-center justify-between rounded-[14px] border border-[#eadfca] bg-white px-3 py-1.5 text-[10px] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-slate-500">
              يعرض الآن{" "}
              <span className="font-bold text-slate-900">{pagedCompanies.length}</span>{" "}
              من أصل{" "}
              <span className="font-bold text-slate-900">{filteredCompanies.length}</span>
            </p>
            <p className="font-semibold text-[#b8893d]">
              المتبقي {Math.max(filteredCompanies.length - directoryPage * directoryPageSize, 0)}
            </p>
          </div>
          {pagedCompanies.map((entry) => (
            <CompanyCard
              key={entry.id}
              company={entry}
              selected={selectedCompanyId === entry.id}
              onSelectCompany={onSelectCompany}
              onShowDetails={openDetailPage}
            />
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
              صفحة {directoryPage} من {totalDirectoryPages}
            </p>
            <button
              type="button"
              onClick={() =>
                setDirectoryPage((current) =>
                  Math.min(totalDirectoryPages, current + 1)
                )
              }
              disabled={directoryPage === totalDirectoryPages}
              className={`rounded-[12px] px-3 py-1 text-[10px] font-bold ${
                directoryPage === totalDirectoryPages
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
              }`}
            >
              التالي
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === "details" ? (
        <div className="overflow-y-auto pr-1 pb-2">
          <CompanyReviewPage company={detailCompany} onBack={closeDetailPage} />
        </div>
      ) : null}

      {activeSection === "projects" ? (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {companies.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
            >
              <button
                type="button"
                onClick={() => onSelectCompany(entry.id)}
                className="flex w-full items-start justify-between gap-2 text-right"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-500">الشركة</p>
                  <h3 className="mt-0.5 text-[13px] font-bold text-slate-900">{entry.name}</h3>
                  <p className="mt-1 text-[10px] text-[#b8893d]">{entry.specialization}</p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    {(entry.headquarters || []).join(" - ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    selectedCompanyId === entry.id
                      ? "bg-[#d8b16c] text-white"
                      : "bg-[#f4ecdf] text-[#b8893d]"
                  }`}
                >
                  {entry.projects.length} مشروع
                </span>
              </button>

              <div className="mt-2 grid gap-1.5">
                {entry.projects.length ? (
                  entry.projects.map((project) => {
                    const isSelected =
                      selectedCompanyId === entry.id && selectedProjectId === project.id;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => onSelectProject(entry.id, project.id)}
                        className={`rounded-[16px] border px-3 py-2 text-right shadow-sm ${
                          isSelected
                            ? "border-[#d8b16c] bg-[#fff8ee]"
                            : "border-[#eadfca] bg-[#fffdfa]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-bold text-slate-900">
                              {project.name}
                            </p>
                            <p className="mt-0.5 text-[9px] text-slate-500">
                              {project.location} - {project.stage}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isSelected
                                ? "bg-[#d8b16c] text-white"
                                : "bg-[#fcf6ea] text-[#b8893d]"
                            }`}
                          >
                            {isSelected ? "محدد" : "اختيار"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[14px] border border-dashed border-[#dec89a] bg-[#fffdfa] px-3 py-3 text-center text-[10px] text-slate-500">
                    لا توجد مشاريع مضافة لهذه الشركة بعد.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeSection === "create" ? (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          <form
            onSubmit={submitCompany}
            className="grid gap-2 rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
          >
            <p className="text-[11px] font-bold text-slate-900">إضافة شركة</p>
            <Field
              label="اسم الشركة"
              value={companyForm.name}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="اكتب اسم الشركة"
            />
            <Field
              label="التخصص"
              value={companyForm.specialization}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, specialization: event.target.value }))
              }
              placeholder="طرق، MEP، مستشفيات..."
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-semibold text-slate-600">النوع</span>
                <select
                  value={companyForm.type}
                  onChange={(event) =>
                    setCompanyForm((current) => ({ ...current, type: event.target.value }))
                  }
                  className="rounded-[12px] border border-[#eadfca] bg-white px-3 py-2 text-[11px] text-slate-900 outline-none"
                >
                  <option value="Contractor">مقاولات</option>
                  <option value="Consultant">استشارات</option>
                </select>
              </label>
              <Field
                label="الدولة"
                value={companyForm.country}
                onChange={(event) =>
                  setCompanyForm((current) => ({ ...current, country: event.target.value }))
                }
                placeholder="السعودية"
              />
            </div>
            <Field
              label="المدن الرئيسية"
              value={companyForm.headquarters}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, headquarters: event.target.value }))
              }
              placeholder="الرياض، جدة"
            />
            <button
              type="submit"
              className="rounded-[14px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[11px] font-bold text-white"
            >
              حفظ الشركة
            </button>
          </form>

          <form
            onSubmit={submitProject}
            className="grid gap-2 rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-900">إضافة مشروع</p>
              <span className="text-[9px] text-slate-500">{company?.name || "اختر شركة أولًا"}</span>
            </div>
            <Field
              label="اسم المشروع"
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="اكتب اسم المشروع"
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="الموقع"
                value={projectForm.location}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="الرياض"
              />
              <Field
                label="المرحلة"
                value={projectForm.stage}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, stage: event.target.value }))
                }
                placeholder="تسعير"
              />
            </div>
            <Field
              label="الميزانية"
              value={projectForm.budget}
              onChange={(event) =>
                setProjectForm((current) => ({ ...current, budget: event.target.value }))
              }
              placeholder="0"
            />
            <button
              type="submit"
              disabled={!company}
              className={`rounded-[14px] px-3 py-2 text-[11px] font-bold ${
                company
                  ? "bg-[linear-gradient(135deg,#d8b16c_0%,#b88c45_100%)] text-white"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              حفظ المشروع
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

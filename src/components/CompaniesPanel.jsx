import { useEffect, useMemo, useState } from "react";
import { FolderIcon, PlusIcon, SearchIcon, StarIcon, ChevronRightIcon, BuildingsIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

function getCompaniesCopy(language) {
  return language === "en"
    ? {
        contractor: "Contractor", consultant: "Consultant", back: "Back",
        headquarters: "Headquarters", website: "Website", visitWebsite: "Visit",
        unavailable: "Unavailable", keyProjects: "Key Projects",
        projectCount: "projects", systemProjects: "Projects in System",
        noBudget: "No budget", noProjects: "No projects added yet.",
        overallRating: "Rating", customerReviews: "Client Reviews",
        reviewCount: "3 reviews",
        reviewOne: "Pricing was clear and communication stayed fast throughout.",
        reviewTwo: "Excellent execution quality, schedule updates could be faster.",
        reviewThree: "Strong fit for major projects with solid coordination.",
        rating: "Details", directory: "Directory", projects: "Projects", add: "Add",
        searchPlaceholder: "Search by name, specialty, or city",
        totalCompanies: "Total", contractors: "Contractors", consultants: "Consultants",
        companyDetails: "Company Details", currentShowing: "Showing",
        outOf: "of", remaining: "Remaining", previous: "Prev", next: "Next",
        page: "Page", company: "Company", selected: "Selected", choose: "Select",
        noCompanyProjects: "No projects added yet.", addCompany: "Add Company",
        companyName: "Company name", enterCompanyName: "Enter company name",
        specialization: "Specialization", enterSpecialization: "Roads, MEP, hospitals…",
        type: "Type", contracting: "Contracting", consulting: "Consulting",
        country: "Country", mainCities: "Primary Cities", citiesPlaceholder: "Riyadh, Jeddah",
        saveCompany: "Save Company", addProject: "Add Project",
        chooseCompanyFirst: "Select a company first", projectName: "Project name",
        enterProjectName: "Enter project name", location: "Location",
        stage: "Stage", pricingStage: "Pricing", budget: "Budget",
        saveProject: "Save Project",
      }
    : {
        contractor: "مقاول", consultant: "استشاري", back: "رجوع",
        headquarters: "المقرات", website: "الموقع", visitWebsite: "زيارة",
        unavailable: "غير متاح", keyProjects: "المشاريع الرئيسية",
        projectCount: "مشروع", systemProjects: "المشاريع في النظام",
        noBudget: "بدون ميزانية", noProjects: "لا توجد مشاريع مسجلة بعد.",
        overallRating: "التقييم", customerReviews: "تجارب العملاء",
        reviewCount: "3 تقييمات",
        reviewOne: "التسعير واضح والتواصل سريع طوال المشروع.",
        reviewTwo: "جودة التنفيذ ممتازة لكن تحديثات الجداول تحتاج سرعة أعلى.",
        reviewThree: "شركة مناسبة للمشاريع الكبيرة بحضور جيد في التنسيق.",
        rating: "تفاصيل", directory: "الدليل", projects: "المشاريع", add: "إضافة",
        searchPlaceholder: "ابحث باسم الشركة أو التخصص أو المدينة",
        totalCompanies: "الإجمالي", contractors: "مقاولين", consultants: "استشاريين",
        companyDetails: "تفاصيل الشركة", currentShowing: "يعرض",
        outOf: "من أصل", remaining: "المتبقي", previous: "السابق", next: "التالي",
        page: "صفحة", company: "الشركة", selected: "محدد", choose: "اختيار",
        noCompanyProjects: "لا توجد مشاريع مضافة لهذه الشركة بعد.",
        addCompany: "إضافة شركة", companyName: "اسم الشركة",
        enterCompanyName: "اكتب اسم الشركة", specialization: "التخصص",
        enterSpecialization: "طرق، MEP، مستشفيات...", type: "النوع",
        contracting: "مقاولات", consulting: "استشارات", country: "الدولة",
        mainCities: "المدن الرئيسية", citiesPlaceholder: "الرياض، جدة",
        saveCompany: "حفظ الشركة", addProject: "إضافة مشروع",
        chooseCompanyFirst: "اختر شركة أولاً", projectName: "اسم المشروع",
        enterProjectName: "اكتب اسم المشروع", location: "الموقع",
        stage: "المرحلة", pricingStage: "تسعير", budget: "الميزانية",
        saveProject: "حفظ المشروع",
      };
}

function Stars({ rating }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`h-3 w-3 ${i < filled ? "stroke-[#d4a843] fill-[#d4a843]" : "stroke-slate-300 fill-transparent"}`} />
      ))}
    </div>
  );
}

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="flex gap-1 rounded-xl bg-[#0d2545]/8 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`flex-1 rounded-[10px] px-2 py-2 text-[10px] font-bold transition-all duration-200 ${
            active === tab.id
              ? "bg-[#d4a843] text-white shadow-[0_2px_8px_rgba(212,168,67,0.35)]"
              : "text-slate-500"
          }`}
          style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="flex-1 rounded-xl border border-[#e8dcc8] bg-white px-2.5 py-2 text-center shadow-sm">
      <p className="text-[15px] font-bold text-[#0d2545]">{value}</p>
      <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {label}
      </p>
    </div>
  );
}

function CompanyCard({ company, selected, onSelect, onShowDetails, copy }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        selected
          ? "border-[#d4a843] bg-gradient-to-br from-[#fffbf0] to-white shadow-[0_4px_20px_rgba(212,168,67,0.2)]"
          : "border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(company.id)}
        className="w-full p-3 text-right"
      >
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${
              selected ? "bg-[#d4a843]/15 ring-2 ring-[#d4a843]/30" : "bg-[#f5ede0]"
            }`}
          >
            {company.logo}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-[12px] font-bold text-slate-900 leading-snug"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
              >
                {company.name}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold ${
                  company.type === "Consultant"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-[#f5ede0] text-[#b8893d]"
                }`}
              >
                {company.type === "Contractor" ? copy.contractor : copy.consultant}
              </span>
            </div>

            <p className="mt-0.5 text-[10px] text-[#b8893d] font-medium" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {company.specialization}
            </p>

            <div className="mt-1.5 flex items-center justify-between gap-2">
              <Stars rating={company.rating} />
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <FolderIcon className="h-3 w-3" />
                <span>{company.projectsCount} {copy.projectCount}</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Footer action */}
      <div className="flex items-center justify-between border-t border-[#f0e8d8] bg-[#faf6ef] px-3 py-2">
        <div className="flex gap-1">
          {(company.headquarters || []).slice(0, 2).map((city) => (
            <span key={city} className="rounded-full bg-white border border-[#e8dcc8] px-2 py-0.5 text-[8px] text-slate-500">
              {city}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onShowDetails(company.id)}
          className="flex items-center gap-1 rounded-full border border-[#d4a843]/40 bg-white px-2.5 py-1 text-[9px] font-bold text-[#b8893d]"
        >
          {copy.rating}
          <ChevronRightIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function CompanyDetailView({ company, onBack, copy }) {
  if (!company) return null;
  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-[#d4a843]/30 bg-gradient-to-br from-[#fffbf0] to-white shadow-[0_4px_20px_rgba(212,168,67,0.15)]">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f5ede0] text-2xl shadow-sm">
            {company.logo}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold text-slate-900" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {company.name}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#b8893d] font-medium" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {company.specialization}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars rating={company.rating} />
              <span className="text-[10px] font-bold text-[#b8893d]">{company.rating}/5</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-500"
          >
            {copy.back}
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
          <p className="text-[9px] text-slate-400 mb-1">{copy.headquarters}</p>
          <p className="text-[11px] font-semibold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {(company.headquarters || []).join(" • ")}
          </p>
        </div>
        <div className="rounded-xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
          <p className="text-[9px] text-slate-400 mb-1">{copy.website}</p>
          {company.website ? (
            <a href={company.website} target="_blank" rel="noreferrer"
              className="text-[11px] font-semibold text-[#b8893d] underline underline-offset-2">
              {copy.visitWebsite}
            </a>
          ) : (
            <p className="text-[11px] text-slate-400">{copy.unavailable}</p>
          )}
        </div>
      </div>

      {/* Key projects */}
      <div className="rounded-xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
        <p className="text-[10px] font-bold text-slate-700 mb-2" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {copy.keyProjects}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(company.keyProjects || []).map((p) => (
            <span key={p} className="rounded-full border border-[#e8dcc8] bg-[#faf6ef] px-2.5 py-1 text-[9px] text-slate-600"
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-xl border border-[#e8dcc8] bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {copy.customerReviews}
          </p>
          <span className="text-[9px] text-slate-400">{copy.reviewCount}</span>
        </div>
        <div className="space-y-2">
          {[copy.reviewOne, copy.reviewTwo, copy.reviewThree].map((review, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-[#faf6ef] px-3 py-2">
              <span className="mt-0.5 text-[10px] text-[#d4a843]">★</span>
              <p className="text-[10px] leading-relaxed text-slate-600" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {review}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-600" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
      />
    </label>
  );
}

export default function CompaniesPanel({
  companies, company, selectedCompanyId, selectedProjectId,
  onSelectCompany, onSelectProject, onAddCompany, onAddProject,
  navigationBridge, settings,
}) {
  const copy = getCompaniesCopy(settings?.language);
  const [query, setQuery] = useState("");
  const [companyForm, setCompanyForm] = useState({
    name: "", type: "Contractor",
    country: settings?.language === "en" ? "Saudi Arabia" : "السعودية",
    specialization: "", headquarters: "",
  });
  const [projectForm, setProjectForm] = useState({
    name: "", location: "", stage: copy.pricingStage, budget: "",
  });
  const [directoryPage, setDirectoryPage] = useState(1);
  const nav = useBackStack({
    initialEntry: { section: "directory", detailCompanyId: null },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = nav.currentEntry.section;
  const detailCompanyId = nav.currentEntry.detailCompanyId;

  const filteredCompanies = useMemo(() => {
    const q = query.trim();
    if (!q) return companies;
    return companies.filter((e) =>
      [e.name, e.specialization, e.description, ...(e.headquarters || []), ...(e.keyProjects || [])]
        .filter(Boolean).some((v) => v.includes(q))
    );
  }, [companies, query]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const pagedCompanies = filteredCompanies.slice((directoryPage - 1) * pageSize, directoryPage * pageSize);

  const summary = useMemo(() => ({
    total: companies.length,
    contractors: companies.filter((e) => e.type === "Contractor").length,
    consultants: companies.filter((e) => e.type === "Consultant").length,
  }), [companies]);

  const detailCompany = useMemo(() => companies.find((e) => e.id === detailCompanyId) || null, [companies, detailCompanyId]);

  const tabs = [
    { id: "directory", label: copy.directory },
    { id: "projects", label: copy.projects },
    { id: "create", label: copy.add },
  ];

  useEffect(() => {
    if (directoryPage > totalPages) setDirectoryPage(totalPages);
  }, [directoryPage, totalPages]);

  useEffect(() => {
    if (activeSection === "details") nav.reset({ section: "directory", detailCompanyId: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directoryPage, query]);

  const submitCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name.trim() || !companyForm.country.trim() || !companyForm.specialization.trim()) return;
    onAddCompany(companyForm);
    setCompanyForm({ name: "", type: "Contractor", country: settings?.language === "en" ? "Saudi Arabia" : "السعودية", specialization: "", headquarters: "" });
    nav.navigate({ section: "projects", detailCompanyId: null });
  };

  const submitProject = (e) => {
    e.preventDefault();
    if (!company || !projectForm.name.trim() || !projectForm.location.trim()) return;
    onAddProject(company.id, projectForm);
    setProjectForm({ name: "", location: "", stage: copy.pricingStage, budget: "" });
  };

  return (
    <div className="space-y-3">
      {/* Nav tabs */}
      {activeSection !== "details" ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
          <TabBar tabs={tabs} active={activeSection} onSelect={(id) => nav.navigate({ section: id, detailCompanyId: null })} />

          {activeSection === "directory" && (
            <div className="mt-3 space-y-2">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
                <SearchIcon className="h-4 w-4 text-white/50 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setDirectoryPage(1); }}
                  placeholder={copy.searchPlaceholder}
                  className="w-full bg-transparent text-[11px] text-white placeholder:text-white/40 outline-none"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
                />
              </div>
              {/* Stats */}
              <div className="flex gap-2">
                <StatBadge label={copy.totalCompanies} value={summary.total} />
                <StatBadge label={copy.contractors} value={summary.contractors} />
                <StatBadge label={copy.consultants} value={summary.consultants} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-[#d4a843] font-bold uppercase tracking-wider">{copy.companyDetails}</p>
              <p className="mt-0.5 text-[13px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {detailCompany?.name}
              </p>
            </div>
            <button type="button" onClick={() => nav.reset({ section: "directory", detailCompanyId: null })}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/80">
              {copy.back}
            </button>
          </div>
        </div>
      )}

      {/* Directory */}
      {activeSection === "directory" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-[#e8dcc8] bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.currentShowing} <strong className="text-slate-800">{pagedCompanies.length}</strong> {copy.outOf} <strong className="text-slate-800">{filteredCompanies.length}</strong>
            </span>
            <span className="text-[9px] font-semibold text-[#b8893d]">
              {copy.page} {directoryPage} / {totalPages}
            </span>
          </div>

          {pagedCompanies.map((entry) => (
            <CompanyCard
              key={entry.id} company={entry} copy={copy}
              selected={selectedCompanyId === entry.id}
              onSelect={onSelectCompany}
              onShowDetails={(id) => nav.navigate({ section: "details", detailCompanyId: id })}
            />
          ))}

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDirectoryPage((p) => Math.max(1, p - 1))}
              disabled={directoryPage === 1}
              className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold transition ${
                directoryPage === 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "border border-[#d4a843] bg-white text-[#b8893d]"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.previous}
            </button>
            <button type="button" onClick={() => setDirectoryPage((p) => Math.min(totalPages, p + 1))}
              disabled={directoryPage === totalPages}
              className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold transition ${
                directoryPage === totalPages ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white shadow-[0_4px_12px_rgba(13,37,69,0.25)]"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* Detail view */}
      {activeSection === "details" && (
        <CompanyDetailView company={detailCompany} onBack={() => nav.reset({ section: "directory", detailCompanyId: null })} copy={copy} />
      )}

      {/* Projects view */}
      {activeSection === "projects" && (
        <div className="space-y-3">
          {companies.map((entry) => (
            <div key={entry.id} className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <button type="button" onClick={() => onSelectCompany(entry.id)}
                className="flex w-full items-center justify-between gap-3 p-3 text-right">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ede0] text-lg shrink-0">
                    {entry.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-slate-900" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      {entry.name}
                    </p>
                    <p className="text-[9px] text-[#b8893d]" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      {(entry.headquarters || []).join(" • ")}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  selectedCompanyId === entry.id ? "bg-[#d4a843] text-white" : "bg-[#f5ede0] text-[#b8893d]"
                }`}>
                  {entry.projects.length} {copy.projectCount}
                </span>
              </button>

              {entry.projects.length > 0 && (
                <div className="border-t border-[#f0e8d8] bg-[#faf6ef] p-2 space-y-1.5">
                  {entry.projects.map((project) => {
                    const isSelected = selectedCompanyId === entry.id && selectedProjectId === project.id;
                    return (
                      <button key={project.id} type="button"
                        onClick={() => onSelectProject(entry.id, project.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-right transition ${
                          isSelected ? "bg-[#d4a843]/15 border border-[#d4a843]/30" : "bg-white border border-[#e8dcc8]"
                        }`}>
                        <div>
                          <p className="text-[11px] font-bold text-slate-900" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                            {project.name}
                          </p>
                          <p className="text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                            {project.location} • {project.stage}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          isSelected ? "bg-[#d4a843] text-white" : "bg-[#f5ede0] text-[#b8893d]"
                        }`}>
                          {isSelected ? copy.selected : copy.choose}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {entry.projects.length === 0 && (
                <div className="border-t border-[#f0e8d8] bg-[#faf6ef] px-3 py-2.5 text-center text-[10px] text-slate-400"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.noCompanyProjects}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create view */}
      {activeSection === "create" && (
        <div className="space-y-3">
          {/* Add Company */}
          <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#0d2545] to-[#162e52] px-4 py-3">
              <PlusIcon className="h-4 w-4 text-[#d4a843]" />
              <p className="text-[12px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.addCompany}
              </p>
            </div>
            <form onSubmit={submitCompany} className="space-y-3 p-4">
              <FormField label={copy.companyName} value={companyForm.name}
                onChange={(e) => setCompanyForm((c) => ({ ...c, name: e.target.value }))}
                placeholder={copy.enterCompanyName} />
              <FormField label={copy.specialization} value={companyForm.specialization}
                onChange={(e) => setCompanyForm((c) => ({ ...c, specialization: e.target.value }))}
                placeholder={copy.enterSpecialization} />
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold text-slate-600" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    {copy.type}
                  </span>
                  <select value={companyForm.type}
                    onChange={(e) => setCompanyForm((c) => ({ ...c, type: e.target.value }))}
                    className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none"
                    style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                    <option value="Contractor">{copy.contracting}</option>
                    <option value="Consultant">{copy.consulting}</option>
                  </select>
                </label>
                <FormField label={copy.country} value={companyForm.country}
                  onChange={(e) => setCompanyForm((c) => ({ ...c, country: e.target.value }))}
                  placeholder={settings?.language === "en" ? "Saudi Arabia" : "السعودية"} />
              </div>
              <FormField label={copy.mainCities} value={companyForm.headquarters}
                onChange={(e) => setCompanyForm((c) => ({ ...c, headquarters: e.target.value }))}
                placeholder={copy.citiesPlaceholder} />
              <button type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#0d2545] to-[#162e52] py-3 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(13,37,69,0.25)] transition active:scale-[0.98]"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.saveCompany}
              </button>
            </form>
          </div>

          {/* Add Project */}
          <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#c49830] to-[#d4a843] px-4 py-3">
              <div className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4 text-white" />
                <p className="text-[12px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {copy.addProject}
                </p>
              </div>
              <span className="text-[9px] font-semibold text-white/80" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {company?.name || copy.chooseCompanyFirst}
              </span>
            </div>
            <form onSubmit={submitProject} className="space-y-3 p-4">
              <FormField label={copy.projectName} value={projectForm.name}
                onChange={(e) => setProjectForm((c) => ({ ...c, name: e.target.value }))}
                placeholder={copy.enterProjectName} />
              <div className="grid grid-cols-2 gap-2">
                <FormField label={copy.location} value={projectForm.location}
                  onChange={(e) => setProjectForm((c) => ({ ...c, location: e.target.value }))}
                  placeholder={settings?.language === "en" ? "Riyadh" : "الرياض"} />
                <FormField label={copy.stage} value={projectForm.stage}
                  onChange={(e) => setProjectForm((c) => ({ ...c, stage: e.target.value }))}
                  placeholder={copy.pricingStage} />
              </div>
              <FormField label={copy.budget} value={projectForm.budget}
                onChange={(e) => setProjectForm((c) => ({ ...c, budget: e.target.value }))}
                placeholder="0" type="number" />
              <button type="submit" disabled={!company}
                className={`w-full rounded-xl py-3 text-[11px] font-bold transition active:scale-[0.98] ${
                  company
                    ? "bg-gradient-to-r from-[#c49830] to-[#d4a843] text-white shadow-[0_4px_12px_rgba(212,168,67,0.3)]"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {copy.saveProject}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

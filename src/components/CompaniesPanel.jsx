import { useEffect, useMemo, useState } from "react";
import { FolderIcon, PlusIcon, SearchIcon, StarIcon, ChevronRightIcon, BuildingsIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";

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
        <StarIcon key={i} className={`h-3.5 w-3.5 ${i < filled ? "stroke-[#C9A84C] fill-[#C9A84C]" : "stroke-[#E2D8C4] fill-transparent"}`} />
      ))}
    </div>
  );
}

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="flex gap-1.5 rounded-2xl bg-[#082555] p-1.5 shadow-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`flex-1 min-h-[44px] rounded-xl px-2 py-2 text-[13px] font-bold transition-all duration-300 ${
            active === tab.id
              ? "bg-[#C9A84C] text-[#082555] shadow-md"
              : "text-[#9A8A6A] hover:text-white"
          }`}
          style={{ fontFamily: AR }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="flex-1 rounded-2xl border-2 border-[#E2D8C4] bg-white px-2.5 py-3 text-center shadow-sm">
      <p className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{value}</p>
      <p className="mt-0.5 text-[10px] font-bold text-[#9A8A6A] uppercase tracking-wider" style={{ fontFamily: AR }}>
        {label}
      </p>
    </div>
  );
}

function CompanyCard({ company, selected, onSelect, onShowDetails, copy }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        selected
          ? "border-[#C9A84C] bg-[#F5EDD8] shadow-md"
          : "border-[#E2D8C4] bg-white shadow-sm hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(company.id)}
        className="w-full p-4 text-right"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ${
              selected ? "bg-[#C9A84C] text-[#082555] ring-4 ring-[#C9A84C]/20" : "bg-[#F7F3EC] text-[#082555]"
            }`}
          >
            {company.logo}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-[14px] font-bold text-[#082555] leading-snug"
                style={{ fontFamily: AR }}
              >
                {company.name}
              </h3>
              <span
                className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                  company.type === "Consultant"
                    ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                    : "bg-[#E2D8C4] text-[#5A4E38]"
                }`}
              >
                {company.type === "Contractor" ? copy.contractor : copy.consultant}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-[#C9A84C] font-bold" style={{ fontFamily: AR }}>
              {company.specialization}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <Stars rating={company.rating} />
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A8A6A]">
                <FolderIcon className="h-3.5 w-3.5" />
                <span style={{ fontFamily: MONO }}>{company.projectsCount} {copy.projectCount}</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between border-t-2 border-[#E2D8C4] bg-[#FAFAFA] px-4 py-3">
        <div className="flex gap-1.5">
          {(company.headquarters || []).slice(0, 2).map((city) => (
            <span key={city} className="rounded-lg bg-white border border-[#E2D8C4] px-2.5 py-1 text-[10px] font-bold text-[#9A8A6A]">
              {city}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onShowDetails(company.id)}
          className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#C9A84C] px-4 py-1.5 text-[11px] font-bold text-[#082555] transition hover:bg-[#E8C97A]"
          style={{ fontFamily: AR }}
        >
          {copy.rating}
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CompanyDetailView({ company, onBack, copy }) {
  if (!company) return null;
  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#082555] p-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/20 to-transparent pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl shadow-sm backdrop-blur-sm">
            {company.logo}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold text-white" style={{ fontFamily: AR }}>
              {company.name}
            </h2>
            <p className="mt-1 text-[12px] text-[#E8C97A] font-bold" style={{ fontFamily: AR }}>
              {company.specialization}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={company.rating} />
              <span className="text-[12px] font-bold text-white/60" style={{ fontFamily: MONO }}>{company.rating}/5</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-white/20"
            style={{ fontFamily: AR }}
          >
            {copy.back}
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#9A8A6A] mb-2 uppercase tracking-wider">{copy.headquarters}</p>
          <p className="text-[13px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
            {(company.headquarters || []).join(" • ")}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#9A8A6A] mb-2 uppercase tracking-wider">{copy.website}</p>
          {company.website ? (
            <a href={company.website} target="_blank" rel="noreferrer"
              className="text-[13px] font-bold text-[#C9A84C] underline underline-offset-4">
              {copy.visitWebsite}
            </a>
          ) : (
            <p className="text-[13px] font-bold text-[#9A8A6A]">{copy.unavailable}</p>
          )}
        </div>
      </div>

      {/* Key projects */}
      <div className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold text-[#082555] mb-3 uppercase tracking-wider" style={{ fontFamily: AR }}>
          {copy.keyProjects}
        </p>
        <div className="flex flex-wrap gap-2">
          {(company.keyProjects || []).map((p) => (
            <span key={p} className="rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-3 py-1.5 text-[11px] font-bold text-[#5A4E38]"
              style={{ fontFamily: AR }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-[#082555] uppercase tracking-wider" style={{ fontFamily: AR }}>
            {copy.customerReviews}
          </p>
          <span className="text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: MONO }}>{copy.reviewCount}</span>
        </div>
        <div className="space-y-3">
          {[copy.reviewOne, copy.reviewTwo, copy.reviewThree].map((review, i) => (
            <div key={i} className="flex gap-3 rounded-2xl bg-[#F7F3EC] p-4">
              <span className="text-[14px] text-[#C9A84C]">★</span>
              <p className="text-[12px] leading-relaxed font-medium text-[#5A4E38]" style={{ fontFamily: AR }}>
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
      <span className="mb-2 block text-[12px] font-bold text-[#082555] mr-1" style={{ fontFamily: AR }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[48px] w-full rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 py-2.5 text-[14px] font-medium text-[#082555] outline-none transition focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/10"
        style={{ fontFamily: AR }}
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
    <div className="space-y-4">
      {/* Nav tabs */}
      {activeSection !== "details" ? (
        <div className="space-y-3">
          <TabBar tabs={tabs} active={activeSection} onSelect={(id) => nav.navigate({ section: id, detailCompanyId: null })} />

          {activeSection === "directory" && (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9A8A6A]" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setDirectoryPage(1); }}
                  placeholder={copy.searchPlaceholder}
                  className="min-h-[52px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-white pr-12 pl-4 text-[14px] font-medium text-[#082555] outline-none transition focus:border-[#C9A84C] shadow-sm"
                  style={{ fontFamily: AR }}
                />
              </div>
              {/* Stats */}
              <div className="flex gap-3">
                <StatBadge label={copy.totalCompanies} value={summary.total} />
                <StatBadge label={copy.contractors} value={summary.contractors} />
                <StatBadge label={copy.consultants} value={summary.consultants} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#082555] p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest">{copy.companyDetails}</p>
              <p className="mt-1 text-[15px] font-bold text-white" style={{ fontFamily: AR }}>
                {detailCompany?.name}
              </p>
            </div>
            <button type="button" onClick={() => nav.reset({ section: "directory", detailCompanyId: null })}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-white/20">
              {copy.back}
            </button>
          </div>
        </div>
      )}

      {/* Directory */}
      {activeSection === "directory" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border-2 border-[#E2D8C4] bg-white px-4 py-3 shadow-sm">
            <span className="text-[12px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
              {copy.currentShowing} <strong className="text-[#082555]">{pagedCompanies.length}</strong> {copy.outOf} <strong className="text-[#082555]">{filteredCompanies.length}</strong>
            </span>
            <span className="text-[11px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>
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
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => setDirectoryPage((p) => Math.max(1, p - 1))}
              disabled={directoryPage === 1}
              className={`flex-1 min-h-[48px] rounded-2xl py-2 text-[13px] font-bold transition shadow-sm ${
                directoryPage === 1 ? "bg-white border-2 border-[#E2D8C4] text-[#E2D8C4] cursor-not-allowed" : "border-2 border-[#C9A84C] bg-white text-[#C9A84C] hover:bg-[#F5EDD8]"
              }`} style={{ fontFamily: AR }}>
              {copy.previous}
            </button>
            <button type="button" onClick={() => setDirectoryPage((p) => Math.min(totalPages, p + 1))}
              disabled={directoryPage === totalPages}
              className={`flex-1 min-h-[48px] rounded-2xl py-2 text-[13px] font-bold transition shadow-lg ${
                directoryPage === totalPages ? "bg-white border-2 border-[#E2D8C4] text-[#E2D8C4] cursor-not-allowed" : "bg-[#082555] text-white hover:bg-[#2D2821]"
              }`} style={{ fontFamily: AR }}>
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
        <div className="space-y-4">
          {companies.map((entry) => (
            <div key={entry.id} className="overflow-hidden rounded-2xl border-2 border-[#E2D8C4] bg-white shadow-sm transition-all hover:shadow-md">
              <button type="button" onClick={() => onSelectCompany(entry.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F3EC] text-2xl shrink-0 shadow-sm">
                    {entry.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
                      {entry.name}
                    </p>
                    <p className="text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                      {(entry.headquarters || []).join(" • ")}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                  selectedCompanyId === entry.id ? "bg-[#C9A84C] text-[#082555]" : "bg-[#F7F3EC] text-[#9A8A6A]"
                }`} style={{ fontFamily: MONO }}>
                  {entry.projects.length}
                </span>
              </button>

              {entry.projects.length > 0 && (
                <div className="border-t-2 border-[#E2D8C4] bg-[#FAFAFA] p-3 space-y-2">
                  {entry.projects.map((project) => {
                    const isSelected = selectedCompanyId === entry.id && selectedProjectId === project.id;
                    return (
                      <button key={project.id} type="button"
                        onClick={() => onSelectProject(entry.id, project.id)}
                        className={`flex min-h-[56px] w-full items-center justify-between rounded-xl px-4 py-2.5 text-right transition-all border-2 ${
                          isSelected ? "bg-[#C9A84C]/10 border-[#C9A84C]" : "bg-white border-transparent hover:border-[#E2D8C4]"
                        }`}>
                        <div>
                          <p className="text-[13px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
                            {project.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                            {project.location} • {project.stage}
                          </p>
                        </div>
                        <span className={`rounded-xl px-4 py-1.5 text-[11px] font-bold transition-all ${
                          isSelected ? "bg-[#C9A84C] text-[#082555]" : "border-2 border-[#E2D8C4] text-[#9A8A6A]"
                        }`}>
                          {isSelected ? copy.selected : copy.choose}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {entry.projects.length === 0 && (
                <div className="border-t-2 border-[#E2D8C4] bg-[#FAFAFA] px-4 py-4 text-center text-[12px] font-bold text-[#9A8A6A]"
                  style={{ fontFamily: AR }}>
                  {copy.noCompanyProjects}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create view */}
      {activeSection === "create" && (
        <div className="space-y-6">
          {/* Add Company */}
          <div className="overflow-hidden rounded-3xl border-2 border-[#E2D8C4] bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-[#082555] px-6 py-4">
              <PlusIcon className="h-5 w-5 text-[#C9A84C]" />
              <p className="text-[14px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: AR }}>
                {copy.addCompany}
              </p>
            </div>
            <form onSubmit={submitCompany} className="space-y-4 p-6">
              <FormField label={copy.companyName} value={companyForm.name}
                onChange={(e) => setCompanyForm((c) => ({ ...c, name: e.target.value }))}
                placeholder={copy.enterCompanyName} />
              <FormField label={copy.specialization} value={companyForm.specialization}
                onChange={(e) => setCompanyForm((c) => ({ ...c, specialization: e.target.value }))}
                placeholder={copy.enterSpecialization} />
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold text-[#082555] mr-1" style={{ fontFamily: AR }}>
                    {copy.type}
                  </span>
                  <select value={companyForm.type}
                    onChange={(e) => setCompanyForm((c) => ({ ...c, type: e.target.value }))}
                    className="min-h-[48px] w-full rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 py-2.5 text-[14px] font-bold text-[#082555] outline-none transition focus:border-[#C9A84C]"
                    style={{ fontFamily: AR }}>
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
                className="w-full min-h-[52px] rounded-2xl bg-[#082555] py-3 text-[14px] font-bold text-white shadow-lg transition hover:bg-[#2D2821] active:scale-[0.98]"
                style={{ fontFamily: AR }}>
                {copy.saveCompany}
              </button>
            </form>
          </div>

          {/* Add Project */}
          <div className="overflow-hidden rounded-3xl border-2 border-[#E2D8C4] bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#C9A84C] px-6 py-4">
              <div className="flex items-center gap-3">
                <PlusIcon className="h-5 w-5 text-[#082555]" />
                <p className="text-[14px] font-bold text-[#082555] uppercase tracking-wider" style={{ fontFamily: AR }}>
                  {copy.addProject}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#082555]/70" style={{ fontFamily: AR }}>
                {company?.name || copy.chooseCompanyFirst}
              </span>
            </div>
            <form onSubmit={submitProject} className="space-y-4 p-6">
              <FormField label={copy.projectName} value={projectForm.name}
                onChange={(e) => setProjectForm((c) => ({ ...c, name: e.target.value }))}
                placeholder={copy.enterProjectName} />
              <div className="grid grid-cols-2 gap-4">
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
                className={`w-full min-h-[52px] rounded-2xl py-3 text-[14px] font-bold transition active:scale-[0.98] shadow-lg ${
                  company
                    ? "bg-[#C9A84C] text-[#082555] hover:bg-[#E8C97A]"
                    : "cursor-not-allowed bg-[#F7F3EC] text-[#9A8A6A] border-2 border-[#E2D8C4]"
                }`} style={{ fontFamily: AR }}>
                {copy.saveProject}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

import { FolderIcon, SearchIcon, StarIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

function getCompaniesCopy(language) {
  return language === "en"
    ? {
        contractor: "Contractor",
        consultant: "Consultant",
        back: "Back",
        headquarters: "Headquarters",
        website: "Website",
        visitWebsite: "Visit website",
        unavailable: "Currently unavailable",
        keyProjects: "Key projects",
        projectCount: "projects",
        systemProjects: "Projects in system",
        noBudget: "No budget",
        noProjects: "No projects have been added for this company yet.",
        overallRating: "Overall rating",
        customerReviews: "Client reviews and experience",
        reviewCount: "3 reviews",
        reviewOne: "Pricing was clear and communication stayed fast throughout the project.",
        reviewTwo: "Execution quality is excellent, but schedule updates should be faster.",
        reviewThree: "A strong fit for major projects with solid coordination and follow-up.",
        rating: "Rating",
        directory: "Directory",
        projects: "Projects",
        add: "Add",
        searchPlaceholder: "Search by company name, specialty, or city",
        totalCompanies: "Total companies",
        contractors: "Contractors",
        consultants: "Consultants",
        companyDetails: "Company details",
        currentShowing: "Currently showing",
        outOf: "out of",
        remaining: "Remaining",
        previous: "Previous",
        next: "Next",
        page: "Page",
        company: "Company",
        selected: "Selected",
        choose: "Choose",
        noCompanyProjects: "No projects have been added for this company yet.",
        addCompany: "Add company",
        companyName: "Company name",
        enterCompanyName: "Enter company name",
        specialization: "Specialization",
        enterSpecialization: "Roads, MEP, hospitals...",
        type: "Type",
        contracting: "Contracting",
        consulting: "Consulting",
        country: "Country",
        mainCities: "Primary cities",
        citiesPlaceholder: "Riyadh, Jeddah",
        saveCompany: "Save company",
        addProject: "Add project",
        chooseCompanyFirst: "Choose a company first",
        projectName: "Project name",
        enterProjectName: "Enter project name",
        location: "Location",
        stage: "Stage",
        pricingStage: "Pricing",
        budget: "Budget",
        saveProject: "Save project",
      }
    : {
        contractor: "مقاول",
        consultant: "استشاري",
        back: "رجوع",
        headquarters: "المقرات الرئيسية",
        website: "الموقع الإلكتروني",
        visitWebsite: "زيارة الموقع",
        unavailable: "غير متاح حاليًا",
        keyProjects: "المشاريع الرئيسية",
        projectCount: "مشروع",
        systemProjects: "المشاريع داخل النظام",
        noBudget: "بدون ميزانية",
        noProjects: "لا توجد مشاريع مسجلة لهذه الشركة بعد.",
        overallRating: "التقييم العام",
        customerReviews: "التقييم وتجارب العملاء",
        reviewCount: "3 تقييمات",
        reviewOne: "التسعير كان واضحًا والتواصل مع الشركة سريع طوال المشروع.",
        reviewTwo: "جودة التنفيذ ممتازة لكن نحتاج سرعة أعلى في تحديث الجداول.",
        reviewThree: "شركة مناسبة للمشاريع الكبيرة ولديها حضور جيد في التنسيق والمتابعة.",
        rating: "التقييم",
        directory: "الدليل",
        projects: "المشاريع",
        add: "إضافة",
        searchPlaceholder: "ابحث باسم الشركة أو التخصص أو المدينة",
        totalCompanies: "إجمالي الشركات",
        contractors: "مقاولين",
        consultants: "استشاريين",
        companyDetails: "تفاصيل الشركة",
        currentShowing: "يعرض الآن",
        outOf: "من أصل",
        remaining: "المتبقي",
        previous: "السابق",
        next: "التالي",
        page: "صفحة",
        company: "الشركة",
        selected: "محدد",
        choose: "اختيار",
        noCompanyProjects: "لا توجد مشاريع مضافة لهذه الشركة بعد.",
        addCompany: "إضافة شركة",
        companyName: "اسم الشركة",
        enterCompanyName: "اكتب اسم الشركة",
        specialization: "التخصص",
        enterSpecialization: "طرق، MEP، مستشفيات...",
        type: "النوع",
        contracting: "مقاولات",
        consulting: "استشارات",
        country: "الدولة",
        mainCities: "المدن الرئيسية",
        citiesPlaceholder: "الرياض، جدة",
        saveCompany: "حفظ الشركة",
        addProject: "إضافة مشروع",
        chooseCompanyFirst: "اختر شركة أولًا",
        projectName: "اسم المشروع",
        enterProjectName: "اكتب اسم المشروع",
        location: "الموقع",
        stage: "المرحلة",
        pricingStage: "تسعير",
        budget: "الميزانية",
        saveProject: "حفظ المشروع",
      };
}

function translateCompanyType(type, copy) {
  return type === "Contractor" ? copy.contractor : copy.consultant;
}

function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-white/18 px-2.5 py-2 text-[10px] text-white/80 shadow-inner min-[390px]:px-3 min-[390px]:py-2.5 min-[390px]:text-[11px]">
      <SearchIcon className="h-3 w-3 min-[390px]:h-3.5 min-[390px]:w-3.5" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-[10px] text-white placeholder:text-white/60 outline-none min-[390px]:text-[11px]"
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
    <div className="rounded-[16px] border border-[#eadfca] bg-white px-2.5 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] min-[390px]:px-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8px] text-slate-500 min-[390px]:text-[9px]">{label}</p>
        <p className="text-[11px] font-bold text-slate-900 min-[390px]:text-[12px]">{value}</p>
      </div>
    </div>
  );
}

function CompanyReviewPage({ company, onBack, copy }) {
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
                {translateCompanyType(company.type, copy)}
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
          {copy.back}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <div className="rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
          <p className="text-[9px] text-slate-500">{copy.headquarters}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-900">
            {(company.headquarters || []).join(" - ")}
          </p>
        </div>
        <div className="rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
          <p className="text-[9px] text-slate-500">{copy.website}</p>
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[11px] font-semibold text-[#b8893d] underline"
            >
              {copy.visitWebsite}
            </a>
          ) : (
            <p className="mt-1 text-[11px] font-semibold text-slate-400">{copy.unavailable}</p>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">{copy.keyProjects}</p>
          <p className="text-[9px] text-slate-500">{company.projectsCount} {copy.projectCount}</p>
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
        <p className="text-[10px] font-bold text-slate-900">{copy.systemProjects}</p>
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
                  {project.budget || copy.noBudget}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-[12px] bg-[#faf6ef] px-2.5 py-2 text-[9px] text-slate-500">
              {copy.noProjects}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">{copy.overallRating}</p>
          <span className="text-[11px] font-bold text-[#b8893d]">{company.rating}/5</span>
        </div>
        <div className="mt-1 rounded-[12px] bg-[#f8f5ee] px-2.5 py-1.5">
          <Stars rating={company.rating} />
        </div>
      </div>

      <div className="mt-2 rounded-[14px] border border-[#eadfca] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-900">{copy.customerReviews}</p>
          <span className="text-[9px] text-slate-500">{copy.reviewCount}</span>
        </div>
        <div className="mt-2 grid gap-1.5">
          {[
            copy.reviewOne,
            copy.reviewTwo,
            copy.reviewThree,
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

function CompanyCard({ company, selected, onSelectCompany, onShowDetails, copy }) {
  return (
    <div
      className={`w-full rounded-[18px] border p-2.5 text-right shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition ${
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
                <h3 className="truncate text-[12px] font-bold text-slate-900">{company.name}</h3>
                <p className="mt-0.5 text-[10px] font-medium text-[#b8893d]">
                  {company.specialization}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#f0dfbf] bg-[#fcf6ea] px-2 py-0.5 text-[9px] text-slate-600">
                {translateCompanyType(company.type, copy)}
              </span>
            </div>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
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
                  <span>{company.projectsCount} {copy.projectCount}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowDetails(company.id)}
              className="rounded-full border border-[#d8b16c] bg-white px-2.5 py-0.5 text-[9px] font-semibold text-[#b8893d] shadow-sm"
            >
              {copy.rating}
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
  navigationBridge,
  settings,
}) {
  const copy = getCompaniesCopy(settings?.language);
  const [query, setQuery] = useState("");
  const [companyForm, setCompanyForm] = useState({
    name: "",
    type: "Contractor",
    country: settings?.language === "en" ? "Saudi Arabia" : "السعودية",
    specialization: "",
    headquarters: "",
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    stage: copy.pricingStage,
    budget: "",
  });
  const [directoryPage, setDirectoryPage] = useState(1);
  const companiesNavigation = useBackStack({
    initialEntry: { section: "directory", detailCompanyId: null },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeSection = companiesNavigation.currentEntry.section;
  const detailCompanyId = companiesNavigation.currentEntry.detailCompanyId;

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
    { id: "directory", label: copy.directory },
    { id: "projects", label: copy.projects },
    { id: "create", label: copy.add },
  ];

  useEffect(() => {
    if (directoryPage > totalDirectoryPages) {
      setDirectoryPage(totalDirectoryPages);
    }
  }, [directoryPage, totalDirectoryPages]);

  useEffect(() => {
    if (activeSection === "details") {
      companiesNavigation.reset({ section: "directory", detailCompanyId: null });
    }
    // Search and pagination changes should close the detail view to avoid stale results.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      country: settings?.language === "en" ? "Saudi Arabia" : "السعودية",
      specialization: "",
      headquarters: "",
    });
    companiesNavigation.navigate({ section: "projects", detailCompanyId: null });
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
      stage: copy.pricingStage,
      budget: "",
    });
  };

  const openDetailPage = (companyId) => {
    companiesNavigation.navigate({ section: "details", detailCompanyId: companyId });
  };

  const closeDetailPage = () => {
    companiesNavigation.reset({ section: "directory", detailCompanyId: null });
  };

  return (
    <div className="grid gap-2">
      {activeSection !== "details" ? (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-2.5 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
          <div className="flex gap-1.5 rounded-[16px] bg-white/10 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  companiesNavigation.navigate({
                    section: tab.id,
                    detailCompanyId: null,
                  })
                }
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
                placeholder={copy.searchPlaceholder}
                value={query}
                onChange={handleQueryChange}
              />
              <div className="grid grid-cols-3 gap-1.5 min-[390px]:gap-2">
                <StatCard label={copy.totalCompanies} value={summary.total} />
                <StatCard label={copy.contractors} value={summary.contractors} />
                <StatCard label={copy.consultants} value={summary.consultants} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#1a2f56_0%,#132443_100%)] p-2.5 shadow-[0_20px_40px_rgba(9,18,42,0.28)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-[#d8b16c]">{copy.companyDetails}</p>
              <h3 className="mt-1 text-[15px] font-bold text-white">{copy.customerReviews}</h3>
            </div>
            <button
              type="button"
              onClick={closeDetailPage}
              className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold text-white/85"
            >
              {copy.back}
            </button>
          </div>
        </div>
      )}

      {activeSection === "directory" ? (
        <div className="flex min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 pb-2">
          <div className="flex items-center justify-between rounded-[14px] border border-[#eadfca] bg-white px-3 py-2 text-[10px] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-slate-500">
              {copy.currentShowing}{" "}
              <span className="font-bold text-slate-900">{pagedCompanies.length}</span>{" "}
              {copy.outOf}{" "}
              <span className="font-bold text-slate-900">{filteredCompanies.length}</span>
            </p>
            <p className="font-semibold text-[#b8893d]">
              {copy.remaining} {Math.max(filteredCompanies.length - directoryPage * directoryPageSize, 0)}
            </p>
          </div>
          {pagedCompanies.map((entry) => (
            <CompanyCard
              key={entry.id}
              company={entry}
              copy={copy}
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
              {copy.previous}
            </button>
            <p className="text-[10px] text-slate-500">
              {copy.page} {directoryPage} {copy.outOf} {totalDirectoryPages}
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
              {copy.next}
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === "details" ? (
        <div className="overflow-y-auto pr-1 pb-2">
          <CompanyReviewPage company={detailCompany} onBack={closeDetailPage} copy={copy} />
        </div>
      ) : null}

      {activeSection === "projects" ? (
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
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
                  <p className="text-[9px] text-slate-500">{copy.company}</p>
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
                  {entry.projects.length} {copy.projectCount}
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
                            {isSelected ? copy.selected : copy.choose}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[14px] border border-dashed border-[#dec89a] bg-[#fffdfa] px-3 py-3 text-center text-[10px] text-slate-500">
                    {copy.noCompanyProjects}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeSection === "create" ? (
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
          <form
            onSubmit={submitCompany}
            className="grid gap-2 rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
          >
            <p className="text-[11px] font-bold text-slate-900">{copy.addCompany}</p>
            <Field
              label={copy.companyName}
              value={companyForm.name}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={copy.enterCompanyName}
            />
            <Field
              label={copy.specialization}
              value={companyForm.specialization}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, specialization: event.target.value }))
              }
              placeholder={copy.enterSpecialization}
            />
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-semibold text-slate-600">{copy.type}</span>
                <select
                  value={companyForm.type}
                  onChange={(event) =>
                    setCompanyForm((current) => ({ ...current, type: event.target.value }))
                  }
                  className="rounded-[12px] border border-[#eadfca] bg-white px-3 py-2 text-[11px] text-slate-900 outline-none"
                >
                  <option value="Contractor">{copy.contracting}</option>
                  <option value="Consultant">{copy.consulting}</option>
                </select>
              </label>
              <Field
                label={copy.country}
                value={companyForm.country}
                onChange={(event) =>
                  setCompanyForm((current) => ({ ...current, country: event.target.value }))
                }
                placeholder={settings?.language === "en" ? "Saudi Arabia" : "السعودية"}
              />
            </div>
            <Field
              label={copy.mainCities}
              value={companyForm.headquarters}
              onChange={(event) =>
                setCompanyForm((current) => ({ ...current, headquarters: event.target.value }))
              }
              placeholder={copy.citiesPlaceholder}
            />
            <button
              type="submit"
              className="rounded-[14px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[11px] font-bold text-white"
            >
              {copy.saveCompany}
            </button>
          </form>

          <form
            onSubmit={submitProject}
            className="grid gap-2 rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-900">{copy.addProject}</p>
              <span className="text-[9px] text-slate-500">{company?.name || copy.chooseCompanyFirst}</span>
            </div>
            <Field
              label={copy.projectName}
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={copy.enterProjectName}
            />
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              <Field
                label={copy.location}
                value={projectForm.location}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder={settings?.language === "en" ? "Riyadh" : "الرياض"}
              />
              <Field
                label={copy.stage}
                value={projectForm.stage}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, stage: event.target.value }))
                }
                placeholder={copy.pricingStage}
              />
            </div>
            <Field
              label={copy.budget}
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
              {copy.saveProject}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "./components/AppShell";
import LoginScreen from "./components/LoginScreen";
import Modal from "./components/Modal";
import {
  importedPricingRows,
  importedPricingSource,
  pricingCatalog,
  sampleCompanies,
  sampleSettings,
  sampleSuppliers,
} from "./data/sampleData";
import CompaniesPage from "./pages/CompaniesPage";
import PricingPage from "./pages/PricingPage";
import SettingsPage from "./pages/SettingsPage";
import SuppliersPage from "./pages/SuppliersPage";
import { getAppText } from "./data/appText";

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseNumericInput(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}

function inferCompanyLogo(specialization = "", type = "Contractor") {
  if (type === "Consultant") {
    return "📐";
  }

  if (specialization.includes("طرق") || specialization.includes("جسور")) {
    return "🛣️";
  }
  if (specialization.includes("كهرب")) {
    return "⚡";
  }
  if (
    specialization.includes("MEP") ||
    specialization.includes("ميكانيك") ||
    specialization.includes("كهروميكانيك")
  ) {
    return "🛠️";
  }
  if (specialization.includes("مياه") || specialization.includes("تحلية")) {
    return "💧";
  }
  if (specialization.includes("خرسانة") || specialization.includes("إنشائي")) {
    return "🏗️";
  }
  if (specialization.includes("تشطيبات") || specialization.includes("معماري")) {
    return "🧱";
  }

  return "🏢";
}

function createRoute(authMode, page = "companies") {
  if (!authMode) {
    return { kind: "login" };
  }

  return { kind: "app", page };
}

export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [activePage, setActivePage] = useState("companies");
  const [routeStack, setRouteStack] = useState([createRoute(null)]);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [companies, setCompanies] = useState(sampleCompanies);
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [settings, setSettings] = useState(sampleSettings);
  const [selectedPricingItemId, setSelectedPricingItemId] = useState(pricingCatalog[1]?.id || null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(sampleCompanies[0]?.id || null);
  const [selectedProjectId, setSelectedProjectId] = useState(
    sampleCompanies[0]?.projects[0]?.id || null
  );
  const routeStackRef = useRef(routeStack);
  const allowExitRef = useRef(false);
  const appText = getAppText(settings.language);

  useEffect(() => {
    routeStackRef.current = routeStack;
  }, [routeStack]);

  useEffect(() => {
    window.history.replaceState({ source: "taseera-root" }, "");
    window.history.pushState({ source: "taseera-guard" }, "");

    const handlePopState = () => {
      if (allowExitRef.current) {
        allowExitRef.current = false;
        return;
      }

      const currentStack = routeStackRef.current;

      if (currentStack.length > 1) {
        const nextStack = currentStack.slice(0, -1);
        const previousRoute = nextStack[nextStack.length - 1];

        setRouteStack(nextStack);

        if (previousRoute.kind === "login") {
          setAuthMode(null);
          setActivePage("companies");
        } else {
          setActivePage(previousRoute.page);
        }

        return;
      }

      setShowExitPrompt(true);
      window.history.pushState({ source: "taseera-guard" }, "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const pushRoute = useCallback((route) => {
    setRouteStack((current) => {
      const lastRoute = current[current.length - 1];

      if (
        lastRoute?.kind === route.kind &&
        lastRoute?.page === route.page
      ) {
        return current;
      }

      return [...current, route];
    });

    window.history.pushState({ source: "taseera-guard" }, "");
  }, []);

  const handleNavigate = useCallback(
    (page) => {
      if (page === activePage) {
        return;
      }

      setActivePage(page);
      pushRoute(createRoute(authMode, page));
    },
    [activePage, authMode, pushRoute]
  );

  const handleAuthEntry = useCallback(
    (mode) => {
      setAuthMode(mode);
      setActivePage("companies");
      setShowExitPrompt(false);
      setRouteStack([createRoute(mode, "companies")]);
      window.history.pushState({ source: "taseera-guard" }, "");
    },
    []
  );

  const handleLogout = useCallback(() => {
    setAuthMode(null);
    setActivePage("companies");
    setShowExitPrompt(false);
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitPrompt(false);
    allowExitRef.current = true;
    window.history.back();
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  const selectedProject = useMemo(() => {
    if (!selectedCompany) {
      return null;
    }

    return (
      selectedCompany.projects.find((project) => project.id === selectedProjectId) ||
      selectedCompany.projects[0] ||
      null
    );
  }, [selectedCompany, selectedProjectId]);

  const selectCompany = (companyId) => {
    const company = companies.find((item) => item.id === companyId);

    setSelectedCompanyId(companyId);
    setSelectedProjectId(company?.projects[0]?.id || null);
  };

  const selectProject = (companyId, projectId) => {
    setSelectedCompanyId(companyId);
    setSelectedProjectId(projectId);
  };

  const addCompany = (companyInput) => {
    const headquarters = (companyInput.headquarters || "")
      .split(/[،,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const newCompany = {
      id: createId("comp"),
      name: companyInput.name.trim(),
      type: companyInput.type,
      country: companyInput.country.trim(),
      logo: inferCompanyLogo(companyInput.specialization, companyInput.type),
      specialization: companyInput.specialization.trim(),
      headquarters,
      description: `شركة ${companyInput.type === "Consultant" ? "استشارية" : "تنفيذية"} متخصصة في ${companyInput.specialization.trim()}.`,
      rating: 4.4,
      projectsCount: 0,
      keyProjects: [],
      projects: [],
    };

    setCompanies((current) => [...current, newCompany]);
    setSelectedCompanyId(newCompany.id);
    setSelectedProjectId(null);
  };

  const addProject = (companyId, projectInput) => {
    const newProject = {
      id: createId("proj"),
      name: projectInput.name.trim(),
      location: projectInput.location.trim(),
      stage: projectInput.stage.trim() || "Planning",
      budget: parseNumericInput(projectInput.budget),
      pricingItems: [],
    };

    setCompanies((current) =>
      current.map((company) =>
        company.id === companyId
          ? { ...company, projects: [...company.projects, newProject] }
          : company
      )
    );
    setSelectedCompanyId(companyId);
    setSelectedProjectId(newProject.id);
    setActivePage("companies");
  };

  const updateSelectedProject = (updater) => {
    if (!selectedCompanyId || !selectedProjectId) {
      return;
    }

    setCompanies((current) =>
      current.map((company) => {
        if (company.id !== selectedCompanyId) {
          return company;
        }

        return {
          ...company,
          projects: company.projects.map((project) =>
            project.id === selectedProjectId ? updater(project) : project
          ),
        };
      })
    );
  };

  const addPricingRow = () => {
    updateSelectedProject((project) => ({
      ...project,
      pricingItems: [
        ...project.pricingItems,
        {
          id: createId("item"),
          code: "",
          description: "",
          unit: "",
          quantity: "",
          unitPrice: "",
          supplierId: "",
          expanded: false,
          breakdown: [
            { id: createId("bd"), name: "Material", cost: "" },
            { id: createId("bd"), name: "Labor", cost: "" },
            { id: createId("bd"), name: "Equipment", cost: "" },
          ],
        },
      ],
    }));
  };

  const deletePricingRow = (itemId) => {
    updateSelectedProject((project) => ({
      ...project,
      pricingItems: project.pricingItems.filter((item) => item.id !== itemId),
    }));
  };

  const updatePricingRow = (itemId, field, value) => {
    updateSelectedProject((project) => ({
      ...project,
      pricingItems: project.pricingItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unitPrice"
                  ? parseNumericInput(value)
                  : value,
            }
          : item
      ),
    }));
  };

  const togglePricingBreakdown = (itemId) => {
    updateSelectedProject((project) => ({
      ...project,
      pricingItems: project.pricingItems.map((item) =>
        item.id === itemId ? { ...item, expanded: !item.expanded } : item
      ),
    }));
  };

  const addSupplier = (supplierInput) => {
    const newSupplier = {
      id: createId("sup"),
      name: supplierInput.name.trim(),
      category: supplierInput.category.trim(),
      location: supplierInput.location.trim(),
      phone: supplierInput.phone.trim(),
      email: supplierInput.email.trim(),
      contactPerson: supplierInput.contactPerson.trim(),
    };

    setSuppliers((current) => [...current, newSupplier]);
  };

  const updateSetting = (field, value) => {
    setSettings((current) => {
      if (field === "country") {
        return {
          ...current,
          country: value,
          city: current.city && current.country === value ? current.city : "",
        };
      }

      return {
        ...current,
        [field]:
          ["overheadPercent", "profitPercent", "taxPercent", "locationFactor"].includes(
            field
          )
            ? parseNumericInput(value)
            : value,
      };
    });
  };

  const pageProps = {
    authMode,
    companies,
    suppliers,
    settings,
    pricingCatalog,
    importedPricingSource,
    importedPricingStats: {
      totalRows: importedPricingSource?.rowsCount || 0,
      byCategory: [
        "أعمال إنشائية",
        "أعمال معمارية",
        "أعمال كهربائية",
        "أعمال ميكانيكية",
      ].map((category) => ({
        category,
        count: importedPricingRows.filter((row) => row.category === category).length,
      })),
    },
    selectedPricingItemId,
    selectedCompanyId,
    selectedProjectId,
    company: selectedCompany,
    project: selectedProject,
    onSelectPricingItem: setSelectedPricingItemId,
    onSelectCompany: selectCompany,
    onSelectProject: selectProject,
    onAddCompany: addCompany,
    onAddProject: addProject,
    onAddSupplier: addSupplier,
    onAddRow: addPricingRow,
    onDeleteRow: deletePricingRow,
    onUpdateRow: updatePricingRow,
    onToggleExpand: togglePricingBreakdown,
    onUpdateSetting: updateSetting,
    onLogout: handleLogout,
  };

  const renderedPage = {
    companies: <CompaniesPage {...pageProps} />,
    pricing: <PricingPage {...pageProps} />,
    suppliers: <SuppliersPage {...pageProps} />,
    settings: <SettingsPage {...pageProps} />,
  }[activePage];

  if (!authMode) {
    return (
      <>
        <LoginScreen
          onLogin={handleAuthEntry}
          onGuest={handleAuthEntry}
          language={settings.language}
          theme={settings.theme}
          onChangeLanguage={(language) =>
            setSettings((current) => ({ ...current, language }))
          }
        />
        {showExitPrompt ? (
          <Modal title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"} onClose={() => setShowExitPrompt(false)}>
            <div className="grid gap-3 text-right">
              <p className="text-sm text-slate-700">
                {settings.language === "en" ? "Do you want to exit the app?" : "هل تريد الخروج من التطبيق؟"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={confirmExit}
                  className="rounded-[12px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-xs font-bold text-white"
                >
                  {settings.language === "en" ? "Yes, Exit" : "نعم، خروج"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitPrompt(false)}
                  className="rounded-[12px] border border-[#d8b16c] bg-white px-3 py-2 text-xs font-bold text-[#b8893d]"
                >
                  {settings.language === "en" ? "Cancel" : "إلغاء"}
                </button>
              </div>
            </div>
          </Modal>
        ) : null}
      </>
    );
  }

  return (
    <>
      <AppShell
        activePage={activePage}
        onNavigate={handleNavigate}
        selectedCompany={selectedCompany}
        selectedProject={selectedProject}
        authMode={authMode}
        navText={appText.nav}
        language={settings.language}
        theme={settings.theme}
      >
        {renderedPage}
      </AppShell>
      {showExitPrompt ? (
        <Modal title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"} onClose={() => setShowExitPrompt(false)}>
          <div className="grid gap-3 text-right">
            <p className="text-sm text-slate-700">
              {settings.language === "en" ? "Do you want to exit the app?" : "هل تريد الخروج من التطبيق؟"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={confirmExit}
                className="rounded-[12px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-xs font-bold text-white"
              >
                {settings.language === "en" ? "Yes, Exit" : "نعم، خروج"}
              </button>
              <button
                type="button"
                onClick={() => setShowExitPrompt(false)}
                className="rounded-[12px] border border-[#d8b16c] bg-white px-3 py-2 text-xs font-bold text-[#b8893d]"
              >
                {settings.language === "en" ? "Cancel" : "إلغاء"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

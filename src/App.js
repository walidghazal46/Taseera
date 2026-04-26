import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "./components/AppShell";
import LoginScreen from "./components/LoginScreen";
import Modal from "./components/Modal";
import useAndroidBridge from "./hooks/useAndroidBridge";
import usePersistentState from "./hooks/usePersistentState";
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

const APP_STORAGE_PREFIX = "taseera.v3";

function getForcedScreen() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("screen");
}

function clearForcedScreenQuery() {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("screen");
  window.history.replaceState(window.history.state, "", url.toString());
}

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

function getSystemText(language = "ar") {
  return language === "en"
    ? {
        consultantCompany: "consulting",
        contractorCompany: "delivery",
        companyAdded: (name) => `Added company ${name}.`,
        projectAdded: (name) => `Added project ${name}.`,
        supplierAdded: (name) => `Added supplier ${name}.`,
        supplierInitial: "S",
        loginRequiredToSave: "Sign-in is required to save the analysis.",
        chooseCompanyBeforeSave: "Choose a company and project before saving.",
        analysisSaved: "The analysis was saved and linked to the current project.",
        loginRequiredForRfq: "Sign-in is required to create an RFQ.",
        genericRequest: "General request",
        market: "Market",
        supplyService: "Supply service",
        rfqSubject: (name) => `RFQ - ${name}`,
        rfqGreeting: (contact, itemName) =>
          `Hello ${contact},%0D%0AWe would like to receive an initial quotation for: ${itemName}.`,
        rfqShareTitle: "Request for quotation",
        rfqShareBody: (name) => `A new RFQ was created for ${name}.`,
        rfqCreated: "The RFQ was created and the proper contact channel was opened.",
        callOpened: (name) => `Calling ${name}.`,
        emailInquirySubject: (appName) => `Inquiry from ${appName}`,
        emailInquiryBody: (contact, category) =>
          `Hello ${contact},%0D%0AWe would like to get in touch regarding ${category}.`,
        supplierEmailOpened: (name) => `Opened email for supplier ${name}.`,
        sharedSupplier: "Supplier details were shared.",
        shareFailed: "Unable to share supplier details from this device.",
        contactSubject: (appName) => `Contact from ${appName}`,
        contactBody: "Hello, I have a question about the application.",
        contactOpened: "Opened contact via email.",
        supportSubject: (appName) => `Technical support - ${appName}`,
        supportBody: "Technical support for Taseera app regarding:",
        supportOpened: "Opened technical support via email.",
        appStatus: "Application Status",
        platform: "Platform",
        version: "Version",
        savedAnalyses: "Saved analyses",
        rfqRequests: "RFQ requests",
        appStoreOpened: "Opened the rating page or app store.",
        privacyTitle: "Privacy Policy",
      }
    : {
        consultantCompany: "استشارية",
        contractorCompany: "تنفيذية",
        companyAdded: (name) => `تمت إضافة الشركة ${name}.`,
        projectAdded: (name) => `تمت إضافة المشروع ${name}.`,
        supplierAdded: (name) => `تمت إضافة المورد ${name}.`,
        supplierInitial: "م",
        loginRequiredToSave: "يجب تسجيل الدخول لحفظ التحليل.",
        chooseCompanyBeforeSave: "اختر شركة ومشروعًا قبل الحفظ.",
        analysisSaved: "تم حفظ التحليل وربطه بالمشروع الحالي.",
        loginRequiredForRfq: "تسجيل الدخول مطلوب لإنشاء طلب عرض سعر.",
        genericRequest: "طلب عام",
        market: "السوق",
        supplyService: "خدمة توريد",
        rfqSubject: (name) => `طلب عرض سعر - ${name}`,
        rfqGreeting: (contact, itemName) =>
          `مرحبًا ${contact},%0D%0Aنرغب في استلام عرض سعر مبدئي للبند: ${itemName}.`,
        rfqShareTitle: "طلب عرض سعر",
        rfqShareBody: (name) => `تم إنشاء طلب عرض سعر جديد للبند ${name}.`,
        rfqCreated: "تم إنشاء طلب عرض السعر وفتح قناة التواصل المناسبة.",
        callOpened: (name) => `تم فتح الاتصال مع ${name}.`,
        emailInquirySubject: (appName) => `استفسار من تطبيق ${appName}`,
        emailInquiryBody: (contact, category) =>
          `مرحبًا ${contact},%0D%0Aنرغب بالتواصل بخصوص ${category}.`,
        supplierEmailOpened: (name) => `تم فتح البريد الإلكتروني للمورد ${name}.`,
        sharedSupplier: "تمت مشاركة بيانات المورد.",
        shareFailed: "تعذر مشاركة بيانات المورد من هذا الجهاز.",
        contactSubject: (appName) => `تواصل من تطبيق ${appName}`,
        contactBody: "مرحبًا، لدي استفسار بخصوص التطبيق.",
        contactOpened: "تم فتح وسيلة التواصل عبر البريد الإلكتروني.",
        supportSubject: (appName) => `دعم فني - ${appName}`,
        supportBody: "الدعم الفني تطبيق تسعيرة في :",
        supportOpened: "تم فتح الدعم الفني عبر البريد الإلكتروني.",
        appStatus: "حالة التطبيق",
        platform: "المنصة",
        version: "الإصدار",
        savedAnalyses: "التحليلات المحفوظة",
        rfqRequests: "طلبات عروض الأسعار",
        appStoreOpened: "تم فتح صفحة التقييم أو المتجر.",
        privacyTitle: "سياسة الخصوصية",
      };
}

function StatusToast({ status }) {
  if (!status) {
    return null;
  }

  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-slate-200 bg-white text-slate-800",
  }[status.tone || "info"];

  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className={`w-full max-w-md rounded-[16px] border px-4 py-3 text-sm shadow-xl ${toneClass}`}>
        {status.message}
      </div>
    </div>
  );
}

function InfoDialog({ dialog, onClose }) {
  if (!dialog) {
    return null;
  }

  return (
    <Modal title={dialog.title} onClose={onClose} closeLabel={dialog.closeLabel || "Close"}>
      <div className="grid gap-3 text-right">
        {dialog.lines?.map((line) => (
          <p key={line} className="text-sm leading-6 text-slate-700">
            {line}
          </p>
        ))}
        {dialog.action ? (
          <button
            type="button"
            onClick={dialog.action.onClick}
            className="rounded-[12px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-xs font-bold text-white"
          >
            {dialog.action.label}
          </button>
        ) : null}
      </div>
    </Modal>
  );
}

export default function App() {
  const forcedScreen = getForcedScreen();
  const bridge = useAndroidBridge();
  const [authMode, setAuthMode] = usePersistentState(`${APP_STORAGE_PREFIX}.authMode`, null);
  const [authSession, setAuthSession] = usePersistentState(`${APP_STORAGE_PREFIX}.authSession`, null);
  const [activePage, setActivePage] = usePersistentState(`${APP_STORAGE_PREFIX}.activePage`, "companies");
  const [routeStack, setRouteStack] = useState([
    createRoute(authMode, authMode ? activePage : "companies"),
  ]);
  const [pageResetVersion, setPageResetVersion] = useState({
    companies: 0,
    pricing: 0,
    suppliers: 0,
    settings: 0,
  });
  const [scrollResetVersion, setScrollResetVersion] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [exitFromCompanies, setExitFromCompanies] = useState(false);
  const [companies, setCompanies] = usePersistentState(
    `${APP_STORAGE_PREFIX}.companies`,
    sampleCompanies
  );
  const [suppliers, setSuppliers] = usePersistentState(
    `${APP_STORAGE_PREFIX}.suppliers`,
    sampleSuppliers
  );
  const [settings, setSettings] = usePersistentState(
    `${APP_STORAGE_PREFIX}.settings`,
    sampleSettings
  );
  const [savedAnalyses, setSavedAnalyses] = usePersistentState(
    `${APP_STORAGE_PREFIX}.savedAnalyses`,
    []
  );
  const [rfqRequests, setRfqRequests] = usePersistentState(
    `${APP_STORAGE_PREFIX}.rfqRequests`,
    []
  );
  const [selectedPricingItemId, setSelectedPricingItemId] = usePersistentState(
    `${APP_STORAGE_PREFIX}.selectedPricingItemId`,
    pricingCatalog[1]?.id || null
  );
  const [selectedCompanyId, setSelectedCompanyId] = usePersistentState(
    `${APP_STORAGE_PREFIX}.selectedCompanyId`,
    sampleCompanies[0]?.id || null
  );
  const [selectedProjectId, setSelectedProjectId] = usePersistentState(
    `${APP_STORAGE_PREFIX}.selectedProjectId`,
    sampleCompanies[0]?.projects[0]?.id || null
  );
  const [status, setStatus] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [authScreenMode, setAuthScreenMode] = useState(forcedScreen === "login" ? "login" : null);
  const routeStackRef = useRef(routeStack);
  const allowExitRef = useRef(false);
  const pageBackHandlerRef = useRef(() => false);
  const statusTimeoutRef = useRef(null);
  const appText = getAppText(settings.language);
  const systemText = getSystemText(settings.language);
  const shouldShowLogin = !authMode || authScreenMode !== null || forcedScreen === "login";

  const showStatus = useCallback(
    (message, tone = "info") => {
      setStatus({ message, tone });
      bridge.showToast(message);

      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }

      statusTimeoutRef.current = window.setTimeout(() => {
        setStatus(null);
      }, 3200);
    },
    [bridge]
  );

  const openDialog = useCallback((nextDialog) => {
    setDialog(nextDialog);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const openAuthScreen = useCallback((mode = "login") => {
    setAuthScreenMode(mode);
  }, []);

  useEffect(() => {
    routeStackRef.current = routeStack;
  }, [routeStack]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const selectedCompanyExists = companies.some((company) => company.id === selectedCompanyId);
    if (!selectedCompanyExists) {
      const fallbackCompany = companies[0] || null;
      setSelectedCompanyId(fallbackCompany?.id || null);
      setSelectedProjectId(fallbackCompany?.projects?.[0]?.id || null);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId, setSelectedProjectId]);

  useEffect(() => {
    const existingIds = new Set(companies.map((company) => company.id));
    const missingSeedCompanies = sampleCompanies.filter((company) => !existingIds.has(company.id));

    if (missingSeedCompanies.length) {
      setCompanies((current) => {
        const currentIds = new Set(current.map((company) => company.id));
        const nextMissing = sampleCompanies.filter((company) => !currentIds.has(company.id));
        return nextMissing.length ? [...current, ...nextMissing] : current;
      });
    }
  }, [companies, setCompanies]);

  useEffect(() => {
    setSuppliers((current) => {
      const seedSupplierMap = new Map(sampleSuppliers.map((supplier) => [supplier.id, supplier]));
      let changed = false;

      const nextSuppliers = current.map((supplier) => {
        if (!/^sup-\d+$/.test(supplier.id)) {
          return supplier;
        }

        const seedSupplier = seedSupplierMap.get(supplier.id);
        if (!seedSupplier) {
          return supplier;
        }

        const mergedSupplier = { ...supplier, ...seedSupplier };

        if (JSON.stringify(mergedSupplier) !== JSON.stringify(supplier)) {
          changed = true;
          return mergedSupplier;
        }

        return supplier;
      });

      const currentIds = new Set(nextSuppliers.map((supplier) => supplier.id));
      const missingSeedSuppliers = sampleSuppliers.filter((supplier) => !currentIds.has(supplier.id));

      if (missingSeedSuppliers.length) {
        changed = true;
        nextSuppliers.push(...missingSeedSuppliers);
      }

      return changed ? nextSuppliers : current;
    });
  }, [setSuppliers]);

  useEffect(() => {
    const selectedCompany = companies.find((company) => company.id === selectedCompanyId);
    if (!selectedCompany) {
      return;
    }

    const selectedProjectExists = selectedCompany.projects.some(
      (project) => project.id === selectedProjectId
    );

    if (!selectedProjectExists) {
      setSelectedProjectId(selectedCompany.projects[0]?.id || null);
    }
  }, [companies, selectedCompanyId, selectedProjectId, setSelectedProjectId]);

  const registerPageBackHandler = useCallback((handler) => {
    pageBackHandlerRef.current = handler;

    return () => {
      if (pageBackHandlerRef.current === handler) {
        pageBackHandlerRef.current = () => false;
      }
    };
  }, []);

  const pushHistoryEntry = useCallback(() => {
    window.history.pushState({ source: "taseera-guard" }, "");
  }, []);

  const notifySubpageNavigation = useCallback(() => {
    setScrollResetVersion((current) => current + 1);
  }, []);

  const performBackNavigation = useCallback(() => {
    if (pageBackHandlerRef.current?.()) {
      setShowExitPrompt(false);
      return true;
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

      setShowExitPrompt(false);
      return true;
    }

    if (activePage !== "companies") {
      setActivePage("companies");
      setRouteStack([createRoute(authMode, "companies")]);
      setShowExitPrompt(false);
      return true;
    }

    // Only show exit prompt on Android, when on companies page
    if (bridge.isAndroid) {
      // If no authMode → we're on the login screen → pressing Yes will close the app
      // If authMode → we're on the companies page → pressing Yes will go to login
      setExitFromCompanies(!!authMode);
      setShowExitPrompt(true);
    }
    return false;
  }, [activePage, authMode, bridge.isAndroid, setActivePage, setAuthMode]);

  useEffect(() => {
    window.history.replaceState({ source: "taseera-root" }, "");
    window.history.pushState({ source: "taseera-guard" }, "");

    const handlePopState = () => {
      if (allowExitRef.current) {
        allowExitRef.current = false;
        return;
      }
      performBackNavigation();
      window.history.pushState({ source: "taseera-guard" }, "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [performBackNavigation]);

  const pushRoute = useCallback((route) => {
    setRouteStack((current) => {
      const lastRoute = current[current.length - 1];

      if (lastRoute?.kind === route.kind && lastRoute?.page === route.page) {
        return current;
      }

      if (route.kind === "app") {
        if (route.page === "companies") {
          return [route];
        }

        if (lastRoute?.kind === "app") {
          return [lastRoute, route];
        }
      }

      return [...current, route];
    });

    window.history.pushState({ source: "taseera-guard" }, "");
  }, []);

  const handleNavigate = useCallback(
    (page) => {
      setPageResetVersion((current) => ({
        ...current,
        [page]: (current[page] || 0) + 1,
      }));

      setShowExitPrompt(false);

      if (page === activePage) {
        setRouteStack([createRoute(authMode, page)]);
        setScrollResetVersion((current) => current + 1);
        return;
      }

      setActivePage(page);
      pushRoute(createRoute(authMode, page));
    },
    [activePage, authMode, pushRoute, setActivePage]
  );

  const handleAuthEntry = useCallback(
    (mode, payload = {}) => {
      pageBackHandlerRef.current = () => false;
      setAuthMode(mode);
      setAuthSession({
        mode,
        userName: payload.userName || settings.userName,
        userEmail: payload.userEmail || settings.userEmail,
        lastLoginAt: new Date().toLocaleString("en-GB"),
      });
      setActivePage("companies");
      setShowExitPrompt(false);
      setAuthScreenMode(null);
      clearForcedScreenQuery();
      setRouteStack([createRoute(mode, "companies")]);
      setSettings((current) => ({
        ...current,
        userName: payload.userName || current.userName,
        userEmail: payload.userEmail || current.userEmail,
      }));
      window.history.pushState({ source: "taseera-guard" }, "");
      if (mode !== "guest") {
        showStatus(
          settings.language === "en"
            ? "Signed in successfully."
            : "تم تسجيل الدخول بنجاح.",
          "success"
        );
      }
    },
    [
      setActivePage,
      setAuthMode,
      setAuthSession,
      setSettings,
      settings.language,
      settings.userEmail,
      settings.userName,
      showStatus,
    ]
  );

  const handleLogout = useCallback(() => {
    pageBackHandlerRef.current = () => false;
    setAuthMode(null);
    setAuthSession(null);
    setActivePage("companies");
    setShowExitPrompt(false);
    setAuthScreenMode("login");
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
    showStatus(
      settings.language === "en" ? "Signed out of the account." : "تم تسجيل الخروج من الحساب.",
      "info"
    );
  }, [setActivePage, setAuthMode, setAuthSession, settings.language, showStatus]);

  const openLoginScreen = useCallback(() => {
    setShowExitPrompt(false);
    setExitFromCompanies(false);
    pageBackHandlerRef.current = () => false;
    setAuthMode(null);
    setAuthSession(null);
    setActivePage("companies");
    setAuthScreenMode("login");
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
  }, [setActivePage, setAuthMode, setAuthSession]);

  const confirmExit = useCallback(() => {
    setShowExitPrompt(false);
    if (exitFromCompanies) {
      // From companies page → go to login
      openLoginScreen();
    } else {
      // From login screen → exit the app
      bridge.exitApp();
    }
  }, [bridge, exitFromCompanies, openLoginScreen]);

  const handleTopLevelBack = useCallback(() => {
    if (!bridge.isAndroid) {
      const isCompaniesRoot =
        activePage === "companies" && routeStackRef.current.length <= 1;

      if (isCompaniesRoot) {
        openLoginScreen();
        return;
      }

      const handled = performBackNavigation();
      if (handled) {
        pushHistoryEntry();
      }
      return;
    }

    const handled = performBackNavigation();
    if (handled) {
      pushHistoryEntry();
    }
  }, [activePage, bridge.isAndroid, openLoginScreen, performBackNavigation, pushHistoryEntry]);

  const selectedCompany = useMemo(
    () => companies.find((companyItem) => companyItem.id === selectedCompanyId) || null,
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
      description:
        settings.language === "en"
          ? `${companyInput.type === "Consultant" ? "Consulting" : "Execution"} company specialized in ${companyInput.specialization.trim()}.`
          : `شركة ${companyInput.type === "Consultant" ? systemText.consultantCompany : systemText.contractorCompany} متخصصة في ${companyInput.specialization.trim()}.`,
      rating: 4.4,
      projectsCount: 0,
      keyProjects: [],
      projects: [],
    };

    setCompanies((current) => [...current, newCompany]);
    setSelectedCompanyId(newCompany.id);
    setSelectedProjectId(null);
    showStatus(systemText.companyAdded(newCompany.name), "success");
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
      current.map((companyItem) =>
        companyItem.id === companyId
          ? {
              ...companyItem,
              projects: [...companyItem.projects, newProject],
              projectsCount: Math.max(
                companyItem.projectsCount,
                companyItem.projects.length + 1
              ),
            }
          : companyItem
      )
    );
    setSelectedCompanyId(companyId);
    setSelectedProjectId(newProject.id);
    setActivePage("companies");
    showStatus(systemText.projectAdded(newProject.name), "success");
  };

  const addSupplier = (supplierInput) => {
    const newSupplier = {
      id: createId("sup"),
      name: supplierInput.name.trim(),
      category: supplierInput.category.trim(),
      group: supplierInput.category.trim(),
      location: supplierInput.location.trim(),
      phone: supplierInput.phone.trim(),
      email: supplierInput.email.trim(),
      contactPerson: supplierInput.contactPerson.trim(),
      description: supplierInput.category.trim(),
      website: supplierInput.website?.trim() || "",
      rating: 4,
      materials: [supplierInput.category.trim()].filter(Boolean),
      logo: supplierInput.name.trim().slice(0, 1) || systemText.supplierInitial,
    };

    setSuppliers((current) => [...current, newSupplier]);
    showStatus(systemText.supplierAdded(newSupplier.name), "success");
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

  const handleSaveAnalysis = useCallback(
    ({ item, resources, results, params, mode }) => {
      console.log("Saving Analysis:", { item, resources, results, params, mode });
      if (authMode === "guest") {
        showStatus(systemText.loginRequiredToSave, "warning");
        return;
      }

      if (!selectedCompany || !selectedProject) {
        showStatus(systemText.chooseCompanyBeforeSave, "warning");
        return;
      }

      const nextAnalysis = {
        id: createId("analysis"),
        createdAt: new Date().toISOString(),
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        mode: mode, // 'area' or 'item'
        itemName: item.ar,
        itemNum: item.num,
        resources: resources,
        results: results,
        params: params,
        finalUnitPrice: results.unitPrice || results.finalTotal / (params.qty || 1),
        projectTotal: results.total || results.finalTotal,
      };

      setSavedAnalyses((current) => [nextAnalysis, ...current].slice(0, 50));
      showStatus(systemText.analysisSaved, "success");
    },
    [
      authMode,
      selectedCompany,
      selectedProject,
      setSavedAnalyses,
      systemText,
      showStatus,
    ]
  );

  const handleCreateRfq = useCallback(
    async ({ item, supplier, source }) => {
      if (authMode === "guest") {
        showStatus(systemText.loginRequiredForRfq, "warning");
        return;
      }

      const nextRequest = {
        id: createId("rfq"),
        createdAt: new Date().toISOString(),
        source,
        itemId: item?.id || item?.num || null,
        itemName: item?.name || item?.ar || systemText.genericRequest,
        supplierId: supplier?.id || null,
        supplierName: supplier?.name || systemText.market,
        companyId: selectedCompany?.id || null,
        companyName: selectedCompany?.name || "",
        projectId: selectedProject?.id || null,
        projectName: selectedProject?.name || "",
        status: "draft",
      };

      setRfqRequests((current) => [nextRequest, ...current].slice(0, 50));

      // Send email to admin
      await bridge.openEmail(
        "walidghazal46@gmail.com",
        systemText.rfqSubject(item?.name || item?.ar || systemText.supplyService),
        `${systemText.rfqGreeting("Admin", item?.name || item?.ar || supplier?.category)}\n\n` +
        `البيانات:\n` +
        `الشركة: ${selectedCompany?.name || "غير محدد"}\n` +
        `المشروع: ${selectedProject?.name || "غير محدد"}\n` +
        `البند: ${item?.name || item?.ar || "غير محدد"}\n` +
        `المورد: ${supplier?.name || "غير محدد"}\n` +
        `البريد الإلكتروني للمورد: ${supplier?.email || "غير متوفر"}\n` +
        `رقم المورد: ${supplier?.phone || "غير متوفر"}`
      );

      if (supplier?.email) {
        await bridge.openEmail(
          supplier.email,
          systemText.rfqSubject(item?.name || item?.ar || systemText.supplyService),
          systemText.rfqGreeting(supplier.contactPerson || supplier.name, item?.name || item?.ar || supplier.category)
        );
      } else {
        await bridge.shareText(
          systemText.rfqShareTitle,
          systemText.rfqShareBody(item?.name || item?.ar || systemText.genericRequest)
        );
      }

      showStatus(systemText.rfqCreated, "success");
    },
    [
      authMode,
      bridge,
      selectedCompany,
      selectedProject,
      setRfqRequests,
      systemText,
      showStatus,
    ]
  );

  const handleContactSupplier = useCallback(
    async (supplier, channel = "phone") => {
      if (channel === "phone" && supplier.phone) {
        bridge.openDialer(supplier.phone);
        showStatus(systemText.callOpened(supplier.name), "info");
        return;
      }

      if (channel === "email" && supplier.email) {
        bridge.openEmail(
          supplier.email,
          systemText.emailInquirySubject(settings.appName),
          systemText.emailInquiryBody(supplier.contactPerson || supplier.name, supplier.category)
        );
        showStatus(systemText.supplierEmailOpened(supplier.name), "info");
        return;
      }

      const shared = await bridge.shareText(
        supplier.name,
        `${supplier.name}\n${supplier.phone}\n${supplier.email}\n${supplier.location}`
      );

      showStatus(
        shared ? systemText.sharedSupplier : systemText.shareFailed,
        shared ? "success" : "warning"
      );
    },
    [bridge, settings.appName, showStatus, systemText]
  );

  const handleSettingsAction = useCallback(
    (actionId) => {
      switch (actionId) {
        case "privacy":
          openDialog({
            title: systemText.privacyTitle,
            lines: [
              settings.language === "en"
                ? "We store only the operational data needed for pricing, suppliers, and project continuity inside the app."
                : "يتم حفظ بيانات التشغيل الأساسية داخل التطبيق فقط لضمان استمرارية التسعير والمشاريع والموردين.",
              settings.language === "en"
                ? "Sensitive phone features are not accessed directly. Calls, email, and sharing are handed off to system apps."
                : "لا يتم الوصول المباشر إلى خصائص الهاتف الحساسة. الاتصال والبريد والمشاركة تتم عبر تطبيقات النظام.",
            ],
          });
          return;
        case "contact":
          bridge.openEmail(
            "walidghazal46@gmail.com",
            systemText.contactSubject(settings.appName),
            systemText.contactBody
          );
          showStatus(systemText.contactOpened, "info");
          return;
        case "support":
          bridge.openEmail(
            "walidghazal46@gmail.com",
            systemText.supportSubject(settings.appName),
            systemText.supportBody
          );
          showStatus(systemText.supportOpened, "info");
          return;
        case "update":
          openDialog({
            title: systemText.appStatus,
            lines: [
              `${systemText.platform}: ${bridge.platformInfo.platform}`,
              `${systemText.version}: ${bridge.platformInfo.appVersion || settings.appVersion}`,
              `${systemText.savedAnalyses}: ${savedAnalyses.length}`,
              `${systemText.rfqRequests}: ${rfqRequests.length}`,
            ],
            action: bridge.capabilities.canOpenSettings
              ? {
                  label: settings.language === "en" ? "Open App Settings" : "فتح إعدادات التطبيق",
                  onClick: () => {
                    bridge.openAppSettings();
                    closeDialog();
                  },
                }
              : null,
          });
          return;
        case "rate":
          bridge.rateApp();
          showStatus(systemText.appStoreOpened, "info");
          return;
        default:
      }
    },
    [
      bridge,
      closeDialog,
      openDialog,
      rfqRequests.length,
      savedAnalyses.length,
      settings.appName,
      settings.appVersion,
      settings.language,
      systemText,
      showStatus,
    ]
  );
  const navigationBridge = useMemo(
    () => ({
      registerBackHandler: registerPageBackHandler,
      pushHistoryEntry,
      onEntryChange: notifySubpageNavigation,
    }),
    [notifySubpageNavigation, pushHistoryEntry, registerPageBackHandler]
  );

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
    savedAnalyses,
    rfqRequests,
    systemBridge: bridge,
    navigationBridge,
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
    onUpdateSetting: updateSetting,
    onLogout: handleLogout,
    onShowStatus: showStatus,
    onSaveAnalysis: handleSaveAnalysis,
    onCreateRfq: handleCreateRfq,
    onContactSupplier: handleContactSupplier,
    onSettingsAction: handleSettingsAction,
    onOpenAuthScreen: openAuthScreen,
    sessionMeta: authSession,
  };

  const renderedPage = {
    companies: <CompaniesPage key={`companies-${pageResetVersion.companies}`} {...pageProps} />,
    pricing: <PricingPage key={`pricing-${pageResetVersion.pricing}`} {...pageProps} />,
    suppliers: <SuppliersPage key={`suppliers-${pageResetVersion.suppliers}`} {...pageProps} />,
    settings: <SettingsPage key={`settings-${pageResetVersion.settings}`} {...pageProps} />,
  }[activePage];

  return (
    <>
      <StatusToast status={status} />
      <InfoDialog dialog={dialog} onClose={closeDialog} />

      {shouldShowLogin ? (
        <>
          <LoginScreen
            onLogin={handleAuthEntry}
            onGuest={handleAuthEntry}
            language={settings.language}
            theme={settings.theme}
            initialMode={authScreenMode || "login"}
            onChangeLanguage={(language) =>
              setSettings((current) => ({ ...current, language }))
            }
          />
          {bridge.isAndroid && showExitPrompt ? (
            <Modal
              title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"}
              onClose={() => setShowExitPrompt(false)}
              hideCloseButton
            >
              <div className="grid gap-3 rounded-[16px] border border-red-200 bg-[radial-gradient(circle_at_top,#fff5f5_0%,#fff1f1_55%,#ffe4e6_100%)] p-1 text-right shadow-[0_0_24px_rgba(239,68,68,0.18)]">
                <p className="text-sm font-semibold text-red-700">
                  {settings.language === "en"
                    ? "Do you want to exit?"
                    : "هل تريد الخروج؟"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={confirmExit}
                    className="rounded-[12px] bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_100%)] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(220,38,38,0.24)]"
                  >
                    {settings.language === "en" ? "Yes, Exit" : "نعم، خروج"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitPrompt(false)}
                    className="rounded-[12px] border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600"
                  >
                    {settings.language === "en" ? "Cancel" : "إلغاء"}
                  </button>
                </div>
              </div>
            </Modal>
          ) : null}
        </>
      ) : (
        <>
          <AppShell
            activePage={activePage}
            onNavigate={handleNavigate}
            onBack={handleTopLevelBack}
            canGoBack={routeStack.length > 1 || activePage !== "companies"}
            scrollResetVersion={scrollResetVersion}
            selectedCompany={selectedCompany}
            selectedProject={selectedProject}
            authMode={authMode}
            navText={appText.nav}
            language={settings.language}
            theme={settings.theme}
          >
            {renderedPage}
          </AppShell>
          {bridge.isAndroid && showExitPrompt ? (
            <Modal
              title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"}
              onClose={() => setShowExitPrompt(false)}
              hideCloseButton
            >
              <div className="grid gap-3 rounded-[16px] border border-red-200 bg-[radial-gradient(circle_at_top,#fff5f5_0%,#fff1f1_55%,#ffe4e6_100%)] p-1 text-right shadow-[0_0_24px_rgba(239,68,68,0.18)]">
                <p className="text-sm font-semibold text-red-700">
                  {settings.language === "en"
                    ? "Do you want to exit?"
                    : "هل تريد الخروج؟"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={confirmExit}
                    className="rounded-[12px] bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_100%)] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(220,38,38,0.24)]"
                  >
                    {settings.language === "en" ? "Yes, Exit" : "نعم، خروج"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitPrompt(false)}
                    className="rounded-[12px] border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600"
                  >
                    {settings.language === "en" ? "Cancel" : "إلغاء"}
                  </button>
                </div>
              </div>
            </Modal>
          ) : null}
        </>
      )}
    </>
  );
}

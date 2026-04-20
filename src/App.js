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
    <Modal title={dialog.title} onClose={onClose}>
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
  const [showExitPrompt, setShowExitPrompt] = useState(false);
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

  const closeAuthScreen = useCallback(() => {
    if (!authMode && forcedScreen === "login") {
      return;
    }
    setAuthScreenMode(null);
  }, [authMode, forcedScreen]);

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

  useEffect(() => {
    window.history.replaceState({ source: "taseera-root" }, "");
    window.history.pushState({ source: "taseera-guard" }, "");

    const handlePopState = () => {
      if (allowExitRef.current) {
        allowExitRef.current = false;
        return;
      }

      if (pageBackHandlerRef.current?.()) {
        setShowExitPrompt(false);
        window.history.pushState({ source: "taseera-guard" }, "");
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
  }, [setActivePage, setAuthMode]);

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

  const pushRoute = useCallback((route) => {
    setRouteStack((current) => {
      const lastRoute = current[current.length - 1];

      if (lastRoute?.kind === route.kind && lastRoute?.page === route.page) {
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
      setShowExitPrompt(false);
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
      showStatus(
        mode === "guest" ? "تم الدخول بوضع الضيف." : "تم تسجيل الدخول بنجاح.",
        "success"
      );
    },
    [setActivePage, setAuthMode, setAuthSession, setSettings, settings.userEmail, settings.userName, showStatus]
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
    showStatus("تم تسجيل الخروج من الحساب.", "info");
  }, [setActivePage, setAuthMode, setAuthSession, showStatus]);

  const confirmExit = useCallback(() => {
    setShowExitPrompt(false);
    allowExitRef.current = true;
    if (bridge.isAndroid) {
      bridge.exitApp();
      return;
    }

    window.history.back();
  }, [bridge]);

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
      description: `شركة ${companyInput.type === "Consultant" ? "استشارية" : "تنفيذية"} متخصصة في ${companyInput.specialization.trim()}.`,
      rating: 4.4,
      projectsCount: 0,
      keyProjects: [],
      projects: [],
    };

    setCompanies((current) => [...current, newCompany]);
    setSelectedCompanyId(newCompany.id);
    setSelectedProjectId(null);
    showStatus(`تمت إضافة الشركة ${newCompany.name}.`, "success");
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
    showStatus(`تمت إضافة المشروع ${newProject.name}.`, "success");
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
      logo: supplierInput.name.trim().slice(0, 1) || "م",
    };

    setSuppliers((current) => [...current, newSupplier]);
    showStatus(`تمت إضافة المورد ${newSupplier.name}.`, "success");
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
    ({ item, result, quantity, profit }) => {
      if (authMode === "guest") {
        showStatus("يجب تسجيل الدخول لحفظ التحليل.", "warning");
        return;
      }

      if (!selectedCompany || !selectedProject) {
        showStatus("اختر شركة ومشروعًا قبل الحفظ.", "warning");
        return;
      }

      const nextAnalysis = {
        id: createId("analysis"),
        createdAt: new Date().toISOString(),
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        itemId: item.id,
        itemName: item.name,
        quantity: Number(quantity) || 0,
        profitPercent: Number(profit) || 0,
        finalUnitPrice: result.finalUnitPrice,
        projectTotal: result.projectTotal,
      };

      setSavedAnalyses((current) => [nextAnalysis, ...current].slice(0, 50));
      showStatus("تم حفظ التحليل وربطه بالمشروع الحالي.", "success");
    },
    [
      authMode,
      selectedCompany,
      selectedProject,
      setSavedAnalyses,
      showStatus,
    ]
  );

  const handleCreateRfq = useCallback(
    async ({ item, supplier, source }) => {
      if (authMode === "guest") {
        showStatus("تسجيل الدخول مطلوب لإنشاء طلب عرض سعر.", "warning");
        return;
      }

      const nextRequest = {
        id: createId("rfq"),
        createdAt: new Date().toISOString(),
        source,
        itemId: item?.id || null,
        itemName: item?.name || "طلب عام",
        supplierId: supplier?.id || null,
        supplierName: supplier?.name || "السوق",
        companyId: selectedCompany?.id || null,
        companyName: selectedCompany?.name || "",
        projectId: selectedProject?.id || null,
        projectName: selectedProject?.name || "",
        status: "draft",
      };

      setRfqRequests((current) => [nextRequest, ...current].slice(0, 50));

      if (supplier?.email) {
        bridge.openEmail(
          supplier.email,
          `طلب عرض سعر - ${item?.name || "خدمة توريد"}`,
          `مرحبًا ${supplier.contactPerson || supplier.name},%0D%0Aنرغب في استلام عرض سعر مبدئي للبند: ${
            item?.name || supplier.category
          }.`
        );
      } else {
        await bridge.shareText(
          "طلب عرض سعر",
          `تم إنشاء طلب عرض سعر جديد للبند ${item?.name || "عام"}`
        );
      }

      showStatus("تم إنشاء طلب عرض السعر وفتح قناة التواصل المناسبة.", "success");
    },
    [
      authMode,
      bridge,
      selectedCompany,
      selectedProject,
      setRfqRequests,
      showStatus,
    ]
  );

  const handleContactSupplier = useCallback(
    async (supplier, channel = "phone") => {
      if (channel === "phone" && supplier.phone) {
        bridge.openDialer(supplier.phone);
        showStatus(`تم فتح الاتصال مع ${supplier.name}.`, "info");
        return;
      }

      if (channel === "email" && supplier.email) {
        bridge.openEmail(
          supplier.email,
          `استفسار من تطبيق ${settings.appName}`,
          `مرحبًا ${supplier.contactPerson || supplier.name},%0D%0Aنرغب بالتواصل بخصوص ${supplier.category}.`
        );
        showStatus(`تم فتح البريد الإلكتروني للمورد ${supplier.name}.`, "info");
        return;
      }

      const shared = await bridge.shareText(
        supplier.name,
        `${supplier.name}\n${supplier.phone}\n${supplier.email}\n${supplier.location}`
      );

      showStatus(
        shared ? "تمت مشاركة بيانات المورد." : "تعذر مشاركة بيانات المورد من هذا الجهاز.",
        shared ? "success" : "warning"
      );
    },
    [bridge, settings.appName, showStatus]
  );

  const handleSettingsAction = useCallback(
    (actionId) => {
      switch (actionId) {
        case "privacy":
          openDialog({
            title: settings.language === "en" ? "Privacy Policy" : "سياسة الخصوصية",
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
            `تواصل من تطبيق ${settings.appName}`,
            "مرحبًا، لدي استفسار بخصوص التطبيق."
          );
          showStatus("تم فتح وسيلة التواصل عبر البريد الإلكتروني.", "info");
          return;
        case "support":
          bridge.openEmail(
            "walidghazal46@gmail.com",
            `دعم فني - ${settings.appName}`,
            "مرحبًا، أحتاج مساعدة فنية داخل التطبيق."
          );
          showStatus("تم فتح الدعم الفني عبر البريد الإلكتروني.", "info");
          return;
        case "update":
          openDialog({
            title: settings.language === "en" ? "Application Status" : "حالة التطبيق",
            lines: [
              `المنصة: ${bridge.platformInfo.platform}`,
              `الإصدار: ${bridge.platformInfo.appVersion || settings.appVersion}`,
              `التحليلات المحفوظة: ${savedAnalyses.length}`,
              `طلبات عروض الأسعار: ${rfqRequests.length}`,
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
          showStatus("تم فتح صفحة التقييم أو المتجر.", "info");
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
      showStatus,
    ]
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
    navigationBridge: {
      registerBackHandler: registerPageBackHandler,
      pushHistoryEntry,
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
    companies: <CompaniesPage {...pageProps} />,
    pricing: <PricingPage {...pageProps} />,
    suppliers: <SuppliersPage {...pageProps} />,
    settings: <SettingsPage {...pageProps} />,
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
          {showExitPrompt ? (
            <Modal title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"} onClose={() => setShowExitPrompt(false)}>
              <div className="grid gap-3 rounded-[16px] border border-red-200 bg-[radial-gradient(circle_at_top,#fff5f5_0%,#fff1f1_55%,#ffe4e6_100%)] p-1 text-right shadow-[0_0_24px_rgba(239,68,68,0.18)]">
                <p className="text-sm font-semibold text-red-700">
                  {settings.language === "en"
                    ? "Do you want to exit the app?"
                    : "هل تريد الخروج من التطبيق؟"}
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
                  {settings.language === "en"
                    ? "Do you want to exit the app?"
                    : "هل تريد الخروج من التطبيق؟"}
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
      )}
    </>
  );
}

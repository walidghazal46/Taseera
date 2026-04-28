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
  if (type === "Consultant") return "📐";
  if (specialization.includes("طرق") || specialization.includes("جسور")) return "🛣️";
  if (specialization.includes("كهرب")) return "⚡";
  if (specialization.includes("MEP") || specialization.includes("ميكانيك") || specialization.includes("كهروميكانيك")) return "🛠️";
  if (specialization.includes("مياه") || specialization.includes("تحلية")) return "💧";
  if (specialization.includes("خرسانة") || specialization.includes("إنشائي")) return "🏗️";
  if (specialization.includes("تشطيبات") || specialization.includes("معماري")) return "🧱";
  return "🏢";
}

function createRoute(authMode, page = "companies") {
  if (!authMode) return { kind: "login" };
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
        rfqGreeting: (contact, itemName) => `Hello ${contact},%0D%0AWe would like to receive an initial quotation for: ${itemName}.`,
        rfqShareTitle: "Request for quotation",
        rfqShareBody: (name) => `A new RFQ was created for ${name}.`,
        rfqCreated: "The RFQ was created and the proper contact channel was opened.",
        callOpened: (name) => `Calling ${name}.`,
        emailInquirySubject: (appName) => `Inquiry from ${appName}`,
        emailInquiryBody: (contact, category) => `Hello ${contact},%0D%0AWe would like to get in touch regarding ${category}.`,
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
        rfqGreeting: (contact, itemName) => `مرحبًا ${contact},%0D%0Aنرغب في استلام عرض سعر مبدئي للبند: ${itemName}.`,
        rfqShareTitle: "طلب عرض سعر",
        rfqShareBody: (name) => `تم إنشاء طلب عرض سعر جديد للبند ${name}.`,
        rfqCreated: "تم إنشاء طلب عرض السعر وفتح قناة التواصل المناسبة.",
        callOpened: (name) => `تم فتح الاتصال مع ${name}.`,
        emailInquirySubject: (appName) => `استفسار من تطبيق ${appName}`,
        emailInquiryBody: (contact, category) => `مرحبًا ${contact},%0D%0Aنرغب بالتواصل بخصوص ${category}.`,
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
  if (!status) return null;
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
  if (!dialog) return null;
  return (
    <Modal title={dialog.title} onClose={onClose} closeLabel={dialog.closeLabel || "Close"}>
      <div className="grid gap-3 text-right">
        {dialog.lines?.map((line) => (<p key={line} className="text-sm leading-6 text-slate-700">{line}</p>))}
        {dialog.action ? (
          <button type="button" onClick={dialog.action.onClick} className="rounded-[12px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-xs font-bold text-white">
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

  // Core States
  const [authMode, setAuthMode] = usePersistentState(`${APP_STORAGE_PREFIX}.authMode`, null);
  const [authSession, setAuthSession] = usePersistentState(`${APP_STORAGE_PREFIX}.authSession`, null);
  const [activePage, setActivePage] = usePersistentState(`${APP_STORAGE_PREFIX}.activePage`, "companies");
  const [settings, setSettings] = usePersistentState(`${APP_STORAGE_PREFIX}.settings`, sampleSettings);
  const [companies, setCompanies] = usePersistentState(`${APP_STORAGE_PREFIX}.companies`, sampleCompanies);
  const [suppliers, setSuppliers] = usePersistentState(`${APP_STORAGE_PREFIX}.suppliers`, sampleSuppliers);
  const [savedAnalyses, setSavedAnalyses] = usePersistentState(`${APP_STORAGE_PREFIX}.savedAnalyses`, []);
  const [rfqRequests, setRfqRequests] = usePersistentState(`${APP_STORAGE_PREFIX}.rfqRequests`, []);
  const [selectedCompanyId, setSelectedCompanyId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedCompanyId`, null);
  const [selectedProjectId, setSelectedProjectId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedProjectId`, null);
  const [selectedPricingItemId, setSelectedPricingItemId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedPricingItemId`, null);
  const [routeStack, setRouteStack] = usePersistentState(`${APP_STORAGE_PREFIX}.routeStack`, [createRoute(null)]);
  const [pageResetVersion, setPageResetVersion] = useState({ companies: 0, pricing: 0, suppliers: 0, settings: 0 });
  const [scrollResetVersion, setScrollResetVersion] = useState(0);

  // UI States
  const [status, setStatus] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [exitFromCompanies, setExitFromCompanies] = useState(false);
  const [authScreenMode, setAuthScreenMode] = useState(!authMode ? "login" : null);

  const routeStackRef = useRef(routeStack);
  const allowExitRef = useRef(false);
  const pageBackHandlerRef = useRef(() => false);
  const statusTimeoutRef = useRef(null);

  const appText = getAppText(settings.language);
  const systemText = getSystemText(settings.language);
  const shouldShowLogin = !authMode || authScreenMode !== null || forcedScreen === "login";

  const showStatus = useCallback((message, tone = "info") => {
    setStatus({ message, tone });
    bridge.showToast(message);
    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = window.setTimeout(() => setStatus(null), 3200);
  }, [bridge]);

  const openDialog = useCallback((nextDialog) => setDialog(nextDialog), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const openAuthScreen = useCallback((mode = "login") => setAuthScreenMode(mode), []);

  useEffect(() => { routeStackRef.current = routeStack; }, [routeStack]);

  useEffect(() => {
    return () => { if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current); };
  }, []);

  // Selection Sync
  useEffect(() => {
    const selectedCompanyExists = companies.some((c) => c.id === selectedCompanyId);
    if (!selectedCompanyExists) {
      const fallback = companies[0] || null;
      setSelectedCompanyId(fallback?.id || null);
      setSelectedProjectId(fallback?.projects?.[0]?.id || null);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId, setSelectedProjectId]);

  useEffect(() => {
    const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
    if (!selectedCompany) return;
    const projectExists = selectedCompany.projects.some((p) => p.id === selectedProjectId);
    if (!projectExists) setSelectedProjectId(selectedCompany.projects[0]?.id || null);
  }, [companies, selectedCompanyId, selectedProjectId, setSelectedProjectId]);

  // Navigation Logic
  const registerPageBackHandler = useCallback((handler) => {
    pageBackHandlerRef.current = handler;
    return () => { if (pageBackHandlerRef.current === handler) pageBackHandlerRef.current = () => false; };
  }, []);

  const pushHistoryEntry = useCallback(() => window.history.pushState({ source: "taseera-guard" }, ""), []);
  const notifySubpageNavigation = useCallback(() => setScrollResetVersion((c) => c + 1), []);

  const performBackNavigation = useCallback(() => {
    if (pageBackHandlerRef.current?.()) { setShowExitPrompt(false); return true; }
    const currentStack = routeStackRef.current;
    if (currentStack.length > 1) {
      const nextStack = currentStack.slice(0, -1);
      const prevRoute = nextStack[nextStack.length - 1];
      setRouteStack(nextStack);
      if (prevRoute.kind === "login") { setAuthMode(null); setActivePage("companies"); }
      else setActivePage(prevRoute.page);
      setShowExitPrompt(false); return true;
    }
    if (activePage !== "companies") {
      setActivePage("companies");
      setRouteStack([createRoute(authMode, "companies")]);
      setShowExitPrompt(false); return true;
    }
    if (bridge.isAndroid) {
      setExitFromCompanies(!!authMode);
      setShowExitPrompt(true);
    }
    return false;
  }, [activePage, authMode, bridge.isAndroid, setActivePage, setAuthMode, setRouteStack]);

  useEffect(() => {
    window.history.replaceState({ source: "taseera-root" }, "");
    window.history.pushState({ source: "taseera-guard" }, "");
    const handlePopState = () => {
      if (allowExitRef.current) { allowExitRef.current = false; return; }
      performBackNavigation();
      window.history.pushState({ source: "taseera-guard" }, "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [performBackNavigation]);

  const pushRoute = useCallback((route) => {
    setRouteStack((current) => {
      const last = current[current.length - 1];
      if (last?.kind === route.kind && last?.page === route.page) return current;
      if (route.kind === "app") {
        if (route.page === "companies") return [route];
        if (last?.kind === "app") return [last, route];
      }
      return [...current, route];
    });
    window.history.pushState({ source: "taseera-guard" }, "");
  }, [setRouteStack]);

  const handleNavigate = useCallback((page) => {
    setPageResetVersion((c) => ({ ...c, [page]: (c[page] || 0) + 1 }));
    setShowExitPrompt(false);
    if (page === activePage) {
      setRouteStack([createRoute(authMode, page)]);
      setScrollResetVersion((c) => c + 1);
      return;
    }
    setActivePage(page);
    pushRoute(createRoute(authMode, page));
  }, [activePage, authMode, pushRoute, setActivePage, setRouteStack]);

  const handleAuthEntry = useCallback((mode, payload = {}) => {
    pageBackHandlerRef.current = () => false;
    setAuthMode(mode);
    setAuthSession({
      mode,
      uid: payload.uid || null,
      userName: payload.userName || settings.userName,
      userEmail: payload.userEmail || settings.userEmail,
      lastLoginAt: new Date().toLocaleString("en-GB"),
    });
    setActivePage("companies");
    setShowExitPrompt(false);
    setAuthScreenMode(null);
    clearForcedScreenQuery();
    setRouteStack([createRoute(mode, "companies")]);
    setSettings((c) => ({ ...c, userName: payload.userName || c.userName, userEmail: payload.userEmail || c.userEmail }));
    window.history.pushState({ source: "taseera-guard" }, "");
    if (mode !== "guest") showStatus(settings.language === "en" ? "Signed in successfully." : "تم تسجيل الدخول بنجاح.", "success");
  }, [setActivePage, setAuthMode, setAuthSession, setRouteStack, setSettings, settings.language, settings.userName, settings.userEmail, showStatus]);

  const handleLogout = useCallback(() => {
    pageBackHandlerRef.current = () => false;
    setAuthMode(null);
    setAuthSession(null);
    setActivePage("companies");
    setShowExitPrompt(false);
    setAuthScreenMode("login");
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
    showStatus(settings.language === "en" ? "Signed out." : "تم تسجيل الخروج.", "info");
  }, [setActivePage, setAuthMode, setAuthSession, setRouteStack, settings.language, showStatus]);

  const openLoginScreen = useCallback(() => {
    setShowExitPrompt(false); setExitFromCompanies(false);
    pageBackHandlerRef.current = () => false;
    setAuthMode(null); setAuthSession(null);
    setActivePage("companies"); setAuthScreenMode("login");
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
  }, [setActivePage, setAuthMode, setAuthSession, setRouteStack]);

  const confirmExit = useCallback(() => {
    setShowExitPrompt(false);
    if (exitFromCompanies) openLoginScreen();
    else bridge.exitApp();
  }, [bridge, exitFromCompanies, openLoginScreen]);

  const handleTopLevelBack = useCallback(() => {
    if (!bridge.isAndroid) {
      if (activePage === "companies" && routeStackRef.current.length <= 1) { openLoginScreen(); return; }
      if (performBackNavigation()) pushHistoryEntry();
      return;
    }
    if (performBackNavigation()) pushHistoryEntry();
  }, [activePage, bridge.isAndroid, openLoginScreen, performBackNavigation, pushHistoryEntry]);

  // Data Helpers
  const selectedCompany = useMemo(() => companies.find((c) => c.id === selectedCompanyId) || null, [companies, selectedCompanyId]);
  const selectedProject = useMemo(() => {
    if (!selectedCompany) return null;
    return selectedCompany.projects.find((p) => p.id === selectedProjectId) || selectedCompany.projects[0] || null;
  }, [selectedCompany, selectedProjectId]);

  const selectCompany = (id) => { const c = companies.find((i) => i.id === id); setSelectedCompanyId(id); setSelectedProjectId(c?.projects[0]?.id || null); };
  const selectProject = (cid, pid) => { setSelectedCompanyId(cid); setSelectedProjectId(pid); };

  const addCompany = (input) => {
    const newC = {
      id: createId("comp"), name: input.name.trim(), type: input.type, country: input.country.trim(),
      logo: inferCompanyLogo(input.specialization, input.type), specialization: input.specialization.trim(),
      headquarters: (input.headquarters || "").split(/[،,]/).map(i => i.trim()).filter(Boolean),
      description: settings.language === "en" ? `Specialized in ${input.specialization}.` : `متخصصة في ${input.specialization}.`,
      rating: 4.4, projectsCount: 0, keyProjects: [], projects: [],
    };
    setCompanies((c) => [...c, newC]);
    setSelectedCompanyId(newC.id); setSelectedProjectId(null);
    showStatus(systemText.companyAdded(newC.name), "success");
  };

  const addProject = (cid, input) => {
    const newP = { id: createId("proj"), name: input.name.trim(), location: input.location.trim(), stage: input.stage.trim() || "Planning", budget: parseNumericInput(input.budget), pricingItems: [] };
    setCompanies((c) => c.map((i) => i.id === cid ? { ...i, projects: [...i.projects, newP], projectsCount: Math.max(i.projectsCount, i.projects.length + 1) } : i));
    setSelectedCompanyId(cid); setSelectedProjectId(newP.id); setActivePage("companies");
    showStatus(systemText.projectAdded(newP.name), "success");
  };

  const addSupplier = (input) => {
    const newS = { id: createId("sup"), name: input.name.trim(), category: input.category.trim(), phone: input.phone.trim(), email: input.email.trim(), contactPerson: input.contactPerson.trim(), location: input.location.trim(), rating: 4, materials: [input.category.trim()], logo: input.name.trim().slice(0, 1) || "S" };
    setSuppliers((c) => [...c, newS]);
    showStatus(systemText.supplierAdded(newS.name), "success");
  };

  const updateSetting = (f, v) => setSettings((c) => ({ ...c, [f]: ["overheadPercent", "profitPercent", "taxPercent", "locationFactor"].includes(f) ? parseNumericInput(v) : v }));

  const handleSaveAnalysis = useCallback(({ item, resources, results, params, mode }) => {
    if (authMode === "guest") { showStatus(systemText.loginRequiredToSave, "warning"); return; }
    if (!selectedCompany || !selectedProject) { showStatus(systemText.chooseCompanyBeforeSave, "warning"); return; }
    const nextA = { id: createId("analysis"), createdAt: new Date().toISOString(), companyId: selectedCompany.id, companyName: selectedCompany.name, projectId: selectedProject.id, projectName: selectedProject.name, mode, itemName: item.ar, itemNum: item.num, resources, results, params, finalUnitPrice: results.unitPrice || results.finalTotal / (params.qty || 1), projectTotal: results.total || results.finalTotal };
    setSavedAnalyses((c) => [nextA, ...c].slice(0, 50));
    showStatus(systemText.analysisSaved, "success");
  }, [authMode, selectedCompany, selectedProject, setSavedAnalyses, systemText, showStatus]);

  const handleCreateRfq = useCallback(async ({ item, supplier, source }) => {
    if (authMode === "guest") { showStatus(systemText.loginRequiredForRfq, "warning"); return; }
    const nextR = { id: createId("rfq"), createdAt: new Date().toISOString(), source, itemId: item?.num || null, itemName: item?.ar || systemText.genericRequest, supplierName: supplier?.name || systemText.market, status: "draft" };
    setRfqRequests((c) => [nextR, ...c].slice(0, 50));
    await bridge.openEmail("walidghazal46@gmail.com", systemText.rfqSubject(item?.ar || systemText.supplyService), `${systemText.rfqGreeting("Admin", item?.ar || supplier?.category)}\n\nالشركة: ${selectedCompany?.name}`);
    showStatus(systemText.rfqCreated, "success");
  }, [authMode, bridge, selectedCompany, setRfqRequests, systemText, showStatus]);

  const handleContactSupplier = useCallback(async (s, channel = "phone") => {
    if (channel === "phone" && s.phone) { bridge.openDialer(s.phone); showStatus(systemText.callOpened(s.name), "info"); }
    else if (channel === "email" && s.email) { bridge.openEmail(s.email, systemText.emailInquirySubject(settings.appName), systemText.emailInquiryBody(s.contactPerson || s.name, s.category)); showStatus(systemText.supplierEmailOpened(s.name), "info"); }
    else { const shared = await bridge.shareText(s.name, `${s.name}\n${s.phone}`); showStatus(shared ? systemText.sharedSupplier : systemText.shareFailed, shared ? "success" : "warning"); }
  }, [bridge, settings.appName, showStatus, systemText]);

  const handleSettingsAction = useCallback((id) => {
    if (id === "privacy") openDialog({ title: systemText.privacyTitle, lines: [settings.language === "en" ? "Data stored locally." : "البيانات محفوظة محلياً."] });
    else if (id === "contact") bridge.openEmail("walidghazal46@gmail.com", systemText.contactSubject(settings.appName), "Hello");
    else if (id === "update") openDialog({ title: systemText.appStatus, lines: [`Version: ${settings.appVersion}`, `Analyses: ${savedAnalyses.length}`] });
    else if (id === "rate") bridge.rateApp();
  }, [bridge, openDialog, savedAnalyses.length, settings.appName, settings.appVersion, settings.language, systemText]);

  const handleOpenSubscription = useCallback(() => {
    setActivePage("settings");
    setSettings((current) => ({ ...current, settingsPanelSection: "subscription" }));
    setRouteStack([createRoute(authMode, "settings")]);
  }, [authMode, setActivePage, setRouteStack, setSettings]);

  const handleOpenAdSettings = useCallback(() => {
    setActivePage("settings");
    setSettings((current) => ({
      ...current,
      settingsPanelSection: "account",
      adminDashboardTab: "settings",
    }));
    setRouteStack([createRoute(authMode, "settings")]);
  }, [authMode, setActivePage, setRouteStack, setSettings]);

  const navigationBridge = useMemo(() => ({ registerBackHandler: registerPageBackHandler, pushHistoryEntry, onEntryChange: notifySubpageNavigation }), [notifySubpageNavigation, pushHistoryEntry, registerPageBackHandler]);

  const pageProps = {
    authMode, companies, suppliers, settings, pricingCatalog, importedPricingSource, savedAnalyses, rfqRequests, systemBridge: bridge, navigationBridge,
    selectedPricingItemId, selectedCompanyId, selectedProjectId, company: selectedCompany, project: selectedProject,
    onSelectPricingItem: setSelectedPricingItemId, onSelectCompany: selectCompany, onSelectProject: selectProject, onAddCompany: addCompany, onAddProject: addProject, onAddSupplier: addSupplier, onUpdateSetting: updateSetting, onLogout: handleLogout, onShowStatus: showStatus, onSaveAnalysis: handleSaveAnalysis, onCreateRfq: handleCreateRfq, onContactSupplier: handleContactSupplier, onSettingsAction: handleSettingsAction, onOpenAuthScreen: openAuthScreen, sessionMeta: authSession,
    onOpenSubscription: handleOpenSubscription,
    onOpenAdSettings: handleOpenAdSettings,
  };

  const renderedPage = {
    companies: <CompaniesPage key={`comp-${pageResetVersion.companies}`} {...pageProps} />,
    pricing: <PricingPage key={`pric-${pageResetVersion.pricing}`} {...pageProps} />,
    suppliers: <SuppliersPage key={`supp-${pageResetVersion.suppliers}`} {...pageProps} />,
    settings: <SettingsPage key={`sett-${pageResetVersion.settings}`} {...pageProps} />,
  }[activePage];

  const ExitModal = () => (
    <Modal title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"} onClose={() => setShowExitPrompt(false)} hideCloseButton>
      <div className="grid gap-3 rounded-[16px] border border-red-200 bg-white p-4 text-right">
        <p className="text-sm font-semibold text-red-700">{settings.language === "en" ? "Do you want to exit?" : "هل تريد الخروج من التطبيق؟"}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={confirmExit} className="rounded-[12px] bg-red-600 px-3 py-2 text-xs font-bold text-white">نعم</button>
          <button onClick={() => setShowExitPrompt(false)} className="rounded-[12px] border border-slate-200 px-3 py-2 text-xs font-bold">إلغاء</button>
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <StatusToast status={status} />
      <InfoDialog dialog={dialog} onClose={closeDialog} />
      {shouldShowLogin ? (
        <>
          <LoginScreen onLogin={handleAuthEntry} onGuest={handleAuthEntry} language={settings.language} theme={settings.theme} initialMode={authScreenMode || "login"} onChangeLanguage={(l) => setSettings((c) => ({ ...c, language: l }))} />
          {showExitPrompt && <ExitModal />}
        </>
      ) : (
        <>
          <AppShell activePage={activePage} onNavigate={handleNavigate} onBack={handleTopLevelBack} canGoBack={routeStack.length > 1 || activePage !== "companies"} scrollResetVersion={scrollResetVersion} selectedCompany={selectedCompany} selectedProject={selectedProject} authMode={authMode} navText={appText.nav} language={settings.language} theme={settings.theme}>
            {renderedPage}
          </AppShell>
          {showExitPrompt && <ExitModal />}
        </>
      )}
    </>
  );
}

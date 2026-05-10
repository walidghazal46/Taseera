import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "./components/AppShell";
import LoginScreen from "./components/LoginScreen";
import MobilePrototypeDemo from "./components/MobilePrototypeDemo";
import Modal from "./components/Modal";
import useAndroidBridge from "./hooks/useAndroidBridge";
import usePersistentState from "./hooks/usePersistentState";
import {
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
const APP_VERSION = "1.0.0.27"; // always reflects current build — overrides localStorage

function makeSeedMergeKey(entry) {
  const name = String(entry?.name || "").trim().toLowerCase();
  const country = String(entry?.country || "").trim().toLowerCase();
  return `${name}::${country}`;
}

function mergeSeedData(currentItems, seedItems) {
  const safeCurrent = Array.isArray(currentItems) ? currentItems : [];
  const safeSeed = Array.isArray(seedItems) ? seedItems : [];
  const existingKeys = new Set(safeCurrent.map(makeSeedMergeKey));
  const missingSeeds = safeSeed.filter((item) => !existingKeys.has(makeSeedMergeKey(item)));
  return missingSeeds.length ? [...safeCurrent, ...missingSeeds] : safeCurrent;
}

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

function ensureGuestSessionId(previousSession = null) {
  if (previousSession?.guestId) return previousSession.guestId;
  if (typeof window === "undefined") return createId("guest");
  const storageKey = `${APP_STORAGE_PREFIX}.guestId`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const next = createId("guest");
  window.localStorage.setItem(storageKey, next);
  return next;
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
        loginRequiredToSave: "Analysis saved locally.",
        chooseCompanyBeforeSave: "Choose a company and project before saving.",
        analysisSaved: "The analysis was saved and linked to the current project.",
        loginRequiredForRfq: "RFQ access is open.",
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
        loginRequiredToSave: "تم حفظ التحليل محلياً.",
        chooseCompanyBeforeSave: "اختر شركة ومشروعًا قبل الحفظ.",
        analysisSaved: "تم حفظ التحليل وربطه بالمشروع الحالي.",
        loginRequiredForRfq: "طلب عرض السعر متاح للجميع.",
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
    <div className="fixed inset-x-0 z-[60] flex justify-center px-4" style={{ top: "calc(env(safe-area-inset-top) + 16px)" }}>
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

  // Disable browser automatic scroll restoration to ensure our manual resets work
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Core States
  const [authMode, setAuthMode] = usePersistentState(`${APP_STORAGE_PREFIX}.authMode`, null);
  const [authSession, setAuthSession] = usePersistentState(`${APP_STORAGE_PREFIX}.authSession`, null);
  const [activePage, setActivePage] = usePersistentState(`${APP_STORAGE_PREFIX}.activePage`, "pricing");
  const [settings, setSettings] = usePersistentState(`${APP_STORAGE_PREFIX}.settings`, sampleSettings);
  // Always inject current build version — never rely on localStorage value
  const settingsWithVersion = useMemo(() => ({ ...settings, appVersion: APP_VERSION }), [settings]);
  const [companies, setCompanies] = usePersistentState(`${APP_STORAGE_PREFIX}.companies`, sampleCompanies);
  const [suppliers, setSuppliers] = usePersistentState(`${APP_STORAGE_PREFIX}.suppliers`, sampleSuppliers);
  const [savedAnalyses, setSavedAnalyses] = usePersistentState(`${APP_STORAGE_PREFIX}.savedAnalyses`, []);
  const [rfqRequests] = usePersistentState(`${APP_STORAGE_PREFIX}.rfqRequests`, []);
  const [selectedCompanyId, setSelectedCompanyId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedCompanyId`, null);
  const [selectedProjectId, setSelectedProjectId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedProjectId`, null);
  const [selectedPricingItemId, setSelectedPricingItemId] = usePersistentState(`${APP_STORAGE_PREFIX}.selectedPricingItemId`, null);
  const [routeStack, setRouteStack] = usePersistentState(`${APP_STORAGE_PREFIX}.routeStack`, [createRoute(null)]);
  const [pageResetVersion, setPageResetVersion] = useState({ companies: 0, pricing: 0, suppliers: 0, settings: 0 });
  const [scrollResetVersion, setScrollResetVersion] = useState(0);
  const appShellRef = useRef(null);

  useEffect(() => {
    setCompanies((current) => mergeSeedData(current, sampleCompanies));
    setSuppliers((current) => mergeSeedData(current, sampleSuppliers));
  }, [setCompanies, setSuppliers]);

  const mergedCompanies = useMemo(() => mergeSeedData(companies, sampleCompanies), [companies]);
  const mergedSuppliers = useMemo(() => mergeSeedData(suppliers, sampleSuppliers), [suppliers]);

  // UI States
  const [status, setStatus] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [rfqModal, setRfqModal] = useState(null); // { itemName }
  const [exitFromCompanies, setExitFromCompanies] = useState(false);
  const [authScreenMode, setAuthScreenMode] = useState(!authMode ? "login" : null);

  const routeStackRef = useRef(routeStack);
  const allowExitRef = useRef(false);
  const pageBackHandlerRef = useRef(() => false);
  const statusTimeoutRef = useRef(null);

  const appText = useMemo(() => getAppText(settings.language), [settings.language]);
  const systemText = useMemo(() => getSystemText(settings.language), [settings.language]);
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
    const selectedCompanyExists = mergedCompanies.some((c) => c.id === selectedCompanyId);
    if (!selectedCompanyExists) {
      const fallback = mergedCompanies[0] || null;
      setSelectedCompanyId(fallback?.id || null);
      setSelectedProjectId(fallback?.projects?.[0]?.id || null);
    }
  }, [mergedCompanies, selectedCompanyId, setSelectedCompanyId, setSelectedProjectId]);

  useEffect(() => {
    const selectedCompany = mergedCompanies.find((c) => c.id === selectedCompanyId);
    if (!selectedCompany) return;
    const projectExists = selectedCompany.projects.some((p) => p.id === selectedProjectId);
    if (!projectExists) setSelectedProjectId(selectedCompany.projects[0]?.id || null);
  }, [mergedCompanies, selectedCompanyId, selectedProjectId, setSelectedProjectId]);

  // Navigation Logic
  const registerPageBackHandler = useCallback((handler) => {
    pageBackHandlerRef.current = handler;
    return () => { if (pageBackHandlerRef.current === handler) pageBackHandlerRef.current = () => false; };
  }, []);

  const pushHistoryEntry = useCallback(() => window.history.pushState({ source: "taseera-guard" }, ""), []);
  const notifySubpageNavigation = useCallback(() => {
    if (appShellRef.current) {
      appShellRef.current.scrollToTop();
    }
    setScrollResetVersion((c) => c + 1);
  }, []);

  const performBackNavigation = useCallback(() => {
    if (pageBackHandlerRef.current?.()) { setShowExitPrompt(false); return true; }
    const currentStack = routeStackRef.current;
    if (currentStack.length > 1) {
      const nextStack = currentStack.slice(0, -1);
      const prevRoute = nextStack[nextStack.length - 1];
      setRouteStack(nextStack);
      if (prevRoute.kind === "login") { setAuthMode(null); setActivePage("pricing"); }
      else setActivePage(prevRoute.page);
      setShowExitPrompt(false); return true;
    }
    if (activePage !== "pricing") {
      setActivePage("pricing");
      setRouteStack([createRoute(authMode, "pricing")]);
      setShowExitPrompt(false); return true;
    }
    if (shouldShowLogin) {
      if (bridge.isAndroid) {
        setExitFromCompanies(false);
        setShowExitPrompt(true);
      }
      return false;
    }
    setShowExitPrompt(true);
    return false;
  }, [activePage, authMode, bridge.isAndroid, setActivePage, setAuthMode, setRouteStack, shouldShowLogin]);

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
      // Linear history allowing multi-step back navigation
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
    const isGuestMode = mode === "guest";
    const guestId = isGuestMode ? ensureGuestSessionId(authSession) : null;
    setAuthMode(mode);
    setAuthSession({
      mode,
      uid: payload.uid || null,
      guestId,
      userName: isGuestMode ? (settings.language === "en" ? "Guest" : "زائر") : (payload.userName || settings.userName),
      userEmail: isGuestMode ? "" : (payload.userEmail || settings.userEmail),
      accountType: isGuestMode ? "guest" : "user",
      lastLoginAt: new Date().toLocaleString("en-GB"),
    });
    setActivePage("pricing");
    setShowExitPrompt(false);
    setAuthScreenMode(null);
    clearForcedScreenQuery();
    setRouteStack([createRoute(mode, "pricing")]);
    setSettings((c) => ({
      ...c,
      userName: isGuestMode ? c.userName : (payload.userName || c.userName),
      userEmail: isGuestMode ? c.userEmail : (payload.userEmail || c.userEmail),
    }));
    window.history.pushState({ source: "taseera-guard" }, "");
    // status notification removed
  }, [authSession, setActivePage, setAuthMode, setAuthSession, setRouteStack, setSettings, settings.language, settings.userName, settings.userEmail]);

  const handleLogout = useCallback(() => {
    pageBackHandlerRef.current = () => false;
    setAuthMode(null);
    setAuthSession(null);
    setActivePage("companies");
    setShowExitPrompt(false);
    setAuthScreenMode("login");
    setRouteStack([createRoute(null)]);
    window.history.pushState({ source: "taseera-guard" }, "");
    // status notification removed
  }, [setActivePage, setAuthMode, setAuthSession, setRouteStack]);

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
    if (performBackNavigation()) pushHistoryEntry();
  }, [performBackNavigation, pushHistoryEntry]);

  // Data Helpers
  const selectedCompany = useMemo(() => mergedCompanies.find((c) => c.id === selectedCompanyId) || null, [mergedCompanies, selectedCompanyId]);
  const selectedProject = useMemo(() => {
    if (!selectedCompany) return null;
    return selectedCompany.projects.find((p) => p.id === selectedProjectId) || selectedCompany.projects[0] || null;
  }, [selectedCompany, selectedProjectId]);

  const selectCompany = useCallback((id) => { const c = mergedCompanies.find((i) => i.id === id); setSelectedCompanyId(id); setSelectedProjectId(c?.projects[0]?.id || null); }, [mergedCompanies, setSelectedCompanyId, setSelectedProjectId]);
  const selectProject = useCallback((cid, pid) => { setSelectedCompanyId(cid); setSelectedProjectId(pid); }, [setSelectedCompanyId, setSelectedProjectId]);

  const addCompany = useCallback((input) => {
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
  }, [settings.language, setCompanies, setSelectedCompanyId, setSelectedProjectId, showStatus, systemText]);

  const addProject = useCallback((cid, input) => {
    const newP = { id: createId("proj"), name: input.name.trim(), location: input.location.trim(), stage: input.stage.trim() || "Planning", budget: parseNumericInput(input.budget), pricingItems: [] };
    setCompanies((c) => c.map((i) => i.id === cid ? { ...i, projects: [...i.projects, newP], projectsCount: Math.max(i.projectsCount, i.projects.length + 1) } : i));
    setSelectedCompanyId(cid); setSelectedProjectId(newP.id); setActivePage("companies");
    showStatus(systemText.projectAdded(newP.name), "success");
  }, [setCompanies, setSelectedCompanyId, setSelectedProjectId, setActivePage, showStatus, systemText]);

  const addSupplier = useCallback((input) => {
    const newS = { id: createId("sup"), name: input.name.trim(), category: input.category.trim(), phone: input.phone.trim(), email: input.email.trim(), contactPerson: input.contactPerson.trim(), location: input.location.trim(), rating: 4, materials: [input.category.trim()], logo: input.name.trim().slice(0, 1) || "S" };
    setSuppliers((c) => [...c, newS]);
    showStatus(systemText.supplierAdded(newS.name), "success");
  }, [setSuppliers, showStatus, systemText]);

  const updateSetting = useCallback((f, v) => setSettings((c) => ({ ...c, [f]: ["overheadPercent", "profitPercent", "taxPercent", "locationFactor"].includes(f) ? parseNumericInput(v) : v })), [setSettings]);

  const handleSaveAnalysis = useCallback(({ item, resources, results, params, mode }) => {
    const targetCompany = selectedCompany || mergedCompanies[0] || null;
    const targetProject = selectedProject || targetCompany?.projects?.[0] || null;
    if (!targetCompany || !targetProject) { showStatus(systemText.chooseCompanyBeforeSave, "warning"); return; }
    const nextA = { id: createId("analysis"), createdAt: new Date().toISOString(), companyId: targetCompany.id, companyName: targetCompany.name, projectId: targetProject.id, projectName: targetProject.name, mode, itemName: item.ar, itemNum: item.num, resources, results, params, finalUnitPrice: results.unitPrice || results.finalTotal / (params.qty || 1), projectTotal: results.total || results.finalTotal };
    setSavedAnalyses((c) => [nextA, ...c].slice(0, 50));
    showStatus(systemText.analysisSaved, "success");
  }, [mergedCompanies, selectedCompany, selectedProject, setSavedAnalyses, systemText, showStatus]);

  const handleCreateRfq = useCallback(({ item, supplier, source }) => {
    setRfqModal({ itemName: item?.ar || supplier?.name || "طلب عرض سعر" });
  }, [setRfqModal]);

  const handleContactSupplier = useCallback(async (s, channel = "phone") => {
    if (channel === "phone" && s.phone) { bridge.openDialer(s.phone); showStatus(systemText.callOpened(s.name), "info"); }
    else if (channel === "email" && s.email) { bridge.openEmail(s.email, systemText.emailInquirySubject(settings.appName), systemText.emailInquiryBody(s.contactPerson || s.name, s.category)); showStatus(systemText.supplierEmailOpened(s.name), "info"); }
    else { const shared = await bridge.shareText(s.name, `${s.name}\n${s.phone}`); showStatus(shared ? systemText.sharedSupplier : systemText.shareFailed, shared ? "success" : "warning"); }
  }, [bridge, settings.appName, showStatus, systemText]);

  const handleSettingsAction = useCallback((id) => {
    if (id === "onEntryChange") notifySubpageNavigation();
    else if (id === "privacy") openDialog({ title: systemText.privacyTitle, lines: [settings.language === "en" ? "Data stored locally." : "البيانات محفوظة محلياً."] });
    else if (id === "contact") bridge.openEmail("walidghazal46@gmail.com", systemText.contactSubject(settings.appName), "Hello");
    else if (id === "update") bridge.openExternalUrl("https://play.google.com/store/apps/details?id=com.taseera.app");
    else if (id === "rate") bridge.rateApp();
  }, [bridge, notifySubpageNavigation, openDialog, settings.appName, settings.language, systemText]);

  const handleOpenAdSettings = useCallback(() => {
    setActivePage("settings");
    setSettings((current) => ({
      ...current,
      settingsPanelSection: "account",
    }));
    setRouteStack([createRoute(authMode, "settings")]);
  }, [authMode, setActivePage, setRouteStack, setSettings]);

  const navigationBridge = useMemo(() => ({ registerBackHandler: registerPageBackHandler, pushHistoryEntry, onEntryChange: notifySubpageNavigation }), [notifySubpageNavigation, pushHistoryEntry, registerPageBackHandler]);

  const pageProps = useMemo(() => ({
    authMode,
    companies: mergedCompanies,
    suppliers: mergedSuppliers,
    settings: settingsWithVersion,
    pricingCatalog,
    importedPricingSource,
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
    onOpenAdSettings: handleOpenAdSettings,
    onNavigate: handleNavigate,
  }), [
    authMode, mergedCompanies, mergedSuppliers, settingsWithVersion, savedAnalyses, rfqRequests, bridge, navigationBridge,
    selectedPricingItemId, selectedCompanyId, selectedProjectId, selectedCompany, selectedProject,
    setSelectedPricingItemId, selectCompany, selectProject, addCompany, addProject, addSupplier, updateSetting,
    handleLogout, showStatus, handleSaveAnalysis, handleCreateRfq, handleContactSupplier, handleSettingsAction,
    openAuthScreen, authSession, handleOpenAdSettings, handleNavigate
  ]);

  const renderedPage = {
    companies: <CompaniesPage key={`comp-${pageResetVersion.companies}`} {...pageProps} isActive={activePage === "companies"} />,
    pricing: <PricingPage key={`pric-${pageResetVersion.pricing}`} {...pageProps} isActive={activePage === "pricing"} />,
    suppliers: <SuppliersPage key={`supp-${pageResetVersion.suppliers}`} {...pageProps} isActive={activePage === "suppliers"} />,
    settings: <SettingsPage key={`sett-${pageResetVersion.settings}`} {...pageProps} isActive={activePage === "settings"} />,
  }[activePage];

  const ExitModal = () => (
    <Modal title={settings.language === "en" ? "Confirm Exit" : "تأكيد الخروج"} onClose={() => setShowExitPrompt(false)} hideCloseButton>
      <div className="grid gap-3 rounded-[16px] border border-red-200 bg-white p-4 text-right">
        <p className="text-sm font-semibold text-red-700">{settings.language === "en" ? "Do you want to exit?" : "هل تريد الخروج من التطبيق؟"}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={confirmExit} className="rounded-[12px] bg-red-600 px-3 py-2 text-xs font-bold text-white">{settings.language === "en" ? "Yes" : "نعم"}</button>
          <button onClick={() => setShowExitPrompt(false)} className="rounded-[12px] border border-slate-200 px-3 py-2 text-xs font-bold">{settings.language === "en" ? "Cancel" : "إلغاء"}</button>
        </div>
      </div>
    </Modal>
  );

  // ── Simple RFQ contact modal ──────────────────────────────────────────────
  function RfqContactModal() {
    if (!rfqModal) return null;
    return (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        onClick={() => setRfqModal(null)}
      >
        <div
          style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", direction: "rtl", fontFamily: "'Cairo','Tajawal',sans-serif" }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ width: 40, height: 4, background: "#e2d8c4", borderRadius: 4, margin: "0 auto 20px" }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9a8a6a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>TASEERA</p>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#082555", margin: "0 0 6px" }}>{settings.language === "en" ? "Request for Quotation" : "طلب عرض سعر"}</h2>
          {rfqModal.itemName && <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>{rfqModal.itemName}</p>}
          <p style={{ fontSize: 14, color: "#374151", margin: "0 0 12px", lineHeight: 1.7 }}>
            {settings.language === "en" ? "To communicate and send the quotation request, please contact us at the following email:" : "للتواصل وإرسال طلب العرض، يُرجى مراسلتنا على البريد الإلكتروني التالي:"}
          </p>
          <div style={{ background: "#f7f3ec", borderRadius: 16, padding: "14px 16px", textAlign: "center", border: "1px solid #e2d8c4", marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: "#082555", direction: "ltr", margin: 0 }}>walidghazal46@gmail.com</p>
          </div>
          <button
            onClick={() => setRfqModal(null)}
            style={{ width: "100%", background: "#082555", color: "#c9a84c", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 16, padding: "14px 0", cursor: "pointer", fontFamily: "inherit" }}
          >
            {settings.language === "en" ? "OK" : "حسنًا"}
          </button>
        </div>
      </div>
    );
  }

  if (forcedScreen === "mobile-demo") {
    return <MobilePrototypeDemo />;
  }

  return (
    <>
      <StatusToast status={status} />
      <InfoDialog dialog={dialog} onClose={closeDialog} />
      <RfqContactModal />
      {shouldShowLogin ? (
        <>
          <LoginScreen onLogin={handleAuthEntry} onGuest={handleAuthEntry} language={settings.language} theme={settings.theme} initialMode={authScreenMode || "login"} onChangeLanguage={(l) => setSettings((c) => ({ ...c, language: l }))} />
          {showExitPrompt && <ExitModal />}
        </>
      ) : (
        <>
          <AppShell ref={appShellRef} activePage={activePage} onNavigate={handleNavigate} onBack={handleTopLevelBack} canGoBack={routeStack.length > 1 || activePage !== "pricing"} scrollResetVersion={scrollResetVersion} selectedCompany={selectedCompany} selectedProject={selectedProject} authMode={authMode} navText={appText.nav} language={settings.language} theme={settings.theme}>
            {renderedPage}
          </AppShell>
          {showExitPrompt && <ExitModal />}
        </>
      )}
    </>
  );
}

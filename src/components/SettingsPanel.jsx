import { APP_LANGUAGES, getAppText } from "../data/appText";
import { GlobeIcon, LogOutIcon, ShieldIcon, UserIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";

function getSettingsCopy(language) {
  return language === "en"
    ? {
        permissionEnabled: "Enabled", permissionDisabled: "Disabled",
        permissionNotRequired: "Not required", permissionUnavailable: "Unavailable",
        requestPermission: "Request", openSettings: "Open settings",
        pricingEnvironment: "Current pricing environment", pricingActive: "Active",
        profitSummary: "Profit", pricingCountryTitle: "Country & pricing settings",
        country: "Country", city: "City", currency: "Currency",
        locationFactor: "Location factor", pricingRatios: "Pricing ratios",
        profitPercent: "Profit %", overheadPercent: "Overhead %", taxPercent: "Tax %",
        phonePermissions: "Phone permissions", androidConnected: "Android connected",
        webPreview: "Web / preview mode", androidSummaryPrefix: "Package",
        androidVersion: "Version", webSummary: "Preview mode — full permissions appear in the Android app.",
        dataState: "Data status", savedAnalyses: "Saved analyses", rfqs: "RFQ requests",
        pricingTab: "Pricing", accountTab: "Account",
      }
    : {
        permissionEnabled: "مفعلة", permissionDisabled: "غير مفعلة",
        permissionNotRequired: "غير مطلوبة", permissionUnavailable: "غير متاحة",
        requestPermission: "طلب الإذن", openSettings: "فتح الإعدادات",
        pricingEnvironment: "بيئة التسعير الحالية", pricingActive: "نشطة",
        profitSummary: "ربح", pricingCountryTitle: "إعدادات الدولة والتسعير",
        country: "الدولة", city: "المدينة", currency: "العملة",
        locationFactor: "عامل الموقع", pricingRatios: "نسب التسعير",
        profitPercent: "الربح %", overheadPercent: "المصاريف %", taxPercent: "الضريبة %",
        phonePermissions: "صلاحيات الهاتف", androidConnected: "بيئة Android متصلة",
        webPreview: "وضع الويب / المعاينة", androidSummaryPrefix: "الحزمة",
        androidVersion: "الإصدار", webSummary: "معاينة الواجهة — الصلاحيات الكاملة من تطبيق Android.",
        dataState: "حالة البيانات", savedAnalyses: "تحليلات محفوظة", rfqs: "طلبات عروض سعر",
        pricingTab: "التسعير", accountTab: "الحساب",
      };
}

function SettingInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }} />
    </label>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f0e4cc] text-sm">
          {icon}
        </span>
        <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionRow({ title, subtitle, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-[#f0e8d8] bg-[#faf6ef] px-3 py-2.5 text-right transition hover:bg-[#f5ede0] active:scale-[0.98]">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{title}</p>
        {subtitle && <p className="mt-0.5 text-[9px] text-slate-400 leading-relaxed" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{subtitle}</p>}
      </div>
      <span className="shrink-0 text-[#d4a843] font-bold mr-2">›</span>
    </button>
  );
}

function LangToggle({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl px-4 py-2 text-[11px] font-bold transition ${
        active ? "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white shadow-sm" : "border border-[#e8dcc8] bg-white text-slate-600"
      }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      {children}
    </button>
  );
}

function PricingTab({ settings, onUpdateSetting, copy }) {
  return (
    <div className="space-y-3">
      {/* Status banner */}
      <div className="rounded-2xl border border-[#d4a843]/30 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.pricingEnvironment}
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {settings.country} — {settings.currency} — {copy.profitSummary} {settings.profitPercent}%
            </p>
          </div>
          <span className="rounded-full bg-[#d4a843]/20 px-3 py-1 text-[9px] font-bold text-[#b8893d]"
            style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {copy.pricingActive}
          </span>
        </div>
      </div>

      <SectionCard title={copy.pricingCountryTitle} icon="⚙️">
        <div className="grid grid-cols-2 gap-3">
          <SettingInput label={copy.country} value={settings.country} onChange={(v) => onUpdateSetting("country", v)} placeholder="السعودية" />
          <SettingInput label={copy.city} value={settings.city} onChange={(v) => onUpdateSetting("city", v)} placeholder="الرياض" />
          <SettingInput label={copy.currency} value={settings.currency} onChange={(v) => onUpdateSetting("currency", v)} placeholder="SAR" />
          <SettingInput label={copy.locationFactor} type="number" value={settings.locationFactor} onChange={(v) => onUpdateSetting("locationFactor", v)} placeholder="1" />
        </div>
      </SectionCard>

      <SectionCard title={copy.pricingRatios} icon="📈">
        <div className="grid grid-cols-3 gap-3">
          <SettingInput label={copy.profitPercent} type="number" value={settings.profitPercent} onChange={(v) => onUpdateSetting("profitPercent", v)} placeholder="15" />
          <SettingInput label={copy.overheadPercent} type="number" value={settings.overheadPercent} onChange={(v) => onUpdateSetting("overheadPercent", v)} placeholder="6" />
          <SettingInput label={copy.taxPercent} type="number" value={settings.taxPercent} onChange={(v) => onUpdateSetting("taxPercent", v)} placeholder="15" />
        </div>
      </SectionCard>
    </div>
  );
}

function AccountTab({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, onOpenAuthScreen, sessionMeta,
}) {
  const text = getAppText(settings.language);
  const copy = getSettingsCopy(settings.language);
  const isGuest = authMode === "guest";
  const isPrimaryAdmin = !isGuest && settings.userEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL;

  const guestItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody },
    { id: "contact", title: text.settings.contact, subtitle: text.settings.contactValue },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue },
  ];

  const authItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody },
    { id: "contact", title: text.settings.contact, subtitle: text.settings.contactValue },
    { id: "update", title: text.settings.update, subtitle: text.settings.updateStatus },
    { id: "rate", title: text.settings.rate, subtitle: text.settings.rateBody },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue },
  ];

  return (
    <div className="space-y-3">
      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              {isGuest ? "👤" : "👤"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {isGuest ? text.settings.guest : settings.userName}
              </p>
              <p className="mt-0.5 text-[10px] text-white/50" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {isGuest ? text.settings.browseMode : settings.userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Session status */}
        <div className="border-t border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[9px] text-[#d4a843] font-bold mb-1" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {text.settings.sessionStatus}
          </p>
          <p className="text-[10px] text-white/70" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {isGuest ? text.settings.guestSession : `${text.settings.signedInAs} ${settings.userName}`}
          </p>
          {!isGuest && sessionMeta?.lastLoginAt && (
            <p className="mt-0.5 text-[9px] text-white/40" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {text.settings.signedInAt}: {sessionMeta.lastLoginAt}
            </p>
          )}
        </div>

        {/* Auth actions */}
        <div className="flex gap-2 px-4 pb-4 pt-2">
          {isGuest ? (
            <>
              <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                className="flex-1 rounded-xl bg-[#d4a843] py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.loginNow}
              </button>
              <button type="button" onClick={() => onOpenAuthScreen?.("register")}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.createAccountNow}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.switchAccount}
              </button>
              <button type="button" onClick={onLogout}
                className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-[10px] font-bold text-red-300"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.logout}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Language */}
      <SectionCard title={text.settings.languageSwitch} icon="🌐">
        <div className="flex gap-2">
          <LangToggle active={settings.language === "ar"} onClick={() => onUpdateSetting("language", "ar")}>
            العربية
          </LangToggle>
          <LangToggle active={settings.language === "en"} onClick={() => onUpdateSetting("language", "en")}>
            English
          </LangToggle>
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title={copy.dataState} icon="📊">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] py-3 text-center">
            <p className="text-[20px] font-bold text-[#0d2545]">{savedAnalyses.length}</p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.savedAnalyses}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] py-3 text-center">
            <p className="text-[20px] font-bold text-[#0d2545]">{rfqRequests.length}</p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.rfqs}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Action items */}
      <div className="space-y-2">
        {(isGuest ? guestItems : authItems).map((item) => (
          <ActionRow key={item.id} title={item.title} subtitle={item.subtitle}
            onClick={() => onSettingsAction?.(item.id)} />
        ))}
      </div>

      {/* Admin panel */}
      {isPrimaryAdmin && (
        <SectionCard title={text.settings.adminTitle} icon="🛡️">
          <div className="space-y-2">
            <div className="rounded-xl bg-[#faf6ef] px-3 py-2">
              <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.adminPrimary}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500">{settings.userEmail}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[text.settings.manageCompanies, text.settings.managePricing, text.settings.manageSuppliers].map((label) => (
                <div key={label} className="rounded-xl border border-[#e8dcc8] bg-white py-2 text-center text-[9px] font-bold text-slate-600"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* App info */}
      <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] px-4 py-3 text-center">
        <p className="text-[12px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {settings.appName}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {text.settings.version} {settings.appVersion}
        </p>
        <p className="mt-1.5 text-[9px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {text.settings.disclaimer}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPanel({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, navigationBridge,
  onOpenAuthScreen, sessionMeta,
}) {
  const copy = getSettingsCopy(settings.language);
  const text = getAppText(settings.language);
  const nav = useBackStack({
    initialEntry: { section: "pricing" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeView = nav.currentEntry.section;

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="flex gap-1 rounded-xl bg-white/10 p-1">
          {[{ id: "pricing", label: copy.pricingTab }, { id: "account", label: copy.accountTab }].map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => nav.navigate({ section: tab.id })}
              className={`flex-1 rounded-[10px] px-2 py-2 text-[10px] font-bold transition-all ${
                activeView === tab.id ? "bg-[#d4a843] text-white shadow-[0_2px_8px_rgba(212,168,67,0.35)]" : "text-white/70"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "pricing" ? (
        <PricingTab settings={settings} onUpdateSetting={onUpdateSetting} copy={copy} />
      ) : (
        <AccountTab
          settings={settings} authMode={authMode} onLogout={onLogout}
          onUpdateSetting={onUpdateSetting} onSettingsAction={onSettingsAction}
          systemBridge={systemBridge} savedAnalyses={savedAnalyses}
          rfqRequests={rfqRequests} onOpenAuthScreen={onOpenAuthScreen}
          sessionMeta={sessionMeta}
        />
      )}
    </div>
  );
}

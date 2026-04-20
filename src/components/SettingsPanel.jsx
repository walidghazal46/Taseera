import { APP_LANGUAGES, getAppText } from "../data/appText";
import useBackStack from "../hooks/useBackStack";

const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";

function getSettingsPanelCopy(language) {
  return language === "en"
    ? {
        permissionEnabled: "Enabled",
        permissionDisabled: "Not enabled",
        permissionNotRequired: "Not required",
        permissionUnavailable: "Unavailable",
        requestPermission: "Request permission",
        openSettings: "Open settings",
        pricingEnvironment: "Current pricing environment",
        pricingActive: "Active",
        profitSummary: "Profit",
        pricingCountryTitle: "Country and pricing settings",
        country: "Country",
        city: "City",
        currency: "Currency",
        locationFactor: "Location factor",
        pricingRatios: "Pricing ratios",
        profitPercent: "Profit %",
        overheadPercent: "Overhead %",
        taxPercent: "Tax %",
        phonePermissions: "Phone permissions and integration",
        androidConnected: "Android environment connected",
        webPreview: "Web / preview mode",
        androidSummaryPrefix: "Package",
        androidVersion: "Version",
        webSummary:
          "The UI can be previewed here, while full system permissions appear and are requested from the Android app.",
        dataState: "Data status",
        savedAnalyses: "Saved analyses",
        rfqs: "RFQ requests",
        pricingTab: "Pricing",
        accountTab: "Account",
        close: "Close",
      }
    : {
        permissionEnabled: "مفعلة",
        permissionDisabled: "غير مفعلة",
        permissionNotRequired: "غير مطلوبة",
        permissionUnavailable: "غير متاحة",
        requestPermission: "طلب الإذن",
        openSettings: "فتح الإعدادات",
        pricingEnvironment: "بيئة التسعير الحالية",
        pricingActive: "نشطة",
        profitSummary: "ربح",
        pricingCountryTitle: "إعدادات الدولة والتسعير",
        country: "الدولة",
        city: "المدينة",
        currency: "العملة",
        locationFactor: "عامل الموقع",
        pricingRatios: "نسب التسعير",
        profitPercent: "الربح %",
        overheadPercent: "المصاريف %",
        taxPercent: "الضريبة %",
        phonePermissions: "صلاحيات الهاتف والتكامل",
        androidConnected: "بيئة Android متصلة",
        webPreview: "وضع الويب / المعاينة",
        androidSummaryPrefix: "الحزمة",
        androidVersion: "الإصدار",
        webSummary:
          "يمكن معاينة الواجهة هنا، بينما صلاحيات النظام الكاملة تظهر وتُطلب من داخل تطبيق Android.",
        dataState: "حالة البيانات",
        savedAnalyses: "تحليلات محفوظة",
        rfqs: "طلبات عروض سعر",
        pricingTab: "التسعير",
        accountTab: "الحساب",
        close: "إغلاق",
      };
}

function ToneToggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] border px-2 py-0.5 text-[8px] font-bold transition min-[390px]:text-[9px] ${
        active
          ? "border-[#b8893d] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
          : "border-[#eadfca] bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

function SwitchPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[28px] flex-1 items-center justify-center rounded-[8px] px-2 py-1.5 text-[8px] font-bold leading-4 transition min-[390px]:text-[9px] ${
        active
          ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
          : "bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="rounded-[14px] border border-[#eadfca] bg-white px-3 py-2 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f6efe4] text-[10px] text-[#b8893d]">
          {icon}
        </span>
        <p className="text-[10px] font-bold text-slate-900 min-[390px]:text-[11px]">{title}</p>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function UtilityButton({ title, subtitle, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-1.5 text-right transition ${
        active
          ? "border-[#d8c295] bg-[#fff8ec]"
          : "border-[#f0e6d5] bg-[#fffdfa] hover:bg-[#fbf6ed]"
      }`}
    >
      <div>
        <p className="text-[10px] font-bold text-slate-900 min-[390px]:text-[11px]">{title}</p>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-500 min-[390px]:text-[9px]">{subtitle}</p>
      </div>
      <span className="text-[#b8893d]">‹</span>
    </button>
  );
}

function PermissionBadge({ permission, onRequest, onOpenSettings, copy }) {
  const toneClass =
    permission.status === "granted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : permission.status === "denied"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className={`rounded-[12px] border px-3 py-2 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold min-[390px]:text-[11px]">{permission.label}</p>
          <p className="mt-0.5 text-[8px] leading-4 min-[390px]:text-[9px]">{permission.description}</p>
        </div>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[8px] font-bold min-[390px]:text-[9px]">
          {permission.status === "granted"
            ? copy.permissionEnabled
            : permission.status === "denied"
              ? copy.permissionDisabled
              : permission.status === "not_required"
                ? copy.permissionNotRequired
                : copy.permissionUnavailable}
        </span>
      </div>
      {permission.available && permission.status !== "granted" ? (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onRequest}
            className="rounded-[10px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-1.5 text-[8px] font-bold text-white min-[390px]:text-[9px]"
          >
            {copy.requestPermission}
          </button>
          {permission.status === "denied" ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="rounded-[10px] border border-[#d8b16c] bg-white px-3 py-1.5 text-[8px] font-bold text-[#b8893d] min-[390px]:text-[9px]"
            >
              {copy.openSettings}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SettingField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-[10px] border border-[#eadfca] bg-white px-2.5 py-1.5 text-[10px] text-slate-900 outline-none"
      />
    </label>
  );
}

function PricingSettingsPanel({ settings, onUpdateSetting, copy }) {
  return (
    <div className="grid gap-1.5">
      <div className="rounded-[14px] border border-[#eadfca] bg-[#fff8ec] px-3 py-2 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-slate-900">{copy.pricingEnvironment}</p>
            <p className="mt-0.5 text-[9px] text-slate-500">
              {settings.country} - {settings.currency} - {copy.profitSummary} {settings.profitPercent}%
            </p>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[#b8893d]">
            {copy.pricingActive}
          </span>
        </div>
      </div>

      <SectionCard title={copy.pricingCountryTitle} icon="⚙️">
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <SettingField
            label={copy.country}
            value={settings.country}
            onChange={(value) => onUpdateSetting("country", value)}
            placeholder="السعودية"
          />
          <SettingField
            label={copy.city}
            value={settings.city}
            onChange={(value) => onUpdateSetting("city", value)}
            placeholder="الرياض"
          />
          <SettingField
            label={copy.currency}
            value={settings.currency}
            onChange={(value) => onUpdateSetting("currency", value)}
            placeholder="SAR"
          />
          <SettingField
            label={copy.locationFactor}
            type="number"
            value={settings.locationFactor}
            onChange={(value) => onUpdateSetting("locationFactor", value)}
            placeholder="1"
          />
        </div>
      </SectionCard>

      <SectionCard title={copy.pricingRatios} icon="📈">
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
          <SettingField
            label={copy.profitPercent}
            type="number"
            value={settings.profitPercent}
            onChange={(value) => onUpdateSetting("profitPercent", value)}
            placeholder="15"
          />
          <SettingField
            label={copy.overheadPercent}
            type="number"
            value={settings.overheadPercent}
            onChange={(value) => onUpdateSetting("overheadPercent", value)}
            placeholder="6"
          />
          <SettingField
            label={copy.taxPercent}
            type="number"
            value={settings.taxPercent}
            onChange={(value) => onUpdateSetting("taxPercent", value)}
            placeholder="15"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function AccountPanel({
  settings,
  authMode,
  onLogout,
  onUpdateSetting,
  onSettingsAction,
  systemBridge,
  savedAnalyses,
  rfqRequests,
  onOpenAuthScreen,
  sessionMeta,
}) {
  const text = getAppText(settings.language);
  const copy = getSettingsPanelCopy(settings.language);
  const isGuest = authMode === "guest";
  const isPrimaryAdmin =
    authMode !== "guest" && settings.userEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL;

  const guestItems = [
    {
      id: "privacy",
      title: text.settings.privacy,
      subtitle: text.settings.privacyBody,
    },
    {
      id: "contact",
      title: text.settings.contact,
      subtitle: text.settings.contactValue,
    },
    {
      id: "support",
      title: text.settings.technicalSupport,
      subtitle: text.settings.supportValue,
    },
  ];

  const utilityItems = [
    {
      id: "language",
      title: text.settings.languageSwitch,
      subtitle:
        settings.language === "en" ? APP_LANGUAGES.en : APP_LANGUAGES.ar,
    },
    {
      id: "privacy",
      title: text.settings.privacy,
      subtitle: text.settings.privacyBody,
    },
    {
      id: "contact",
      title: text.settings.contact,
      subtitle: text.settings.contactValue,
    },
    {
      id: "update",
      title: text.settings.update,
      subtitle: text.settings.updateStatus,
    },
    {
      id: "rate",
      title: text.settings.rate,
      subtitle: text.settings.rateBody,
    },
    {
      id: "support",
      title: text.settings.technicalSupport,
      subtitle: text.settings.supportValue,
    },
  ];

  return (
    <div className="grid gap-1.5">
      <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,#182e56_0%,#10213e_100%)] px-3 py-1 text-white shadow-[0_12px_22px_rgba(9,18,42,0.15)]">
        <div className="flex items-center gap-1.5">
          <div className="grid h-4.5 w-4.5 place-items-center rounded-full border border-white/10 bg-white/20 text-[9px]">
            👤
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[10px] font-bold leading-4">
              {isGuest ? text.settings.guest : settings.userName}
            </h3>
            <p className="text-[8px] leading-3 text-slate-200">
              {isGuest ? text.settings.browseMode : settings.userEmail}
            </p>
          </div>
        </div>
      </div>

      <SectionCard title={text.settings.languageSwitch} icon="🌐">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex items-center gap-1">
            <ToneToggle active={settings.language === "ar"} onClick={() => onUpdateSetting("language", "ar")}>
              العربية
            </ToneToggle>
            <ToneToggle
              active={settings.language === "en"}
              onClick={() => onUpdateSetting("language", "en")}
            >
              English
            </ToneToggle>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={text.settings.sessionStatus} icon="🔐">
        <div className="grid gap-2">
          <div className="rounded-[12px] border border-[#f0e6d5] bg-[#fff8ec] px-3 py-2">
            <p className="text-[11px] font-bold text-slate-900">
              {isGuest ? text.settings.guestSession : `${text.settings.signedInAs} ${settings.userName}`}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              {isGuest
                ? text.settings.guestSessionBody
                : `${settings.userEmail} ${sessionMeta?.lastLoginAt ? `- ${text.settings.signedInAt} ${sessionMeta.lastLoginAt}` : ""}`}
            </p>
          </div>

          {isGuest ? (
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              <button
                type="button"
                onClick={() => onOpenAuthScreen?.("login")}
                className="rounded-[12px] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] px-3 py-2 text-[10px] font-bold text-white"
              >
                {text.settings.loginNow}
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthScreen?.("register")}
                className="rounded-[12px] border border-[#d8b16c] bg-white px-3 py-2 text-[10px] font-bold text-[#b8893d]"
              >
                {text.settings.createAccountNow}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              <button
                type="button"
                onClick={() => onOpenAuthScreen?.("login")}
                className="rounded-[12px] border border-[#d8b16c] bg-white px-3 py-2 text-[10px] font-bold text-[#b8893d]"
              >
                {text.settings.switchAccount}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-[12px] border border-red-200 bg-white px-3 py-2 text-[10px] font-bold text-red-600"
              >
                {text.settings.logout}
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-1">
        {(isGuest ? guestItems : utilityItems).map((item) => (
          <UtilityButton
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            active={false}
            onClick={() => onSettingsAction?.(item.id)}
          />
        ))}
      </div>

      <SectionCard title={copy.phonePermissions} icon="📱">
        <div className="grid gap-2">
          {Object.values(systemBridge.permissions || {}).map((permission) => (
            <PermissionBadge
              key={permission.key}
              permission={permission}
              copy={copy}
              onRequest={() => systemBridge.requestNotificationsPermission?.()}
              onOpenSettings={() => systemBridge.openAppSettings?.()}
            />
          ))}
          <div className="rounded-[12px] border border-[#f0e6d5] bg-[#fffdfa] px-3 py-2 text-[9px] leading-4 text-slate-600">
            <p className="font-bold text-slate-900">
              {systemBridge.isAndroid ? copy.androidConnected : copy.webPreview}
            </p>
            <p className="mt-1">
              {systemBridge.isAndroid
                ? `${copy.androidSummaryPrefix}: ${systemBridge.platformInfo.packageName} - ${copy.androidVersion}: ${systemBridge.platformInfo.appVersion}`
                : copy.webSummary}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={copy.dataState} icon="📊">
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <div className="rounded-[12px] border border-[#f0e6d5] bg-white px-3 py-2 text-center">
            <p className="text-[9px] text-slate-500">{copy.savedAnalyses}</p>
            <p className="mt-1 text-[12px] font-bold text-slate-900">{savedAnalyses.length}</p>
          </div>
          <div className="rounded-[12px] border border-[#f0e6d5] bg-white px-3 py-2 text-center">
            <p className="text-[9px] text-slate-500">{copy.rfqs}</p>
            <p className="mt-1 text-[12px] font-bold text-slate-900">{rfqRequests.length}</p>
          </div>
        </div>
      </SectionCard>

      {isPrimaryAdmin ? (
        <SectionCard title={text.settings.adminTitle} icon="🛡️">
          <div className="grid gap-2">
            <div className="rounded-[12px] border border-[#f0e6d5] bg-[#fff8ec] px-3 py-1.5">
              <p className="text-[11px] font-bold text-slate-900">{text.settings.adminPrimary}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{settings.userEmail}</p>
            </div>
            <div className="grid grid-cols-1 gap-1 min-[380px]:grid-cols-3">
              <div className="rounded-[10px] border border-[#f0e6d5] bg-white px-2 py-1.5 text-center text-[9px] font-bold text-slate-700">
                {text.settings.manageCompanies}
              </div>
              <div className="rounded-[10px] border border-[#f0e6d5] bg-white px-2 py-1.5 text-center text-[9px] font-bold text-slate-700">
                {text.settings.managePricing}
              </div>
              <div className="rounded-[10px] border border-[#f0e6d5] bg-white px-2 py-1.5 text-center text-[9px] font-bold text-slate-700">
                {text.settings.manageSuppliers}
              </div>
            </div>
            <div className="rounded-[12px] border border-dashed border-[#d8c295] bg-[#fffdfa] px-3 py-1.5">
              <p className="text-[10px] font-bold text-slate-700">{text.settings.futureAdmins}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{text.settings.pendingAdminNote}</p>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <div className="rounded-[16px] border border-[#eadfca] bg-[#fff8ec] px-3 py-1.5 text-[9px] leading-5 text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900">{settings.appName}</p>
            <p className="mt-0.5 text-[10px]">
              {text.settings.version} {settings.appVersion}
            </p>
          </div>
        </div>
        <p className="mt-2">{text.settings.disclaimer}</p>
      </div>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  authMode,
  onLogout,
  onUpdateSetting,
  onSettingsAction,
  systemBridge,
  savedAnalyses,
  rfqRequests,
  navigationBridge,
  onOpenAuthScreen,
  sessionMeta,
}) {
  const copy = getSettingsPanelCopy(settings.language);
  const settingsNavigation = useBackStack({
    initialEntry: { section: "pricing" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
  });
  const activeView = settingsNavigation.currentEntry.section;

  return (
    <div className="grid gap-2">
      {authMode !== "guest" ? (
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-[14px] border border-red-200 bg-white px-3 py-2 text-[11px] font-bold text-red-600 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
        >
          {getAppText(settings.language).settings.logout}
        </button>
      ) : null}

      <div className="w-full self-start rounded-[10px] bg-[#f7f1e6] p-[2px] shadow-[0_6px_14px_rgba(15,23,42,0.04)]">
        <div className="flex gap-1">
          <SwitchPill
            active={activeView === "pricing"}
            onClick={() => settingsNavigation.navigate({ section: "pricing" })}
          >
            {copy.pricingTab}
          </SwitchPill>
          <SwitchPill
            active={activeView === "account"}
            onClick={() => settingsNavigation.navigate({ section: "account" })}
          >
            {copy.accountTab}
          </SwitchPill>
        </div>
      </div>

      {activeView === "pricing" ? (
        <PricingSettingsPanel settings={settings} onUpdateSetting={onUpdateSetting} copy={copy} />
      ) : (
        <AccountPanel
          settings={settings}
          authMode={authMode}
          onLogout={onLogout}
          onUpdateSetting={onUpdateSetting}
          onSettingsAction={onSettingsAction}
          systemBridge={systemBridge}
          savedAnalyses={savedAnalyses}
          rfqRequests={rfqRequests}
          onOpenAuthScreen={onOpenAuthScreen}
          sessionMeta={sessionMeta}
        />
      )}
    </div>
  );
}

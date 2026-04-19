import { APP_LANGUAGES, getAppText } from "../data/appText";

const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";

function ToneToggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] border px-2 py-0.5 text-[9px] font-bold transition ${
        active
          ? "border-[#b8893d] bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white"
          : "border-[#eadfca] bg-white text-slate-600"
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
        <p className="text-[11px] font-bold text-slate-900">{title}</p>
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
        <p className="text-[11px] font-bold text-slate-900">{title}</p>
            <p className="mt-0.5 text-[9px] leading-4 text-slate-500">{subtitle}</p>
      </div>
      <span className="text-[#b8893d]">‹</span>
    </button>
  );
}

function AccountPanel({ settings, authMode, onLogout, onUpdateSetting }) {
  const text = getAppText(settings.language);
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
      <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,#182e56_0%,#10213e_100%)] px-3 py-1 text-white shadow-[0_14px_26px_rgba(9,18,42,0.18)]">
        <div className="flex items-center gap-1.5">
          <div className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/20 text-[11px]">
            👤
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[11px] font-bold leading-4">
              {isGuest ? text.settings.guest : settings.userName}
            </h3>
            <p className="mt-0.5 text-[8px] text-slate-200">
              {isGuest ? text.settings.browseMode : settings.userEmail}
            </p>
          </div>
        </div>
      </div>

      <SectionCard title={text.settings.languageSwitch} icon="🌐">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex items-center gap-1">
            <ToneToggle
              active={settings.language === "ar"}
              onClick={() => onUpdateSetting("language", "ar")}
            >
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

      <div className="grid gap-1">
        {(isGuest ? guestItems : utilityItems).map((item) => (
          <UtilityButton
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            active={false}
            onClick={() => {}}
          />
        ))}
      </div>

      {isPrimaryAdmin ? (
        <SectionCard title={text.settings.adminTitle} icon="🛡️">
          <div className="grid gap-2">
            <div className="rounded-[12px] border border-[#f0e6d5] bg-[#fff8ec] px-3 py-1.5">
              <p className="text-[11px] font-bold text-slate-900">{text.settings.adminPrimary}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{settings.userEmail}</p>
            </div>
            <div className="grid grid-cols-3 gap-1">
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

      {!isGuest ? (
        <button
          type="button"
          onClick={onLogout}
          className="rounded-[14px] border border-red-200 bg-white px-3 py-1.5 text-[10px] font-bold text-red-600 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
        >
          {text.settings.logout}
        </button>
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
}) {
  return (
    <div className="grid gap-2">
      <AccountPanel
        settings={settings}
        authMode={authMode}
        onLogout={onLogout}
        onUpdateSetting={onUpdateSetting}
      />
    </div>
  );
}

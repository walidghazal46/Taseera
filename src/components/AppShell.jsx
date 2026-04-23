import {
  BuildingsIcon,
  PricingIcon,
  SettingsIcon,
  SuppliersIcon,
} from "./icons";

const navItems = [
  { id: "companies", label: "الشركات", labelEn: "Companies", icon: BuildingsIcon },
  { id: "pricing", label: "التسعير", labelEn: "Pricing", icon: PricingIcon },
  { id: "suppliers", label: "الموردين", labelEn: "Suppliers", icon: SuppliersIcon },
  { id: "settings", label: "الإعدادات", labelEn: "Settings", icon: SettingsIcon },
];

export default function AppShell({
  activePage,
  onNavigate,
  children,
  navText,
  language = "ar",
  theme = "dark",
}) {
  const isRtl = language !== "en";
  const isLight = theme === "light";

  const localizedItems = navItems.map((item) => ({
    ...item,
    label: navText?.[item.id] || (language === "en" ? item.labelEn : item.label),
  }));

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`fixed inset-0 flex flex-col overflow-hidden ${
        isLight
          ? "bg-[#f5efe4]"
          : "bg-[#0c1829]"
      }`}
    >
      {/* Top Brand Bar */}
      <div
        className={`shrink-0 flex items-center justify-between px-4 py-2.5 ${
          isLight
            ? "bg-[#0d2545]"
            : "bg-[#0a1e3d]"
        }`}
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4a843]">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M10 2L3 7v11h14V7L10 2Z" fill="white" fillOpacity="0.9" />
              <path d="M7 18v-6h6v6" fill="#d4a843" />
              <path d="M10 2L3 7v11h14V7L10 2Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#d4a843] leading-none">
              TASEERA
            </p>
            <p className="mt-0.5 text-[8px] font-medium text-white/50 leading-none tracking-wide">
              Construction Pricing Intelligence
            </p>
          </div>
        </div>

        {/* Active page indicator */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
          <span className="text-[9px] font-semibold text-white/60 uppercase tracking-wider">
            {localizedItems.find(i => i.id === activePage)?.label}
          </span>
        </div>
      </div>

      {/* Thin gold accent line */}
      <div className="h-[2px] shrink-0 bg-gradient-to-r from-transparent via-[#d4a843]/40 to-transparent" />

      {/* Main content */}
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          isLight
            ? "bg-gradient-to-b from-[#faf5eb] to-[#f5eedf]"
            : "bg-gradient-to-b from-[#f8f3ea] to-[#f2ead8]"
        }`}
        style={{ paddingBottom: "5.5rem" }}
      >
        <div className="mx-auto w-full max-w-lg px-3 py-3">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className={`shrink-0 border-t ${
          isLight
            ? "border-[#e8dcc8] bg-white"
            : "border-[#1e3050] bg-[#0e1f3a]"
        }`}
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div className="mx-auto flex w-full max-w-lg items-stretch">
          {localizedItems.map((item) => {
            const isActive = item.id === activePage;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 transition-all duration-200 ${
                  isActive ? "" : "opacity-50 hover:opacity-75"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-[#d4a843]" />
                )}

                {/* Icon container */}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#d4a843] text-white shadow-[0_4px_12px_rgba(212,168,67,0.4)]"
                      : isLight
                        ? "text-slate-500"
                        : "text-[#8899bb]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                {/* Label */}
                <span
                  className={`text-center text-[9px] font-semibold leading-none ${
                    isActive
                      ? "text-[#d4a843]"
                      : isLight
                        ? "text-slate-400"
                        : "text-[#566a8a]"
                  }`}
                  style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

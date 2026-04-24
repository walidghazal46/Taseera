import {
  BuildingsIcon,
  PricingIcon,
  SettingsIcon,
  SuppliersIcon,
} from "./icons";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";

const navItems = [
  { id: "companies", label: "الشركات", labelEn: "Companies", icon: BuildingsIcon },
  { id: "pricing", label: "التسعير", labelEn: "Pricing", icon: PricingIcon },
  { id: "suppliers", label: "الموردين", labelEn: "Suppliers", icon: SuppliersIcon },
  { id: "settings", label: "الإعدادات", labelEn: "Settings", icon: SettingsIcon },
];

export default function AppShell({
  activePage,
  onNavigate,
  onBack,
  canGoBack = false,
  children,
  navText,
  language = "ar",
  theme = "dark",
}) {
  const isRtl = language !== "en";

  const localizedItems = navItems.map((item) => ({
    ...item,
    label: navText?.[item.id] || (language === "en" ? item.labelEn : item.label),
  }));

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 flex flex-col overflow-hidden bg-[#F7F3EC]"
    >
      {/* Top Brand Bar */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-4 bg-[#082555] shadow-xl relative z-20"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all ${
              canGoBack ? "opacity-100 hover:bg-white/10" : "opacity-65 hover:opacity-90"
            }`}
            aria-label={language === "en" ? "Go back" : "رجوع"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path d={isRtl ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Logo mark */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C] shadow-lg shadow-[#C9A84C]/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#082555]">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-[0.2em] text-[#C9A84C] leading-none" style={{ fontFamily: MONO }}>
              TASEERA
            </p>
            <p className="mt-1.5 text-[9px] font-bold text-[#9A8A6A] leading-none tracking-widest uppercase" style={{ fontFamily: AR }}>
              Pricing Intelligence
            </p>
          </div>
        </div>

        {/* Active page indicator */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest" style={{ fontFamily: AR }}>
            {localizedItems.find(i => i.id === activePage)?.label}
          </span>
        </div>
      </div>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F3EC]"
        style={{ paddingBottom: "7rem" }}
      >
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 border-t-2 border-[#E2D8C4] bg-[#082555]"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-stretch px-2">
          {localizedItems.map((item) => {
            const isActive = item.id === activePage;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-1 flex-col items-center justify-center gap-2.5 px-1 pt-4 pb-2 transition-all duration-300 ${
                  isActive ? "" : "opacity-40 hover:opacity-80"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-b-full bg-[#C9A84C] shadow-[0_4px_12px_rgba(201,168,76,0.6)]" />
                )}

                {/* Icon container */}
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-[#C9A84C] text-[#082555] shadow-[0_8px_20px_rgba(201,168,76,0.4)] scale-110"
                      : "text-white/60"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                {/* Label */}
                <span
                  className={`text-center text-[10px] font-bold leading-none uppercase tracking-wider ${
                    isActive
                      ? "text-[#C9A84C]"
                      : "text-white/40"
                  }`}
                  style={{ fontFamily: AR }}
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

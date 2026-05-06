import { useEffect, useRef } from "react";
import {
  BuildingsIcon,
  PricingIcon,
  SettingsIcon,
  SuppliersIcon,
} from "./icons";
import taseeraLogo from "../assets/taseera-logo.png";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

const navItems = [
  { id: "pricing", label: "التسعير", labelEn: "Pricing", icon: PricingIcon },
  { id: "companies", label: "الشركات", labelEn: "Companies", icon: BuildingsIcon },
  { id: "suppliers", label: "الموردين", labelEn: "Suppliers", icon: SuppliersIcon },
  { id: "settings", label: "الإعدادات", labelEn: "Settings", icon: SettingsIcon },
];

const tabConfig = {
  pricing: {
    activeText: "text-[#38bdf8]",
    activeBg: "bg-[#38bdf8]/10",
    activeBorder: "border-[#38bdf8]/40",
    activeGlow: "shadow-[0_0_15px_rgba(56,189,248,0.3)]",
    indicator: "bg-[#38bdf8]",
  },
  companies: {
    activeText: "text-[#34d399]",
    activeBg: "bg-[#34d399]/10",
    activeBorder: "border-[#34d399]/40",
    activeGlow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]",
    indicator: "bg-[#34d399]",
  },
  suppliers: {
    activeText: "text-[#a78bfa]",
    activeBg: "bg-[#a78bfa]/10",
    activeBorder: "border-[#a78bfa]/40",
    activeGlow: "shadow-[0_0_15px_rgba(167,139,250,0.3)]",
    indicator: "bg-[#a78bfa]",
  },
  settings: {
    activeText: "text-[#d4a843]",
    activeBg: "bg-[#d4a843]/10",
    activeBorder: "border-[#d4a843]/40",
    activeGlow: "shadow-[0_0_15px_rgba(212,168,67,0.3)]",
    indicator: "bg-[#d4a843]",
  },
};

export default function AppShell({
  activePage,
  onNavigate,
  onBack,
  canGoBack = false,
  scrollResetVersion = 0,
  children,
  navText,
  language = "ar",
  theme = "dark",
}) {
  const isRtl = language !== "en";
  const mainRef = useRef(null);

  const localizedItems = navItems.map((item) => ({
    ...item,
    label: navText?.[item.id] || (language === "en" ? item.labelEn : item.label),
  }));

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activePage]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [scrollResetVersion]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 flex flex-col overflow-hidden bg-[#F7F3EC]"
    >
      {/* Top Brand Bar */}
      <div
        className="relative z-20 flex shrink-0 items-center justify-between bg-[#082555] px-3 pb-3 shadow-xl sm:px-5 sm:py-4"
        style={{ paddingTop: "max(1.5rem, calc(env(safe-area-inset-top) + 1rem))" }}
      >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
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
          <div className="px-0 py-0">
            <img
              src={taseeraLogo}
              alt="Taseera"
              className="h-9 w-auto max-w-[140px] rounded-2xl object-contain sm:h-10 sm:max-w-[160px]"
            />
          </div>
          <div className="hidden min-[430px]:block">
            <p
              className="text-[16px] font-extrabold leading-none text-white"
              style={{ fontFamily: AR }}
            >
              Taseera - تسعيرة
            </p>
          </div>
        </div>

        {/* Active page indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 min-[380px]:flex">
          <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest" style={{ fontFamily: AR }}>
            {localizedItems.find(i => i.id === activePage)?.label}
          </span>
        </div>
      </div>

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F3EC] flex flex-col"
      >
        <div className="mx-auto w-full max-w-2xl px-4 py-4 flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 border-t border-white/5 bg-[#07193a]"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center justify-around px-2 py-2">
          {localizedItems.map((item) => {
            const isActive = item.id === activePage;
            const config = tabConfig[item.id] || tabConfig.pricing;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative group flex min-w-0 flex-1 flex-col items-center justify-center transition-all duration-300 py-1.5`}
              >
                {/* Active Highlight Panel */}
                <div
                  className={`absolute inset-x-1.5 inset-y-0 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? `${config.activeBg} ${config.activeBorder} ${config.activeGlow} scale-100 opacity-100`
                      : "border-transparent scale-95 opacity-0"
                  }`}
                />

                {/* Icon */}
                <span
                  className={`relative flex h-8 w-8 items-center justify-center transition-all duration-300 ${
                    isActive ? config.activeText : "text-slate-500/80 group-hover:text-slate-400"
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>

                {/* Label */}
                <span
                  className={`relative mt-1 text-center font-bold tracking-wide transition-all duration-300 ${
                    isActive ? config.activeText : "text-slate-500/80 group-hover:text-slate-400"
                  }`}
                  style={{ fontFamily: AR, fontSize: isActive ? "10.5px" : "10px" }}
                >
                  {item.label}
                </span>

                {/* Bottom Indicator */}
                <div
                   className={`absolute -bottom-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-t-full transition-all duration-300 ${
                     isActive ? config.indicator : "bg-transparent scale-x-0"
                   }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

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
        className="relative z-20 flex shrink-0 items-center justify-between bg-[#082555] px-3 py-3 shadow-xl sm:px-5 sm:py-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
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
        className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F3EC]"
        style={{ paddingBottom: "calc(12rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-16">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 border-t-2 border-[#E2D8C4] bg-[#082555]"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-stretch px-1 sm:px-2">
          {localizedItems.map((item) => {
            const isActive = item.id === activePage;
            const Icon = item.icon;
            const iconSize = isActive ? 22 : 20;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-1 transition-all duration-300 sm:gap-2 sm:px-1 sm:pt-3 sm:pb-1.5 ${
                  isActive ? "" : "opacity-40 hover:opacity-80"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-b-full bg-[#C9A84C] shadow-[0_4px_12px_rgba(201,168,76,0.6)] sm:w-12" />
                )}

                {/* Icon container */}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${
                    isActive
                      ? "bg-[#C9A84C] text-[#082555] shadow-[0_8px_20px_rgba(201,168,76,0.4)]"
                      : "text-white/60"
                  }`}
                  style={isActive ? { width: "44px", height: "44px" } : undefined}
                >
                  <Icon style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                </span>

                {/* Label */}
                <span
                  className={`text-center font-bold leading-none uppercase tracking-wide ${
                    isActive
                      ? "text-[#C9A84C]"
                      : "text-white/40"
                  }`}
                  style={{ fontFamily: AR, fontSize: isActive ? "10px" : "9px" }}
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

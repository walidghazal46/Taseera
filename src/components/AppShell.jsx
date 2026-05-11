import { useEffect, useRef } from "react";
import {
  BuildingsIcon,
  PricingIcon,
  SettingsIcon,
  SuppliersIcon,
} from "./icons";
import taseeraLogo from "../assets/taseera-logo-light.png";

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
  unreadCount = 0,
  onOpenNotifications,
}) {
  const isRtl = language !== "en";
  const mainRef = useRef(null);

  const localizedItems = navItems.map((item) => ({
    ...item,
    label: navText?.[item.id] || (language === "en" ? item.labelEn : item.label),
  }));

  const scrollMainToTop = () => {
    const el = mainRef.current;
    if (!el) return;
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    el.scrollTop = 0;
  };

  useEffect(() => {
    scrollMainToTop();
  }, [activePage]);

  useEffect(() => {
    scrollMainToTop();
  }, [scrollResetVersion]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(108,224,245,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(181,141,255,0.14),transparent_26%),linear-gradient(180deg,#fbfcff_0%,#f5f7ff_48%,#f9fbff_100%)]"
    >
      {/* Top Brand Bar */}
      <div
        className="app-header-safe relative z-20 mx-3 flex min-h-[44px] shrink-0 items-center justify-between rounded-[18px] border border-white/70 bg-white/72 px-3 py-0 shadow-[0_8px_24px_rgba(104,128,223,0.1)] backdrop-blur-xl sm:mx-5 sm:px-5 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`flex h-7 w-7 items-center justify-center rounded-xl border border-[#d7dfff] bg-white/85 text-[#6c78ad] transition-all ${
              canGoBack ? "opacity-100 hover:border-[#88c9ff] hover:text-[#3a7fff]" : "opacity-65 hover:opacity-90"
            }`}
            aria-label={language === "en" ? "Go back" : "رجوع"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
              <path d={isRtl ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="px-0 py-0">
            <img
              src={taseeraLogo}
              alt="Taseera"
              className="h-6 w-auto max-w-[82px] rounded-xl object-contain sm:h-7 sm:max-w-[96px]"
            />
          </div>
          <div className="hidden min-[430px]:block">
            <p
              className="bg-[linear-gradient(90deg,#625cff_0%,#2c8fff_50%,#35dadd_100%)] bg-clip-text text-[16px] font-extrabold leading-none text-transparent"
              style={{ fontFamily: AR }}
            >
              Taseera - تسعيرة
            </p>
          </div>
        </div>

        {/* Bell icon + Active page indicator */}
        <div className="flex items-center gap-2">
        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ff] bg-white/85 text-[#6c78ad] transition-all hover:border-[#88c9ff] hover:text-[#3a7fff]"
            aria-label={language === "en" ? "Notifications" : "الإشعارات"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}
        <div className="hidden h-7 items-center gap-1.5 rounded-full border border-[#dfe6ff] bg-white/85 px-2.5 py-0 min-[380px]:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#6e66ff_0%,#36dddf_100%)] animate-pulse" />
          <span className="bg-[linear-gradient(90deg,#665fff_0%,#2990ff_52%,#39dddf_100%)] bg-clip-text text-[9px] font-bold uppercase tracking-widest text-transparent" style={{ fontFamily: AR }}>
            {localizedItems.find(i => i.id === activePage)?.label}
          </span>
        </div>
        </div>
      </div>

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-transparent"
      >
        <div className="app-content-safe mx-auto flex w-[90%] sm:w-full max-w-2xl lg:max-w-6xl flex-1 flex-col py-4 lg:py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="app-footer-safe mx-3 shrink-0 rounded-[24px] border border-white/70 bg-white/78 backdrop-blur-xl sm:mx-5 lg:mx-auto lg:w-full lg:max-w-6xl"
        style={{
          boxShadow: "0 -12px 40px rgba(104,128,223,0.12)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl lg:max-w-6xl items-center justify-around px-2 py-0.5 lg:px-6">
          {localizedItems.map((item) => {
            const isActive = item.id === activePage;
            const config = tabConfig[item.id] || tabConfig.pricing;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="relative group flex min-h-[58px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-300"
              >
                {/* Active Highlight Panel */}
                <div
                  className={`absolute inset-x-1.5 inset-y-1 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? `${config.activeBorder} ${config.activeGlow} scale-100 opacity-100`
                      : "border-transparent scale-95 opacity-0"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, rgba(99,95,255,0.16) 0%, rgba(47,145,255,0.14) 52%, rgba(68,226,231,0.18) 100%)" } : undefined}
                />

                {/* Icon */}
                <span
                  className={`relative flex h-6 w-6 items-center justify-center transition-all duration-300 ${
                    isActive ? config.activeText : "text-[#95a0c6] group-hover:text-[#5d6fb6]"
                  }`}
                >
                  <Icon className="h-[19px] w-[19px]" />
                </span>

                {/* Label */}
                <span
                  className={`relative text-center font-bold tracking-wide transition-all duration-300 ${
                    isActive ? config.activeText : "text-[#95a0c6] group-hover:text-[#5d6fb6]"
                  }`}
                  style={{ fontFamily: AR, fontSize: isActive ? "9.5px" : "9px" }}
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

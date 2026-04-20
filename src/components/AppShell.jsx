import {
  BuildingsIcon,
  PricingIcon,
  SettingsIcon,
  SuppliersIcon,
} from "./icons";

const navItems = [
  { id: "companies", label: "الشركات", icon: BuildingsIcon },
  { id: "pricing", label: "التسعير", icon: PricingIcon },
  { id: "suppliers", label: "الموردين", icon: SuppliersIcon },
  { id: "settings", label: "الإعدادات", icon: SettingsIcon },
];

export default function AppShell({
  activePage,
  onNavigate,
  children,
  navText,
  language = "ar",
  theme = "dark",
}) {
  const localizedItems = navItems.map((item) => ({
    ...item,
    label: navText?.[item.id] || item.label,
  }));

  const isLight = theme === "light";

  return (
    <div
      dir={language === "en" ? "ltr" : "rtl"}
      className={`h-[100dvh] overflow-hidden pb-[env(safe-area-inset-bottom)] text-slate-900 ${
        isLight
          ? "bg-[radial-gradient(circle_at_top,#f8f1e6_0%,#eee4d3_52%,#d9c7a5_100%)]"
          : "bg-[radial-gradient(circle_at_top,#16203a_0%,#0f172a_55%,#020617_100%)]"
      }`}
    >
      <div className="flex h-[100dvh] w-full items-stretch justify-center">
        <div
          className={`flex h-[100dvh] w-full flex-col overflow-hidden ${
            isLight ? "bg-[#fffdfa]" : "bg-slate-100"
          }`}
        >
            <div
              className={`flex items-center justify-between px-3 py-2 ${
                isLight
                  ? "bg-[linear-gradient(135deg,#173a67_0%,#002D5A_70%,#214b7c_100%)] text-white"
                  : "bg-[linear-gradient(135deg,#13294b_0%,#10213e_60%,#182a48_100%)] text-white"
              }`}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#d9b36a]">
                  Taseera
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-200">
                  Construction Pricing Intelligence
                </p>
              </div>
            </div>

            <main
              className={`min-h-0 flex-1 overflow-y-auto px-2 py-2 pb-[5.5rem] ${
                isLight
                  ? "bg-[linear-gradient(180deg,#fffaf1_0%,#fbf5eb_24%,#ffffff_100%)]"
                  : "bg-[linear-gradient(180deg,#f7f2e9_0%,#f4efe7_24%,#fbfbfb_100%)]"
              }`}
            >
              {children}
            </main>

            <nav className="sticky bottom-0 z-20 grid grid-cols-4 gap-1 border-t border-[#e8dcc6] bg-white px-1.5 py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
              {localizedItems.map((item) => {
                const isActive = item.id === activePage;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`grid min-h-[48px] place-items-center gap-1 rounded-[12px] px-1 py-1.5 text-center text-[8px] font-medium transition ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white shadow-lg shadow-slate-950/20"
                        : "text-slate-500 hover:bg-[#f6efe4]"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full text-[10px] ${
                        isActive ? "bg-white/10 text-[#d9b36a]" : "bg-[#f5ede0] text-slate-500"
                      }`}
                    >
                      <Icon className="h-[1.3rem] w-[1.3rem]" />
                    </span>
                    <span className="leading-3 min-[390px]:text-[9px]">{item.label}</span>
                  </button>
                );
              })}
            </nav>
        </div>
      </div>
    </div>
  );
}

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
      className={`min-h-screen px-4 py-6 text-slate-900 ${
        isLight
          ? "bg-[radial-gradient(circle_at_top,#f8f1e6_0%,#eee4d3_52%,#d9c7a5_100%)]"
          : "bg-[radial-gradient(circle_at_top,#16203a_0%,#0f172a_55%,#020617_100%)]"
      }`}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div
          className={`w-full max-w-[430px] rounded-[38px] border p-3 shadow-[0_30px_90px_rgba(2,6,23,0.55)] ${
            isLight
              ? "border-[#d0b27a] bg-[linear-gradient(180deg,#f7f0e3_0%,#ede1ca_100%)]"
              : "border-[#d0b27a] bg-[linear-gradient(180deg,#0b1327_0%,#0f172a_100%)]"
          }`}
        >
          <div
            className={`overflow-hidden rounded-[30px] border ${
              isLight ? "border-[#eadfca] bg-[#fffdfa]" : "border-slate-800 bg-slate-100"
            }`}
          >
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                isLight
                  ? "bg-[linear-gradient(135deg,#173a67_0%,#002D5A_70%,#214b7c_100%)] text-white"
                  : "bg-[linear-gradient(135deg,#13294b_0%,#10213e_60%,#182a48_100%)] text-white"
              }`}
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9b36a]">
                  Taseera
                </p>
                <p className="mt-1 text-xs font-medium text-slate-200">Construction Pricing Intelligence</p>
              </div>
              <div className="h-6 w-24 rounded-full bg-black/40 shadow-inner" />
            </div>

            <main
              className={`h-[calc(100vh-14rem)] min-h-[720px] overflow-y-auto px-3 py-3 ${
                isLight
                  ? "bg-[linear-gradient(180deg,#fffaf1_0%,#fbf5eb_24%,#ffffff_100%)]"
                  : "bg-[linear-gradient(180deg,#f7f2e9_0%,#f4efe7_24%,#fbfbfb_100%)]"
              }`}
            >
              {children}
            </main>

            <nav className="grid grid-cols-4 gap-2 border-t border-[#e8dcc6] bg-white px-3 py-2.5">
              {localizedItems.map((item) => {
                const isActive = item.id === activePage;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`grid place-items-center gap-1 rounded-[14px] px-2 py-1.5 text-center text-[10px] font-medium transition ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#16335d_0%,#10213e_100%)] text-white shadow-lg shadow-slate-950/20"
                        : "text-slate-500 hover:bg-[#f6efe4]"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full text-[10px] ${
                        isActive ? "bg-white/10 text-[#d9b36a]" : "bg-[#f5ede0] text-slate-500"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

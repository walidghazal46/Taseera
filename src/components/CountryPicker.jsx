import { useState } from "react";
import { ADMIN_EMAIL, trackCountryVisit, useCountryStats } from "../hooks/useCountryStats";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const COUNTRIES = [
  {
    value: "السعودية",
    code: "SA",
    flagUrl: "https://flagcdn.com/sa.svg",
    labelAr: "المملكة العربية السعودية",
    labelEn: "Saudi Arabia",
    color: "#1a7a3c",
    bg: "#f0faf4",
    border: "#bbdfc8",
    badgeBg: "#1a7a3c",
    adminBg: "#e6f4ec",
    adminBorder: "#a3d4b3",
  },
  {
    value: "مصر",
    code: "EG",
    flagUrl: "https://flagcdn.com/eg.svg",
    labelAr: "جمهورية مصر العربية",
    labelEn: "Egypt",
    color: "#b91c1c",
    bg: "#fff5f5",
    border: "#f5c0c0",
    badgeBg: "#c62828",
    adminBg: "#fdf0f0",
    adminBorder: "#f0b4b4",
  },
  {
    value: "الإمارات",
    code: "AE",
    flagUrl: "https://flagcdn.com/ae.svg",
    labelAr: "الإمارات العربية المتحدة",
    labelEn: "United Arab Emirates",
    color: "#1565c0",
    bg: "#f0f6ff",
    border: "#b3ccee",
    badgeBg: "#1565c0",
    adminBg: "#e8f0fb",
    adminBorder: "#a8c4e8",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function StatBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────

function AdminPanel({ country, isAr }) {
  const stats = useCountryStats(country.code);

  const sections = [
    { key: "companiesViews", labelAr: "الشركات", labelEn: "Companies", icon: "🏢" },
    { key: "suppliersViews", labelAr: "الموردون", labelEn: "Suppliers", icon: "🔧" },
    { key: "pricingViews", labelAr: "التسعير", labelEn: "Pricing", icon: "💰" },
  ];

  const totalVisits = stats
    ? (stats.companiesViews || 0) + (stats.suppliersViews || 0) + (stats.pricingViews || 0)
    : 0;
  const totalUsers = stats ? (stats.users || 0) + (stats.guests || 0) : 0;
  const maxSection = stats
    ? Math.max(stats.companiesViews || 0, stats.suppliersViews || 0, stats.pricingViews || 0, 1)
    : 1;

  return (
    <div
      className="mt-2 overflow-hidden rounded-2xl border"
      style={{ background: country.adminBg, borderColor: country.adminBorder }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: country.color + "18", borderBottom: `1px solid ${country.adminBorder}` }}
      >
        <span className="text-[11px] font-extrabold uppercase tracking-widest opacity-70" style={{ fontFamily: MONO, color: country.color }}>
          ADMIN MONITOR
        </span>
        <span className="text-[11px] font-bold opacity-60" style={{ fontFamily: AR, color: country.color }}>
          {stats ? fmtTime(stats.lastActivity) : "…"}
        </span>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center py-5">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2"
            style={{ borderColor: country.color + "40", borderTopColor: country.color }}
          />
        </div>
      ) : (
        <div className="px-4 py-3 grid gap-3">

          {/* Users vs Guests */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: country.color + "12", border: `1px solid ${country.color}30` }}
            >
              <p className="text-[18px] font-extrabold leading-none" style={{ color: country.color }}>
                {stats.users || 0}
              </p>
              <p className="mt-0.5 text-[10px] font-bold opacity-60" style={{ fontFamily: AR, color: country.color }}>
                👤 {isAr ? "مستخدمون" : "Users"}
              </p>
            </div>
            <div
              className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: "#64748b18", border: "1px solid #64748b30" }}
            >
              <p className="text-[18px] font-extrabold leading-none text-slate-600">
                {stats.guests || 0}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-400" style={{ fontFamily: AR }}>
                👥 {isAr ? "ضيوف" : "Guests"}
              </p>
            </div>
          </div>

          {/* Total visits badge */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold opacity-50" style={{ fontFamily: AR, color: country.color }}>
              {isAr ? "إجمالي الزيارات" : "Total Visits"}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-white"
              style={{ backgroundColor: country.badgeBg }}
            >
              {totalVisits}
            </span>
          </div>

          {/* Sections breakdown */}
          <div className="grid gap-2">
            {sections.map((s) => {
              const val = stats[s.key] || 0;
              const pct = totalVisits > 0 ? Math.round((val / totalVisits) * 100) : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold" style={{ fontFamily: AR, color: country.color }}>
                      {s.icon} {isAr ? s.labelAr : s.labelEn}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-extrabold" style={{ color: country.color }}>{val}</span>
                      <span className="text-[10px] opacity-40" style={{ fontFamily: MONO }}>({pct}%)</span>
                    </span>
                  </div>
                  <StatBar value={val} max={maxSection} color={country.color} />
                </div>
              );
            })}
          </div>

          {/* Registered users rate */}
          {totalUsers > 0 && (
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: country.color + "0a", border: `1px solid ${country.color}20` }}
            >
              <p className="text-[11px] font-bold opacity-50" style={{ fontFamily: AR, color: country.color }}>
                {isAr ? "نسبة المستخدمين المسجلين" : "Registered Users Rate"}
              </p>
              <p className="text-[16px] font-extrabold" style={{ color: country.color }}>
                {Math.round(((stats.users || 0) / totalUsers) * 100)}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CountryPicker({
  language,
  icon = "🌍",
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  onSelect,
  sessionMeta,
  authMode,
  section = "companies",
}) {
  const isAr = language !== "en";
  const isAdmin = sessionMeta?.userEmail === ADMIN_EMAIL;
  const [expandedAdmin, setExpandedAdmin] = useState(null);

  const handleSelect = (country) => {
    try { trackCountryVisit(country.value, section, authMode).catch(() => {}); } catch {}
    onSelect(country.value);
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-8">
      {/* Title */}
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#082555] to-[#0d3070] text-3xl shadow-[0_8px_24px_rgba(8,37,85,0.3)]">
            {icon}
          </span>
        </div>
        <h2 className="text-[20px] font-extrabold text-[#082555]" style={{ fontFamily: AR }}>
          {isAr ? (titleAr || "اختر الدولة") : (titleEn || "Select Country")}
        </h2>
        <p className="mt-1 text-[12px] text-slate-500" style={{ fontFamily: AR }}>
          {isAr
            ? (subtitleAr || "اختر الدولة للمتابعة")
            : (subtitleEn || "Choose a country to continue")}
        </p>
        {isAdmin && (
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#082555]/40" style={{ fontFamily: MONO }}>
            ⚙ ADMIN MODE ACTIVE
          </p>
        )}
      </div>

      {/* Country cards */}
      <div className="w-full max-w-sm space-y-3">
        {COUNTRIES.map((country) => {
          const isExpanded = expandedAdmin === country.code;

          return (
            <div key={country.value}>
              {/* Card row */}
              <div
                className="flex w-full items-center rounded-3xl border shadow-sm transition-all"
                style={{
                  background: country.bg,
                  borderColor: isExpanded ? country.color : country.border,
                  boxShadow: isExpanded ? `0 0 0 2px ${country.color}30` : undefined,
                }}
              >
                {/* Main clickable area */}
                <button
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="flex flex-1 items-center gap-4 px-5 py-4 text-right transition-all active:scale-[0.97] hover:opacity-90"
                >
                  <span className="text-[18px] font-bold shrink-0" style={{ color: country.color }}>‹</span>

                  <div className="shrink-0 h-12 w-12 rounded-full overflow-hidden shadow-md border-2 border-white">
                    <img src={country.flagUrl} alt={country.code} className="h-full w-full object-cover" />
                  </div>

                  <div className="w-px self-stretch" style={{ backgroundColor: country.border }} />

                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[16px] font-extrabold leading-tight" style={{ fontFamily: AR, color: country.color }}>
                      {isAr ? country.labelAr : country.labelEn}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-400" style={{ fontFamily: AR }}>
                      {isAr ? country.labelEn : country.labelAr}
                    </p>
                  </div>

                  <div
                    className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-[15px] font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: country.badgeBg, fontFamily: MONO }}
                  >
                    {country.code}
                  </div>
                </button>

                {/* Admin toggle button */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setExpandedAdmin(isExpanded ? null : country.code)}
                    className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 py-4 rounded-e-3xl transition-all active:scale-95"
                    style={{
                      background: isExpanded ? country.color : country.color + "18",
                      borderLeft: `1px solid ${country.border}`,
                      minWidth: "46px",
                    }}
                    aria-label="Admin panel"
                  >
                    <span className="text-[14px]">📊</span>
                    <span
                      className="text-[9px] font-extrabold"
                      style={{ fontFamily: MONO, color: isExpanded ? "#fff" : country.color }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>
                )}
              </div>

              {/* Admin panel — expanded */}
              {isAdmin && isExpanded && (
                <AdminPanel country={country} isAr={isAr} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

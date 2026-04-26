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
  },
];

export default function CountryPicker({ language, icon = "🌍", titleAr, titleEn, subtitleAr, subtitleEn, onSelect }) {
  const isAr = language !== "en";

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
      </div>

      {/* Country cards */}
      <div className="w-full max-w-sm space-y-3">
        {COUNTRIES.map((country) => (
          <button
            key={country.value}
            type="button"
            onClick={() => onSelect(country.value)}
            className="flex w-full items-center gap-4 rounded-3xl border px-5 py-4 text-right shadow-sm transition-all active:scale-[0.97] hover:shadow-md"
            style={{ background: country.bg, borderColor: country.border }}
          >
            {/* سهم يسار */}
            <span className="text-[18px] font-bold shrink-0" style={{ color: country.color }}>‹</span>

            {/* علم دائري */}
            <div className="shrink-0 h-12 w-12 rounded-full overflow-hidden shadow-md border-2 border-white">
              <img src={country.flagUrl} alt={country.code} className="h-full w-full object-cover" />
            </div>

            {/* فاصل */}
            <div className="w-px self-stretch" style={{ backgroundColor: country.border }} />

            {/* نص */}
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[16px] font-extrabold leading-tight" style={{ fontFamily: AR, color: country.color }}>
                {isAr ? country.labelAr : country.labelEn}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400" style={{ fontFamily: AR }}>
                {isAr ? country.labelEn : country.labelAr}
              </p>
            </div>

            {/* Badge كود الدولة */}
            <div
              className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-[15px] font-extrabold text-white shadow-sm"
              style={{ backgroundColor: country.badgeBg, fontFamily: MONO }}
            >
              {country.code}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

const COUNTRIES = [
  {
    value: "السعودية",
    flag: "🇸🇦",
    labelAr: "المملكة العربية السعودية",
    labelEn: "Saudi Arabia",
    color: "#1a7a3c",
    bg: "#edfaf3",
    border: "#a3dbb8",
  },
  {
    value: "مصر",
    flag: "🇪🇬",
    labelAr: "جمهورية مصر العربية",
    labelEn: "Egypt",
    color: "#b91c1c",
    bg: "#fff5f5",
    border: "#fca5a5",
  },
  {
    value: "الإمارات",
    flag: "🇦🇪",
    labelAr: "الإمارات العربية المتحدة",
    labelEn: "United Arab Emirates",
    color: "#0369a1",
    bg: "#f0f8ff",
    border: "#93c5fd",
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
            className="flex w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-right shadow-sm transition-all active:scale-[0.97] hover:shadow-md"
            style={{ background: country.bg, borderColor: country.border }}
          >
            <span className="text-4xl">{country.flag}</span>
            <div className="flex-1">
              <p className="text-[15px] font-extrabold" style={{ fontFamily: AR, color: country.color }}>
                {isAr ? country.labelAr : country.labelEn}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400" style={{ fontFamily: AR }}>
                {isAr ? country.labelEn : country.labelAr}
              </p>
            </div>
            <span className="text-xl font-bold" style={{ color: country.color }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { trackCountryVisit } from "../hooks/useCountryStats";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// ─── Landmark SVGs ─────────────────────────────────────────────────────────────

function SaudiLandmarkSVG() {
  return (
    <svg viewBox="0 0 320 155" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Desert sand dunes */}
      <path d="M0 138 Q80 112 160 128 Q240 108 320 122 L320 155 L0 155Z" fill="#1a7a3c" opacity="0.10"/>
      <path d="M0 148 Q60 136 130 143 Q200 130 280 140 L320 138 L320 155 L0 155Z" fill="#1a7a3c" opacity="0.07"/>

      {/* Palm tree – left */}
      <path d="M42 142 C40 122 37 102 41 80 C45 102 44 122 42 142Z" fill="#1a7a3c" opacity="0.55"/>
      <path d="M41 80 C27 72 12 74 2 68 C15 70 28 73 41 80Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M41 80 C55 72 70 74 80 68 C67 70 55 73 41 80Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M41 78 C35 64 33 47 35 32 C37 47 39 64 41 78Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M41 80 C33 66 27 50 25 36 C29 50 35 66 41 80Z" fill="#1a7a3c" opacity="0.6"/>
      <path d="M41 80 C49 66 55 50 57 36 C53 50 47 66 41 80Z" fill="#1a7a3c" opacity="0.6"/>
      <ellipse cx="42" cy="143" rx="9" ry="3" fill="#1a7a3c" opacity="0.1"/>

      {/* Palm tree – right */}
      <path d="M268 142 C266 120 263 100 267 76 C271 100 270 120 268 142Z" fill="#1a7a3c" opacity="0.55"/>
      <path d="M267 76 C253 68 238 70 228 64 C241 66 254 69 267 76Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M267 76 C281 68 296 70 306 64 C293 66 281 69 267 76Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M267 74 C261 60 259 43 261 28 C263 43 265 60 267 74Z" fill="#1a7a3c" opacity="0.65"/>
      <path d="M267 76 C259 62 253 46 251 32 C255 46 261 62 267 76Z" fill="#1a7a3c" opacity="0.6"/>
      <path d="M267 76 C275 62 281 46 283 32 C279 46 273 62 267 76Z" fill="#1a7a3c" opacity="0.6"/>

      {/* Background city buildings */}
      <rect x="88" y="100" width="13" height="40" rx="2" fill="#1a7a3c" opacity="0.22"/>
      <rect x="103" y="108" width="10" height="32" rx="2" fill="#1a7a3c" opacity="0.18"/>
      <rect x="205" y="96" width="13" height="44" rx="2" fill="#1a7a3c" opacity="0.22"/>
      <rect x="220" y="104" width="10" height="36" rx="2" fill="#1a7a3c" opacity="0.18"/>

      {/* Kingdom Centre Tower – hero center */}
      {/* Left wing */}
      <rect x="128" y="62" width="22" height="78" rx="2" fill="#1a7a3c" opacity="0.42"/>
      {/* Right wing */}
      <rect x="170" y="62" width="22" height="78" rx="2" fill="#1a7a3c" opacity="0.42"/>
      {/* Main shaft */}
      <rect x="149" y="28" width="22" height="112" rx="2" fill="#1a7a3c" opacity="0.58"/>
      {/* Sky bridge arch */}
      <path d="M134 58 Q160 34 186 58Z" fill="#1a7a3c" opacity="0.52"/>
      <path d="M138 55 Q160 40 182 55 L182 63 Q160 50 138 63Z" fill="white" opacity="0.14"/>
      {/* Spire */}
      <line x1="160" y1="28" x2="160" y2="8" stroke="#1a7a3c" strokeWidth="3" strokeLinecap="round" opacity="0.65"/>
      <line x1="160" y1="8" x2="160" y2="2" stroke="#1a7a3c" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      {/* Window lines */}
      <line x1="153" y1="74" x2="167" y2="74" stroke="white" strokeWidth="0.8" opacity="0.1"/>
      <line x1="153" y1="88" x2="167" y2="88" stroke="white" strokeWidth="0.8" opacity="0.1"/>
      <line x1="153" y1="102" x2="167" y2="102" stroke="white" strokeWidth="0.8" opacity="0.1"/>

      {/* Ground line */}
      <line x1="0" y1="140" x2="320" y2="140" stroke="#1a7a3c" strokeWidth="1" opacity="0.12"/>
    </svg>
  );
}

function EgyptLandmarkSVG() {
  return (
    <svg viewBox="0 0 320 155" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Sun */}
      <circle cx="272" cy="28" r="20" fill="#b91c1c" opacity="0.1"/>
      <circle cx="272" cy="28" r="13" fill="#b91c1c" opacity="0.14"/>

      {/* Main large pyramid */}
      <polygon points="125,8 272,140 -22,140" fill="#b91c1c" opacity="0.58"/>
      {/* Bright face highlight */}
      <polygon points="125,8 272,140 125,140" fill="white" opacity="0.055"/>
      {/* Stone course lines */}
      <line x1="125" y1="8" x2="125" y2="140" stroke="white" strokeWidth="0.6" opacity="0.07"/>
      <line x1="54" y1="76" x2="196" y2="76" stroke="white" strokeWidth="0.5" opacity="0.065"/>
      <line x1="20" y1="108" x2="230" y2="108" stroke="white" strokeWidth="0.5" opacity="0.065"/>
      {/* Capstone highlight */}
      <polygon points="125,8 134,28 116,28" fill="white" opacity="0.1"/>

      {/* Second pyramid */}
      <polygon points="240,42 312,140 168,140" fill="#b91c1c" opacity="0.42"/>
      <polygon points="240,42 312,140 240,140" fill="white" opacity="0.04"/>

      {/* Third small pyramid */}
      <polygon points="296,70 320,140 272,140" fill="#b91c1c" opacity="0.32"/>

      {/* Sphinx body */}
      <rect x="-8" y="118" width="58" height="20" rx="5" fill="#b91c1c" opacity="0.48"/>
      {/* Sphinx head */}
      <ellipse cx="10" cy="113" rx="14" ry="16" fill="#b91c1c" opacity="0.48"/>
      {/* Nemes headdress */}
      <path d="M-2 107 Q10 94 22 107 L24 122 Q10 116 -4 122Z" fill="#b91c1c" opacity="0.52"/>
      {/* Face details */}
      <ellipse cx="6" cy="114" rx="2.5" ry="2" fill="white" opacity="0.13"/>
      <ellipse cx="14" cy="114" rx="2.5" ry="2" fill="white" opacity="0.13"/>
      <line x1="3" y1="119" x2="17" y2="119" stroke="white" strokeWidth="0.8" opacity="0.1"/>
      {/* Paws */}
      <rect x="-8" y="132" width="20" height="6" rx="3" fill="#b91c1c" opacity="0.42"/>
      <rect x="16" y="132" width="20" height="6" rx="3" fill="#b91c1c" opacity="0.42"/>

      {/* Nile / ground water */}
      <rect x="0" y="140" width="320" height="15" fill="#b91c1c" opacity="0.07"/>
      <path d="M0 140 Q80 133 160 137 Q240 131 320 140" stroke="#b91c1c" strokeWidth="1.2" opacity="0.18" fill="none"/>
      <path d="M30 147 Q90 143 150 147 Q210 143 270 147" stroke="#b91c1c" strokeWidth="0.7" opacity="0.1" fill="none"/>

      {/* Sand dune */}
      <path d="M0 135 Q80 122 160 130 Q240 118 320 128 L320 155 L0 155Z" fill="#b91c1c" opacity="0.07"/>
    </svg>
  );
}

function UAELandmarkSVG() {
  return (
    <svg viewBox="0 0 320 155" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Sea / water */}
      <rect x="0" y="131" width="320" height="24" fill="#1565c0" opacity="0.06"/>
      {/* Ground */}
      <rect x="0" y="129" width="320" height="4" fill="#1565c0" opacity="0.16"/>

      {/* Far-left buildings */}
      <rect x="0" y="108" width="20" height="24" rx="2" fill="#1565c0" opacity="0.2"/>
      <rect x="22" y="98" width="16" height="34" rx="2" fill="#1565c0" opacity="0.18"/>
      <rect x="40" y="92" width="14" height="40" rx="2" fill="#1565c0" opacity="0.2"/>

      {/* Burj Al Arab – sail silhouette */}
      <path d="M62 133 L62 55 L92 133Z" fill="#1565c0" opacity="0.28"/>
      <ellipse cx="77" cy="53" rx="16" ry="4.5" fill="#1565c0" opacity="0.22"/>
      <line x1="62" y1="55" x2="62" y2="32" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" opacity="0.32"/>

      {/* Left-mid cluster */}
      <rect x="98" y="90" width="16" height="42" rx="2" fill="#1565c0" opacity="0.26"/>
      <rect x="100" y="80" width="12" height="14" rx="2" fill="#1565c0" opacity="0.2"/>
      <rect x="116" y="98" width="13" height="34" rx="2" fill="#1565c0" opacity="0.23"/>
      <rect x="131" y="104" width="14" height="28" rx="2" fill="#1565c0" opacity="0.2"/>

      {/* Burj Khalifa – hero center */}
      {/* Spire tip */}
      <line x1="178" y1="4" x2="178" y2="18" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round" opacity="0.72"/>
      {/* Tapered tower body */}
      <path d="
        M178 18
        L176 26 L174 34 L172 44
        L169 54 L167 64
        L165 74 L164 86
        L162 100 L161 133
        L195 133 L194 100
        L192 86 L191 74
        L189 64 L187 54
        L184 44 L182 34 L180 26 L178 18Z
      " fill="#1565c0" opacity="0.62"/>
      {/* Setback bands */}
      <rect x="165" y="74" width="26" height="3.5" fill="white" opacity="0.09"/>
      <rect x="167" y="54" width="22" height="3" fill="white" opacity="0.08"/>
      <rect x="169" y="64" width="18" height="2.5" fill="white" opacity="0.07"/>
      {/* Vertical window columns */}
      <rect x="170" y="80" width="3" height="22" rx="1" fill="white" opacity="0.09"/>
      <rect x="176" y="80" width="3" height="22" rx="1" fill="white" opacity="0.09"/>
      <rect x="182" y="80" width="3" height="22" rx="1" fill="white" opacity="0.09"/>
      {/* Y-wings base */}
      <path d="M161 133 L158 112 L165 100" stroke="#1565c0" strokeWidth="3" strokeLinecap="round" opacity="0.28" fill="none"/>
      <path d="M195 133 L198 112 L191 100" stroke="#1565c0" strokeWidth="3" strokeLinecap="round" opacity="0.28" fill="none"/>

      {/* Right-mid cluster */}
      <rect x="202" y="94" width="16" height="38" rx="2" fill="#1565c0" opacity="0.26"/>
      <rect x="204" y="84" width="12" height="14" rx="2" fill="#1565c0" opacity="0.2"/>
      <rect x="220" y="100" width="18" height="32" rx="2" fill="#1565c0" opacity="0.23"/>
      <rect x="222" y="90" width="14" height="14" rx="2" fill="#1565c0" opacity="0.18"/>

      {/* Far-right buildings */}
      <rect x="242" y="90" width="16" height="42" rx="2" fill="#1565c0" opacity="0.2"/>
      <rect x="260" y="100" width="20" height="32" rx="2" fill="#1565c0" opacity="0.18"/>
      <rect x="282" y="108" width="18" height="24" rx="2" fill="#1565c0" opacity="0.16"/>
      <rect x="302" y="112" width="18" height="20" rx="2" fill="#1565c0" opacity="0.14"/>

      {/* Water reflections */}
      <path d="M161 136 Q178 140 195 136" stroke="#1565c0" strokeWidth="0.8" opacity="0.1" fill="none"/>
      <path d="M60 138 Q80 142 100 138" stroke="#1565c0" strokeWidth="0.7" opacity="0.08" fill="none"/>
    </svg>
  );
}

// ─── Flag components with glossy metallic ring ────────────────────────────────

function FlagCircle({ flagUrl, code, shadow }) {
  return (
    <div
      style={{
        position: "relative",
        width: 62,
        height: 62,
        flexShrink: 0,
      }}
    >
      {/* Outer metallic ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "linear-gradient(145deg, #e8e8e8 0%, #c0c0c0 35%, #f5f5f5 55%, #a8a8a8 75%, #d0d0d0 100%)",
        boxShadow: `0 6px 18px ${shadow}, 0 2px 6px rgba(0,0,0,0.12)`,
      }} />
      {/* Inner white mat */}
      <div style={{
        position: "absolute", inset: 3, borderRadius: "50%",
        background: "#ffffff",
      }} />
      {/* Flag image */}
      <div style={{
        position: "absolute", inset: 5, borderRadius: "50%", overflow: "hidden",
      }}>
        <img
          src={flagUrl}
          alt={code}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {/* Top gloss */}
      <div style={{
        position: "absolute", inset: 5, borderRadius: "50%",
        background: "linear-gradient(175deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── Country Data ──────────────────────────────────────────────────────────────

const COUNTRIES = [
  {
    value: "السعودية",
    code: "SA",
    flagUrl: "https://flagcdn.com/sa.svg",
    labelAr: "المملكة العربية السعودية",
    labelEn: "Saudi Arabia",
    color: "#1a7a3c",
    bg: "linear-gradient(135deg, #f0faf4 0%, #e4f4ec 60%, #d8efdf 100%)",
    border: "#a8d8b8",
    badgeBg: "linear-gradient(150deg, #1a7a3c 0%, #22964a 100%)",
    shadow: "rgba(26,122,60,0.22)",
    Landmark: SaudiLandmarkSVG,
  },
  {
    value: "مصر",
    code: "EG",
    flagUrl: "https://flagcdn.com/eg.svg",
    labelAr: "جمهورية مصر العربية",
    labelEn: "Egypt",
    color: "#c62828",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fde8e8 60%, #fad4d4 100%)",
    border: "#f0b0b0",
    badgeBg: "linear-gradient(150deg, #c62828 0%, #e53935 100%)",
    shadow: "rgba(198,40,40,0.22)",
    Landmark: EgyptLandmarkSVG,
  },
  {
    value: "الإمارات",
    code: "AE",
    flagUrl: "https://flagcdn.com/ae.svg",
    labelAr: "الإمارات العربية المتحدة",
    labelEn: "United Arab Emirates",
    color: "#1565c0",
    bg: "linear-gradient(135deg, #f0f6ff 0%, #e2eeff 60%, #d4e4ff 100%)",
    border: "#a8c4ee",
    badgeBg: "linear-gradient(150deg, #1565c0 0%, #1e88e5 100%)",
    shadow: "rgba(21,101,192,0.22)",
    Landmark: UAELandmarkSVG,
  },
];

// ─── CSS animations ────────────────────────────────────────────────────────────

const EFFECTS = `
@keyframes cPickerShine {
  0%   { transform: translate3d(-180%,0,0) skewX(-20deg); opacity:0; }
  15%  { opacity:0.15; }
  50%  { opacity:0.85; }
  70%  { opacity:0.70; }
  100% { transform: translate3d(220%,0,0) skewX(-20deg); opacity:0; }
}
@keyframes cPickerFloat {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%      { transform: translateY(-7px) rotate(0.5deg); }
  66%      { transform: translateY(-3px) rotate(-0.3deg); }
}
@keyframes cPickerFadeIn {
  from { opacity:0; transform: translateY(18px); }
  to   { opacity:1; transform: translateY(0); }
}
.cpicker-shine { animation: none; }
.cpicker-group:hover .cpicker-shine {
  animation: cPickerShine 1.4s cubic-bezier(0.19,1,0.22,1) forwards;
}
.cpicker-group:hover {
  transform: translateY(-2px);
}
.cpicker-group { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.cpicker-icon-float { animation: cPickerFloat 4.5s ease-in-out infinite; }
.cpicker-card-1 { animation: cPickerFadeIn 0.55s ease both 0.05s; }
.cpicker-card-2 { animation: cPickerFadeIn 0.55s ease both 0.15s; }
.cpicker-card-3 { animation: cPickerFadeIn 0.55s ease both 0.25s; }
`;

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CountryPicker({
  language,
  icon = "🏢",
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

  const handleSelect = (country) => {
    try { trackCountryVisit(country.value, section, authMode).catch(() => {}); } catch {}
    onSelect(country.value);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-5 py-4 px-4 overflow-hidden"
      style={{ minHeight: "calc(100vh - 160px)" }}
    >
      <style>{EFFECTS}</style>


      {/* ── Hero section ─────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-5 text-center">

        {/* Floating city icon – no box, blends with background */}
        <div className="cpicker-icon-float relative" style={{ marginBottom: 4 }}>
          {/* Soft ambient glow underneath */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", bottom: -10, left: "50%",
              transform: "translateX(-50%)",
              width: 110, height: 40,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(100,150,255,0.28) 0%, transparent 70%)",
              filter: "blur(12px)",
            }}
          />
          {/* Very soft glass disc platform */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 4, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(220,235,255,0.18) 60%, transparent 100%)",
              filter: "blur(6px)",
            }}
          />
          {/* Icon — large emoji, no box */}
          <div
            style={{
              position: "relative",
              width: 90, height: 90,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64,
              filter: "drop-shadow(0 8px 18px rgba(40,80,160,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
            }}
          >
            {icon}
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ maxWidth: 310 }}>
          <h2
            style={{
              fontFamily: AR, fontSize: 24, fontWeight: 900, lineHeight: 1.25,
              color: "#082555", letterSpacing: "-0.4px",
              margin: 0,
            }}
          >
            {isAr ? (titleAr || "اختر دولة العمل") : (titleEn || "Select Country")}
          </h2>
          <p
            style={{
              fontFamily: AR, fontSize: 12, lineHeight: 1.5, color: "#7B8A9A",
              marginTop: 6, marginBottom: 0,
            }}
          >
            {isAr
              ? (subtitleAr || "ابدأ من الدولة المناسبة ثم انتقل إلى دليل الشركات والمشاريع")
              : (subtitleEn || "Choose your country to access the companies directory")}
          </p>
        </div>
      </div>

      {/* ── Country cards ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
        {COUNTRIES.map((country, idx) => {
          const { Landmark } = country;
          return (
            <button
              key={country.value}
              type="button"
              onClick={() => handleSelect(country)}
              className={`cpicker-group cpicker-card-${idx + 1}`}
              style={{
                position: "relative",
                width: "100%",
                overflow: "hidden",
                borderRadius: 22,
                border: `1.5px solid ${country.border}`,
                background: country.bg,
                boxShadow: `0 6px 24px ${country.shadow}, 0 1px 6px rgba(0,0,0,0.06)`,
                textAlign: "right",
                cursor: "pointer",
                padding: 0,
                outline: "none",
              }}
            >
              {/* Landmark watermark – fills left half of card */}
              {Landmark && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", bottom: 0, left: 0,
                    width: "62%", height: "110%",
                    opacity: 0.22,
                    pointerEvents: "none",
                  }}
                >
                  <Landmark />
                </div>
              )}

              {/* Top gloss line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 0, left: 16, right: 16, height: 1.5,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Shine sweep on hover */}
              <div
                aria-hidden="true"
                className="cpicker-shine"
                style={{
                  position: "absolute", inset: "-30% 0",
                  left: 0, width: "38%",
                  opacity: 0,
                  mixBlendMode: "screen",
                  background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.45) 60%, rgba(255,255,255,0) 100%)",
                  filter: "blur(2px)",
                  pointerEvents: "none",
                }}
              />

              {/* Card content row */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 18px",
                  direction: "rtl",
                }}
              >
                {/* RIGHT side: chevron arrow + flag circle */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {/* Chevron */}
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    style={{ opacity: 0.55, flexShrink: 0 }}
                  >
                    <path d="M6 3L11 8L6 13" stroke={country.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* Metallic flag circle */}
                  <FlagCircle
                    flagUrl={country.flagUrl}
                    code={country.code}
                    shadow={country.shadow}
                  />
                </div>

                {/* Vertical divider */}
                <div
                  style={{
                    width: 1, alignSelf: "stretch",
                    background: `linear-gradient(180deg, transparent, ${country.border}, transparent)`,
                    flexShrink: 0, opacity: 0.7,
                  }}
                />

                {/* Center text */}
                <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                  <p
                    style={{
                      fontFamily: AR, fontSize: 15, fontWeight: 800, lineHeight: 1.2,
                      color: country.color, margin: 0,
                    }}
                  >
                    {isAr ? country.labelAr : country.labelEn}
                  </p>
                  <p
                    style={{
                      fontFamily: AR, fontSize: 10.5, color: "#9CA3AF",
                      marginTop: 2, marginBottom: 0, letterSpacing: "0.2px",
                    }}
                  >
                    {isAr ? country.labelEn : country.labelAr}
                  </p>
                </div>

                {/* LEFT side: country code badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 44, height: 44,
                    borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: country.badgeBg,
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#ffffff",
                    letterSpacing: "0.5px",
                    boxShadow: `0 4px 12px ${country.shadow}, inset 0 1px 0 rgba(255,255,255,0.22)`,
                  }}
                >
                  {country.code}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

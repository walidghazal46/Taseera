import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import AdSenseUnit from "./AdSenseUnit";
import CandyWorkspace from "./CandyWorkspace";
import { SaveIcon, TagIcon, BuildingsIcon, PricingIcon, ChevronLeftIcon, ArrowRightIcon, ShareIcon, PrinterIcon, FileIcon } from "./icons";
import { CSI_DIVISIONS, COUNTRIES, getDefaultResources, AREA_PRICING_BASE, CURRENCY_INFO } from "../data/csiData";
import ScreenProtection from "./ScreenProtection";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";
const AD_SLOT_IDS = {
  analysisPreResult: "analysisPreResult",
  analysisAfterActions: "analysisAfterActions",
  analysisPostResult: "analysisPostResult",
  areaFormAfterCard: "areaFormAfterCard",
  areaResultsAfterNote: "areaResultsAfterNote",
  areaSectionAfterAssumptions: "areaSectionAfterAssumptions",
  csiAfterDiv28: "csiAfterDiv28",
  selfPricingAfterActions: "selfPricingAfterActions",
};
const DEFAULT_AD_BANNER = { enabled: true, title: "", body: "", imageUrl: "", targetUrl: "", alt: "" };

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ---------------------------------------------------------------------------
// In-App Export Preview Modal (replaces window.open on mobile)
// ---------------------------------------------------------------------------
function ExportPreviewModal({ data, onClose, language = "ar" }) {
  const contentRef = useRef(null);
  const frameRef = useRef(null);
  const closeLockRef = useRef(false);
  const isEn = language === "en";

  const handleClose = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (closeLockRef.current) return;
    closeLockRef.current = true;
    onClose?.();
    window.setTimeout(() => {
      closeLockRef.current = false;
    }, 120);
  }, [onClose]);

  // Auto-scale content to fit one screen
  useEffect(() => {
    const el = contentRef.current;
    const frame = frameRef.current;
    if (!el || !frame || !data) return;
    const scale = () => {
      el.style.transform = "";
      el.style.transformOrigin = "";
      frame.style.height = "";
      const availableHeight = Math.max(window.innerHeight - frame.getBoundingClientRect().top - 10, 0);
      const availableWidth = Math.max(frame.clientWidth - 8, 0);
      const naturalHeight = el.scrollHeight;
      const naturalWidth = el.scrollWidth;
      const heightRatio = naturalHeight > 0 ? availableHeight / naturalHeight : 1;
      const widthRatio = naturalWidth > 0 ? availableWidth / naturalWidth : 1;
      const ratio = Math.min(1, heightRatio, widthRatio);
      if (ratio < 0.999) {
        el.style.transformOrigin = "top center";
        el.style.transform = `scale(${ratio})`;
        frame.style.height = Math.max(Math.round(naturalHeight * ratio), 1) + "px";
      }
    };
    scale();
    window.addEventListener("resize", scale);
    return () => window.removeEventListener("resize", scale);
  }, [data]);

  if (!data) return null;

  const {
    item, c, q, f, overhead, profit,
    matT, labT, eqpT, direct, indirect, profitAmt, finalTotal, unitPrice,
    resourcesList, now,
  } = data;

  const Row = ({ label, val, bold }) => (
    <div className={`flex justify-between items-center py-[3px] ${bold ? "border-t border-[#E2D8C4] mt-0.5 pt-1.5" : ""}`}>
      <span className={`text-[11px] ${bold ? "font-black text-[#082555]" : "font-bold text-[#082555]"}`}>
        {fmtNum(val)} {c.currency}
      </span>
      <span className={`text-[10px] ${bold ? "font-bold text-[#082555]" : "text-slate-500"}`}>{label}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#F7F3EC] overflow-hidden"
      dir={isEn ? "ltr" : "rtl"}
      style={{ fontFamily: AR }}
    >
      {/* ── Top bar — intentionally lowered for mobile comfort ── */}
      <div
        className="mx-3 flex items-center justify-between rounded-[20px] px-4 bg-[#082555] shadow-md print:hidden"
        style={{
          marginTop: "calc(env(safe-area-inset-top) + 2.4cm)",
          paddingTop: "0.65rem",
          paddingBottom: "0.65rem",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white text-[13px] font-bold active:opacity-70"
          aria-label={isEn ? "Close preview" : "إغلاق المعاينة"}
        >
          <span className="text-[13px] leading-none">✕</span>
          {isEn ? "Close" : "إغلاق"}
        </button>
        <span className="text-[11px] font-bold text-[#d4a843] tracking-wide">{isEn ? "Item Analysis" : "تحليل البند"}</span>
        <div className="flex items-center gap-2">
          {/* Print/Save — web only, hidden on Android */}
          {!window.TaseeraAndroid && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-[11px] text-[#d4a843] font-bold active:opacity-70 print:hidden"
            >
              <PrinterIcon className="h-4 w-4" /> {isEn ? "Save" : "حفظ"}
            </button>
          )}
          {/* Screenshot hint — Android only */}
          {window.TaseeraAndroid && (
            <span className="text-[10px] text-white/50 font-bold">{isEn ? "📸 Screenshot" : "📸 سكرين شوت"}</span>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1 rounded-full bg-[#d4a843] px-3 py-1.5 text-[#082555] active:opacity-70 transition-colors"
            aria-label={isEn ? "Back to previous screen" : "الرجوع للصفحة السابقة"}
          >
            <ArrowRightIcon className="h-4 w-4" />
            <span className="text-[12px] font-black leading-none">{isEn ? "Back" : "رجوع"}</span>
          </button>
        </div>
      </div>

      {/* ── Scalable content wrapper ── */}
      <div ref={frameRef} className="overflow-hidden px-2 pb-2" style={{ position: "relative" }}>
        <div ref={contentRef} className="mx-auto max-w-[26rem] px-2 pt-2 pb-1.5 space-y-1.5">

          {/* Item header */}
          <div className="bg-[#082555] rounded-2xl px-4 py-2 text-right">
            <p className="text-[8px] font-bold text-[#d4a843]/70 uppercase tracking-widest">{isEn ? "TASEERA" : "TASEERA · تسعيرة"}</p>
            <h1 className="text-[14px] font-black text-white leading-snug">{item.ar}</h1>
            <p className="text-[9px] text-white/50">{item.num} · {item.divAr} · {item.unit}</p>
            <p className="text-[8px] text-white/30">{now}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white rounded-xl p-2.5 text-right border border-[#E2D8C4]">
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{isEn ? "Final Unit Price" : "سعر الوحدة النهائي"}</p>
              <p className="mt-0.5 text-[20px] font-black text-[#082555] leading-none">{fmtNum(unitPrice)}</p>
              <p className="text-[9px] text-[#d4a843] font-bold mt-0.5">{c.currency} / {item.unit}</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 text-right border border-[#E2D8C4]">
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{isEn ? "Total Quote" : "إجمالي العرض"}</p>
              <p className="mt-0.5 text-[20px] font-black text-[#082555] leading-none">{fmtNum(finalTotal)}</p>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{c.currency}</p>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-white rounded-xl px-3 py-2 border border-[#E2D8C4]">
            <h3 className="text-[10px] font-black text-[#082555] text-right mb-0.5">{isEn ? "Cost Breakdown" : "تفصيل التكلفة"}</h3>
            <Row label={isEn ? "Materials" : "مواد"} val={matT} />
            <Row label={isEn ? "Labour" : "عمالة"} val={labT} />
            <Row label={isEn ? "Equipment" : "معدات"} val={eqpT} />
            <Row label={isEn ? "Direct Total" : "إجمالي مباشر"} val={direct} bold />
            <Row label={isEn ? `Overhead (${overhead}%)` : `أعباء غير مباشرة (${overhead}%)`} val={indirect} />
            <Row label={isEn ? `Profit Margin (${profit}%)` : `هامش الربح (${profit}%)`} val={profitAmt} />
          </div>

          {/* Settings row */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { l: "الكمية", v: fmtNum(q) },
              { l: "Factor", v: f },
              { l: "Overhead", v: `${overhead}%` },
              { l: "Profit", v: `${profit}%` },
            ].map(({ l, v }) => (
              <div key={l} className="bg-white border border-[#E2D8C4] rounded-lg p-1.5 text-center">
                <p className="text-[7px] text-slate-400 font-bold">{l}</p>
                <p className="text-[11px] font-black text-[#082555]">{v}</p>
              </div>
            ))}
          </div>

          {/* Resources */}
          {["مواد", "عمالة", "معدات"].map((type) => {
            const rows = resourcesList.filter((r) => r.type === type);
            if (!rows.length) return null;
            return (
              <div key={type} className="bg-white rounded-xl border border-[#E2D8C4] overflow-hidden">
                <div className="px-3 py-1 bg-[#082555]">
                  <h4 className="text-[10px] font-black text-[#d4a843]">{type}</h4>
                </div>
                <div className="divide-y divide-[#E2D8C4]">
                  {rows.map((r, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-black text-[#082555] shrink-0">{fmtNum(r.total)} {c.currency}</p>
                      <div className="text-right flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#082555] truncate">{r.name}</p>
                        <p className="text-[8px] text-slate-400">{fmtNum(r.qty)} {r.unit} × {fmtNum(r.rate)} {c.currency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <p className="text-center text-[8px] text-slate-300 pt-1">TASEERA · PRICING INTELLIGENCE</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display:none!important; }
          body { background:#F7F3EC; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          @page { size: auto; margin: 8mm; }
        }
      `}</style>
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const show = useCallback((text) => {
    setMsg(text);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);
  return { msg, visible, show };
}

function getCurrencySymbol(countryCode) {
  return COUNTRIES[countryCode]?.currency || CURRENCY_INFO[countryCode]?.symbol || CURRENCY_INFO.sa.symbol;
}

function Flag({ code, mini = false }) {
  const h = mini ? "h-3.5" : "h-[34px]";
  const w = mini ? "w-5" : "w-12";
  const base = `${w} ${h} rounded overflow-hidden flex-shrink-0 shadow`;
  if (code === "eg")
    return (
      <div className={base}>
        <div className="h-1/3 w-full bg-[#ce1126]" />
        <div className="h-1/3 w-full bg-white" />
        <div className="h-1/3 w-full bg-black" />
      </div>
    );
  if (code === "sa")
    return (
      <div className={`${base} bg-[#006c35] items-center justify-center flex`}>
        <span style={{ fontSize: mini ? "6px" : "10px", color: "#fff" }}>⚔</span>
      </div>
    );
  if (code === "ae")
    return (
      <div className={`${base} flex`}>
        <div className="w-[22%] bg-[#ef3340]" />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-[#009a44]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-black" />
        </div>
      </div>
    );
  return <div className={`${base} bg-gray-200 flex items-center justify-center text-[8px]`}>{code.toUpperCase()}</div>;
}

function CountryModal({ onConfirm, current, language = "ar" }) {
  const [sel, setSel] = useState(current || "sa");
  const isEn = language === "en";
  const countries = [
    { code: "sa", name: isEn ? "Saudi Arabia" : "المملكة العربية السعودية", currency: "SAR", icon: "🇸🇦" },
    { code: "eg", name: isEn ? "Egypt" : "جمهورية مصر العربية", currency: "EGP", icon: "🇪🇬" },
    { code: "ae", name: isEn ? "United Arab Emirates" : "الإمارات العربية المتحدة", currency: "AED", icon: "🇦🇪" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d2545]/80 backdrop-blur-md p-6">
      <div className="w-full max-w-[420px] animate-in zoom-in-95 duration-300">
        <div className="rounded-[32px] border border-white/10 bg-white p-6 sm:p-8 shadow-2xl">
          <h2 className="mb-6 text-center text-[20px] font-black text-[#0d2545]" style={{ fontFamily: AR }}>{isEn ? "Change Pricing Country" : "تغيير دولة التسعير"}</h2>

          <div className="space-y-3">
            {countries.map((c) => (
              <button key={c.code} type="button" onClick={() => setSel(c.code)}
                className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300 ${
                  sel === c.code
                    ? "border-[#d4a843] bg-[#d4a843]/5"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${sel === c.code ? "border-[#d4a843] bg-[#d4a843]" : "border-gray-300 bg-white"}`}>
                  {sel === c.code && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="flex flex-1 flex-col items-start">
                  <span className={`text-[15px] font-bold transition-colors ${sel === c.code ? "text-[#0d2545]" : "text-gray-600"}`} style={{ fontFamily: AR }}>{c.name}</span>
                  <span className="text-[11px] font-medium text-gray-400">{c.currency}</span>
                </div>
                <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                   <Flag code={c.code} mini={false} />
                </div>
              </button>
            ))}
          </div>

          <button onClick={() => onConfirm(sel)}
            className="mt-8 w-full rounded-2xl bg-[#0d2545] py-4 text-[16px] font-black text-white shadow-xl shadow-[#0d2545]/20 transition-all hover:bg-[#1a3a63] active:scale-[0.98]">
            {isEn ? "Confirm Selection" : "تأكيد الاختيار"}
          </button>

          <button onClick={() => onConfirm(current)} className="mt-3 w-full py-2 text-[14px] font-bold text-gray-400 hover:text-gray-600">{isEn ? "Cancel" : "إلغاء"}</button>
        </div>
      </div>
    </div>
  );
}

// --- Mode Selection Screen ---
/* ── Decorative SVG backgrounds ───────────────────────────────────────────── */
function BlueprintBg() {
  return (
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
      {/* floor plan lines */}
      <g stroke="rgba(212,168,67,0.18)" strokeWidth="1.2" fill="none">
        <rect x="38%" y="12%" width="48%" height="76%" rx="2"/>
        <line x1="38%" y1="45%" x2="86%" y2="45%"/>
        <line x1="62%" y1="12%" x2="62%" y2="88%"/>
        <rect x="43%" y="17%" width="17%" height="25%" rx="1"/>
        <rect x="65%" y="17%" width="17%" height="25%" rx="1"/>
        <rect x="43%" y="52%" width="38%" height="30%" rx="1"/>
        <line x1="51%" y1="45%" x2="51%" y2="12%"/>
        {/* dimension arrows */}
        <line x1="38%" y1="96%" x2="86%" y2="96%"/>
        <line x1="31%" y1="12%" x2="31%" y2="88%"/>
        {/* circles */}
        <circle cx="41%" cy="11%" r="5" opacity="0.5"/>
        <circle cx="87%" cy="11%" r="5" opacity="0.5"/>
      </g>
      {/* dim text stubs */}
      <g fill="rgba(212,168,67,0.22)" fontSize="7" fontFamily="monospace">
        <text x="55%" y="99%">6000</text>
        <text x="27%" y="52%">4500</text>
        <text x="55%" y="94%">3000</text>
        <text x="55%" y="75%">5000</text>
      </g>
    </svg>
  );
}

function BuildingBg() {
  return (
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g stroke="rgba(15,36,68,0.18)" strokeWidth="1.4" fill="none">
        {/* main building body */}
        <rect x="22%" y="18%" width="52%" height="68%" rx="2"/>
        {/* floors */}
        {[32,46,60,74].map(y => <line key={y} x1="22%" y1={`${y}%`} x2="74%" y2={`${y}%`}/>)}
        {/* columns */}
        {[35,48,61].map(x => <line key={x} x1={`${x}%`} y1="18%" x2={`${x}%`} y2="86%"/>)}
        {/* windows */}
        {[20,34,48,62].map(y =>
          [25,39,53,65].map(x =>
            <rect key={`${x}-${y}`} x={`${x}%`} y={`${y}%`} width="8%" height="9%" rx="1" fill="rgba(15,36,68,0.08)"/>
          )
        )}
        {/* entrance */}
        <rect x="43%" y="72%" width="10%" height="14%" rx="1" fill="rgba(15,36,68,0.12)"/>
        {/* roof line */}
        <polyline points="18%,18% 48%,8% 78%,18%"/>
        {/* ground */}
        <line x1="15%" y1="86%" x2="85%" y2="86%"/>
      </g>
    </svg>
  );
}

function IsometricBg() {
  return (
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g stroke="rgba(99,102,241,0.22)" strokeWidth="1.3" fill="none">
        {/* isometric box top */}
        <polygon points="48%,10% 78%,25% 48%,40% 18%,25%" fill="rgba(99,102,241,0.07)"/>
        {/* left face */}
        <polygon points="18%,25% 48%,40% 48%,78% 18%,63%" fill="rgba(99,102,241,0.05)"/>
        {/* right face */}
        <polygon points="78%,25% 48%,40% 48%,78% 78%,63%" fill="rgba(99,102,241,0.09)"/>
        {/* inner grid lines on top */}
        <line x1="33%"  y1="17.5%" x2="63%"  y2="32.5%"/>
        <line x1="33%"  y1="25%"   x2="48%"  y2="17.5%"/>
        <line x1="63%"  y1="25%"   x2="78%"  y2="32.5%"/>
        {/* vertical edges */}
        <line x1="48%"  y1="40%"   x2="48%"  y2="78%"/>
        {/* small cube on top */}
        <polygon points="48%,2% 60%,8% 48%,14% 36%,8%" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)"/>
        <line x1="48%" y1="14%" x2="48%" y2="26%"/>
        <line x1="36%" y1="8%"  x2="36%" y2="20%"/>
        <line x1="60%" y1="8%"  x2="60%" y2="20%"/>
        {/* floor grid */}
        <line x1="15%" y1="80%" x2="85%" y2="80%" stroke="rgba(99,102,241,0.15)"/>
        <ellipse cx="48%" cy="80%" rx="33%" ry="6%" stroke="rgba(99,102,241,0.1)"/>
      </g>
    </svg>
  );
}

// ─── GUEST LOGIN MODAL (reusable) ──────────────────────────────────────────────
function GuestLoginModal({ open, onClose, onOpenAuthScreen, subtitle, language = "ar" }) {
  if (!open) return null;
  const isEn = language === "en";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-[24px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{
          background: "linear-gradient(160deg,#1a0505 0%,#2d0a0a 100%)",
          border: "1.5px solid rgba(220,38,38,0.5)",
          boxShadow: "0 0 40px rgba(220,38,38,0.3), 0 20px 60px rgba(0,0,0,0.5)",
        }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 text-center" style={{ fontFamily: AR, direction: "rtl" }}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(220,38,38,0.15)", border: "1.5px solid rgba(220,38,38,0.35)" }}>
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-[17px] font-black text-white mb-1">{isEn ? "Sign in required first" : "يجب تسجيل الدخول أولاً"}</h3>
          <p className="text-[12px] text-white/55 leading-relaxed">
            {subtitle || (isEn ? "Sign in or create a free account to continue." : "سجّل دخولك أو أنشئ حساباً مجانياً للمتابعة")}
          </p>
        </div>
        {/* Buttons */}
        <div className="px-5 pb-5 flex flex-col gap-2.5" style={{ fontFamily: AR, direction: "rtl" }}>
          <button type="button"
            onClick={() => { onClose(); onOpenAuthScreen?.("login"); }}
            className="w-full rounded-2xl py-3 text-[14px] font-black text-white transition-all active:scale-[0.97]"
            style={{ background: "linear-gradient(130deg,#dc2626,#ef4444)", boxShadow: "0 0 20px rgba(220,38,38,0.4), 0 4px 16px rgba(220,38,38,0.3)" }}>
            {isEn ? "Sign In" : "تسجيل الدخول"}
          </button>
          <button type="button"
            onClick={() => { onClose(); onOpenAuthScreen?.("register"); }}
            className="w-full rounded-2xl py-3 text-[14px] font-black transition-all active:scale-[0.97]"
            style={{ background: "rgba(220,38,38,0.12)", border: "1.5px solid rgba(220,38,38,0.35)", color: "#fca5a5" }}>
            {isEn ? "Create Account" : "إنشاء حساب جديد"}
          </button>
          <button type="button" onClick={onClose}
            className="w-full rounded-2xl py-2.5 text-[12px] font-bold text-white/40 transition-all active:scale-[0.97]">
            {isEn ? "Cancel" : "إلغاء"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeSelection({ onSelect, areaLocked = false, areaMessage = "", onOpenFullAccess, language = "ar" }) {
  const isEn = language === "en";
  return (
    <div className="flex flex-col gap-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: AR }}>

      {/* Header */}
      <div className="px-1">
        <h2 className="text-[18px] font-bold text-[#0d2545]" style={{ fontFamily: AR }}>{isEn ? "Welcome to the Pricing Engine" : "مرحباً بك في محرك التسعير"}</h2>
        <p className="mt-0.5 text-[13px] text-slate-500" style={{ fontFamily: AR }}>{isEn ? "Choose the pricing method that fits your need." : "اختر طريقة التسعير المناسبة لاحتياجك"}</p>
      </div>

      {/* ── Card 1: دليل بنود الأعمال (navy) ── */}
      <button
        onClick={() => onSelect("items")}
        className="group relative overflow-hidden rounded-[22px] active:scale-[0.98] transition-transform duration-150"
        style={{ background: "linear-gradient(130deg,#0d2545 0%,#162e52 60%,#1a3870 100%)", minHeight: 120 }}
      >
        <BlueprintBg />
        <div className="relative flex items-center gap-4 px-5 py-6">
          {/* Arrow circle */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition-all group-hover:bg-[#d4a843]/20 group-hover:ring-[#d4a843]/50">
            <ChevronLeftIcon className="h-5 w-5 text-white/60 group-hover:text-[#d4a843] transition-colors" />
          </div>
          {/* Text */}
          <div className="flex-1 text-right">
            <h3 className="text-[18px] font-bold text-white leading-tight">{isEn ? "Work Items Directory" : "دليل بنود الأعمال"}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white">
              {isEn ? "Detailed analysis for each item (materials, labour, equipment) based on CSI MasterFormat codes." : "تحليل مفصل لكل بند (مواد، عمالة، معدات) بناءً على أكواد CSI MasterFormat."}<br/>{isEn ? "Ideal for contractors and engineers." : "مثالي للمقاولين والمهندسين."}
            </p>
          </div>
          {/* Icon box */}
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl ring-1 ring-[#d4a843]/40"
            style={{ background: "linear-gradient(145deg,#1e3d72,#0d2545)", boxShadow: "inset 0 1px 0 rgba(212,168,67,0.2), 0 4px 16px rgba(0,0,0,0.3)" }}>
            <PricingIcon className="h-8 w-8 text-[#d4a843]" />
          </div>
        </div>
      </button>

      {/* ── Card 2: تسعير مبني (gold) ── */}
      <button
        onClick={() => onSelect("area")}
        className="group relative overflow-hidden rounded-[22px] active:scale-[0.98] transition-transform duration-150"
        style={{ background: "linear-gradient(130deg,#c8941a 0%,#d4a843 45%,#e8c060 100%)", minHeight: 120 }}
      >
        <BuildingBg />
        <div className="relative flex items-center gap-4 px-5 py-6">
          {/* Arrow circle */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-[#0d2545]/20 transition-all group-hover:ring-[#0d2545]/40"
            style={{ background: "rgba(13,37,69,0.15)" }}>
            <ChevronLeftIcon className="h-5 w-5 text-[#0d2545]/70 group-hover:text-[#0d2545] transition-colors" />
          </div>
          {/* Text */}
          <div className="flex-1 text-right">
            <h3 className="text-[20px] font-black text-[#0d2545] leading-tight">{isEn ? "Building Pricing" : "تسعير مبني"}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white">
              {isEn ? "A quick cost estimate for a full building based on area, number of floors," : "حساب تقديري سريع لتكلفة بناء كامل بناءً على المساحة، عدد الأدوار،"}<br/>{isEn ? "and finish level. Ideal for owners and investors." : "ومستوى التشطيب. مثالي للملاك والمستثمرين."}
            </p>
          </div>
          {/* Icon box */}
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl ring-1 ring-[#0d2545]/20"
            style={{ background: "linear-gradient(145deg,#b8821a,#8a5e10)", boxShadow: "inset 0 1px 0 rgba(255,220,100,0.3), 0 4px 16px rgba(0,0,0,0.2)" }}>
            <BuildingsIcon className="h-8 w-8 text-[#f5d060]" />
          </div>
        </div>
      </button>

      {/* ── Card 3: تسعير تفصيلي للبنود (purple) ── */}
      <button
        onClick={() => onSelect("candy")}
        className="group relative overflow-hidden rounded-[22px] active:scale-[0.98] transition-transform duration-150"
        style={{ background: "linear-gradient(130deg,#3730a3 0%,#4f46e5 55%,#6d28d9 100%)", minHeight: 120 }}
      >
        <IsometricBg />
        <div className="relative flex items-center gap-4 px-5 py-6">
          {/* Arrow circle */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-[#6366f1]/25 transition-all group-hover:bg-[#6366f1]/10 group-hover:ring-[#6366f1]/50"
            style={{ background: "rgba(99,102,241,0.08)" }}>
            <ChevronLeftIcon className="h-5 w-5 text-[#6366f1]/50 group-hover:text-[#6366f1] transition-colors" />
          </div>
          {/* Text — same structure as cards 1 & 2 so title aligns identically */}
          <div className="flex-1 text-right">
            <h3 className="text-[18px] font-black text-white leading-tight">{isEn ? "Detailed Item Pricing" : "تسعير تفصيلي للبنود"}</h3>
            <span className="inline-flex mt-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white"
              style={{ background: "#4f46e5", fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.05em" }}>
              RESOURCE-BASED
            </span>
            <p className="mt-1 text-[15px] leading-relaxed text-white">
              {isEn ? "Build the unit rate from resources — materials + labour + equipment + overhead + profit." : "بناء سعر الوحدة من الموارد — مواد + عمالة + معدات + أعباء + ربح."}<br/>{isEn ? "Advanced First Principle method for quantity surveying analysis." : "أسلوب First Principle المتقدم لتحليل المقايسات."}
            </p>
          </div>
          {/* Icon box */}
          <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl text-[28px] ring-1 ring-[#6366f1]/30"
            style={{ background: "linear-gradient(145deg,#4f46e5,#7c3aed)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(79,70,229,0.35)" }}>
            🧮
          </div>
        </div>
      </button>

      <p className="text-center text-[11px] text-slate-400 mt-1" style={{ fontFamily: AR }}>
        {isEn ? "All calculations are indicative and based on current market averages in the selected country." : "جميع الحسابات تقديرية وتعتمد على متوسطات السوق الحالية في الدولة المختارة."}
      </p>
    </div>
  );
}

// --- Area Pricing Components ---

const FINISH_LEVELS = [
  { id: "economic", ar: "اقتصادي", icon: "🪙", desc: "مواد أساسية جودة مقبولة" },
  { id: "medium", ar: "متوسط", icon: "🏠", desc: "جودة معيارية متوازنة" },
  { id: "good", ar: "جيد", icon: "✨", desc: "تشطيبات راقية وماركات معروفة" },
  { id: "luxury", ar: "فاخر", icon: "💎", desc: "مواد مستوردة وتصاميم خاصة" },
  { id: "ultra", ar: "فاخر جدًا", icon: "👑", desc: "أعلى معايير الرفاهية والذكاء" },
];

const BUILDING_TYPES = [
  { id: "residential", ar: "سكني (شقق)", icon: "🏢" },
  { id: "villa", ar: "فيلا مستقرة", icon: "🏡" },
  { id: "commercial", ar: "تجاري (محلات)", icon: "🛍️" },
  { id: "office", ar: "مكاتب إدارية", icon: "💼" },
  { id: "industrial", ar: "مستودع / صناعي", icon: "🏭" },
];

const SCOPES = [
  { id: "structural", ar: "أعمال إنشائية فقط (عظم)", icon: "🏗️" },
  { id: "civ_arch", ar: "إنشائي + معماري (أسود)", icon: "🧱" },
  { id: "full", ar: "تسعير شامل (مفتاح)", icon: "🔑" },
];

const AREA_SECTION_TEMPLATES = {
  structural: {
    title: "تفصيل الأعمال الإنشائية",
    icon: "🏗️",
    color: "#C9A84C",
    intro: "تقسيم استرشادي بنظام Work Breakdown للأعمال الإنشائية، مرتبط بمسطح الدور وعدد الأدوار وعناصر الخرسانة الأساسية.",
    assumptions: [
      "الكميات تقريبية لمبنى منخفض أو متوسط الارتفاع بنظام خرسانة مسلحة تقليدي.",
      "الأساسات والعناصر الرأسية والبلاطات محسوبة كمخصصات أولية قبل المخططات التنفيذية.",
      "يمكن تعديل الكميات أو الأسعار يدويًا لتقريبها من الحالة الفعلية للمشروع.",
    ],
    items: [
      { id: "excavation", label: "الحفر والردم والدمك", unit: "م³", share: 0.10, qtyFormula: ({ footprint, floors }) => footprint * 0.32 + floors * 18, basis: "حجم أعمال التربة التقريبي" },
      { id: "blinding", label: "خرسانة عادية وطبقات نظافة", unit: "م³", share: 0.08, qtyFormula: ({ footprint }) => footprint * 0.08, basis: "فرشة أسفل القواعد والميدات" },
      { id: "foundations", label: "القواعد والميدات المسلحة", unit: "م³", share: 0.21, qtyFormula: ({ footprint, floors }) => footprint * (0.16 + floors * 0.01), basis: "قواعد وميدات مرتبطة بعدد الأدوار" },
      { id: "vertical", label: "الأعمدة وجدران القص", unit: "م³", share: 0.18, qtyFormula: ({ totalArea, floors }) => totalArea * 0.07 + floors * 4.5, basis: "عناصر رأسية خرسانية" },
      { id: "slabs", label: "الكمرات والبلاطات", unit: "م³", share: 0.28, qtyFormula: ({ totalArea }) => totalArea * 0.18, basis: "هيكل أفقي لكل المسطحات" },
      { id: "stairs", label: "السلالم وغرفة السطح والعزل الإنشائي", unit: "بند", share: 0.15, qtyFormula: ({ floors }) => Math.max(1, floors), basis: "سلالم وربط أفقي ورأسي" },
    ],
  },
  architectural: {
    title: "تفصيل الأعمال المعمارية",
    icon: "🧱",
    color: "#5A4E38",
    intro: "تقسيم تشطيبات ومعماري تقديري يغطي القواطع واللياسة والأرضيات والدهانات والفتحات وفق المساحات الداخلية والخارجية للمبنى.",
    assumptions: [
      "التوزيع يفترض تشطيبًا سكنيًا أو إداريًا قياسيًا دون واجهات خاصة أو مواد فائقة الفخامة.",
      "البنود أدناه لا تشمل تغييرات تصميمية خاصة أو فراغات عالية الارتفاع.",
      "يمكن استخدام الصفحة لمراجعة أثر رفع جودة أي بند على التكلفة النهائية.",
    ],
    items: [
      { id: "masonry", label: "المباني والقواطع", unit: "م²", share: 0.18, qtyFormula: ({ totalArea, floors }) => totalArea * 1.45 + floors * 35, basis: "أسطح حوائط وقواطع داخلية" },
      { id: "plaster", label: "اللياسة والمعالجة", unit: "م²", share: 0.17, qtyFormula: ({ totalArea }) => totalArea * 2.10, basis: "وجهين للحائط تقريبًا" },
      { id: "flooring", label: "الأرضيات والوزرات", unit: "م²", share: 0.22, qtyFormula: ({ totalArea }) => totalArea * 1.05, basis: "جميع المسطحات الصالحة للتشطيب" },
      { id: "ceilings", label: "الأسقف المستعارة والجبس", unit: "م²", share: 0.10, qtyFormula: ({ totalArea, finishFactor }) => totalArea * 0.55 * finishFactor, basis: "نسبة من المساحات المغطاة" },
      { id: "paint", label: "الدهانات والطلاءات", unit: "م²", share: 0.15, qtyFormula: ({ totalArea }) => totalArea * 2.30, basis: "حوائط وأسقف داخلية" },
      { id: "openings", label: "الأبواب والشبابيك والواجهات", unit: "بند", share: 0.18, qtyFormula: ({ floors }) => Math.max(4, floors * 6), basis: "حزمة فتحات معمارية" },
    ],
  },
  electrical: {
    title: "تفصيل الأعمال الكهربائية",
    icon: "⚡",
    color: "#E07B2A",
    intro: "تقسيم أولي للأعمال الكهربائية يشمل مسارات وتمديدات وقدرة إنارة وقوى ولوحات وأنظمة خفيفة للمشروع.",
    assumptions: [
      "يعتمد التقدير على توزيع أحمال تقريبي لمبنى سكني/إداري قياسي.",
      "قد ترتفع التكلفة الفعلية مع زيادة الأحمال الخاصة أو الأنظمة الذكية أو متطلبات شركة الكهرباء.",
      "يمكن تعديل الأسعار لتناسب عروض الموردين أو مستوى التشطيب الكهربائي المطلوب.",
    ],
    items: [
      { id: "conduits", label: "مواسير وتمديدات مخفية", unit: "م.ط", share: 0.18, qtyFormula: ({ totalArea, floors }) => totalArea * 3.6 + floors * 55, basis: "شبكة تمديدات أساسية" },
      { id: "wiring", label: "أسلاك وكابلات القوى والإنارة", unit: "م.ط", share: 0.24, qtyFormula: ({ totalArea, floors }) => totalArea * 5.4 + floors * 70, basis: "أطوال كابلات تقريبية" },
      { id: "fixtures", label: "وحدات الإنارة والمفاتيح والأباريز", unit: "نقطة", share: 0.20, qtyFormula: ({ totalArea, typeFactor }) => (totalArea / 12) * typeFactor, basis: "نقاط كهربائية لكل مساحة استخدام" },
      { id: "panels", label: "اللوحات والقواطع الرئيسية", unit: "بند", share: 0.16, qtyFormula: ({ floors }) => Math.max(1, Math.ceil(floors / 2) + 1), basis: "لوحات فرعية ورئيسية" },
      { id: "lowcurrent", label: "التيار الخفيف والإنذار", unit: "نقطة", share: 0.10, qtyFormula: ({ totalArea }) => totalArea / 18, basis: "إنذار/داتا/اتصالات" },
      { id: "earthing", label: "التأريض والحماية الخارجية", unit: "بند", share: 0.12, qtyFormula: ({ floors }) => Math.max(1, floors), basis: "حزمة حماية وتأريض" },
    ],
  },
  mechanical: {
    title: "تفصيل الأعمال الميكانيكية",
    icon: "🔧",
    color: "#6FCF97",
    intro: "تقسيم أولي لأعمال السباكة والصرف والتكييف والتهوية والمضخات والخزانات وفق مساحة المبنى وعدد الأدوار.",
    assumptions: [
      "الأرقام استرشادية لمرحلة دراسة الجدوى ولا تغني عن مخططات MEP التنفيذية.",
      "كلما زادت غرف الخدمات أو متطلبات HVAC الخاصة ارتفعت كلفة هذا القسم.",
      "التعديلات هنا تبقى داخل جلسة العمل الحالية لتجربة السيناريوهات المختلفة.",
    ],
    items: [
      { id: "plumbing", label: "شبكات التغذية والصرف", unit: "م.ط", share: 0.25, qtyFormula: ({ totalArea, floors }) => totalArea * 2.1 + floors * 45, basis: "شبكات مياه وصرف داخلية" },
      { id: "fixtures", label: "الأدوات الصحية والاكسسوارات", unit: "مجموعة", share: 0.14, qtyFormula: ({ floors, typeFactor }) => Math.max(2, floors * 2 * typeFactor), basis: "حمامات ومناطق خدمة" },
      { id: "hvac", label: "معدات التكييف الرئيسية", unit: "طن تبريد مكافئ", share: 0.28, qtyFormula: ({ totalArea, finishFactor }) => (totalArea / 22) * finishFactor, basis: "قدرة تكييف تقديرية" },
      { id: "ducting", label: "مجاري الهواء والعزل", unit: "م²", share: 0.16, qtyFormula: ({ totalArea }) => totalArea * 0.65, basis: "نسبة من المساحات المكيفة" },
      { id: "pumps", label: "مضخات وخزانات وتجهيزات ميكانيكية", unit: "بند", share: 0.09, qtyFormula: ({ floors }) => Math.max(1, Math.ceil(floors / 2)), basis: "مضخات وخزانات" },
      { id: "fire", label: "مكافحة الحريق والتهوية المساندة", unit: "نقطة", share: 0.08, qtyFormula: ({ totalArea }) => totalArea / 28, basis: "رشاشات/مخارج/ملحقات" },
    ],
  },
};

function roundTo(n, digits = 2) {
  const value = Number(n) || 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function recalculateAreaSectionDraft(draft, params) {
  const sectionTotal = roundTo((draft.items || []).reduce((sum, item) => sum + (Number(item.total) || 0), 0));
  const totalArea = (Number(params?.area) || 0) * (Number(params?.floors) || 0);
  return {
    ...draft,
    sectionTotal,
    unitPrice: totalArea > 0 ? roundTo(sectionTotal / totalArea) : sectionTotal,
  };
}

function buildAreaSectionDraft(sectionId, params, results) {
  const template = AREA_SECTION_TEMPLATES[sectionId];
  if (!template || !results) return null;

  const totalArea = (Number(params?.area) || 0) * (Number(params?.floors) || 0);
  const footprint = Number(params?.area) || 0;
  const floors = Number(params?.floors) || 1;
  const finishFactorMap = { economic: 0.9, medium: 1, good: 1.08, luxury: 1.18, ultra: 1.3 };
  const typeFactorMap = { residential: 1, villa: 1.1, commercial: 1.15, office: 1.05, industrial: 0.9 };
  const finishFactor = finishFactorMap[params?.finish] || 1;
  const typeFactor = typeFactorMap[params?.type] || 1;
  const sectionTotal = Number(results?.breakdown?.[sectionId]) || 0;

  const items = template.items.map((item) => {
    const qty = Math.max(0.1, roundTo(item.qtyFormula({ totalArea, footprint, floors, finishFactor, typeFactor })));
    const total = roundTo(sectionTotal * item.share);
    const rate = qty > 0 ? roundTo(total / qty) : total;
    return {
      id: item.id,
      label: item.label,
      unit: item.unit,
      basis: item.basis,
      qty,
      rate,
      total,
      share: item.share,
    };
  });

  return recalculateAreaSectionDraft({
    sectionId,
    title: template.title,
    icon: template.icon,
    color: template.color,
    intro: template.intro,
    assumptions: template.assumptions,
    items,
  }, params);
}

function BuildingEstimatorGraphic({ country, area, floors, finish, type, scope }) {
  const config = AREA_PRICING_BASE[country] || AREA_PRICING_BASE.sa;
  const numericArea = Math.max(0, Number(area) || 0);
  const numericFloors = Math.max(1, Number(floors) || 1);
  const totalArea = numericArea * numericFloors;
  const finishFactor = config.finishFactors?.[finish] || 1;
  const typeFactor = config.typeFactors?.[type] || 1;
  const previewUnit = roundTo(config.baseRate * finishFactor * typeFactor);
  const previewTotal = roundTo(previewUnit * totalArea);
  const scopeLabel = SCOPES.find((item) => item.id === scope)?.ar || "تسعير المبنى";
  const finishLabel = FINISH_LEVELS.find((item) => item.id === finish)?.ar || "متوسط";
  const typeLabel = BUILDING_TYPES.find((item) => item.id === type)?.ar || "سكني";
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#C9A84C]/20 bg-[#082555] p-4 shadow-2xl sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.18),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,rgba(201,168,76,0.06),transparent)] pointer-events-none" />

      <div className="relative mx-auto max-w-[720px] space-y-4 text-right">
        <div>
          <div className="text-[20px] font-bold leading-tight text-white sm:text-[23px]" style={{ fontFamily: AR }}>
            {typeLabel}
          </div>
          <div className="mt-1 text-[11px] font-bold leading-relaxed text-[#9A8A6A] sm:text-[12px]" style={{ fontFamily: AR }}>
            {scopeLabel} · تشطيب {finishLabel}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "الدور", value: `${fmtNum(numericArea)} م²` },
            { label: "الأدوار", value: fmtNum(numericFloors) },
            { label: "الإجمالي", value: `${fmtNum(totalArea)} م²` },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5 text-center sm:px-3 sm:py-3">
              <div className="mb-1 text-[8px] font-bold uppercase tracking-wide text-[#9A8A6A] sm:text-[9px]">{card.label}</div>
              <div className="text-[11px] font-bold text-white sm:text-[13px]" style={{ fontFamily: MONO }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-3">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#9A8A6A] sm:text-[10px]">Preview Range</div>
          <div className="flex flex-wrap items-end justify-end gap-x-2 gap-y-1">
            <div className="text-[22px] font-bold leading-none text-[#E8C97A] sm:text-[26px]" style={{ fontFamily: MONO }}>{fmtNum(previewTotal)}</div>
            <div className="pb-1 text-[10px] font-bold text-[#9A8A6A] sm:text-[11px]">{COUNTRIES[country]?.currency}</div>
          </div>
          <div className="mt-2 text-[10px] font-bold text-white/70 sm:text-[11px]" style={{ fontFamily: AR }}>
            سعر متر تقديري {fmtNum(previewUnit)} {COUNTRIES[country]?.currency}
          </div>
        </div>
      </div>
    </div>
  );
}

function CostDistributionGraphic({ sections, total, currency }) {
  if (!sections?.length || !total) return null;

  return (
    <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>الجرافيك التوزيعي للتكلفة</h3>
          <p className="mt-1 text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
            رؤية بصرية سريعة توضح وزن كل تخصص داخل تكلفة المبنى الحالية
          </p>
        </div>
        <div className="rounded-2xl bg-[#F7F3EC] px-3 py-2 text-left">
          <div className="text-[10px] font-bold text-[#9A8A6A] uppercase">Total Mix</div>
          <div className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(total)} {currency}</div>
        </div>
      </div>

      <div className="mb-5 h-5 overflow-hidden rounded-full bg-[#F7F3EC]">
        <div className="flex h-full w-full">
          {sections.map((section) => (
            <div
              key={section.id}
              className="h-full transition-all duration-700"
              style={{ width: `${Math.max(6, section.pct * 100)}%`, backgroundColor: section.color }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${section.color}20`, color: section.color }}>
                  {section.icon}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{section.label}</div>
                  <div className="text-[10px] font-bold text-[#9A8A6A]">{(section.pct * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(section.value)}</div>
                <div className="text-[9px] font-bold text-[#9A8A6A]">{currency}</div>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#EFE8D9]">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${section.pct * 100}%`, backgroundColor: section.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionDetailGraphic({ draft, totalArea, overallShare, currency }) {
  if (!draft?.items?.length) return null;

  const maxItemTotal = Math.max(...draft.items.map((item) => Number(item.total) || 0), 1);

  return (
    <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>جرافيك توزيع بنود التخصص</h3>
          <p className="mt-1 text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
            قراءة سريعة لأثقل البنود داخل هذا التخصص وتأثيرها على إجمالي المسطح
          </p>
        </div>
        <div className="rounded-2xl px-3 py-2 text-left" style={{ backgroundColor: `${draft.color}12` }}>
          <div className="text-[10px] font-bold text-[#9A8A6A] uppercase">Share</div>
          <div className="text-[16px] font-bold" style={{ fontFamily: MONO, color: draft.color }}>{overallShare.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "إجمالي التخصص", value: `${fmtNum(draft.sectionTotal)} ${currency}` },
          { label: "متوسط / م²", value: `${fmtNum(draft.unitPrice)} ${currency}` },
          { label: "المساحة المرجعية", value: `${fmtNum(totalArea)} م²` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 text-center">
            <div className="mb-1 text-[10px] font-bold text-[#9A8A6A] uppercase">{card.label}</div>
            <div className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-[#E2D8C4] bg-[linear-gradient(180deg,#fcfbf8_0%,#f7f3ec_100%)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#082555]" style={{ fontFamily: AR }}>أثقل البنود تكلفة</span>
          <span className="text-[10px] font-bold text-[#9A8A6A]">Top Cost Drivers</span>
        </div>

        <div className="flex h-[150px] items-end justify-between gap-3">
          {draft.items.map((item) => {
            const ratio = ((Number(item.total) || 0) / maxItemTotal) * 100;
            return (
              <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                  {fmtNum(item.total)}
                </div>
                <div className="flex h-[92px] w-full items-end justify-center rounded-t-[18px] border border-white/60 px-1.5 pb-2 shadow-inner" style={{ background: `linear-gradient(180deg, ${draft.color}22 0%, ${draft.color}80 100%)` }}>
                  <div
                    className="w-full rounded-t-[14px] transition-all duration-700"
                    style={{ height: `${Math.max(18, ratio)}%`, backgroundColor: draft.color }}
                  />
                </div>
                <div className="line-clamp-2 text-center text-[10px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryInsightGraphic({ savedAnalyses }) {
  if (!savedAnalyses?.length) return null;

  const areaCount = savedAnalyses.filter((item) => item.mode === "area").length;
  const itemCount = savedAnalyses.filter((item) => item.mode !== "area").length;
  const latest = savedAnalyses[0];
  const latestTotal = latest?.projectTotal || latest?.results?.finalTotal || latest?.results?.total || 0;
  const latestUnit = latest?.finalUnitPrice || latest?.results?.unitPrice || 0;
  const totalCount = Math.max(savedAnalyses.length, 1);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#082555] p-5 shadow-xl border border-[#C9A84C]/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.16),transparent_38%)] pointer-events-none" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A8A6A]">History Overview</div>
            <div className="mt-1 text-[18px] font-bold text-white" style={{ fontFamily: AR }}>نظرة سريعة على السجل</div>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2 text-left">
            <div className="text-[9px] font-bold text-[#9A8A6A] uppercase">Latest Total</div>
            <div className="text-[16px] font-bold text-[#E8C97A]" style={{ fontFamily: MONO }}>{fmtNum(latestTotal)}</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "الكل", value: savedAnalyses.length, color: "#E8C97A" },
            { label: "مباني", value: areaCount, color: "#6FCF97" },
            { label: "بنود", value: itemCount, color: "#E07B2A" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="mb-1 text-[10px] font-bold text-[#9A8A6A] uppercase">{card.label}</div>
              <div className="text-[18px] font-bold" style={{ fontFamily: MONO, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="flex h-full">
            <div className="h-full" style={{ width: `${(areaCount / totalCount) * 100}%`, backgroundColor: "#6FCF97" }} />
            <div className="h-full" style={{ width: `${(itemCount / totalCount) * 100}%`, backgroundColor: "#E07B2A" }} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <div className="text-[10px] font-bold text-[#9A8A6A] uppercase">Latest Unit Price</div>
            <div className="text-[15px] font-bold text-white" style={{ fontFamily: MONO }}>{fmtNum(latestUnit)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#9A8A6A] uppercase">Last Analysis</div>
            <div className="text-[13px] font-bold text-[#E8C97A]" style={{ fontFamily: AR }}>
              {latest?.mode === "area" ? "تسعير مبنى" : "تحليل بند"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AreaScenarioCompare({ scenarios, currentScenario, suggestedScenario, currency, onAddCurrent, onRemove }) {
  const mergedScenarios = [
    ...(currentScenario ? [{ ...currentScenario, id: "__current__", live: true }] : []),
    ...(suggestedScenario ? [{ ...suggestedScenario, id: "__suggested__", suggested: true }] : []),
    ...scenarios,
  ];

  if (!mergedScenarios.length) return null;

  const minTotal = Math.min(...mergedScenarios.map((scenario) => scenario.total || 0));

  return (
    <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>مقارنة السيناريوهات</h3>
          <p className="mt-1 text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
            قارن بين بدائل المبنى الحالية قبل النزول للتفاصيل
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCurrent}
          disabled={!currentScenario || scenarios.length >= 3}
          className="rounded-2xl bg-[#082555] px-4 py-2 text-[12px] font-bold text-[#C9A84C] disabled:opacity-40"
        >
          إضافة السيناريو الحالي
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {mergedScenarios.map((scenario, index) => {
          const isBest = (scenario.total || 0) === minTotal;
          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border p-4 text-right ${isBest ? "border-[#C9A84C] bg-[#F5EDD8]" : "border-[#E2D8C4] bg-[#FCFBF8]"}`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
                    {scenario.live ? "السيناريو الحالي" : scenario.suggested ? "سيناريو أعلى" : `سيناريو ${index}`}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                    {scenario.typeLabel} · {scenario.finishLabel}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {scenario.suggested && (
                    <span className="rounded-full bg-[#C9A84C] px-2 py-1 text-[10px] font-bold text-[#082555]">ترقية</span>
                  )}
                  {isBest && (
                    <span className="rounded-full bg-[#082555] px-2 py-1 text-[10px] font-bold text-[#C9A84C]">الأوفر</span>
                  )}
                  {!scenario.live && !scenario.suggested && (
                    <button type="button" onClick={() => onRemove(scenario.id)} className="text-[12px] font-bold text-[#9A8A6A]">
                      حذف
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/60 bg-white px-3 py-3">
                  <div className="text-[9px] font-bold text-[#9A8A6A] uppercase">Total</div>
                  <div className="mt-1 text-[16px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                    {fmtNum(scenario.total)}
                  </div>
                  <div className="text-[9px] font-bold text-[#9A8A6A]">{currency}</div>
                </div>
                <div className="rounded-xl border border-white/60 bg-white px-3 py-3">
                  <div className="text-[9px] font-bold text-[#9A8A6A] uppercase">Unit</div>
                  <div className="mt-1 text-[16px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                    {fmtNum(scenario.unitPrice)}
                  </div>
                  <div className="text-[9px] font-bold text-[#9A8A6A]">{currency}/م²</div>
                </div>
              </div>

              <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#EFE8D9]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${minTotal > 0 ? Math.min(100, ((scenario.total || 0) / minTotal) * 35 + 35) : 35}%`,
                    background: isBest ? "linear-gradient(90deg,#6FCF97 0%,#C9A84C 100%)" : "linear-gradient(90deg,#082555 0%,#C9A84C 100%)",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                {[
                  { label: "المسطح", value: `${fmtNum(scenario.totalArea)} م²` },
                  { label: "الأدوار", value: fmtNum(scenario.floors) },
                  { label: "النطاق", value: scenario.scopeLabel },
                ].map((meta) => (
                  <div key={meta.label} className="rounded-xl bg-white/70 px-2 py-2">
                    <div className="text-[9px] font-bold text-[#9A8A6A]">{meta.label}</div>
                    <div className="mt-1 text-[11px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{meta.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AreaPricingForm({ country, onCalculate, adBanner, canManageAds = false, onManageAds, onToggleAdVisibility, onRemoveAd }) {
  const [area, setArea] = useState(100);
  const [floors, setFloors] = useState(1);
  const [finish, setFinish] = useState("economic");
  const [type, setType] = useState("residential");
  const [scope, setScope] = useState("structural");

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <BuildingEstimatorGraphic
        country={country}
        area={area}
        floors={floors}
        finish={finish}
        type={type}
        scope={scope}
      />

      <div className="rounded-3xl bg-white border-2 border-[#E2D8C4] p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>مساحة الدور (م²)</label>
            <input type="number" value={area} onChange={(e) => setArea(e.target.value)}
              className="min-h-[52px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 text-center text-[18px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }} />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>عدد الأدوار</label>
            <input type="number" value={floors} onChange={(e) => setFloors(e.target.value)}
              className="min-h-[52px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 text-center text-[18px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }} />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>نوع المبنى</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BUILDING_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${type === t.id ? "border-[#C9A84C] bg-[#F5EDD8] font-bold" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-[13px]" style={{ fontFamily: AR }}>{t.ar}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>نطاق الأعمال</label>
          <div className="flex flex-col gap-2">
            {SCOPES.map((s) => (
              <button key={s.id} onClick={() => setScope(s.id)}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-right transition-all ${scope === s.id ? "border-[#C9A84C] bg-[#F5EDD8] font-bold" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}>
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="text-[14px] text-[#082555]" style={{ fontFamily: AR }}>{s.ar}</div>
                  <div className="mt-0.5 text-[10px] text-[#9A8A6A]">{s.desc}</div>
                </div>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${scope === s.id ? "border-[#C9A84C] bg-[#C9A84C] text-[#082555]" : "border-[#E2D8C4]"}`}>
                  {scope === s.id ? "✓" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>مستوى التشطيب</label>
          <div className="flex flex-col gap-2">
            {FINISH_LEVELS.map((f) => (
              <button key={f.id} onClick={() => setFinish(f.id)}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-right transition-all ${finish === f.id ? "border-[#C9A84C] bg-[#F5EDD8] font-bold" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}>
                <span className="text-2xl">{f.icon}</span>
                <div className="flex-1">
                  <div className="text-[14px] text-[#082555]" style={{ fontFamily: AR }}>{f.ar}</div>
                  <div className="mt-0.5 text-[10px] text-[#9A8A6A]">{f.desc}</div>
                </div>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${finish === f.id ? "border-[#C9A84C] bg-[#C9A84C] text-[#082555]" : "border-[#E2D8C4]"}`}>
                  {finish === f.id ? "✓" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onCalculate({ area, floors, finish, type, scope })}
          className="min-h-[60px] w-full rounded-2xl bg-[#082555] text-[#C9A84C] font-bold text-[17px] shadow-xl shadow-[#082555]/10 flex items-center justify-center gap-3 transition hover:bg-[#252018] active:scale-[0.98]"
          style={{ fontFamily: AR }}>
          <PricingIcon className="h-6 w-6" /> إظهار تفاصيل تسعير المبنى
        </button>
      </div>

      <AnalysisAdBanner
        adBanner={{ ...(adBanner || {}), slotId: AD_SLOT_IDS.areaFormAfterCard }}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
        onToggleVisibility={onToggleAdVisibility}
        onRemove={onRemoveAd}
      />
    </div>
  );
}

function AreaResultsView({ country, params, results, onBack, onExport, onSave, onOpenSection, scenarios, currentScenario, suggestedScenario, onAddScenario, onRemoveScenario, adBanner, canManageAds = false, onManageAds, onToggleAdVisibility, onRemoveAd }) {
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const finishLabel = FINISH_LEVELS.find(f => f.id === params.finish)?.ar;
  const typeLabel = BUILDING_TYPES.find(t => t.id === params.type)?.ar;

  const sections = [
    { id: 'structural', label: 'الأعمال الإنشاءية', icon: '🏗️', color: '#C9A84C', pct: results.dist.structural },
    { id: 'architectural', label: 'الأعمال المعمارية', icon: '🧱', color: '#5A4E38', pct: results.dist.architectural },
    { id: 'electrical', label: 'الأعمال الكهربائية', icon: '⚡', color: '#E07B2A', pct: results.dist.electrical },
    { id: 'mechanical', label: 'الأعمال الميكانيكية', icon: '🔧', color: '#6FCF97', pct: results.dist.mechanical },
  ].filter(s => results.breakdown[s.id] > 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between px-1">
         <button onClick={onBack} className="flex items-center gap-2 text-[14px] font-bold text-[#9A8A6A] hover:text-[#082555]">
           <ArrowRightIcon className="h-4 w-4" /> تعديل البيانات
         </button>
         <div className="flex gap-2">
            <button onClick={onExport} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-[#E2D8C4] text-[#082555] hover:border-[#C9A84C] transition-colors"><PrinterIcon className="h-5 w-5" /></button>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-[#E2D8C4] text-[#082555] hover:border-[#C9A84C] transition-colors"><ShareIcon className="h-5 w-5" /></button>
            <button onClick={onSave} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#082555] text-[#C9A84C] shadow-lg active:scale-95 transition-transform"><SaveIcon className="h-5 w-5" /></button>
         </div>
      </div>

      <div className="relative overflow-hidden rounded-[32px] bg-[#082555] p-8 shadow-2xl border border-[#C9A84C]/20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.15),transparent)] pointer-events-none" />

        <div className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-[0.3em] mb-4">Total Estimated Cost</div>
        <div className="flex items-center justify-center gap-3 mb-2">
           <span className="text-[42px] font-bold text-[#E8C97A] leading-none" style={{ fontFamily: MONO }}>{fmtNum(results.total)}</span>
           <span className="text-[18px] font-bold text-[#9A8A6A]">{c.currency}</span>
        </div>
        <div className="text-[14px] font-bold text-[#C9A84C]/80" style={{ fontFamily: AR }}>تكلفة تقديرية للمبنى بالكامل</div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 sm:gap-6">
           <div>
             <div className="text-[10px] text-[#9A8A6A] font-bold uppercase tracking-wider mb-1">Price Per m²</div>
             <div className="text-[20px] font-bold text-white" style={{ fontFamily: MONO }}>{fmtNum(results.unitPrice)} <span className="text-[12px] text-[#9A8A6A]">{c.currency}</span></div>
           </div>
           <div>
             <div className="text-[10px] text-[#9A8A6A] font-bold uppercase tracking-wider mb-1">Total Area</div>
             <div className="text-[20px] font-bold text-white" style={{ fontFamily: MONO }}>{params.area * params.floors} <span className="text-[12px] text-[#9A8A6A]">m²</span></div>
           </div>
        </div>
      </div>

      <CostDistributionGraphic
        sections={sections.map((section) => ({ ...section, value: results.breakdown[section.id] }))}
        total={results.total}
        currency={c.currency}
      />

      <div className="rounded-3xl bg-white border-2 border-[#E2D8C4] p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-[#082555] mb-6 flex items-center gap-2" style={{ fontFamily: AR }}>
          <div className="h-2 w-2 rounded-full bg-[#C9A84C]" /> ملخص المشروع
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          {[
            { label: 'المساحة الكلية', val: `${params.area * params.floors} م²` },
            { label: 'عدد الأدوار', val: params.floors },
            { label: 'نوع المبنى', val: typeLabel },
            { label: 'مستوى التشطيب', val: finishLabel },
          ].map(it => (
            <div key={it.label} className="space-y-1">
              <div className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-wider">{it.label}</div>
              <div className="text-[15px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{it.val}</div>
            </div>
          ))}
        </div>
      </div>

      <AreaScenarioCompare
        scenarios={scenarios}
        currentScenario={currentScenario}
        suggestedScenario={suggestedScenario}
        currency={c.currency}
        onAddCurrent={onAddScenario}
        onRemove={onRemoveScenario}
      />

      <div className="space-y-3">
        <h3 className="text-[16px] font-bold text-[#082555] px-1 mb-2" style={{ fontFamily: AR }}>تفاصيل التكلفة حسب التخصصات</h3>
        {sections.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => onOpenSection?.(s.id)}
            className="group w-full rounded-2xl bg-white border-2 border-[#E2D8C4] p-5 shadow-sm transition-all hover:border-[#C9A84C] text-right"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl bg-[#F7F3EC] group-hover:bg-[#F5EDD8]">
                   {s.icon}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{s.label}</span>
                   <span className="text-[10px] font-bold text-[#9A8A6A] tracking-wider uppercase">Weight: {(s.pct * 100).toFixed(0)}%</span>
                 </div>
              </div>
              <div className="text-left">
                <div className="text-[18px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(results.breakdown[s.id])}</div>
                <div className="text-[10px] font-bold text-[#9A8A6A] uppercase">{c.currency}</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-[#F7F3EC] overflow-hidden">
               <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct * 100}%`, backgroundColor: s.color }} />
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-bold text-[#9A8A6A]">
               <span>سعر المتر: {fmtNum(results.breakdown[s.id] / (params.area * params.floors))} {c.currency}</span>
               <span style={{ color: s.color }}>تخصص {(s.pct * 100).toFixed(0)}%</span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F7F3EC] px-4 py-3 text-[12px] font-bold">
              <span className="text-[#082555]" style={{ fontFamily: AR }}>افتح التفاصيل التقريبية القابلة للتعديل</span>
              <span className="text-[#C9A84C]">←</span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-[#F5EDD8] border-2 border-[#C9A84C]/30 p-5">
         <div className="flex items-start gap-3">
           <span className="text-xl">💡</span>
           <p className="text-[12px] font-bold text-[#5A4E38] leading-relaxed" style={{ fontFamily: AR }}>
             هذه الأرقام استرشادية مبنية على أسعار السوق الحالية. قد تختلف التكلفة الفعلية بناءً على المخططات الهندسية، تفاصيل المواصفات، وتقلبات أسعار المواد والعمالة وقت التنفيذ.
           </p>
         </div>
      </div>

      <AnalysisAdBanner
        adBanner={{ ...(adBanner || {}), slotId: AD_SLOT_IDS.areaResultsAfterNote }}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
        onToggleVisibility={onToggleAdVisibility}
        onRemove={onRemoveAd}
      />
    </div>
  );
}

function AreaSectionDetailView({
  country,
  params,
  draft,
  overallResults,
  onBack,
  onReset,
  onUpdateItem,
  onSave,
  onExport,
  adBanner,
  canManageAds = false,
  onManageAds,
  onToggleAdVisibility,
  onRemoveAd,
}) {
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const totalArea = (Number(params?.area) || 0) * (Number(params?.floors) || 0);
  const overallShare = overallResults?.total > 0 ? (draft.sectionTotal / overallResults.total) * 100 : 0;

  if (!draft) return null;

  const handleExportSectionPdf = () => {
    const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    const resourcesList = (draft.items || []).map(it => ({
      type: "مواد",
      name: it.label,
      qty: it.qty,
      unit: it.unit,
      rate: it.rate,
      total: it.total,
    }));
    const fakeItem = {
      ar: draft.title,
      num: `AREA-${draft.sectionId || ""}`,
      divAr: "تقدير مساحي",
      unit: "م²",
      market: 0,
    };
    onExport?.({
      item: fakeItem, c, q: totalArea || 1, f: 1,
      overhead: 0, profit: 0,
      matT: draft.sectionTotal, labT: 0, eqpT: 0,
      direct: draft.sectionTotal, indirect: 0, profitAmt: 0,
      finalTotal: draft.sectionTotal, unitPrice: draft.unitPrice,
      resourcesList, now,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-[14px] font-bold text-[#9A8A6A] hover:text-[#082555]">
          <ArrowRightIcon className="h-4 w-4" /> رجوع إلى التوزيع
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border-2 border-[#E2D8C4] bg-white px-4 py-2 text-[13px] font-bold text-[#082555] hover:border-[#C9A84C]"
        >
          إعادة ضبط التقدير
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[32px] p-8 text-white shadow-2xl" style={{ backgroundColor: "#082555" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.14),transparent)] pointer-events-none" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#9A8A6A] mb-3">Scope Detail</div>
            <h2 className="text-[24px] font-bold mb-2" style={{ fontFamily: AR }}>{draft.title}</h2>
            <p className="max-w-[560px] text-[13px] font-medium text-white/75 leading-7" style={{ fontFamily: AR }}>{draft.intro}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10 text-[30px]">
            {draft.icon}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "إجمالي التخصص", value: `${fmtNum(draft.sectionTotal)} ${c.currency}` },
            { label: "سعر المتر", value: `${fmtNum(draft.unitPrice)} ${c.currency}` },
            { label: "حصة التخصص", value: `${overallShare.toFixed(1)}%` },
            { label: "المساحة الكلية", value: `${fmtNum(totalArea)} م²` },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A8A6A] mb-2">{card.label}</div>
              <div className="text-[18px] font-bold text-white" style={{ fontFamily: MONO }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionDetailGraphic
        draft={draft}
        totalArea={totalArea}
        overallShare={overallShare}
        currency={c.currency}
      />

      <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-bold text-[#082555]" style={{ fontFamily: AR }}>البنود التقريبية القابلة للتعديل</h3>
          <div className="text-[12px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>التعديلات تنعكس فورًا على إجمالي هذا التخصص فقط</div>
        </div>

        <div className="space-y-4">
          {draft.items.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-[15px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{index + 1}. {item.label}</div>
                  <div className="mt-1 text-[11px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>{item.basis}</div>
                </div>
                <div className="rounded-xl bg-[#F5EDD8] px-3 py-2 text-[12px] font-bold" style={{ color: draft.color }}>
                  {(item.share * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-2 text-[11px] font-bold text-[#9A8A6A]">الكمية التقريبية</div>
                  <input
                    type="number"
                    value={item.qty}
                    step="0.01"
                    onChange={(e) => onUpdateItem(item.id, "qty", e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-[#E2D8C4] bg-white px-3 text-center font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
                    style={{ fontFamily: MONO }}
                  />
                  <div className="mt-1 text-[10px] font-bold text-[#C9A84C]">{item.unit}</div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-bold text-[#9A8A6A]">سعر الوحدة</div>
                  <input
                    type="number"
                    value={item.rate}
                    step="0.01"
                    onChange={(e) => onUpdateItem(item.id, "rate", e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-[#E2D8C4] bg-white px-3 text-center font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
                    style={{ fontFamily: MONO }}
                  />
                  <div className="mt-1 text-[10px] font-bold text-[#C9A84C]">{c.currency} / {item.unit}</div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-bold text-[#9A8A6A]">إجمالي البند</div>
                  <div className="flex min-h-[48px] items-center justify-center rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-3 text-[18px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                    {fmtNum(item.total)}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-[#C9A84C]">{c.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#C9A84C]/30 bg-[#F5EDD8] p-5">
        <h4 className="mb-3 text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>افتراضات هندسية مستخدمة</h4>
        <div className="space-y-2">
          {draft.assumptions.map((line) => (
            <div key={line} className="text-[12px] font-bold text-[#5A4E38] leading-7" style={{ fontFamily: AR }}>
              • {line}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>إجراءات التخصص</h3>
            <p className="mt-1 text-[12px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
              احفظ تفاصيل هذا التخصص في الحساب أو صدّرها كـ PDF بنفس القيم الحالية.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F3EC] text-[22px]">
            {draft.icon}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSave?.()}
            className="flex-1 min-h-[56px] rounded-2xl bg-[#C9A84C] text-[#082555] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition hover:bg-[#E8C97A] active:scale-[0.98]"
          >
            <SaveIcon className="h-5 w-5" /> حفظ في الحساب
          </button>
          <button
            onClick={handleExportSectionPdf}
            className="flex-1 min-h-[56px] rounded-2xl bg-white border-2 border-[#082555] text-[#082555] font-bold text-[15px] flex items-center justify-center gap-2 transition hover:bg-[#F5EDD8] active:scale-[0.98]"
          >
            <PrinterIcon className="h-5 w-5" /> تصدير PDF
          </button>
        </div>
      </div>

      <AnalysisAdBanner
        adBanner={{ ...(adBanner || {}), slotId: AD_SLOT_IDS.areaSectionAfterAssumptions }}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
        onToggleVisibility={onToggleAdVisibility}
        onRemove={onRemoveAd}
      />
    </div>
  );
}


// --- Main Pricing Workspace Component ---

export default function PricingWorkspace({ authMode, onSaveAnalysis, onCreateRfq, savedAnalyses, navigationBridge, initialCountry, settings, sessionMeta, onOpenAuthScreen, onShowStatus, systemBridge, accessStatus, isAdmin, onOpenSubscription, onNavigate }) {
  // initialCountry comes from the CountryPicker on PricingPage; always override persisted value
  const isEn = settings?.language === "en";
  const [country, setCountry] = useState(initialCountry || "sa");
  const [mode, setMode] = useState("selection"); // selection, items, area, area-results
  const [tab, setTab] = useState("csi");
  const [selectedItem, setSelectedItem] = useState(null);
  const [resources, setResources] = useState({ مواد: [], عمالة: [], معدات: [] });
  const [areaParams, setAreaParams] = useState(null);
  const [areaResults, setAreaResults] = useState(null);
  const [areaScenarios, setAreaScenarios] = useState([]);
  const [areaSectionDrafts, setAreaSectionDrafts] = useState({});
  const [selectedAreaSection, setSelectedAreaSection] = useState(null);
  const [addModalType, setAddModalType] = useState(null);

  // === سعر بنفسك ===
  const [selfPriceItem, setSelfPriceItem] = useState(null);
  const [selfPriceResources, setSelfPriceResources] = useState({ مواد: [], عمالة: [], معدات: [] });
  const [selfPriceQty, setSelfPriceQty] = useState(1);
  const [selfPriceOverhead, setSelfPriceOverhead] = useState(12);
  const [selfPriceProfit, setSelfPriceProfit] = useState(15);

  const { msg: toastMsg, visible: toastVisible, show: showToast } = useToast();
  const [analysisTopAdBanner] = useState(null);
  const [analysisActionsAdBanner] = useState(null);
  const [analysisBottomAdBanner] = useState(null);
  const [areaFormAdBanner] = useState(null);
  const [areaResultsAdBanner] = useState(null);
  const [areaSectionAdBanner] = useState(null);
  const [csiAfterDiv28AdBanner] = useState(null);
  const [adEditor, setAdEditor] = useState({
    open: false,
    slotId: AD_SLOT_IDS.analysisPreResult,
    draft: { ...DEFAULT_AD_BANNER },
    saving: false,
  });
  // Analysis Parameters (Moved up for persistence and export)
  const [qty, setQty] = useState(1);
  const [overhead, setOverhead] = useState(() => Number(settings?.overheadPercent) || 12);
  const [profit, setProfit] = useState(() => Number(settings?.profitPercent) || 15);
  const [factor, setFactor] = useState(() => Number(settings?.locationFactor) || 1.03);
  const [analysisBaseline, setAnalysisBaseline] = useState(null);

  const isGuest = authMode === "guest";
  const [exportPreview, setExportPreview] = useState(null);

  const openExportPreview = useCallback((payload) => {
    if (!payload) return;
    setExportPreview(payload);
  }, []);

  const getAdSlotLabel = useCallback((slotId) => {
    if (slotId === AD_SLOT_IDS.analysisPreResult) return "إعلان أعلى شاشة التحليل";
    if (slotId === AD_SLOT_IDS.analysisAfterActions) return "إعلان بعد أزرار التحليل";
    if (slotId === AD_SLOT_IDS.analysisPostResult) return "إعلان أسفل نتيجة التحليل";
    if (slotId === AD_SLOT_IDS.areaFormAfterCard) return "إعلان بعد نموذج تسعير المبنى";
    if (slotId === AD_SLOT_IDS.areaResultsAfterNote) return "إعلان بعد ملاحظة تسعير المبنى";
    if (slotId === AD_SLOT_IDS.areaSectionAfterAssumptions) return "إعلان بعد افتراضات تفاصيل التخصص";
    return "إعدادات الإعلان";
  }, []);

  const handleOpenAdEditor = useCallback((slotId, currentBanner) => {
    setAdEditor({
      open: true,
      slotId,
      draft: { ...DEFAULT_AD_BANNER, ...(currentBanner || {}) },
      saving: false,
    });
  }, []);

  const handleCloseAdEditor = useCallback(() => {
    setAdEditor((prev) => ({ ...prev, open: false, saving: false }));
  }, []);

  const handleAdEditorDraftChange = useCallback((key, value) => {
    setAdEditor((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        [key]: value,
      },
    }));
  }, []);

  const handleSaveAdEditor = useCallback(async () => {
    setAdEditor((prev) => ({ ...prev, open: false, saving: false }));
    showToast("تم تعطيل إدارة الإعلانات من التطبيق");
  }, [showToast]);

  const handleToggleAdVisibility = useCallback(async (slotId, currentBanner, nextEnabled) => {
    showToast("تم تعطيل إدارة الإعلانات من التطبيق");
  }, [showToast]);

  const handleRemoveAd = useCallback(async (slotId) => {
    showToast("تم تعطيل إدارة الإعلانات من التطبيق");
  }, [showToast]);

  const buildAnalysisSnapshot = useCallback((itemValue, resourcesValue, paramsValue) => ({
    selectedItem: itemValue ? { ...itemValue } : null,
    resources: JSON.parse(JSON.stringify(resourcesValue || { مواد: [], عمالة: [], معدات: [] })),
    params: {
      qty: paramsValue.qty,
      factor: paramsValue.factor,
      overhead: paramsValue.overhead,
      profit: paramsValue.profit,
    },
  }), []);

  const applyAnalysisSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    setSelectedItem(snapshot.selectedItem ? { ...snapshot.selectedItem } : null);
    setResources(JSON.parse(JSON.stringify(snapshot.resources || { مواد: [], عمالة: [], معدات: [] })));
    setQty(snapshot.params?.qty ?? 1);
    setFactor(snapshot.params?.factor ?? (Number(settings?.locationFactor) || 1.03));
    setOverhead(snapshot.params?.overhead ?? (Number(settings?.overheadPercent) || 12));
    setProfit(snapshot.params?.profit ?? (Number(settings?.profitPercent) || 15));
  }, [settings]);

  const currentAnalysisSignature = useMemo(() => JSON.stringify(
    buildAnalysisSnapshot(selectedItem, resources, {
      qty, factor, overhead, profit,
    })
  ), [buildAnalysisSnapshot, selectedItem, resources, qty, factor, overhead, profit]);

  const baselineAnalysisSignature = useMemo(
    () => (analysisBaseline ? JSON.stringify(analysisBaseline) : null),
    [analysisBaseline]
  );

  const hasTemporaryAnalysisChanges = Boolean(
    selectedItem &&
    tab === "analysis" &&
    analysisBaseline &&
    baselineAnalysisSignature !== currentAnalysisSignature
  );

  const discardAnalysisChanges = useCallback(() => {
    if (!analysisBaseline) return;
    applyAnalysisSnapshot(analysisBaseline);
  }, [analysisBaseline, applyAnalysisSnapshot]);

  const confirmDiscardAnalysisChanges = useCallback((onDiscard) => {
    if (!hasTemporaryAnalysisChanges) {
      onDiscard?.();
      return true;
    }

    const confirmed = window.confirm("هل تريد تجاهل التعديلات؟");
    if (!confirmed) return false;

    discardAnalysisChanges();
    onDiscard?.();
    return true;
  }, [discardAnalysisChanges, hasTemporaryAnalysisChanges]);

  useEffect(() => {
    if (!hasTemporaryAnalysisChanges) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasTemporaryAnalysisChanges]);

  const effectiveAreaResults = useMemo(() => {
    if (!areaResults) return null;

    const breakdown = { ...areaResults.breakdown };
    Object.entries(areaSectionDrafts).forEach(([sectionId, draft]) => {
      breakdown[sectionId] = Number(draft?.sectionTotal) || 0;
    });

    const total = Object.values(breakdown).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const totalArea = (Number(areaParams?.area) || 0) * (Number(areaParams?.floors) || 0);
    const dist = Object.fromEntries(
      Object.keys(breakdown).map((key) => [key, total > 0 ? breakdown[key] / total : 0])
    );

    return {
      ...areaResults,
      breakdown,
      total,
      unitPrice: totalArea > 0 ? total / totalArea : total,
      dist,
    };
  }, [areaResults, areaSectionDrafts, areaParams]);

  const currentAreaScenario = useMemo(() => {
    if (!areaParams || !effectiveAreaResults) return null;
    return {
      id: `scenario-${areaParams.type}-${areaParams.scope}-${areaParams.finish}-${areaParams.area}-${areaParams.floors}`,
      total: effectiveAreaResults.total,
      unitPrice: effectiveAreaResults.unitPrice,
      totalArea: (Number(areaParams.area) || 0) * (Number(areaParams.floors) || 0),
      floors: Number(areaParams.floors) || 0,
      finishId: areaParams.finish,
      typeId: areaParams.type,
      scopeId: areaParams.scope,
      typeLabel: BUILDING_TYPES.find((item) => item.id === areaParams.type)?.ar || areaParams.type,
      finishLabel: FINISH_LEVELS.find((item) => item.id === areaParams.finish)?.ar || areaParams.finish,
      scopeLabel: SCOPES.find((item) => item.id === areaParams.scope)?.ar || areaParams.scope,
    };
  }, [areaParams, effectiveAreaResults]);

  const suggestedAreaScenario = useMemo(() => {
    if (!currentAreaScenario || !areaParams || !effectiveAreaResults) return null;

    const currentFinishIndex = FINISH_LEVELS.findIndex((item) => item.id === areaParams.finish);
    const nextFinish = currentFinishIndex >= 0 ? FINISH_LEVELS[currentFinishIndex + 1] : null;
    if (!nextFinish) return null;

    const config = AREA_PRICING_BASE[country] || AREA_PRICING_BASE.sa;
    const currentFactor = config.finishFactors[areaParams.finish] || 1;
    const nextFactor = config.finishFactors[nextFinish.id] || currentFactor;
    const ratio = currentFactor > 0 ? nextFactor / currentFactor : 1;

    return {
      id: `scenario-upgrade-${areaParams.type}-${areaParams.scope}-${nextFinish.id}-${areaParams.area}-${areaParams.floors}`,
      total: roundTo(effectiveAreaResults.total * ratio),
      unitPrice: roundTo(effectiveAreaResults.unitPrice * ratio),
      totalArea: currentAreaScenario.totalArea,
      floors: currentAreaScenario.floors,
      finishId: nextFinish.id,
      typeId: areaParams.type,
      scopeId: areaParams.scope,
      typeLabel: currentAreaScenario.typeLabel,
      finishLabel: nextFinish.ar,
      scopeLabel: currentAreaScenario.scopeLabel,
    };
  }, [areaParams, country, currentAreaScenario, effectiveAreaResults]);

  const pushWorkspaceStep = useCallback(() => {
    navigationBridge?.pushHistoryEntry?.();
  }, [navigationBridge]);

  const handleCalculateArea = async (params) => {
    const allowed = await ensureUnifiedAccess();
    if (!allowed) {
      return;
    }

    const config = AREA_PRICING_BASE[country] || AREA_PRICING_BASE.sa;
    let rate = config.baseRate;
    rate *= config.finishFactors[params.finish] || 1;
    rate *= config.typeFactors[params.type] || 1;

    const totalArea = params.area * params.floors;
    const fullCost = rate * totalArea;

    const breakdown = {
      structural: fullCost * config.distribution.structural,
      architectural: fullCost * config.distribution.architectural,
      electrical: fullCost * config.distribution.electrical,
      mechanical: fullCost * config.distribution.mechanical
    };

    let selectedTotal = 0;
    const filteredBreakdown = { structural: 0, architectural: 0, electrical: 0, mechanical: 0 };

    if (params.scope === "structural") {
      filteredBreakdown.structural = breakdown.structural;
      selectedTotal = breakdown.structural;
    } else if (params.scope === "civ_arch") {
      filteredBreakdown.structural = breakdown.structural;
      filteredBreakdown.architectural = breakdown.architectural;
      selectedTotal = breakdown.structural + breakdown.architectural;
    } else {
      Object.assign(filteredBreakdown, breakdown);
      selectedTotal = fullCost;
    }

    // Weight distribution for UI
    const dist = {};
    Object.keys(filteredBreakdown).forEach(k => {
      dist[k] = selectedTotal > 0 ? filteredBreakdown[k] / selectedTotal : 0;
    });

    setAreaParams(params);
    setAreaSectionDrafts({});
    setSelectedAreaSection(null);
    setAreaResults({ total: selectedTotal, unitPrice: selectedTotal / totalArea, breakdown: filteredBreakdown, dist });
    pushWorkspaceStep();
    setMode("area-results");
  };

  const handleOpenAreaSection = useCallback((sectionId) => {
    if (!areaParams || !areaResults) return;

    setAreaSectionDrafts((current) => {
      if (current[sectionId]) return current;
      const nextDraft = buildAreaSectionDraft(sectionId, areaParams, areaResults);
      return nextDraft ? { ...current, [sectionId]: nextDraft } : current;
    });
    setSelectedAreaSection(sectionId);
    pushWorkspaceStep();
    setMode("area-section-detail");
  }, [areaParams, areaResults, pushWorkspaceStep]);

  const handleResetAreaSection = useCallback(() => {
    if (!selectedAreaSection || !areaParams || !areaResults) return;
    const resetDraft = buildAreaSectionDraft(selectedAreaSection, areaParams, areaResults);
    if (!resetDraft) return;
    setAreaSectionDrafts((current) => ({ ...current, [selectedAreaSection]: resetDraft }));
  }, [selectedAreaSection, areaParams, areaResults]);

  const handleAddAreaScenario = useCallback(() => {
    if (!currentAreaScenario) return;
    setAreaScenarios((current) => {
      if (current.some((scenario) => scenario.id === currentAreaScenario.id)) return current;
      if (current.length >= 3) return current;
      return [...current, currentAreaScenario];
    });
    showToast("تمت إضافة السيناريو للمقارنة");
  }, [currentAreaScenario, showToast]);

  const handleRemoveAreaScenario = useCallback((scenarioId) => {
    setAreaScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
  }, []);

  const handleUpdateAreaSectionItem = useCallback((itemId, field, value) => {
    if (!selectedAreaSection || !areaParams) return;

    setAreaSectionDrafts((current) => {
      const activeDraft = current[selectedAreaSection] || buildAreaSectionDraft(selectedAreaSection, areaParams, areaResults);
      if (!activeDraft) return current;

      const nextItems = activeDraft.items.map((item) => {
        if (item.id !== itemId) return item;
        const nextValue = Math.max(0, Number(value) || 0);
        const nextItem = { ...item, [field]: nextValue };
        nextItem.total = roundTo((Number(nextItem.qty) || 0) * (Number(nextItem.rate) || 0));
        return nextItem;
      });

      const nextDraft = recalculateAreaSectionDraft({ ...activeDraft, items: nextItems }, areaParams);
      return { ...current, [selectedAreaSection]: nextDraft };
    });
  }, [selectedAreaSection, areaParams, areaResults]);

  const handleExport = useCallback(() => {
    const c = COUNTRIES[country] || COUNTRIES.sa;
    const now = new Date().toLocaleDateString('ar-SA');

    if (mode === "area-results" || mode === "area-section-detail") {
      const exportAreaResults = effectiveAreaResults || areaResults;
      const finish = FINISH_LEVELS.find(f => f.id === areaParams.finish)?.ar;
      const type = BUILDING_TYPES.find(t => t.id === areaParams.type)?.ar;
      const scope = SCOPES.find(s => s.id === areaParams.scope)?.ar;

      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["تقرير تقدير تكلفة مبنى", ""],
        ["التاريخ", now],
        ["الدولة", c.name],
        ["", ""],
        ["بيانات المشروع", ""],
        ["نوع المبنى", type],
        ["مستوى التشطيب", finish],
        ["نطاق الأعمال", scope],
        ["مساحة الدور", areaParams.area],
        ["عدد الأدوار", areaParams.floors],
        ["المساحة الكلية", areaParams.area * areaParams.floors],
        ["", ""],
        ["ملخص التكلفة", ""],
        ["التكلفة الإجمالية", exportAreaResults.total],
        ["سعر المتر المربع", exportAreaResults.unitPrice],
        ["العملة", c.currency],
        ["", ""],
        ["توزيع التكلفة حسب التخصصات", ""],
        ["الأعمال الإنشائية", exportAreaResults.breakdown.structural],
        ["الأعمال المعمارية", exportAreaResults.breakdown.architectural],
        ["الأعمال الكهربائية", exportAreaResults.breakdown.electrical],
        ["الأعمال الميكانيكية", exportAreaResults.breakdown.mechanical]
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws, "Project Estimation");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

      const fileName = `Estimation_${type.replace(/\s+/g, '_')}.xlsx`;

      if (window.TaseeraAndroid) {
        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          window.TaseeraAndroid.saveFile(fileName, base64data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        };
        reader.readAsDataURL(blob);
      } else {
        const url = window.URL.createObjectURL(new Blob([s2ab(wbout)], { type: "application/octet-stream" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
      }

      showToast("تم تصدير تقدير المساحة إلى Excel");
    } else if (selectedItem) {
      const q = Number(qty) || 1;
      const f = Number(factor) || 1;
      let matT = 0, labT = 0, eqpT = 0;
      const resourcesList = [];

      (resources["مواد"] || []).forEach((r) => {
        const cost = r.qty * r.rate * q * f;
        matT += cost;
        resourcesList.push({ type: 'مواد', name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: cost });
      });
      (resources["عمالة"] || []).forEach((r) => {
        const cost = r.qty * r.rate * q * f;
        labT += cost;
        resourcesList.push({ type: 'عمالة', name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: cost });
      });
      (resources["معدات"] || []).forEach((r) => {
        const cost = r.qty * r.rate * q * f;
        eqpT += cost;
        resourcesList.push({ type: 'معدات', name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: cost });
      });

      const direct = matT + labT + eqpT;
      const indirect = (direct * Number(overhead)) / 100;
      const withOverhead = direct + indirect;
      const profitAmt = withOverhead * (Number(profit) / 100);
      const finalTotal = withOverhead + profitAmt;
      const unitPrice = q > 0 ? finalTotal / q : finalTotal;

      // Show in-app export preview (works on mobile — no external browser opened)
      openExportPreview({ item: selectedItem, c, q, f, overhead, profit, matT, labT, eqpT, direct, indirect, profitAmt, finalTotal, unitPrice, resourcesList, now });
    }
  }, [mode, country, areaParams, areaResults, effectiveAreaResults, selectedItem, resources, qty, overhead, profit, factor, showToast, openExportPreview]);

  const notifyFullAccess = useCallback(() => {
    if (!accessStatus?.canAccess && !isAdmin) {
      onOpenSubscription?.();
      return;
    }
    showToast(settings?.language === "en" ? "All pricing tools are already open." : "كل أدوات التسعير مفتوحة للجميع.");
  }, [accessStatus, isAdmin, onOpenSubscription, settings?.language, showToast]);

  const ensureUnifiedAccess = useCallback(async () => {
    if (!accessStatus?.canAccess && !isAdmin) {
      onOpenSubscription?.();
      return false;
    }
    return true;
  }, [accessStatus, isAdmin, onOpenSubscription]);

  async function handleSelfPrice(item, div) {
    const allowed = await ensureUnifiedAccess();
    if (!allowed) {
      return;
    }
    const full = {
      ...item,
      divAr: div.ar,
      divEn: div.en,
      unit: item.unit || div.unit,
      market: country ? COUNTRIES[country].rates[div.rateKey] || 0 : 0,
    };
    const defaults = getDefaultResources(item, div, COUNTRIES[country]?.rates || {}, country);
    setSelfPriceItem(full);
    setSelfPriceResources(JSON.parse(JSON.stringify(defaults)));
    setSelfPriceQty(1);
    setSelfPriceOverhead(12);
    setSelfPriceProfit(15);
    pushWorkspaceStep();
    setMode("self-price");
  }

  async function handleSelectItem(item, div) {
    const allowed = await ensureUnifiedAccess();
    if (!allowed) {
      return;
    }
    const full = {
      ...item,
      divAr: div.ar,
      divEn: div.en,
      unit: item.unit || div.unit,
      market: country ? COUNTRIES[country].rates[div.rateKey] || 0 : 0,
    };
    const defaultResources = getDefaultResources(item, div, COUNTRIES[country]?.rates || {}, country);
    const snapshot = buildAnalysisSnapshot(full, defaultResources, {
      qty: 1,
      factor: 1.03,
      overhead: 12,
      profit: 15,
    });
    applyAnalysisSnapshot(snapshot);
    setAnalysisBaseline(snapshot);
    pushWorkspaceStep();
    setTab("analysis");
  }

  function handleViewAnalysis(analysis) {
    if (analysis.mode === 'item') {
      const item = {
        ar: analysis.itemName,
        num: analysis.itemNum,
        divAr: analysis.params.divAr || '',
        divEn: analysis.params.divEn || '',
        unit: analysis.params.unit || 'وحدة',
        market: analysis.params.market || 0
      };
      const snapshot = buildAnalysisSnapshot(item, analysis.resources, {
        qty: analysis.params.qty,
        factor: analysis.params.factor,
        overhead: analysis.params.overhead ?? 12,
        profit: analysis.params.profit,
      });
      applyAnalysisSnapshot(snapshot);
      setAnalysisBaseline(snapshot);
      pushWorkspaceStep();
      setMode("items");
      setTab("analysis");
    } else {
      setAreaParams(analysis.params);
      setAreaResults(analysis.results);
      pushWorkspaceStep();
      setMode("area-results");
    }
  }

  function handleAddResource(res) {
    setResources((prev) => ({ ...prev, [res.type]: [...(prev[res.type] || []), res] }));
    setAddModalType(null);
  }

  async function handleModeChange(nextMode) {
    if (mode === "items" && tab === "analysis") {
      const canLeave = confirmDiscardAnalysisChanges(() => {
        if (nextMode !== "selection" && nextMode !== mode) pushWorkspaceStep();
        setMode(nextMode);
      });
      if (!canLeave) return;
      return;
    }
    // Community is a top-level page, navigate out of PricingWorkspace
    if (nextMode === "community") {
      onNavigate?.("community");
      return;
    }
    // "items" mode is free to browse — only analysis actions inside it are gated.
    if (["area", "candy"].includes(nextMode)) {
      const allowed = await ensureUnifiedAccess();
      if (!allowed) return;
    }
    if (nextMode !== "selection" && nextMode !== mode) pushWorkspaceStep();
    setMode(nextMode);
  }

  function handleTabChange(nextTab) {
    if (nextTab === tab) return;
    if (tab === "analysis") {
      const canLeave = confirmDiscardAnalysisChanges(() => {
        if (nextTab !== "csi") pushWorkspaceStep();
        setTab(nextTab);
      });
      if (!canLeave) return;
      return;
    }
    if (nextTab !== "csi") pushWorkspaceStep();
    setTab(nextTab);
  }

  const handleWorkspaceBack = useCallback(() => {
    // If the export preview modal is open, close it first (don't navigate the workspace)
    if (exportPreview) {
      setExportPreview(null);
      return true;
    }

    // سعر بنفسك back → return to items
    if (mode === "self-price") {
      setMode("items");
      setTab("csi");
      return true;
    }

    if (mode === "area-section-detail") {
      setMode("area-results");
      return true;
    }

    if (mode === "area-results") {
      setMode("area");
      return true;
    }

    if (mode === "area") {
      setMode("selection");
      return true;
    }

    if (mode === "items") {
      if (tab === "analysis") {
        // always intercept — user either navigates away or stays; never show exit-app dialog
        confirmDiscardAnalysisChanges(() => {
          setSelectedItem(null);
          setTab("csi");
        });
        return true;
      }

      if (tab !== "csi") {
        setTab("csi");
        return true;
      }

      setMode("selection");
      return true;
    }

    return false;
  }, [mode, tab, exportPreview, setExportPreview, confirmDiscardAnalysisChanges]);

  useEffect(() => navigationBridge?.registerBackHandler?.(handleWorkspaceBack), [handleWorkspaceBack, navigationBridge]);

  useEffect(() => {
    navigationBridge?.onEntryChange?.({ mode, tab });
  }, [mode, tab, navigationBridge]);

  const tabs = [
    { id: "csi",      label: isEn ? "Items" : "البنود",    icon: "📋" },
    { id: "analysis", label: isEn ? "Analysis" : "التحليل",   icon: "📊" },
    { id: "market",   label: isEn ? "Market" : "السوق",     icon: "📈" },
    { id: "history",  label: isEn ? "Saved" : "المحفوظة", icon: "🕘" },
  ];

  if (!country) {
    return (
      <CountryModal
        current={country}
        language={settings?.language || "ar"}
        onConfirm={(c) => {
          setCountry(c);
        }}
      />
    );
  }

  return (
    <div className="w-full bg-[#F7F3EC] overflow-x-hidden" dir="rtl" style={{ fontFamily: AR }}>
      <div className="mx-auto w-full max-w-[720px] py-3 sm:py-4 pb-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => handleModeChange("selection")} className="group flex items-center gap-3 text-right">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d2545] to-[#162e52] text-[#d4a843] shadow-lg ring-1 ring-[#d4a843]/20 transition-shadow group-hover:shadow-[0_4px_16px_rgba(212,168,67,0.25)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-[#0d2545] leading-none">{isEn ? "Taseera" : "تسعيرة"}</h1>
              <p className="text-[10px] font-bold text-[#d4a843] mt-1 uppercase tracking-widest">Construction Pricing</p>
            </div>
          </button>
        </div>

        {/* --- MAIN CONTENT SWITCHER --- */}

        {mode === "selection" && (
          <ModeSelection
            onSelect={handleModeChange}
            onOpenFullAccess={notifyFullAccess}
            language={settings?.language || "ar"}
          />
        )}

        {mode === "candy" && (
          <ScreenProtection enabled={true}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CandyWorkspace
                country={country}
                onBack={() => handleModeChange("selection")}
                onCreateRfq={onCreateRfq}
              />
            </div>
          </ScreenProtection>
        )}

        {mode === "items" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="mb-5 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#082555] to-[#0d3070] p-1.5 shadow-[0_8px_24px_rgba(8,37,85,0.22)]">
              <div className="flex gap-1.5">
                {tabs.map((t) => (
                  <button key={t.id} type="button" onClick={() => handleTabChange(t.id)}
                    className={`flex flex-1 min-w-0 flex-col items-center gap-0.5 rounded-xl py-2.5 px-1 text-[11px] font-bold transition-all duration-200 ${
                      tab === t.id
                        ? "bg-[#C9A84C] text-[#082555] shadow-[0_2px_10px_rgba(201,168,76,0.4)]"
                        : "text-white/50 hover:text-white hover:bg-white/8"
                    }`}
                    style={{ fontFamily: AR }}>
                    <span className="text-base leading-none">{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {tab === "csi" && (
              <CSIScreen
                country={country}
                onSelectItem={handleSelectItem}
                onSelfPrice={handleSelfPrice}
                itemLocked={!accessStatus?.canAccess && !isAdmin}
                itemRemaining={null}
                onOpenFullAccess={notifyFullAccess}
                afterDiv28AdBanner={csiAfterDiv28AdBanner}
                isGuest={isGuest}
                onOpenAuthScreen={onOpenAuthScreen}
              />
            )}
            {tab === "history" && (
              <HistoryScreen
                savedAnalyses={savedAnalyses}
                onView={handleViewAnalysis}
              />
            )}
            {tab === "analysis" && (
              <AnalysisScreen
                authMode={authMode}
                country={country}
                selectedItem={selectedItem}
                resources={resources}
                setResources={setResources}
                onOpenAddModal={(type) => setAddModalType(type)}
                onSave={handleExport}
                onRfq={() => onCreateRfq?.({ item: selectedItem, source: "pricing-workspace" })}
                onExport={openExportPreview}
                toast={showToast}
                qty={qty} setQty={setQty}
                overhead={overhead} setOverhead={setOverhead}
                profit={profit} setProfit={setProfit}
                factor={factor} setFactor={setFactor}
                settings={settings}
                topAdBanner={analysisTopAdBanner}
                actionsAdBanner={analysisActionsAdBanner}
                bottomAdBanner={analysisBottomAdBanner}
                canManageAds={false}
                onManageAds={handleOpenAdEditor}
                onToggleAdVisibility={handleToggleAdVisibility}
                onRemoveAd={handleRemoveAd}

              />
            )}
            {tab === "market" && (
              <MarketScreen
                country={country}
                onSelectItem={handleSelectItem}
                onSelfPrice={handleSelfPrice}
                itemLocked={!accessStatus?.canAccess && !isAdmin}
                itemRemaining={null}
                onOpenFullAccess={notifyFullAccess}
              />
            )}
          </div>
        )}

        {mode === "area" && (
          <AreaPricingForm
            country={country}
            onCalculate={handleCalculateArea}
            adBanner={areaFormAdBanner}
            canManageAds={false}
            onManageAds={handleOpenAdEditor}
            onToggleAdVisibility={handleToggleAdVisibility}
            onRemoveAd={handleRemoveAd}
          />
        )}

        {mode === "area-results" && (
          <AreaResultsView
            country={country}
            params={areaParams}
            results={effectiveAreaResults}
            scenarios={areaScenarios}
            currentScenario={currentAreaScenario}
            suggestedScenario={suggestedAreaScenario}
            onAddScenario={handleAddAreaScenario}
            onRemoveScenario={handleRemoveAreaScenario}
            onBack={() => setMode("area")}
            onExport={handleExport}
            onSave={() => {
              onSaveAnalysis?.({
                item: { ar: `تسعير مساحة (${BUILDING_TYPES.find(t => t.id === areaParams.type)?.ar})`, num: 'AREA' },
                resources: {},
                results: effectiveAreaResults,
                params: areaParams,
                mode: 'area'
              });
              showToast(isEn ? "Project pricing saved successfully." : "تم حفظ تسعير المشروع بنجاح");
            }}
            onOpenSection={handleOpenAreaSection}
            adBanner={areaResultsAdBanner}
            canManageAds={false}
            onManageAds={handleOpenAdEditor}
            onToggleAdVisibility={handleToggleAdVisibility}
            onRemoveAd={handleRemoveAd}
          />
        )}

        {mode === "self-price" && selfPriceItem && (
          <SelfPricingScreen
            item={selfPriceItem}
            resources={selfPriceResources}
            setResources={setSelfPriceResources}
            qty={selfPriceQty} setQty={setSelfPriceQty}
            overhead={selfPriceOverhead} setOverhead={setSelfPriceOverhead}
            profit={selfPriceProfit} setProfit={setSelfPriceProfit}
            country={country}
            authMode={authMode}
            sessionMeta={sessionMeta}
            settings={settings}
            onBack={() => { setMode("items"); setTab("csi"); }}
            onExport={openExportPreview}
            onSave={(result) => {
              onSaveAnalysis?.({
                item: selfPriceItem,
                resources: selfPriceResources,
                params: { qty: selfPriceQty, overhead: selfPriceOverhead, profit: selfPriceProfit, unit: selfPriceItem.unit, market: selfPriceItem.market, divAr: selfPriceItem.divAr },
                results: result,
                mode: 'item',
              });
              showToast(isEn ? "Price analysis saved successfully. ✔️" : "تم حفظ تحليل السعر بنجاح ✔️");
            }}
            language={settings?.language || "ar"}
          />
        )}

        {mode === "area-section-detail" && (
          <AreaSectionDetailView
            country={country}
            params={areaParams}
            draft={selectedAreaSection ? areaSectionDrafts[selectedAreaSection] || buildAreaSectionDraft(selectedAreaSection, areaParams, areaResults) : null}
            overallResults={effectiveAreaResults}
            onBack={() => setMode("area-results")}
            onReset={handleResetAreaSection}
            onUpdateItem={handleUpdateAreaSectionItem}
            onSave={() => {
              const activeDraft = selectedAreaSection
                ? areaSectionDrafts[selectedAreaSection] || buildAreaSectionDraft(selectedAreaSection, areaParams, areaResults)
                : null;
              if (!activeDraft) return;

              onSaveAnalysis?.({
                item: { ar: `تفاصيل تخصص (${activeDraft.title})`, num: `AREA-${activeDraft.sectionId}` },
                resources: {},
                results: {
                  total: activeDraft.sectionTotal,
                  unitPrice: activeDraft.unitPrice,
                  overallShare:
                    effectiveAreaResults?.total > 0
                      ? (activeDraft.sectionTotal / effectiveAreaResults.total) * 100
                      : 0,
                },
                params: {
                  ...areaParams,
                  sectionId: activeDraft.sectionId,
                  sectionTitle: activeDraft.title,
                  assumptions: activeDraft.assumptions,
                  items: activeDraft.items,
                },
                mode: "area-section-detail",
              });
              showToast(isEn ? "Discipline details saved successfully." : "تم حفظ تفاصيل التخصص بنجاح");
            }}
            adBanner={areaSectionAdBanner}
            canManageAds={false}
            onManageAds={handleOpenAdEditor}
            onExport={openExportPreview}
            onToggleAdVisibility={handleToggleAdVisibility}
            onRemoveAd={handleRemoveAd}
          />
        )}
      </div>

      {addModalType && (
        <AddResourceModal defaultType={addModalType} onAdd={handleAddResource} onClose={() => setAddModalType(null)} />
      )}

      {adEditor.open ? (
        <InlineAdEditorModal
          title={getAdSlotLabel(adEditor.slotId)}
          draft={adEditor.draft}
          saving={adEditor.saving}
          onChange={handleAdEditorDraftChange}
          onSave={handleSaveAdEditor}
          onClose={handleCloseAdEditor}
        />
      ) : null}

      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#082555] px-5 py-2.5 text-[12px] font-medium text-[#E8C97A] shadow-xl"
          style={{ fontFamily: AR }}>
          {toastMsg}
        </div>
      )}

      {/* In-app export preview modal */}
      <ExportPreviewModal data={exportPreview} onClose={() => setExportPreview(null)} language={settings?.language || "ar"} />

    </div>
  );
}


// Sub-components (Moved from previous implementation or newly added)

// ===== سعر بنفسك Screen =====
function SelfPricingScreen({ item, resources, setResources, qty, setQty, overhead, setOverhead, profit, setProfit, country, authMode, sessionMeta, settings, onBack, onSave, onExport, language = "ar" }) {
  const isEn = language === "en";
  const sym = getCurrencySymbol(country);
  const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const canManageAds = false;
  const [selfPricingAd] = useState(null);

  // حساب مجموع كل مجموعة
  const sumGroup = (grp) =>
    (resources[grp] || []).reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);

  const matTotal  = sumGroup("مواد");
  const labTotal  = sumGroup("عمالة");
  const eqpTotal  = sumGroup("معدات");
  const direct    = (matTotal + labTotal + eqpTotal) * (Number(qty) || 1);
  const indirect  = direct * (Number(overhead) || 0) / 100;
  const profitAmt = (direct + indirect) * (Number(profit) || 0) / 100;
  const total     = direct + indirect + profitAmt;
  const unitPrice = (Number(qty) || 1) > 0 ? total / (Number(qty) || 1) : 0;

  const updateRow = (grp, idx, field, val) => {
    setResources(prev => {
      const next = { ...prev, [grp]: prev[grp].map((r, i) => i === idx ? { ...r, [field]: val } : r) };
      return next;
    });
  };

  const removeRow = (grp, idx) => {
    setResources(prev => ({ ...prev, [grp]: prev[grp].filter((_, i) => i !== idx) }));
  };

  const addRow = (grp) => {
    const badge = grp === "مواد" ? "mat" : grp === "عمالة" ? "lab" : "eqp";
    setResources(prev => ({
      ...prev,
      [grp]: [...prev[grp], { name: "بند جديد", qty: 1, unit: "بند", rate: 0, badge, icon: "📦" }]
    }));
  };

  const GROUP_HEADERS = [
    { key: "مواد",   label: "المواد",   emoji: "🧱", color: "bg-blue-50 border-blue-200",   btn: "bg-blue-600"   },
    { key: "عمالة", label: "العمالة",  emoji: "👷", color: "bg-green-50 border-green-200",  btn: "bg-green-600"  },
    { key: "معدات", label: "المعدات",  emoji: "🚜", color: "bg-orange-50 border-orange-200",btn: "bg-orange-600" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400" dir="rtl" style={{ fontFamily: AR }}>
      {/* Header */}
      <div className="mb-4 rounded-2xl bg-[#082555] p-4 text-right shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-lg bg-[#C9A84C] px-2.5 py-0.5 text-[11px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{item.num}</span>
              <span className="text-[11px] text-[#9A8A6A]">{item.divAr}</span>
            </div>
            <h2 className="text-[15px] font-bold text-white leading-snug">{item.ar}</h2>
            <p className="mt-1 text-[12px] text-[#9A8A6A]">{isEn ? "Unit:" : "الوحدة:"} <span className="text-[#C9A84C] font-bold">{item.unit}</span>  ·  {isEn ? "Market Price:" : "سعر السوق:"} <span className="text-[#C9A84C] font-bold">{fmt(item.market)} {sym}</span></p>
          </div>
          <button onClick={onBack} className="shrink-0 rounded-xl bg-[#0d2f5e] px-3 py-2 text-[12px] text-[#9A8A6A] hover:text-white transition">← {isEn ? "Back" : "رجوع"}</button>
        </div>
      </div>

      {/* Qty */}
      <div className="mb-4 rounded-xl bg-white border border-[#E2D8C4] p-3 flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#082555]">الكمية</span>
        <input type="number" min="0.01" step="0.01"
          value={qty} onChange={e => setQty(e.target.value)}
          className="w-24 rounded-lg border border-[#E2D8C4] px-3 py-1.5 text-center text-[14px] font-bold text-[#082555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
        />
        <span className="text-[13px] text-[#9A8A6A]">{item.unit}</span>
      </div>

      {/* Resource Groups */}
      {GROUP_HEADERS.map(({ key, label, emoji, color, btn }) => (
        <div key={key} className={`mb-4 rounded-xl border-2 ${color}`}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-white bg-opacity-60 rounded-t-xl">
            <span className="text-[14px] font-bold text-[#082555]">{emoji} {label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#082555]">{fmt(sumGroup(key))} {sym}</span>
              <button onClick={() => addRow(key)}
                className={`rounded-lg ${btn} px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-80 transition`}>
                + إضافة
              </button>
            </div>
          </div>
          <div className="divide-y divide-[#E2D8C4]">
            {(resources[key] || []).map((row, idx) => (
              <div key={idx} className="px-3 py-2.5 bg-white hover:bg-gray-50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg shrink-0">{row.icon || "📦"}</span>
                  <input
                    value={row.name}
                    onChange={e => updateRow(key, idx, "name", e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-transparent px-1 py-0.5 text-[13px] font-bold text-[#082555] focus:border-[#C9A84C] focus:outline-none bg-transparent"
                    style={{ fontFamily: AR }}
                  />
                  <button onClick={() => removeRow(key, idx)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E2D8C4] bg-white text-xs text-[#9A8A6A] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-[#9A8A6A] tracking-wider" style={{ fontFamily: AR }}>{isEn ? "Quantity" : "الكمية"}</span>
                    <input type="number" min="0" step="0.01"
                      value={row.qty}
                      onChange={e => updateRow(key, idx, "qty", e.target.value)}
                      className="w-full rounded-xl border border-[#E2D8C4] px-2 py-1.5 text-center text-[13px] font-bold text-[#082555] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                      style={{ fontFamily: MONO }}
                      dir="ltr" lang="en"
                    />
                    <span className="text-[9px] font-bold text-[#9A8A6A]">{row.unit || "وحدة"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-[#9A8A6A] tracking-wider" style={{ fontFamily: AR }}>{isEn ? "Rate" : "السعر"}</span>
                    <input type="number" min="0" step="1"
                      value={row.rate}
                      onChange={e => updateRow(key, idx, "rate", e.target.value)}
                      className="w-full rounded-xl border border-[#E2D8C4] px-2 py-1.5 text-center text-[13px] font-bold text-[#082555] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                      style={{ fontFamily: MONO }}
                      dir="ltr" lang="en"
                    />
                    <span className="text-[9px] font-bold text-[#9A8A6A]">{sym}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-[#C9A84C] tracking-wider" style={{ fontFamily: MONO }}>TOTAL</span>
                    <div
                      className="w-full rounded-xl border border-[#C9A84C]/40 bg-[#FFFBF0] px-2 py-1.5 text-center text-[13px] font-bold text-[#082555] shadow-sm"
                      style={{ fontFamily: MONO }}
                      dir="ltr" lang="en"
                    >
                      {fmt((Number(row.qty)||0)*(Number(row.rate)||0))}
                    </div>
                    <span className="text-[9px] font-bold text-[#9A8A6A]">{sym}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Overhead & Profit */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white border border-[#E2D8C4] p-3 text-center">
          <p className="mb-1.5 text-[11px] text-[#9A8A6A]">{isEn ? "Overhead %" : "المصاريف العامة %"}</p>
          <input type="number" min="0" max="50"
            value={overhead} onChange={e => setOverhead(e.target.value)}
            className="w-full rounded-lg border border-[#E2D8C4] px-2 py-1.5 text-center text-[16px] font-bold text-[#082555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>
        <div className="rounded-xl bg-white border border-[#E2D8C4] p-3 text-center">
          <p className="mb-1.5 text-[11px] text-[#9A8A6A]">{isEn ? "Profit Margin %" : "هامش الربح %"}</p>
          <input type="number" min="0" max="100"
            value={profit} onChange={e => setProfit(e.target.value)}
            className="w-full rounded-lg border border-[#E2D8C4] px-2 py-1.5 text-center text-[16px] font-bold text-[#082555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-4 rounded-2xl bg-[#082555] p-4 shadow-xl">
        <h3 className="mb-3 text-[13px] font-bold text-[#C9A84C]">{isEn ? `Cost Summary (for quantity ${qty} ${item.unit})` : `ملخص التكلفة (للكمية ${qty} ${item.unit})`}</h3>
        <div className="space-y-1.5">
          {[
            { label: isEn ? "Materials" : "مواد",         val: matTotal * (Number(qty)||1), color: "text-blue-300"   },
            { label: isEn ? "Labour" : "عمالة",        val: labTotal * (Number(qty)||1), color: "text-green-300"  },
            { label: isEn ? "Equipment" : "معدات",        val: eqpTotal * (Number(qty)||1), color: "text-orange-300" },
            { label: isEn ? "Direct Cost" : "تكلفة مباشرة",val: direct,   color: "text-white font-bold", sep: true },
            { label: isEn ? `Overhead ${overhead}%` : `مصاريف عامة ${overhead}%`, val: indirect,  color: "text-[#E2D8C4]" },
            { label: isEn ? `Profit ${profit}%` : `ربح ${profit}%`,            val: profitAmt, color: "text-[#E2D8C4]" },
          ].map(({ label, val, color, sep }, i) => (
            <div key={i}>
              {sep && <div className="my-2 border-t border-[#1e3a6e]" />}
              <div className="flex justify-between">
                <span className={`text-[12px] ${color || "text-[#9A8A6A]"}`}>{label}</span>
                <span className={`text-[12px] ${color || "text-[#9A8A6A]"}`} style={{ fontFamily: MONO }}>{fmt(val)} {sym}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-[#C9A84C] p-3 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-[#082555] opacity-70">{isEn ? "Unit Price" : "سعر الوحدة"}</p>
            <p className="text-[22px] font-bold text-[#082555] leading-tight" style={{ fontFamily: MONO }}>{fmt(unitPrice)} <span className="text-[13px]">{sym}</span></p>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-[#082555] opacity-70">{isEn ? "Total" : "الإجمالي"}</p>
            <p className="text-[18px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmt(total)} {sym}</p>
          </div>
        </div>
        {item.market > 0 && (
          <p className={`mt-2 text-center text-[11px] font-bold ${unitPrice <= item.market ? "text-green-400" : "text-red-400"}`}>
            {unitPrice <= item.market
              ? (isEn ? `✓ Your price is below market by ${fmt(item.market - unitPrice)} ${sym}` : `✓ سعرك أقل من السوق بـ ${fmt(item.market - unitPrice)} ${sym}`)
              : (isEn ? `⚠ Your price is above market by ${fmt(unitPrice - item.market)} ${sym}` : `⚠ سعرك أعلى من السوق بـ ${fmt(unitPrice - item.market)} ${sym}`)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={() => onSave({ unitPrice, total, direct, indirect, profitAmt })}
          className="flex-1 rounded-xl bg-[#082555] py-3 text-[13px] font-bold text-[#C9A84C] shadow-lg hover:bg-[#0d2f5e] transition active:scale-[0.98]">
          💾 {isEn ? "Save to Account" : "حفظ في الحساب"}
        </button>
        <button
          onClick={() => {
            const cObj = COUNTRIES[country] || COUNTRIES.sa;
            const q = Number(qty) || 1;
            const resList = [];
            (resources["مواد"]  || []).forEach(r => resList.push({ type: "مواد",   name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q }));
            (resources["عمالة"] || []).forEach(r => resList.push({ type: "عمالة",  name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q }));
            (resources["معدات"] || []).forEach(r => resList.push({ type: "معدات",  name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q }));
            const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
            onExport?.({ item, c: cObj, q, f: 1, overhead: Number(overhead)||0, profit: Number(profit)||0, matT: matTotal*q, labT: labTotal*q, eqpT: eqpTotal*q, direct, indirect, profitAmt, finalTotal: total, unitPrice, resourcesList: resList, now });
          }}
          className="flex-1 rounded-xl bg-white border-2 border-[#082555] py-3 text-[13px] font-bold text-[#082555] hover:bg-[#F5EDD8] transition active:scale-[0.98]">
          {isEn ? "Export Item Analysis" : "تصدير تحليل البند"}
        </button>
      </div>

      {/* Ad Banner — self pricing after actions */}
      <div className="pb-6">
        <SelfPricingAdBanner
          adBanner={selfPricingAd}
          canManageAds={canManageAds}
        />
      </div>
    </div>
  );
}

function SelfPricingAdBanner({ adBanner, canManageAds }) {
  const hasContent = adBanner?.enabled && adBanner?.imageUrl;
  const handleToggle = async (nextEnabled) => {
    return null;
  };
  const handleRemove = async () => {
    const ok = window.confirm("هل تريد إزالة محتوى هذا الإعلان؟");
    if (!ok) return;
    return null;
  };
  return (
    <div className="relative rounded-2xl border-2 border-[#E2D8C4] bg-white p-2.5 shadow-sm overflow-hidden">
      {canManageAds && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <button type="button" onClick={() => handleToggle(true)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm" style={{ fontFamily: AR }}>
            إظهار
          </button>
          <button type="button" onClick={() => handleToggle(false)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm" style={{ fontFamily: AR }}>
            إخفاء
          </button>
          <button type="button" onClick={handleRemove}
            className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 shadow-sm" style={{ fontFamily: AR }}>
            إزالة
          </button>
        </div>
      )}
      {hasContent ? (
        <>
          <button type="button" onClick={() => adBanner?.targetUrl && window.open(adBanner.targetUrl, "_blank", "noopener,noreferrer")}
            className="mx-auto block h-[230px] w-full max-w-[608px] overflow-hidden rounded-xl bg-[#F7F3EC]">
            <img src={adBanner.imageUrl} alt={adBanner.alt || adBanner.title || "self-pricing-ad"} loading="lazy" className="h-full w-full object-cover" />
          </button>
          {adBanner.title && <p className="mt-2 text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>{adBanner.title}</p>}
        </>
      ) : canManageAds ? (
        <div className="mx-auto flex h-[230px] w-full max-w-[608px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d4a843]/35 bg-[#fff9ec] px-4 py-5 text-center">
          <p className="text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>مساحة إعلانية</p>
        </div>
      ) : (
        <AdSenseUnit />
      )}
    </div>
  );
}

function HistoryScreen({ savedAnalyses, onView }) {
  if (!savedAnalyses || savedAnalyses.length === 0) {
    return (
      <div className="py-20 text-center animate-in fade-in duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EDD8] text-[#C9A84C]">
           <FileIcon className="h-10 w-10" />
        </div>
        <p className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>لا يوجد تحليلات محفوظة بعد</p>
        <p className="mt-2 text-[13px] text-[#9A8A6A]" style={{ fontFamily: AR }}>ابدأ بتحليل بند أو مساحة وقم بحفظه للرجوع إليه لاحقاً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HistoryInsightGraphic savedAnalyses={savedAnalyses} />

      <div className="px-2">
        <h3 className="text-[15px] font-bold text-[#082555]" style={{ fontFamily: AR }}>السجل الأخير ({savedAnalyses.length})</h3>
      </div>
      <div className="grid gap-3">
        {savedAnalyses.map((item) => (
          <button
            key={item.id}
            onClick={() => onView(item)}
            className="flex w-full flex-col gap-3 rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 text-right transition-all hover:border-[#C9A84C] hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                item.mode === 'area' ? 'bg-[#082555] text-[#C9A84C]' : 'bg-[#C9A84C] text-[#082555]'
              }`} style={{ fontFamily: MONO }}>
                {item.mode === 'area' ? 'BUILDING' : item.itemNum || 'ITEM'}
              </span>
              <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: MONO }}>
                {new Date(item.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>

            <div className="flex-1">
              <div className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{item.itemName}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-[#9A8A6A]" style={{ fontFamily: AR }}>
                <span>{item.projectName}</span>
                <span className="h-1 w-1 rounded-full bg-[#E2D8C4]" />
                <span>{item.companyName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#F7F3EC] pt-3">
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-[#9A8A6A] uppercase">Total Cost</span>
                <div className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                  {fmtNum(item.projectTotal || item.results.finalTotal || item.results.total)}
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-[#9A8A6A] uppercase">Unit Price</span>
                <div className="text-[16px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>
                  {fmtNum(item.finalUnitPrice || item.results.unitPrice)}
                </div>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F7F3EC]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.mode === "area" ? 100 : Math.max(25, Math.min(100, ((item.results?.profitAmt || item.results?.finalTotal || 1) / Math.max(item.projectTotal || item.results?.finalTotal || item.results?.total || 1, 1)) * 100))}%`,
                  background: item.mode === "area"
                    ? "linear-gradient(90deg,#6FCF97 0%,#C9A84C 100%)"
                    : "linear-gradient(90deg,#E07B2A 0%,#C9A84C 100%)",
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CSIScreen({ country, onSelectItem, onSelfPrice, itemLocked = false, itemRemaining = null, onOpenFullAccess, afterDiv28AdBanner, isGuest = false, onOpenAuthScreen }) {
  const [search, setSearch] = useState("");
  const [openDiv, setOpenDiv] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return CSI_DIVISIONS;
    return CSI_DIVISIONS.map((div) => {
      const matchDiv = div.ar.includes(term) || div.en.toLowerCase().includes(term) || div.num.includes(term);
      const matchItems = div.items.filter((it) => it.ar.includes(term) || it.num.includes(term) || it.unit.includes(term));
      if (!matchDiv && matchItems.length === 0) return null;
      return { ...div, items: matchDiv ? div.items : matchItems };
    }).filter(Boolean);
  }, [search]);
  const isSearching = search.trim().length > 0;
  return (
    <div className="space-y-3">

      {/* Access status banner */}
      {!itemLocked && Number.isFinite(itemRemaining) && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#d4a843]/30 bg-[#fffbf0] px-4 py-3">
          <span className="text-lg">🎯</span>
          <p className="text-[12px] font-bold text-[#7a5c1e]" style={{ fontFamily: AR }}>
            المتبقي في الخطة المجانية: <span className="text-[#C9A84C]">{itemRemaining} بند</span>
          </p>
        </div>
      )}

      {/* Legacy locked state fallback */}
      {itemLocked && (
        <div className="overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#082555] to-[#0d3070] px-4 py-3">
            <p className="text-[13px] font-bold text-white" style={{ fontFamily: AR }}>🔒 تم الوصول للحد المجاني</p>
          </div>
          <div className="p-4">
            <p className="text-[12px] leading-6 text-[#5A4E38]" style={{ fontFamily: AR }}>
              اشترك للوصول الكامل لجميع البنود وتسعير المباني بدون حدود.
            </p>
            <button type="button"
              onClick={isGuest ? () => setShowGuestPrompt(true) : onOpenFullAccess}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] py-2.5 text-[13px] font-bold text-[#082555] shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ fontFamily: AR }}>
              {isGuest ? "سجّل دخولك ثم اشترك ←" : "فتح صفحة الاشتراك ←"}
            </button>
          </div>
        </div>
      )}

      {/* Guest login modal */}
      <GuestLoginModal open={showGuestPrompt} onClose={() => setShowGuestPrompt(false)}
        onOpenAuthScreen={onOpenAuthScreen}
        subtitle="سجّل دخولك أو أنشئ حساباً للوصول لجميع البنود وتسعير المباني" />

      {/* Search card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-sm">
        <div className="border-b border-[#E2D8C4] bg-gradient-to-r from-[#082555] to-[#0d3070] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">CSI MasterFormat 2024</span>
            {c && (
              <span className="rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#E8C97A]">
                {c.name}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#E2D8C4] bg-[#F7F3EC] px-3 focus-within:border-[#C9A84C] focus-within:bg-white transition-all">
            <span className="shrink-0 text-[16px]">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن بند أو وصف..."
              className="h-[44px] flex-1 bg-transparent text-[14px] font-medium text-[#082555] outline-none placeholder:text-[#B0A090]"
              style={{ fontFamily: AR }} />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#E2D8C4] text-[10px] font-bold text-[#9A8A6A] hover:bg-[#C9A84C]/20">
                ✕
              </button>
            )}
          </div>
          {isSearching && (
            <p className="mt-2 px-1 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
              {filtered.reduce((n, d) => n + d.items.length, 0)} نتيجة
            </p>
          )}
        </div>
      </div>

      {/* Division cards */}
      <div className="flex flex-col gap-2">
        {filtered.map((div) => {
          const isOpen = isSearching || openDiv === div.num;
          const price = c?.rates?.[div.rateKey] > 0 ? c.rates[div.rateKey] : null;
          const card = (
            <div key={div.num}
              className="overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px">

              {/* Division header */}
              <button type="button" onClick={() => setOpenDiv(openDiv === div.num ? null : div.num)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-right transition-colors duration-150 ${isOpen ? "bg-[#F5EDD8]" : "hover:bg-[#F5EDD8]/40"}`}>
                {/* Num badge */}
                <span className="shrink-0 rounded-xl bg-[#082555] px-2.5 py-1.5 text-[11px] font-black text-[#E8C97A] shadow-sm"
                  style={{ fontFamily: MONO }}>{div.num}</span>

                {/* Name */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-[14px] font-bold leading-snug text-[#082555]" style={{ fontFamily: AR }}>{div.ar}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9A8A6A]">{div.en}</div>
                </div>

                {/* Price + count + chevron */}
                <div className="flex shrink-0 items-center gap-2">
                  {price && (
                    <div className="hidden sm:block text-right">
                      <div className="text-[13px] font-black text-[#C9A84C]" style={{ fontFamily: MONO }}>{price.toLocaleString()}</div>
                      <div className="text-[8px] font-bold uppercase text-[#9A8A6A]">{c.currency}/{div.unit}</div>
                    </div>
                  )}
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#082555]/8 text-[11px] text-[#082555]/50 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </div>
              </button>

              {/* Items list */}
              {isOpen && (
                <div className="border-t border-[#E2D8C4]">
                  {div.items.map((item, idx) => (
                    <div key={item.num}
                      className={`group flex flex-col gap-2.5 border-b border-[#E2D8C4] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[#FFFDF8]
                        sm:flex-row sm:items-center sm:gap-4 ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"}`}>

                      {/* Item code + name */}
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="mt-0.5 shrink-0 rounded-lg bg-[#F5EDD8] px-2 py-1 text-[10px] font-black text-[#C9A84C]"
                          style={{ fontFamily: MONO }}>{item.num}</span>
                        <span className="text-[13px] font-bold leading-snug text-[#082555]"
                          style={{ fontFamily: AR }}>{item.ar}</span>
                      </div>

                      {/* Unit + buttons */}
                      <div className="flex items-center gap-2 sm:shrink-0">
                        <span className="rounded-lg border border-[#E2D8C4] bg-[#F7F3EC] px-2.5 py-1 text-[10px] font-bold text-[#9A8A6A]">
                          {item.unit}
                        </span>
                        <button type="button"
                          onClick={itemLocked ? (isGuest ? () => setShowGuestPrompt(true) : () => onOpenFullAccess?.()) : () => onSelfPrice(item, div)}
                          className="flex-1 sm:flex-none min-h-[36px] rounded-xl border border-[#082555]/20 bg-white px-3 text-[11px] font-bold text-[#082555] shadow-sm transition-all duration-150 hover:border-[#082555] hover:bg-[#F5EDD8] hover:shadow-md active:scale-[0.96]"
                          style={{ fontFamily: AR }}>
                          {itemLocked ? "🔒 مقفول" : "💡 سعر بنفسك"}
                        </button>
                        <button type="button"
                          onClick={itemLocked ? (isGuest ? () => setShowGuestPrompt(true) : () => onOpenFullAccess?.()) : () => onSelectItem(item, div)}
                          className="flex-1 sm:flex-none min-h-[36px] rounded-xl bg-[#C9A84C] px-4 text-[12px] font-bold text-[#082555] shadow-sm transition-all duration-150 hover:bg-[#E8C97A] hover:shadow-md active:scale-[0.96]"
                          style={{ fontFamily: AR }}>
                          {itemLocked ? "🔒" : "اختر"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

          /* ── AdSense after division 28 ── */
          if (div.num === "28") {
            return (
              <div key={`${div.num}-wrap`}>
                {card}
                {(!afterDiv28AdBanner || afterDiv28AdBanner.enabled !== false) && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-[#E2D8C4] bg-white shadow-sm">
                    <AdSenseUnit className="min-h-[100px]" />
                  </div>
                )}
              </div>
            );
          }

          return card;
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-[#E2D8C4] bg-white py-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>لا توجد نتائج</p>
          <p className="mt-1 text-[11px] text-[#9A8A6A]" style={{ fontFamily: AR }}>جرب كلمة بحث مختلفة</p>
        </div>
      )}
    </div>
  );
}

function Marker({ label, value, color, pos, isPrice = false }) {
  const formatted = fmtNum(value);
  const isLarge = formatted.length > 8;

  return (
    <div className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-10 transition-all duration-500" style={{ left: `${100 - pos}%` }}>
      <div className="flex flex-col items-center mb-1">
        {isPrice ? (
          <div className="bg-[#C9A84C] text-[#082555] px-2 py-1 rounded-lg shadow-md relative mb-1 text-center min-w-[60px]">
            <div className="text-[9px] font-bold leading-none opacity-80">{label}</div>
            <div className={`font-bold leading-tight ${isLarge ? 'text-[10px]' : 'text-[11px]'}`} style={{ fontFamily: MONO }}>{formatted}</div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-t-[5px] border-t-[#C9A84C] border-x-[5px] border-x-transparent" />
          </div>
        ) : (
          <div className="flex flex-col items-center mb-1">
             <span className="text-[9px] font-bold text-[#9A8A6A] leading-none whitespace-nowrap mb-0.5">{label}</span>
             <span className={`font-bold text-[#082555] leading-tight ${isLarge ? 'text-[9px]' : 'text-[10px]'}`} style={{ fontFamily: MONO }}>{formatted}</span>
          </div>
        )}
      </div>
      <div className="h-[14px] w-[14px] rounded-full border-[2.5px] border-white shadow-sm" style={{ backgroundColor: color }} />
      <div className="h-8 w-[1px] border-l border-dashed mt-0.5 opacity-20" style={{ borderColor: color }} />
    </div>
  );
}

function MarketComparisonCard({ myPrice, mkt, status, sym }) {
  if (status.status === 'no_mkt') return null;

  const values = [mkt, myPrice, mkt * 0.8, mkt * 1.2].filter(v => v > 0);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.15;

  const mktMin = mkt * 0.8;
  const mktMax = mkt * 1.2;

  const getPos = (v) => {
    const p = ((v - minVal) / (maxVal - minVal)) * 100;
    return Math.max(5, Math.min(95, p));
  };

  const myPos = myPrice > 0 ? getPos(myPrice) : null;
  const avgPos = getPos(mkt);
  const minPos = getPos(mktMin);
  const maxPos = getPos(mktMax);

  return (
    <div className="rounded-[32px] border-2 border-[#E2D8C4] bg-white p-4 shadow-sm overflow-hidden mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="h-9 w-9 rounded-xl bg-[#082555] flex items-center justify-center text-[#C9A84C]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m19 9-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>مقارنة السوق</h3>
        </div>
        {status.status !== 'no_price' && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[12px] font-bold shadow-sm transition-all duration-500"
               style={{ backgroundColor: status.bg, color: status.color }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
            {status.badge}
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-[#F7F3EC] bg-[#FAFAFA] p-3 flex flex-col items-center">
             <div className="text-[10px] font-bold text-[#9A8A6A] uppercase tracking-widest mb-1">سعرك</div>
             <div className="flex items-baseline gap-1">
               <span className="text-[16px] sm:text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{myPrice > 0 ? fmtNum(myPrice) : "0"}</span>
               <span className="text-[10px] sm:text-[11px] font-bold text-[#C9A84C]">{sym}</span>
             </div>
        </div>
        <div className="rounded-2xl border-2 border-[#F7F3EC] bg-[#FAFAFA] p-3 flex flex-col items-center">
             <div className="text-[10px] font-bold text-[#9A8A6A] uppercase tracking-widest mb-1">متوسط السوق</div>
             <div className="flex items-baseline gap-1">
               <span className="text-[16px] sm:text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(mkt)}</span>
               <span className="text-[10px] sm:text-[11px] font-bold text-[#9A8A6A]">{sym}</span>
             </div>
        </div>
      </div>

      {status.status === 'no_price' ? (
        <div className="py-12 text-center rounded-3xl bg-[#F7F3EC]/30 border-2 border-dashed border-[#E2D8C4]">
           <p className="text-[14px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>أدخل التكاليف لعرض المقارنة البيانية</p>
        </div>
      ) : (
        <>
          <div className="relative pt-12 pb-10 px-3 mb-4">
             <div className="h-2 w-full rounded-full bg-[#E2D8C4] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-red-400/10 via-emerald-400/10 to-emerald-500/10" />
             </div>

             <Marker label="أقل سعر" value={mktMin} color="#10B981" pos={minPos} />
             <Marker label="أعلى سعر" value={mktMax} color="#EF4444" pos={maxPos} />
             <Marker label="المتوسط" value={mkt} color="#2563EB" pos={avgPos} />
             {myPos !== null && (
               <Marker label="سعرك" value={myPrice} color="#C9A84C" pos={myPos} isPrice />
             )}
          </div>

          <div className="rounded-2xl p-4 flex items-start gap-3 transition-all duration-500 border-2" style={{ backgroundColor: status.bg, borderColor: `${status.color}20` }}>
             <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-black/5" style={{ backgroundColor: status.color }}>
               <span className="text-white text-2xl">{status.icon}</span>
             </div>
             <div className="flex-1">
               <div className="text-[14px] font-bold text-[#082555] leading-tight" style={{ fontFamily: AR }}>{status.desc}</div>
               <div className="text-[12px] font-medium text-[#9A8A6A] mt-1 leading-relaxed" style={{ fontFamily: AR }}>{status.subDesc}</div>
             </div>
          </div>
        </>
      )}

      <div className="mt-5 pt-3 border-t border-[#F7F3EC] flex items-center justify-center gap-2 text-[#9A8A6A]/50">
         <span className="text-xs">💡</span>
         <p className="text-[10px] font-bold" style={{ fontFamily: AR }}>تعتمد المقارنة على خوارزمية تسييرة لمتوسطات السوق المحلية</p>
      </div>
    </div>
  );
}

function AnalysisAdBanner({ adBanner, canManageAds = false, onManageAds, onToggleVisibility, onRemove }) {
  const hasContent = adBanner?.enabled && adBanner?.imageUrl;
  const isEnabled = adBanner?.enabled === true;

  const handleClick = () => {
    if (!hasContent || !adBanner?.targetUrl) return;
    window.open(adBanner.targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative rounded-[24px] border border-[#E2D8C4] bg-white p-3 shadow-sm overflow-hidden">
      {canManageAds ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onManageAds?.(adBanner?.slotId || AD_SLOT_IDS.analysisPreResult, adBanner)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility?.(adBanner?.slotId || AD_SLOT_IDS.analysisPreResult, adBanner, true)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            إظهار
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility?.(adBanner?.slotId || AD_SLOT_IDS.analysisPreResult, adBanner, false)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#082555] shadow-sm"
            style={{ fontFamily: AR }}
          >
            إخفاء
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm("هل تريد إزالة محتوى هذا الإعلان؟");
              if (!ok) return;
              onRemove?.(adBanner?.slotId || AD_SLOT_IDS.analysisPreResult, adBanner);
            }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 shadow-sm"
            style={{ fontFamily: AR }}
          >
            إزالة
          </button>
        </div>
      ) : null}

      {hasContent ? (
        <>
          <button
            type="button"
            onClick={handleClick}
            className="mx-auto block h-[230px] w-full max-w-[608px] overflow-hidden rounded-2xl bg-[#F7F3EC]"
          >
            <img
              src={adBanner.imageUrl}
              alt={adBanner.alt || adBanner.title || "ad-banner"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
          {adBanner.title ? (
            <p className="mt-2 text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
              {adBanner.title}
            </p>
          ) : null}
        </>
      ) : canManageAds ? (
        <div className="mx-auto flex h-[230px] w-full max-w-[608px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d4a843]/40 bg-[#fff9ec] px-4 py-5 text-center">
          <span className="mb-2 rounded-full bg-[#C9A84C]/12 px-3 py-1 text-[10px] font-bold text-[#8B6A1F]" style={{ fontFamily: AR }}>
            مساحة إعلانية
          </span>
          <p className="text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
            {isEnabled ? "الإعلان مفعّل لكن بدون صورة حالية" : "لا توجد صورة إعلان مفعلة لهذا المكان"}
          </p>
          <p className="mt-1 text-[10px] text-[#9A8A6A]" style={{ fontFamily: AR }}>
            اضغط تعديل الإعلان لإضافة الصورة والرابط
          </p>
        </div>
      ) : (
        <AdSenseUnit />
      )}
    </div>
  );
}

function AnalysisScreen({
  authMode,
  country, selectedItem, resources, setResources, onOpenAddModal, onSave, onRfq, onExport, toast,
  qty, setQty, overhead, setOverhead, profit, setProfit, factor, setFactor,
  settings, topAdBanner, actionsAdBanner, bottomAdBanner, canManageAds = false, onManageAds, onToggleAdVisibility, onRemoveAd,
}) {
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const sym = c.currency;
  const mkt = selectedItem ? selectedItem.market : 0;
  const [taxPct, setTaxPct] = useState(() => Number(settings?.taxPercent) || 15);
  const isAuthenticated = authMode && authMode !== "guest";

  const calc = useMemo(() => {
    if (!selectedItem) return null;
    const q = Number(qty) || 1;
    const f = Number(factor) || 1;
    let matT = 0, labT = 0, eqpT = 0;
    (resources["مواد"] || []).forEach((r) => (matT += r.qty * r.rate * q * f));
    (resources["عمالة"] || []).forEach((r) => (labT += r.qty * r.rate * q * f));
    (resources["معدات"] || []).forEach((r) => (eqpT += r.qty * r.rate * q * f));
    const direct = matT + labT + eqpT;
    const indirect = (direct * Number(overhead)) / 100;
    const withOverhead = direct + indirect;
    const profitAmt = withOverhead * (Number(profit) / 100);
    const finalTotal = withOverhead + profitAmt;
    const taxAmt = finalTotal * (taxPct / 100);
    const totalWithTax = finalTotal + taxAmt;
    const unitPrice = q > 0 ? finalTotal / q : finalTotal;
    return { matT, labT, eqpT, direct, indirect, withOverhead, profitAmt, finalTotal, taxAmt, totalWithTax, unitPrice };
  }, [resources, qty, factor, overhead, profit, selectedItem, taxPct]);

  const marketStatus = useMemo(() => {
    if (!mkt) return { status: 'no_mkt', label: '—', color: '#9A8A6A', bg: 'rgba(154,138,106,0.1)' };
    const myPrice = calc?.unitPrice || 0;
    if (myPrice === 0) return { status: 'no_price', label: 'أدخل سعراً', color: '#E07B2A', bg: 'rgba(224,123,42,0.1)', icon: '⏳' };

    const ratio = myPrice / mkt;
    const diff = Math.abs(((myPrice - mkt) / mkt) * 100).toFixed(1);

    if (ratio <= 0.95) {
      return {
        status: 'low', label: 'ممتاز', badge: 'سعر تنافسي', color: '#10B981', bg: 'rgba(16,185,129,0.1)',
        desc: `سعرك أقل من متوسط السوق بنسبة ${diff}%`,
        subDesc: 'سعرك ممتاز ومناسب جداً للمنافسة في السوق حالياً', icon: '✅'
      };
    } else if (ratio <= 1.1) {
      return {
        status: 'normal', label: 'جيد', badge: 'ضمن النطاق الطبيعي', color: '#3D7A5A', bg: 'rgba(61,122,90,0.1)',
        desc: `سعرك ضمن النطاق الطبيعي للسوق`,
        subDesc: 'سعرك عادل ومقارب لمتوسطات السوق الحالية', icon: '✅'
      };
    } else if (ratio <= 1.25) {
      return {
        status: 'high', label: 'مقبول', badge: 'أعلى من المتوسط', color: '#E07B2A', bg: 'rgba(224,123,42,0.1)',
        desc: `سعرك أعلى من متوسط السوق بنسبة ${diff}%`,
        subDesc: 'سعرك مرتفع قليلاً، قد ترغب في مراجعة هوامش الربح', icon: '⚠️'
      };
    } else {
      return {
        status: 'very-high', label: 'مرتفع', badge: 'سعر مرتفع جداً', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',
        desc: `سعرك أعلى من متوسط السوق بنسبة ${diff}%`,
        subDesc: 'تكاليفك مرتفعة بشكل ملحوظ عن متوسطات السوق', icon: '⚠️'
      };
    }
  }, [calc, mkt]);

  function updateRate(type, i, val) {
    setResources((prev) => { const copy = { ...prev, [type]: [...prev[type]] }; copy[type][i] = { ...copy[type][i], rate: parseFloat(val) || 0 }; return copy; });
  }
  function updateQty(type, i, val) {
    setResources((prev) => { const copy = { ...prev, [type]: [...prev[type]] }; copy[type][i] = { ...copy[type][i], qty: parseFloat(val) || 0 }; return copy; });
  }
  function deleteResource(type, i) {
    setResources((prev) => ({ ...prev, [type]: prev[type].filter((_, idx) => idx !== i) }));
  }

  if (!selectedItem) return null;

  const SECTIONS = [
    { key: "مواد", label: "المواد", icon: "🧱" },
    { key: "عمالة", label: "العمالة", icon: "👷" },
    { key: "معدات", label: "المعدات", icon: "🚛" },
  ];

  return (
    <div className="space-y-4 pb-8">
      {!isAuthenticated && (
        <div className="rounded-2xl border-2 border-[#E2D8C4] bg-[#FFF8E7] p-4 text-[13px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
          يمكنك استعراض التحليل فقط كزائر. تعديل الأسعار والكميات داخل هذه الشاشة متاح للمستخدم المسجّل، والتعديلات تبقى مؤقتة داخل الجلسة فقط.
        </div>
      )}

      {/* Visual Header Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#082555] p-5 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.15),transparent)] pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="rounded-xl bg-[#C9A84C] px-3 py-1.5 text-[11px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{selectedItem.num}</span>
          <div className="flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
             <span className="text-[10px] font-bold text-[#9A8A6A] tracking-[0.2em] uppercase" style={{ fontFamily: MONO }}>Analysis Engine</span>
          </div>
        </div>
        <div className="text-[17px] sm:text-[20px] font-bold text-white leading-tight mb-2" style={{ fontFamily: AR }}>{selectedItem.ar}</div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#9A8A6A] mb-5" style={{ fontFamily: AR }}>
          <span>{selectedItem.divAr}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="text-[10px] uppercase">{selectedItem.divEn}</span>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <div className="flex-1 flex items-center gap-3 rounded-2xl bg-white/5 p-2.5 backdrop-blur-sm border border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0" style={{ backgroundColor: marketStatus.bg }}>
               <span className="text-xl">{marketStatus.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9A8A6A] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: AR }}>حالة السعر مقارنة بالسوق</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-bold text-[#E8C97A]" style={{ fontFamily: MONO }}>{marketStatus.label}</span>
                <span className="text-[11px] font-bold text-[#9A8A6A]">/ {marketStatus.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 px-1"
      >
        {[
          { label: "الكمية", val: qty, setter: setQty, unit: selectedItem.unit, step: "0.1" },
          { label: "مصاريف غير مباشرة", val: overhead, setter: setOverhead, unit: "%", step: "0.1" },
          { label: "الربح", val: profit, setter: setProfit, unit: "%", step: "0.1" },
          { label: "معامل الأمان", val: factor, setter: setFactor, unit: "F", step: "0.01" },
        ].map(({ label, val, setter, unit: u, step }) => (
          <div
            key={label}
            className="min-w-0 rounded-[24px] border-2 border-[#E2D8C4] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(8,37,85,0.08)] transition-all hover:border-[#C9A84C]"
          >
            <div className="flex min-h-[72px] flex-col justify-between gap-2">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A8A6A]" style={{ fontFamily: AR }}>
                    {label}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#C9A84C]" style={{ fontFamily: AR }}>
                    {u}
                  </p>
                </div>
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C9A84C]/70" />
              </div>
              <div className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-2 shadow-sm">
                <input
                  type="number"
                  value={val}
                  step={step}
                  onChange={(e) => setter(e.target.value)}
                  disabled={!isAuthenticated}
                  className="w-full bg-transparent text-center text-[18px] font-black leading-none text-[#082555] outline-none"
                  style={{ fontFamily: MONO }}
                  dir="ltr"
                  lang="en"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {SECTIONS.map(({ key, label, icon }) => {
        const sectionTotal = (resources[key] || []).reduce((s, r) => s + r.qty * r.rate * (Number(qty) || 1) * (Number(factor) || 1), 0);
        return (
          <div key={key} className="rounded-2xl border-2 border-[#E2D8C4] bg-white shadow-sm">
            <div className="flex min-h-[50px] items-center justify-between px-4 py-2 border-b-2 border-[#E2D8C4] bg-[#FAFAFA] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{icon}</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{label}</span>
                  <span className="text-[9px] font-bold text-[#9A8A6A] uppercase tracking-tighter">{resources[key]?.length || 0} ITEMS</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex flex-col items-start rounded-2xl border border-[#C9A84C]/35 bg-[#FFFBF0] px-3 py-2 text-left shadow-sm">
                  <div className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                    {fmtNum(sectionTotal)} <span className="text-[11px] font-bold text-[#C9A84C]">{sym}</span>
                  </div>
                  <div className="text-[8px] font-bold text-[#9A8A6A] uppercase">TOTAL</div>
                </div>
                <button type="button" onClick={() => onOpenAddModal(key)} disabled={!isAuthenticated}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#C9A84C] text-[#082555] shadow-sm transition hover:bg-[#E8C97A] active:scale-[0.9]">
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="min-w-0">
                {/* Column header — shown once per section */}
                {(resources[key] || []).length > 0 && (
                  <div className="hidden sm:grid sm:grid-cols-[34px_minmax(0,_1fr)_72px_84px_92px_34px] sm:items-center sm:gap-[3px] sm:border-b sm:border-[#E2D8C4] sm:bg-[#F7F3EC]/60 sm:px-3 sm:py-2.5">
                    <div />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A8A6A]" style={{ fontFamily: AR }}>البند</div>
                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-[#9A8A6A]" style={{ fontFamily: AR }}>الكمية</div>
                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-[#9A8A6A]" style={{ fontFamily: AR }}>السعر</div>
                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]" style={{ fontFamily: AR }}>الإجمالي</div>
                    <div />
                  </div>
                )}

                {(resources[key] || []).map((r, i) => {
                  const lineTotal = r.qty * r.rate * (Number(qty) || 1) * (Number(factor) || 1);
                  return (
                    <div key={i} className="border-b border-[#E2D8C4] px-3 py-3 last:border-0 transition-colors hover:bg-[#F7F3EC]/50 sm:grid sm:grid-cols-[34px_minmax(0,_1fr)_72px_84px_92px_34px] sm:items-center sm:gap-[3px] sm:px-3">
                      <div className="flex items-start gap-3 sm:hidden">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F3EC] text-xl shadow-inner">{r.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-bold leading-tight text-[#082555]" style={{ fontFamily: AR }}>{r.name}</div>
                          <div className="mt-1 text-[11px] font-bold text-[#C9A84C]">{r.unit}</div>
                        </div>
                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => deleteResource(key, i)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-[#FFF7F7] text-[16px] font-black text-rose-500 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
                        <div>
                          <div className="mb-1 text-center text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>الكمية</div>
                          {isAuthenticated ? (
                            <input
                              type="number" value={r.qty} step="0.01"
                              onChange={(e) => updateQty(key, i, e.target.value)}
                              className="w-full rounded-xl border border-[#E2D8C4] bg-white px-2 py-2 text-center text-[13px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
                              style={{ fontFamily: MONO }}
                            />
                          ) : (
                            <div className="w-full rounded-xl border border-transparent py-2 text-center text-[13px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{r.qty}</div>
                          )}
                        </div>
                        <div>
                          <div className="mb-1 text-center text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>السعر</div>
                          {isAuthenticated ? (
                            <input
                              type="number" value={r.rate} step="0.01"
                              onChange={(e) => updateRate(key, i, e.target.value)}
                              className="w-full rounded-xl border border-[#E2D8C4] bg-white px-2 py-2 text-center text-[13px] font-bold text-[#C9A84C] outline-none focus:border-[#C9A84C]"
                              style={{ fontFamily: MONO }}
                            />
                          ) : (
                            <div className="w-full rounded-xl border border-transparent py-2 text-center text-[13px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>{r.rate}</div>
                          )}
                        </div>
                        <div>
                          <div className="mb-1 text-center text-[10px] font-bold text-[#C9A84C]" style={{ fontFamily: AR }}>الإجمالي</div>
                          <div className="inline-flex w-auto min-w-[96px] items-center justify-center gap-1 rounded-xl border border-[#C9A84C]/40 bg-[#FFFBF0] px-3 py-2 text-center text-[13px] font-bold text-[#082555] shadow-sm" style={{ fontFamily: MONO }}>
                            <span>{fmtNum(lineTotal)}</span>
                            <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F3EC] text-lg shadow-inner sm:flex">{r.icon}</div>

                      <div className="hidden min-w-0 sm:block">
                        <div className="text-[13px] font-bold leading-tight text-[#082555]" style={{ fontFamily: AR }}>{r.name}</div>
                        <div className="mt-0.5 text-[10px] font-bold text-[#C9A84C]">{r.unit}</div>
                      </div>

                      <div className="hidden px-0.5 sm:block">
                        {isAuthenticated ? (
                          <input
                            type="number" value={r.qty} step="0.01"
                            onChange={(e) => updateQty(key, i, e.target.value)}
                            className="w-full rounded-xl border border-[#E2D8C4] bg-white px-1.5 py-2 text-center text-[12px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
                            style={{ fontFamily: MONO }}
                          />
                        ) : (
                          <div className="w-full rounded-xl border border-transparent py-2 text-center text-[12px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{r.qty}</div>
                        )}
                      </div>

                      <div className="hidden px-0.5 sm:block">
                        {isAuthenticated ? (
                          <input
                            type="number" value={r.rate} step="0.01"
                            onChange={(e) => updateRate(key, i, e.target.value)}
                            className="w-full rounded-xl border border-[#E2D8C4] bg-white px-1.5 py-2 text-center text-[12px] font-bold text-[#C9A84C] outline-none focus:border-[#C9A84C]"
                            style={{ fontFamily: MONO }}
                          />
                        ) : (
                          <div className="w-full rounded-xl border border-transparent py-2 text-center text-[12px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>{r.rate}</div>
                        )}
                      </div>

                      <div className="hidden px-0.5 sm:block">
                        <div className="inline-flex w-auto min-w-[92px] items-center justify-center gap-1 rounded-xl border border-[#C9A84C]/40 bg-[#FFFBF0] px-3 py-2 text-center text-[12px] font-bold text-[#082555] shadow-sm" style={{ fontFamily: MONO }}>
                          <span>{fmtNum(lineTotal)}</span>
                          <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
                        </div>
                      </div>

                      <div className="hidden justify-center sm:flex">
                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => deleteResource(key, i)}
                            className="h-8 w-8 flex items-center justify-center rounded-xl bg-white border border-[#E2D8C4] text-[#9A8A6A] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-[#E2D8C4] bg-[#FFFDF8] px-4 py-2 rounded-b-2xl">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#C9A84C]/35 bg-[#FFFBF0] px-3 py-2 shadow-sm">
                <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>إجمالي {label}</span>
                <span className="text-[14px] font-black text-[#082555]" style={{ fontFamily: MONO }}>
                  {fmtNum(sectionTotal)} <span className="text-[10px] font-black text-[#C9A84C]">{sym}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {calc && (
        <div
          className="grid grid-cols-3 gap-2 px-1 sm:gap-3"
        >
          {[
            { label: "إجمالي المواد", value: calc.matT, color: "#C9A84C" },
            { label: "إجمالي العمالة", value: calc.labT, color: "#E07B2A" },
            { label: "إجمالي المعدات", value: calc.eqpT, color: "#6FCF97" },
          ].map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-[24px] border-2 border-[#E2D8C4] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(8,37,85,0.06)]"
            >
              <div className="flex min-h-[88px] flex-col justify-between gap-2 text-right">
                <span className="text-[11px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>{item.label}</span>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-[22px] font-black leading-none" style={{ fontFamily: MONO, color: item.color }}>{fmtNum(item.value)}</span>
                  <span className="text-[11px] font-bold text-[#9A8A6A]">{sym}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {calc && (
        <div className="rounded-[28px] border-2 border-[#E2D8C4] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-[0.2em]">ملخص إجمالي البند</div>
              <div className="mt-1 text-[15px] font-bold text-[#082555]" style={{ fontFamily: AR }}>تجميع البنود مع المصاريف والربح في بطاقة واحدة</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082555] text-[#C9A84C] shadow-lg">
              <PricingIcon className="h-6 w-6" />
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-3"
          >

            {/* مجموع البنود المباشرة */}
            <div className="min-w-0 rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>مجموع البنود المباشرة</div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.direct)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 break-words text-[10px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>
                مواد {fmtNum(calc.matT)} + عمالة {fmtNum(calc.labT)} + معدات {fmtNum(calc.eqpT)} {sym}
              </div>
            </div>

            {/* المصاريف غير المباشرة — editable */}
            <div className="min-w-0 rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>المصاريف غير المباشرة</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#E2D8C4] bg-white px-2 py-1">
                  <input
                    type="number" min="0" max="100" step="0.1"
                    value={overhead}
                    onChange={(e) => setOverhead(e.target.value)}
                    className="w-10 bg-transparent text-center text-[11px] font-bold text-[#082555] outline-none"
                    style={{ fontFamily: MONO }}
                  />
                  <span className="text-[10px] font-bold text-[#9A8A6A]">%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#9A8A6A]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.indirect)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 break-words text-[10px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {overhead}% × {fmtNum(calc.direct)} {sym}
              </div>
            </div>

            {/* هامش الربح — editable */}
            <div className="min-w-0 rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>هامش الربح</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#6FCF97]/50 bg-[#6FCF97]/8 px-2 py-1">
                  <input
                    type="number" min="0" max="100" step="0.1"
                    value={profit}
                    onChange={(e) => setProfit(e.target.value)}
                    className="w-10 bg-transparent text-center text-[11px] font-bold text-[#6FCF97] outline-none"
                    style={{ fontFamily: MONO }}
                  />
                  <span className="text-[10px] font-bold text-[#6FCF97]">%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#6FCF97]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.profitAmt)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 break-words text-[10px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {profit}% × {fmtNum(calc.withOverhead)} {sym}
              </div>
            </div>

            {/* ضريبة القيمة المضافة — editable */}
            <div className="min-w-0 rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>ضريبة القيمة المضافة</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#E07B2A]/50 bg-[#E07B2A]/8 px-2 py-1">
                  <input
                    type="number" min="0" max="100" step="0.1"
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                    className="w-10 bg-transparent text-center text-[11px] font-bold text-[#E07B2A] outline-none"
                    style={{ fontFamily: MONO }}
                  />
                  <span className="text-[10px] font-bold text-[#E07B2A]">%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#E07B2A]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.taxAmt)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 break-words text-[10px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {taxPct}% × {fmtNum(calc.finalTotal)} {sym}
              </div>
            </div>

            {/* إجمالي قبل الضريبة */}
            <div className="min-w-0 rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>إجمالي البند قبل الضريبة</div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.finalTotal)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 break-words text-[10px] font-bold leading-5 text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {fmtNum(calc.withOverhead)} + ربح {fmtNum(calc.profitAmt)} {sym}
              </div>
            </div>

            {/* إجمالي بعد الضريبة */}
            <div className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-3 py-3 sm:px-4">
              <div className="mb-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>إجمالي البند بعد الضريبة</div>
              <div className="flex items-baseline gap-1 text-[20px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>
                <span>{fmtNum(calc.totalWithTax)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
              <div className="mt-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                {fmtNum(calc.finalTotal)} + ضريبة {fmtNum(calc.taxAmt)} {sym}
              </div>
            </div>

          </div>
        </div>
      )}

      <MarketComparisonCard
        myPrice={calc?.unitPrice || 0}
        mkt={mkt}
        status={marketStatus}
        sym={sym}
      />

      {calc && (
        <div className="relative overflow-hidden rounded-[32px] bg-[#082555] p-6 shadow-2xl mt-5 border border-[#C9A84C]/20">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,168,76,0.1)_0%,transparent_100%)] pointer-events-none" />

          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-[0.2em] mb-2">Total Unit Price Analysis</span>
              <div className="flex items-baseline gap-3">
                <span className="text-[24px] sm:text-[32px] font-bold text-[#E8C97A] leading-none" style={{ fontFamily: MONO }}>{fmtNum(calc.unitPrice)}</span>
                <span className="text-[12px] sm:text-[15px] font-bold text-[#9A8A6A] uppercase tracking-widest">{selectedItem.unit} / {sym}</span>
              </div>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-[20px] bg-[#C9A84C] flex items-center justify-center shadow-xl shadow-[#C9A84C]/20">
               <PricingIcon className="h-7 w-7 sm:h-8 sm:w-8 text-[#082555]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:gap-5">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-widest">Gross Proposal</span>
              <div className="text-[18px] font-bold text-white leading-none" style={{ fontFamily: MONO }}>{fmtNum(calc.finalTotal)} <span className="text-[11px] opacity-60 ml-1">{sym}</span></div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-[#C9A84C]">
                <span>مجموع البنود + المصاريف</span>
                <span style={{ fontFamily: MONO }}>{fmtNum(calc.withOverhead)}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-widest">Estimated Margin</span>
              <div className="text-[18px] font-bold text-[#6FCF97] leading-none" style={{ fontFamily: MONO }}>{fmtNum(calc.profitAmt)} <span className="text-[11px] opacity-80 ml-1">{sym}</span></div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#6FCF97]/20 bg-[#6FCF97]/10 px-3 py-1.5 text-[10px] font-bold text-[#6FCF97]">
                <span>هامش الربح</span>
                <span style={{ fontFamily: MONO }}>{profit}%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                if (!selectedItem || !calc) return;
                const cObj = COUNTRIES[country] || COUNTRIES.sa;
                const q = Number(qty) || 1;
                const f = Number(factor) || 1;
                const resList = [];
                (resources["مواد"]  || []).forEach(r => resList.push({ type: "مواد",   name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q*f }));
                (resources["عمالة"] || []).forEach(r => resList.push({ type: "عمالة",  name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q*f }));
                (resources["معدات"] || []).forEach(r => resList.push({ type: "معدات",  name: r.name, qty: r.qty, unit: r.unit, rate: r.rate, total: (Number(r.qty)||0)*(Number(r.rate)||0)*q*f }));
                const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
                onExport?.({ item: selectedItem, c: cObj, q, f, overhead: Number(overhead)||0, profit: Number(profit)||0, matT: calc.matT, labT: calc.labT, eqpT: calc.eqpT, direct: calc.direct, indirect: calc.indirect, profitAmt: calc.profitAmt, finalTotal: calc.finalTotal, unitPrice: calc.unitPrice, resourcesList: resList, now });
              }}
              className="flex-1 min-h-[56px] rounded-2xl bg-[#C9A84C] text-[#082555] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition hover:bg-[#E8C97A] active:scale-[0.98]"
            >
              <PrinterIcon className="h-5 w-5" /> تصدير تحليل البند
            </button>
            <button onClick={onRfq} className="flex-1 min-h-[56px] rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[15px] flex items-center justify-center gap-2 transition hover:bg-white/10 active:scale-[0.98]">
              <TagIcon className="h-5 w-5 text-[#C9A84C]" /> طلب عروض
            </button>
          </div>
        </div>
      )}

      <AnalysisAdBanner
        adBanner={{ ...(actionsAdBanner || {}), slotId: AD_SLOT_IDS.analysisAfterActions }}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
        onToggleVisibility={onToggleAdVisibility}
        onRemove={onRemoveAd}
      />

      <AnalysisAdBanner
        adBanner={{ ...(bottomAdBanner || {}), slotId: AD_SLOT_IDS.analysisPostResult }}
        canManageAds={canManageAds}
        onManageAds={onManageAds}
        onToggleVisibility={onToggleAdVisibility}
        onRemove={onRemoveAd}
      />
    </div>
  );
}

function InlineAdEditorModal({ title, draft, saving = false, onChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082555]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border-2 border-[#E2D8C4] bg-white p-5 shadow-2xl">
        <h3 className="text-[16px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
          {title}
        </h3>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
              عنوان الإعلان
            </span>
            <input
              type="text"
              value={draft?.title || ""}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full rounded-xl border-2 border-[#E2D8C4] px-3 py-2 text-[13px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: AR }}
              placeholder="مثال: خصم خاص لموردي المعدات"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
              رابط الصورة
            </span>
            <input
              type="url"
              value={draft?.imageUrl || ""}
              onChange={(e) => onChange("imageUrl", e.target.value)}
              className="w-full rounded-xl border-2 border-[#E2D8C4] px-3 py-2 text-[12px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }}
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
              رابط التحويل عند الضغط
            </span>
            <input
              type="url"
              value={draft?.targetUrl || ""}
              onChange={(e) => onChange("targetUrl", e.target.value)}
              className="w-full rounded-xl border-2 border-[#E2D8C4] px-3 py-2 text-[12px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }}
              placeholder="https://..."
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-3 py-2">
            <span className="text-[12px] font-bold text-[#082555]" style={{ fontFamily: AR }}>تفعيل الإعلان</span>
            <input
              type="checkbox"
              checked={Boolean(draft?.enabled)}
              onChange={(e) => onChange("enabled", e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border-2 border-[#E2D8C4] px-3 py-2 text-[12px] font-bold text-[#5A4E38]"
            style={{ fontFamily: AR }}
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#082555] px-3 py-2 text-[12px] font-bold text-[#E8C97A] disabled:opacity-60"
            style={{ fontFamily: AR }}
          >
            {saving ? "جارٍ الحفظ..." : "حفظ الإعلان"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketScreen({ country, onSelectItem, onSelfPrice, itemLocked = false, itemRemaining = null, onOpenFullAccess }) {
  const c = country ? COUNTRIES[country] : COUNTRIES["sa"];
  const divs = CSI_DIVISIONS.filter((d) => c.rates[d.rateKey] > 0);
  return (
    <div className="space-y-4">
      {itemLocked ? (
        <div className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4">
          <p className="text-[12px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
            لقد وصلت للحد المجاني للبنود. اشترك الآن لفتح جميع بنود السوق.
          </p>
          <button
            type="button"
            onClick={onOpenFullAccess}
            className="mt-3 w-full rounded-xl bg-[#082555] py-2.5 text-[12px] font-bold text-[#E8C97A]"
          >
            فتح صفحة الاشتراك
          </button>
        </div>
      ) : Number.isFinite(itemRemaining) ? (
        <div className="rounded-2xl border border-[#d4a843]/30 bg-[#fff8e7] px-4 py-3 text-[12px] font-bold text-[#5A4E38]" style={{ fontFamily: AR }}>
          المتبقي لك في الخطة المجانية: {itemRemaining} بند
        </div>
      ) : null}
      <div className="flex items-center justify-between px-2">
        <span className="text-[15px] font-bold text-[#082555]" style={{ fontFamily: AR }}>أسعار السوق الحالية</span>
        <span className="text-[11px] font-bold text-[#9A8A6A] tracking-tighter uppercase" style={{ fontFamily: AR }}>SOURCE: TASEERA · {c.name}</span>
      </div>
      <div className="flex flex-col gap-3">
        {divs.map((d) => {
          const price = c.rates[d.rateKey];
          const changeVal = parseFloat(((Math.sin(d.num.charCodeAt(0)) * 3)).toFixed(1));
          const up = changeVal >= 0;
          return (
            <div key={d.num}
              className="w-full flex min-h-[80px] flex-col items-stretch gap-3 rounded-3xl border-2 border-[#E2D8C4] bg-white p-3 text-right shadow-sm transition-all hover:border-[#C9A84C] hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <div
                className={`flex-1 min-w-0 ${itemLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                onClick={() => {
                  if (itemLocked) {
                    onOpenFullAccess?.();
                    return;
                  }
                  if (d.items[0]) onSelectItem(d.items[0], d);
                }}
              >
                <div className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest" style={{ fontFamily: MONO }}>{d.num} · {d.en}</div>
                <div className="text-[16px] font-bold text-[#082555] mt-1.5 truncate" style={{ fontFamily: AR }}>{d.ar}</div>
                <div className="text-[11px] font-bold text-[#9A8A6A] mt-1.5 flex items-center gap-2">
                  <span className="uppercase tracking-tighter">Avg / {d.unit}</span>
                  <span className="h-1 w-1 rounded-full bg-[#E2D8C4]" />
                  <span className={up ? "text-emerald-600" : "text-amber-600"}>{up ? "↑" : "↓"} {Math.abs(changeVal)}% Trend</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <div className="text-right sm:text-left">
                  <div className="text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{price.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-[#9A8A6A] uppercase tracking-wider">{c.currency}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button"
                    onClick={() => { if (d.items[0]) onSelfPrice(d.items[0], d); }}
                    disabled={itemLocked}
                    className="flex-1 rounded-xl border-2 border-[#082555] bg-white px-3 py-1.5 text-[11px] font-bold text-[#082555] transition hover:bg-[#F5EDD8] active:scale-[0.95] sm:flex-none">
                    {itemLocked ? "🔒 مقفول" : "💡 سعر بنفسك"}
                  </button>
                  <button type="button"
                    onClick={() => { if (d.items[0]) onSelectItem(d.items[0], d); }}
                    disabled={itemLocked}
                    className="flex-1 rounded-xl bg-[#C9A84C] px-3 py-1.5 text-[11px] font-bold text-[#082555] transition hover:bg-[#E8C97A] active:scale-[0.95] sm:flex-none">
                    {itemLocked ? "🔒 مقفول" : "اختر"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddResourceModal({ defaultType, onAdd, onClose }) {
  const [type, setType] = useState(defaultType || "مواد");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("");
  const [rate, setRate] = useState("0");
  const typeMap = { مواد: "mat", عمالة: "lab", معدات: "eqp" };
  const iconMap = { مواد: "🧱", عمالة: "👷", معدات: "🚛" };
  function handleAdd() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), qty: parseFloat(qty) || 1, unit: unit || "وحدة", rate: parseFloat(rate) || 0, badge: typeMap[type], icon: iconMap[type], type });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#082555]/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[720px] rounded-t-[40px] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[18px] font-bold text-[#082555]" style={{ fontFamily: AR }}>إضافة مورد جديد للتحليل</span>
          <button type="button" onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#F7F3EC] text-[#9A8A6A] hover:bg-[#E2D8C4] transition-colors">✕</button>
        </div>
        <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-3">
          {["مواد", "عمالة", "معدات"].map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`min-h-[52px] rounded-2xl border-2 py-2 text-[14px] font-bold transition-all ${type === t ? "border-[#C9A84C] bg-[#F5EDD8] text-[#082555]" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}
              style={{ fontFamily: AR }}>
              <span className="mr-1">{iconMap[t]}</span> {t}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <label className="block text-[12px] font-bold text-[#082555] mb-2 pr-1" style={{ fontFamily: AR }}>وصف المورد</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: خرسانة جاهزة C35"
            className="min-h-[56px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 py-2 text-[15px] font-bold outline-none focus:border-[#C9A84C] transition-colors"
            style={{ fontFamily: AR }} />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
          <div>
            <label className="block text-[12px] font-bold text-[#082555] mb-2 pr-1" style={{ fontFamily: AR }}>الكمية</label>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)}
              className="min-h-[56px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-2 py-2 text-center text-[18px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }} />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#082555] mb-2 pr-1" style={{ fontFamily: AR }}>الوحدة</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="م³"
              className="min-h-[56px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-2 py-2 text-center text-[15px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: AR }} />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#082555] mb-2 pr-1" style={{ fontFamily: AR }}>سعر الوحدة</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
              className="min-h-[56px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-2 py-2 text-center text-[18px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
              style={{ fontFamily: MONO }} />
          </div>
        </div>
        <button type="button" onClick={handleAdd}
          className="min-h-[64px] w-full rounded-3xl bg-[#082555] py-3 text-[17px] font-bold text-[#C9A84C] shadow-xl shadow-[#082555]/20 transition hover:bg-[#252018] active:scale-[0.98]"
          style={{ fontFamily: AR }}>
          إضافة المورد للقائمة
        </button>
      </div>
    </div>
  );
}

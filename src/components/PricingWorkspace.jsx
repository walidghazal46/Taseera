import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { SaveIcon, TagIcon, BuildingsIcon, PricingIcon, ChevronLeftIcon, ArrowRightIcon, ShareIcon, PrinterIcon, FileIcon } from "./icons";
import { CSI_DIVISIONS, COUNTRIES, getDefaultResources, AREA_PRICING_BASE, CURRENCY_INFO } from "../data/csiData";
import usePersistentState from "../hooks/usePersistentState";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
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

function CountryModal({ onConfirm, current }) {
  const [sel, setSel] = useState(current || "sa");
  const countries = [
    { code: "sa", name: "المملكة العربية السعودية", currency: "SAR", icon: "🇸🇦" },
    { code: "eg", name: "جمهورية مصر العربية", currency: "EGP", icon: "🇪🇬" },
    { code: "ae", name: "الإمارات العربية المتحدة", currency: "AED", icon: "🇦🇪" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d2545]/80 backdrop-blur-md p-6">
      <div className="w-full max-w-[420px] animate-in zoom-in-95 duration-300">
        <div className="rounded-[32px] border border-white/10 bg-white p-6 sm:p-8 shadow-2xl">
          <h2 className="mb-6 text-center text-[20px] font-black text-[#0d2545]" style={{ fontFamily: AR }}>تغيير دولة التسعير</h2>

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
            تأكيد الاختيار
          </button>

          <button onClick={() => onConfirm(current)} className="mt-3 w-full py-2 text-[14px] font-bold text-gray-400 hover:text-gray-600">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// --- Mode Selection Screen ---
function ModeSelection({ onSelect }) {
  return (
    <div className="flex flex-col gap-3 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-1 px-2">
        <div className="inline-flex rounded-2xl bg-[#082555] px-4 py-3 shadow-lg shadow-[#082555]/15">
          <div>
            <h2 className="text-[18px] font-bold text-white" style={{ fontFamily: AR }}>مرحباً بك في محرك التسعير</h2>
            <p className="mt-1 text-[13px] font-medium text-[#E2D8C4]" style={{ fontFamily: AR }}>اختر طريقة التسعير المناسبة لاحتياجك</p>
          </div>
        </div>
      </div>

      <button onClick={() => onSelect("items")}
        className="group relative overflow-hidden rounded-3xl bg-[#162e52] border-2 border-white/5 p-6 text-right transition-all hover:border-[#d4a843]/50 hover:shadow-xl active:scale-[0.98]">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#d4a843] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start gap-5">
          <div className="h-14 w-14 rounded-2xl bg-[#0d2545] text-[#d4a843] flex items-center justify-center shrink-0 shadow-inner">
             <PricingIcon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-white mb-2" style={{ fontFamily: AR }}>بنود أعمال المقاولات</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed" style={{ fontFamily: AR }}>
              تحليل مفصل لكل بند (مواد، عمالة، معدات) بناءً على أكواد CSI MasterFormat. مثالي للمقاولين والمهندسين.
            </p>
          </div>
          <ChevronLeftIcon className="h-6 w-6 text-white/20 group-hover:text-[#d4a843] self-center transition-colors" />
        </div>
      </button>

      <button onClick={() => onSelect("area")}
        className="group relative overflow-hidden rounded-3xl bg-[#d4a843] p-6 text-right transition-all hover:shadow-2xl hover:shadow-[#d4a843]/20 active:scale-[0.98]">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#0d2545]/20" />
        <div className="flex items-start gap-5">
          <div className="h-14 w-14 rounded-2xl bg-[#0d2545] text-[#d4a843] flex items-center justify-center shrink-0 shadow-lg">
             <BuildingsIcon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-[#0d2545] mb-2" style={{ fontFamily: AR }}>تسعير مبني</h3>
            <p className="text-[13px] text-[#0d2545]/70 leading-relaxed font-bold" style={{ fontFamily: AR }}>
              حساب تقديري سريع لتكلفة بناء كامل بناءً على المساحة، عدد الأدوار، ومستوى التشطيب. مثالي للملاك والمستثمرين.
            </p>
          </div>
          <ChevronLeftIcon className="h-6 w-6 text-[#0d2545]/30 group-hover:text-[#0d2545] self-center transition-colors" />
        </div>
      </button>

      <div className="mt-4 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 p-5 text-center">
         <p className="text-[12px] font-bold text-gray-500 leading-relaxed" style={{ fontFamily: AR }}>
           جميع الحسابات تقديرية وتعتمد على متوسطات السوق الحالية في الدولة المختارة.
         </p>
      </div>
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
  const graphicFloors = Math.min(6, Math.max(2, numericFloors));
  const windows = Array.from({ length: graphicFloors * 3 }, (_, index) => index);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#082555] p-5 shadow-2xl border border-[#C9A84C]/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.18),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,rgba(201,168,76,0.06),transparent)] pointer-events-none" />

      <div className="relative grid grid-cols-[1.15fr_0.85fr] gap-4 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.18em]">
            <span>Building Pricing Snapshot</span>
          </div>
          <div>
            <div className="text-[23px] font-bold text-white leading-tight" style={{ fontFamily: AR }}>
              {typeLabel}
            </div>
            <div className="mt-1 text-[12px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
              {scopeLabel} · تشطيب {finishLabel}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "الدور", value: `${fmtNum(numericArea)} م²` },
              { label: "الأدوار", value: fmtNum(numericFloors) },
              { label: "الإجمالي", value: `${fmtNum(totalArea)} م²` },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#9A8A6A] mb-1">{card.label}</div>
                <div className="text-[13px] font-bold text-white" style={{ fontFamily: MONO }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A8A6A] mb-2">Preview Range</div>
            <div className="flex items-end gap-2">
              <div className="text-[26px] font-bold text-[#E8C97A] leading-none" style={{ fontFamily: MONO }}>{fmtNum(previewTotal)}</div>
              <div className="pb-1 text-[11px] font-bold text-[#9A8A6A]">{COUNTRIES[country]?.currency}</div>
            </div>
            <div className="mt-2 text-[11px] font-bold text-white/70" style={{ fontFamily: AR }}>
              سعر متر تقديري {fmtNum(previewUnit)} {COUNTRIES[country]?.currency}
            </div>
          </div>
        </div>

        <div className="relative flex items-end justify-center min-h-[240px]">
          <div className="absolute bottom-0 h-24 w-24 rounded-full bg-[#C9A84C]/15 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <div className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/75">
              <span>{finishLabel}</span>
              <span className="h-1 w-1 rounded-full bg-[#C9A84C]" />
              <span>{scopeLabel}</span>
            </div>
            <div className="relative w-[150px] rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,#244b81_0%,#0c2241_100%)] px-4 pt-5 pb-4 shadow-[0_18px_50px_rgba(2,12,27,0.45)]">
              <div className="absolute inset-x-4 top-3 h-[1px] bg-white/10" />
              <div className="grid grid-cols-3 gap-2">
                {windows.map((windowIndex) => (
                  <div
                    key={windowIndex}
                    className="h-4 rounded-md border border-[#C9A84C]/20 bg-[linear-gradient(180deg,rgba(245,237,216,0.95),rgba(201,168,76,0.55))] shadow-[0_0_10px_rgba(201,168,76,0.15)]"
                  />
                ))}
              </div>
              <div className="mt-3 h-7 rounded-xl border border-white/10 bg-[#06172e]" />
            </div>
            <div className="mt-2 h-2 w-[180px] rounded-full bg-white/10" />
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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="mb-5 grid grid-cols-3 gap-3">
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

        <div className="mb-4 grid grid-cols-3 gap-3">
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

function AreaScenarioCompare({ scenarios, currentScenario, currency, onAddCurrent, onRemove }) {
  const mergedScenarios = [
    ...(currentScenario ? [{ ...currentScenario, id: "__current__", live: true }] : []),
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
                    {scenario.live ? "السيناريو الحالي" : `سيناريو ${index}`}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>
                    {scenario.typeLabel} · {scenario.finishLabel}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isBest && (
                    <span className="rounded-full bg-[#082555] px-2 py-1 text-[10px] font-bold text-[#C9A84C]">الأوفر</span>
                  )}
                  {!scenario.live && (
                    <button type="button" onClick={() => onRemove(scenario.id)} className="text-[12px] font-bold text-[#9A8A6A]">
                      حذف
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-3 gap-2 text-center">
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

function AreaPricingForm({ country, onCalculate }) {
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
        <div className="grid grid-cols-2 gap-4 mb-6">
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
          <div className="grid grid-cols-2 gap-2">
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
            {SCOPES.map(s => (
              <button key={s.id} onClick={() => setScope(s.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${scope === s.id ? "border-[#C9A84C] bg-[#F5EDD8] font-bold" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${scope === s.id ? "bg-[#C9A84C] text-[#082555]" : "bg-[#F7F3EC]"}`}>
                  {s.icon}
                </div>
                <span className="text-[14px]" style={{ fontFamily: AR }}>{s.ar}</span>
                <div className="flex-1 text-left">
                   <div className={`h-5 w-5 rounded-full border-2 inline-flex items-center justify-center text-[10px] ${scope === s.id ? "border-[#C9A84C] bg-[#C9A84C] text-[#082555]" : "border-[#E2D8C4]"}`}>
                     {scope === s.id && "✓"}
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <label className="text-[12px] font-bold text-[#082555] pr-1" style={{ fontFamily: AR }}>مستوى التشطيب</label>
          <div className="flex flex-col gap-2">
            {FINISH_LEVELS.map(f => (
              <button key={f.id} onClick={() => setFinish(f.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${finish === f.id ? "border-[#C9A84C] bg-[#F5EDD8] font-bold" : "border-[#E2D8C4] bg-white text-[#9A8A6A]"}`}>
                <span className="text-2xl">{f.icon}</span>
                <div className="text-right flex-1">
                  <div className="text-[14px] text-[#082555]" style={{ fontFamily: AR }}>{f.ar}</div>
                  <div className="text-[10px] text-[#9A8A6A] mt-0.5">{f.desc}</div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] ${finish === f.id ? "border-[#C9A84C] bg-[#C9A84C] text-[#082555]" : "border-[#E2D8C4]"}`}>
                  {finish === f.id && "✓"}
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
    </div>
  );
}

function AreaResultsView({ country, params, results, onBack, onExport, onSave, onOpenSection, scenarios, currentScenario, onAddScenario, onRemoveScenario }) {
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

        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
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
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
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
    </div>
  );
}

function AreaSectionDetailView({ country, params, draft, overallResults, onBack, onReset, onUpdateItem }) {
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const totalArea = (Number(params?.area) || 0) * (Number(params?.floors) || 0);
  const overallShare = overallResults?.total > 0 ? (draft.sectionTotal / overallResults.total) * 100 : 0;

  if (!draft) return null;

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

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

              <div className="grid grid-cols-3 gap-3">
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
    </div>
  );
}


// --- Main Pricing Workspace Component ---

export default function PricingWorkspace({ authMode, onSaveAnalysis, onCreateRfq, savedAnalyses, navigationBridge, initialCountry, settings }) {
  // initialCountry comes from the CountryPicker on PricingPage; always override persisted value
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

  // Analysis Parameters (Moved up for persistence and export)
  const [qty, setQty] = useState(1);
  const [overhead, setOverhead] = useState(12);
  const [profit, setProfit] = useState(15);
  const [factor, setFactor] = useState(1.03);
  const [analysisBaseline, setAnalysisBaseline] = useState(null);

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
    setFactor(snapshot.params?.factor ?? 1.03);
    setOverhead(snapshot.params?.overhead ?? 12);
    setProfit(snapshot.params?.profit ?? 15);
  }, []);

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
      typeLabel: BUILDING_TYPES.find((item) => item.id === areaParams.type)?.ar || areaParams.type,
      finishLabel: FINISH_LEVELS.find((item) => item.id === areaParams.finish)?.ar || areaParams.finish,
      scopeLabel: SCOPES.find((item) => item.id === areaParams.scope)?.ar || areaParams.scope,
    };
  }, [areaParams, effectiveAreaResults]);

  const handleCalculateArea = (params) => {
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
    setMode("area-section-detail");
  }, [areaParams, areaResults]);

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

      const rowsHtml = resourcesList.map((r) => `
        <tr>
          <td>${r.type}</td>
          <td>${r.name}</td>
          <td>${fmtNum(r.qty)}</td>
          <td>${r.unit}</td>
          <td>${fmtNum(r.rate)}</td>
          <td>${fmtNum(r.total)}</td>
        </tr>
      `).join("");

      const html = `
        <!doctype html>
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8" />
            <title>تحليل بند ${selectedItem.num}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #082555; }
              h1, h2, h3, p { margin: 0; }
              .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
              .brand { text-align:left; color:#9A8A6A; font-size:12px; font-weight:700; letter-spacing:2px; }
              .card { border:1px solid #E2D8C4; border-radius:16px; padding:16px; margin-bottom:16px; }
              .grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; }
              .metric { background:#F7F3EC; border-radius:12px; padding:12px; }
              .metric .label { color:#9A8A6A; font-size:12px; font-weight:700; margin-bottom:6px; }
              .metric .value { font-size:22px; font-weight:700; }
              table { width:100%; border-collapse:collapse; margin-top:12px; }
              th, td { border:1px solid #E2D8C4; padding:10px; text-align:right; font-size:12px; }
              th { background:#F7F3EC; }
              .footer { margin-top:20px; color:#9A8A6A; font-size:11px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>تحليل بند المقاولات</h1>
                <p style="margin-top:8px;">${selectedItem.num} - ${selectedItem.ar}</p>
                <p style="margin-top:6px; color:#9A8A6A;">${selectedItem.divAr} · ${selectedItem.unit}</p>
                <p style="margin-top:6px; color:#9A8A6A;">التاريخ: ${now}</p>
              </div>
              <div class="brand">TASEERA<br/>PRICING INTELLIGENCE</div>
            </div>

            <div class="card">
              <div class="grid">
                <div class="metric"><div class="label">سعر الوحدة النهائي</div><div class="value">${fmtNum(unitPrice)} ${c.currency}</div></div>
                <div class="metric"><div class="label">إجمالي العرض</div><div class="value">${fmtNum(finalTotal)} ${c.currency}</div></div>
                <div class="metric"><div class="label">هامش الربح (${profit}%)</div><div class="value">${fmtNum(profitAmt)} ${c.currency}</div></div>
                <div class="metric"><div class="label">إجمالي البنود المباشرة</div><div class="value">${fmtNum(direct)} ${c.currency}</div></div>
              </div>
            </div>

            <div class="card">
              <h3 style="margin-bottom:12px;">إعدادات التحليل الحالية</h3>
              <div class="grid">
                <div class="metric"><div class="label">الكمية</div><div class="value">${fmtNum(q)}</div></div>
                <div class="metric"><div class="label">Factor</div><div class="value">${factor}</div></div>
                <div class="metric"><div class="label">Overhead</div><div class="value">${overhead}%</div></div>
                <div class="metric"><div class="label">Profit</div><div class="value">${profit}%</div></div>
              </div>
            </div>

            <div class="card">
              <h3>تفصيل الموارد بالقيم الحالية</h3>
              <table>
                <thead>
                  <tr>
                    <th>النوع</th>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>الوحدة</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>

            <div class="footer">هذا الملف يعكس القيم الحالية داخل جلسة التحليل فقط، ولا يتم حفظ التعديلات في قاعدة البيانات.</div>
          </body>
        </html>
      `;

      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      printFrame.setAttribute("aria-hidden", "true");
      document.body.appendChild(printFrame);

      const frameWindow = printFrame.contentWindow;
      const frameDocument = printFrame.contentDocument || frameWindow?.document;

      if (!frameWindow || !frameDocument) {
        printFrame.remove();
        showToast("تعذر تجهيز الطباعة في هذا المتصفح.");
        return;
      }

      frameDocument.open();
      frameDocument.write(html);
      frameDocument.close();

      setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
        setTimeout(() => {
          printFrame.remove();
        }, 1000);
      }, 300);

      showToast("تم تجهيز ملف PDF/الطباعة بالقيم الحالية");
    }
  }, [mode, country, areaParams, areaResults, effectiveAreaResults, selectedItem, resources, qty, overhead, profit, factor, showToast]);

  function handleSelfPrice(item, div) {
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
    setMode("self-price");
  }

  function handleSelectItem(item, div) {
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
      setMode("items");
      setTab("analysis");
    } else {
      setAreaParams(analysis.params);
      setAreaResults(analysis.results);
      setMode("area-results");
    }
  }

  function handleAddResource(res) {
    setResources((prev) => ({ ...prev, [res.type]: [...(prev[res.type] || []), res] }));
    setAddModalType(null);
  }

  function handleModeChange(nextMode) {
    if (mode === "items" && tab === "analysis") {
      const canLeave = confirmDiscardAnalysisChanges(() => setMode(nextMode));
      if (!canLeave) return;
      return;
    }
    setMode(nextMode);
  }

  function handleTabChange(nextTab) {
    if (nextTab === tab) return;
    if (tab === "analysis") {
      const canLeave = confirmDiscardAnalysisChanges(() => setTab(nextTab));
      if (!canLeave) return;
      return;
    }
    setTab(nextTab);
  }

  const handleWorkspaceBack = useCallback(() => {
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
        return confirmDiscardAnalysisChanges(() => {
          setSelectedItem(null);
          setTab("csi");
        });
      }

      if (tab !== "csi") {
        setTab("csi");
        return true;
      }

      setMode("selection");
      return true;
    }

    return false;
  }, [mode, tab, confirmDiscardAnalysisChanges]);

  useEffect(() => navigationBridge?.registerBackHandler?.(handleWorkspaceBack), [handleWorkspaceBack, navigationBridge?.registerBackHandler]);

  useEffect(() => {
    navigationBridge?.onEntryChange?.({ mode, tab });
  }, [mode, tab, navigationBridge?.onEntryChange]);

  const tabs = [
    { id: "csi", label: "البنود" },
    { id: "analysis", label: "التحليل" },
    { id: "market", label: "السوق" },
    { id: "history", label: "المحفوظة" },
  ];

  if (!country) {
    return (
      <CountryModal
        current={country}
        onConfirm={(c) => {
          setCountry(c);
        }}
      />
    );
  }

  return (
    <div className="w-full bg-[#F7F3EC] overflow-x-hidden" dir="rtl" style={{ fontFamily: AR }}>
      <div className="mx-auto w-full max-w-[720px] p-3 sm:p-4 pb-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => handleModeChange("selection")} className="flex items-center gap-3 text-right">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2545] text-[#d4a843] shadow-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-[#0d2545] leading-none">تسعيرة</h1>
              <p className="text-[10px] font-bold text-[#d4a843] mt-1.5 uppercase tracking-tighter">Construction Pricing</p>
            </div>
          </button>


        </div>

        {/* --- MAIN CONTENT SWITCHER --- */}

        {mode === "selection" && <ModeSelection onSelect={setMode} />}

        {mode === "items" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="mb-6 w-full rounded-2xl bg-[#082555] p-1.5 flex gap-1.5 shadow-xl">
              {tabs.map((t) => (
                <button key={t.id} type="button" onClick={() => handleTabChange(t.id)}
                  className={`flex-1 min-w-0 min-h-[44px] rounded-xl py-2 text-[13px] font-bold transition-all duration-300 ${tab === t.id ? "bg-[#C9A84C] text-[#082555] shadow-lg" : "text-[#9A8A6A] hover:text-white"}`}
                  style={{ fontFamily: AR }}>
                  <span className="truncate block px-1">{t.label}</span>
                </button>
              ))}
            </div>
            {tab === "csi" && <CSIScreen country={country} onSelectItem={handleSelectItem} onSelfPrice={handleSelfPrice} />}
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
                onExport={handleExport}
                toast={showToast}
                qty={qty} setQty={setQty}
                overhead={overhead} setOverhead={setOverhead}
                profit={profit} setProfit={setProfit}
                factor={factor} setFactor={setFactor}
                settings={settings}

              />
            )}
            {tab === "market" && <MarketScreen country={country} onSelectItem={handleSelectItem} onSelfPrice={handleSelfPrice} />}
          </div>
        )}

        {mode === "area" && <AreaPricingForm country={country} onCalculate={handleCalculateArea} />}

        {mode === "area-results" && (
          <AreaResultsView
            country={country}
            params={areaParams}
            results={effectiveAreaResults}
            scenarios={areaScenarios}
            currentScenario={currentAreaScenario}
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
              showToast("تم حفظ تسعير المشروع بنجاح");
            }}
            onOpenSection={handleOpenAreaSection}
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
            onBack={() => { setMode("items"); setTab("csi"); }}
            onSave={(result) => {
              onSaveAnalysis?.({
                itemName: selfPriceItem.ar,
                itemNum: selfPriceItem.num,
                resources: selfPriceResources,
                params: { qty: selfPriceQty, overhead: selfPriceOverhead, profit: selfPriceProfit, unit: selfPriceItem.unit, market: selfPriceItem.market, divAr: selfPriceItem.divAr },
                result,
                mode: 'item',
              });
              showToast("تم حفظ تحليل السعر بنجاح ✔️");
            }}
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
          />
        )}
      </div>

      {addModalType && (
        <AddResourceModal defaultType={addModalType} onAdd={handleAddResource} onClose={() => setAddModalType(null)} />
      )}

      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#082555] px-5 py-2.5 text-[12px] font-medium text-[#E8C97A] shadow-xl"
          style={{ fontFamily: AR }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}


// Sub-components (Moved from previous implementation or newly added)

// ===== سعر بنفسك Screen =====
function SelfPricingScreen({ item, resources, setResources, qty, setQty, overhead, setOverhead, profit, setProfit, country, onBack, onSave }) {
  const sym = COUNTRIES[country]?.sym || "ر.س";
  const fmt = (n) => Number(n).toLocaleString("ar-EG", { maximumFractionDigits: 0 });

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

  const BADGE_COLORS = { mat: "bg-blue-100 text-blue-700", lab: "bg-green-100 text-green-700", eqp: "bg-orange-100 text-orange-700" };
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
            <p className="mt-1 text-[12px] text-[#9A8A6A]">الوحدة: <span className="text-[#C9A84C] font-bold">{item.unit}</span>  ·  سعر السوق: <span className="text-[#C9A84C] font-bold">{fmt(item.market)} {sym}</span></p>
          </div>
          <button onClick={onBack} className="shrink-0 rounded-xl bg-[#0d2f5e] px-3 py-2 text-[12px] text-[#9A8A6A] hover:text-white transition">← رجوع</button>
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
        <div key={key} className={`mb-4 rounded-xl border-2 ${color} overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-white bg-opacity-60">
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
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 transition">
                <span className="text-[15px] shrink-0">{row.icon || "📦"}</span>
                <input
                  value={row.name}
                  onChange={e => updateRow(key, idx, "name", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-transparent px-2 py-1 text-[12px] text-[#082555] focus:border-[#C9A84C] focus:outline-none bg-transparent"
                />
                <input type="number" min="0" step="0.01"
                  value={row.qty}
                  onChange={e => updateRow(key, idx, "qty", e.target.value)}
                  className="w-16 rounded-lg border border-[#E2D8C4] px-2 py-1 text-center text-[12px] font-bold text-[#082555] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
                <span className="text-[10px] text-[#9A8A6A] min-w-[24px] text-center">{row.unit || ""}</span>
                <span className="text-[10px] text-[#9A8A6A]">×</span>
                <input type="number" min="0" step="1"
                  value={row.rate}
                  onChange={e => updateRow(key, idx, "rate", e.target.value)}
                  className="w-20 rounded-lg border border-[#E2D8C4] px-2 py-1 text-center text-[12px] font-bold text-[#082555] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
                <span className="text-[10px] text-[#9A8A6A] shrink-0">{sym}</span>
                <span className="min-w-[52px] text-left text-[11px] font-bold text-[#082555]">{fmt((Number(row.qty)||0)*(Number(row.rate)||0))}</span>
                <button onClick={() => removeRow(key, idx)} className="shrink-0 text-red-400 hover:text-red-600 transition text-[14px] leading-none">✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Overhead & Profit */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-[#E2D8C4] p-3 text-center">
          <p className="mb-1.5 text-[11px] text-[#9A8A6A]">المصاريف العامة %</p>
          <input type="number" min="0" max="50"
            value={overhead} onChange={e => setOverhead(e.target.value)}
            className="w-full rounded-lg border border-[#E2D8C4] px-2 py-1.5 text-center text-[16px] font-bold text-[#082555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>
        <div className="rounded-xl bg-white border border-[#E2D8C4] p-3 text-center">
          <p className="mb-1.5 text-[11px] text-[#9A8A6A]">هامش الربح %</p>
          <input type="number" min="0" max="100"
            value={profit} onChange={e => setProfit(e.target.value)}
            className="w-full rounded-lg border border-[#E2D8C4] px-2 py-1.5 text-center text-[16px] font-bold text-[#082555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-4 rounded-2xl bg-[#082555] p-4 shadow-xl">
        <h3 className="mb-3 text-[13px] font-bold text-[#C9A84C]">ملخص التكلفة (للكمية {qty} {item.unit})</h3>
        <div className="space-y-1.5">
          {[
            { label: "مواد",         val: matTotal * (Number(qty)||1), color: "text-blue-300"   },
            { label: "عمالة",        val: labTotal * (Number(qty)||1), color: "text-green-300"  },
            { label: "معدات",        val: eqpTotal * (Number(qty)||1), color: "text-orange-300" },
            { label: "تكلفة مباشرة",val: direct,   color: "text-white font-bold", sep: true },
            { label: `مصاريف عامة ${overhead}%`, val: indirect,  color: "text-[#E2D8C4]" },
            { label: `ربح ${profit}%`,            val: profitAmt, color: "text-[#E2D8C4]" },
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
            <p className="text-[10px] font-bold text-[#082555] opacity-70">سعر الوحدة</p>
            <p className="text-[22px] font-bold text-[#082555] leading-tight" style={{ fontFamily: MONO }}>{fmt(unitPrice)} <span className="text-[13px]">{sym}</span></p>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-[#082555] opacity-70">الإجمالي</p>
            <p className="text-[18px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmt(total)} {sym}</p>
          </div>
        </div>
        {item.market > 0 && (
          <p className={`mt-2 text-center text-[11px] font-bold ${unitPrice <= item.market ? "text-green-400" : "text-red-400"}`}>
            {unitPrice <= item.market
              ? `✓ سعرك أقل من السوق بـ ${fmt(item.market - unitPrice)} ${sym}`
              : `⚠ سعرك أعلى من السوق بـ ${fmt(unitPrice - item.market)} ${sym}`}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={() => onSave({ unitPrice, total, direct, indirect, profitAmt })}
          className="flex-1 rounded-xl bg-[#082555] py-3 text-[13px] font-bold text-[#C9A84C] shadow-lg hover:bg-[#0d2f5e] transition active:scale-[0.98]">
          💾 حفظ في الحساب
        </button>
        <button
          onClick={() => {
            const w = window.open("", "_blank");
            const currency = sym;
            w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>تحليل سعر — ${item.ar}</title>
<style>
  body{font-family:Arial,sans-serif;padding:24px;color:#082555;direction:rtl}
  h1{font-size:16px;margin-bottom:4px}
  .sub{color:#888;font-size:12px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px}
  th{background:#082555;color:#C9A84C;padding:6px 8px;text-align:right}
  td{padding:5px 8px;border-bottom:1px solid #eee}
  .total{background:#C9A84C;color:#082555;font-weight:bold;padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;margin-top:8px;font-size:14px}
  @media print{button{display:none}}
</style></head><body>
<h1>${item.num} — ${item.ar}</h1>
<p class="sub">${item.divAr} · الوحدة: ${item.unit} · سعر السوق: ${fmt(item.market)} ${currency}</p>
${GROUP_HEADERS.map(g => `<h3 style="margin-bottom:4px">${g.emoji} ${g.label}</h3><table><tr><th>البند</th><th>الكمية</th><th>الوحدة</th><th>السعر</th><th>الإجمالي</th></tr>${(resources[g.key]||[]).map(r=>`<tr><td>${r.icon||''} ${r.name}</td><td>${r.qty}</td><td>${r.unit||''}</td><td>${fmt(r.rate)} ${currency}</td><td>${fmt((r.qty||0)*(r.rate||0))} ${currency}</td></tr>`).join('')}</table>`).join('')}
<div class="total"><span>سعر الوحدة النهائي (شامل هامش ${profit}%)</span><span>${fmt(unitPrice)} ${currency}</span></div>
<button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#082555;color:#C9A84C;border:none;border-radius:8px;cursor:pointer;font-size:13px">🖨️ طباعة</button>
</body></html>`);
            w.document.close();
          }}
          className="flex-1 rounded-xl bg-white border-2 border-[#082555] py-3 text-[13px] font-bold text-[#082555] hover:bg-[#F5EDD8] transition active:scale-[0.98]">
          🖨️ طباعة
        </button>
      </div>
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

function CSIScreen({ country, onSelectItem, onSelfPrice }) {
  const [search, setSearch] = useState("");
  const [openDiv, setOpenDiv] = useState(null);
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
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border-2 border-[#E2D8C4] p-5 shadow-sm">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  ابحث عن بند أو وصف..."
          className="min-h-[52px] w-full rounded-2xl border-2 border-[#E2D8C4] bg-[#F7F3EC] px-4 py-2.5 text-[15px] outline-none focus:border-[#C9A84C] transition-colors"
          style={{ fontFamily: AR }} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#9A8A6A] tracking-wider uppercase mr-1" style={{ fontFamily: AR }}>CSI MasterFormat 2024</span>
          {c && (
             <span className="text-[11px] font-bold text-[#C9A84C] bg-[#F5EDD8] px-3 py-1 rounded-lg">قاعدة بيانات {c.name}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((div) => {
          const isOpen = isSearching || openDiv === div.num;
          const price = c?.rates?.[div.rateKey] > 0 ? c.rates[div.rateKey] : null;
          return (
            <div key={div.num} className="rounded-2xl bg-white border-2 border-[#E2D8C4] overflow-hidden shadow-sm transition-all hover:shadow-md">
              <button type="button" onClick={() => setOpenDiv(openDiv === div.num ? null : div.num)}
                className={`w-full flex min-h-[72px] items-center gap-4 px-4 py-3 text-right transition-colors ${isOpen ? "bg-[#F5EDD8]" : "hover:bg-[#F5EDD8]/30"}`}>
                <span className="rounded-xl bg-[#082555] px-3 py-2 text-[12px] font-bold text-[#E8C97A]" style={{ fontFamily: MONO }}>{div.num}</span>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-[15px] font-bold text-[#082555] truncate mb-0.5" style={{ fontFamily: AR }}>{div.ar}</div>
                  <div className="text-[11px] text-[#9A8A6A] font-bold uppercase tracking-tight">{div.en}</div>
                </div>
                {price && (
                  <div className="text-left shrink-0 ml-1">
                    <div className="text-[14px] font-bold text-[#C9A84C]" style={{ fontFamily: MONO }}>{price.toLocaleString()}</div>
                    <div className="text-[9px] text-[#9A8A6A] font-bold uppercase">{c.currency}/{div.unit}</div>
                  </div>
                )}
                <span className={`text-[14px] text-[#9A8A6A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {isOpen && (
                <div className="border-t-2 border-[#E2D8C4] bg-[#FAFAFA]">
                  {div.items.map((item) => (
                    <div key={item.num} className="flex min-h-[64px] items-center gap-4 border-b border-[#E2D8C4] px-5 py-3 last:border-b-0 hover:bg-white transition-colors">
                      <span className="text-[11px] font-bold text-[#C9A84C] min-w-[70px]" style={{ fontFamily: MONO }}>{item.num}</span>
                      <span className="flex-1 text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{item.ar}</span>
                      <span className="rounded-lg bg-[#F7F3EC] px-2.5 py-1 text-[10px] font-bold text-[#9A8A6A]">{item.unit}</span>
                      <button type="button" onClick={() => onSelfPrice(item, div)}
                        className="min-h-[40px] rounded-xl border-2 border-[#082555] bg-white px-4 py-1 text-[12px] font-bold text-[#082555] transition hover:bg-[#F5EDD8] active:scale-[0.95]"
                        style={{ fontFamily: AR }}>
                        💡 سعر بنفسك
                      </button>
                      <button type="button" onClick={() => onSelectItem(item, div)}
                        className="min-h-[40px] rounded-xl bg-[#C9A84C] px-5 py-1 text-[13px] font-bold text-[#082555] transition hover:bg-[#E8C97A] active:scale-[0.95]"
                        style={{ fontFamily: AR }}>
                        اختر
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
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

      <div className="grid grid-cols-2 gap-3 mb-5">
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

function AnalysisScreen({
  authMode,
  country, selectedItem, resources, setResources, onOpenAddModal, onSave, onRfq, onExport, toast,
  qty, setQty, overhead, setOverhead, profit, setProfit, factor, setFactor,
  settings,
}) {
  const c = COUNTRIES[country] || COUNTRIES.sa;
  const sym = c.currency;
  const mkt = selectedItem ? selectedItem.market : 0;
  const taxPct = Number(settings?.taxPercent) || 15;
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
  function updateLineTotal(type, i, val) {
    const q = Number(qty) || 1;
    const f = Number(factor) || 1;
    setResources((prev) => {
      const copy = { ...prev, [type]: [...prev[type]] };
      const currentItem = copy[type][i];
      if (!currentItem) return prev;
      const baseQty = Number(currentItem.qty) || 0;
      const nextTotal = Math.max(0, parseFloat(val) || 0);
      const divisor = baseQty * q * f;
      copy[type][i] = {
        ...currentItem,
        rate: divisor > 0 ? nextTotal / divisor : 0,
      };
      return copy;
    });
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "الكمية", val: qty, setter: setQty, unit: selectedItem.unit, step: "0.1" },
          { label: "مصاريف غير مباشرة", val: overhead, setter: setOverhead, unit: "%", step: "0.1" },
          { label: "Profit", val: profit, setter: setProfit, unit: "%", step: "0.1" },
          { label: "Factor", val: factor, setter: setFactor, unit: "F", step: "0.01" },
        ].map(({ label, val, setter, unit: u, step }) => (
          <div key={label} className="rounded-2xl border-2 border-[#E2D8C4] bg-white px-3 py-2.5 text-center shadow-sm transition-all hover:border-[#C9A84C]">
            <div className="text-[10px] font-bold text-[#9A8A6A] mb-1.5 uppercase" style={{ fontFamily: AR }}>{label}</div>
            <input type="number" value={val} step={step} onChange={(e) => setter(e.target.value)} disabled={!isAuthenticated}
              className="w-full bg-transparent text-center text-[16px] font-bold text-[#082555] outline-none"
              style={{ fontFamily: MONO }} />
            <div className="text-[8px] font-bold text-[#C9A84C] mt-1 uppercase">{u}</div>
          </div>
        ))}
      </div>

      {SECTIONS.map(({ key, label, icon }) => {
        const sectionTotal = (resources[key] || []).reduce((s, r) => s + r.qty * r.rate * (Number(qty) || 1) * (Number(factor) || 1), 0);
        return (
          <div key={key} className="rounded-2xl border-2 border-[#E2D8C4] bg-white overflow-hidden shadow-sm">
            <div className="flex min-h-[50px] items-center justify-between px-4 py-2 border-b-2 border-[#E2D8C4] bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{icon}</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: AR }}>{label}</span>
                  <span className="text-[9px] font-bold text-[#9A8A6A] uppercase tracking-tighter">{resources[key]?.length || 0} ITEMS</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(sectionTotal)}</div>
                  <div className="text-[8px] font-bold text-[#9A8A6A] uppercase">{sym} TOTAL</div>
                </div>
                <button type="button" onClick={() => onOpenAddModal(key)} disabled={!isAuthenticated}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#C9A84C] text-[#082555] shadow-sm transition hover:bg-[#E8C97A] active:scale-[0.9]">
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            </div>
            {(resources[key] || []).map((r, i) => {
              const lineTotal = r.qty * r.rate * (Number(qty) || 1) * (Number(factor) || 1);
              return (
                <div key={i} className="flex min-h-[56px] items-center gap-3 border-b border-[#E2D8C4] px-4 py-2.5 last:border-0 hover:bg-[#F7F3EC]/50 transition-colors">
                  <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#F7F3EC] text-lg shrink-0 shadow-inner">{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#082555] truncate mb-0.5" style={{ fontFamily: AR }}>{r.name}</div>
                    <div className="flex items-center gap-2">
                      {isAuthenticated ? (
                        <input
                          type="number"
                          value={r.qty}
                          step="0.01"
                          onChange={(e) => updateQty(key, i, e.target.value)}
                          className="w-16 rounded-lg border border-[#E2D8C4] bg-white px-2 py-1 text-[10px] font-bold text-[#9A8A6A] outline-none focus:border-[#C9A84C]"
                          style={{ fontFamily: MONO }}
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-[#9A8A6A] uppercase tracking-tighter">{r.qty}</span>
                      )}
                      <span className="h-1 w-1 rounded-full bg-[#E2D8C4]" />
                      {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={r.rate}
                            step="0.01"
                            onChange={(e) => updateRate(key, i, e.target.value)}
                            className="w-20 rounded-lg border border-[#E2D8C4] bg-white px-2 py-1 text-[10px] font-bold text-[#C9A84C] outline-none focus:border-[#C9A84C]"
                            style={{ fontFamily: MONO }}
                          />
                          <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-tighter">/ {r.unit}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-tighter">{r.rate} / {r.unit}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-left min-w-[84px]">
                    {isAuthenticated ? (
                      <>
                        <input
                          type="number"
                          value={roundTo(lineTotal)}
                          step="0.01"
                          onChange={(e) => updateLineTotal(key, i, e.target.value)}
                          className="w-full rounded-lg border border-[#E2D8C4] bg-white px-2 py-1 text-left text-[14px] font-bold text-[#082555] outline-none focus:border-[#C9A84C]"
                          style={{ fontFamily: MONO }}
                        />
                        <div className="text-[9px] text-[#9A8A6A] font-bold uppercase mt-1">{sym}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(lineTotal)}</div>
                        <div className="text-[8px] text-[#9A8A6A] font-bold uppercase">{sym}</div>
                      </>
                    )}
                  </div>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => deleteResource(key, i)}
                      className="rounded-xl border border-[#E2D8C4] px-2 py-1.5 text-[10px] font-bold text-[#9A8A6A] transition hover:border-red-300 hover:text-red-500"
                    >
                      حذف
                    </button>
                  )}
                </div>
              );
            })}
            <div className="border-t border-[#E2D8C4] bg-[#FFFDF8] px-4 py-2">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#E2D8C4] bg-white px-3 py-2">
                <span className="text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>إجمالي {label}</span>
                <span className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{fmtNum(sectionTotal)}</span>
                <span className="text-[10px] font-bold text-[#C9A84C]">{sym}</span>
              </div>
            </div>
          </div>
        );
      })}

      {calc && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "إجمالي المواد", value: calc.matT, color: "#C9A84C" },
            { label: "إجمالي العمالة", value: calc.labT, color: "#E07B2A" },
            { label: "إجمالي المعدات", value: calc.eqpT, color: "#6FCF97" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border-2 border-[#E2D8C4] bg-white px-3 py-2.5 text-center shadow-sm">
              <div className="mb-1 text-[9px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>{item.label}</div>
              <div className="text-[18px] font-bold" style={{ fontFamily: MONO, color: item.color }}>{fmtNum(item.value)}</div>
              <div className="text-[9px] font-bold text-[#9A8A6A]">{sym}</div>
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

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "مجموع البنود المباشرة", value: calc.direct, tone: "text-[#082555]",
                hint: `مواد ${fmtNum(calc.matT)} + عمالة ${fmtNum(calc.labT)} + معدات ${fmtNum(calc.eqpT)} ${sym}`,
              },
              {
                label: "المصاريف غير المباشرة", value: calc.indirect, tone: "text-[#9A8A6A]",
                hint: `${overhead}% × ${fmtNum(calc.direct)} ${sym}`,
              },
              {
                label: `هامش الربح ${profit}%`, value: calc.profitAmt, tone: "text-[#6FCF97]",
                hint: `${profit}% × ${fmtNum(calc.withOverhead)} ${sym}`,
              },
              {
                label: `ضريبة القيمة المضافة ${taxPct}%`, value: calc.taxAmt, tone: "text-[#E07B2A]",
                hint: `${taxPct}% × ${fmtNum(calc.finalTotal)} ${sym}`,
              },
              {
                label: "إجمالي البند قبل الضريبة", value: calc.finalTotal, tone: "text-[#082555]",
                hint: `${fmtNum(calc.withOverhead)} + ربح ${fmtNum(calc.profitAmt)} ${sym}`,
              },
              {
                label: "إجمالي البند بعد الضريبة", value: calc.totalWithTax, tone: "text-[#C9A84C]",
                hint: `${fmtNum(calc.finalTotal)} + ضريبة ${fmtNum(calc.taxAmt)} ${sym}`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#E2D8C4] bg-[#FCFBF8] px-4 py-3">
                <div className="mb-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>{item.label}</div>
                <div className={`text-[20px] font-bold ${item.tone}`} style={{ fontFamily: MONO }}>{fmtNum(item.value)}</div>
                <div className="mt-1 text-[10px] font-bold text-[#C9A84C]">{sym}</div>
                {item.hint ? (
                  <div className="mt-2 text-[10px] font-bold text-[#9A8A6A]" style={{ fontFamily: AR }}>{item.hint}</div>
                ) : null}
              </div>
            ))}
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
                <span className="text-[12px] sm:text-[15px] font-bold text-[#9A8A6A] uppercase tracking-widest">{sym} / {selectedItem.unit}</span>
              </div>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-[20px] bg-[#C9A84C] flex items-center justify-center shadow-xl shadow-[#C9A84C]/20">
               <PricingIcon className="h-7 w-7 sm:h-8 sm:w-8 text-[#082555]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 border-t border-white/10 pt-5">
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

          <div className="mt-5 flex gap-3">
            <button onClick={onSave} className="flex-1 min-h-[56px] rounded-2xl bg-[#C9A84C] text-[#082555] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition hover:bg-[#E8C97A] active:scale-[0.98]">
              <SaveIcon className="h-5 w-5" /> حفظ / تصدير تحليل البند PDF
            </button>
            <button onClick={onRfq} className="flex-1 min-h-[56px] rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[15px] flex items-center justify-center gap-2 transition hover:bg-white/10 active:scale-[0.98]">
              <TagIcon className="h-5 w-5 text-[#C9A84C]" /> طلب عروض
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketScreen({ country, onSelectItem, onSelfPrice }) {
  const c = country ? COUNTRIES[country] : COUNTRIES["sa"];
  const divs = CSI_DIVISIONS.filter((d) => c.rates[d.rateKey] > 0);
  return (
    <div className="space-y-4">
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
              className="w-full flex min-h-[80px] items-center gap-4 rounded-3xl border-2 border-[#E2D8C4] bg-white p-4 shadow-sm text-right transition-all hover:border-[#C9A84C] hover:shadow-md">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (d.items[0]) onSelectItem(d.items[0], d); }}>
                <div className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest" style={{ fontFamily: MONO }}>{d.num} · {d.en}</div>
                <div className="text-[16px] font-bold text-[#082555] mt-1.5 truncate" style={{ fontFamily: AR }}>{d.ar}</div>
                <div className="text-[11px] font-bold text-[#9A8A6A] mt-1.5 flex items-center gap-2">
                  <span className="uppercase tracking-tighter">Avg / {d.unit}</span>
                  <span className="h-1 w-1 rounded-full bg-[#E2D8C4]" />
                  <span className={up ? "text-emerald-600" : "text-amber-600"}>{up ? "↑" : "↓"} {Math.abs(changeVal)}% Trend</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-left">
                  <div className="text-[20px] font-bold text-[#082555]" style={{ fontFamily: MONO }}>{price.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-[#9A8A6A] uppercase tracking-wider">{c.currency}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => { if (d.items[0]) onSelfPrice(d.items[0], d); }}
                    className="rounded-xl border-2 border-[#082555] bg-white px-3 py-1.5 text-[11px] font-bold text-[#082555] hover:bg-[#F5EDD8] transition active:scale-[0.95]">
                    💡 سعر بنفسك
                  </button>
                  <button type="button"
                    onClick={() => { if (d.items[0]) onSelectItem(d.items[0], d); }}
                    className="rounded-xl bg-[#C9A84C] px-3 py-1.5 text-[11px] font-bold text-[#082555] hover:bg-[#E8C97A] transition active:scale-[0.95]">
                    اختر
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
        <div className="grid grid-cols-3 gap-3 mb-8">
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
        <div className="grid grid-cols-3 gap-4 mb-10">
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

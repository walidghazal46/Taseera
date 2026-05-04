import { useState, useMemo, useCallback } from "react";
import { CSI_DIVISIONS, MARKET_RATES, RESOURCE_PRICES, getDefaultResources } from "../data/csiData";

const AR   = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const MONO = "'IBM Plex Mono',monospace";

// ─── Currency per country ──────────────────────────────────────────────────────
const CUR = { sa: "ر.س", eg: "ج.م", ae: "د.إ" };

// ─── Division icons ────────────────────────────────────────────────────────────
const DIV_ICONS = {
  general:"⚙️", earthwork:"⛏️", concrete:"🧱", masonry:"🏗️",
  steel:"🔩", wood:"🪵", thermal:"🌡️", openings:"🚪",
  finishes:"🎨", specialties:"🛠️", equipment:"⚡", conveying:"🛗",
  fire_supp:"🧯", plumbing:"🔧", hvac:"❄️", electrical:"⚡",
  comms:"📡", security:"📷",
};

// ─── Division accent colours ───────────────────────────────────────────────────
const DIV_COLORS = {
  general:"#6366f1", earthwork:"#92400e", concrete:"#374151", masonry:"#1d4ed8",
  steel:"#475569",   wood:"#92400e",      thermal:"#0891b2",   openings:"#6d28d9",
  finishes:"#be185d",specialties:"#d97706",equipment:"#dc2626", conveying:"#0369a1",
  fire_supp:"#dc2626",plumbing:"#0369a1",  hvac:"#0284c7",      electrical:"#d97706",
  comms:"#7c3aed",   security:"#374151",
};

// ─── Scope templates (auto-generated per division + keywords) ─────────────────
function buildScope(item, div) {
  const n = item.ar;
  const rk = div.rateKey;
  const base = [
    `✅ يشمل: جميع الموارد الأساسية اللازمة لتنفيذ البند وفقاً للمواصفات الفنية.`,
    `✅ يشمل: العمالة المباشرة اللازمة، والمعدات والأدوات.`,
    `✅ يشمل: أعمال المعالجة والتنظيف النهائي للعمل.`,
  ];
  const excl = [`❌ لا يشمل: أعمال البنود الأخرى المصاحبة إلا ما ذُكر صراحةً.`];

  if (rk === "earthwork") {
    if (n.includes("حفر")) {
      base.push(`✅ يشمل: الحفر بالمعدات وإزالة التربة، تسوية القاع.`);
      excl.push(`❌ لا يشمل: نقل التربة خارج الموقع (بند منفصل).`);
      excl.push(`❌ لا يشمل: دعم جوانب الحفر أو خفض منسوب المياه.`);
    }
    if (n.includes("ردم")) {
      base.push(`✅ يشمل: مواد الردم، الدك على طبقات بالدحل.`);
      excl.push(`❌ لا يشمل: التربة إذا كانت مورَّدة من خارج الموقع (بند منفصل).`);
    }
  }
  if (rk === "concrete") {
    if (n.includes("عادية") || n.includes("فرشة")) {
      base.push(`✅ يشمل: الصب والرج بالهزاز والمعالجة 7 أيام.`);
      excl.push(`❌ لا يشمل: حديد التسليح.`);
      excl.push(`❌ لا يشمل: الشدة الخشبية.`);
    } else if (n.includes("مسلح") || n.includes("C35")) {
      base.push(`✅ يشمل: الخرسانة الجاهزة C35، حديد التسليح، الشدة، الصب، المعالجة.`);
      excl.push(`❌ لا يشمل: الحفر والردم.`);
      excl.push(`❌ لا يشمل: اختبارات المكعبات (تُسعَّر منفصلاً).`);
    } else if (n.includes("حديد تسليح") || n.includes("ريبار")) {
      base.push(`✅ يشمل: الحديد مورَّداً ومركباً، الربط والتشكيل.`);
      excl.push(`❌ لا يشمل: الخرسانة.`);
      excl.push(`❌ لا يشمل: الشدة الخشبية.`);
    }
  }
  if (rk === "masonry") {
    base.push(`✅ يشمل: البلوك، المونة، السقالات، الهالك.`);
    excl.push(`❌ لا يشمل: اللياسة.`);
    excl.push(`❌ لا يشمل: فتحات الأبواب والشبابيك.`);
  }
  if (rk === "finishes") {
    if (n.includes("لياسة") || n.includes("محارة")) {
      base.push(`✅ يشمل: الأسمنت والرمل، العمالة، السقالات، الهالك.`);
      excl.push(`❌ لا يشمل: الدهانات.`);
    } else if (n.includes("سيراميك") || n.includes("بورسلان") || n.includes("رخام")) {
      base.push(`✅ يشمل: البلاط، لاصق، جراوت، عمالة تركيب، تقطيع، هالك.`);
      excl.push(`❌ لا يشمل: اللياسة الأساسية تحت البلاط.`);
    } else if (n.includes("دهان") || n.includes("طلاء")) {
      base.push(`✅ يشمل: معجون، برايمر، الدهانة (وجهان)، العمالة، الأدوات.`);
      excl.push(`❌ لا يشمل: أعمال اللياسة.`);
    } else if (n.includes("جبس بورد") || n.includes("أسقف مستعارة") || n.includes("آرمسترونج")) {
      base.push(`✅ يشمل: الألواح، الهيكل المعدني، التركيب، الهالك.`);
      excl.push(`❌ لا يشمل: أعمال الكهرباء داخل الأسقف المستعارة.`);
    }
  }
  return [...base, ...excl];
}

// ─── Default assumptions per division ─────────────────────────────────────────
function defaultAssumptions(rk, country) {
  const base = { siteOH: 12, hoOH: 5, risk: 3, profit: 10 };
  const transport = { sa: 15, eg: 200, ae: 12 };
  const maps = {
    earthwork:  { waste: 0,  transport: { sa:5,  eg:80,  ae:5  } },
    concrete:   { waste: 3,  transport: { sa:20, eg:300, ae:18 } },
    masonry:    { waste: 8,  transport: { sa:10, eg:150, ae:10 } },
    steel:      { waste: 2,  transport: { sa:25, eg:400, ae:22 } },
    wood:       { waste: 10, transport: { sa:8,  eg:120, ae:8  } },
    thermal:    { waste: 10, transport: { sa:5,  eg:80,  ae:5  } },
    openings:   { waste: 2,  transport: { sa:30, eg:450, ae:28 } },
    finishes:   { waste: 10, transport: { sa:8,  eg:120, ae:7  } },
    plumbing:   { waste: 5,  transport: { sa:15, eg:220, ae:14 } },
    electrical: { waste: 5,  transport: { sa:10, eg:150, ae:10 } },
    hvac:       { waste: 3,  transport: { sa:20, eg:300, ae:18 } },
    default:    { waste: 5,  transport },
  };
  const m = maps[rk] || maps.default;
  return {
    ...base,
    waste:     m.waste,
    transport: (m.transport[country] ?? transport[country] ?? 15),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
let _rid = 1;
function rid() { return _rid++; }

function resourcesToRows(resources) {
  const mats = (resources.مواد || []).map(r => ({
    id: rid(), resource: r.name, unit: r.unit || "بند",
    qty: r.qty || 1, rate: r.rate || 0,
  }));
  const labs = (resources.عمالة || []).map(r => ({
    id: rid(), resource: r.name, unit: r.unit || "يومية",
    qty: r.qty || 1, rate: r.rate || 0,
  }));
  const plts = (resources.معدات || []).map(r => ({
    id: rid(), resource: r.name, unit: r.unit || "بند",
    qty: r.qty || 1, rate: r.rate || 0,
  }));
  return { mats, labs, plts };
}

function calcRows(rows) {
  return rows.reduce((s, r) => s + (r.qty * r.rate), 0);
}

function fmt(n, cur = "") {
  if (n == null || isNaN(n)) return "—";
  return `${cur ? cur + " " : ""}${n.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Tiny editable number input ────────────────────────────────────────────────
function NI({ value, onChange }) {
  return (
    <input
      type="number" value={value} min={0} step="any"
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      style={{
        fontFamily: MONO, fontSize: 12, width: "100%",
        background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(8,37,85,0.14)",
        borderRadius: 5, padding: "3px 5px",
        textAlign: "left", color: "#0d2545", outline: "none",
      }}
    />
  );
}

// ─── Editable resource table ───────────────────────────────────────────────────
function ResTable({ rows, onChange, accent, cur, unit }) {
  const update = (id, field, val) =>
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRow = () => onChange([...rows, { id: rid(), resource: "مورد جديد", unit: "بند", qty: 1, rate: 0 }]);
  const delRow = (id) => onChange(rows.filter(r => r.id !== id));
  const total = calcRows(rows);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: AR }}>
          <thead>
            <tr>
              {["الوصف", `الوحدة`, `الكمية/${unit}`, `سعر الوحدة`, `المبلغ (${cur})`, ""].map((h, i) => (
                <th key={i} style={{
                  padding: "5px 6px", background: `${accent}10`,
                  color: accent, fontWeight: 700, textAlign: i === 0 ? "right" : "center",
                  borderBottom: `1.5px solid ${accent}20`, whiteSpace: "nowrap", fontSize: 11,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.id} style={{ background: ri % 2 ? `${accent}04` : "transparent" }}>
                <td style={{ padding: "4px 6px", borderBottom: `1px solid ${accent}10` }}>
                  <input
                    value={r.resource}
                    onChange={e => update(r.id, "resource", e.target.value)}
                    style={{
                      fontFamily: AR, fontSize: 12, width: "100%", minWidth: 130,
                      background: "transparent", border: "none", outline: "none", color: "#0d2545",
                    }}
                  />
                </td>
                <td style={{ padding: "4px 6px", borderBottom: `1px solid ${accent}10`, textAlign: "center" }}>
                  <input
                    value={r.unit}
                    onChange={e => update(r.id, "unit", e.target.value)}
                    style={{
                      fontFamily: AR, fontSize: 11, width: 55, textAlign: "center",
                      background: "transparent", border: "none", outline: "none", color: "#6b7280",
                    }}
                  />
                </td>
                <td style={{ padding: "4px 6px", borderBottom: `1px solid ${accent}10`, width: 75 }}>
                  <NI value={r.qty} onChange={v => update(r.id, "qty", v)} />
                </td>
                <td style={{ padding: "4px 6px", borderBottom: `1px solid ${accent}10`, width: 90 }}>
                  <NI value={r.rate} onChange={v => update(r.id, "rate", v)} />
                </td>
                <td style={{ padding: "4px 6px", borderBottom: `1px solid ${accent}10`, textAlign: "center", fontFamily: MONO, fontWeight: 700, color: accent }}>
                  {fmt(r.qty * r.rate)}
                </td>
                <td style={{ padding: "4px 2px", borderBottom: `1px solid ${accent}10`, textAlign: "center" }}>
                  <button onClick={() => delRow(r.id)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ padding: "6px 6px 2px", textAlign: "right", fontWeight: 700, color: accent, fontSize: 11 }}>
                الإجمالي
              </td>
              <td style={{ padding: "6px 6px 2px", textAlign: "center", fontFamily: MONO, fontWeight: 800, color: accent, fontSize: 13 }}>
                {fmt(total, cur)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <button onClick={addRow}
        style={{
          marginTop: 6, background: `${accent}10`, border: `1px dashed ${accent}40`,
          color: accent, borderRadius: 7, padding: "4px 12px", fontSize: 11,
          cursor: "pointer", fontFamily: AR,
        }}>+ إضافة صف</button>
    </div>
  );
}

// ─── Collapsible section wrapper ───────────────────────────────────────────────
function Section({ title, icon, accent, extra, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${accent}22`, background: "#fff", overflow: "hidden", marginBottom: 10 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: `${accent}0a`, border: "none", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontFamily: AR, fontSize: 13, fontWeight: 700, color: accent }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {extra && <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent }}>{extra}</span>}
          <span style={{ color: accent, fontSize: 10, opacity: 0.5 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && <div style={{ padding: "10px 14px" }}>{children}</div>}
    </div>
  );
}

// ─── ANALYSIS VIEW ─────────────────────────────────────────────────────────────
function AnalysisView({ item, division, country, onBack }) {
  const cur = CUR[country] || "ر.س";
  const mktRates = MARKET_RATES[country] || MARKET_RATES.sa;

  const defaultRes = useMemo(() =>
    getDefaultResources(item, division, mktRates, country),
    [item, division, mktRates, country]
  );

  const { mats: initMats, labs: initLabs, plts: initPlts } = useMemo(
    () => resourcesToRows(defaultRes), [defaultRes]
  );

  const [mats, setMats]   = useState(initMats);
  const [labs, setLabs]   = useState(initLabs);
  const [plts, setPlts]   = useState(initPlts);
  const [qty,  setQty]    = useState(1);
  const [assum, setAssum] = useState(() => defaultAssumptions(division.rateKey, country));
  const [notes, setNotes] = useState("");

  const scope = useMemo(() => buildScope(item, division), [item, division]);
  const accent = DIV_COLORS[division.rateKey] || "#082555";

  const matTotal  = calcRows(mats);
  const labTotal  = calcRows(labs);
  const pltTotal  = calcRows(plts);
  const wasteAmt  = (matTotal * assum.waste) / 100;
  const transpAmt = assum.transport || 0;
  const dc        = matTotal + wasteAmt + labTotal + pltTotal + transpAmt;
  const siteOH    = (dc * assum.siteOH)  / 100;
  const hoOH      = (dc * assum.hoOH)    / 100;
  const risk      = (dc * assum.risk)    / 100;
  const preProfit = dc + siteOH + hoOH + risk;
  const profit    = (preProfit * assum.profit) / 100;
  const finalRate = preProfit + profit;
  const boqAmt    = finalRate * qty;

  const setA = (field, val) => setAssum(a => ({ ...a, [field]: val }));
  const reportFileBase = `${(item.num || "item").replace(/[^\w\u0600-\u06FF-]+/g, "_")}_${(item.ar || "analysis").replace(/[^\w\u0600-\u06FF-]+/g, "_")}`;

  const openHtmlExport = useCallback(({ title, html, filename, autoPrint = false }) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const exportWin = window.open(blobUrl, "_blank", "width=960,height=760");

    if (exportWin) {
      if (autoPrint) {
        exportWin.addEventListener("load", () => {
          setTimeout(() => {
            try {
              exportWin.print();
            } catch (_) {}
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          }, 350);
        });
      } else {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }
      return true;
    }

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return false;
  }, []);

  const handleExportPdf = useCallback(() => {
    const rowsSection = (title, rows) => `
      <h3>${title}</h3>
      <table>
        <thead>
          <tr>
            <th>الوصف</th>
            <th>الوحدة</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.resource}</td>
              <td>${row.unit}</td>
              <td>${row.qty}</td>
              <td>${fmt(row.rate, cur)}</td>
              <td>${fmt(row.qty * row.rate, cur)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    const html = `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>تحليل بند — ${item.ar}</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#082555;direction:rtl}
            h1{font-size:18px;margin:0 0 4px}
            h2{font-size:14px;margin:0 0 18px;color:#64748b}
            h3{font-size:14px;margin:18px 0 8px}
            table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px}
            th{background:#082555;color:#C9A84C;padding:8px;text-align:right}
            td{padding:7px 8px;border-bottom:1px solid #e5e7eb}
            .box{border:1px solid #dbe2f0;border-radius:12px;padding:14px 16px;margin-top:12px}
            .summary{background:#082555;color:#fff}
            .summary strong{color:#C9A84C}
            ul{margin:8px 0 0;padding-right:18px}
            li{margin-bottom:4px}
            @media print{button{display:none} body{padding:12px}}
          </style>
        </head>
        <body>
          <h1>${item.num} — ${item.ar}</h1>
          <h2>${division.ar} | ${new Date().toLocaleDateString("ar-SA")}</h2>
          <div class="box summary">
            <div><strong>سعر الوحدة النهائي:</strong> ${fmt(finalRate, cur)} لكل ${item.unit}</div>
            <div style="margin-top:6px"><strong>إجمالي البند:</strong> ${fmt(boqAmt, cur)}</div>
            <div style="margin-top:6px"><strong>الكمية:</strong> ${qty} ${item.unit}</div>
          </div>
          ${rowsSection("المواد", mats)}
          ${rowsSection("العمالة", labs)}
          ${rowsSection("المعدات", plts)}
          <div class="box">
            <strong>الافتراضات المستخدمة</strong>
            <ul>
              <li>هالك المواد: ${assum.waste}%</li>
              <li>نقل لكل وحدة: ${fmt(transpAmt, cur)}</li>
              <li>أعباء الموقع: ${assum.siteOH}%</li>
              <li>الإدارة العامة: ${assum.hoOH}%</li>
              <li>المخاطر: ${assum.risk}%</li>
              <li>الربح: ${assum.profit}%</li>
            </ul>
          </div>
          ${notes.trim() ? `<div class="box"><strong>ملاحظات</strong><p>${notes.trim().replace(/\n/g, "<br/>")}</p></div>` : ""}
          <script>window.onload=function(){setTimeout(function(){window.print();},300)}</script>
        </body>
      </html>`;

    openHtmlExport({
      title: `تحليل بند — ${item.ar}`,
      html,
      filename: `تحليل_بند_${reportFileBase}.html`,
      autoPrint: true,
    });
  }, [assum.hoOH, assum.profit, assum.risk, assum.siteOH, assum.waste, boqAmt, cur, division.ar, finalRate, item.ar, item.num, item.unit, labs, mats, notes, openHtmlExport, plts, qty, reportFileBase, transpAmt]);

  const handleRequestQuote = useCallback(async () => {
    const rfqText = [
      "طلب عروض سعر",
      `البند: ${item.num} — ${item.ar}`,
      `القسم: ${division.ar}`,
      `الوحدة: ${item.unit}`,
      `الكمية المطلوبة: ${qty} ${item.unit}`,
      `السعر التقديري الحالي: ${fmt(finalRate, cur)} لكل ${item.unit}`,
      `إجمالي تقديري: ${fmt(boqAmt, cur)}`,
      "",
      "الرجاء تزويدي بعرض سعر لهذا البند شاملاً التوريد والتنفيذ حسب الحاجة.",
      notes.trim() ? `ملاحظات: ${notes.trim()}` : "",
    ].filter(Boolean).join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(rfqText);
      }
    } catch (_) {}

    const html = `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>طلب عروض — ${item.ar}</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#082555;direction:rtl}
            h1{font-size:18px;margin:0 0 6px}
            .sub{color:#64748b;font-size:12px;margin-bottom:14px}
            .card{border:1px solid #dbe2f0;border-radius:12px;padding:14px 16px;margin-bottom:12px}
            .hint{background:#fff8e7;border-color:#f6d78b}
            .value{font-weight:700}
          </style>
        </head>
        <body>
          <h1>طلب عروض سعر</h1>
          <p class="sub">تم إنشاء هذا النموذج من Taseera بتاريخ ${new Date().toLocaleDateString("ar-SA")}</p>
          <div class="card">
            <div><span class="value">البند:</span> ${item.num} — ${item.ar}</div>
            <div style="margin-top:6px"><span class="value">القسم:</span> ${division.ar}</div>
            <div style="margin-top:6px"><span class="value">الوحدة:</span> ${item.unit}</div>
            <div style="margin-top:6px"><span class="value">الكمية المطلوبة:</span> ${qty} ${item.unit}</div>
            <div style="margin-top:6px"><span class="value">السعر التقديري الحالي:</span> ${fmt(finalRate, cur)} لكل ${item.unit}</div>
            <div style="margin-top:6px"><span class="value">الإجمالي التقديري:</span> ${fmt(boqAmt, cur)}</div>
          </div>
          ${notes.trim() ? `<div class="card"><div class="value">ملاحظات إضافية</div><div style="margin-top:8px">${notes.trim().replace(/\n/g, "<br/>")}</div></div>` : ""}
          <div class="card hint">
            تم نسخ نص طلب العروض للحافظة متى كان ذلك مدعومًا. يمكنك الآن مشاركة هذه الصفحة أو طباعتها أو إرسال النص مباشرة إلى المورد.
          </div>
        </body>
      </html>`;

    openHtmlExport({
      title: `طلب عروض — ${item.ar}`,
      html,
      filename: `طلب_عروض_${reportFileBase}.html`,
      autoPrint: false,
    });
  }, [boqAmt, cur, division.ar, finalRate, item.ar, item.num, item.unit, notes, openHtmlExport, qty, reportFileBase]);

  return (
    <div style={{ fontFamily: AR, direction: "rtl" }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, #082555 0%, #0d3570 100%)`,
        borderRadius: 18, padding: "14px 16px", marginBottom: 12,
        boxShadow: "0 6px 24px rgba(8,37,85,0.22)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", borderRadius: 8, padding: "4px 12px", cursor: "pointer",
            fontFamily: AR, fontSize: 11,
          }}>← رجوع للبنود</button>
          <span style={{
            background: `${accent}22`, border: `1px solid ${accent}44`,
            color: "#c4b5fd", borderRadius: 7, padding: "3px 9px", fontSize: 10, fontFamily: MONO,
          }}>RESOURCE-BASED</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{
            background: accent, borderRadius: 10, width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>
            {DIV_ICONS[division.rateKey] || "📋"}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>{item.ar}</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: "3px 0 0", fontFamily: MONO }}>
              {item.num} — {division.ar}
            </p>
          </div>
        </div>

        {/* Qty + Final Rate bar */}
        <div style={{
          marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10,
          padding: "9px 12px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
        }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>الوحدة</p>
            <p style={{ color: "#fff", fontWeight: 700, margin: "2px 0 0", fontFamily: MONO }}>{item.unit}</p>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>الكمية</p>
            <input
              type="number" min={0} value={qty}
              onChange={e => setQty(parseFloat(e.target.value) || 1)}
              style={{
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 13,
                borderRadius: 6, padding: "2px 7px", width: 70, textAlign: "center",
              }}
            />
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>سعر الوحدة</p>
            <p style={{ color: "#C9A84C", fontWeight: 900, margin: "2px 0 0", fontFamily: MONO, fontSize: 16 }}>
              {fmt(finalRate, cur)}
            </p>
          </div>
          <div style={{ marginRight: "auto", textAlign: "left" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>إجمالي البند</p>
            <p style={{ color: "#fff", fontWeight: 800, margin: "2px 0 0", fontFamily: MONO }}>
              {fmt(boqAmt, cur)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scope ── */}
      <Section title="نطاق البند — Scope" icon="🔍" accent="#082555" defaultOpen={false}>
        {scope.map((s, i) => (
          <p key={i} style={{ fontSize: 12, margin: "4px 0", color: "#374151", lineHeight: 1.5 }}>{s}</p>
        ))}
      </Section>

      {/* ── Assumptions ── */}
      <Section title="الافتراضات — Assumptions" icon="📋" accent="#6366f1" defaultOpen={true}>
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(118px, 1fr))", gap: 8, minWidth: 370 }}>
          {[
            { label: "هالك %",        field: "waste",     suffix: "%" },
            { label: "نقل / وحدة",    field: "transport", suffix: cur },
            { label: "أعباء موقع %",  field: "siteOH",    suffix: "%" },
            { label: "إدارة عامة %",  field: "hoOH",      suffix: "%" },
            { label: "مخاطر %",       field: "risk",      suffix: "%" },
            { label: "ربح %",         field: "profit",    suffix: "%" },
          ].map(({ label, field, suffix }) => (
            <div key={field} style={{
              background: "#f5f3ff", borderRadius: 9, padding: "7px 9px",
              border: "1px solid #e0e7ff",
            }}>
              <p style={{ fontSize: 10, color: "#6366f1", margin: "0 0 3px", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                <input
                  type="number" min={0} step="any" value={assum[field]}
                  onChange={e => setA(field, parseFloat(e.target.value) || 0)}
                  style={{
                    fontFamily: MONO, fontSize: 12, flex: 1, minWidth: 0,
                    background: "rgba(255,255,255,0.7)", border: "1px solid #c7d2fe",
                    borderRadius: 5, padding: "2px 5px", textAlign: "left", outline: "none",
                  }}
                />
                <span style={{ fontSize: 10, color: "#818cf8", whiteSpace: "nowrap", flexShrink: 0 }}>{suffix}</span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </Section>

      {/* ── Materials ── */}
      <Section
        title="1. المواد — Materials"
        icon="🧱" accent="#059669"
        extra={fmt(matTotal + wasteAmt, cur)}
      >
        <ResTable rows={mats} onChange={setMats} accent="#059669" cur={cur} unit={item.unit} />
        {assum.waste > 0 && (
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
            هالك ({assum.waste}%) = {fmt(wasteAmt, cur)} &nbsp;│&nbsp; إجمالي المواد + هالك = {fmt(matTotal + wasteAmt, cur)}
          </p>
        )}
      </Section>

      {/* ── Labour ── */}
      <Section title="2. العمالة — Labour" icon="👷" accent="#d97706" extra={fmt(labTotal, cur)}>
        <ResTable rows={labs} onChange={setLabs} accent="#d97706" cur={cur} unit={item.unit} />
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
          💡 الكمية = نسبة يومية لكل وحدة (مثلاً: 0.35 يومية × {item.unit} = نجار ينفذ ~{(1/0.35).toFixed(1)} {item.unit}/يوم)
        </p>
      </Section>

      {/* ── Plant ── */}
      <Section title="3. المعدات — Plant / Equipment" icon="🏗️" accent="#7c3aed" extra={fmt(pltTotal, cur)}>
        <ResTable rows={plts} onChange={setPlts} accent="#7c3aed" cur={cur} unit={item.unit} />
      </Section>

      {/* ── Direct Cost Summary ── */}
      <div style={{
        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "2px solid #86efac", borderRadius: 14, padding: "12px 16px", marginBottom: 10,
      }}>
        <p style={{ fontWeight: 800, fontSize: 13, color: "#166534", margin: "0 0 8px" }}>📊 التكلفة المباشرة — Direct Cost</p>
        {[
          ["مواد (+ هالك)",    matTotal + wasteAmt],
          ["عمالة",            labTotal],
          ["معدات",            pltTotal],
          ["نقل",              transpAmt],
        ].map(([label, val]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "4px 0", borderBottom: "1px solid #bbf7d0",
            fontSize: 12, color: "#374151",
          }}>
            <span>{label}</span>
            <span style={{ fontFamily: MONO, fontWeight: 600 }}>{fmt(val, cur)}</span>
          </div>
        ))}
        <div style={{
          display: "flex", justifyContent: "space-between", paddingTop: 7,
          fontSize: 14, fontWeight: 800, color: "#166534",
        }}>
          <span>إجمالي التكلفة المباشرة</span>
          <span style={{ fontFamily: MONO }}>{fmt(dc, cur)}</span>
        </div>
      </div>

      {/* ── Mark-up ── */}
      <div style={{
        background: "linear-gradient(135deg,#fef3c7,#fde68a)",
        border: "2px solid #fbbf24", borderRadius: 14, padding: "12px 16px", marginBottom: 12,
      }}>
        <p style={{ fontWeight: 800, fontSize: 13, color: "#92400e", margin: "0 0 8px" }}>💰 الإضافات — Mark-up</p>
        {[
          [`أعباء موقع (${assum.siteOH}%)`,  siteOH],
          [`إدارة عامة (${assum.hoOH}%)`,    hoOH],
          [`مخاطر (${assum.risk}%)`,          risk],
        ].map(([label, val]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "4px 0", borderBottom: "1px solid #fde68a",
            fontSize: 12, color: "#78350f",
          }}>
            <span>{label}</span>
            <span style={{ fontFamily: MONO, fontWeight: 600 }}>{fmt(val, cur)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#78350f", borderBottom: "1px solid #fde68a" }}>
          <span>مجموع قبل الربح</span>
          <span style={{ fontFamily: MONO, fontWeight: 600 }}>{fmt(preProfit, cur)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 0", fontSize: 12, color: "#78350f" }}>
          <span>{`ربح (${assum.profit}%)`}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700 }}>{fmt(profit, cur)}</span>
        </div>
      </div>

      {/* ── Final Rate ── */}
      <div style={{
        background: "linear-gradient(135deg,#082555,#0d3570)",
        borderRadius: 18, padding: "18px 20px",
        boxShadow: "0 8px 28px rgba(8,37,85,0.28)", marginBottom: 12,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>سعر الوحدة النهائي</p>
            <p style={{ color: "#C9A84C", fontSize: 24, fontWeight: 900, margin: "4px 0 0", fontFamily: MONO }}>
              {fmt(finalRate)} <span style={{ fontSize: 13 }}>{cur}</span>
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, margin: "2px 0 0" }}>لكل {item.unit}</p>
          </div>
          <div style={{
            background: "rgba(201,168,76,0.14)", borderRadius: 12, padding: "9px 14px",
            border: "1px solid rgba(201,168,76,0.28)", textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>إجمالي البند</p>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: "3px 0 0", fontFamily: MONO }}>
              {fmt(boqAmt, cur)}
            </p>
          </div>
        </div>
        <p style={{
          marginTop: 10, textAlign: "center", fontSize: 11,
          color: "rgba(255,255,255,0.28)", fontFamily: MONO,
        }}>
          {qty} {item.unit} × {fmt(finalRate, cur)} = {fmt(boqAmt, cur)}
        </p>
      </div>

      <div style={{
        background: "#ffffff",
        border: "1.5px solid #dbe2f0",
        borderRadius: 16,
        padding: "14px",
        marginBottom: 12,
        boxShadow: "0 4px 16px rgba(8,37,85,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#082555" }}>التصدير وطلب العروض</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>
              تصدير سريع للتقرير أو إنشاء نموذج طلب عروض جاهز للمشاركة
            </p>
          </div>
          <span style={{
            background: "#eef4ff",
            color: "#3658a7",
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}>
            أسهل مسار تصدير
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <button
            type="button"
            onClick={handleExportPdf}
            style={{
              minHeight: 52,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#c9a84c,#e5c96a)",
              color: "#082555",
              fontFamily: AR,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(201,168,76,0.28)",
            }}
          >
            حفظ / تصدير التحليل PDF
          </button>
          <button
            type="button"
            onClick={handleRequestQuote}
            style={{
              minHeight: 52,
              borderRadius: 12,
              border: "1px solid #d7dfef",
              background: "#f8fbff",
              color: "#082555",
              fontFamily: AR,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            إنشاء طلب عروض
          </button>
        </div>
      </div>

      {/* ── Notes ── */}
      <Section title="ملاحظات — Notes" icon="📝" accent="#dc2626" defaultOpen={false}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="أضف ملاحظاتك هنا..."
          rows={3}
          style={{
            width: "100%", fontFamily: AR, fontSize: 12, color: "#374151",
            border: "1px solid #fee2e2", borderRadius: 8, padding: "8px 10px",
            resize: "vertical", outline: "none", background: "#fff9f9",
            boxSizing: "border-box",
          }}
        />
      </Section>

      {/* ── Methodology ── */}
      <Section title="كيف حسبنا السعر؟ — Methodology" icon="🧮" accent="#6366f1" defaultOpen={false}>
        <div style={{ fontFamily: AR, direction: "rtl", fontSize: 12, color: "#374151", lineHeight: 1.9 }}>

          {/* Intro */}
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#4338ca" }}>
            أسلوب البناء من الأساس — First Principle Estimating
          </p>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 12 }}>
            بدل ما نأخذ سعرًا جاهزًا من السوق، قمنا ببناء سعر الوحدة خطوة بخطوة
            من مكوناته الأساسية، تمامًا كما يفعل المهندس المتخصص في إعداد المقايسات.
          </p>

          {/* Steps */}
          {[
            {
              num: "١", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd",
              title: "حصر الموارد المباشرة",
              body: `حددنا كل مورد يدخل في تنفيذ البند: المواد الخام بكمياتها ووحداتها، عناصر العمالة بساعات العمل وتكلفة الساعة، والمعدات والآلات بساعات التشغيل — وذلك استناداً إلى أكواد CSI MasterFormat المعيارية للبند «${item.ar}».`,
            },
            {
              num: "٢", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0",
              title: "إضافة الأعباء غير المباشرة",
              body: `على التكلفة المباشرة أضفنا: هدر المواد (Waste) بنسبة ${assum.waste}%، تكاليف نقل وتوصيل (${fmt(transpAmt, cur)})، المصاريف العامة للموقع (Site OH) بنسبة ${assum.siteOH}%، المصاريف العامة للشركة (HO OH) بنسبة ${assum.hoOH}%، ومخصص المخاطر والطوارئ (Risk) بنسبة ${assum.risk}%.`,
            },
            {
              num: "٣", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
              title: "احتساب هامش الربح",
              body: `على مجموع التكاليف المباشرة وغير المباشرة أضفنا هامش ربح (Profit Margin) بنسبة ${assum.profit}%، للوصول إلى سعر البيع النهائي للوحدة.`,
            },
            {
              num: "٤", color: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe",
              title: "النتيجة النهائية",
              body: `سعر الوحدة = ${fmt(finalRate, cur)} / ${item.unit}، وبضرب السعر في الكمية المدخلة (${qty} ${item.unit}) نحصل على إجمالي البند = ${fmt(boqAmt, cur)}.`,
            },
          ].map(step => (
            <div key={step.num} style={{
              display: "flex", gap: 10, marginBottom: 10, padding: "10px 12px",
              background: step.bg, border: `1px solid ${step.border}`, borderRadius: 10,
            }}>
              <div style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                background: step.color, color: "#fff", fontWeight: 900, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: AR,
              }}>{step.num}</div>
              <div>
                <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 12, color: step.color }}>{step.title}</p>
                <p style={{ margin: 0, color: "#4b5563", fontSize: 11.5, lineHeight: 1.75 }}>{step.body}</p>
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div style={{
            marginTop: 4, padding: "8px 12px", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
              جميع الأسعار المرجعية مستندة إلى متوسطات السوق المحلي وتُحدَّث دورياً.
              يمكنك تعديل أي مورد أو نسبة في الجداول أعلاه لتحصل على تسعير مخصص يعكس ظروف مشروعك الفعلية.
            </p>
          </div>
        </div>
      </Section>

    </div>
  );
}

// ─── ITEMS VIEW ────────────────────────────────────────────────────────────────
function ItemsView({ division, country, onSelectItem, onBack }) {
  const accent = DIV_COLORS[division.rateKey] || "#082555";
  const cur    = CUR[country] || "ر.س";
  const mkt    = MARKET_RATES[country]?.[division.rateKey];

  return (
    <div style={{ fontFamily: AR, direction: "rtl" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
        borderRadius: 16, padding: "14px 16px", marginBottom: 14,
        boxShadow: `0 6px 20px ${accent}30`,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", borderRadius: 7, padding: "4px 10px", cursor: "pointer",
          fontFamily: AR, fontSize: 11, marginBottom: 10, display: "block",
        }}>← العودة للأقسام</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{DIV_ICONS[division.rateKey] || "📋"}</span>
          <div>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>{division.ar}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, margin: "3px 0 0", fontFamily: MONO }}>
              Division {division.num} — {division.items.length} بند
              {mkt && ` — سعر سوق: ${fmt(mkt, cur)}/${division.unit}`}
            </p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {division.items.map(item => (
          <button
            key={item.num}
            onClick={() => onSelectItem(item)}
            style={{
              background: "#fff",
              border: `1.5px solid ${accent}18`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", textAlign: "right", width: "100%",
              boxShadow: `0 2px 8px ${accent}0a`,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}18`; e.currentTarget.style.boxShadow = `0 2px 8px ${accent}0a`; }}
          >
            {/* Num badge */}
            <span style={{
              background: `${accent}10`, color: accent,
              borderRadius: 7, padding: "3px 8px", fontSize: 10,
              fontFamily: MONO, fontWeight: 700, flexShrink: 0,
              border: `1px solid ${accent}20`,
            }}>{item.num}</span>

            {/* Text */}
            <span style={{ flex: 1, fontFamily: AR, fontSize: 13, fontWeight: 600, color: "#0d2545" }}>
              {item.ar}
            </span>

            {/* Unit badge */}
            <span style={{
              background: "#f1f5f9", color: "#64748b",
              borderRadius: 6, padding: "3px 8px", fontSize: 10,
              fontFamily: MONO, flexShrink: 0,
            }}>{item.unit}</span>

            <span style={{ color: accent, fontSize: 14, flexShrink: 0, opacity: 0.5 }}>‹</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DIVISIONS VIEW ────────────────────────────────────────────────────────────
function DivisionsView({ country, onSelectDivision }) {
  const cur = CUR[country] || "ر.س";
  const mkt = MARKET_RATES[country] || {};

  return (
    <div style={{ fontFamily: AR, direction: "rtl" }}>
      {/* Title */}
      <div style={{
        background: "linear-gradient(135deg,#082555,#0d3570)",
        borderRadius: 16, padding: "14px 16px", marginBottom: 14,
        boxShadow: "0 6px 20px rgba(8,37,85,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: "#6366f1", borderRadius: 10, width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🧮</span>
          <div>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>التسعير بالموارد</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "3px 0 0", fontFamily: AR }}>
              اختر قسم CSI ثم حدد البند لبناء سعر الوحدة
            </p>
          </div>
        </div>
      </div>

      {/* Division grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CSI_DIVISIONS.map(div => {
          const accent = DIV_COLORS[div.rateKey] || "#082555";
          const mktVal = mkt[div.rateKey];
          return (
            <button
              key={div.num}
              onClick={() => onSelectDivision(div)}
              style={{
                background: "#fff",
                border: `1.5px solid ${accent}18`,
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", textAlign: "right", width: "100%",
                boxShadow: `0 2px 10px ${accent}0a`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}50`; e.currentTarget.style.background = `${accent}05`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}18`; e.currentTarget.style.background = "#fff"; }}
            >
              {/* Icon circle */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${accent}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                {DIV_ICONS[div.rateKey] || "📋"}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: AR, fontSize: 14, fontWeight: 700, color: "#0d2545", margin: 0 }}>
                  {div.ar}
                </p>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "#94a3b8", margin: "3px 0 0" }}>
                  Division {div.num} — {div.items.length} بنود
                  {mktVal && ` — سوق: ${fmt(mktVal)}/${div.unit}`}
                </p>
              </div>

              {/* Items count badge */}
              <span style={{
                background: `${accent}10`, color: accent,
                borderRadius: 20, padding: "3px 10px", fontSize: 11,
                fontFamily: MONO, fontWeight: 700, flexShrink: 0,
              }}>{div.items.length}</span>

              <span style={{ color: accent, fontSize: 14, flexShrink: 0, opacity: 0.4 }}>‹</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────────
export default function CandyWorkspace({ country = "sa", onBack }) {
  const [view, setView]   = useState("divisions"); // divisions | items | analysis
  const [selDiv,  setDiv] = useState(null);
  const [selItem, setItem] = useState(null);

  const goToDivisions = useCallback(() => { setView("divisions"); setDiv(null); setItem(null); }, []);
  const goToItems     = useCallback((div) => { setDiv(div); setItem(null); setView("items"); }, []);
  const goToAnalysis  = useCallback((item) => { setItem(item); setView("analysis"); }, []);

  return (
    <div style={{ fontFamily: AR, direction: "rtl" }}>

      {/* Top back button (to PricingWorkspace selection) */}
      {view === "divisions" && (
        <button
          onClick={onBack}
          style={{
            marginBottom: 10, background: "rgba(8,37,85,0.06)",
            border: "1px solid rgba(8,37,85,0.12)", color: "#082555",
            borderRadius: 9, padding: "6px 14px", cursor: "pointer",
            fontFamily: AR, fontSize: 12,
          }}
        >← رجوع لطريقة التسعير</button>
      )}

      {view === "divisions" && (
        <DivisionsView
          country={country}
          onSelectDivision={goToItems}
        />
      )}

      {view === "items" && selDiv && (
        <ItemsView
          division={selDiv}
          country={country}
          onSelectItem={goToAnalysis}
          onBack={goToDivisions}
        />
      )}

      {view === "analysis" && selDiv && selItem && (
        <AnalysisView
          item={selItem}
          division={selDiv}
          country={country}
          onBack={() => setView("items")}
        />
      )}
    </div>
  );
}

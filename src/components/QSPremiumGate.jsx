import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  listenQSPremiumStatus,
  requestQSPremium,
  addTrialItem,
  requestRefund,
  listenFreeTrial,
  startFreeTrial,
  recordFreeTrialItem,
  FREE_TRIAL_LIMIT,
} from "../services/qsPremiumApi";

// ---------------------------------------------------------------------------
// Price configuration
// ---------------------------------------------------------------------------
const PRICES = {
  sa: { amount: 200, currency: "SAR", label: "٢٠٠ ر.س", labelEn: "200 SAR" },
  eg: { amount: 2800, currency: "EGP", label: "٢٨٠٠ ج.م", labelEn: "2,800 EGP" },
  ae: { amount: 200, currency: "AED", label: "٢٠٠ درهم", labelEn: "200 AED" },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const QSPremiumContext = createContext(null);

export function useQSPremium() {
  return useContext(QSPremiumContext);
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------
const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

const PAYWALL_GRADIENT = "linear-gradient(160deg,#0f2444 0%,#1a3a6e 100%)";

const styles = {
  root: {
    fontFamily: AR,
    direction: "rtl",
    minHeight: "60vh",
  },
  paywallWrap: {
    background: PAYWALL_GRADIENT,
    borderRadius: "20px",
    padding: "32px 24px 40px",
    color: "#fff",
    maxWidth: "500px",
    margin: "0 auto",
    boxShadow: "0 8px 40px rgba(15,36,68,0.45)",
    position: "relative",
  },
  crown: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    textAlign: "center",
    color: "#ffd700",
    letterSpacing: "0.01em",
  },
  titleAr: {
    fontSize: "16px",
    fontWeight: "700",
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    marginTop: "2px",
  },
  priceBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,215,0,0.15)",
    border: "1.5px solid rgba(255,215,0,0.5)",
    borderRadius: "100px",
    padding: "6px 20px",
    color: "#ffd700",
    fontSize: "18px",
    fontWeight: "800",
    margin: "16px auto 0",
    justifyContent: "center",
    gap: "6px",
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: "20px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.9)",
    lineHeight: "1.5",
  },
  goldCheck: {
    color: "#ffd700",
    fontSize: "15px",
    flexShrink: 0,
    marginTop: "1px",
  },
  ctaButton: {
    display: "block",
    width: "100%",
    background: "linear-gradient(135deg,#f5c842 0%,#e8a800 100%)",
    color: "#0f2444",
    fontFamily: AR,
    fontSize: "15px",
    fontWeight: "800",
    border: "none",
    borderRadius: "12px",
    padding: "14px 0",
    marginTop: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(245,200,66,0.35)",
    letterSpacing: "0.02em",
  },
  infoBtn: {
    position: "absolute",
    top: "16px",
    left: "16px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  overlayCard: {
    background: "#0f2444",
    border: "1px solid rgba(255,215,0,0.25)",
    borderRadius: "18px",
    padding: "28px 24px",
    maxWidth: "420px",
    width: "100%",
    color: "#fff",
    direction: "rtl",
    fontFamily: AR,
    boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingWrap: {
    textAlign: "center",
    padding: "48px 24px",
    background: "#f8fafc",
    borderRadius: "20px",
    border: "2px solid #dbeafe",
  },
  pendingIcon: {
    fontSize: "48px",
    animation: "spin 2s linear infinite",
    display: "inline-block",
  },
  trialBanner: {
    background: "linear-gradient(90deg,#1a3a6e 0%,#0f2444 100%)",
    color: "#fff",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  refundBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "11px",
    padding: "5px 12px",
    cursor: "pointer",
    fontFamily: AR,
    fontWeight: "700",
  },
  premiumBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "linear-gradient(90deg,#ffd700,#e8a800)",
    color: "#0f2444",
    borderRadius: "100px",
    padding: "3px 12px",
    fontSize: "11px",
    fontWeight: "800",
    marginBottom: "12px",
  },
  formInput: {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "#fff",
    fontFamily: AR,
    fontSize: "13px",
    padding: "10px 14px",
    outline: "none",
    resize: "vertical",
    direction: "rtl",
  },
  warningBanner: {
    background: "#fef9c3",
    border: "1px solid #fbbf24",
    borderRadius: "10px",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "700",
    padding: "10px 14px",
    marginBottom: "12px",
    direction: "rtl",
    fontFamily: AR,
  },
};

const FEATURES = [
  "تحليل التكلفة بأسلوب First Principle",
  "جميع أقسام CSI (18 قسم، 300+ بند)",
  "مواد + عمالة + معدات قابلة للتعديل",
  "افتراضات التكلفة الغير المباشرة",
  "سعر الوحدة النهائي بالتفصيل",
  "تصدير التحليل وحفظه في حسابك",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysBetween(ts) {
  if (!ts) return 0;
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  const diff = d - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function hoursBetween(ts) {
  if (!ts) return 0;
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  const diff = d - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function InfoModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} type="button">✕</button>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffd700", marginBottom: "12px" }}>
          QS Premium Package
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: "1.7" }}>
          <p style={{ marginBottom: "12px" }}>
            باقة التسعير الاحترافية مصممة للمهندسين والمقاولين الذين يحتاجون إلى تحليل دقيق للتكاليف
            باستخدام أسلوب First Principle مع بيانات شاملة لجميع أقسام CSI.
          </p>
          <div style={{ fontWeight: "700", color: "#ffd700", marginBottom: "8px" }}>📋 سياسة الاسترداد:</div>
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "12px",
            lineHeight: "1.9",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#4ade80", flexShrink: 0 }}>✅</span>
              <span><strong style={{ color: "#fff" }}>خلال 48 ساعة من الفتح:</strong> يمكن طلب استرداد المبلغ مع خصم <strong style={{ color: "#ffd700" }}>5 دولار</strong> رسوم إدارية فقط</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#facc15", flexShrink: 0 }}>⚠️</span>
              <span><strong style={{ color: "#fff" }}>بعد 48 ساعة حتى 7 أيام:</strong> يمكن طلب الاسترداد مع خصم <strong style={{ color: "#ffd700" }}>20 دولار</strong> رسوم الاستخدام</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#f87171", flexShrink: 0 }}>🚫</span>
              <span><strong style={{ color: "#fff" }}>بعد مرور 7 أيام:</strong> لا يمكن استرداد المبلغ نهائياً</span>
            </div>
          </div>
          <div style={{ marginTop: "10px", fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6" }}>
            ⏱ فترة التجربة 48 ساعة — وصول كامل لجميع البنود والباقتين المتاحتين في التطبيق
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ ...styles.ctaButton, marginTop: "20px", padding: "10px 0", fontSize: "13px" }}
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
}

const ADMIN_EMAIL = "walidghazal46@gmail.com";

function buildEmailPayload({ orderId, userName, userEmail, amount, currency, countryLabel, note }) {
  const subject = `طلب اشتراك QS Premium #${orderId} — ${userName || userEmail}`;
  const body = [
    `السلام عليكم،`,
    ``,
    `أودّ الاشتراك في باقة QS Premium Package — باقة التسعير الاحترافية.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `رقم الطلب : ${orderId}`,
    `الاسم     : ${userName || "—"}`,
    `الإيميل   : ${userEmail || "—"}`,
    `الدولة    : ${countryLabel}`,
    `المبلغ    : ${amount} ${currency}`,
    note ? `ملاحظة    : ${note}` : "",
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `⚠️ ملاحظة مهمة: يُرجى إرفاق ايصال الدفع مع هذا الإيميل حتى يتم تفعيل الباقة.`,
    ``,
    `شكراً،`,
    userName || userEmail,
  ].filter((l) => l !== null).join("\n");

  return {
    adminEmail: ADMIN_EMAIL,
    subject,
    body,
    mailtoLink: `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

const COUNTRY_LABELS = { sa: "المملكة العربية السعودية", eg: "جمهورية مصر العربية", ae: "الإمارات العربية المتحدة" };

function RequestForm({ country, userId, userEmail, userName, systemBridge, onSuccess, onCancel }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);  // after mailto opened
  const countryKey = (country || "").toLowerCase();
  const priceInfo = PRICES[countryKey] || PRICES.ae;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const { orderId } = await requestQSPremium({ userId, userEmail, userName, country: countryKey });

      const emailPayload = buildEmailPayload({
        orderId,
        userName,
        userEmail,
        amount: priceInfo.amount,
        currency: priceInfo.currency,
        countryLabel: COUNTRY_LABELS[countryKey] || countryKey,
        note: note.trim(),
      });
      if (systemBridge?.openEmail) {
        systemBridge.openEmail(emailPayload.adminEmail, emailPayload.subject, emailPayload.body);
      } else {
        window.location.href = emailPayload.mailtoLink;
      }

      setSent(true); // show the "pending" confirmation inside the overlay
    } catch (err) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  // ── After sending: show green confirmation ──────────────────────────────────
  if (sent) {
    return (
      <div style={styles.overlay}>
        <div style={{ ...styles.overlayCard, textAlign: "center" }}>
          {/* Green checkmark circle */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
          }}>
            <span style={{ fontSize: 34, color: "#fff" }}>✓</span>
          </div>

          <div style={{ fontSize: "18px", fontWeight: "800", color: "#4ade80", marginBottom: "8px" }}>
            تم إرسال الطلب بنجاح!
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.8", marginBottom: "20px" }}>
            تم حفظ طلبك وفتح تطبيق البريد الإلكتروني تلقائياً.
            <br />
            <strong style={{ color: "#ffd700" }}>يُرجى إرفاق ايصال الدفع وإرسال الإيميل</strong>
            <br />
            حتى يتمكن فريق الإدارة من مراجعة طلبك وتفعيل الباقة.
          </div>

          {/* Info box */}
          <div style={{
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.25)",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
            lineHeight: "1.7",
            marginBottom: "20px",
            textAlign: "right",
          }}>
            ⏱ سيتم مراجعة طلبك خلال 24–48 ساعة عمل بعد استلام الإيصال.
            <br />
            📧 ستظهر الباقة مفعّلة تلقائياً بعد موافقة الإدارة.
          </div>

          <button
            type="button"
            onClick={onSuccess}
            style={{ ...styles.ctaButton, marginTop: 0 }}
          >
            حسناً، سأرسل الإيميل الآن
          </button>
        </div>
      </div>
    );
  }

  // ── Request form ────────────────────────────────────────────────────────────
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onCancel} type="button">✕</button>
        <div style={{ fontSize: "17px", fontWeight: "800", color: "#ffd700", marginBottom: "4px" }}>
          طلب الاشتراك
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "16px" }}>
          QS Premium Package — باقة التسعير الاحترافية
        </div>

        {/* Price badge */}
        <div style={{
          background: "rgba(255,215,0,0.1)",
          border: "1px solid rgba(255,215,0,0.3)",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>رسوم الاشتراك</div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ffd700" }}>{priceInfo.label}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{priceInfo.labelEn}</div>
        </div>

        {/* Steps hint */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "10px",
          padding: "10px 14px",
          marginBottom: "14px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.75)",
          lineHeight: "1.8",
          direction: "rtl",
        }}>
          <div style={{ fontWeight: "700", color: "#ffd700", marginBottom: "4px" }}>كيف يعمل الطلب؟</div>
          1️⃣ اضغط "تأكيد" ← يُفتح تطبيق البريد تلقائياً<br />
          2️⃣ أرفق ايصال الدفع وأرسل الإيميل<br />
          3️⃣ تنتظر موافقة الإدارة (24–48 ساعة)<br />
          4️⃣ تُفعَّل الباقة تلقائياً بعد الموافقة ✓
        </div>

        {/* Optional note */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
            ملاحظة للإدارة (اختياري)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أي ملاحظة إضافية..."
            rows={2}
            style={styles.formInput}
          />
        </div>

        {/* Refund policy — shown before submit */}
        <div style={{
          background: "rgba(255,215,0,0.07)",
          border: "1px solid rgba(255,215,0,0.25)",
          borderRadius: "10px",
          padding: "12px 14px",
          marginBottom: "14px",
          fontSize: "11px",
          lineHeight: "1.9",
          direction: "rtl",
          color: "rgba(255,255,255,0.8)",
        }}>
          <div style={{ fontWeight: "800", color: "#ffd700", marginBottom: "6px", fontSize: "12px" }}>
            📋 سياسة الاسترداد — يرجى القراءة قبل التأكيد
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
            <span style={{ color: "#4ade80", flexShrink: 0 }}>✅</span>
            <span>بعد الفتح مباشرةً — فترة تجربة <strong style={{ color: "#fff" }}>48 ساعة</strong> بوصول كامل لجميع البنود والباقتين</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
            <span style={{ color: "#4ade80", flexShrink: 0 }}>✅</span>
            <span>طلب استرداد خلال الـ 48 ساعة → خصم <strong style={{ color: "#ffd700" }}>5 دولار</strong> فقط</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
            <span style={{ color: "#facc15", flexShrink: 0 }}>⚠️</span>
            <span>استرداد بعد 48 ساعة وحتى 7 أيام → خصم <strong style={{ color: "#ffd700" }}>20 دولار</strong></span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ color: "#f87171", flexShrink: 0 }}>🚫</span>
            <span>بعد مرور <strong style={{ color: "#fff" }}>7 أيام</strong> من الفتح → لا يمكن الاسترداد نهائياً</span>
          </div>
        </div>

        {error && (
          <div style={{ color: "#fca5a5", fontSize: "12px", marginBottom: "12px" }}>{error}</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...styles.ctaButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "جاري الإرسال..." : "تأكيد طلب الاشتراك — أفهم سياسة الاسترداد"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: "block", width: "100%",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px", padding: "10px 0",
            color: "rgba(255,255,255,0.7)",
            fontFamily: AR, fontSize: "13px",
            cursor: "pointer", marginTop: "8px",
          }}
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

function RefundModal({ onSubmit, onCancel }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onSubmit(reason.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onCancel} type="button">✕</button>
        <div style={{ fontSize: "16px", fontWeight: "800", color: "#ffd700", marginBottom: "8px" }}>
          طلب استرداد المبلغ
        </div>
        <div style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.8)",
          lineHeight: "1.8",
          marginBottom: "16px",
          direction: "rtl",
        }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <span style={{ color: "#4ade80", flexShrink: 0 }}>✅</span>
            <span><strong style={{ color: "#fff" }}>خلال 48 ساعة:</strong> خصم 5 دولار فقط</span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <span style={{ color: "#facc15", flexShrink: 0 }}>⚠️</span>
            <span><strong style={{ color: "#fff" }}>بعد 48 ساعة حتى 7 أيام:</strong> خصم 20 دولار</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#f87171", flexShrink: 0 }}>🚫</span>
            <span><strong style={{ color: "#fff" }}>بعد 7 أيام:</strong> لا يمكن الاسترداد</span>
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
            سبب طلب الاسترداد *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اذكر السبب بوضوح..."
            rows={4}
            style={styles.formInput}
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !reason.trim()}
          style={{
            ...styles.ctaButton,
            background: reason.trim() ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "#6b7280",
            opacity: loading ? 0.7 : 1,
            cursor: loading || !reason.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "جاري الإرسال..." : "إرسال طلب الاسترداد"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Gate Component
// ---------------------------------------------------------------------------
export default function QSPremiumGate({
  country,
  userId,
  userEmail,
  userName,
  children,
  onOpenAuthScreen,
  systemBridge,
  isAdminUnlocked = false,
}) {
  const [subscription, setSubscription] = useState(undefined); // undefined = loading
  const [showInfo, setShowInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundSent, setRefundSent] = useState(false);
  const [freeTrial, setFreeTrial] = useState(null);   // null = not started, { started, itemsUsed } = active
  const [freeTrialLoading, setFreeTrialLoading] = useState(false);

  const countryKey = (country || "").toLowerCase();
  const priceInfo = PRICES[countryKey] || PRICES.ae;
  const hasAdminAccess = Boolean(isAdminUnlocked);

  useEffect(() => {
    if (hasAdminAccess) {
      setSubscription(null);
      return;
    }
    if (!userId) {
      setSubscription(null);
      return;
    }
    // Debounce listener setup — guards against React StrictMode's double-invoke
    // which causes Firestore's internal watch target table to go negative (ca9 assertion)
    let active = true;
    let unsubFn = null;
    const timer = setTimeout(() => {
      if (!active) return;
      unsubFn = listenQSPremiumStatus(userId, (data) => {
        if (active) setSubscription(data);
      });
    }, 100);
    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubFn) unsubFn();
    };
  }, [hasAdminAccess, userId]);

  // Free trial listener
  useEffect(() => {
    if (!userId || hasAdminAccess) return;
    let active = true;
    const unsub = listenFreeTrial(userId, (data) => {
      if (active) setFreeTrial(data);
    });
    return () => { active = false; unsub?.(); };
  }, [userId, hasAdminAccess]);

  // Derived state
  const status = hasAdminAccess ? "active" : (subscription?.status || "none");
  const nowMs = Date.now();
  const trialEndsAt = subscription?.trialEndsAt;
  const activatedAt = subscription?.activatedAt;
  const noRefundAfter = subscription?.noRefundAfter;
  const isTrial = !hasAdminAccess && status === "active" && trialEndsAt
    ? (typeof trialEndsAt.toDate === "function" ? trialEndsAt.toDate() : new Date(trialEndsAt)) > nowMs
    : false;
  const trialHoursLeft = isTrial ? hoursBetween(trialEndsAt) : 0;
  const trialItemsUsed = subscription?.trialItemsUsed || [];
  const trialItemsCount = trialItemsUsed.length;
  const isActive = hasAdminAccess || status === "active";

  // Free trial derived
  const freeTrialStarted = Boolean(freeTrial?.started);
  const freeTrialItems = freeTrial?.itemsUsed || [];
  const freeTrialCount = freeTrialItems.length;
  const freeTrialExhausted = freeTrialStarted && freeTrialCount >= FREE_TRIAL_LIMIT;
  const inFreeTrial = freeTrialStarted && !freeTrialExhausted && !isActive;

  // canUseItem: full subscription, admin, OR actively in free trial (item not counted yet or already used)
  const canUseItem = hasAdminAccess || isActive || inFreeTrial;

  // Refund window helpers
  const isWithin48h = isTrial;
  const noRefundAt = noRefundAfter
    ? (typeof noRefundAfter.toDate === "function" ? noRefundAfter.toDate() : new Date(noRefundAfter))
    : null;
  const canRefund = noRefundAt ? noRefundAt > nowMs : isTrial;

  const onItemUsed = useCallback(async (itemKey) => {
    if (hasAdminAccess) return;
    if (isActive && userId) { await addTrialItem(userId, itemKey); return; }
    if (inFreeTrial && userId) { await recordFreeTrialItem(userId, itemKey); }
  }, [hasAdminAccess, userId, isActive, inFreeTrial]);

  const contextValue = {
    subscription,
    isActive,
    isTrial,
    trialHoursLeft,
    trialItemsCount,
    canUseItem,
    inFreeTrial,
    freeTrialCount,
    freeTrialExhausted,
    canRefund,
    isWithin48h,
    onItemUsed,
  };

  // -- Loading --
  if (!hasAdminAccess && subscription === undefined) {
    return (
      <div style={{ ...styles.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "28px", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
          <div style={{ marginTop: "8px", fontSize: "13px", fontFamily: AR }}>جاري التحميل...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // -- Pending --
  if (status === "pending") {
    return (
      <div style={styles.root}>
        <div style={styles.pendingWrap}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={styles.pendingIcon}>⏳</div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f2444", margin: "16px 0 8px", fontFamily: AR }}>
            طلبك قيد المراجعة
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", fontFamily: AR, lineHeight: "1.7" }}>
            تم استلام طلب الاشتراك بنجاح. سيقوم فريق الإدارة بمراجعته ومعالجته في أقرب وقت ممكن
            (عادةً خلال 24-48 ساعة عمل).
          </div>
          <div style={{
            marginTop: "20px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "12px",
            color: "#1e3a8a",
            fontFamily: AR,
          }}>
            📧 ستتلقى إشعاراً عند تفعيل اشتراكك.
          </div>
        </div>
      </div>
    );
  }

  // -- Active --
  if (status === "active") {
    const hasRefundRequest = subscription?.refundRequest;
    const refundStatus = hasRefundRequest?.status;

    return (
      <QSPremiumContext.Provider value={contextValue}>
        <div style={styles.root}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

          {isTrial ? (
            /* Trial banner (first 48h) */
            <div style={styles.trialBanner}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "16px" }}>⏱</span>
                <span>
                  أنت في فترة التجربة ({trialHoursLeft} ساعة متبقية) — وصول كامل لجميع البنود والباقتين
                </span>
              </div>
              {!hasRefundRequest && !refundSent && (
                <button
                  type="button"
                  style={styles.refundBtn}
                  onClick={() => setShowRefund(true)}
                >
                  طلب استرداد المبلغ
                </button>
              )}
              {(hasRefundRequest || refundSent) && (
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                  {refundStatus === "pending_review" || refundSent ? "طلب الاسترداد قيد المراجعة" :
                   refundStatus === "approved" ? "تمت الموافقة على الاسترداد" :
                   refundStatus === "rejected" ? "تم رفض طلب الاسترداد" : ""}
                </span>
              )}
            </div>
          ) : canRefund && !hasAdminAccess ? (
            /* After 48h trial but still within 7-day refund window */
            <>
              <div style={{ marginBottom: "12px" }}>
                <div style={styles.premiumBadge}>
                  <span>💎</span>
                  <span>QS Premium — وصول كامل</span>
                </div>
              </div>
              {!hasRefundRequest && !refundSent && (
                <div style={{ ...styles.warningBanner, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span>⚠️ انتهت فترة التجربة — يمكنك الاسترداد مع خصم 20 دولار حتى 7 أيام من الفتح</span>
                  <button type="button" style={{ ...styles.refundBtn, background: "rgba(245,158,11,0.3)", borderColor: "rgba(245,158,11,0.5)", color: "#92400e" }} onClick={() => setShowRefund(true)}>استرداد</button>
                </div>
              )}
              {(hasRefundRequest || refundSent) && (
                <div style={styles.warningBanner}>
                  {refundStatus === "pending_review" || refundSent ? "⏳ طلب الاسترداد قيد المراجعة" :
                   refundStatus === "approved" ? "✅ تمت الموافقة على الاسترداد" :
                   refundStatus === "rejected" ? "❌ تم رفض طلب الاسترداد" : ""}
                </div>
              )}
            </>
          ) : (
            /* Full access — no more refund window */
            <div style={{ marginBottom: "12px" }}>
              <div style={styles.premiumBadge}>
                <span>💎</span>
                <span>{hasAdminAccess ? "QS Premium — وصول الأدمن الكامل" : "QS Premium — وصول كامل"}</span>
              </div>
            </div>
          )}

          {children}

          {showRefund && (
            <RefundModal
              onCancel={() => setShowRefund(false)}
              onSubmit={async (reason) => {
                await requestRefund(userId, reason);
                setRefundSent(true);
                setShowRefund(false);
              }}
            />
          )}
        </div>
      </QSPremiumContext.Provider>
    );
  }

  // -- Free Trial --
  if (inFreeTrial) {
    const remaining = FREE_TRIAL_LIMIT - freeTrialCount;
    return (
      <QSPremiumContext.Provider value={contextValue}>
        <div style={styles.root}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          {/* Free trial banner */}
          <div style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.12) 100%)",
            border: "1px solid rgba(16,185,129,0.35)",
            borderRadius: "14px",
            padding: "12px 16px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            fontFamily: AR,
            fontSize: "13px",
            color: "#6ee7b7",
            direction: "rtl",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>🎁</span>
              <span style={{ fontWeight: "700" }}>التجربة المجانية</span>
              <span style={{ opacity: 0.8 }}>— وصول كامل لجميع البنود والباقتين</span>
            </div>
            <div style={{
              background: "rgba(16,185,129,0.20)",
              border: "1px solid rgba(16,185,129,0.40)",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#a7f3d0",
              whiteSpace: "nowrap",
            }}>
              {remaining} / {FREE_TRIAL_LIMIT} بنود متبقية
            </div>
          </div>
          {children}
        </div>
      </QSPremiumContext.Provider>
    );
  }

  // -- Paywall (none / rejected / deactivated) --
  return (
    <div style={styles.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={styles.paywallWrap}>
        {/* Policy button */}
        <button type="button" onClick={() => setShowInfo(true)} style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "20px",
          padding: "4px 10px",
          color: "#fff",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: "700",
          fontFamily: AR,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          whiteSpace: "nowrap",
        }}>
          📋 سياسة الباقة
        </button>

        {/* Crown icon */}
        <div style={styles.crown}>💎</div>

        {/* Package name */}
        <div style={styles.title}>QS Premium Package</div>
        <div style={styles.titleAr}>باقة التسعير الاحترافية</div>

        {/* Price badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={styles.priceBadge}>
            <span>💰</span>
            <span>{priceInfo.label}</span>
            <span style={{ fontSize: "12px", fontWeight: "400", opacity: 0.7 }}>مرة واحدة</span>
          </div>
        </div>

        {/* Rejection / deactivation notice */}
        {status === "rejected" && subscription?.rejectionReason && (
          <div style={{
            marginTop: "16px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#fca5a5",
          }}>
            <div style={{ fontWeight: "700", marginBottom: "4px" }}>سبب الرفض:</div>
            {subscription.rejectionReason}
          </div>
        )}
        {status === "deactivated" && (
          <div style={{
            marginTop: "16px",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#fcd34d",
          }}>
            تم إيقاف اشتراكك. للاستفسار، تواصل مع الدعم أو أعد تقديم طلب اشتراك جديد.
          </div>
        )}

        {/* Features list */}
        <ul style={styles.featuresList}>
          {FEATURES.map((f) => (
            <li key={f} style={styles.featureItem}>
              <span style={styles.goldCheck}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {!userId ? (
          <button
            type="button"
            onClick={() => onOpenAuthScreen?.()}
            style={{
              display: "block",
              width: "100%",
              marginTop: "24px",
              padding: "12px 16px",
              background: "rgba(220,38,38,0.12)",
              border: "1.5px solid rgba(220,38,38,0.45)",
              borderRadius: "12px",
              boxShadow: "0 0 18px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
              cursor: "pointer",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#fca5a5",
              letterSpacing: "0.01em",
              transition: "box-shadow 0.2s, background 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(220,38,38,0.22)";
              e.currentTarget.style.boxShadow = "0 0 28px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(220,38,38,0.12)";
              e.currentTarget.style.boxShadow = "0 0 18px rgba(220,38,68,0.25), inset 0 1px 0 rgba(255,255,255,0.06)";
            }}
          >
            🔐 يجب تسجيل الدخول أولاً — اضغط هنا لتسجيل الدخول
          </button>
        ) : (
          <>
            <button
              type="button"
              style={styles.ctaButton}
              onClick={() => setShowForm(true)}
            >
              {status === "rejected" || status === "deactivated" ? "طلب اشتراك جديد" : "طلب الاشتراك"}
            </button>

            {/* Free Trial button — only show if trial not started yet and no pending/active request */}
            {!freeTrialStarted && status !== "pending" && status !== "active" && (
              <button
                type="button"
                onClick={async () => {
                  try { await startFreeTrial(userId); } catch (e) { console.warn(e); }
                }}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "10px",
                  padding: "11px 16px",
                  background: "rgba(16,185,129,0.10)",
                  border: "1.5px solid rgba(16,185,129,0.35)",
                  borderRadius: "12px",
                  boxShadow: "0 0 18px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6ee7b7",
                  letterSpacing: "0.01em",
                  fontFamily: AR,
                  transition: "box-shadow 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.20)";
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(16,185,129,0.30), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.10)";
                  e.currentTarget.style.boxShadow = "0 0 18px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
                }}
              >
                🎁 تجربة مجانية — {FREE_TRIAL_LIMIT} بنود مجانية
              </button>
            )}

            {/* Free trial exhausted notice */}
            {freeTrialExhausted && (
              <div style={{
                marginTop: "10px",
                padding: "10px 14px",
                background: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.30)",
                borderRadius: "10px",
                textAlign: "center",
                fontSize: "12px",
                color: "#fcd34d",
                fontFamily: AR,
              }}>
                🔒 انتهت التجربة المجانية ({FREE_TRIAL_LIMIT}/{FREE_TRIAL_LIMIT} بنود)
                <br />
                <span style={{ fontSize: "11px", opacity: 0.75 }}>اشترك في الباقة للوصول الكامل</span>
              </div>
            )}
          </>
        )}

        {/* Refund policy hint */}
        <div style={{
          marginTop: "14px",
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
          lineHeight: "1.7",
        }}>
          ⏱ تجربة 48 ساعة — وصول كامل لجميع البنود والباقتين
          <br />
          🛡 استرداد بخصم 5$ خلال 48 ساعة • 20$ حتى 7 أيام • لا استرداد بعد 7 أيام
        </div>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {showForm && (
        <RequestForm
          country={countryKey}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          systemBridge={systemBridge}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

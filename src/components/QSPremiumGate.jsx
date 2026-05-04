import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  listenQSPremiumStatus,
  requestQSPremium,
  addTrialItem,
  requestRefund,
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
          <div style={{ fontWeight: "700", color: "#ffd700", marginBottom: "6px" }}>سياسة الاسترداد:</div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", lineHeight: "1.8" }}>
            تجربة مجانية 3 أيام — حتى 10 بنود. إذا طلبت استرداد المبلغ خلال 3 أيام بسبب واضح،
            يُخصم 5 دولار رسوم إدارية. بعد 3 أيام، لا يمكن استرداد المبلغ.
          </p>
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

        {error && (
          <div style={{ color: "#fca5a5", fontSize: "12px", marginBottom: "12px" }}>{error}</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...styles.ctaButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "جاري الإرسال..." : "تأكيد طلب الاشتراك"}
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
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "16px", lineHeight: "1.6" }}>
          سيُخصم 5 دولار رسوم إدارية من مبلغ الاسترداد. يرجى ذكر سبب واضح لمعالجة الطلب.
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
export default function QSPremiumGate({ country, userId, userEmail, userName, children, onOpenAuthScreen, systemBridge }) {
  const [subscription, setSubscription] = useState(undefined); // undefined = loading
  const [showInfo, setShowInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundSent, setRefundSent] = useState(false);

  const countryKey = (country || "").toLowerCase();
  const priceInfo = PRICES[countryKey] || PRICES.ae;

  useEffect(() => {
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
  }, [userId]);

  // Derived state
  const status = subscription?.status || "none";
  const now = Date.now();
  const trialEndsAt = subscription?.trialEndsAt;
  const activatedAt = subscription?.activatedAt;
  const isTrial = status === "active" && trialEndsAt
    ? (typeof trialEndsAt.toDate === "function" ? trialEndsAt.toDate() : new Date(trialEndsAt)) > now
    : false;
  const trialDaysLeft = isTrial ? daysBetween(trialEndsAt) : 0;
  const trialItemsUsed = subscription?.trialItemsUsed || [];
  const trialItemsCount = trialItemsUsed.length;
  const isActive = status === "active";
  const canUseItem = isActive && (!isTrial || trialItemsCount < 10);

  const onItemUsed = useCallback(async (itemKey) => {
    if (!userId || !isActive || !isTrial) return;
    if (trialItemsCount >= 10) return;
    await addTrialItem(userId, itemKey);
  }, [userId, isActive, isTrial, trialItemsCount]);

  const contextValue = {
    subscription,
    isActive,
    isTrial,
    trialDaysLeft,
    trialItemsCount,
    canUseItem,
    onItemUsed,
  };

  // -- Loading --
  if (subscription === undefined) {
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
            <>
              {/* Trial banner */}
              <div style={styles.trialBanner}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>⏱</span>
                  <span>
                    أنت في فترة التجربة ({trialDaysLeft} {trialDaysLeft === 1 ? "يوم متبقي" : "أيام متبقية"})
                    — {trialItemsCount}/10 بنود مستخدمة
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

              {trialItemsCount >= 10 && (
                <div style={styles.warningBanner}>
                  ⚠️ وصلت للحد الأقصى (10 بنود) خلال فترة التجربة. يمكنك الاستمرار في عرض البيانات.
                </div>
              )}
            </>
          ) : (
            /* Full access badge */
            <div style={{ marginBottom: "12px" }}>
              <div style={styles.premiumBadge}>
                <span>💎</span>
                <span>QS Premium — وصول كامل</span>
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

  // -- Paywall (none / rejected / deactivated) --
  return (
    <div style={styles.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={styles.paywallWrap}>
        {/* Info button */}
        <button type="button" style={styles.infoBtn} onClick={() => setShowInfo(true)}>ⓘ</button>

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
              e.currentTarget.style.boxShadow = "0 0 18px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.06)";
            }}
          >
            🔐 يجب تسجيل الدخول أولاً — اضغط هنا لتسجيل الدخول
          </button>
        ) : (
          <button
            type="button"
            style={styles.ctaButton}
            onClick={() => setShowForm(true)}
          >
            {status === "rejected" || status === "deactivated" ? "طلب اشتراك جديد" : "طلب الاشتراك"}
          </button>
        )}

        {/* Refund policy hint */}
        <div style={{
          marginTop: "14px",
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
          lineHeight: "1.6",
        }}>
          🛡 تجربة مجانية 3 أيام | حتى 10 بنود | استرداد جزئي خلال فترة التجربة
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

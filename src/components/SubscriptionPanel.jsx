import { useEffect, useMemo, useState } from "react";
import {
  createPaymentRequest,
  DEFAULT_PAYMENT_SETTINGS,
  listMyPaymentRequests,
  listenPaymentSettings,
} from "../services/subscriptionApi";
import { listenQSPremiumStatus } from "../services/qsPremiumApi";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

export function getSubscriptionCopy(language) {
  return language === "en"
    ? {
        subscriptionTitle: "Taseera Pro Package",
        subscriptionHint: "Full access to all BOQ items and unlimited building area pricing.",
        basePrice: "Price",
        paymentMethod: "Payment method",
        paymentReference: "Transfer reference",
        paymentNote: "Additional note",
        sendPaymentRequest: "Send payment request",
        pendingReview: "Pending review",
        approved: "Approved",
        rejected: "Rejected",
        orderId: "Order",
        amount: "Amount",
        createdOn: "Created",
        loginRequired: "Please log in first to submit your payment request.",
        loginToSubscribe: "Log in to continue subscription",
        receiptFile: "Payment receipt",
        receiptRequired: "Receipt is required before sending your request.",
        uploadReceipt: "Upload receipt",
        uploadProgress: "Uploading",
        requestSubmitted: "Request submitted successfully",
        requestStatusPendingMessage:
          "Your receipt was received. Admin team will review and activate your subscription after payment verification.",
        myRequestsBoard: "My Requests",
        requestStatus: "Request status",
        adminNote: "Admin note",
        viewReceipt: "View receipt",
        serial: "Serial",
        noAdminNote: "No admin note",
        invalidFile: "Only image/pdf files are allowed (max 8 MB).",
        subscriptionActive: "Subscription active",
        subscribedNow: "Subscribed",
      }
    : {
        subscriptionTitle: "Taseera Pro Package",
        subscriptionHint: "وصول كامل لجميع بنود المقايسات وتسعير المباني بدون حدود.",
        basePrice: "السعر",
        paymentMethod: "طريقة الدفع",
        paymentReference: "مرجع التحويل",
        paymentNote: "ملاحظة إضافية",
        sendPaymentRequest: "إرسال طلب الدفع",
        pendingReview: "قيد المراجعة",
        approved: "مقبول",
        rejected: "مرفوض",
        orderId: "رقم الطلب",
        amount: "المبلغ",
        createdOn: "تاريخ الطلب",
        loginRequired: "يرجى تسجيل الدخول أولاً لإرسال طلب الدفع.",
        loginToSubscribe: "سجل الدخول للاشتراك",
        receiptFile: "إيصال الدفع",
        receiptRequired: "لا يمكن إرسال الطلب بدون رفع إيصال الدفع.",
        uploadReceipt: "رفع الإيصال",
        uploadProgress: "جاري الرفع",
        requestSubmitted: "تم إرسال الطلب بنجاح",
        requestStatusPendingMessage:
          "تم استلام إيصالك. ستقوم الإدارة بمراجعته وتفعيل الاشتراك بعد التأكد من الدفع.",
        myRequestsBoard: "لوحة طلباتي",
        requestStatus: "حالة الطلب",
        adminNote: "ملاحظة الأدمن",
        viewReceipt: "عرض الإيصال",
        serial: "السيريال",
        noAdminNote: "لا توجد ملاحظة",
        invalidFile: "مسموح فقط بصيغ الصور أو PDF وبحد أقصى 8 ميجابايت.",
        subscriptionActive: "الاشتراك مفعل",
        subscribedNow: "تم الاشتراك",
      };
}

function SettingInput({ label, value, onChange, placeholder, type = "text", options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wide" style={{ fontFamily: AR }}>
        {label}
      </span>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[12px] text-slate-900 outline-none transition-all duration-150 focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/25 hover:border-[#d4a843]/50"
          style={{ fontFamily: AR }}
        >
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[12px] text-slate-900 outline-none transition-all duration-150 focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/25 hover:border-[#d4a843]/50"
          style={{ fontFamily: AR }}
        />
      )}
    </label>
  );
}

function StatusBadge({ status, copy }) {
  const map = {
    approved:       { label: copy.approved,      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",   dot: "#10b981" },
    rejected:       { label: copy.rejected,       cls: "bg-rose-100 text-rose-700 border border-rose-200",             dot: "#f43f5e" },
    waiting_receipt:{ label: copy.pendingReview,  cls: "bg-blue-100 text-blue-700 border border-blue-200",             dot: "#3b82f6" },
    pending_review: { label: copy.pendingReview,  cls: "bg-amber-100 text-amber-700 border border-amber-200",          dot: "#f59e0b" },
  };
  const cfg = map[status] || map.pending_review;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── QS Premium Card (mirrors Taseera Pro layout) ─────────────────────── */
function fmtTs(ts) {
  if (!ts) return "—";
  try { return (typeof ts.toDate === "function" ? ts.toDate() : new Date(ts)).toLocaleDateString("ar-EG"); }
  catch { return "—"; }
}
function daysBetween(ts) {
  if (!ts) return 0;
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  return Math.max(0, Math.ceil((d - Date.now()) / 86400000));
}

const QS_FEATURES_AR = [
  "تحليل التكلفة بأسلوب First Principle",
  "جميع أقسام CSI (18 قسم، 300+ بند)",
  "مواد + عمالة + معدات قابلة للتعديل",
  "افتراضات التكلفة الغير المباشرة",
  "سعر الوحدة النهائي بالتفصيل",
  "تصدير التحليل وحفظه في الحساب",
];
const QS_FEATURES_EN = [
  "First Principle cost analysis",
  "All 18 CSI divisions (300+ items)",
  "Editable materials, labour & plant",
  "Indirect cost assumptions",
  "Detailed final unit rate",
  "Export & save to account",
];
const QS_PRICES = { sa: { amt: "200", cur: "SAR" }, eg: { amt: "2,800", cur: "EGP" }, ae: { amt: "200", cur: "AED" } };

function QSPremiumStatusCard({ uid, language, onGoToPricing }) {
  const isAr = language !== "en";
  const [sub, setSub] = useState(undefined);

  useEffect(() => {
    if (!uid) { setSub(null); return; }
    let active = true; let unsubFn = null;
    const t = setTimeout(() => {
      if (!active) return;
      unsubFn = listenQSPremiumStatus(uid, (d) => { if (active) setSub(d); });
    }, 120);
    return () => { active = false; clearTimeout(t); unsubFn?.(); };
  }, [uid]);

  const status   = sub?.status || null;
  const isActive = status === "active";
  const isPending= status === "pending";
  const isRejected = status === "rejected";
  const isTrial  = isActive && sub?.trialEndsAt
    ? (typeof sub.trialEndsAt.toDate === "function" ? sub.trialEndsAt.toDate() : new Date(sub.trialEndsAt)) > Date.now()
    : false;
  const daysLeft  = isTrial ? daysBetween(sub?.trialEndsAt) : 0;
  const itemsUsed = (sub?.trialItemsUsed || []).length;

  const priceInfo = QS_PRICES[sub?.country] || QS_PRICES.sa;
  const features  = isAr ? QS_FEATURES_AR : QS_FEATURES_EN;

  // ── colour theme ──
  // active → green (same as Taseera Pro)
  // pending → amber
  // rejected / deactivated / none → red
  const theme = isActive
    ? {
        outer:    "border border-emerald-300/60 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_14px_40px_rgba(16,185,129,0.22)]",
        hero:     "bg-gradient-to-br from-[#0c503f] via-[#0e6b52] to-[#148060]",
        badge:    "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
        badgeTxt: isActive && !isTrial ? (isAr ? "مفعّل" : "Active") : (isAr ? `تجربة · ${daysLeft}ي` : `Trial · ${daysLeft}d`),
        icon:     "bg-emerald-200/20 ring-1 ring-emerald-200/30",
        iconEmoji:"✅",
        priceClr: "text-emerald-200",
        feat:     "border-emerald-200/10 bg-gradient-to-b from-[#0d5d49] to-[#11765b]",
        featDot:  "bg-emerald-200/20 text-emerald-100",
        note:     "border-emerald-200/10 bg-[#11765b]/85",
        cta:      "border-emerald-200/10 bg-[#11765b]",
      }
    : isPending
    ? {
        outer:    "border border-amber-400/40 shadow-[0_0_0_1px_rgba(251,191,36,0.15),0_14px_40px_rgba(180,120,0,0.2)]",
        hero:     "bg-gradient-to-br from-[#4a2e00] via-[#5c3a00] to-[#6b4500]",
        badge:    "bg-amber-500",
        badgeTxt: isAr ? "قيد المراجعة" : "Under Review",
        icon:     "bg-amber-400/20",
        iconEmoji:"⏳",
        priceClr: "text-amber-300",
        feat:     "border-amber-400/10 bg-gradient-to-b from-[#5c3a00] to-[#6b4500]",
        featDot:  "bg-amber-400/25 text-amber-200",
        note:     "border-amber-400/10 bg-[#5c3a00]/80",
        cta:      "border-amber-400/10 bg-[#5c3a00]",
      }
    : {
        // none / rejected / deactivated → red
        outer:    "shadow-[0_12px_40px_rgba(80,0,0,0.3)]",
        hero:     "bg-gradient-to-br from-[#4a0f0f] via-[#5c1414] to-[#6b1a1a]",
        badge:    isRejected ? "bg-rose-700" : "bg-[#c0392b]",
        badgeTxt: isRejected ? (isAr ? "مرفوض" : "Rejected") : status === "deactivated" ? (isAr ? "موقوف" : "Deactivated") : (isAr ? "باقة جديدة" : "New Package"),
        icon:     "bg-red-400/20",
        iconEmoji: isRejected ? "✕" : status === "deactivated" ? "⊘" : "🏆",
        priceClr: "text-red-300",
        feat:     "border-red-300/10 bg-gradient-to-b from-[#5c1414] to-[#6b1a1a]",
        featDot:  "bg-red-400/25 text-red-200",
        note:     "border-red-300/10 bg-[#5c1414]/85",
        cta:      "border-red-300/10 bg-[#5c1414]",
      };

  if (sub === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-100 py-6 text-slate-400 text-[12px]" style={{ fontFamily: AR }}>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4a843] border-t-transparent" />
        {isAr ? "جاري التحميل..." : "Loading..."}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl ${theme.outer}`}>

      {/* ── Hero ── */}
      <div className={`relative px-5 pt-6 pb-5 ${theme.hero}`}>
        {/* Badge */}
        <div
          className={`absolute top-4 rounded-full px-3 py-1 text-[9px] font-bold text-white shadow-lg ${theme.badge}`}
          style={{ left: "1rem" }}
        >
          {theme.badgeTxt}
        </div>

        <div className="text-center">
          <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${theme.icon}`}>
            {theme.iconEmoji}
          </div>

          <p className="text-[17px] font-bold text-white">QS Premium Package</p>
          <p className="text-[11px] text-white/50 mt-0.5">باقة التسعير الاحترافية</p>

          {/* Status line */}
          <p className="mt-1.5 text-[11px] text-white/60 leading-relaxed">
            {isActive && !isTrial && (isAr ? "وصول كامل غير محدود" : "Full unlimited access")}
            {isActive && isTrial  && (isAr ? `فترة التجربة · ${daysLeft} أيام · ${itemsUsed}/10 بنود` : `Trial · ${daysLeft} days · ${itemsUsed}/10 items`)}
            {isPending && (isAr ? "في انتظار موافقة الإدارة (24–48 ساعة)" : "Awaiting admin approval (24–48h)")}
            {isRejected && (isAr ? (sub?.rejectionReason || "تم رفض الطلب") : (sub?.rejectionReason || "Request rejected"))}
            {status === "deactivated" && (isAr ? "تم إيقاف الباقة من الإدارة" : "Deactivated by admin")}
            {!status && (isAr ? "اشترك للوصول لتحليل تكاليف First Principle" : "Subscribe for First Principle cost analysis")}
          </p>

          {/* Price */}
          <div className="mt-5 flex items-baseline justify-center gap-1">
            <span className={`text-[40px] font-bold leading-none ${theme.priceClr}`}>
              {isActive && sub?.price ? sub.price : priceInfo.amt}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-bold text-white/80">
                {isActive && sub?.currency ? sub.currency : priceInfo.cur}
              </span>
              <span className="text-[10px] text-white/40">{isAr ? "دفعة واحدة" : "one-time"}</span>
            </div>
          </div>

          {/* Order ID if exists */}
          {sub?.orderId && (
            <p className="mt-2 text-[10px] text-white/30 font-mono"># {sub.orderId}</p>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div className={`border-t px-5 py-4 ${theme.feat}`}>
        <div className="space-y-2.5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${theme.featDot}`}>✓</span>
              <p className="text-[11px] text-white/75">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Refund notice (during trial) ── */}
      {isActive && isTrial && (
        <div className={`border-t px-5 py-3 ${theme.note}`}>
          <p className="text-[10px] text-white/50 leading-relaxed">
            {isAr
              ? `يمكنك طلب استرداد المبلغ خلال ${daysLeft} أيام. سيُخصم 5 دولار رسوم إدارية.`
              : `You can request a refund within ${daysLeft} days. $5 admin fee applies.`}
          </p>
        </div>
      )}

      {/* Refund request status */}
      {sub?.refundRequest && (
        <div className={`border-t px-5 py-3 ${theme.note}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-white/60">{isAr ? "طلب استرداد:" : "Refund:"} {sub.refundRequest.reason}</p>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              sub.refundRequest.status === "approved" ? "bg-emerald-400/20 text-emerald-200" :
              sub.refundRequest.status === "rejected" ? "bg-rose-400/20 text-rose-200" :
              "bg-amber-400/20 text-amber-200"
            }`}>
              {sub.refundRequest.status === "approved" ? (isAr?"موافق":"Approved") :
               sub.refundRequest.status === "rejected" ? (isAr?"مرفوض":"Rejected") :
               (isAr?"قيد المراجعة":"Reviewing")}
            </span>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className={`border-t px-5 pb-5 pt-4 ${theme.cta}`}>
        {isActive ? (
          <button
            type="button"
            onClick={onGoToPricing}
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(167,243,208,0.28),0_8px_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            {isAr ? "فتح تسعير بالموارد ←" : "Open Resource Pricing ←"}
          </button>
        ) : isPending ? (
          <div className="flex items-center justify-center gap-2 py-2 text-amber-200 text-[12px]" style={{ fontFamily: AR }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            {isAr ? "في انتظار موافقة الإدارة..." : "Awaiting admin approval..."}
          </div>
        ) : (
          <button
            type="button"
            onClick={onGoToPricing}
            className="w-full rounded-2xl bg-[#c0392b] py-3.5 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(192,57,43,0.45)] transition hover:bg-[#a93226] active:scale-[0.98]"
          >
            {isRejected || status === "deactivated"
              ? (isAr ? "إعادة طلب الاشتراك" : "Re-apply")
              : (isAr ? "اشترك في QS Premium" : "Subscribe to QS Premium")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPanel({
  language = "ar",
  authMode,
  sessionMeta,
  settings = {},
  isSubscribed = false,
  onOpenAuthScreen,
  onShowStatus,
  onGoToPricing,
}) {
  const copy = getSubscriptionCopy(language);
  const isAr = language === "ar";
  const isGuest = authMode === "guest";

  const [paymentSettings, setPaymentSettings] = useState(DEFAULT_PAYMENT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_SETTINGS.acceptedMethods?.[0] || "");
  const [paymentReference, setPaymentReference] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const unsubscribe = listenPaymentSettings((data) => {
      const loaded = data || DEFAULT_PAYMENT_SETTINGS;
      setPaymentSettings(loaded);
      setPaymentMethod((prev) => prev || loaded.acceptedMethods?.[0] || "");
      setLoadingSettings(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!sessionMeta?.uid) { setRequests([]); return; }
    let active = true;
    setLoadingRequests(true);
    listMyPaymentRequests(sessionMeta.uid)
      .then((rows) => { if (active) setRequests(rows); })
      .catch((err) => onShowStatus?.(err.message || "Failed to load requests", "warning"))
      .finally(() => { if (active) setLoadingRequests(false); });
    return () => { active = false; };
  }, [onShowStatus, sessionMeta?.uid]);

  const displayAmount = useMemo(() => {
    return Number(paymentSettings.baseAmountSar) || 100;
  }, [paymentSettings.baseAmountSar]);

  const hasApprovedRequest = useMemo(
    () => requests.some((row) => row?.requestStatus === "approved" || row?.paymentStatus === "approved"),
    [requests]
  );

  const subscriptionActive = Boolean(isSubscribed || hasApprovedRequest);

  useEffect(() => {
    if (subscriptionActive) setShowForm(false);
  }, [subscriptionActive]);

  async function handleSubmitRequest() {
    if (!sessionMeta?.uid || isGuest) {
      onShowStatus?.(copy.loginRequired, "warning");
      return;
    }
    if (!paymentReference.trim()) {
      onShowStatus?.(language === "en" ? "Please add transfer reference." : "يرجى إدخال مرجع التحويل.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const amount = Number(paymentSettings.baseAmountSar) || 100;
      const created = await createPaymentRequest({
        uid: sessionMeta.uid,
        userName: settings.userName,
        email: settings.userEmail,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        amount,
        currency: "SAR",
        country: settings.country,
        note: note.trim(),
      });

      setLastSuccess({
        orderId: created.orderId,
        userSerial: created.userSerial,
        paymentMethod,
        requestStatus: "waiting_receipt",
      });

      if (created.mailtoLink) window.location.href = created.mailtoLink;

      onShowStatus?.(
        language === "en"
          ? `Request created successfully (Order: ${created.orderId}). Your email client will open - please attach the receipt and send.`
          : `تم إنشاء طلب الدفع بنجاح (رقم الطلب: ${created.orderId}). سيتم فتح بريدك الإلكتروني - يرجى إرفاق الإيصال وإرسالها.`,
        "success"
      );

      setPaymentReference("");
      setNote("");
      setShowForm(false);
      const rows = await listMyPaymentRequests(sessionMeta.uid);
      setRequests(rows);
    } catch (err) {
      onShowStatus?.(err.message || "Failed to submit payment request", "warning");
    } finally {
      setSubmitting(false);
    }
  }

  const features = isAr
    ? ["وصول كامل لجميع بنود التسعير", "تسعير المباني بدون حدود", "تحديثات الأسعار الفورية", "دعم فني متخصص", "حفظ غير محدود للتحليلات"]
    : ["Full access to all pricing items", "Unlimited building pricing", "Real-time price updates", "Dedicated technical support", "Unlimited saved analyses"];

  return (
    <div className="space-y-4" dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: AR }}>

      {/* Success Banner */}
      {lastSuccess && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm">
          <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-100/60 px-4 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-sm text-white">✓</span>
            <p className="text-[12px] font-bold text-emerald-800" style={{ fontFamily: AR }}>{copy.requestSubmitted}</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                [copy.orderId, lastSuccess.orderId],
                [copy.serial, lastSuccess.userSerial],
                [copy.paymentMethod, paymentSettings.methodLabels?.[lastSuccess.paymentMethod] || lastSuccess.paymentMethod],
                [copy.requestStatus, copy.pendingReview],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/70 px-3 py-2 border border-emerald-100">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">{k}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-800">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">{copy.requestStatusPendingMessage}</p>
          </div>
        </div>
      )}

      {/* Premium Pricing Card */}
      <div
        className={`overflow-hidden rounded-3xl ${
          subscriptionActive
            ? "border border-emerald-300/60 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_14px_40px_rgba(16,185,129,0.22),0_0_28px_rgba(74,222,128,0.14)]"
            : "shadow-[0_12px_40px_rgba(13,37,69,0.25)]"
        }`}
      >
        {/* Hero */}
        <div
          className={`relative px-5 pt-6 pb-5 ${
            subscriptionActive
              ? "bg-gradient-to-br from-[#0c503f] via-[#0e6b52] to-[#148060]"
              : "bg-gradient-to-br from-[#0d2545] via-[#122d55] to-[#1a3c72]"
          }`}
        >
          {/* Popular badge */}
          <div
            className={`absolute top-4 rounded-full px-3 py-1 text-[9px] font-bold text-white shadow-lg ${
              subscriptionActive ? "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.45)]" : "bg-[#d4a843]"
            }`}
            style={{ [isAr ? "left" : "right"]: "1rem" }}
          >
            {subscriptionActive ? copy.subscriptionActive : isAr ? "الأكثر طلباً" : "Most Popular"}
          </div>

          <div className="text-center">
            <div
              className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${
                subscriptionActive ? "bg-emerald-200/20 ring-1 ring-emerald-200/30" : "bg-[#d4a843]/20"
              }`}
            >
              {subscriptionActive ? "✅" : "💎"}
            </div>
            <p className="text-[17px] font-bold text-white">{copy.subscriptionTitle}</p>
            <p className="text-[11px] text-white/50 mt-0.5">باقة بنود المقايسات الكاملة</p>
            <p className="mt-1.5 text-[11px] text-white/60 leading-relaxed">
              {subscriptionActive ? copy.subscriptionActive : copy.subscriptionHint}
            </p>

            {/* Price display */}
            <div className="mt-5 flex items-baseline justify-center gap-1">
              <span className={`text-[40px] font-bold leading-none ${subscriptionActive ? "text-emerald-200" : "text-[#d4a843]"}`}>{displayAmount}</span>
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-bold text-white/80">SAR</span>
                <span className="text-[10px] text-white/40">{isAr ? "دفعة واحدة" : "one-time"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          className={`border-t px-5 py-4 ${
            subscriptionActive
              ? "border-emerald-200/10 bg-gradient-to-b from-[#0d5d49] to-[#11765b]"
              : "border-white/10 bg-gradient-to-b from-[#162e52] to-[#1a3870]"
          }`}
        >
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    subscriptionActive ? "bg-emerald-200/20 text-emerald-100" : "bg-[#d4a843]/25 text-[#d4a843]"
                  }`}
                >
                  ✓
                </span>
                <p className="text-[11px] text-white/75">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Note from admin */}
        {(paymentSettings.note || DEFAULT_PAYMENT_SETTINGS.note) && (
          <div className={`border-t px-5 py-3 ${subscriptionActive ? "border-emerald-200/10 bg-[#11765b]/85" : "border-white/10 bg-[#1a3870]/80"}`}>
            <p className="text-[10px] text-white/50 leading-relaxed">{paymentSettings.note || DEFAULT_PAYMENT_SETTINGS.note}</p>
          </div>
        )}

        {/* CTA */}
        <div className={`border-t px-5 pb-5 pt-4 ${subscriptionActive ? "border-emerald-200/10 bg-[#11765b]" : "border-white/10 bg-[#1a3870]"}`}>
          {isGuest ? (
            <button
              type="button"
              onClick={() => onOpenAuthScreen?.("login")}
              className="w-full rounded-2xl bg-[#d4a843] py-3.5 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(212,168,67,0.4)] transition-all duration-150 hover:bg-[#c49a38] hover:shadow-[0_6px_20px_rgba(212,168,67,0.5)] active:scale-[0.98]"
            >
              {copy.loginToSubscribe}
            </button>
          ) : subscriptionActive ? (
            <button
              type="button"
              disabled
              className="w-full rounded-2xl bg-emerald-500 py-3.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(167,243,208,0.28),0_8px_24px_rgba(16,185,129,0.35),0_0_22px_rgba(74,222,128,0.24)]"
            >
              {copy.subscribedNow}
            </button>
          ) : !showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-2xl bg-[#d4a843] py-3.5 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(212,168,67,0.4)] transition-all duration-150 hover:bg-[#c49a38] hover:shadow-[0_6px_20px_rgba(212,168,67,0.5)] active:scale-[0.98]"
            >
              {isAr ? "اشترك الآن" : "Subscribe Now"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Payment Form */}
      {!isGuest && showForm && !subscriptionActive && (
        <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f0e4cc] text-sm">💳</span>
              <p className="text-[12px] font-bold text-slate-800" style={{ fontFamily: AR }}>
                {isAr ? "تفاصيل الدفع" : "Payment Details"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition hover:bg-slate-200 text-[12px]"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-3">
            <SettingInput
              label={copy.paymentMethod}
              type="select"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={(paymentSettings.acceptedMethods || []).map((m) => ({
                value: m,
                label: paymentSettings.methodLabels?.[m] || m,
              }))}
            />

            {/* Account info */}
            {paymentSettings.paymentAccounts?.[paymentMethod] && (
              <div className="rounded-xl border border-[#d4a843]/30 bg-[#fffbf0] px-3 py-2.5">
                <p className="text-[9px] font-bold text-[#b8893d] uppercase tracking-wide mb-1">
                  {isAr ? "رقم الحساب / المحفظة" : "Account / Wallet"}
                </p>
                <p className="text-[12px] font-bold text-slate-800 font-mono">
                  {paymentSettings.paymentAccounts[paymentMethod]}
                </p>
              </div>
            )}

            <SettingInput
              label={copy.paymentReference}
              value={paymentReference}
              onChange={setPaymentReference}
              placeholder={language === "en" ? "Transfer number / receipt id" : "رقم التحويل / رقم الإيصال"}
            />
            <SettingInput
              label={copy.paymentNote}
              value={note}
              onChange={setNote}
              placeholder={language === "en" ? "Optional note" : "ملاحظات اختيارية"}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submitting || loadingSettings}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#0d2545] to-[#162e52] py-3 text-[12px] font-bold text-white shadow-md transition-all duration-150 hover:shadow-lg disabled:opacity-60 active:scale-[0.98]"
              >
                {submitting ? (isAr ? "جاري الإرسال..." : "Sending...") : copy.sendPaymentRequest}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] px-4 py-3 text-[12px] font-bold text-slate-600 transition hover:bg-[#f0e8d8] active:scale-[0.98]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QS Premium Package status ── */}
      <QSPremiumStatusCard
        uid={sessionMeta?.uid}
        language={language}
        onGoToPricing={onGoToPricing}
      />

      {/* My Requests Board */}
      <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f0e4cc] text-sm">🧾</span>
          <p className="text-[12px] font-bold text-slate-800" style={{ fontFamily: AR }}>{copy.myRequestsBoard}</p>
          {requests.length > 0 && (
            <span className="ms-auto rounded-full bg-[#0d2545] px-2 py-0.5 text-[9px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </div>

        <div className="p-4">
          {loadingRequests ? (
            <div className="flex items-center gap-2 py-4 text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4a843] border-t-transparent" />
              <p className="text-[11px]">{isAr ? "جاري التحميل..." : "Loading..."}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-[11px] text-slate-400">
                {language === "en" ? "No requests yet." : "لا توجد طلبات بعد."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req, idx) => (
                <div
                  key={req.id}
                  className="group overflow-hidden rounded-xl border border-[#e8dcc8] bg-white transition-all duration-150 hover:border-[#d4a843]/40 hover:shadow-md"
                >
                  {/* Request header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#f5ede0] bg-[#faf6ef] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#0d2545]/10 text-[10px] font-bold text-[#0d2545]">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] font-bold text-[#0d2545]">{copy.orderId}: {req.orderId || "-"}</p>
                    </div>
                    <StatusBadge status={req.requestStatus} copy={copy} />
                  </div>

                  {/* Request details */}
                  <div className="grid grid-cols-2 gap-2 p-3">
                    {[
                      [copy.serial, req.userSerial || "-"],
                      [copy.amount, `${req.amount || 0} ${req.currency || "SAR"}`],
                      [copy.paymentMethod, paymentSettings.methodLabels?.[req.paymentMethod] || req.paymentMethod || "-"],
                      [copy.createdOn, req.createdAt?.toDate?.()?.toLocaleString?.("en-GB") || "-"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{k}</p>
                        <p className="mt-0.5 text-[10px] text-slate-700">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Admin note & receipt */}
                  <div className="flex items-center justify-between border-t border-[#f5ede0] px-3 py-2">
                    <p className="text-[10px] text-slate-500">
                      <span className="font-bold">{copy.adminNote}: </span>
                      {req.rejectionReason || req.adminNote || copy.noAdminNote}
                    </p>
                    {req.receiptUrl ? (
                      <a
                        href={req.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-[#0d2545]/8 px-2.5 py-1.5 text-[10px] font-bold text-[#0d2545] transition hover:bg-[#0d2545]/15"
                      >
                        🔗 {copy.viewReceipt}
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300">{copy.viewReceipt}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

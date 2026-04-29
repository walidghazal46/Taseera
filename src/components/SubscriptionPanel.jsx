import { useEffect, useMemo, useState } from "react";
import {
  createPaymentRequest,
  DEFAULT_PAYMENT_SETTINGS,
  listMyPaymentRequests,
  listenPaymentSettings,
} from "../services/subscriptionApi";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

export function getSubscriptionCopy(language) {
  return language === "en"
    ? {
        subscriptionTitle: "Full Access Subscription",
        subscriptionHint: "Unlock all pricing items and unlimited building pricing.",
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
      }
    : {
        subscriptionTitle: "اشتراك الوصول الكامل",
        subscriptionHint: "افتح كل البنود وتسعير المباني بدون حدود.",
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
      };
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f0e4cc] text-sm">{icon}</span>
        <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: AR }}>
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SettingInput({ label, value, onChange, placeholder, type = "text", options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-500" style={{ fontFamily: AR }}>
        {label}
      </span>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
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
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
          style={{ fontFamily: AR }}
        />
      )}
    </label>
  );
}

/**
 * SubscriptionPanel — standalone subscription form + my-requests board.
 * Props:
 *   language       "ar" | "en"
 *   authMode       "guest" | "authenticated"
 *   sessionMeta    { uid, ... }
 *   settings       { userName, userEmail, country, language }
 *   onOpenAuthScreen  (mode) => void
 *   onShowStatus   (msg, tone) => void
 */
export default function SubscriptionPanel({
  language = "ar",
  authMode,
  sessionMeta,
  settings = {},
  onOpenAuthScreen,
  onShowStatus,
}) {
  const copy = getSubscriptionCopy(language);
  const isGuest = authMode === "guest";

  const [paymentSettings, setPaymentSettings] = useState(DEFAULT_PAYMENT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);

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
    if (!sessionMeta?.uid) {
      setRequests([]);
      return;
    }
    let active = true;
    setLoadingRequests(true);
    listMyPaymentRequests(sessionMeta.uid)
      .then((rows) => { if (active) setRequests(rows); })
      .catch((err) => onShowStatus?.(err.message || "Failed to load requests", "warning"))
      .finally(() => { if (active) setLoadingRequests(false); });
    return () => { active = false; };
  }, [onShowStatus, sessionMeta?.uid]);

  const displayAmount = useMemo(() => {
    const amount = Number(paymentSettings.baseAmountSar) || 100;
    return `${amount} SAR`;
  }, [paymentSettings.baseAmountSar]);

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

      // Open email client with pre-filled data
      if (created.mailtoLink) {
        window.location.href = created.mailtoLink;
      }

      onShowStatus?.(
        language === "en"
          ? `Request created successfully (Order: ${created.orderId}). Your email client will open - please attach the receipt and send.`
          : `تم إنشاء طلب الدفع بنجاح (رقم الطلب: ${created.orderId}). سيتم فتح بريدك الإلكتروني - يرجى إرفاق الإيصال وإرسالها.`,
        "success"
      );

      setPaymentReference("");
      setNote("");
      const rows = await listMyPaymentRequests(sessionMeta.uid);
      setRequests(rows);
    } catch (err) {
      onShowStatus?.(err.message || "Failed to submit payment request", "warning");
    } finally {
      setSubmitting(false);
    }
  }

  const badgeClass = (status) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-700";
    if (status === "rejected") return "bg-rose-100 text-rose-700";
    if (status === "waiting_receipt") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-3" dir={language === "ar" ? "rtl" : "ltr"} style={{ fontFamily: AR }}>
      {lastSuccess && (
        <SectionCard title={copy.requestSubmitted} icon="✅">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <p><span className="font-bold">{copy.orderId}:</span> {lastSuccess.orderId}</p>
              <p><span className="font-bold">{copy.serial}:</span> {lastSuccess.userSerial}</p>
              <p><span className="font-bold">{copy.paymentMethod}:</span> {paymentSettings.methodLabels?.[lastSuccess.paymentMethod] || lastSuccess.paymentMethod}</p>
              <p><span className="font-bold">{copy.requestStatus}:</span> {copy.pendingReview}</p>
            </div>
            <p className="mt-2">{copy.requestStatusPendingMessage}</p>
          </div>
        </SectionCard>
      )}

      <SectionCard title={copy.subscriptionTitle} icon="💎">
        <div className="space-y-3">
          <div className="rounded-xl border border-[#d4a843]/30 bg-[#fff9ec] p-3">
            <p className="text-[11px] font-bold text-[#6b4f1d]">{copy.subscriptionHint}</p>
            <p className="mt-1 text-[13px] font-bold text-[#0d2545]">
              {copy.basePrice}: {displayAmount}
            </p>
            <p className="mt-1 text-[10px] text-slate-600">{paymentSettings.note || DEFAULT_PAYMENT_SETTINGS.note}</p>
          </div>

          {isGuest ? (
            <button
              type="button"
              onClick={() => onOpenAuthScreen?.("login")}
              className="w-full rounded-xl bg-[#0d2545] px-3 py-2.5 text-[11px] font-bold text-white"
            >
              {copy.loginToSubscribe}
            </button>
          ) : (
            <>
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
              <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] p-2 text-[10px] text-slate-600">
                {paymentSettings.paymentAccounts?.[paymentMethod] || "-"}
              </div>
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
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submitting || loadingSettings}
                className="w-full rounded-xl bg-[#0d2545] px-3 py-2.5 text-[11px] font-bold text-white disabled:opacity-60"
              >
                {submitting ? "..." : copy.sendPaymentRequest}
              </button>
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard title={copy.myRequestsBoard} icon="🧾">
        {loadingRequests ? (
          <p className="text-[11px] text-slate-500">...</p>
        ) : requests.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            {language === "en" ? "No requests yet." : "لا توجد طلبات بعد."}
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="rounded-xl border border-[#e8dcc8] bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-[#0d2545]">{copy.orderId}: {req.orderId || "-"}</p>
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${badgeClass(req.requestStatus)}`}>
                    {req.requestStatus === "approved" ? copy.approved : req.requestStatus === "rejected" ? copy.rejected : copy.pendingReview}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1 text-[10px] text-slate-500 sm:grid-cols-2">
                  <p>{copy.serial}: {req.userSerial || "-"}</p>
                  <p>{copy.createdOn}: {req.createdAt?.toDate?.()?.toLocaleString?.("en-GB") || "-"}</p>
                  <p>{copy.paymentMethod}: {paymentSettings.methodLabels?.[req.paymentMethod] || req.paymentMethod || "-"}</p>
                  <p>{copy.amount}: {req.amount || 0} {req.currency || "SAR"}</p>
                  <p>{copy.adminNote}: {req.rejectionReason || req.adminNote || copy.noAdminNote}</p>
                  <p>
                    <a
                      href={req.receiptUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-bold ${req.receiptUrl ? "text-[#0d2545] underline" : "text-slate-400"}`}
                    >
                      {copy.viewReceipt}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

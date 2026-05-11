import { useState } from "react";
import { PACKAGES_LIST, SUBSCRIPTION_STATUS } from "../data/packages";
import PaymentRequestForm from "./PaymentRequestForm";

// ─── Package Detail Modal ────────────────────────────────────────────────────
function PackageDetailsModal({ pkg, language, onClose, onSelect }) {
  const ar = language === "ar";
  const features = ar ? pkg.featuresAr : pkg.featuresEn;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-t-[28px] bg-white sm:rounded-[28px] overflow-hidden"
        style={{ maxHeight: "90dvh", overflowY: "auto", paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
        onClick={(e) => e.stopPropagation()}
        dir={ar ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-5 py-4 ${pkg.highlight ? "bg-[linear-gradient(135deg,#16335d,#082555)]" : "bg-white border-b border-slate-100"}`}
        >
          <div>
            {pkg.badge && (
              <span className="inline-block rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 mb-1">
                {ar ? pkg.badge.ar : pkg.badge.en}
              </span>
            )}
            <h2 className={`text-lg font-black ${pkg.highlight ? "text-white" : "text-slate-800"}`}>
              {ar ? pkg.nameAr : pkg.nameEn}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${pkg.highlight ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-black text-[#082555]">
              {pkg.price}
              <span className="text-lg font-bold text-slate-500 mr-1">{pkg.currency}</span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {ar ? pkg.durationLabel.ar : pkg.durationLabel.en}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700">
              {ar ? "ما يشمله الاشتراك:" : "What's included:"}
            </h3>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-emerald-500 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment instructions */}
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 space-y-2">
            <h3 className="text-sm font-bold text-blue-800">
              {ar ? "تعليمات الدفع:" : "Payment Instructions:"}
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              {ar
                ? "قم بتحويل المبلغ عبر البنك أو أي وسيلة دفع متاحة ثم أرسل إيصال الدفع إلى البريد الإلكتروني أدناه. سيتم تفعيل اشتراكك خلال 24 ساعة."
                : "Transfer the amount via bank or any available payment method, then send the payment receipt to the email below. Your subscription will be activated within 24 hours."}
            </p>
            <div className="text-center font-bold text-blue-900 text-sm py-2 bg-white rounded-xl border border-blue-200">
              walidghazal46@gmail.com
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-3 text-xs text-slate-500 leading-relaxed">
            <p>
              <strong className="text-slate-700">{ar ? "سياسة الاسترداد: " : "Refund Policy: "}</strong>
              {ar
                ? "يمكن طلب استرداد المبلغ خلال 7 أيام من تاريخ التفعيل في حال عدم استخدام الخدمة."
                : "Refund can be requested within 7 days of activation if the service has not been used."}
            </p>
            <p>
              <strong className="text-slate-700">{ar ? "سياسة الاستخدام: " : "Usage Policy: "}</strong>
              {ar
                ? "الاشتراك مخصص للاستخدام الشخصي فقط. يُحظر مشاركة الحساب مع أطراف أخرى."
                : "Subscription is for personal use only. Account sharing with third parties is prohibited."}
            </p>
            <p>
              <strong className="text-slate-700">{ar ? "شروط الوصول: " : "Terms of Access: "}</strong>
              {ar
                ? "يحق للإدارة تعليق الحسابات التي تنتهك شروط الاستخدام دون إشعار مسبق."
                : "Management reserves the right to suspend accounts that violate the terms of use without prior notice."}
            </p>
            <p>
              <strong className="text-slate-700">{ar ? "للدعم والاستفسار: " : "Support & Inquiries: "}</strong>
              walidghazal46@gmail.com
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => onSelect(pkg)}
            className={`w-full rounded-2xl py-4 text-sm font-black text-white transition active:scale-[0.98] shadow-lg ${
              pkg.highlight
                ? "bg-[linear-gradient(135deg,#c9a84c,#e8c96a)] text-[#082555]"
                : "bg-[linear-gradient(135deg,#16335d,#082555)]"
            }`}
          >
            {ar ? `اختر ${pkg.nameAr}` : `Select ${pkg.nameEn}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Card ────────────────────────────────────────────────────────────
function PackageCard({ pkg, language, onOpen }) {
  const ar = language === "ar";
  const features = (ar ? pkg.featuresAr : pkg.featuresEn).slice(0, 4);

  return (
    <div
      onClick={() => onOpen(pkg)}
      className={`relative flex flex-col rounded-[24px] border cursor-pointer transition-all active:scale-[0.98] overflow-hidden ${
        pkg.highlight
          ? "border-amber-300 bg-[linear-gradient(145deg,#082555_0%,#16335d_100%)] shadow-[0_16px_48px_rgba(8,37,85,0.28)]"
          : "border-slate-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-[#16335d]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      }`}
      dir={ar ? "rtl" : "ltr"}
    >
      {/* Best value badge */}
      {pkg.highlight && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-amber-900 shadow">
            {ar ? pkg.badge.ar : pkg.badge.en}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Name + Price */}
        <div className={pkg.highlight ? "mt-6" : ""}>
          <p className={`text-xs font-bold uppercase tracking-widest ${pkg.highlight ? "text-amber-300" : "text-slate-400"}`}>
            {ar ? pkg.durationLabel.ar : pkg.durationLabel.en}
          </p>
          <h3 className={`text-lg font-black mt-0.5 ${pkg.highlight ? "text-white" : "text-slate-800"}`}>
            {ar ? pkg.nameAr : pkg.nameEn}
          </h3>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-3xl font-black ${pkg.highlight ? "text-amber-300" : "text-[#082555]"}`}>
              {pkg.price}
            </span>
            <span className={`text-sm font-bold ${pkg.highlight ? "text-amber-200" : "text-slate-500"}`}>
              {pkg.currency}
            </span>
          </div>
        </div>

        {/* Feature list */}
        <ul className="space-y-1.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className={`flex items-start gap-2 text-[12px] leading-relaxed ${pkg.highlight ? "text-slate-300" : "text-slate-600"}`}>
              <span className={`shrink-0 mt-0.5 ${pkg.highlight ? "text-amber-400" : "text-emerald-500"}`}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          className={`w-full rounded-2xl py-3 text-sm font-black transition ${
            pkg.highlight
              ? "bg-amber-400 text-[#082555] hover:bg-amber-300"
              : "bg-[#082555] text-white hover:bg-[#16335d]"
          }`}
        >
          {ar ? "اختر الباقة" : "Select Plan"}
        </button>
      </div>
    </div>
  );
}

// ─── Subscription Page ───────────────────────────────────────────────────────
export default function SubscriptionPage({
  language = "ar",
  subscriptionStatus,
  profile,
  onPaymentSubmitted,
  onBack,
}) {
  const ar = language === "ar";
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const statusMessages = {
    [SUBSCRIPTION_STATUS.TRIAL_EXPIRED]: {
      ar: "انتهت فترة التجربة المجانية — اختر باقة للمتابعة",
      en: "Free trial has ended — choose a plan to continue",
    },
    [SUBSCRIPTION_STATUS.EXPIRED]: {
      ar: "انتهى اشتراكك — جدّد الآن للمتابعة",
      en: "Your subscription has expired — renew now to continue",
    },
    [SUBSCRIPTION_STATUS.PENDING_PAYMENT]: {
      ar: "طلب الدفع قيد المراجعة — شكراً لصبرك",
      en: "Payment request is under review — thank you for your patience",
    },
    [SUBSCRIPTION_STATUS.REJECTED]: {
      ar: "تم رفض طلب الدفع — يمكنك المحاولة مرة أخرى",
      en: "Payment request was rejected — you may try again",
    },
  };

  const statusMsg = statusMessages[subscriptionStatus];

  const handleSelectPkg = (pkg) => {
    setSelectedPkg(pkg);
    setShowDetails(null);
    setShowPaymentForm(true);
  };

  if (showPaymentForm && selectedPkg) {
    return (
      <PaymentRequestForm
        language={language}
        pkg={selectedPkg}
        profile={profile}
        onSuccess={(requestId) => {
          setShowPaymentForm(false);
          onPaymentSubmitted?.(requestId);
        }}
        onBack={() => setShowPaymentForm(false)}
      />
    );
  }

  return (
    <div
      className="flex flex-col min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(101,225,245,0.10),transparent_40%),linear-gradient(180deg,#f3f7ff,#fafcff)]"
      dir={ar ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif", paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
              {ar ? "›" : "‹"}
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-[#082555]">
              {ar ? "اختر باقتك" : "Choose Your Plan"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {ar ? "وصول كامل لجميع ميزات تسعيرة" : "Full access to all Taseera features"}
            </p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-lg">
            ✕
          </button>
        )}
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div className={`mx-5 mb-4 rounded-2xl px-4 py-3 text-sm font-semibold border ${
          subscriptionStatus === SUBSCRIPTION_STATUS.PENDING_PAYMENT
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : subscriptionStatus === SUBSCRIPTION_STATUS.REJECTED
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          {ar ? statusMsg.ar : statusMsg.en}
        </div>
      )}

      {/* Package cards */}
      <div className="px-5 grid gap-4 sm:grid-cols-3">
        {PACKAGES_LIST.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            language={language}
            onOpen={(p) => setShowDetails(p)}
          />
        ))}
      </div>

      {/* Info footer */}
      <div className="px-5 mt-6 text-center">
        <p className="text-xs text-slate-400 leading-relaxed">
          {ar
            ? "جميع الأسعار بالريال السعودي · التفعيل خلال 24 ساعة · للدعم: walidghazal46@gmail.com"
            : "All prices in SAR · Activation within 24h · Support: walidghazal46@gmail.com"}
        </p>
      </div>

      {/* Package detail modal */}
      {showDetails && (
        <PackageDetailsModal
          pkg={showDetails}
          language={language}
          onClose={() => setShowDetails(null)}
          onSelect={handleSelectPkg}
        />
      )}
    </div>
  );
}

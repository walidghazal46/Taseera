import { useState } from "react";
import { createPaymentRequest } from "../services/paymentService";

export default function PaymentRequestForm({ language, pkg, profile, onSuccess, onBack }) {
  const ar = language === "ar";
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = [
    { id: "bank_transfer", ar: "تحويل بنكي", en: "Bank Transfer" },
    { id: "stc_pay",       ar: "STC Pay",     en: "STC Pay" },
    { id: "other",         ar: "وسيلة أخرى",  en: "Other" },
  ];

  const submit = async () => {
    if (!profile?.uid) {
      setError(ar ? "يجب تسجيل الدخول أولاً." : "You must be signed in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const id = await createPaymentRequest({
        uid:           profile.uid,
        userEmail:     profile.email,
        packageId:     pkg.id,
        paymentMethod,
        proofUrl:      null,
      });
      onSuccess?.(id);
    } catch (err) {
      setError(ar ? "حدث خطأ، حاول مرة أخرى." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-[100dvh] bg-[#f3f7ff]"
      dir={ar ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif", paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
          {ar ? "›" : "‹"}
        </button>
        <h1 className="text-xl font-black text-[#082555]">
          {ar ? "إرسال طلب الدفع" : "Submit Payment Request"}
        </h1>
      </div>

      <div className="px-5 space-y-4 overflow-y-auto">
        {/* Package summary */}
        <div className={`rounded-2xl p-4 border ${pkg.highlight ? "bg-[#082555] border-amber-300" : "bg-white border-slate-200"}`}>
          <p className={`text-xs font-bold mb-1 ${pkg.highlight ? "text-amber-300" : "text-slate-400"}`}>
            {ar ? "الباقة المختارة" : "Selected Package"}
          </p>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-black ${pkg.highlight ? "text-white" : "text-[#082555]"}`}>
              {ar ? pkg.nameAr : pkg.nameEn}
            </span>
            <span className={`text-xl font-black ${pkg.highlight ? "text-amber-400" : "text-[#082555]"}`}>
              {pkg.price} {pkg.currency}
            </span>
          </div>
          <p className={`text-xs mt-1 ${pkg.highlight ? "text-slate-400" : "text-slate-500"}`}>
            {ar ? pkg.durationLabel.ar : pkg.durationLabel.en}
          </p>
        </div>

        {/* Bank info */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
          <p className="text-sm font-bold text-amber-800">
            {ar ? "معلومات الدفع:" : "Payment Info:"}
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            {ar
              ? "قم بتحويل المبلغ إلى الحساب المعتمد ثم أخبرنا عبر البريد الإلكتروني بإتمام العملية وسيتم مراجعة طلبك خلال 24 ساعة."
              : "Transfer the amount to the designated account, then notify us by email. Your request will be reviewed within 24 hours."}
          </p>
          <div className="text-center font-bold text-amber-900 text-sm py-2 bg-white rounded-xl border border-amber-200">
            walidghazal46@gmail.com
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700">
            {ar ? "وسيلة الدفع:" : "Payment Method:"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`rounded-2xl border py-3 text-xs font-bold transition ${
                  paymentMethod === m.id
                    ? "border-[#082555] bg-[#082555] text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {ar ? m.ar : m.en}
              </button>
            ))}
          </div>
        </div>

        {/* User info */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500">{ar ? "حسابك:" : "Your Account:"}</p>
          <p className="text-sm font-semibold text-slate-800">{profile?.displayName}</p>
          <p className="text-xs text-slate-500">{profile?.email}</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-2xl bg-[linear-gradient(135deg,#16335d,#082555)] py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? (ar ? "جارٍ الإرسال…" : "Submitting…")
            : (ar ? "إرسال طلب الدفع" : "Submit Payment Request")}
        </button>

        <p className="text-center text-xs text-slate-400 leading-relaxed">
          {ar
            ? "بإرسال هذا الطلب، تؤكد أنك أتممت عملية الدفع وستُرسل دليل الدفع عبر البريد الإلكتروني."
            : "By submitting this request, you confirm that you completed the payment and will send proof via email."}
        </p>
      </div>
    </div>
  );
}

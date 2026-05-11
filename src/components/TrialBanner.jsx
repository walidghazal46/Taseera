import { SUBSCRIPTION_STATUS } from "../data/packages";

export default function TrialBanner({ accessStatus, language, onUpgrade }) {
  const ar = language === "ar";
  if (!accessStatus || !accessStatus.status) return null;

  const { status, daysLeft } = accessStatus;

  if (status === SUBSCRIPTION_STATUS.REGISTERED_TRIAL && daysLeft !== undefined) {
    const urgent = daysLeft <= 3;
    return (
      <div
        className={`flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-semibold ${
          urgent
            ? "bg-red-50 border-b border-red-200 text-red-700"
            : "bg-amber-50 border-b border-amber-200 text-amber-800"
        }`}
        dir={ar ? "rtl" : "ltr"}
      >
        <span>
          {ar
            ? `تجربة مجانية · ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} متبقية`
            : `Free trial · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </span>
        <button
          onClick={onUpgrade}
          className={`rounded-full px-3 py-1 text-[11px] font-black ${
            urgent ? "bg-red-600 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {ar ? "اشترك الآن" : "Subscribe"}
        </button>
      </div>
    );
  }

  if (status === SUBSCRIPTION_STATUS.GUEST_TRIAL && daysLeft !== undefined) {
    return (
      <div
        className="flex items-center justify-between gap-2 bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs font-semibold text-blue-800"
        dir={ar ? "rtl" : "ltr"}
      >
        <span>
          {ar
            ? `وضع الزائر · ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} متبقية`
            : `Guest mode · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </span>
        <button
          onClick={onUpgrade}
          className="rounded-full bg-blue-600 text-white px-3 py-1 text-[11px] font-black"
        >
          {ar ? "سجّل الآن" : "Register"}
        </button>
      </div>
    );
  }

  if (status === SUBSCRIPTION_STATUS.ACTIVE) {
    return null;
  }

  return null;
}

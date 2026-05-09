import { useEffect, useMemo, useState } from "react";
import useAdminSession from "../hooks/useAdminSession";
import { openPaymentReceiptEmail } from "../services/emailPaymentService";
import { ensureRegisteredFreeTrial } from "../services/trialService";
import {
  MANUAL_PAYMENT_DETAILS,
  PAYMENT_METHODS,
  PLAN_DEFINITIONS,
  getPaidPlans,
  getPlanAmount,
  timestampToDate,
  createPaymentRequest,
  listMyPaymentRequests,
} from "../services/subscriptionService";

const F = "'Cairo','Tajawal',sans-serif";

function formatDate(value, language = "ar") {
  const date = timestampToDate(value);
  if (!date) return "—";
  return date.toLocaleString(language === "en" ? "en-GB" : "ar-SA");
}

function formatPlanLabel(planId, language = "ar") {
  const plan = PLAN_DEFINITIONS[planId];
  if (!plan) return planId || "—";
  return language === "en" ? plan.titleEn : plan.titleAr;
}

function getCurrentAccessCard(profile, language = "ar") {
  if (!profile) return null;
  const isEn = language === "en";
  if (profile.accountType === "supplier" || profile.accountType === "company") {
    return {
      tone: "emerald",
      title: isEn ? "Free partner access" : "وصول مجاني للشركات والموردين",
      body: isEn
        ? "This account uses the dedicated company/supplier flow and does not require user subscriptions."
        : "هذا الحساب يعمل ضمن مسار الشركات أو الموردين، لذلك لا يحتاج لاشتراك المستخدم العادي.",
    };
  }
  if (profile.lifetime === true || profile.plan === "lifetime") {
    return {
      tone: "violet",
      title: isEn ? "Lifetime access active" : "وصول مدى الحياة مفعل",
      body: isEn
        ? "All professional pricing tools are unlocked permanently."
        : "جميع أدوات التسعير الاحترافية مفتوحة لك بشكل دائم.",
    };
  }
  if (profile.subscriptionStatus === "active" && ["monthly", "six_months", "yearly"].includes(profile.plan)) {
    return {
      tone: "emerald",
      title: isEn ? `${formatPlanLabel(profile.plan, language)} active` : `${formatPlanLabel(profile.plan, language)} مفعلة`,
      body: isEn
        ? `Your access remains active until ${formatDate(profile.subscriptionEndsAt, language)}.`
        : `صلاحيتك فعالة حتى ${formatDate(profile.subscriptionEndsAt, language)}.`,
    };
  }
  if (profile.plan === "free_trial" && profile.subscriptionStatus === "active") {
    return {
      tone: "sky",
      title: isEn ? "7-day free trial active" : "التجربة المجانية 7 أيام مفعلة",
      body: isEn
        ? `All tools are unlocked until ${formatDate(profile.freeTrialEndsAt, language)}.`
        : `كل الأدوات مفتوحة لك حتى ${formatDate(profile.freeTrialEndsAt, language)}.`,
    };
  }
  if (profile.plan === "guest" && profile.subscriptionStatus === "active") {
    return {
      tone: "amber",
      title: isEn ? "24-hour guest trial active" : "تجربة الضيف 24 ساعة مفعلة",
      body: isEn
        ? `Guest access ends on ${formatDate(profile.guestTrialEndsAt, language)}.`
        : `تنتهي تجربة الضيف في ${formatDate(profile.guestTrialEndsAt, language)}.`,
    };
  }
  if (profile.subscriptionStatus === "expired") {
    return {
      tone: "rose",
      title: isEn ? "Access expired" : "الصلاحية منتهية",
      body: isEn
        ? "Your projects are محفوظة، but new pricing and editing are locked until you reactivate a plan."
        : "بياناتك ومشاريعك محفوظة، لكن إنشاء أو تعديل أو استخدام أدوات التسعير متوقف حتى إعادة التفعيل.",
    };
  }
  return {
    tone: "slate",
    title: isEn ? "No active access yet" : "لا توجد صلاحية نشطة بعد",
    body: isEn
      ? "Choose a plan once and unlock all pricing tools together."
      : "اختر باقة واحدة وافتح كل أدوات التسعير معًا.",
  };
}

function TonePanel({ tone = "slate", title, body }) {
  const tones = {
    emerald: "border-emerald-300/40 bg-emerald-500/10 text-emerald-50",
    violet: "border-violet-300/40 bg-violet-500/10 text-violet-50",
    sky: "border-sky-300/40 bg-sky-500/10 text-sky-50",
    amber: "border-amber-300/40 bg-amber-500/10 text-amber-50",
    rose: "border-rose-300/40 bg-rose-500/10 text-rose-50",
    slate: "border-white/10 bg-white/5 text-white",
  };

  return (
    <div className={`rounded-3xl border px-4 py-4 backdrop-blur-xl ${tones[tone] || tones.slate}`}>
      <p className="text-[14px] font-black">{title}</p>
      <p className="mt-1 text-[12px] leading-6 text-white/80">{body}</p>
    </div>
  );
}

function FeatureList({ language = "ar" }) {
  const features = language === "en"
    ? [
        "Full access to all tools",
        "Unlimited pricing",
        "Save projects",
        "Fast item analysis",
        "Future updates",
      ]
    : [
        "وصول كامل لجميع الأدوات",
        "تسعير غير محدود",
        "حفظ المشاريع",
        "تحليل سريع للبنود",
        "تحديثات مستقبلية",
      ];

  return (
    <div className="space-y-2">
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-2 text-[12px] text-white/80">
          <span className="text-emerald-300">✔</span>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
}

function PlanCard({ plan, language = "ar", selected, onSelect }) {
  const isEn = language === "en";

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border p-3 backdrop-blur-2xl transition-all duration-300 sm:rounded-[28px] sm:p-4 ${
        selected
          ? "border-cyan-300/60 bg-white/12 shadow-[0_0_0_1px_rgba(103,232,249,0.22),0_20px_50px_rgba(17,24,39,0.45)]"
          : "border-white/12 bg-white/6 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      {plan.badge ? (
        <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#ffca5f] to-[#ff8a5f] px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-[#1a2044]">
          {plan.badge}
        </span>
      ) : null}

      <button type="button" onClick={() => onSelect(plan.id)} className="block w-full pt-5 text-right">
        <p className="min-h-[46px] text-[15px] font-black leading-6 text-white sm:min-h-[54px] sm:text-[18px]">
          {isEn ? plan.titleEn : plan.titleAr}
        </p>
        <div className="mt-2 flex items-end gap-1 sm:mt-3">
          <span className="text-[26px] font-black leading-none text-white sm:text-[34px]">{plan.amount}</span>
          <div className="pb-1 text-[10px] font-bold text-cyan-100 sm:text-[12px]">
            <div>{plan.currency}</div>
            <div className="text-[9px] text-white/50 sm:text-[10px]">
              {plan.id === "monthly"
                ? (isEn ? "/ month" : "/ شهر")
                : plan.id === "lifetime"
                ? (isEn ? "one-time" : "مرة واحدة")
                : (isEn ? "one-time" : "مرة واحدة")}
            </div>
          </div>
        </div>
        <p className={`mt-2 text-[10px] font-bold sm:mt-3 sm:text-[12px] ${selected ? "text-cyan-100" : "text-white/70"}`}>
          {selected
            ? (isEn ? "Selected plan" : "الباقة المختارة")
            : (isEn ? "Tap to view details" : "اضغط لعرض التفاصيل")}
        </p>
      </button>
    </div>
  );
}

function PaymentMethodButton({ methodId, active, onClick, language = "ar" }) {
  const method = PAYMENT_METHODS[methodId];
  if (!method) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-[11px] font-bold transition-all whitespace-nowrap ${
        active
          ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-50"
          : "border-white/12 bg-white/5 text-white/80 hover:bg-white/8"
      }`}
    >
      {language === "en" ? method.labelEn : method.labelAr}
    </button>
  );
}

export default function SubscriptionPanel({
  language = "ar",
  authMode,
  sessionMeta,
  settings = {},
  onOpenAuthScreen,
  onShowStatus,
  onGoToPricing,
  systemBridge,
}) {
  const isEn = language === "en";
  const { profile } = useAdminSession({
    uid: sessionMeta?.uid,
    email: sessionMeta?.userEmail || settings?.userEmail,
    displayName: sessionMeta?.userName || settings?.userName,
  });

  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);

  const accessCard = useMemo(() => getCurrentAccessCard(profile, language), [profile, language]);
  const paidPlans = useMemo(() => getPaidPlans(), []);
  const selectedPlanDef = PLAN_DEFINITIONS[selectedPlan];
  const isAdminUnlocked = profile?.canAccessAdmin === true || profile?.adminType === "super" || profile?.role === "admin";
  const canStartFreeTrial = authMode !== "guest" && !isAdminUnlocked && profile?.accountType !== "supplier" && profile?.accountType !== "company" && profile?.plan !== "free_trial" && !profile?.trialUsed;

  useEffect(() => {
    if (!sessionMeta?.uid || authMode === "guest") {
      setRequests([]);
      return;
    }

    let active = true;
    setLoadingRequests(true);
    listMyPaymentRequests(sessionMeta.uid)
      .then((rows) => {
        if (active) setRequests(rows);
      })
      .catch((error) => {
        if (!active) return;
        setRequests([]);
        onShowStatus?.(
          error?.message || (isEn ? "Unable to load payment requests right now." : "تعذر تحميل طلبات الدفع الآن."),
          "warning"
        );
      })
      .finally(() => {
        if (active) setLoadingRequests(false);
      });

    return () => {
      active = false;
    };
  }, [authMode, isEn, onShowStatus, sessionMeta?.uid]);

  const handleChoosePlan = async () => {
    if (isAdminUnlocked) {
      onGoToPricing?.();
      return;
    }

    if (authMode === "guest" || !sessionMeta?.uid) {
      onOpenAuthScreen?.("login");
      return;
    }

    if (!profile?.userCode) {
      onShowStatus?.(isEn ? "Please wait a moment, your user code is still being prepared." : "يرجى الانتظار لحظة، يتم تجهيز رقم المستخدم الخاص بك.", "warning");
      return;
    }

    setSendingRequest(true);
    try {
      const created = await createPaymentRequest({
        uid: sessionMeta.uid,
        userCode: profile.userCode,
        email: profile.email || settings?.userEmail || "",
        userName: profile.name || settings?.userName || "",
        selectedPlan,
        paymentMethod: selectedMethod,
      });

      const email = openPaymentReceiptEmail({
        language,
        systemBridge,
        userName: profile.name || settings?.userName || "",
        userEmail: profile.email || settings?.userEmail || "",
        userCode: profile.userCode,
        selectedPlan,
        amount: created.amount,
        paymentMethod: selectedMethod,
      });

      setRequests((current) => [{ ...created, createdAt: new Date() }, ...current]);
      onShowStatus?.(email.message, "success");
    } catch (error) {
      onShowStatus?.(
        error?.message || (isEn ? "Unable to create the payment request right now." : "تعذر إنشاء طلب الدفع الآن."),
        "warning"
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const handleStartFreeTrial = async () => {
    if (!sessionMeta?.uid || !profile || startingTrial) return;
    setStartingTrial(true);
    try {
      await ensureRegisteredFreeTrial(sessionMeta.uid, profile);
      onShowStatus?.(
        isEn ? "Free trial activated. All tools are now open." : "تم تفعيل التجربة المجانية. كل الأدوات أصبحت مفتوحة.",
        "success"
      );
      onGoToPricing?.();
    } catch (error) {
      onShowStatus?.(error?.message || (isEn ? "Unable to start free trial now." : "تعذر بدء التجربة المجانية الآن."), "warning");
    } finally {
      setStartingTrial(false);
    }
  };

  return (
    <div
      className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(70,120,255,0.28),transparent_24%),radial-gradient(circle_at_top_right,rgba(95,230,255,0.18),transparent_24%),linear-gradient(180deg,#10172f_0%,#131d3f_38%,#17264d_100%)] p-4 shadow-[0_24px_70px_rgba(8,18,40,0.45)]"
      style={{ fontFamily: F }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_42%,transparent_100%)]" />

      <div className="relative space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
            {isEn ? "UNIFIED ACCESS" : "وصول موحد"}
          </p>
          <h2 className="mt-2 text-[22px] font-black text-white">
            {isEn ? "Unlock all professional pricing tools" : "افتح جميع أدوات التسعير الاحترافية"}
          </h2>
          <p className="mt-2 text-[13px] leading-7 text-white/75">
            {isEn
              ? "Subscribe once and get full access to the BOQ directory, building pricing, and detailed item analysis."
              : "اشترك مرة واحدة واحصل على وصول كامل إلى دليل البنود، تسعير المباني، والتحليل التفصيلي للبنود."}
          </p>
        </div>

        {accessCard ? <TonePanel {...accessCard} /> : null}

        {isAdminUnlocked ? (
          <div className="rounded-3xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-4 text-[12px] text-emerald-50">
            <p className="font-black">{isEn ? "Admin access is fully unlocked" : "وصول الأدمن مفتوح بالكامل"}</p>
            <p className="mt-1 leading-6 text-emerald-100/85">
              {isEn ? "You can enter all pricing tools directly without choosing a plan." : "يمكنك دخول جميع أدوات التسعير مباشرة بدون اختيار باقة."}
            </p>
            <button
              type="button"
              onClick={() => onGoToPricing?.()}
              className="mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-[13px] font-black text-white"
            >
              {isEn ? "Open all tools now" : "ادخل جميع الأدوات الآن"}
            </button>
          </div>
        ) : null}

        {profile?.plan === "free_trial" && profile?.subscriptionStatus === "active" ? (
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-[12px] text-cyan-50">
            {isEn
              ? "Trial banner: one subscription unlocks all pricing workflows. Use the countdown in your access status above to know when the free trial ends."
              : "تذكير: اشتراك واحد يفتح جميع مسارات التسعير. راقب تاريخ انتهاء التجربة من بطاقة الحالة بالأعلى."}
          </div>
        ) : null}

        {(profile?.accountType === "supplier" || profile?.accountType === "company") ? null : (
          <>
            {canStartFreeTrial ? (
              <div className="rounded-[26px] border border-emerald-300/30 bg-emerald-400/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-black text-white">{isEn ? "Free Trial - 7 Days" : "تجربة مجانية - 7 أيام"}</p>
                    <p className="mt-1 text-[12px] leading-6 text-white/75">
                      {isEn ? "Activate the free trial now and open all pricing tools بالكامل لمدة 7 أيام." : "فعّل التجربة المجانية الآن وافتح جميع أدوات التسعير بالكامل لمدة 7 أيام."}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white">FREE</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartFreeTrial}
                  disabled={startingTrial}
                  className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-[13px] font-black text-white disabled:opacity-60"
                >
                  {startingTrial
                    ? (isEn ? "Activating..." : "جارٍ التفعيل...")
                    : (isEn ? "Start Free Trial" : "ابدأ التجربة المجانية")}
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              {paidPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  selected={selectedPlan === plan.id}
                  onSelect={setSelectedPlan}
                />
              ))}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[18px] font-black text-white">{isEn ? selectedPlanDef?.titleEn : selectedPlanDef?.titleAr}</p>
                  <p className="mt-1 text-[12px] text-white/65">
                    {selectedPlan === "yearly"
                      ? (isEn ? "Most balanced choice for regular work." : "أفضل اختيار متوازن للاستخدام المستمر.")
                      : selectedPlan === "lifetime"
                      ? (isEn ? "Best value for long-term heavy usage." : "أفضل قيمة للاستخدام الطويل والمكثف.")
                      : selectedPlan === "six_months"
                      ? (isEn ? "Good saving versus monthly renewal." : "يوفر أفضل من التجديد الشهري.")
                      : (isEn ? "Flexible monthly access." : "وصول شهري مرن.")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-[12px] font-black text-cyan-100">
                  <div>{getPlanAmount(selectedPlan)} SAR</div>
                </div>
              </div>
              <div className="mt-4">
                <FeatureList language={language} />
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-black text-white">
                    {isEn ? "Manual payment activation" : "تفعيل الاشتراك بالدفع اليدوي"}
                  </p>
                  <p className="mt-1 text-[12px] leading-6 text-white/65">
                    {isEn
                      ? "Choose the plan, complete payment using one of the methods below, then open email to send the receipt."
                      : "اختر الباقة، أكمل الدفع بإحدى الطرق التالية، ثم افتح البريد لإرسال الإيصال."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-[12px] font-black text-cyan-100">
                  <div>{formatPlanLabel(selectedPlan, language)}</div>
                  <div className="mt-1 text-[18px] text-white">{getPlanAmount(selectedPlan)} SAR</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {Object.keys(PAYMENT_METHODS).map((methodId) => (
                  <PaymentMethodButton
                    key={methodId}
                    methodId={methodId}
                    active={selectedMethod === methodId}
                    onClick={() => setSelectedMethod(methodId)}
                    language={language}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 rounded-[26px] border border-white/10 bg-black/10 p-4 sm:grid-cols-2">
                <div className="space-y-2 text-[12px] text-white/80">
                  <p><strong className="text-white">{isEn ? "Arabic Name:" : "الاسم:"}</strong> {MANUAL_PAYMENT_DETAILS.arabicName}</p>
                  <p><strong className="text-white">{isEn ? "English Name:" : "English Name:"}</strong> {MANUAL_PAYMENT_DETAILS.englishName}</p>
                  <p><strong className="text-white">{isEn ? "InstaPay / Wallet:" : "رقم InstaPay / المحفظة:"}</strong> {MANUAL_PAYMENT_DETAILS.instapayOrWallet}</p>
                </div>
                <div className="space-y-2 text-[12px] text-white/80">
                  <p><strong className="text-white">{isEn ? "Bank:" : "البنك:"}</strong> {MANUAL_PAYMENT_DETAILS.bankName}</p>
                  <p><strong className="text-white">{isEn ? "Account Number:" : "رقم الحساب:"}</strong> {MANUAL_PAYMENT_DETAILS.accountNumber}</p>
                  <p className="break-all"><strong className="text-white">IBAN:</strong> {MANUAL_PAYMENT_DETAILS.iban}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleChoosePlan}
                  disabled={sendingRequest}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-[#7b4dff] via-[#399bff] to-[#55e2e6] px-4 py-3 text-[13px] font-black text-white shadow-[0_16px_34px_rgba(57,155,255,0.3)] disabled:opacity-60"
                >
                  {sendingRequest
                    ? (isEn ? "Opening email..." : "جارٍ فتح البريد...")
                    : (isEn ? "Send Payment Receipt" : "إرسال إيصال الدفع")}
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-6 text-white/55">
                {isEn
                  ? "A payment request will be created first, then your email app will open. Attach the receipt image and send it from the same registered email if possible. Activation happens manually within 48 hours."
                  : "سيتم إنشاء طلب دفع أولاً ثم فتح تطبيق البريد الإلكتروني. أرفق صورة الإيصال وأرسلها ويفضل من نفس البريد المسجل. التفعيل يتم يدويًا خلال 48 ساعة."}
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-[15px] font-black text-white">
                {isEn ? "Cancellation & refund policy" : "سياسة الإلغاء والاسترداد"}
              </p>
              <div className="mt-3 space-y-2 text-[12px] leading-6 text-white/70">
                <p>{isEn ? "You can request subscription cancellation at any time, and access remains active until the end of the paid period." : "يمكن للمستخدم طلب إلغاء الاشتراك في أي وقت، ويظل الاشتراك فعالًا حتى نهاية الفترة المدفوعة."}</p>
                <p>{isEn ? "There is no automatic refund after activation and use of the service." : "لا يوجد استرداد تلقائي بعد تفعيل الخدمة واستخدامها."}</p>
                <p>{isEn ? "Refund cases may be reviewed for duplicate payment, technical failure, or activation mistakes." : "يمكن مراجعة الاسترداد في حالات الدفع المكرر أو مشكلة تقنية أو خطأ في تفعيل الاشتراك."}</p>
                <p>{isEn ? "All manual subscriptions are reviewed by the admin team." : "جميع الاشتراكات اليدوية تتم مراجعتها من الإدارة."}</p>
              </div>
            </div>
          </>
        )}

        {authMode !== "guest" ? (
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-black text-white">{isEn ? "Payment requests" : "طلبات الدفع"}</p>
              {loadingRequests ? <span className="text-[11px] text-white/40">{isEn ? "Loading..." : "جاري التحميل..."}</span> : null}
            </div>

            {requests.length === 0 && !loadingRequests ? (
              <p className="mt-3 text-[12px] text-white/55">
                {isEn ? "No payment requests yet." : "لا توجد طلبات دفع حتى الآن."}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-black text-white">{formatPlanLabel(request.selectedPlan, language)}</p>
                        <p className="mt-1 text-[11px] text-white/55">
                          {request.amount} SAR · {language === "en" ? PAYMENT_METHODS[request.paymentMethod]?.labelEn : PAYMENT_METHODS[request.paymentMethod]?.labelAr}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        request.status === "approved"
                          ? "bg-emerald-400/15 text-emerald-100"
                          : request.status === "rejected"
                          ? "bg-rose-400/15 text-rose-100"
                          : "bg-amber-400/15 text-amber-100"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-white/45">
                      {isEn ? "Created on" : "تاريخ الإنشاء"}: {formatDate(request.createdAt, language)}
                    </p>
                    {request.rejectionReason ? (
                      <p className="mt-2 text-[11px] text-rose-200">{request.rejectionReason}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-amber-300/20 bg-amber-400/10 px-4 py-4 text-[12px] leading-6 text-amber-50">
            {isEn
              ? "Guest trial lasts 24 hours and unlocks all tools. After it ends, sign in or create an account to continue."
              : "تجربة الضيف مدتها 24 ساعة وتفتح كل الأدوات. بعد انتهائها سجّل الدخول أو أنشئ حسابًا للمتابعة."}
          </div>
        )}
      </div>
    </div>
  );
}

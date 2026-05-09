import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export const PLAN_DEFINITIONS = {
  guest: {
    id: "guest",
    titleAr: "تجربة الضيف",
    titleEn: "Guest Trial",
    amount: 0,
    currency: "SAR",
    durationHours: 24,
    badge: "",
  },
  free_trial: {
    id: "free_trial",
    titleAr: "التجربة المجانية",
    titleEn: "Free Trial",
    amount: 0,
    currency: "SAR",
    durationDays: 7,
    badge: "",
  },
  monthly: {
    id: "monthly",
    titleAr: "الباقة الشهرية",
    titleEn: "Monthly Plan",
    amount: 49,
    currency: "SAR",
    durationMonths: 1,
    badge: "",
  },
  six_months: {
    id: "six_months",
    titleAr: "باقة 6 شهور",
    titleEn: "6 Months Plan",
    amount: 199,
    currency: "SAR",
    durationMonths: 6,
    badge: "",
  },
  yearly: {
    id: "yearly",
    titleAr: "الباقة السنوية",
    titleEn: "Yearly Plan",
    amount: 329,
    currency: "SAR",
    durationMonths: 12,
    badge: "MOST POPULAR",
  },
  lifetime: {
    id: "lifetime",
    titleAr: "وصول مدى الحياة",
    titleEn: "Lifetime Access",
    amount: 699,
    currency: "SAR",
    durationMonths: null,
    lifetime: true,
    badge: "BEST VALUE",
  },
  qs_premium: {
    id: "qs_premium",
    titleAr: "باقة بنود المقايسات الكاملة (QS)",
    titleEn: "Full QS Premium Plan",
    amount: 200,
    currency: "SAR",
    durationMonths: null,
    lifetime: true,
    badge: "SPECIALIZED",
  },
};

export const PAID_PLAN_ORDER = ["monthly", "six_months", "yearly", "lifetime", "qs_premium"];

export const DEFAULT_PAYMENT_SETTINGS = {
  enabled: true,
  basePlanLabelAr: "الاشتراك الكامل",
  basePlanLabelEn: "Full Access",
  baseAmountSar: 100,
  acceptedMethods: ["bank_transfer", "stc_pay", "instapay"],
  methodLabels: {
    bank_transfer: "تحويل بنكي",
    stc_pay: "STC Pay",
    instapay: "InstaPay",
  },
  paymentAccounts: {
    bank_transfer: "IBAN: SA00 0000 0000 0000 0000 0000",
    stc_pay: "+966500000000",
    instapay: "example@instapay",
  },
  note: "الرسوم 100 ريال سعودي أو ما يعادله بالعملة المحلية.",
};

export const DEFAULT_AD_BANNER = {
  enabled: false,
  title: "",
  imageUrl: "",
  targetUrl: "",
  alt: "",
};

export const PAYMENT_METHODS = {
  bank_transfer: {
    id: "bank_transfer",
    labelAr: "تحويل بنكي",
    labelEn: "Bank Transfer",
  },
  instapay: {
    id: "instapay",
    labelAr: "InstaPay",
    labelEn: "InstaPay",
  },
  cash_wallet: {
    id: "cash_wallet",
    labelAr: "محفظة كاش",
    labelEn: "Cash Wallet",
  },
};

export const MANUAL_PAYMENT_DETAILS = {
  arabicName: "وليد غزال إبراهيم قلموش",
  englishName: "Walid Ghazal Ibrahim Kalmosh",
  instapayOrWallet: "01064463650",
  bankName: "Al Rajhi Bank",
  accountNumber: "996000010006087542586",
  iban: "SA46 8000 0996 6080 1754 2586",
  supportEmail: "walidghazal46@gmail.com",
  activationWindowHours: 48,
};

export function getPlanDefinition(planId = "none") {
  return PLAN_DEFINITIONS[planId] || null;
}

export function getPaidPlans() {
  return PAID_PLAN_ORDER.map((id) => PLAN_DEFINITIONS[id]).filter(Boolean);
}

export function getPlanAmount(planId = "none") {
  return Number(PLAN_DEFINITIONS[planId]?.amount || 0);
}

export function isLifetimePlan(planId = "none") {
  return PLAN_DEFINITIONS[planId]?.lifetime === true;
}

export function computePlanEndDate(planId, startedAt = new Date()) {
  const plan = getPlanDefinition(planId);
  if (!plan || plan.lifetime) return null;

  const base = startedAt instanceof Date ? new Date(startedAt) : new Date(startedAt);
  if (Number.isNaN(base.getTime())) return null;

  if (plan.durationHours) {
    base.setHours(base.getHours() + plan.durationHours);
    return base;
  }

  if (plan.durationDays) {
    base.setDate(base.getDate() + plan.durationDays);
    return base;
  }

  if (plan.durationMonths) {
    base.setMonth(base.getMonth() + plan.durationMonths);
    return base;
  }

  return null;
}

export function timestampToDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isTimestampActive(value) {
  const date = timestampToDate(value);
  return Boolean(date && date.getTime() > Date.now());
}

/**
 * Checks if user has an active paid subscription.
 */
export function hasActivePaidSubscription(user = {}) {
  if (!user) return false;
  if (user.lifetime === true || isLifetimePlan(user.plan)) return true;
  return (
    user.subscriptionStatus === "active" &&
    ["monthly", "six_months", "yearly"].includes(user.plan) &&
    isTimestampActive(user.subscriptionEndsAt)
  );
}

/**
 * Checks if user has an active free trial.
 */
export function hasActiveFreeTrial(user = {}) {
  if (!user) return false;
  return user.plan === "free_trial" && user.subscriptionStatus === "active" && isTimestampActive(user.freeTrialEndsAt);
}

/**
 * Checks if user has an active guest trial.
 */
export function hasActiveGuestTrial(user = {}) {
  if (!user) return false;
  return user.plan === "guest" && user.subscriptionStatus === "active" && isTimestampActive(user.guestTrialEndsAt);
}

/**
 * Checks if user has full access to professional tools.
 */
export function hasFullToolAccess(user = {}) {
  return Boolean(
    user?.lifetime === true ||
    hasActivePaidSubscription(user) ||
    hasActiveFreeTrial(user) ||
    hasActiveGuestTrial(user)
  );
}

export function getAccessKind(user = {}) {
  if (!user) return "none";
  if (user.lifetime === true || isLifetimePlan(user.plan)) return "lifetime";
  if (hasActivePaidSubscription(user)) return "paid";
  if (hasActiveFreeTrial(user)) return "free_trial";
  if (hasActiveGuestTrial(user)) return "guest_trial";
  return "none";
}

/**
 * Creates a payment request document in Firestore.
 */
export async function createPaymentRequest({
  uid,
  userCode,
  email,
  userName = "",
  selectedPlan,
  paymentMethod,
}) {
  if (!uid) throw new Error("User ID is required.");
  if (!selectedPlan) throw new Error("Plan selection is required.");
  if (!paymentMethod) throw new Error("Payment method is required.");

  const amount = getPlanAmount(selectedPlan);
  const payload = {
    uid,
    userId: uid,
    userCode: userCode || "",
    email: String(email || "").trim().toLowerCase(),
    userName: userName || "",
    selectedPlan,
    amount,
    currency: "SAR",
    paymentMethod,
    status: "pending",
    requestStatus: "pending_review",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "paymentRequests"), payload);

  // Also update user's subscription status to pending
  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: "pending",
    updatedAt: serverTimestamp(),
  });

  return { id: ref.id, ...payload };
}

/**
 * Lists payment requests for the current user.
 */
export async function listMyPaymentRequests(uid) {
  if (!uid) return [];
  const q = query(
    collection(db, "paymentRequests"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * User requests subscription cancellation.
 */
export async function requestCancellation(uid, reason = "") {
  if (!uid) throw new Error("User ID required");
  await updateDoc(doc(db, "users", uid), {
    cancellationRequest: {
      status: "pending",
      requestedAt: serverTimestamp(),
      reason: reason || "",
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * User requests account deletion.
 */
export async function requestAccountDeletion(uid, { displayName, email, reason = "" } = {}) {
  if (!uid) throw new Error("User ID required");
  await updateDoc(doc(db, "users", uid), {
    deletionRequest: {
      status: "pending",
      requestedAt: serverTimestamp(),
      reason: reason || "",
      displayName: displayName || "",
      email: email || "",
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Increments usage counters for a user.
 */
export async function incrementUsageCounter(uid, field) {
  if (!uid || !field) return;
  await updateDoc(doc(db, "users", uid), {
    [field]: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export function buildDefaultUserFields({
  uid,
  email = "",
  name = "",
  phone = "",
  role = "user",
  adminType = "none",
  permissions = {},
  accountType = "user",
  status = "approved",
}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedName = String(name || "").trim() || normalizedEmail.split("@")[0] || "User";

  return {
    uid,
    email: normalizedEmail,
    emailLower: normalizedEmail,
    name: normalizedName,
    nameLower: normalizedName.toLowerCase(),
    phone: phone || "",
    phoneLower: String(phone || "").toLowerCase(),
    role,
    adminType,
    permissions,
    status,
    accountType,
    userCode: "",
    plan: "none",
    subscriptionStatus: "none",
    subscriptionStartedAt: null,
    subscriptionEndsAt: null,
    isPaid: false,
    lifetime: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function ensureUserDocument(uid, fields) {
  if (!uid) return;
  await setDoc(doc(db, "users", uid), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
}

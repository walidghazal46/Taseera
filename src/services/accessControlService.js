import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { enforceDeviceLimit } from "./deviceLimitService";
import { getFreeTrialState, getGuestTrialState, ensureRegisteredFreeTrial } from "./trialService";
import { getAccessKind, hasActivePaidSubscription, isLifetimePlan, timestampToDate } from "./subscriptionService";

function isExpired(user = {}) {
  if (!user) return false;
  if (user.lifetime === true || isLifetimePlan(user.plan)) return false;

  const relevantEnd = user.plan === "free_trial" ? user.freeTrialEndsAt : user.subscriptionEndsAt;
  const date = timestampToDate(relevantEnd);
  return Boolean(date && date.getTime() <= Date.now());
}

async function markExpiredIfNeeded(uid, user = {}) {
  if (!uid || !isExpired(user) || user.subscriptionStatus === "expired") return;
  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: "expired",
    updatedAt: serverTimestamp(),
  });
}

export async function ensureToolAccess({
  authMode,
  sessionMeta,
  userProfile,
  language = "ar",
}) {
  const isEn = language === "en";
  const guestMessage = isEn
    ? "Your guest trial has ended. Please register or choose a plan to continue."
    : "انتهت تجربة الضيف. يرجى التسجيل أو اختيار باقة للمتابعة.";
  const userMessage = isEn
    ? "Your access is inactive. Please start a plan to continue using all pricing tools."
    : "الصلاحية غير نشطة. يرجى اختيار باقة للمتابعة واستخدام جميع أدوات التسعير.";

  if (authMode === "guest") {
    const guestId = sessionMeta?.guestId;
    const guestTrial = await getGuestTrialState(guestId);
    return {
      allowed: guestTrial.active,
      accessKind: guestTrial.active ? "guest_trial" : "none",
      message: guestTrial.active ? "" : guestMessage,
      showPlans: !guestTrial.active,
      guestTrial,
      deviceAllowed: true,
    };
  }

  if (!sessionMeta?.uid || !userProfile) {
    return {
      allowed: false,
      accessKind: "none",
      message: isEn ? "Please sign in first." : "يرجى تسجيل الدخول أولاً.",
      showPlans: true,
      deviceAllowed: false,
    };
  }

  const accountType = userProfile.accountType || "user";
  if (accountType === "supplier" || accountType === "company") {
    return {
      allowed: true,
      accessKind: "free_partner_access",
      message: "",
      showPlans: false,
      deviceAllowed: true,
    };
  }

  const deviceState = await enforceDeviceLimit({
    uid: sessionMeta.uid,
    userData: userProfile,
    language,
  });
  if (!deviceState.allowed) {
    return {
      allowed: false,
      accessKind: "blocked_device",
      message: deviceState.message,
      showPlans: false,
      deviceAllowed: false,
    };
  }

  await markExpiredIfNeeded(sessionMeta.uid, userProfile);

  if (userProfile.lifetime === true || hasActivePaidSubscription(userProfile)) {
    return {
      allowed: true,
      accessKind: getAccessKind(userProfile),
      message: "",
      showPlans: false,
      deviceAllowed: true,
    };
  }

  const freeTrialState = getFreeTrialState(userProfile);
  if (freeTrialState.active) {
    return {
      allowed: true,
      accessKind: "free_trial",
      message: "",
      showPlans: false,
      freeTrialState,
      deviceAllowed: true,
    };
  }

  if (!freeTrialState.started && !userProfile.trialUsed) {
    await ensureRegisteredFreeTrial(sessionMeta.uid, userProfile);
    return {
      allowed: true,
      accessKind: "free_trial",
      message: "",
      showPlans: false,
      deviceAllowed: true,
    };
  }

  return {
    allowed: false,
    accessKind: "none",
    message: userMessage,
    showPlans: true,
    deviceAllowed: true,
  };
}

export function canModifyProtectedData(userProfile = {}) {
  return Boolean(
    userProfile?.lifetime === true ||
    hasActivePaidSubscription(userProfile) ||
    getFreeTrialState(userProfile).active
  );
}

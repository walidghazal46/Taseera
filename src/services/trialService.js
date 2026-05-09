import { Timestamp, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { computePlanEndDate, timestampToDate } from "./subscriptionService";

export const GUEST_TRIAL_HOURS = 24;
export const FREE_TRIAL_DAYS = 7;

function createTimestampFromDate(date) {
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
}

export async function ensureGuestTrialSession(guestId) {
  if (!guestId) return null;

  const ref = doc(db, "guestTrials", guestId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  const startedAt = new Date();
  const endsAt = computePlanEndDate("guest", startedAt);

  const payload = {
    guestId,
    plan: "guest",
    startedAt: createTimestampFromDate(startedAt),
    endsAt: createTimestampFromDate(endsAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function getGuestTrialState(guestId) {
  if (!guestId) return { active: false, startedAt: null, endsAt: null };
  const ref = doc(db, "guestTrials", guestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const created = await ensureGuestTrialSession(guestId);
    return {
      active: true,
      startedAt: created?.startedAt || null,
      endsAt: created?.endsAt || null,
    };
  }

  const data = snap.data() || {};
  const endsAt = timestampToDate(data.endsAt);
  return {
    active: Boolean(endsAt && endsAt.getTime() > Date.now()),
    startedAt: data.startedAt || null,
    endsAt: data.endsAt || null,
  };
}

export async function ensureRegisteredFreeTrial(userId, userData = {}) {
  if (!userId) return null;
  if ((userData.accountType || "user") !== "user") return null;
  if (userData.lifetime === true || ["monthly", "six_months", "yearly", "lifetime"].includes(userData.plan)) {
    return null;
  }
  if (userData.trialUsed || userData.freeTrialStartedAt) {
    return {
      freeTrialStartedAt: userData.freeTrialStartedAt || null,
      freeTrialEndsAt: userData.freeTrialEndsAt || null,
    };
  }

  const startedAt = new Date();
  const endsAt = computePlanEndDate("free_trial", startedAt);

  await updateDoc(doc(db, "users", userId), {
    trialUsed: true,
    freeTrialStartedAt: createTimestampFromDate(startedAt),
    freeTrialEndsAt: createTimestampFromDate(endsAt),
    plan: "free_trial",
    subscriptionStatus: "active",
    subscriptionStartedAt: createTimestampFromDate(startedAt),
    subscriptionEndsAt: createTimestampFromDate(endsAt),
    lifetime: false,
    isPaid: false,
    subscriptionType: "free_trial",
    updatedAt: serverTimestamp(),
  });

  return {
    freeTrialStartedAt: createTimestampFromDate(startedAt),
    freeTrialEndsAt: createTimestampFromDate(endsAt),
  };
}

export function getFreeTrialState(userData = {}) {
  const endsAt = timestampToDate(userData.freeTrialEndsAt);
  return {
    started: Boolean(userData.freeTrialStartedAt),
    active: Boolean(endsAt && endsAt.getTime() > Date.now()),
    startedAt: userData.freeTrialStartedAt || null,
    endsAt: userData.freeTrialEndsAt || null,
    used: Boolean(userData.trialUsed),
  };
}

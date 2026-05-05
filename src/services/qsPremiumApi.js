import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { hasPermission } from "./adminApi";

const PRICE_MAP = {
  sa: { currency: "SAR", price: 200 },
  eg: { currency: "EGP", price: 2800 },
  ae: { currency: "AED", price: 200 },
};

// ---------------------------------------------------------------------------
// User-facing
// ---------------------------------------------------------------------------

/**
 * Real-time listener on the user's QS Premium subscription document.
 * @param {string} userId
 * @param {function} callback - called with doc data (or null if no document)
 * @returns {function} unsubscribe
 */
export function listenQSPremiumStatus(userId, callback) {
  if (!userId) {
    callback(null);
    return () => {};
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  return onSnapshot(
    ref,
    (snap) => { callback(snap.exists() ? snap.data() : null); },
    (err)  => {
      console.warn("[QSPremium] listener error:", err?.code, err?.message);
      callback(null); // treat any error as "no subscription" → show paywall
    }
  );
}

/**
 * Generate a short human-readable order ID for QS Premium requests.
 */
function generateOrderId(userId) {
  const year = new Date().getFullYear();
  const suffix = userId.slice(-5).toUpperCase();
  const rand   = Math.floor(1000 + Math.random() * 9000);
  return `QSP-${year}-${suffix}-${rand}`;
}

/**
 * Submit a new subscription request.
 * Returns { orderId } so the caller can build a mailto link.
 */
export async function requestQSPremium({ userId, userEmail, userName, country }) {
  if (!userId) throw new Error("userId required");
  const countryKey = (country || "").toLowerCase();
  const priceInfo = PRICE_MAP[countryKey];
  if (!priceInfo) throw new Error(`Unsupported country: ${country}`);

  const ref = doc(db, "qsPremiumSubscriptions", userId);
  const existingSnap = await getDoc(ref);
  if (existingSnap.exists()) {
    const currentStatus = existingSnap.data()?.status;
    if (currentStatus === "pending") {
      throw new Error("يوجد طلب اشتراك قيد المراجعة بالفعل.");
    }
    if (currentStatus === "active") {
      throw new Error("الاشتراك مفعل بالفعل.");
    }
  }

  const orderId = generateOrderId(userId);
  await setDoc(ref, {
    userId,
    orderId,
    userEmail: userEmail || "",
    userName: userName || "",
    country: countryKey,
    currency: priceInfo.currency,
    price: priceInfo.price,
    status: "pending",
    requestedAt: serverTimestamp(),
    activatedAt: null,
    trialEndsAt: null,
    trialItemsUsed: [],
    refundRequest: null,
    adminNotes: "",
    rejectionReason: "",
    updatedAt: serverTimestamp(),
  });

  return { orderId };
}

/**
 * Record usage of a trial item (max 10 items).
 * @param {string} userId
 * @param {string} itemKey - unique string identifying the BOQ item
 */
export async function addTrialItem(userId, itemKey) {
  if (!userId || !itemKey) return;
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if ((data.trialItemsUsed || []).length >= 10) return;
  if ((data.trialItemsUsed || []).includes(itemKey)) return;
  await updateDoc(ref, {
    trialItemsUsed: arrayUnion(itemKey),
    updatedAt: serverTimestamp(),
  });
}

/**
 * User requests a refund (only during trial period).
 */
export async function requestRefund(userId, reason) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await updateDoc(ref, {
    refundRequest: {
      requestedAt: Timestamp.now(),
      reason: reason || "",
      status: "pending_review",
      adminNotes: "",
    },
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Admin-facing
// ---------------------------------------------------------------------------

/**
 * Real-time listener for all QS Premium subscription requests (admin).
 * @param {function} callback - called with array of subscription objects
 * @returns {function} unsubscribe
 */
export function listenAllQSPremiumRequests(callback) {
  const ref = collection(db, "qsPremiumSubscriptions");
  return onSnapshot(
    ref,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn("[QSPremium] admin listener error:", err?.code, err?.message);
      callback([]);
    }
  );
}

/**
 * Approve a subscription request — sets status to "active", records
 * activatedAt and computes trialEndsAt (activatedAt + 3 days).
 */
export async function adminApproveQSPremium(adminProfile, userId) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to approve QS Premium subscriptions.");
  }
  const now = Timestamp.now();
  // Trial = 48 hours from activation
  const trialEndsAt = Timestamp.fromMillis(now.toMillis() + 48 * 60 * 60 * 1000);
  // No-refund deadline = 7 days from activation
  const noRefundAfter = Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await updateDoc(ref, {
    status: "active",
    activatedAt: serverTimestamp(),
    trialEndsAt,
    noRefundAfter,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reject a subscription request.
 */
export async function adminRejectQSPremium(adminProfile, userId, reason) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to reject QS Premium subscriptions.");
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await updateDoc(ref, {
    status: "rejected",
    rejectionReason: reason || "",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deactivate an active subscription.
 */
export async function adminDeactivateQSPremium(adminProfile, userId) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to deactivate QS Premium subscriptions.");
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await updateDoc(ref, {
    status: "deactivated",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reactivate a deactivated or rejected subscription (back to active).
 */
export async function adminReactivateQSPremium(adminProfile, userId) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to reactivate QS Premium subscriptions.");
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await updateDoc(ref, {
    status: "active",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a QS Premium request completely from the system.
 */
export async function adminDeleteQSPremium(adminProfile, userId) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to delete QS Premium subscriptions.");
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  await deleteDoc(ref);
}

/**
 * Handle a refund request (approve or reject) with admin notes.
 */
export async function adminHandleRefund(adminProfile, userId, approved, notes) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("No permission to handle refunds.");
  }
  const ref = doc(db, "qsPremiumSubscriptions", userId);
  const newStatus = approved ? "approved" : "rejected";
  await updateDoc(ref, {
    "refundRequest.status": newStatus,
    "refundRequest.adminNotes": notes || "",
    ...(approved ? { status: "deactivated" } : {}),
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Free Trial (pre-subscription, stored on users/{uid})
// ---------------------------------------------------------------------------
export const FREE_TRIAL_LIMIT = 10;

/**
 * Start the free trial for a user — writes freeTrialQS on users/{uid}.
 * No-op if already started.
 */
export async function startFreeTrial(userId) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data()?.freeTrialQS?.started) {
    return; // already started, do nothing
  }
  await updateDoc(ref, {
    freeTrialQS: {
      started: true,
      startedAt: serverTimestamp(),
      itemsUsed: [],
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Real-time listener for the user's free trial state.
 * Calls callback({ started, itemsUsed }) or null if no trial.
 */
export function listenFreeTrial(userId, callback) {
  if (!userId) { callback(null); return () => {}; }
  const ref = doc(db, "users", userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) { callback(null); return; }
      const data = snap.data();
      callback(data?.freeTrialQS || null);
    },
    () => callback(null)
  );
}

/**
 * Record that the user accessed an item during free trial.
 */
export async function recordFreeTrialItem(userId, itemKey) {
  if (!userId || !itemKey) return;
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const trial = snap.data()?.freeTrialQS;
  if (!trial?.started) return;
  if ((trial.itemsUsed || []).includes(itemKey)) return;
  if ((trial.itemsUsed || []).length >= FREE_TRIAL_LIMIT) return;
  await updateDoc(ref, {
    "freeTrialQS.itemsUsed": arrayUnion(itemKey),
    updatedAt: serverTimestamp(),
  });
}

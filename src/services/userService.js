import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  SUPER_ADMIN_EMAIL, SUBSCRIPTION_STATUS, REGISTERED_TRIAL_DAYS,
} from "../data/packages";
import { isExistingUser, EXISTING_USER_TRIAL_START, EXISTING_USER_TRIAL_END } from "../data/existingUsers";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Build the initial profile when a user registers or signs in for the first time.
export function buildInitialProfile(firebaseUser) {
  const email = firebaseUser.email || "";
  const now   = new Date();

  const isExisting = isExistingUser(email);
  const trialStart = isExisting ? EXISTING_USER_TRIAL_START : now;
  const trialEnd   = isExisting
    ? EXISTING_USER_TRIAL_END
    : addDays(now, REGISTERED_TRIAL_DAYS);

  return {
    uid:         firebaseUser.uid,
    email,
    displayName: firebaseUser.displayName || email.split("@")[0] || "User",
    role:        "user",   // Always "user" — only Super Admin can assign "admin"
    userType:    "registered",
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    trialStartDate:      Timestamp.fromDate(trialStart),
    trialEndDate:        Timestamp.fromDate(trialEnd),
    subscriptionStatus:  SUBSCRIPTION_STATUS.REGISTERED_TRIAL,
    selectedPackage:     null,
    packageStartDate:    null,
    packageEndDate:      null,
    isActive:    true,
    isPaid:      false,
  };
}

// Create or merge user profile in Firestore.
// For new users: write full profile including subscription fields.
// For existing users: only update safe non-privileged fields (displayName).
// Subscription fields are intentionally NOT updated for existing users —
// Firestore rules block self-update of those fields, and computeAccessStatus
// handles missing fields gracefully using createdAt as a fallback.
export async function ensureUserProfile(firebaseUser) {
  const ref  = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, buildInitialProfile(firebaseUser));
    return (await getDoc(ref)).data();
  }

  const data = snap.data();

  // Only update safe display fields that can't affect privileges.
  const updates = {};
  const newName = firebaseUser.displayName;
  if (newName && newName !== data.displayName) {
    updates.displayName = newName;
    updates.updatedAt   = serverTimestamp();
  }

  if (Object.keys(updates).length > 0) {
    try { await updateDoc(ref, updates); } catch { /* ignore if rules block it */ }
  }

  return { ...data, ...updates };
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Compute effective access status from the stored profile.
// Handles legacy profiles that may be missing subscription fields.
export function computeAccessStatus(profile) {
  if (!profile) return { canAccess: false, status: "no_profile" };

  let {
    subscriptionStatus, packageEndDate, trialEndDate, isActive, createdAt, email,
  } = profile;

  // Legacy profiles without subscriptionStatus — compute from known data.
  if (!subscriptionStatus) {
    const now = new Date();
    if (email && isExistingUser(email)) {
      subscriptionStatus = SUBSCRIPTION_STATUS.REGISTERED_TRIAL;
      trialEndDate = { toDate: () => EXISTING_USER_TRIAL_END };
    } else {
      const created = createdAt?.toDate?.() || now;
      const trialEnd = addDays(created, REGISTERED_TRIAL_DAYS);
      subscriptionStatus = SUBSCRIPTION_STATUS.REGISTERED_TRIAL;
      trialEndDate = { toDate: () => trialEnd };
    }
  }

  // For existing users on trial, always enforce the authoritative end date.
  // This corrects any old dates already stored in Firestore (e.g. May 19 → May 31).
  if (
    subscriptionStatus === SUBSCRIPTION_STATUS.REGISTERED_TRIAL &&
    email && isExistingUser(email)
  ) {
    const stored = trialEndDate?.toDate?.();
    if (!stored || stored < EXISTING_USER_TRIAL_END) {
      trialEndDate = { toDate: () => EXISTING_USER_TRIAL_END };
    }
  }

  // Suspended
  if (!isActive || subscriptionStatus === SUBSCRIPTION_STATUS.SUSPENDED) {
    return { canAccess: false, status: SUBSCRIPTION_STATUS.SUSPENDED };
  }

  const now = new Date();

  // Active paid package
  if (subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE) {
    const end = packageEndDate?.toDate?.();
    if (end && end > now) {
      return { canAccess: true, status: SUBSCRIPTION_STATUS.ACTIVE, packageEndDate: end };
    }
    return { canAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED };
  }

  // Registered trial
  if (subscriptionStatus === SUBSCRIPTION_STATUS.REGISTERED_TRIAL) {
    const end = trialEndDate?.toDate?.();
    if (end && end > now) {
      const daysLeft = Math.ceil((end - now) / 86400000);
      return { canAccess: true, status: SUBSCRIPTION_STATUS.REGISTERED_TRIAL, trialEndDate: end, daysLeft };
    }
    return { canAccess: false, status: SUBSCRIPTION_STATUS.TRIAL_EXPIRED };
  }

  // Guest trial
  if (subscriptionStatus === SUBSCRIPTION_STATUS.GUEST_TRIAL) {
    const end = trialEndDate?.toDate?.();
    if (end && end > now) {
      const daysLeft = Math.ceil((end - now) / 86400000);
      return { canAccess: true, status: SUBSCRIPTION_STATUS.GUEST_TRIAL, trialEndDate: end, daysLeft, limitedAccess: true };
    }
    return { canAccess: false, status: SUBSCRIPTION_STATUS.TRIAL_EXPIRED };
  }

  // Pending payment
  if (subscriptionStatus === SUBSCRIPTION_STATUS.PENDING_PAYMENT) {
    return { canAccess: false, status: SUBSCRIPTION_STATUS.PENDING_PAYMENT };
  }

  // Rejected payment
  if (subscriptionStatus === SUBSCRIPTION_STATUS.REJECTED) {
    return { canAccess: false, status: SUBSCRIPTION_STATUS.REJECTED };
  }

  // Expired
  return { canAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED };
}

export function isSuperAdminEmail(email) {
  return email?.toLowerCase?.() === SUPER_ADMIN_EMAIL.toLowerCase();
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
  deleteDoc,
  getCountFromServer,
  startAfter,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { SUPER_ADMIN_EMAIL, normalizePermissions } from "../constants/admin";
import { computePlanEndDate } from "./subscriptionService";

export const AD_SLOT_IDS = {
  analysisPreResult: "item_analysis_bottom_banner",
  analysisAfterActions: "item_analysis_after_actions_banner",
  analysisPostResult: "item_analysis_after_result_banner",
  areaFormAfterCard: "area_form_after_card_banner",
  areaResultsAfterNote: "area_results_after_note_banner",
  areaSectionAfterAssumptions: "area_section_after_assumptions_banner",
  companiesAfterPagination: "companies_after_pagination_banner",
  suppliersAfterPagination: "suppliers_after_pagination_banner",
  selfPricingAfterActions: "self_pricing_after_actions_banner",
  csiAfterDiv28: "csi_after_div28_banner",
};

/**
 * Checks if the current admin has a specific permission.
 */
export function hasPermission(adminProfile, key) {
  if (!adminProfile) return false;
  if (adminProfile.email?.toLowerCase() === SUPER_ADMIN_EMAIL || adminProfile.adminType === "super") {
    return true;
  }
  return adminProfile.role === "admin" && adminProfile.permissions?.[key] === true;
}

/**
 * Throws an error if the admin does not have the required permission.
 */
function requirePermission(adminProfile, key) {
  if (!hasPermission(adminProfile, key)) {
    throw new Error(`Permission denied: ${key}`);
  }
}

/**
 * Creates an audit log entry for admin actions.
 */
async function createAdminLog(adminProfile, payload) {
  try {
    await addDoc(collection(db, "adminLogs"), {
      adminId: adminProfile?.uid || "system",
      adminEmail: adminProfile?.email || "system",
      actionType: payload.actionType,
      targetUserId: payload.targetUserId || null,
      targetCollection: payload.targetCollection || null,
      oldData: payload.oldData || null,
      newData: payload.newData || null,
      metadata: payload.metadata || null,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to create admin log:", e);
  }
}

/**
 * Fetches dashboard statistics efficiently using getCountFromServer.
 */
export async function getDashboardStats() {
  const usersColl = collection(db, "users");
  const requestsColl = collection(db, "paymentRequests");

  const [
    totalUsers,
    activeSubs,
    suspendedUsers,
    pendingRequests,
  ] = await Promise.all([
    getCountFromServer(usersColl),
    getCountFromServer(query(usersColl, where("subscriptionStatus", "==", "active"))),
    getCountFromServer(query(usersColl, where("status", "==", "suspended"))),
    getCountFromServer(query(requestsColl, where("status", "in", ["pending", "pending_review"]))),
  ]);

  return {
    totalUsers: totalUsers.data().count,
    activeUsers: activeSubs.data().count,
    suspendedUsers: suspendedUsers.data().count,
    paidUsers: activeSubs.data().count,
    pendingRequests: pendingRequests.data().count,
    newToday: 0,
    newWeek: 0,
    newMonth: 0,
  };
}

/**
 * Lists users with pagination and filtering.
 */
export async function listUsersPage({ pageSize = 10, cursor = null, status = "all", paid = "all" } = {}) {
  let q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(pageSize));

  if (status !== "all") {
    q = query(q, where("status", "==", status));
  }
  if (paid === "paid") {
    q = query(q, where("isPaid", "==", true));
  } else if (paid === "unpaid") {
    q = query(q, where("isPaid", "==", false));
  }

  if (cursor) {
    q = query(q, startAfter(cursor));
  }

  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  return {
    rows,
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: rows.length === pageSize,
  };
}

/**
 * Global search for users.
 */
export async function searchUsersGlobal(searchText, maxResults = 20) {
  const qText = (searchText || "").trim().toLowerCase();
  if (!qText || qText.length < 2) return [];

  const runQuery = (field) =>
    getDocs(query(
      collection(db, "users"),
      orderBy(field),
      where(field, ">=", qText),
      where(field, "<=", qText + "\uf8ff"),
      limit(maxResults)
    ));

  const [nameSnap, emailSnap] = await Promise.all([
    runQuery("nameLower"),
    runQuery("emailLower")
  ]);

  const results = new Map();
  [...nameSnap.docs, ...emailSnap.docs].forEach(d => {
    results.set(d.id, { id: d.id, ...d.data() });
  });

  return Array.from(results.values()).slice(0, maxResults);
}

/**
 * Updates user profile by admin.
 */
export async function updateUserByAdmin(adminProfile, userId, patch) {
  requirePermission(adminProfile, "editUsers");

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");

  const oldData = snap.data();
  if (oldData.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    throw new Error("Cannot modify Super Admin");
  }

  const cleanPatch = { ...patch, updatedAt: serverTimestamp() };
  if (patch.name) cleanPatch.nameLower = patch.name.toLowerCase();
  if (patch.email) cleanPatch.emailLower = patch.email.toLowerCase();

  await updateDoc(ref, cleanPatch);
  await createAdminLog(adminProfile, {
    actionType: "update_user",
    targetUserId: userId,
    targetCollection: "users",
    oldData,
    newData: cleanPatch
  });
}

/**
 * Suspends or activates a user.
 */
export async function setUserSuspended(adminProfile, userId, suspended) {
  requirePermission(adminProfile, "suspendUsers");
  await updateUserByAdmin(adminProfile, userId, {
    status: suspended ? "suspended" : "approved",
  });
}

/**
 * Deletes a user permanently.
 */
export async function deleteUserByAdmin(adminProfile, userId) {
  requirePermission(adminProfile, "deleteUsers");

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  if (snap.data().email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    throw new Error("Cannot delete Super Admin");
  }

  await deleteDoc(ref);
  await createAdminLog(adminProfile, {
    actionType: "delete_user",
    targetUserId: userId,
    targetCollection: "users",
    oldData: snap.data()
  });
}

/**
 * Approves a payment request and activates the subscription.
 */
export async function approvePaymentRequest(adminProfile, requestId) {
  requirePermission(adminProfile, "approvePayments");

  const requestRef = doc(db, "paymentRequests", requestId);

  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists()) throw new Error("Request not found");

    const requestData = requestSnap.data();
    if (requestData.status === "approved") return;

    const userId = requestData.uid || requestData.userId;
    const userRef = doc(db, "users", userId);

    const plan = requestData.selectedPlan || "yearly";
    const startDate = new Date();
    const isPermanent = plan === "lifetime" || plan === "qs_premium";
    const endDate = isPermanent ? null : computePlanEndDate(plan, startDate);

    const subPatch = {
      plan,
      subscriptionStatus: "active",
      subscriptionStartedAt: serverTimestamp(),
      subscriptionEndsAt: endDate || null,
      isPaid: true,
      subscriptionType: plan,
      paymentDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rejectionReason: "", // Clear any previous rejection
    };

    transaction.update(requestRef, {
      status: "approved",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminProfile.email
    });

    transaction.update(userRef, subPatch);

    const newSubRef = doc(collection(db, "subscriptions"));
    transaction.set(newSubRef, {
      uid: userId,
      plan,
      status: "active",
      startedAt: serverTimestamp(),
      endsAt: endDate || null,
      paymentRequestId: requestId,
      createdAt: serverTimestamp(),
    });
  });

  await createAdminLog(adminProfile, {
    actionType: "approve_payment",
    targetUserId: requestId,
    targetCollection: "paymentRequests"
  });
}

/**
 * Rejects a payment request.
 */
export async function rejectPaymentRequest(adminProfile, requestId, reason) {
  requirePermission(adminProfile, "approvePayments");

  const ref = doc(db, "paymentRequests", requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Request not found");

  const update = {
    status: "rejected",
    rejectionReason: reason || "Rejected by admin",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminProfile.email
  };

  await updateDoc(ref, update);

  const userId = snap.data().uid || snap.data().userId;
  if (userId) {
    await updateDoc(doc(db, "users", userId), {
      subscriptionStatus: "rejected",
      rejectionReason: reason || "Payment rejected",
      updatedAt: serverTimestamp()
    });
  }

  await createAdminLog(adminProfile, {
    actionType: "reject_payment",
    targetUserId: requestId,
    targetCollection: "paymentRequests",
    newData: update
  });
}

/**
 * Lists payment requests.
 */
export async function listPaymentRequests({ pageSize = 20 } = {}) {
  const q = query(collection(db, "paymentRequests"), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Manages admin roles and permissions.
 */
export async function upsertLimitedAdmin(adminProfile, { targetUid, permissions }) {
  if (adminProfile.adminType !== "super" && adminProfile.email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Only Super Admin can manage admins");
  }

  const ref = doc(db, "users", targetUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");

  if (snap.data().email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    throw new Error("Cannot modify Super Admin status");
  }

  const update = {
    role: "admin",
    adminType: "limited",
    permissions: normalizePermissions(permissions),
    updatedAt: serverTimestamp()
  };

  await updateDoc(ref, update);
  await createAdminLog(adminProfile, {
    actionType: "upsert_admin",
    targetUserId: targetUid,
    targetCollection: "users",
    newData: update
  });
}

export async function removeAdmin(adminProfile, targetUid) {
  if (adminProfile.adminType !== "super" && adminProfile.email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Only Super Admin can manage admins");
  }
  const ref = doc(db, "users", targetUid);
  await updateDoc(ref, {
    role: "user",
    adminType: "none",
    permissions: {},
    updatedAt: serverTimestamp()
  });
}

/**
 * Lists all admin users.
 */
export async function listAdmins() {
  const q = query(collection(db, "users"), where("role", "==", "admin"), orderBy("email", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Seeds an admin user by email if they exist in the users collection.
 */
export async function seedAdminUsersByEmail(adminProfile, email, permissions = {}) {
  const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error("No user found with this email. They must register first.");
  }
  const target = snap.docs[0];
  await upsertLimitedAdmin(adminProfile, {
    targetUid: target.id,
    permissions,
  });
}

/**
 * Lists admin audit logs.
 */
export async function listAdminLogs({ pageSize = 50 } = {}) {
  const q = query(collection(db, "adminLogs"), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Ad Management
 */
export function listenAdBanner(onValue, slotId) {
  const ref = doc(db, "ads", slotId);
  return onSnapshot(ref, (snapshot) => {
    onValue(snapshot.exists() ? snapshot.data() : { enabled: false });
  });
}

export async function saveAdBanner(adminProfile, patch, slotId) {
  requirePermission(adminProfile, "approvePayments");
  const ref = doc(db, "ads", slotId);
  await setDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
    updatedBy: adminProfile.email,
  }, { merge: true });
}

export function listenPaymentSettings(onValue) {
  const ref = doc(db, "paymentSettings", "main");
  return onSnapshot(ref, (snapshot) => {
    onValue(snapshot.exists() ? snapshot.data() : {});
  });
}

export async function savePaymentSettings(adminProfile, patch) {
  requirePermission(adminProfile, "approvePayments");
  const ref = doc(db, "paymentSettings", "main");
  await setDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
    updatedBy: adminProfile.email,
  }, { merge: true });
}

export async function adminRevokeSubscription(adminProfile, userId) {
  requirePermission(adminProfile, "approvePayments");
  await updateDoc(doc(db, "users", userId), {
    isPaid: false,
    subscriptionStatus: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function adminRestoreSubscription(adminProfile, userId) {
  requirePermission(adminProfile, "approvePayments");
  await updateDoc(doc(db, "users", userId), {
    isPaid: true,
    subscriptionStatus: "active",
    plan: "lifetime",
    updatedAt: serverTimestamp(),
  });
}

export function listenActiveSubscriptions(callback) {
  const q = query(collection(db, "users"), where("subscriptionStatus", "==", "active"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

/**
 * Subscription Cancellation Requests
 */
export function listenCancellationRequests(callback) {
  const q = query(collection(db, "users"), where("cancellationRequest.status", "==", "pending"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function adminApproveCancellation(adminProfile, userId) {
  requirePermission(adminProfile, "approvePayments");
  await updateDoc(doc(db, "users", userId), {
    isPaid: false,
    subscriptionStatus: "cancelled",
    "cancellationRequest.status": "approved",
    "cancellationRequest.resolvedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function adminRejectCancellation(adminProfile, userId) {
  requirePermission(adminProfile, "approvePayments");
  await updateDoc(doc(db, "users", userId), {
    "cancellationRequest.status": "rejected",
    "cancellationRequest.resolvedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Account Deletion Requests
 */
export function listenDeletionRequests(callback) {
  const q = query(collection(db, "users"), where("deletionRequest.status", "==", "pending"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function adminApproveAccountDeletion(adminProfile, userId) {
  requirePermission(adminProfile, "deleteUsers");
  await updateDoc(doc(db, "users", userId), {
    "deletionRequest.status": "approved",
    "deletionRequest.resolvedAt": serverTimestamp(),
    status: "deleted",
    updatedAt: serverTimestamp(),
  });
}

export async function adminRejectAccountDeletion(adminProfile, userId) {
  requirePermission(adminProfile, "deleteUsers");
  await updateDoc(doc(db, "users", userId), {
    "deletionRequest.status": "rejected",
    "deletionRequest.resolvedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

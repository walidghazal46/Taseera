import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { normalizePermissions, SUPER_ADMIN_EMAIL } from "../constants/admin";

function isSuperAdmin(adminProfile) {
  return adminProfile?.email?.toLowerCase() === SUPER_ADMIN_EMAIL || adminProfile?.adminType === "super";
}

export function hasPermission(adminProfile, key) {
  if (!adminProfile) return false;
  if (isSuperAdmin(adminProfile)) return true;
  return adminProfile?.role === "admin" && adminProfile?.permissions?.[key] === true;
}

export function requirePermission(adminProfile, key) {
  if (!hasPermission(adminProfile, key)) {
    throw new Error("You do not have permission for this action.");
  }
}

async function createAdminLog(adminProfile, payload) {
  await addDoc(collection(db, "adminLogs"), {
    adminId: adminProfile?.uid || "",
    adminEmail: adminProfile?.email || "",
    actionType: payload.actionType,
    targetUserId: payload.targetUserId || null,
    targetCollection: payload.targetCollection || null,
    oldData: payload.oldData || null,
    newData: payload.newData || null,
    metadata: payload.metadata || null,
    createdAt: serverTimestamp(),
  });
}

async function assertNotSuperAdminTarget(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const email = String(snap.data()?.email || "").toLowerCase();
  if (email === SUPER_ADMIN_EMAIL) {
    throw new Error("Super Admin account is protected and cannot be modified from user actions.");
  }
}

export async function getDashboardStats() {
  const usersRef = collection(db, "users");
  const paymentRef = collection(db, "paymentRequests");

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(dayStart);
  weekStart.setDate(dayStart.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    paidUsers,
    pendingRequests,
    newToday,
    newWeek,
    newMonth,
  ] = await Promise.all([
    getCountFromServer(query(usersRef)),
    getCountFromServer(query(usersRef, where("status", "==", "approved"))),
    getCountFromServer(query(usersRef, where("status", "==", "suspended"))),
    getCountFromServer(query(usersRef, where("isPaid", "==", true))),
    getCountFromServer(query(paymentRef, where("requestStatus", "==", "pending_review"))),
    getCountFromServer(query(usersRef, where("createdAt", ">=", dayStart))),
    getCountFromServer(query(usersRef, where("createdAt", ">=", weekStart))),
    getCountFromServer(query(usersRef, where("createdAt", ">=", monthStart))),
  ]);

  return {
    totalUsers: totalUsers.data().count,
    activeUsers: activeUsers.data().count,
    suspendedUsers: suspendedUsers.data().count,
    paidUsers: paidUsers.data().count,
    pendingRequests: pendingRequests.data().count,
    newToday: newToday.data().count,
    newWeek: newWeek.data().count,
    newMonth: newMonth.data().count,
  };
}

export async function listUsersPage({ pageSize = 12, cursor = null, status = "all", paid = "all" } = {}) {
  let constraints = [orderBy("createdAt", "desc"), limit(pageSize)];

  if (status !== "all") {
    constraints = [where("status", "==", status), ...constraints];
  }
  if (paid === "paid") {
    constraints = [where("isPaid", "==", true), ...constraints];
  } else if (paid === "unpaid") {
    constraints = [where("isPaid", "==", false), ...constraints];
  }

  if (cursor) constraints.push(startAfter(cursor));

  const q = query(collection(db, "users"), ...constraints);
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    rows,
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize,
  };
}

export async function searchUsersGlobal(searchText, pageSize = 40) {
  const q = (searchText || "").trim().toLowerCase();
  if (!q || q.length < 2) {
    return [];
  }

  const runPrefixQuery = (field) =>
    getDocs(
      query(
        collection(db, "users"),
        orderBy(field, "asc"),
        where(field, ">=", q),
        where(field, "<=", `${q}\uf8ff`),
        limit(pageSize)
      )
    );

  const [nameSnap, emailSnap, phoneSnap] = await Promise.all([
    runPrefixQuery("nameLower"),
    runPrefixQuery("emailLower"),
    runPrefixQuery("phoneLower"),
  ]);

  const merged = new Map();
  [nameSnap, emailSnap, phoneSnap].forEach((snap) => {
    snap.docs.forEach((docSnap) => {
      if (!merged.has(docSnap.id)) {
        merged.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      }
    });
  });

  return Array.from(merged.values())
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    })
    .slice(0, pageSize);
}

function enrichUserPatch(patch = {}) {
  const next = { ...patch };
  if (Object.prototype.hasOwnProperty.call(patch, "name")) {
    next.nameLower = String(patch.name || "").trim().toLowerCase();
  }
  if (Object.prototype.hasOwnProperty.call(patch, "email")) {
    next.emailLower = String(patch.email || "").trim().toLowerCase();
  }
  if (Object.prototype.hasOwnProperty.call(patch, "phone")) {
    next.phoneLower = String(patch.phone || "").trim().toLowerCase();
  }
  return next;
}

export async function updateUserByAdmin(adminProfile, userId, patch) {
  requirePermission(adminProfile, "editUsers");
  await assertNotSuperAdminTarget(userId);

  const ref = doc(db, "users", userId);
  const currentSnap = await getDoc(ref);
  const before = currentSnap.exists() ? currentSnap.data() : null;

  const enrichedPatch = enrichUserPatch(patch);

  await updateDoc(ref, {
    ...enrichedPatch,
    updatedAt: serverTimestamp(),
  });

  await createAdminLog(adminProfile, {
    actionType: "edit_user",
    targetUserId: userId,
    targetCollection: "users",
    oldData: before,
    newData: enrichedPatch,
  });
}

export async function setUserSuspended(adminProfile, userId, suspended) {
  requirePermission(adminProfile, "suspendUsers");
  return updateUserByAdmin(adminProfile, userId, {
    status: suspended ? "suspended" : "approved",
  });
}

export async function deleteUserByAdmin(adminProfile, userId) {
  requirePermission(adminProfile, "deleteUsers");
  await assertNotSuperAdminTarget(userId);

  const ref = doc(db, "users", userId);
  const currentSnap = await getDoc(ref);
  const before = currentSnap.exists() ? currentSnap.data() : null;

  await deleteDoc(ref);

  await createAdminLog(adminProfile, {
    actionType: "delete_user",
    targetUserId: userId,
    targetCollection: "users",
    oldData: before,
  });
}

export async function listPaymentRequests({ pageSize = 20, onlyPending = false } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (onlyPending) constraints.unshift(where("requestStatus", "==", "pending_review"));

  const q = query(collection(db, "paymentRequests"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function approvePaymentRequest(adminProfile, requestId) {
  requirePermission(adminProfile, "approvePayments");

  const requestRef = doc(db, "paymentRequests", requestId);

  await runTransaction(db, async (tx) => {
    const reqSnap = await tx.get(requestRef);
    if (!reqSnap.exists()) throw new Error("Payment request not found.");

    const data = reqSnap.data();
    const userRef = doc(db, "users", data.userId);
    const userSnap = await tx.get(userRef);

    tx.update(requestRef, {
      paymentStatus: "approved",
      requestStatus: "approved",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminProfile.uid,
      adminNote: "Payment verified and subscription activated.",
      rejectionReason: null,
    });

    if (userSnap.exists()) {
      tx.update(userRef, {
        status: "approved",
        isPaid: true,
        subscriptionType: "full_access",
        paymentDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  await createAdminLog(adminProfile, {
    actionType: "approve_payment",
    targetUserId: requestId,
    targetCollection: "paymentRequests",
    newData: { requestStatus: "approved", paymentStatus: "approved" },
  });
}

export async function rejectPaymentRequest(adminProfile, requestId, reason) {
  requirePermission(adminProfile, "approvePayments");

  const requestRef = doc(db, "paymentRequests", requestId);

  await runTransaction(db, async (tx) => {
    const reqSnap = await tx.get(requestRef);
    if (!reqSnap.exists()) throw new Error("Payment request not found.");
    const data = reqSnap.data();

    tx.update(requestRef, {
      paymentStatus: "rejected",
      requestStatus: "rejected",
      reviewedAt: serverTimestamp(),
      reviewedBy: adminProfile.uid,
      adminNote: reason || "Payment proof is not valid.",
      rejectionReason: reason || "No reason provided",
    });

    if (data.userId) {
      const userRef = doc(db, "users", data.userId);
      const userSnap = await tx.get(userRef);
      if (userSnap.exists()) {
        tx.update(userRef, {
          status: "rejected",
          isPaid: false,
          subscriptionType: "free",
          updatedAt: serverTimestamp(),
        });
      }
    }
  });

  await createAdminLog(adminProfile, {
    actionType: "reject_payment",
    targetUserId: requestId,
    targetCollection: "paymentRequests",
    newData: { requestStatus: "rejected", reason: reason || "No reason provided" },
  });
}

export async function listAdmins() {
  const q = query(collection(db, "users"), where("role", "==", "admin"), orderBy("email", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), permissions: normalizePermissions(d.data().permissions) }));
}

export async function upsertLimitedAdmin(adminProfile, { targetUid, permissions }) {
  if (!isSuperAdmin(adminProfile)) {
    throw new Error("Only Super Admin can manage admins.");
  }
  const normalized = normalizePermissions(permissions || {});

  const ref = doc(db, "users", targetUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Target user not found.");

  const current = snap.data();
  if ((current.email || "").toLowerCase() === SUPER_ADMIN_EMAIL) {
    throw new Error("Super Admin cannot be modified.");
  }

  await updateDoc(ref, {
    role: "admin",
    adminType: "limited",
    permissions: normalized,
    updatedAt: serverTimestamp(),
  });

  await createAdminLog(adminProfile, {
    actionType: "upsert_admin",
    targetUserId: targetUid,
    targetCollection: "users",
    oldData: current,
    newData: { role: "admin", adminType: "limited", permissions: normalized },
  });
}

export async function removeAdmin(adminProfile, targetUid) {
  if (!isSuperAdmin(adminProfile)) {
    throw new Error("Only Super Admin can manage admins.");
  }
  const ref = doc(db, "users", targetUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const current = snap.data();
  if ((current.email || "").toLowerCase() === SUPER_ADMIN_EMAIL) {
    throw new Error("Super Admin cannot be removed.");
  }

  await updateDoc(ref, {
    role: "user",
    adminType: "none",
    permissions: {},
    updatedAt: serverTimestamp(),
  });

  await createAdminLog(adminProfile, {
    actionType: "remove_admin",
    targetUserId: targetUid,
    targetCollection: "users",
    oldData: current,
    newData: { role: "user", adminType: "none", permissions: {} },
  });
}

export async function listAdminLogs({ pageSize = 40 } = {}) {
  const q = query(collection(db, "adminLogs"), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function seedAdminUsersByEmail(adminProfile, email, permissions = {}) {
  if (!isSuperAdmin(adminProfile)) {
    throw new Error("Only Super Admin can manage admins.");
  }

  const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error("No user found with this email.");
  }
  const target = snap.docs[0];
  await upsertLimitedAdmin(adminProfile, {
    targetUid: target.id,
    permissions,
  });
}

export async function bulkUpdatePermissions(adminProfile, updates = []) {
  if (!isSuperAdmin(adminProfile)) {
    throw new Error("Only Super Admin can manage admins.");
  }
  const batch = writeBatch(db);

  updates.forEach((item) => {
    const ref = doc(db, "users", item.uid);
    batch.update(ref, {
      permissions: normalizePermissions(item.permissions || {}),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

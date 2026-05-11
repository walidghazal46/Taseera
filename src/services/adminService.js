import {
  doc, updateDoc, collection, getDocs, query, orderBy,
  serverTimestamp, Timestamp, addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { PACKAGES, SUBSCRIPTION_STATUS } from "../data/packages";
import { SUPER_ADMIN_EMAIL } from "../data/packages";

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Approve a payment request and activate the user's package.
export async function approvePaymentRequest({ requestId, uid, packageId, approvedByEmail }) {
  const pkg = PACKAGES[packageId];
  if (!pkg) throw new Error("Invalid package");

  const now   = new Date();
  const start = Timestamp.fromDate(now);
  const end   = Timestamp.fromDate(addMonths(now, pkg.durationMonths));

  // Update the payment request
  await updateDoc(doc(db, "paymentRequests", requestId), {
    status:     "approved",
    approvedAt: serverTimestamp(),
    approvedBy: approvedByEmail,
    updatedAt:  serverTimestamp(),
  });

  // Activate the user's subscription
  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    selectedPackage:    packageId,
    packageStartDate:   start,
    packageEndDate:     end,
    isPaid:             true,
    isActive:           true,
    updatedAt:          serverTimestamp(),
  });

  // Write admin log
  await addDoc(collection(db, "adminLogs"), {
    action:     "approve_payment",
    requestId,
    uid,
    packageId,
    performedBy: approvedByEmail,
    createdAt:   serverTimestamp(),
  });
}

// Reject a payment request.
export async function rejectPaymentRequest({ requestId, uid, rejectionReason, rejectedByEmail }) {
  await updateDoc(doc(db, "paymentRequests", requestId), {
    status:          "rejected",
    rejectionReason: rejectionReason || "",
    updatedAt:       serverTimestamp(),
  });

  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: SUBSCRIPTION_STATUS.REJECTED,
    updatedAt:          serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:      "reject_payment",
    requestId,
    uid,
    reason:      rejectionReason || "",
    performedBy: rejectedByEmail,
    createdAt:   serverTimestamp(),
  });
}

// Suspend a user account.
export async function suspendUser({ uid, performedByEmail }) {
  await updateDoc(doc(db, "users", uid), {
    isActive:           false,
    subscriptionStatus: SUBSCRIPTION_STATUS.SUSPENDED,
    updatedAt:          serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "suspend_user",
    uid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Re-activate a suspended user.
export async function unsuspendUser({ uid, performedByEmail }) {
  await updateDoc(doc(db, "users", uid), {
    isActive:  true,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "unsuspend_user",
    uid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Assign admin role — only callable by Super Admin.
export async function assignAdminRole({ targetUid, adminType, permissions, performedByEmail }) {
  if (performedByEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Only the Super Admin can assign admin roles.");
  }

  await updateDoc(doc(db, "users", targetUid), {
    role:        "admin",
    adminType:   adminType || "standard",
    permissions: permissions || [],
    updatedAt:   serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "assign_admin",
    targetUid,
    adminType,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Remove admin role — only callable by Super Admin.
export async function removeAdminRole({ targetUid, performedByEmail }) {
  if (performedByEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Only the Super Admin can remove admin roles.");
  }

  await updateDoc(doc(db, "users", targetUid), {
    role:        "user",
    adminType:   null,
    permissions: [],
    updatedAt:   serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "remove_admin",
    targetUid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Cancel / revoke an active subscription.
export async function cancelSubscription({ uid, performedByEmail }) {
  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED,
    isPaid:             false,
    selectedPackage:    null,
    packageStartDate:   null,
    packageEndDate:     null,
    updatedAt:          serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "cancel_subscription",
    uid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Extend a user's subscription by N extra months from today (or from current end if still active).
export async function extendSubscription({ uid, months, performedByEmail }) {
  const snap = await import("firebase/firestore").then(({ getDoc }) => getDoc(doc(db, "users", uid)));
  const data = snap.data() || {};
  const base = data.packageEndDate?.toDate?.() || new Date();
  const now  = new Date();
  const from = base > now ? base : now;
  const newEnd = Timestamp.fromDate(addMonths(from, months));

  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    packageEndDate:     newEnd,
    isPaid:             true,
    isActive:           true,
    updatedAt:          serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "extend_subscription",
    uid,
    months,
    newEnd:     newEnd.toDate().toISOString(),
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Submit a delete-account request from the user side.
export async function submitDeleteRequest({ uid, email }) {
  await addDoc(collection(db, "deleteRequests"), {
    uid,
    email,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

// Fetch all delete requests (admin).
export async function getAllDeleteRequests() {
  const q    = query(collection(db, "deleteRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Approve a delete request: remove Firestore profile + mark request resolved.
export async function approveDeleteRequest({ requestId, uid, performedByEmail }) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", uid));
  await deleteDoc(doc(db, "deleteRequests", requestId));

  await addDoc(collection(db, "adminLogs"), {
    action:     "approve_delete_request",
    requestId,
    uid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Reject a delete request.
export async function rejectDeleteRequest({ requestId, performedByEmail }) {
  await updateDoc(doc(db, "deleteRequests", requestId), {
    status:    "rejected",
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "adminLogs"), {
    action:     "reject_delete_request",
    requestId,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Dismiss (delete) a delete request without action.
export async function dismissDeleteRequest({ requestId }) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "deleteRequests", requestId));
}

// Delete a user's Firestore profile (Admin SDK needed to remove Auth account).
export async function deleteUserProfile({ uid, performedByEmail }) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", uid));

  await addDoc(collection(db, "adminLogs"), {
    action:     "delete_user",
    uid,
    performedBy: performedByEmail,
    createdAt:  serverTimestamp(),
  });
}

// Fetch all users (admin).
export async function getAllUsers() {
  const q    = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

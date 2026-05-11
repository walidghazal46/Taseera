import {
  collection, addDoc, query, where, orderBy, getDocs,
  updateDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { PACKAGES, SUBSCRIPTION_STATUS } from "../data/packages";

// Create a new payment request and mark user as pending_payment.
export async function createPaymentRequest({ uid, userEmail, packageId, paymentMethod, proofUrl }) {
  const pkg = PACKAGES[packageId];
  if (!pkg) throw new Error("Invalid package");

  const payload = {
    uid,
    userId:          uid,
    userCode:        userEmail,
    userEmail,
    selectedPlan:    packageId,
    packageId,
    packageName:     pkg.nameAr,
    packagePrice:    pkg.price,
    amount:          pkg.price,
    packageDuration: pkg.durationMonths,
    currency:        "SAR",
    paymentMethod:   paymentMethod || "bank_transfer",
    proofUrl:        proofUrl || null,
    status:          "pending",
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "paymentRequests"), payload);

  // Update user status so they see the "pending review" screen immediately.
  try {
    await updateDoc(doc(db, "users", uid), {
      subscriptionStatus: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
      updatedAt: serverTimestamp(),
    });
  } catch {}

  return ref.id;
}

// User submits a cancellation request — admin must approve before subscription is cancelled.
export async function submitCancellationRequest({ uid, userEmail }) {
  await addDoc(collection(db, "cancellationRequests"), {
    uid,
    email:     userEmail,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid), {
    subscriptionStatus: SUBSCRIPTION_STATUS.PENDING_CANCELLATION,
    updatedAt:          serverTimestamp(),
  });
}

// Fetch all payment requests for a specific user.
export async function getUserPaymentRequests(uid) {
  const q = query(
    collection(db, "paymentRequests"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fetch all payment requests (admin).
export async function getAllPaymentRequests() {
  const q = query(
    collection(db, "paymentRequests"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fetch pending payment requests (admin).
export async function getPendingPaymentRequests() {
  const q = query(
    collection(db, "paymentRequests"),
    where("requestStatus", "==", "pending"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

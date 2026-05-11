import {
  collection, addDoc, query, where, orderBy, getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { PACKAGES } from "../data/packages";

// Create a new payment request (user side).
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
  return ref.id;
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

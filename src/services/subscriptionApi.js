import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { hasPermission } from "./adminApi";

const ADMIN_EMAIL = "walidghazal46@gmail.com";

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

export const AD_SLOT_IDS = {
  analysisPreResult: "item_analysis_bottom_banner",
  analysisPostResult: "item_analysis_after_result_banner",
  areaFormAfterCard: "area_form_after_card_banner",
  areaResultsAfterNote: "area_results_after_note_banner",
  companiesAfterPagination: "companies_after_pagination_banner",
  suppliersAfterPagination: "suppliers_after_pagination_banner",
};

function formatOrderId(year, seq) {
  return `ORD-${year}-${String(seq).padStart(4, "0")}`;
}

function formatUserSerial(seq) {
  return `USR-${String(seq).padStart(6, "0")}`;
}

async function reserveOrderAndSerial(uid) {
  const year = new Date().getFullYear();
  const orderCounterRef = doc(db, "systemCounters", `orders_${year}`);
  const serialCounterRef = doc(db, "systemCounters", "userSerial");
  const userRef = doc(db, "users", uid);

  return runTransaction(db, async (tx) => {
    // All reads must happen before any writes in a Firestore transaction
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      throw new Error("User profile not found.");
    }
    const userData = userSnap.data() || {};

    const orderCounterSnap = await tx.get(orderCounterRef);
    const serialCounterSnap = await tx.get(serialCounterRef);

    // Now do all writes
    const nextOrderSeq = Number(orderCounterSnap.data()?.seq || 0) + 1;
    tx.set(orderCounterRef, { seq: nextOrderSeq, updatedAt: serverTimestamp() }, { merge: true });
    const orderId = formatOrderId(year, nextOrderSeq);

    let userSerial = userData.userSerial;
    if (!userSerial) {
      const nextSerialSeq = Number(serialCounterSnap.data()?.seq || 0) + 1;
      tx.set(serialCounterRef, { seq: nextSerialSeq, updatedAt: serverTimestamp() }, { merge: true });
      userSerial = formatUserSerial(nextSerialSeq);
      tx.update(userRef, {
        userSerial,
        updatedAt: serverTimestamp(),
      });
    }

    return { orderId, userSerial };
  });
}

export function listenPaymentSettings(onValue) {
  const ref = doc(db, "paymentSettings", "main");
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      onValue({ ...DEFAULT_PAYMENT_SETTINGS });
      return;
    }
    onValue({ ...DEFAULT_PAYMENT_SETTINGS, ...snapshot.data() });
  });
}

export function listenAdBanner(onValue, slotId = AD_SLOT_IDS.analysisPreResult) {
  const ref = doc(db, "ads", slotId);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      onValue({ ...DEFAULT_AD_BANNER });
      return;
    }
    onValue({ ...DEFAULT_AD_BANNER, ...snapshot.data() });
  });
}

export async function savePaymentSettings(adminProfile, patch) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("You do not have permission to update payment settings.");
  }

  const ref = doc(db, "paymentSettings", "main");
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedBy: adminProfile?.uid || "",
      updatedByEmail: adminProfile?.email || "",
    },
    { merge: true }
  );
}

export async function saveAdBanner(adminProfile, patch, slotId = AD_SLOT_IDS.analysisPreResult) {
  if (!hasPermission(adminProfile, "approvePayments")) {
    throw new Error("You do not have permission to update ads settings.");
  }

  const ref = doc(db, "ads", slotId);
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedBy: adminProfile?.uid || "",
      updatedByEmail: adminProfile?.email || "",
    },
    { merge: true }
  );
}

export async function createPaymentRequest({
  uid,
  userName,
  email,
  paymentMethod,
  paymentReference,
  amount,
  currency,
  country,
  note,
}) {
  if (!uid) {
    throw new Error("Sign-in is required before submitting a payment request.");
  }

  // Reserve order ID and serial
  const { orderId, userSerial } = await reserveOrderAndSerial(uid);

  // Create payload for Firestore
  const payload = {
    userId: uid,
    userSerial,
    userName: userName || "",
    email: (email || "").toLowerCase(),
    amount: Number(amount) || 100,
    currency: currency || "SAR",
    country: country || "",
    paymentMethod: paymentMethod || "",
    paymentReference: paymentReference || "",
    note: note || "",
    orderId,
    subscriptionType: "full_access",
    requestStatus: "pending_review",
    paymentStatus: "awaiting_manual_receipt",
    adminNote: "",
    rejectionReason: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Save to Firestore
  const ref = await addDoc(collection(db, "paymentRequests"), payload);

  // Return data for mailto link
  const mailtoBody = `
طلب دفع جديد

رقم الطلب: ${orderId}
الاسم: ${userName}
البريد: ${email}
المبلغ: ${amount} ${currency}
طريقة الدفع: ${paymentMethod}
مرجع التحويل: ${paymentReference}
البلد: ${country || "غير محدد"}
ملاحظات: ${note || "بدون ملاحظات"}

---
يرجى إرفاق الإيصال الأصلي (Receipt) مع الرد على هذا الإيميل
  `;

  return {
    id: ref.id,
    orderId,
    userSerial,
    mailtoLink: `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(`طلب دفع #${orderId} - ${userName}`)}&body=${encodeURIComponent(mailtoBody)}`,
  };
}

export async function listMyPaymentRequests(uid) {
  if (!uid) return [];
  const q = query(
    collection(db, "paymentRequests"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function incrementUsageCounter(uid, counterField) {
  if (!uid || !counterField) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    [counterField]: increment(1),
    updatedAt: serverTimestamp(),
  });
}

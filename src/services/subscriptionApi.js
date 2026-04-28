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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";
import { hasPermission } from "./adminApi";

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

function sanitizeFileName(name = "receipt") {
  return String(name)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 90);
}

function uploadReceiptFile({ uid, orderId, file, onProgress }) {
  return new Promise((resolve, reject) => {
    const safeName = sanitizeFileName(file?.name || "receipt");
    const receiptPath = `paymentReceipts/${uid}/${orderId}-${Date.now()}-${safeName}`;
    const receiptRef = ref(storage, receiptPath);

    const task = uploadBytesResumable(receiptRef, file, {
      contentType: file?.type || "application/octet-stream",
      customMetadata: {
        uid,
        orderId,
      },
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        try {
          const receiptUrl = await getDownloadURL(task.snapshot.ref);
          resolve({ receiptUrl, receiptPath });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

async function reserveOrderAndSerial(uid) {
  const year = new Date().getFullYear();
  const orderCounterRef = doc(db, "systemCounters", `orders_${year}`);
  const serialCounterRef = doc(db, "systemCounters", "userSerial");
  const userRef = doc(db, "users", uid);

  return runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      throw new Error("User profile not found.");
    }

    const userData = userSnap.data() || {};

    const orderCounterSnap = await tx.get(orderCounterRef);
    const nextOrderSeq = Number(orderCounterSnap.data()?.seq || 0) + 1;
    tx.set(orderCounterRef, { seq: nextOrderSeq, updatedAt: serverTimestamp() }, { merge: true });
    const orderId = formatOrderId(year, nextOrderSeq);

    let userSerial = userData.userSerial;
    if (!userSerial) {
      const serialCounterSnap = await tx.get(serialCounterRef);
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
  receiptFile,
  amount,
  currency,
  country,
  note,
  onProgress,
}) {
  if (!uid) {
    throw new Error("Sign-in is required before submitting a payment request.");
  }
  if (!receiptFile) {
    throw new Error("Receipt image/file is required before submitting the request.");
  }

  const { orderId, userSerial } = await reserveOrderAndSerial(uid);
  onProgress?.(5);

  const { receiptUrl, receiptPath } = await uploadReceiptFile({
    uid,
    orderId,
    file: receiptFile,
    onProgress: (value) => onProgress?.(Math.max(10, Math.min(85, value))),
  });

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
    receiptUrl,
    receiptPath,
    subscriptionType: "full_access",
    requestStatus: "pending_review",
    paymentStatus: "submitted_manual_receipt",
    adminNote: "",
    rejectionReason: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  onProgress?.(92);
  const ref = await addDoc(collection(db, "paymentRequests"), payload);
  onProgress?.(100);
  return { id: ref.id, orderId: payload.orderId, userSerial };
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

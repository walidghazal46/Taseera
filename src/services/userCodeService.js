import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function ensureUserCode(uid) {
  if (!uid) return "";

  const year = new Date().getFullYear();
  const userRef = doc(db, "users", uid);
  const counterRef = doc(db, "systemCounters", `user_codes_${year}`);

  return runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      throw new Error("User profile not found.");
    }

    const userData = userSnap.data() || {};
    if (userData.userCode) {
      return userData.userCode;
    }

    const counterSnap = await tx.get(counterRef);
    const nextSeq = Number(counterSnap.data()?.seq || 0) + 1;
    const userCode = `TSR-${year}-${String(nextSeq).padStart(6, "0")}`;

    tx.set(counterRef, { seq: nextSeq, updatedAt: serverTimestamp() }, { merge: true });
    tx.update(userRef, {
      userCode,
      updatedAt: serverTimestamp(),
    });

    return userCode;
  });
}

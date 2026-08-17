import {
  collection, addDoc, query, where,
  onSnapshot, updateDoc, doc, getDocs, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";

export function subscribeToNotifications(uid, callback) {
  // No orderBy — avoids composite index requirement. Sort client-side.
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid)
  );
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort newest first using createdAt (Timestamp or null)
    docs.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    callback(docs);
  }, (err) => { console.error("notifications error:", err); callback([]); });
}

export async function createNotification({ uid, type, titleAr, titleEn, bodyAr, bodyEn }) {
  return addDoc(collection(db, "notifications"), {
    uid, type,
    titleAr: titleAr || "",
    titleEn: titleEn || "",
    bodyAr: bodyAr || "",
    bodyEn: bodyEn || "",
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

export async function markAllRead(uid) {
  // Single where clause avoids composite index; filter unread client-side.
  const q = query(collection(db, "notifications"), where("uid", "==", uid));
  const snap = await getDocs(q);
  const unread = snap.docs.filter((d) => d.data().read === false);
  await Promise.all(unread.map((d) => updateDoc(d.ref, { read: true })));
}

export async function deleteNotification(notificationId) {
  await deleteDoc(doc(db, "notifications", notificationId));
}

export async function deleteAllNotifications(uid) {
  const q = query(collection(db, "notifications"), where("uid", "==", uid));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// Admin: send a broadcast or targeted push message to one or more users.
export async function sendAdminMessage({ uids, titleAr, titleEn, bodyAr, bodyEn }) {
  try {
    const callable = httpsCallable(functions, "sendAdminMessage");
    const result = await callable({ uids, titleAr, titleEn, bodyAr, bodyEn });
    return result.data;
  } catch (error) {
    if (!uids?.length) throw error;
    await Promise.all(
      uids.map((uid) =>
        createNotification({ uid, type: "admin_message", titleAr, titleEn, bodyAr, bodyEn })
      )
    );
    return { notificationCount: uids.length, pushCount: 0, pushSkipped: true };
  }
}

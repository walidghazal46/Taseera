import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, updateDoc, doc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function subscribeToNotifications(uid, callback) {
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
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
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

// Admin: send a broadcast or targeted message to one or more users.
export async function sendAdminMessage({ uids, titleAr, titleEn, bodyAr, bodyEn }) {
  await Promise.all(
    uids.map((uid) =>
      createNotification({ uid, type: "admin_message", titleAr, titleEn, bodyAr, bodyEn })
    )
  );
}

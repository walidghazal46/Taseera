import { getDoc, doc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../firebase";
import { LEGACY_AUTH_USERS } from "../data/legacyAuthUsers";
import { buildDefaultUserFields, ensureUserDocument } from "./subscriptionService";

const SUPER_ADMIN_EMAIL = "walidghazal46@gmail.com";

function inferDisplayName(email = "") {
  return String(email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || "User";
}

async function syncLegacyUsersFallback() {
  const currentEmail = String(auth.currentUser?.email || "").trim().toLowerCase();
  if (currentEmail !== SUPER_ADMIN_EMAIL) {
    throw new Error("Only Super Admin can run legacy user sync.");
  }

  let processed = 0;
  let created = 0;
  let skipped = 0;

  for (const legacyUser of LEGACY_AUTH_USERS) {
    processed += 1;
    const userRef = doc(db, "users", legacyUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      skipped += 1;
      continue;
    }

    const defaultFields = buildDefaultUserFields({
      uid: legacyUser.uid,
      email: legacyUser.email,
      name: inferDisplayName(legacyUser.email),
      role: legacyUser.email.toLowerCase() === SUPER_ADMIN_EMAIL ? "admin" : "user",
      adminType: legacyUser.email.toLowerCase() === SUPER_ADMIN_EMAIL ? "super" : "none",
      permissions:
        legacyUser.email.toLowerCase() === SUPER_ADMIN_EMAIL
          ? {
              approvePayments: true,
              deleteUsers: true,
              editUsers: true,
              suspendUsers: true,
              viewLogs: true,
            }
          : {},
      accountType: "user",
      status: "approved",
    });

    await ensureUserDocument(legacyUser.uid, defaultFields);
    created += 1;
  }

  return { ok: true, processed, created, skipped, source: "legacy_fallback" };
}

export async function syncMissingAuthUsers() {
  try {
    const callable = httpsCallable(functions, "syncMissingAuthUsers");
    const result = await callable({});
    return result?.data || { ok: false, created: 0, skipped: 0, processed: 0 };
  } catch (_error) {
    return syncLegacyUsersFallback();
  }
}

const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

setGlobalOptions({maxInstances: 10});

admin.initializeApp();

const SUPER_ADMIN_EMAIL = "walidghazal46@gmail.com";

async function assertAdmin(auth) {
  if (!auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in is required.");
  }

  const email = auth.token?.email || "";
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return {uid: auth.uid, email, superAdmin: true};
  }

  const userSnap = await admin.firestore().collection("users").doc(auth.uid).get();
  const user = userSnap.data() || {};
  if (user.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access is required.");
  }

  return {uid: auth.uid, email, superAdmin: false};
}

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

async function resolveTargets(uids) {
  const cleanUids = [...new Set((Array.isArray(uids) ? uids : []).filter(Boolean))];
  if (!cleanUids.length) {
    throw new HttpsError("invalid-argument", "No target users.");
  }

  const refs = cleanUids.map((uid) => admin.firestore().collection("users").doc(uid));
  const snaps = await admin.firestore().getAll(...refs);
  return snaps
      .filter((snap) => snap.exists)
      .map((snap) => ({uid: snap.id, ...(snap.data() || {})}))
      .filter((user) => user.uid || user.email);
}

async function sendPushNotifications({targets, title, body}) {
  const tokens = [...new Set(targets.flatMap((user) => {
    const list = Array.isArray(user.fcmTokens) ? user.fcmTokens : [];
    return [user.fcmToken, ...list].filter(Boolean);
  }))];

  if (!tokens.length) {
    return {pushCount: 0, pushSkipped: true};
  }

  let pushCount = 0;
  for (let i = 0; i < tokens.length; i += 500) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens.slice(i, i + 500),
      notification: {title, body},
      data: {
        type: "admin_message",
        title,
        body,
      },
      android: {
        priority: "high",
        notification: {
          channelId: "taseera_admin_messages",
          sound: "default",
        },
      },
    });
    pushCount += response.successCount;
  }

  return {pushCount, pushSkipped: false};
}

exports.sendAdminMessage = onCall(async (request) => {
  const performedBy = await assertAdmin(request.auth);
  const data = request.data || {};
  const titleAr = normalizeText(data.titleAr || data.titleEn, 180);
  const titleEn = normalizeText(data.titleEn || data.titleAr, 180);
  const bodyAr = normalizeText(data.bodyAr || data.bodyEn, 4000);
  const bodyEn = normalizeText(data.bodyEn || data.bodyAr, 4000);

  if (!titleAr || !bodyAr) {
    throw new HttpsError("invalid-argument", "Title and body are required.");
  }

  const targets = await resolveTargets(data.uids);
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (let i = 0; i < targets.length; i += 450) {
    const batch = db.batch();
    targets.slice(i, i + 450).forEach((user) => {
      const ref = db.collection("notifications").doc();
      batch.set(ref, {
        uid: user.uid || user.id,
        type: "admin_message",
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        read: false,
        deliveredByEmail: false,
        createdBy: performedBy.email,
        createdAt: now,
      });
    });
    await batch.commit();
  }

  let pushResult = {pushCount: 0};
  try {
    pushResult = await sendPushNotifications({targets, title: titleAr, body: bodyAr});
  } catch (error) {
    logger.error("Admin message push delivery failed", error);
    pushResult = {pushCount: 0, pushError: true};
  }

  logger.info("Admin message sent", {
    notificationCount: targets.length,
    pushCount: pushResult.pushCount,
    performedBy: performedBy.email,
  });

  return {
    notificationCount: targets.length,
    ...pushResult,
  };
});

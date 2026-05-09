/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const SUPER_ADMIN_EMAIL = "walidghazal46@gmail.com";

function buildSuperPermissions() {
  return {
    approvePayments: true,
    deleteUsers: true,
    editUsers: true,
    suspendUsers: true,
    viewLogs: true,
  };
}

function buildMissingUserDoc(userRecord) {
  const email = String(userRecord.email || "").trim().toLowerCase();
  const isSuper = email === SUPER_ADMIN_EMAIL;
  const name =
    String(userRecord.displayName || "").trim() ||
    email.split("@")[0] ||
    "User";

  return {
    uid: userRecord.uid,
    email,
    emailLower: email,
    name,
    nameLower: name.toLowerCase(),
    phone: String(userRecord.phoneNumber || "").trim(),
    phoneLower: String(userRecord.phoneNumber || "").trim().toLowerCase(),
    role: isSuper ? "admin" : "user",
    adminType: isSuper ? "super" : "none",
    permissions: isSuper ? buildSuperPermissions() : {},
    status: "approved",
    accountType: "user",
    userCode: "",
    trialUsed: false,
    guestTrialStartedAt: null,
    guestTrialEndsAt: null,
    freeTrialStartedAt: null,
    freeTrialEndsAt: null,
    plan: "none",
    subscriptionStatus: "none",
    subscriptionStartedAt: null,
    subscriptionEndsAt: null,
    lifetime: false,
    mobileDeviceId: "",
    webDeviceId: "",
    maxMobileDevices: 1,
    maxWebDevices: 1,
    isPaid: false,
    subscriptionType: "none",
    paymentDate: null,
    rejectionReason: "",
    itemAnalysisOpenCount: 0,
    areaPricingTrialCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

exports.syncMissingAuthUsers = onCall(async (request) => {
  const callerEmail = String(request.auth?.token?.email || "").toLowerCase();
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }
  if (callerEmail !== SUPER_ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Only Super Admin can run user sync.");
  }

  const authApi = getAuth();
  const firestore = getFirestore();

  let pageToken;
  let processed = 0;
  let created = 0;
  let skipped = 0;

  do {
    const page = await authApi.listUsers(1000, pageToken);
    pageToken = page.pageToken;

    for (const userRecord of page.users) {
      processed += 1;
      const userRef = firestore.collection("users").doc(userRecord.uid);
      const snap = await userRef.get();
      if (snap.exists) {
        skipped += 1;
        continue;
      }
      await userRef.set(buildMissingUserDoc(userRecord), {merge: true});
      created += 1;
    }
  } while (pageToken);

  logger.info("Auth to Firestore user sync completed", {
    processed,
    created,
    skipped,
    by: callerEmail,
  });

  return {
    ok: true,
    processed,
    created,
    skipped,
  };
});

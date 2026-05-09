/* eslint-disable no-console */
const path = require("path");
const {initializeApp, cert, applicationDefault} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

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
  const phone = String(userRecord.phoneNumber || "").trim();

  return {
    uid: userRecord.uid,
    email,
    emailLower: email,
    name,
    nameLower: name.toLowerCase(),
    phone,
    phoneLower: phone.toLowerCase(),
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

function initAdmin() {
  const serviceAccountArg = process.argv[2];
  if (serviceAccountArg) {
    const serviceAccountPath = path.resolve(serviceAccountArg);
    const serviceAccount = require(serviceAccountPath);
    initializeApp({credential: cert(serviceAccount)});
    return;
  }

  initializeApp({credential: applicationDefault()});
}

async function main() {
  initAdmin();

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
      console.log(`Created missing Firestore user for: ${userRecord.email || userRecord.uid}`);
    }
  } while (pageToken);

  console.log("\nSync completed:");
  console.log(`Processed: ${processed}`);
  console.log(`Created:   ${created}`);
  console.log(`Skipped:   ${skipped}`);
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});

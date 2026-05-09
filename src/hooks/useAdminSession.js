import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  ADMIN_PERMISSIONS,
  DEFAULT_LIMITED_PERMISSIONS,
  SUPER_ADMIN_EMAIL,
  normalizePermissions,
} from "../constants/admin";
import { buildDefaultUserFields, ensureUserDocument } from "../services/subscriptionService";
import { ensureUserCode } from "../services/userCodeService";

function buildSuperPermissions() {
  return ADMIN_PERMISSIONS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}

function mapProfile(data = {}, fallbackEmail = "") {
  const email = (data.email || fallbackEmail || "").toLowerCase();
  const isSuper = email === SUPER_ADMIN_EMAIL;
  const role = isSuper ? "admin" : (data.role || "user");
  const adminType = isSuper ? "super" : data.adminType || (role === "admin" ? "limited" : "none");

  let permissions = normalizePermissions(data.permissions || {});
  if (isSuper) {
    permissions = buildSuperPermissions();
  } else if (role === "admin" && adminType === "limited") {
    permissions = { ...DEFAULT_LIMITED_PERMISSIONS, ...permissions };
  }

  return {
    uid: data.uid,
    name: data.name || "",
    email,
    phone: data.phone || "",
    role,
    adminType,
    permissions,
    status: data.status || "pending",
    accountType: data.accountType || "user",
    userCode: data.userCode || "",
    trialUsed: data.trialUsed === true,
    guestTrialStartedAt: data.guestTrialStartedAt || null,
    guestTrialEndsAt: data.guestTrialEndsAt || null,
    freeTrialStartedAt: data.freeTrialStartedAt || null,
    freeTrialEndsAt: data.freeTrialEndsAt || null,
    plan: data.plan || "none",
    subscriptionStatus: data.subscriptionStatus || "none",
    subscriptionStartedAt: data.subscriptionStartedAt || null,
    subscriptionEndsAt: data.subscriptionEndsAt || null,
    lifetime: data.lifetime === true,
    mobileDeviceId: data.mobileDeviceId || "",
    webDeviceId: data.webDeviceId || "",
    maxMobileDevices: Number(data.maxMobileDevices) || 1,
    maxWebDevices: Number(data.maxWebDevices) || 1,
    isPaid: data.isPaid === true,
    subscriptionType: data.subscriptionType || "",
    itemAnalysisOpenCount: Number(data.itemAnalysisOpenCount) || 0,
    areaPricingTrialCount: Number(data.areaPricingTrialCount) || 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    isSuper,
    canAccessAdmin: isSuper || role === "admin",
  };
}

export default function useAdminSession({ uid, email, displayName }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          const normalizedEmail = (email || "").toLowerCase();
          const isSuper = normalizedEmail === SUPER_ADMIN_EMAIL;
          const permissions = isSuper ? buildSuperPermissions() : DEFAULT_LIMITED_PERMISSIONS;
          const fallbackProfile = mapProfile(
            buildDefaultUserFields({
              uid,
              email: normalizedEmail,
              name: displayName || normalizedEmail.split("@")[0] || "User",
              phone: "",
              role: isSuper ? "admin" : "user",
              adminType: isSuper ? "super" : "none",
              permissions,
              accountType: "user",
              status: "approved",
            }),
            normalizedEmail
          );

          setProfile(fallbackProfile);
          setLoading(false);

          try {
            await setDoc(userRef, buildDefaultUserFields({
              uid,
              email: normalizedEmail,
              name: displayName || normalizedEmail.split("@")[0] || "User",
              phone: "",
              role: isSuper ? "admin" : "user",
              adminType: isSuper ? "super" : "none",
              permissions,
              accountType: "user",
              status: "approved",
            }));
          } catch (error) {
            console.warn("Unable to create user profile document:", error);
          }
          return;
        }

        const snapshotData = snapshot.data() || {};
        const normalizedEmail = (email || snapshotData.email || "").toLowerCase();
        const inferredName = displayName || snapshotData.name || normalizedEmail.split("@")[0] || "User";
        const isSuper = normalizedEmail === SUPER_ADMIN_EMAIL;
        const permissions = isSuper ? buildSuperPermissions() : normalizePermissions(snapshotData.permissions || {});

        const patch = {};
        const mergedPermissions = isSuper ? permissions : { ...DEFAULT_LIMITED_PERMISSIONS, ...permissions };

        if (snapshotData.uid !== uid) patch.uid = uid;
        if ((snapshotData.email || "").toLowerCase() !== normalizedEmail) {
          patch.email = normalizedEmail;
          patch.emailLower = normalizedEmail;
        } else if (!snapshotData.emailLower) {
          patch.emailLower = normalizedEmail;
        }
        if (!snapshotData.name) patch.name = inferredName;
        if (!snapshotData.nameLower) patch.nameLower = inferredName.toLowerCase();
        if (snapshotData.role == null) patch.role = isSuper ? "admin" : "user";
        if (snapshotData.adminType == null) patch.adminType = isSuper ? "super" : (snapshotData.role === "admin" ? "limited" : "none");
        if (!snapshotData.permissions || Object.keys(snapshotData.permissions || {}).length === 0 || isSuper) {
          patch.permissions = mergedPermissions;
        }
        if (!snapshotData.accountType) patch.accountType = "user";
        if (!snapshotData.status) patch.status = "approved";
        if (snapshotData.trialUsed == null) patch.trialUsed = false;
        if (snapshotData.guestTrialStartedAt === undefined) patch.guestTrialStartedAt = null;
        if (snapshotData.guestTrialEndsAt === undefined) patch.guestTrialEndsAt = null;
        if (snapshotData.freeTrialStartedAt === undefined) patch.freeTrialStartedAt = null;
        if (snapshotData.freeTrialEndsAt === undefined) patch.freeTrialEndsAt = null;
        if (snapshotData.plan === undefined) patch.plan = snapshotData.subscriptionType || "none";
        if (snapshotData.subscriptionStatus === undefined) patch.subscriptionStatus = snapshotData.isPaid ? "active" : "none";
        if (snapshotData.subscriptionStartedAt === undefined) patch.subscriptionStartedAt = null;
        if (snapshotData.subscriptionEndsAt === undefined) patch.subscriptionEndsAt = null;
        if (snapshotData.lifetime === undefined) patch.lifetime = false;
        if (snapshotData.mobileDeviceId === undefined) patch.mobileDeviceId = "";
        if (snapshotData.webDeviceId === undefined) patch.webDeviceId = "";
        if (snapshotData.maxMobileDevices === undefined) patch.maxMobileDevices = 1;
        if (snapshotData.maxWebDevices === undefined) patch.maxWebDevices = 1;
        if (snapshotData.isPaid === undefined) patch.isPaid = false;
        if (snapshotData.subscriptionType === undefined) patch.subscriptionType = snapshotData.plan || "none";

        const mapped = mapProfile({ ...snapshotData, ...patch }, email);
        setProfile(mapped);
        setLoading(false);

        if (Object.keys(patch).length > 0) {
          ensureUserDocument(uid, { ...patch, updatedAt: serverTimestamp() }).catch((error) => {
            console.warn("Unable to patch user profile document:", error);
          });
        }
        if (!snapshotData.userCode) {
          ensureUserCode(uid).catch((error) => {
            console.warn("Unable to assign user code:", error);
          });
        }
      },
      (error) => {
        console.warn("Admin session listener failed:", error);
        const normalizedEmail = (email || "").toLowerCase();
        if (normalizedEmail === SUPER_ADMIN_EMAIL) {
          setProfile(mapProfile({
            uid,
            email: normalizedEmail,
            name: displayName || normalizedEmail.split("@")[0] || "Admin",
            role: "admin",
            adminType: "super",
            permissions: buildSuperPermissions(),
            status: "approved",
            accountType: "user",
          }, normalizedEmail));
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, email, displayName]);

  return useMemo(() => ({ profile, loading }), [profile, loading]);
}

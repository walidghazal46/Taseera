import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  ADMIN_PERMISSIONS,
  DEFAULT_LIMITED_PERMISSIONS,
  SUPER_ADMIN_EMAIL,
  normalizePermissions,
} from "../constants/admin";

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
          const now = serverTimestamp();
          const permissions = isSuper ? buildSuperPermissions() : DEFAULT_LIMITED_PERMISSIONS;

          await setDoc(userRef, {
            uid,
            name: displayName || normalizedEmail.split("@")[0] || "User",
            nameLower: (displayName || normalizedEmail.split("@")[0] || "User").toLowerCase(),
            email: normalizedEmail,
            emailLower: normalizedEmail,
            phone: "",
            phoneLower: "",
            role: isSuper ? "admin" : "user",
            adminType: isSuper ? "super" : "none",
            permissions,
            status: isSuper ? "approved" : "pending",
            isPaid: false,
            subscriptionType: "free",
            itemAnalysisOpenCount: 0,
            areaPricingTrialCount: 0,
            paymentDate: null,
            createdAt: now,
            updatedAt: now,
          });
          return;
        }

        const mapped = mapProfile(snapshot.data(), email);
        setProfile(mapped);
        setLoading(false);
      },
      () => {
        setProfile(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, email, displayName]);

  return useMemo(() => ({ profile, loading }), [profile, loading]);
}

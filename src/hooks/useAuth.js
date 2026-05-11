import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { ensureUserProfile, computeAccessStatus, isSuperAdminEmail } from "../services/userService";

/**
 * Listens to Firebase auth state and resolves the user profile from Firestore.
 * Returns:
 *   firebaseUser  — raw Firebase user (or null)
 *   profile       — Firestore user document (or null)
 *   accessStatus  — computed access status object
 *   loading       — true while auth is resolving
 *   isAdmin       — true if the user has role "admin" or is Super Admin
 *   isSuperAdmin  — true only for walidghazal46@gmail.com
 */
export default function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const prof = await ensureUserProfile(user);
          setProfile(prof);
        } catch (err) {
          console.error("useAuth: failed to load profile", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const accessStatus  = profile ? computeAccessStatus(profile) : { canAccess: false, status: "no_profile" };
  const isSuperAdmin  = isSuperAdminEmail(firebaseUser?.email);
  const isAdmin       = isSuperAdmin || profile?.role === "admin";

  return { firebaseUser, profile, accessStatus, loading, isAdmin, isSuperAdmin, setProfile };
}

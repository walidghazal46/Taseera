import { useEffect, useState } from "react";
import {
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const ADMIN_EMAIL = "walidghazal46@gmail.com";

// Map Arabic country name → Firestore doc ID
const COUNTRY_TO_CODE = {
  السعودية: "SA",
  مصر: "EG",
  الإمارات: "AE",
  SA: "SA",
  EG: "EG",
  AE: "AE",
  sa: "SA",
  eg: "EG",
  ae: "AE",
};

export function resolveCountryCode(country) {
  return COUNTRY_TO_CODE[country] || country?.toUpperCase() || "UNKNOWN";
}

/**
 * Track a country visit from a specific section and auth mode.
 * Called when a user selects a country from CompaniesPage, SuppliersPage, or PricingPage.
 */
export async function trackCountryVisit(country, section, authMode) {
  try {
    const code = resolveCountryCode(country);
    const ref = doc(db, "countryStats", code);
    const isUser = authMode === "authenticated";
    const sectionField = `${section}Views`;
    const update = {
      [sectionField]: increment(1),
      lastActivity: serverTimestamp(),
      ...(isUser ? { users: increment(1) } : { guests: increment(1) }),
    };
    try {
      await updateDoc(ref, update);
    } catch {
      await setDoc(ref, {
        users: isUser ? 1 : 0,
        guests: isUser ? 0 : 1,
        companiesViews: section === "companies" ? 1 : 0,
        suppliersViews: section === "suppliers" ? 1 : 0,
        pricingViews: section === "pricing" ? 1 : 0,
        lastActivity: serverTimestamp(),
      });
    }
  } catch {
    // Firestore unavailable — silently ignore, never block UI
  }
}

/**
 * Real-time listener for a country's stats. Returns null while loading.
 * Only meant to be used in the admin panel.
 */
export function useCountryStats(countryCode) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!countryCode) return;
    const ref = doc(db, "countryStats", countryCode);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setStats(snap.data());
        } else {
          setStats({
            users: 0,
            guests: 0,
            companiesViews: 0,
            suppliersViews: 0,
            pricingViews: 0,
            lastActivity: null,
          });
        }
      },
      () => setStats(null)
    );
    return unsub;
  }, [countryCode]);

  return stats;
}

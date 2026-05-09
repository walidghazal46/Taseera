import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const MOBILE_DEVICE_STORAGE_KEY = "taseera.v3.device.mobile";
const WEB_DEVICE_STORAGE_KEY = "taseera.v3.device.web";

export const DEVICE_LIMIT_MESSAGE_AR = "يمكن استخدام الحساب على جهاز موبايل واحد وجهاز ويب واحد فقط. لتغيير الجهاز، يرجى التواصل مع الدعم.";
export const DEVICE_LIMIT_MESSAGE_EN = "This account can be used on only one mobile device and one web device. To change the device, please contact support.";

export function getCurrentClientKind() {
  if (typeof window !== "undefined" && window.TaseeraAndroid) return "mobile";
  if (typeof navigator !== "undefined") {
    const ua = String(navigator.userAgent || "").toLowerCase();
    if (/android|iphone|ipad|mobile/.test(ua)) return "mobile";
  }
  return "web";
}

function getStorageKey(kind) {
  return kind === "mobile" ? MOBILE_DEVICE_STORAGE_KEY : WEB_DEVICE_STORAGE_KEY;
}

function createRandomId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function getOrCreateLocalDeviceId(kind = getCurrentClientKind()) {
  if (typeof window === "undefined") return `${kind}-server`;
  const storageKey = getStorageKey(kind);
  const current = window.localStorage.getItem(storageKey);
  if (current) return current;
  const next = createRandomId(kind);
  window.localStorage.setItem(storageKey, next);
  return next;
}

export async function enforceDeviceLimit({ uid, userData = {}, language = "ar" }) {
  if (!uid) {
    return { allowed: false, message: language === "en" ? "Please sign in first." : "يرجى تسجيل الدخول أولاً." };
  }

  const kind = getCurrentClientKind();
  const localDeviceId = getOrCreateLocalDeviceId(kind);
  const field = kind === "mobile" ? "mobileDeviceId" : "webDeviceId";
  const storedDeviceId = String(userData?.[field] || "").trim();

  if (!storedDeviceId) {
    await updateDoc(doc(db, "users", uid), {
      [field]: localDeviceId,
      updatedAt: serverTimestamp(),
    });
    return { allowed: true, kind, localDeviceId, field, justRegistered: true };
  }

  if (storedDeviceId === localDeviceId) {
    return { allowed: true, kind, localDeviceId, field, justRegistered: false };
  }

  return {
    allowed: false,
    kind,
    localDeviceId,
    field,
    message: language === "en" ? DEVICE_LIMIT_MESSAGE_EN : DEVICE_LIMIT_MESSAGE_AR,
  };
}

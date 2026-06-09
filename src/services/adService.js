import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const AD_COL = "ad_banners";

export const AD_SLOT_LABELS = {
  analysisPreResult:           "أعلى شاشة التحليل",
  analysisAfterActions:        "بعد أزرار التحليل",
  analysisPostResult:          "أسفل نتيجة التحليل",
  areaFormAfterCard:           "بعد نموذج تسعير المبنى",
  areaResultsAfterNote:        "بعد ملاحظة نتائج المبنى",
  areaSectionAfterAssumptions: "بعد افتراضات التخصص",
  csiAfterDiv28:               "بعد القسم 28 (CSI)",
  selfPricingAfterActions:     "شاشة سعّر بنفسك",
  companiesMain:               "دليل الشركات",
  suppliersMain:               "دليل الموردين",
};

export const DEFAULT_AD_BANNER = {
  enabled: true,
  title: "",
  imageUrl: "",
  targetUrl: "",
  alt: "",
};

export function subscribeToAllAdBanners(callback) {
  return onSnapshot(collection(db, AD_COL), (snap) => {
    const banners = {};
    snap.forEach((d) => { banners[d.id] = { ...DEFAULT_AD_BANNER, ...d.data() }; });
    callback(banners);
  }, () => callback({}));
}

export async function saveAdBanner(slotId, data) {
  await setDoc(doc(db, AD_COL, slotId), {
    enabled:   data.enabled  ?? true,
    title:     data.title    ?? "",
    imageUrl:  data.imageUrl ?? "",
    targetUrl: data.targetUrl ?? "",
    alt:       data.alt      ?? "",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function toggleAdBanner(slotId, enabled) {
  await setDoc(doc(db, AD_COL, slotId), { enabled, updatedAt: serverTimestamp() }, { merge: true });
}

export async function removeAdBanner(slotId) {
  await deleteDoc(doc(db, AD_COL, slotId));
}

import {
  collection, addDoc, query, where, orderBy, limit,
  onSnapshot, getDoc, doc, updateDoc, deleteDoc,
  increment, serverTimestamp, Timestamp, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";

const POSTS_COL    = "community_posts";
const REQUESTS_COL = "price_requests";
const MARKET_COL   = "market_prices";

// ─── Helpers ───────────────────────────────────────────────────────────────
function expiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 20);
  return Timestamp.fromDate(d);
}

function isExpired(post) {
  if (!post.expiresAt) return false;
  const ts = post.expiresAt?.toDate ? post.expiresAt.toDate() : new Date(post.expiresAt);
  return ts < new Date();
}

// ─── POSTS ────────────────────────────────────────────────────────────────

export async function createPost({ uid, userName, userAvatar, userCountry, userCity, itemName, itemCategory, description }) {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, POSTS_COL), {
    userId: uid, userName, userAvatar: userAvatar || "",
    userCountry, userCity,
    itemName, itemCategory, description,
    createdAt: now,
    expiresAt: expiresAt(),
    commentsCount: 0, sharesCount: 0, likesCount: 0,
    likedBy: [],
    status: "active",
  });
  return ref.id;
}

export function subscribeToPosts({ categoryFilter = null, countryFilter = null, pageSize = 20 } = {}, callback) {
  let q = query(collection(db, POSTS_COL), orderBy("createdAt", "desc"), limit(pageSize));
  if (categoryFilter) q = query(collection(db, POSTS_COL), where("itemCategory", "==", categoryFilter), orderBy("createdAt", "desc"), limit(pageSize));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => !isExpired(p));
    callback(posts);
  }, () => callback([]));
}

export async function toggleLike(postId, uid) {
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const liked = (snap.data().likedBy || []).includes(uid);
  await updateDoc(ref, {
    likedBy:    liked ? arrayRemove(uid) : arrayUnion(uid),
    likesCount: increment(liked ? -1 : 1),
  });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, POSTS_COL, postId));
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────

export function subscribeToComments(postId, callback) {
  const q = query(
    collection(db, POSTS_COL, postId, "comments"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

export async function addComment({ postId, uid, userName, userAvatar, userCountry, userCity, priceValue, currency, unit, description }) {
  const commentRef = await addDoc(collection(db, POSTS_COL, postId, "comments"), {
    userId: uid, userName, userAvatar: userAvatar || "",
    userCountry, userCity,
    priceValue: priceValue ? Number(priceValue) : null,
    currency: currency || "SAR",
    unit: unit || "",
    description,
    createdAt: serverTimestamp(),
  });

  // Update comments count on post
  await updateDoc(doc(db, POSTS_COL, postId), { commentsCount: increment(1) });

  // If price provided, update market prices cache
  if (priceValue && priceValue > 0) {
    const snap = await getDoc(doc(db, POSTS_COL, postId));
    if (snap.exists()) {
      const { itemName, itemCategory } = snap.data();
      await upsertMarketPrice({ itemName, itemCategory, priceValue: Number(priceValue), currency: currency || "SAR", unit: unit || "", userCountry });
    }
  }

  return commentRef.id;
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, POSTS_COL, postId, "comments", commentId));
  await updateDoc(doc(db, POSTS_COL, postId), { commentsCount: increment(-1) });
}

// ─── MARKET PRICES ────────────────────────────────────────────────────────

async function upsertMarketPrice({ itemName, itemCategory, priceValue, currency, unit, userCountry }) {
  const itemId = encodeURIComponent(`${itemCategory}__${itemName}`).replace(/%/g, "_");
  const ref    = doc(db, MARKET_COL, itemId);
  const snap   = await getDoc(ref);

  if (!snap.exists()) {
    await addDoc(collection(db, MARKET_COL), {
      itemId, itemName, itemCategory,
      prices: [{ value: priceValue, currency, unit, country: userCountry }],
      avgPrice: priceValue, minPrice: priceValue, maxPrice: priceValue,
      count: 1,
      countries: [userCountry],
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data      = snap.data();
  const prices    = [...(data.prices || []), { value: priceValue, currency, unit, country: userCountry }];
  const values    = prices.map((p) => p.value).filter(Boolean);
  const countries = [...new Set([...(data.countries || []), userCountry])];

  await updateDoc(ref, {
    prices,
    avgPrice:  values.reduce((a, b) => a + b, 0) / values.length,
    minPrice:  Math.min(...values),
    maxPrice:  Math.max(...values),
    count:     values.length,
    countries,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToMarketPrices(callback) {
  const q = query(collection(db, MARKET_COL), orderBy("count", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

// ─── PRICE REQUESTS ───────────────────────────────────────────────────────

export async function sendPriceRequest({ fromUserId, fromUserName, toUserId, toUserName, itemName, itemCategory, requesterLocation }) {
  return addDoc(collection(db, REQUESTS_COL), {
    fromUserId, fromUserName,
    toUserId,   toUserName,
    itemName,   itemCategory,
    requesterLocation,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

export function subscribeToPriceRequests(uid, callback) {
  const q = query(
    collection(db, REQUESTS_COL),
    where("toUserId", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

export async function updateRequestStatus(requestId, status) {
  await updateDoc(doc(db, REQUESTS_COL, requestId), { status, updatedAt: serverTimestamp() });
}

// ─── USER LOCATION ────────────────────────────────────────────────────────

export async function saveUserLocation(uid, { country, city, district }) {
  await updateDoc(doc(db, "users", uid), { communityCountry: country, communityCity: city, communityDistrict: district || "" });
}

export async function getUserLocation(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const { communityCountry, communityCity, communityDistrict } = snap.data();
  return communityCountry ? { country: communityCountry, city: communityCity, district: communityDistrict } : null;
}

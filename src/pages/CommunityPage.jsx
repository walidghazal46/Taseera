import { useState, useEffect, useCallback } from "react";
import AdSenseUnit from "../components/AdSenseUnit";
import {
  subscribeToPosts, createPost, toggleLike, deletePost,
  subscribeToComments, addComment,
  subscribeToMarketPrices,
  sendPriceRequest,
  saveUserLocation, getUserLocation,
} from "../services/communityService";

const F = "'Cairo','Tajawal',sans-serif";

// ─── Constants ────────────────────────────────────────────────────────────
const CATEGORIES_AR = [
  "أعمال الحفر والترابية", "الأعمال الخرسانية", "أعمال الحديد والمعادن",
  "أعمال البناء والمبانى", "الأعمال الكهربائية", "أعمال السباكة والصرف",
  "أعمال التكييف والتهوية", "أعمال التشطيبات", "أعمال الأسقف المعلقة",
  "الأبواب والنوافذ والزجاج", "أعمال الطرق والأرصفة", "أعمال المسابح والحدائق", "أخرى",
];
const CATEGORIES_EN = [
  "Earthwork & Excavation", "Concrete Works", "Steel & Metals",
  "Masonry & Blockwork", "Electrical Works", "Plumbing & Drainage",
  "HVAC & Ventilation", "Finishing Works", "Suspended Ceilings",
  "Doors, Windows & Glazing", "Roads & Pavements", "Pools & Landscaping", "Other",
];
const COUNTRIES = ["السعودية", "الإمارات", "مصر"];
const CURRENCIES = ["SAR","AED","EGP","KWD","QAR","BHD","OMR","JOD","IQD","LYD","MAD","TND","DZD","YER","SDG","USD","EUR"];
const UNITS_AR = ["م²","م³","متر طولي","طن","كيلو","قطعة","م.ج","م.د","لتر","كيس","وحدة"];
const UNITS_EN = ["m²","m³","lm","ton","kg","pcs","lump sum","lump sum","liter","bag","unit"];

function timeAgo(ts, ar) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return ar ? "الآن" : "now";
  if (diff < 3600) return ar ? `${Math.floor(diff/60)} د` : `${Math.floor(diff/60)}m`;
  if (diff < 86400) return ar ? `${Math.floor(diff/3600)} س` : `${Math.floor(diff/3600)}h`;
  return ar ? `${Math.floor(diff/86400)} ي` : `${Math.floor(diff/86400)}d`;
}

function daysLeft(ts) {
  if (!ts) return 0;
  const exp = ts.toDate ? ts.toDate() : new Date(ts);
  return Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
}

function Avatar({ name = "?", size = 9 }) {
  const colors = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#0d9488"];
  const color  = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-white font-black text-sm`}
      style={{ background: color }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Location Setup ───────────────────────────────────────────────────────
function LocationSetup({ ar, uid, onDone, onShowStatus }) {
  const [country, setCountry]   = useState("");
  const [city, setCity]         = useState("");
  const [district, setDistrict] = useState("");
  const [saving, setSaving]     = useState(false);

  const save = async () => {
    if (!country || !city) {
      if (onShowStatus) onShowStatus(ar ? "يرجى إكمال البيانات المطلوبة" : "Please fill required fields", "warning");
      return;
    }
    if (!uid) {
      if (onShowStatus) onShowStatus(ar ? "خطأ: لم يتم العثور على معرف المستخدم" : "Error: User ID not found", "warning");
      return;
    }

    setSaving(true);
    try {
      await saveUserLocation(uid, { country, city, district });
      onDone({ country, city, district });
    } catch (err) {
      console.error("Failed to save location:", err);
      if (onShowStatus) onShowStatus(ar ? "فشل حفظ البيانات. يرجى المحاولة لاحقاً" : "Failed to save. Please try again later", "warning");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-5 text-center" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      <div className="text-5xl">📍</div>
      <h2 className="text-xl font-black text-[#0d2545]">{ar ? "أين تعمل؟" : "Where do you work?"}</h2>
      <p className="text-sm text-slate-500">{ar ? "بياناتك المكانية ستُربط تلقائياً بكل مشاركاتك في المجتمع." : "Your location will be automatically attached to all your community posts."}</p>

      <div className="w-full max-w-xs space-y-3 text-right">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">{ar ? "الدولة *" : "Country *"}</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">{ar ? "اختر الدولة" : "Select country"}</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">{ar ? "المدينة *" : "City *"}</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={ar ? "أدخل المدينة" : "Enter city"}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">{ar ? "الحي / المنطقة (اختياري)" : "District (optional)"}</label>
          <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder={ar ? "أدخل الحي" : "Enter district"}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>

      <button onClick={save} disabled={!country || !city || saving}
        className="rounded-2xl bg-[#4f46e5] px-8 py-3 text-sm font-black text-white disabled:opacity-40">
        {saving ? "..." : (ar ? "حفظ والمتابعة" : "Save & Continue")}
      </button>
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────
function CreatePostModal({ ar, uid, userName, location, onClose, onCreated, onLocationSaved }) {
  const [itemName, setItemName]         = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [description, setDescription]   = useState("");
  const [country, setCountry]           = useState(location?.country || "");
  const [city, setCity]                 = useState(location?.city || "");
  const [submitting, setSubmitting]     = useState(false);
  const categories = ar ? CATEGORIES_AR : CATEGORIES_EN;
  const needsLoc   = !location;

  const submit = async () => {
    const loc = location || { country, city, district: "" };
    if (!itemName || !itemCategory || !loc.country || !loc.city) return;
    setSubmitting(true);
    try {
      if (needsLoc && uid) {
        await saveUserLocation(uid, loc);
        onLocationSaved?.(loc);
      }
      await createPost({
        uid, userName,
        userCountry: loc.country, userCity: loc.city,
        itemName, itemCategory, description,
      });
      onCreated();
    } catch {}
    setSubmitting(false);
  };

  const canSubmit = itemName && itemCategory && (location || (country && city));

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/60" onClick={onClose}>
      <div className="mt-auto rounded-t-3xl bg-white p-5 space-y-4" dir={ar ? "rtl" : "ltr"}
        style={{ fontFamily: F, paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#0d2545]">{ar ? "منشور جديد" : "New Post"}</h3>
          <button onClick={onClose} className="text-slate-400 text-xl">✕</button>
        </div>

        {needsLoc && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-2">
            <p className="text-xs font-bold text-indigo-700">📍 {ar ? "حدّد موقعك أولاً" : "Set your location first"}</p>
            <div className="flex gap-2">
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">{ar ? "الدولة *" : "Country *"}</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={ar ? "المدينة *" : "City *"}
                className="flex-1 rounded-xl border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">{ar ? "اسم البند *" : "Item Name *"}</label>
          <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={ar ? "مثال: حديد تسليح Ø16" : "e.g. Rebar Ø16mm"}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">{ar ? "التصنيف *" : "Category *"}</label>
          <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">{ar ? "اختر التصنيف" : "Select category"}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">{ar ? "وصف الطلب" : "Description"}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder={ar ? "أضف تفاصيل أو مواصفات إضافية..." : "Add details or specifications..."}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        {!needsLoc && (
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            📍 <span>{location.city}، {location.country}</span>
            <span className="mr-auto text-indigo-400">{ar ? "يُضاف تلقائياً" : "auto-added"}</span>
          </div>
        )}

        <button onClick={submit} disabled={!canSubmit || submitting}
          className="w-full rounded-2xl bg-[#4f46e5] py-3 text-sm font-black text-white disabled:opacity-40">
          {submitting ? "..." : (ar ? "نشر" : "Post")}
        </button>
      </div>
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────
function CommentItem({ comment, ar, uid, onRequestPrice, postOwner }) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <Avatar name={comment.userName} size={8} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-slate-800">{comment.userName}</span>
          <span className="text-[10px] text-slate-400">📍{comment.userCity}</span>
          <span className="text-[10px] text-slate-400 mr-auto">{timeAgo(comment.createdAt, ar)}</span>
        </div>
        {comment.priceValue && (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
            <span className="text-sm font-black text-emerald-700">{comment.priceValue.toLocaleString()}</span>
            <span className="text-xs text-emerald-600">{comment.currency}</span>
            {comment.unit && <span className="text-xs text-emerald-500">/ {comment.unit}</span>}
          </div>
        )}
        {comment.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{comment.description}</p>}
        {uid && uid !== comment.userId && (
          <button onClick={() => onRequestPrice(comment)} className="mt-1 text-[11px] font-bold text-indigo-500">
            {ar ? "⚡ طلب سعر منه" : "⚡ Request price"}
          </button>
        )}
      </div>
    </div>
  );
}

function AddCommentForm({ ar, postId, uid, userName, location, onAdded }) {
  const [desc, setDesc]       = useState("");
  const [price, setPrice]     = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [unit, setUnit]       = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [submitting, setSub]  = useState(false);

  const submit = async () => {
    if (!desc && !price) return;
    setSub(true);
    try {
      await addComment({
        postId, uid, userName,
        userCountry: location.country, userCity: location.city,
        priceValue: price ? Number(price) : null,
        currency, unit, description: desc,
      });
      setDesc(""); setPrice(""); setUnit(""); setShowPrice(false);
      onAdded?.();
    } catch {}
    setSub(false);
  };

  return (
    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 space-y-2" dir={ar ? "rtl" : "ltr"}>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder={ar ? "أضف تعليق أو سعر..." : "Add a comment or price..."}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />

      <div className="flex items-center gap-2">
        <button onClick={() => setShowPrice(!showPrice)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${showPrice ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}>
          💰 {ar ? "أضف سعراً" : "Add price"}
        </button>
        <button onClick={submit} disabled={(!desc && !price) || submitting}
          className="mr-auto rounded-full bg-[#4f46e5] px-4 py-1.5 text-[11px] font-bold text-white disabled:opacity-40">
          {submitting ? "..." : (ar ? "إرسال" : "Send")}
        </button>
      </div>

      {showPrice && (
        <div className="flex gap-2 flex-wrap">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={ar ? "السعر" : "Price"}
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={unit} onChange={(e) => setUnit(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none">
            <option value="">{ar ? "الوحدة" : "Unit"}</option>
            {(ar ? UNITS_AR : UNITS_EN).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

// ─── Post Detail ──────────────────────────────────────────────────────────
function PostDetail({ post, ar, uid, userName, location, isAuthenticated, onBack, onRequestPrice }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const unsub = subscribeToComments(post.id, setComments);
    return unsub;
  }, [post.id]);

  const days = daysLeft(post.expiresAt);

  return (
    <div className="flex flex-col h-full" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-xl">
          {ar ? "›" : "‹"}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-800 truncate">{post.itemName}</p>
          <p className="text-xs text-slate-400">{post.commentsCount || 0} {ar ? "تعليق" : "comments"}</p>
        </div>
        {days > 0 && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            {ar ? `ينتهي بعد ${days} ي` : `${days}d left`}
          </span>
        )}
      </div>

      {/* Post content */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-start gap-3">
          <Avatar name={post.userName} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-800">{post.userName}</span>
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600">📍 {post.userCity}، {post.userCountry}</span>
              <span className="text-[10px] text-slate-400">{timeAgo(post.createdAt, ar)}</span>
            </div>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{post.itemCategory}</span>
            {post.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{post.description}</p>}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
              <span className="text-4xl">💬</span>
              <p className="text-sm">{ar ? "لا توجد تعليقات بعد. كن أول من يشارك سعراً!" : "No comments yet. Be the first to share a price!"}</p>
            </div>
          ) : (
            comments.map((c) => (
              <CommentItem key={c.id} comment={c} ar={ar} uid={uid} onRequestPrice={(comment) => onRequestPrice({ comment, post })} postOwner={post.userId} />
            ))
          )}
        </div>
      </div>

      {/* Add comment */}
      {isAuthenticated && location ? (
        <AddCommentForm ar={ar} postId={post.id} uid={uid} userName={userName} location={location} />
      ) : !isAuthenticated ? (
        <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 text-center text-sm text-indigo-600 font-bold" style={{ fontFamily: F }}>
          {ar ? "سجّل دخولك للمشاركة بسعر" : "Sign in to share a price"}
        </div>
      ) : null}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────
function PostCard({ post, ar, uid, onOpen, onLike, onDelete }) {
  const liked = (post.likedBy || []).includes(uid);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm" style={{ fontFamily: F }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar name={post.userName} size={10} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-800">{post.userName}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600">📍 {post.userCity}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{post.itemCategory}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-400">{timeAgo(post.createdAt, ar)}</span>
                {uid === post.userId && (
                  <button onClick={() => onDelete(post.id)} className="text-[10px] text-red-400">🗑</button>
                )}
              </div>
            </div>

            <button onClick={() => onOpen(post)} className="mt-2 text-right w-full">
              <p className="text-[15px] font-black text-[#0d2545]">{post.itemName}</p>
              {post.description && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{post.description}</p>}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
        <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${liked ? "bg-red-50 text-red-500" : "text-slate-500 hover:bg-slate-100"}`}>
          {liked ? "❤️" : "🤍"} <span>{post.likesCount || 0}</span>
        </button>
        <button onClick={() => onOpen(post)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-slate-500 hover:bg-slate-100">
          💬 <span>{post.commentsCount || 0}</span>
        </button>
        <span className={`mr-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${daysLeft(post.expiresAt) <= 3 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
          {ar ? `${daysLeft(post.expiresAt)} ي` : `${daysLeft(post.expiresAt)}d`}
        </span>
      </div>
    </div>
  );
}

// ─── Market Prices Panel ──────────────────────────────────────────────────
function MarketPricesPanel({ ar, onClose }) {
  const [prices, setPrices]     = useState([]);
  const [catFilter, setCatFilter] = useState("");
  const categories = ar ? CATEGORIES_AR : CATEGORIES_EN;

  useEffect(() => {
    const unsub = subscribeToMarketPrices(setPrices);
    return unsub;
  }, []);

  const filtered = catFilter ? prices.filter((p) => p.itemCategory === catFilter) : prices;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#f8faff]" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F, paddingTop: "calc(env(safe-area-inset-top)+12px)", paddingBottom: "calc(env(safe-area-inset-bottom)+16px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pb-4 border-b border-slate-200">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 text-xl">{ar?"›":"‹"}</button>
        <div>
          <h1 className="text-xl font-black text-[#0d2545]">{ar ? "أسعار السوق" : "Market Prices"}</h1>
          <p className="text-xs text-slate-500">{ar ? "مجمّعة من تعليقات المستخدمين" : "Aggregated from user contributions"}</p>
        </div>
        <button onClick={onClose} className="mr-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">✕</button>
      </div>

      {/* Filter */}
      <div className="px-4 py-3">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">{ar ? "كل التصنيفات" : "All categories"}</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Prices list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
            <span className="text-5xl">📊</span>
            <p className="text-sm text-center">{ar ? "لا توجد أسعار بعد.\nعلّق بسعر على أي منشور لتبدأ قاعدة البيانات!" : "No prices yet.\nComment with a price to start the database!"}</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-[#0d2545]">{item.itemName}</p>
                  <span className="text-[10px] text-slate-400 rounded-full bg-slate-100 px-2 py-0.5">{item.itemCategory}</span>
                </div>
                <span className="text-xs text-slate-400">{item.count} {ar ? "سعر" : "prices"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <p className="text-[10px] text-emerald-600 font-bold">{ar ? "متوسط" : "Avg"}</p>
                  <p className="text-sm font-black text-emerald-700">{Math.round(item.avgPrice || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2">
                  <p className="text-[10px] text-blue-600 font-bold">{ar ? "أدنى" : "Min"}</p>
                  <p className="text-sm font-black text-blue-700">{Math.round(item.minPrice || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-2">
                  <p className="text-[10px] text-orange-600 font-bold">{ar ? "أعلى" : "Max"}</p>
                  <p className="text-sm font-black text-orange-700">{Math.round(item.maxPrice || 0).toLocaleString()}</p>
                </div>
              </div>
              {item.countries?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.countries.slice(0,4).map((c) => (
                    <span key={c} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600">📍{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Price Request Modal ──────────────────────────────────────────────────
function PriceRequestModal({ ar, fromUserId, fromUserName, fromLocation, targetUser, targetComment, post, onClose, onSent }) {
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending]   = useState(false);

  const send = async () => {
    if (!accepted) return;
    setSending(true);
    try {
      await sendPriceRequest({
        fromUserId, fromUserName,
        toUserId:   targetUser.id,
        toUserName: targetUser.name,
        itemName:   post.itemName,
        itemCategory: post.itemCategory,
        requesterLocation: `${fromLocation.city}، ${fromLocation.country}`,
      });
      onSent?.();
    } catch {}
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 space-y-4" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
        <h3 className="text-base font-black text-[#0d2545]">
          {ar ? `طلب سعر من ${targetUser.name}` : `Request price from ${targetUser.name}`}
        </h3>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm">
          <p><span className="font-bold text-slate-600">{ar?"البند:":"Item:"}</span> {post.itemName}</p>
          <p><span className="font-bold text-slate-600">{ar?"موقعك:":"Your location:"}</span> {fromLocation.city}، {fromLocation.country}</p>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2">
          <p className="text-xs font-black text-amber-800">⚠️ {ar?"تعهد":"Commitment"}</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            {ar
              ? `بموافقتك على هذا الطلب، تتعهد بدفع 1% من قيمة الطلب عند تنفيذ المشروع، وإرسال إيصال الدفع على بريد المستخدم الإلكتروني.`
              : `By accepting this request, you commit to paying 1% of the order value upon project execution, and sending the payment receipt to the user's email.`}
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 rounded" />
            <span className="text-xs font-bold text-amber-800">{ar?"أوافق على هذا التعهد":"I agree to this commitment"}</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">{ar?"إلغاء":"Cancel"}</button>
          <button onClick={send} disabled={!accepted || sending}
            className="flex-1 rounded-2xl bg-[#4f46e5] py-2.5 text-sm font-black text-white disabled:opacity-40">
            {sending ? "..." : (ar?"موافق وإرسال الطلب":"Agree & Send")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────
function HowItWorksPage({ ar, onBack }) {
  const steps = ar ? [
    { icon: "📍", title: "حدّد موقعك", body: "أدخل دولتك ومدينتك ليتم ربطها تلقائياً بكل مشاركاتك." },
    { icon: "📝", title: "انشر استفساراً", body: "انشر بند عمل محدد (مثل حديد تسليح Ø16) تريد معرفة سعره في السوق." },
    { icon: "💰", title: "احصل على أسعار حقيقية", body: "مستخدمون من مناطق مختلفة يعلّقون بالأسعار الفعلية من السوق." },
    { icon: "📊", title: "لوحة أسعار السوق", body: "جميع الأسعار المُدخلة تُجمَّع تلقائياً في لوحة 'أسعار السوق' مع متوسط وأدنى وأعلى سعر لكل بند." },
    { icon: "⚡", title: "نظام طلب السعر", body: "يمكنك إرسال طلب سعر مباشر لمستخدم محدد. عند الموافقة، تتعهد بدفع 1% من قيمة الطلب عند تنفيذ المشروع." },
    { icon: "⏱", title: "دورة حياة 20 يوماً", body: "كل منشور يُحذف تلقائياً بعد 20 يوماً للحفاظ على أسعار حديثة ومحدّثة." },
    { icon: "1%", title: "نظام التعهد", body: "التعهد بالـ 1% هو إقرار أخلاقي يشجع على مشاركة الأسعار الدقيقة وبناء مجتمع تسعير موثوق. ليس عقداً ملزماً قانونياً." },
  ] : [
    { icon: "📍", title: "Set your location", body: "Enter your country and city to have them automatically linked to all your posts." },
    { icon: "📝", title: "Post an inquiry", body: "Post a specific BOQ item (e.g. Rebar Ø16mm) you want to know the market price for." },
    { icon: "💰", title: "Get real prices", body: "Users from different regions comment with real prices from the market." },
    { icon: "📊", title: "Market Prices Dashboard", body: "All submitted prices are automatically aggregated in the 'Market Prices' panel with average, min, and max for each item." },
    { icon: "⚡", title: "Price Request System", body: "You can send a direct price request to a specific user. Upon acceptance, you commit to paying 1% of the order value upon project execution." },
    { icon: "⏱", title: "20-day post lifecycle", body: "Each post is automatically deleted after 20 days to keep prices current and up-to-date." },
    { icon: "1%", title: "The 1% Commitment", body: "The 1% commitment is a moral pledge that encourages sharing accurate prices and building a trusted pricing community. It is not a legally binding contract." },
  ];

  return (
    <div className="flex flex-col" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-xl">{ar?"›":"‹"}</button>
        <h1 className="text-lg font-black text-[#0d2545]">{ar ? "كيف يعمل مجتمع التسعير؟" : "How does the Pricing Community work?"}</h1>
      </div>
      <div className="p-4 space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-black text-indigo-600">{step.icon}</div>
            <div>
              <p className="text-sm font-black text-[#0d2545]">{step.title}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Privacy Policy ───────────────────────────────────────────────────────
function PrivacyPage({ ar, onBack }) {
  const sections = ar ? [
    ["البيانات التي نجمعها", "الاسم، البريد الإلكتروني، الدولة والمدينة، المنشورات والتعليقات التي تنشرها، الأسعار التي تشاركها."],
    ["كيف نستخدمها", "تشغيل ميزات المجتمع، تجميع أسعار السوق بشكل مجهول، تحسين تجربة التطبيق."],
    ["الاحتفاظ بالبيانات", "المنشورات تُحذف تلقائياً بعد 20 يوماً. بيانات الملف الشخصي تُحتفظ بها طالما الحساب نشط."],
    ["حقوق المستخدم", "يمكنك تعديل بيانات الموقع في أي وقت، وطلب حذف حسابك من إعدادات التطبيق."],
    ["خدمات الطرف الثالث", "نستخدم Firebase وGoogle لتخزين البيانات والمصادقة. تخضع هذه الخدمات لسياسة خصوصية Google."],
    ["سياسة الأطفال", "يشترط الاستخدام بلوغ المستخدم 13 عاماً على الأقل."],
    ["التواصل", "لأي استفسارات متعلقة بالخصوصية، تواصل معنا عبر قنوات الدعم في صفحة الإعدادات."],
  ] : [
    ["Data We Collect", "Name, email, country and city, posts and comments you publish, prices you share."],
    ["How We Use It", "Running community features, anonymously aggregating market prices, improving app experience."],
    ["Data Retention", "Posts are automatically deleted after 20 days. Profile data is retained while the account is active."],
    ["Your Rights", "You can edit your location at any time, and request account deletion from app settings."],
    ["Third-Party Services", "We use Firebase and Google for data storage and authentication. These services are subject to Google's Privacy Policy."],
    ["Children Policy", "Use requires the user to be at least 13 years old."],
    ["Contact", "For any privacy inquiries, contact us through the support channels in the Settings page."],
  ];

  return (
    <div className="flex flex-col" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-xl">{ar?"›":"‹"}</button>
        <h1 className="text-lg font-black text-[#0d2545]">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
      </div>
      <div className="p-4 space-y-3">
        {sections.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-black text-[#0d2545]">{title}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Terms of Use ─────────────────────────────────────────────────────────
function TermsPage({ ar, onBack }) {
  const sections = ar ? [
    ["الاستخدام المقبول", "المجتمع مخصص لمشاركة أسعار بنود الأعمال الإنشائية فقط. يُمنع نشر إعلانات، معلومات مضللة، أو أسعار وهمية."],
    ["مسؤولية المستخدم", "أنت مسؤول عن دقة الأسعار التي تشاركها. الأسعار المبالغ فيها أو المجحفة تضر بالمجتمع."],
    ["نظام التعهد بـ 1%", "عند إرسال طلب سعر والموافقة عليه، تُقرّ أخلاقياً بدفع 1% من قيمة الطلب عند تنفيذ المشروع. هذا ليس عقداً قانونياً ملزماً بل إقرار شرفي."],
    ["إشراف المحتوى", "نحتفظ بحق إزالة أي منشور أو تعليق يخالف شروط الاستخدام."],
    ["تعليق الحسابات", "قد يُعلَّق حساب أي مستخدم ينتهك الشروط بشكل متكرر."],
    ["إخلاء المسؤولية", "الأسعار المشتركة هي آراء مستخدمين وليست ضماناً أو تعهداً رسمياً. تحقق دائماً من الأسعار قبل اتخاذ أي قرار مالي."],
  ] : [
    ["Acceptable Use", "The community is dedicated to sharing prices for construction BOQ items only. Posting ads, misleading information, or fake prices is prohibited."],
    ["User Responsibility", "You are responsible for the accuracy of the prices you share. Inflated or unfair prices harm the community."],
    ["The 1% Commitment", "When sending and accepting a price request, you morally pledge to pay 1% of the order value upon project execution. This is a personal pledge, not a legally binding contract."],
    ["Content Moderation", "We reserve the right to remove any post or comment that violates the terms of use."],
    ["Account Suspension", "Accounts that repeatedly violate the terms may be suspended."],
    ["Disclaimer", "Shared prices are user opinions and not official guarantees or commitments. Always verify prices before making financial decisions."],
  ];

  return (
    <div className="flex flex-col" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-xl">{ar?"›":"‹"}</button>
        <h1 className="text-lg font-black text-[#0d2545]">{ar ? "شروط الاستخدام" : "Terms of Use"}</h1>
      </div>
      <div className="p-4 space-y-3">
        {sections.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-black text-[#0d2545]">{title}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main CommunityPage ───────────────────────────────────────────────────
export default function CommunityPage({ settings, authMode, sessionMeta, onNavigate, profile, onShowStatus, firebaseUser }) {
  const ar              = settings?.language !== "en";
  const isAuthenticated = authMode === "authenticated";
  const uid             = profile?.uid || sessionMeta?.uid || firebaseUser?.uid || null;
  const userName        = profile?.displayName || sessionMeta?.userName || (ar ? "مستخدم" : "User");

  const [view, setView]           = useState("feed"); // feed | post-detail | how | privacy | terms
  const [posts, setPosts]         = useState([]);
  const [selectedPost, setSelPost] = useState(null);
  const [location, setLocation]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [priceRequest, setPriceRequest] = useState(null); // { comment, post }
  const [catFilter, setCatFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [flash, setFlash]         = useState("");
  const categories = ar ? CATEGORIES_AR : CATEGORIES_EN;

  // Load user location
  useEffect(() => {
    if (!uid) return;
    getUserLocation(uid)
      .then((loc) => { if (loc) setLocation(loc); })
      .catch((err) => console.error("Failed to load user location:", err));
  }, [uid]);

  // Subscribe to posts
  useEffect(() => {
    const unsub = subscribeToPosts({ categoryFilter: catFilter || null }, setPosts);
    return unsub;
  }, [catFilter]);

  const showFlash = useCallback((msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  }, []);

  const handleLike = async (postId) => {
    if (!uid) return;
    try { await toggleLike(postId, uid); } catch {}
  };

  const handleDelete = async (postId) => {
    try { await deletePost(postId); showFlash(ar ? "تم حذف المنشور" : "Post deleted"); } catch {}
  };

  const handleOpenPost = (post) => {
    setSelPost(post);
    setView("post-detail");
  };

  // ── Auth Gate ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 gap-6 text-center" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
        <div className="text-6xl">👥</div>
        <h2 className="text-xl font-black text-[#0d2545]">{ar ? "مجتمع التسعير" : "Pricing Community"}</h2>
        <p className="text-sm text-slate-500 max-w-xs">{ar ? "يجب تسجيل الدخول للانضمام للمجتمع والمشاركة في المناقشات." : "You must be signed in to join the community and participate in discussions."}</p>
        <button onClick={() => onNavigate?.("settings")} className="rounded-2xl bg-[#4f46e5] px-10 py-3.5 text-sm font-black text-white">
          {ar ? "تسجيل الدخول" : "Sign In"}
        </button>
      </div>
    );
  }

  // ── Sub-pages ───────────────────────────────────────────────────────────
  if (view === "how")     return <HowItWorksPage ar={ar} onBack={() => setView("feed")} />;
  if (view === "privacy") return <PrivacyPage ar={ar} onBack={() => setView("feed")} />;
  if (view === "terms")   return <TermsPage ar={ar} onBack={() => setView("feed")} />;

  if (view === "post-detail" && selectedPost) {
    return (
      <>
        <PostDetail
          post={selectedPost} ar={ar} uid={uid} userName={userName}
          location={location} isAuthenticated={isAuthenticated}
          onBack={() => { setSelPost(null); setView("feed"); }}
          onRequestPrice={(data) => setPriceRequest(data)}
        />
        {priceRequest && (
          <PriceRequestModal
            ar={ar}
            fromUserId={uid} fromUserName={userName} fromLocation={location || { city: "—", country: "—" }}
            targetUser={{ id: priceRequest.comment.userId, name: priceRequest.comment.userName }}
            targetComment={priceRequest.comment}
            post={priceRequest.post}
            onClose={() => setPriceRequest(null)}
            onSent={() => showFlash(ar ? "✅ تم إرسال طلب السعر" : "✅ Price request sent")}
          />
        )}
      </>
    );
  }

  // ── Main Feed ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f3f6fc]" dir={ar ? "rtl" : "ltr"} style={{ fontFamily: F }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate?.("pricing")} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-xl">
            {ar ? "›" : "‹"}
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-[#0d2545]">{ar ? "مجتمع التسعير" : "Pricing Community"}</h1>
            <p className="text-[10px] text-slate-400">{posts.length} {ar ? "منشور نشط" : "active posts"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowMarket(true)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-base" title={ar?"أسعار السوق":"Market Prices"}>📊</button>
            <button onClick={() => setView("how")} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 text-base">ℹ️</button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setCatFilter("")} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${!catFilter ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "bg-white text-slate-600 border-slate-200"}`}>
            {ar ? "الكل" : "All"}
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCatFilter(c === catFilter ? "" : c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${catFilter === c ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "bg-white text-slate-600 border-slate-200"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Country Filter */}
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-none">
          <button onClick={() => setCountryFilter("")} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${!countryFilter ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}>
            🌍 {ar ? "كل الدول" : "All"}
          </button>
          {COUNTRIES.map((c) => (
            <button key={c} onClick={() => setCountryFilter(c === countryFilter ? "" : c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${countryFilter === c ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}>
              📍 {c}
            </button>
          ))}
        </div>
      </div>

      {/* Guest banner */}
      {!isAuthenticated && (
        <div className="mx-4 mt-3 rounded-2xl bg-indigo-600 p-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white">{ar ? "سجّل دخولك لتتفاعل مع المجتمع" : "Sign in to interact with the community"}</p>
          <button onClick={() => onNavigate?.("settings")} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-indigo-700">
            {ar ? "دخول" : "Sign in"}
          </button>
        </div>
      )}

      {/* Flash message */}
      {flash && (
        <div className="mx-4 mt-2 rounded-xl bg-emerald-500 px-3 py-2 text-center text-sm font-bold text-white">{flash}</div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {(() => {
          const visiblePosts = posts.filter((p) =>
            (!countryFilter || p.userCountry === countryFilter)
          );
          if (posts.length === 0) return (
            <>
              <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
                <span className="text-6xl">🏗️</span>
                <p className="text-sm font-semibold text-center">
                  {ar ? "لا توجد منشورات بعد.\nكن أول من ينشر استفساراً!" : "No posts yet.\nBe the first to post an inquiry!"}
                </p>
              </div>
              <AdSenseUnit className="min-h-[96px]" />
            </>
          );
          if (visiblePosts.length === 0) return (
            <>
              <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                <span className="text-5xl">🔍</span>
                <p className="text-sm font-semibold text-center">{ar ? "لا توجد منشورات لهذا الفلتر" : "No posts match this filter"}</p>
              </div>
              <AdSenseUnit className="min-h-[96px]" />
            </>
          );
          return visiblePosts.map((post, index) => (
            <div key={post.id} className="space-y-3">
              <PostCard
                post={post} ar={ar} uid={uid}
                onOpen={handleOpenPost}
                onLike={handleLike}
                onDelete={handleDelete}
              />
              {index === 0 && <AdSenseUnit className="min-h-[96px]" />}
            </div>
          ));
        })()}

        {/* Bottom links */}
        <div className="flex justify-center gap-3 py-4">
          <button onClick={() => setView("privacy")} className="text-[11px] text-slate-400 underline">{ar?"سياسة الخصوصية":"Privacy"}</button>
          <button onClick={() => setView("terms")} className="text-[11px] text-slate-400 underline">{ar?"شروط الاستخدام":"Terms"}</button>
        </div>
      </div>

      {/* FAB — new post */}
      {isAuthenticated && (
        <button
          onClick={() => setShowCreate(true)}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#4f46e5] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-300/50 active:scale-95 transition"
          style={{ zIndex: 100 }}
        >
          <span className="text-lg">+</span>
          {ar ? "منشور جديد" : "New Post"}
        </button>
      )}

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          ar={ar} uid={uid} userName={userName} location={location}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); showFlash(ar ? "✅ تم النشر" : "✅ Posted"); }}
          onLocationSaved={(loc) => setLocation(loc)}
        />
      )}

      {/* Market prices panel */}
      {showMarket && <MarketPricesPanel ar={ar} onClose={() => setShowMarket(false)} />}
    </div>
  );
}

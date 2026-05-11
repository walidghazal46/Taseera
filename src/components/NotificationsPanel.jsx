import { useState } from "react";
import { markRead, markAllRead, deleteNotification, deleteAllNotifications } from "../services/notificationService";

const AR_FONT = "'Cairo','Tajawal',sans-serif";

function timeAgo(ts, ar) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return ar ? "الآن" : "Just now";
  if (diff < 3600) return ar ? `${Math.floor(diff / 60)} د` : `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return ar ? `${Math.floor(diff / 3600)} س` : `${Math.floor(diff / 3600)}h`;
  return ar ? `${Math.floor(diff / 86400)} ي` : `${Math.floor(diff / 86400)}d`;
}

function fullDate(ts, ar) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString(ar ? "ar-SA" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TYPE_CONFIG = {
  payment_approved: {
    icon: "✅",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    label: { ar: "إشعار دفع", en: "Payment Notice" },
  },
  payment_rejected: {
    icon: "❌",
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    label: { ar: "إشعار رفض", en: "Rejection Notice" },
  },
  admin_message: {
    icon: "📢",
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    label: { ar: "رسالة من الإدارة", en: "Admin Message" },
  },
  broadcast: {
    icon: "📣",
    bg: "bg-violet-50",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    label: { ar: "إشعار عام", en: "Broadcast" },
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.admin_message;

function NotificationDetail({ notif, ar, onBack, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type] || DEFAULT_CONFIG;
  const title = ar ? notif.titleAr : notif.titleEn;
  const body  = ar ? notif.bodyAr  : notif.bodyEn;

  const handleDelete = async () => {
    try { await deleteNotification(notif.id); } catch {}
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm text-xl leading-none"
          >
            {ar ? "›" : "‹"}
          </button>
          <h1 className="text-xl font-black text-[#082555]">
            {ar ? "تفاصيل الرسالة" : "Message Details"}
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 active:bg-red-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
          </svg>
          {ar ? "حذف" : "Delete"}
        </button>
      </div>

      {/* Detail body */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
          {/* Type badge + time */}
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${cfg.iconBg}`}>
              <span className="text-base">{cfg.icon}</span>
              <span className="text-[11px] font-bold text-slate-600">
                {ar ? cfg.label.ar : cfg.label.en}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{timeAgo(notif.createdAt, ar)}</span>
          </div>

          {/* Title */}
          <h2 className="text-[17px] font-black text-slate-800 leading-snug mb-3">{title}</h2>

          {/* Body */}
          {body && (
            <p className="text-[13px] text-slate-600 leading-relaxed">{body}</p>
          )}

          {/* Full date */}
          <p className="mt-5 text-[10px] text-slate-400 border-t border-slate-200/60 pt-3">
            {fullDate(notif.createdAt, ar)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPanel({ notifications = [], uid, language = "ar", onClose }) {
  const ar = language === "ar";
  const unread = notifications.filter((n) => !n.read).length;
  const [selectedId, setSelectedId] = useState(null);

  const selectedNotif = notifications.find((n) => n.id === selectedId) ?? null;

  const handleOpen = async (notif) => {
    setSelectedId(notif.id);
    if (!notif.read) {
      try { await markRead(notif.id); } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    if (uid) {
      try { await markAllRead(uid); } catch {}
    }
  };

  const handleDeleteAll = async () => {
    if (uid) {
      try { await deleteAllNotifications(uid); } catch {}
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex flex-col bg-[linear-gradient(180deg,#f3f7ff,#fafcff)]"
      dir={ar ? "rtl" : "ltr"}
      style={{
        fontFamily: AR_FONT,
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
      }}
    >
      {selectedNotif ? (
        <NotificationDetail
          notif={selectedNotif}
          ar={ar}
          onBack={() => setSelectedId(null)}
          onDelete={() => setSelectedId(null)}
        />
      ) : (
        <>
          {/* List header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm text-xl leading-none"
              >
                {ar ? "›" : "‹"}
              </button>
              <div>
                <h1 className="text-xl font-black text-[#082555]">
                  {ar ? "الإشعارات" : "Notifications"}
                </h1>
                {unread > 0 && (
                  <p className="text-xs text-slate-500">
                    {ar ? `${unread} غير مقروء` : `${unread} unread`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="rounded-full bg-[#082555]/10 px-3 py-1.5 text-[11px] font-bold text-[#082555] active:bg-[#082555]/20"
                >
                  {ar ? "قراءة الكل" : "Mark all read"}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 active:bg-red-100"
                >
                  {ar ? "حذف الكل" : "Clear all"}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="text-5xl">🔔</span>
                <p className="text-sm font-semibold text-slate-400">
                  {ar ? "لا توجد إشعارات بعد" : "No notifications yet"}
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] || DEFAULT_CONFIG;
                const title = ar ? notif.titleAr : notif.titleEn;
                const body  = ar ? notif.bodyAr  : notif.bodyEn;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleOpen(notif)}
                    className={`w-full text-start rounded-2xl border p-3.5 flex gap-3 items-start transition-all active:scale-[0.98] ${cfg.bg} ${cfg.border} ${!notif.read ? "shadow-sm" : "opacity-60"}`}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${cfg.iconBg}`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-black text-slate-800 leading-tight">{title}</span>
                        <span className="shrink-0 text-[10px] text-slate-400 mt-0.5">
                          {timeAgo(notif.createdAt, ar)}
                        </span>
                      </div>
                      {body && (
                        <p className="text-[12px] text-slate-600 mt-1 leading-relaxed line-clamp-2">{body}</p>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

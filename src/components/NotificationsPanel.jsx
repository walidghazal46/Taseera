import { markRead, markAllRead } from "../services/notificationService";

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

const TYPE_CONFIG = {
  payment_approved: {
    icon: "✅",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  payment_rejected: {
    icon: "❌",
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
  },
  admin_message: {
    icon: "📢",
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
  },
  broadcast: {
    icon: "📣",
    bg: "bg-violet-50",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.admin_message;

export default function NotificationsPanel({ notifications = [], uid, language = "ar", onClose }) {
  const ar = language === "ar";
  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (notif) => {
    if (!notif.read) {
      try { await markRead(notif.id); } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    if (uid) {
      try { await markAllRead(uid); } catch {}
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
      {/* Header */}
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
                onClick={() => handleMarkRead(notif)}
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
                    <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">{body}</p>
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
    </div>
  );
}

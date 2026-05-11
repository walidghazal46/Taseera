import { useCallback, useEffect, useState } from "react";
import { getAllUsers } from "../services/adminService";
import { getAllPaymentRequests } from "../services/paymentService";
import { approvePaymentRequest, rejectPaymentRequest, suspendUser, unsuspendUser, assignAdminRole, removeAdminRole, cancelSubscription, extendSubscription, deleteUserProfile, getAllDeleteRequests, approveDeleteRequest, rejectDeleteRequest, dismissDeleteRequest } from "../services/adminService";
import { SUPER_ADMIN_EMAIL } from "../data/packages";
import { sendAdminMessage } from "../services/notificationService";

function Badge({ status }) {
  const map = {
    pending:            "bg-amber-100 text-amber-800",
    approved:           "bg-emerald-100 text-emerald-800",
    rejected:           "bg-red-100 text-red-800",
    active:             "bg-emerald-100 text-emerald-800",
    expired:            "bg-slate-100 text-slate-600",
    suspended:          "bg-red-100 text-red-700",
    registered_trial:   "bg-blue-100 text-blue-800",
    guest_trial:        "bg-purple-100 text-purple-800",
    trial_expired:      "bg-orange-100 text-orange-800",
    pending_payment:    "bg-amber-100 text-amber-800",
    rejected_payment:   "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-black text-[#082555] border-b border-slate-200 pb-2">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminDashboard({ profile, isSuperAdmin, language = "ar", onBack }) {
  const ar = language === "ar";
  const adminEmail = profile?.email || "";

  const [tab, setTab]               = useState("requests");
  const [users, setUsers]           = useState([]);
  const [requests, setRequests]     = useState([]);
  const [deleteReqs, setDeleteReqs] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionMsg, setActionMsg]   = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [adminModal, setAdminModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  // Messages tab state
  const [msgTitle, setMsgTitle]   = useState("");
  const [msgBody, setMsgBody]     = useState("");
  const [msgTarget, setMsgTarget] = useState("all"); // "all" | "specific"
  const [msgTargetUid, setMsgTargetUid] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r, dr] = await Promise.all([
        getAllUsers().catch(() => []),
        getAllPaymentRequests().catch(() => []),
        getAllDeleteRequests().catch(() => []),
      ]);
      setUsers(u);
      setRequests(r);
      setDeleteReqs(dr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const handleApprove = async (req) => {
    try {
      await approvePaymentRequest({ requestId: req.id, uid: req.uid, packageId: req.packageId, approvedByEmail: adminEmail });
      flash(ar ? "تم تفعيل الاشتراك." : "Subscription activated.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectPaymentRequest({ requestId: rejectModal.requestId, uid: rejectModal.uid, rejectionReason: rejectReason, rejectedByEmail: adminEmail });
      setRejectModal(null); setRejectReason("");
      flash(ar ? "تم رفض الطلب." : "Request rejected.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleSuspend = async (u) => {
    try {
      await suspendUser({ uid: u.uid, performedByEmail: adminEmail });
      flash(ar ? "تم تعليق الحساب." : "Account suspended.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleUnsuspend = async (u) => {
    try {
      await unsuspendUser({ uid: u.uid, performedByEmail: adminEmail });
      flash(ar ? "تم إعادة تفعيل الحساب." : "Account reactivated.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleAssignAdmin = async (targetUid) => {
    try {
      await assignAdminRole({ targetUid, adminType: "standard", permissions: [], performedByEmail: adminEmail });
      setAdminModal(null);
      flash(ar ? "تم تعيين المشرف." : "Admin assigned.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleCancelSubscription = async () => {
    if (!subModal) return;
    try {
      await cancelSubscription({ uid: subModal.uid, performedByEmail: adminEmail });
      setSubModal(null);
      flash(ar ? "تم إلغاء الاشتراك." : "Subscription cancelled.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleExtendSubscription = async () => {
    if (!subModal) return;
    try {
      await extendSubscription({ uid: subModal.uid, months: extendMonths, performedByEmail: adminEmail });
      setSubModal(null);
      flash(ar ? `تم التمديد بـ ${extendMonths} شهر.` : `Extended by ${extendMonths} month(s).`);
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    try {
      await deleteUserProfile({ uid: deleteModal.uid, performedByEmail: adminEmail });
      setDeleteModal(null);
      flash(ar ? "تم حذف الحساب." : "Account deleted.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleRemoveAdmin = async (targetUid) => {
    try {
      await removeAdminRole({ targetUid, performedByEmail: adminEmail });
      setAdminModal(null);
      flash(ar ? "تم إزالة صلاحيات المشرف." : "Admin role removed.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const pendingRequests     = requests.filter((r) => (r.status || r.requestStatus) === "pending");
  const allRequests         = requests;
  const pendingDeleteReqs   = deleteReqs.filter((r) => r.status === "pending");

  const handleApproveDelete = async (req) => {
    try {
      await approveDeleteRequest({ requestId: req.id, uid: req.uid, performedByEmail: adminEmail });
      flash(ar ? "تم حذف الحساب." : "Account deleted.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleRejectDelete = async (req) => {
    try {
      await rejectDeleteRequest({ requestId: req.id, performedByEmail: adminEmail });
      flash(ar ? "تم رفض طلب الحذف." : "Delete request rejected.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleDismissDelete = async (req) => {
    try {
      await dismissDeleteRequest({ requestId: req.id });
      reload();
    } catch (err) { flash(err.message); }
  };

  const handleSendMessage = async () => {
    if (!msgTitle.trim() || !msgBody.trim()) {
      flash(ar ? "أدخل العنوان والنص." : "Enter title and body.");
      return;
    }
    const uids = msgTarget === "all"
      ? users.map((u) => u.uid).filter(Boolean)
      : [msgTargetUid].filter(Boolean);
    if (uids.length === 0) {
      flash(ar ? "لا يوجد مستخدمون محددون." : "No target users.");
      return;
    }
    setMsgSending(true);
    try {
      await sendAdminMessage({ uids, titleAr: msgTitle, titleEn: msgTitle, bodyAr: msgBody, bodyEn: msgBody });
      setMsgTitle(""); setMsgBody(""); setMsgTargetUid("");
      flash(ar ? `✅ تم الإرسال لـ ${uids.length} مستخدم.` : `✅ Sent to ${uids.length} users.`);
    } catch (err) { flash(err.message); }
    finally { setMsgSending(false); }
  };

  const tabs = [
    { id: "requests", label: ar ? `الطلبات (${pendingRequests.length})` : `Requests (${pendingRequests.length})` },
    { id: "users",    label: ar ? `المستخدمون (${users.length})` : `Users (${users.length})` },
    { id: "delete",   label: ar ? `حذف الحسابات (${pendingDeleteReqs.length})` : `Delete Reqs (${pendingDeleteReqs.length})` },
    { id: "all",      label: ar ? "كل الطلبات" : "All Requests" },
    { id: "messages", label: ar ? "📢 الرسائل" : "📢 Messages" },
  ];

  return (
    <div
      className="flex flex-col bg-[#f3f7ff] min-h-[100dvh]"
      dir={ar ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif", paddingTop: "calc(env(safe-area-inset-top) + 8px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[linear-gradient(135deg,#082555,#16335d)] px-5 py-4 shadow-md">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-1.5 text-white/70 text-xs font-bold hover:text-white transition"
          >
            <span className="text-base leading-none">{ar ? "›" : "‹"}</span>
            {ar ? "رجوع" : "Back"}
          </button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest">Taseera Admin</p>
            <h1 className="text-white text-xl font-black">
              {ar ? "لوحة الإدارة" : "Admin Dashboard"}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">{adminEmail}</p>
          </div>
        </div>
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div className="mx-4 mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800">
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === t.id
                ? "bg-[#082555] text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {ar ? "جارٍ التحميل…" : "Loading…"}
          </div>
        ) : (
          <>
            {/* ── Pending Requests Tab ── */}
            {tab === "requests" && (
              <Section title={ar ? "طلبات الدفع المعلّقة" : "Pending Payment Requests"}>
                {pendingRequests.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">
                    {ar ? "لا توجد طلبات معلّقة." : "No pending requests."}
                  </p>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{req.userEmail}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{req.packageName} · {req.packagePrice} {req.currency}</p>
                        </div>
                        <Badge status={req.status || req.requestStatus} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {req.createdAt?.toDate?.()?.toLocaleDateString?.() || "—"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white"
                        >
                          {ar ? "موافقة" : "Approve"}
                        </button>
                        <button
                          onClick={() => setRejectModal({ requestId: req.id, uid: req.uid })}
                          className="flex-1 rounded-2xl bg-red-500 py-2.5 text-xs font-bold text-white"
                        >
                          {ar ? "رفض" : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </Section>
            )}

            {/* ── Users Tab ── */}
            {tab === "users" && (
              <Section title={ar ? "جميع المستخدمين" : "All Users"}>
                {users.map((u) => {
                  const isSelf    = u.email === adminEmail;
                  const isSuperTarget = u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                  return (
                    <div key={u.uid || u.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{u.displayName || u.email}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge status={u.subscriptionStatus} />
                          {u.role === "admin" && (
                            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 rounded-full px-2 py-0.5">
                              {isSuperTarget ? "Super Admin" : "Admin"}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isSelf && !isSuperTarget && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {/* Subscription control */}
                          <button
                            onClick={() => setSubModal({ uid: u.uid || u.id, email: u.email, status: u.subscriptionStatus })}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700"
                          >
                            {ar ? "إدارة الاشتراك" : "Manage Sub"}
                          </button>

                          {/* Suspend / Unsuspend */}
                          {u.isActive !== false ? (
                            <button
                              onClick={() => handleSuspend(u)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600"
                            >
                              {ar ? "تعليق" : "Suspend"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnsuspend(u)}
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600"
                            >
                              {ar ? "إعادة تفعيل" : "Reactivate"}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModal({ uid: u.uid || u.id, email: u.email })}
                            className="rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-[11px] font-bold text-red-700"
                          >
                            {ar ? "حذف" : "Delete"}
                          </button>

                          {/* Admin controls — Super Admin only */}
                          {isSuperAdmin && (
                            u.role === "admin" ? (
                              <button
                                onClick={() => setAdminModal({ uid: u.uid || u.id, email: u.email, action: "remove" })}
                                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700"
                              >
                                {ar ? "إزالة المشرف" : "Remove Admin"}
                              </button>
                            ) : (
                              <button
                                onClick={() => setAdminModal({ uid: u.uid || u.id, email: u.email, action: "assign" })}
                                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700"
                              >
                                {ar ? "تعيين مشرف" : "Make Admin"}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* ── Delete Requests Tab ── */}
            {tab === "delete" && (
              <Section title={ar ? "طلبات حذف الحسابات" : "Account Deletion Requests"}>
                {deleteReqs.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">{ar ? "لا توجد طلبات حذف." : "No deletion requests."}</p>
                ) : (
                  deleteReqs.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl border border-red-100 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{req.email}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{req.createdAt?.toDate?.()?.toLocaleDateString?.() || "—"}</p>
                        </div>
                        <Badge status={req.status} />
                      </div>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveDelete(req)} className="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-bold text-white">
                            {ar ? "موافقة (حذف)" : "Approve (Delete)"}
                          </button>
                          <button onClick={() => handleRejectDelete(req)} className="flex-1 rounded-2xl bg-slate-200 py-2.5 text-xs font-bold text-slate-700">
                            {ar ? "رفض" : "Reject"}
                          </button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <button onClick={() => handleDismissDelete(req)} className="w-full rounded-2xl border border-slate-200 py-2 text-xs font-bold text-slate-500">
                          {ar ? "إزالة من القائمة" : "Dismiss"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </Section>
            )}

            {/* ── All Requests Tab ── */}
            {tab === "all" && (
              <Section title={ar ? "جميع طلبات الدفع" : "All Payment Requests"}>
                {allRequests.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">
                    {ar ? "لا توجد طلبات." : "No requests."}
                  </p>
                ) : (
                  allRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{req.userEmail}</p>
                          <p className="text-xs text-slate-500">{req.packageName} · {req.packagePrice} {req.currency}</p>
                        </div>
                        <Badge status={req.status || req.requestStatus} />
                      </div>
                      {req.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {ar ? "سبب الرفض: " : "Reason: "}{req.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {req.createdAt?.toDate?.()?.toLocaleDateString?.() || "—"}
                      </p>
                    </div>
                  ))
                )}
              </Section>
            )}
            {/* ── Messages Tab ── */}
            {tab === "messages" && (
              <Section title={ar ? "إرسال رسالة للمستخدمين" : "Send Message to Users"}>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {/* Target */}
                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-2">{ar ? "المستلمون:" : "Recipients:"}</p>
                    <div className="flex gap-2">
                      {[{ v: "all", ar: "جميع المستخدمين", en: "All Users" }, { v: "specific", ar: "مستخدم محدد", en: "Specific User" }].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setMsgTarget(opt.v)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${msgTarget === opt.v ? "border-[#082555] bg-[#082555] text-white" : "border-slate-200 text-slate-600"}`}
                        >
                          {ar ? opt.ar : opt.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific user picker */}
                  {msgTarget === "specific" && (
                    <div>
                      <p className="text-xs font-bold text-slate-600 mb-1">{ar ? "اختر المستخدم:" : "Select user:"}</p>
                      <select
                        value={msgTargetUid}
                        onChange={(e) => setMsgTargetUid(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        dir="ltr"
                      >
                        <option value="">{ar ? "— اختر —" : "— Choose —"}</option>
                        {users.filter((u) => u.uid).map((u) => (
                          <option key={u.uid} value={u.uid}>{u.email}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-1">{ar ? "عنوان الرسالة:" : "Title:"}</p>
                    <input
                      value={msgTitle}
                      onChange={(e) => setMsgTitle(e.target.value)}
                      placeholder={ar ? "مثال: عرض خاص لشهر رمضان" : "e.g. Special Ramadan offer"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#082555]"
                      dir={ar ? "rtl" : "ltr"}
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-1">{ar ? "نص الرسالة:" : "Message body:"}</p>
                    <textarea
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      rows={3}
                      placeholder={ar ? "اكتب محتوى الرسالة هنا..." : "Write message content here..."}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#082555]"
                      dir={ar ? "rtl" : "ltr"}
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={msgSending || !msgTitle.trim() || !msgBody.trim()}
                    className="w-full rounded-2xl bg-[linear-gradient(135deg,#082555,#16335d)] py-3 text-sm font-black text-white disabled:opacity-50 transition active:scale-[0.98]"
                  >
                    {msgSending
                      ? (ar ? "جارٍ الإرسال…" : "Sending…")
                      : (ar ? "📢 إرسال الرسالة" : "📢 Send Message")}
                  </button>
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50" onClick={() => setRejectModal(null)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-[28px] p-5 space-y-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <h2 className="text-base font-black text-slate-800">
              {ar ? "سبب الرفض" : "Rejection Reason"}
            </h2>
            <textarea
              className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#082555] resize-none"
              rows={3}
              placeholder={ar ? "اكتب سبب الرفض…" : "Enter rejection reason…"}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleReject} className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white">
                {ar ? "تأكيد الرفض" : "Confirm Reject"}
              </button>
              <button onClick={() => setRejectModal(null)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600">
                {ar ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription management modal */}
      {subModal && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50" onClick={() => setSubModal(null)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-[28px] p-5 space-y-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <div>
              <h2 className="text-base font-black text-slate-800">{ar ? "إدارة الاشتراك" : "Manage Subscription"}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{subModal.email}</p>
              <Badge status={subModal.status} />
            </div>

            {/* Extend */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-sm font-bold text-emerald-800">{ar ? "تمديد الاشتراك" : "Extend Subscription"}</p>
              <div className="flex items-center gap-3">
                <label className="text-xs text-emerald-700 font-semibold shrink-0">{ar ? "عدد الأشهر:" : "Months:"}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExtendMonths(m => Math.max(1, m - 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-emerald-300 text-emerald-800 font-black text-sm">−</button>
                  <span className="w-6 text-center font-black text-emerald-900">{extendMonths}</span>
                  <button onClick={() => setExtendMonths(m => Math.min(24, m + 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-emerald-300 text-emerald-800 font-black text-sm">+</button>
                </div>
              </div>
              <button onClick={handleExtendSubscription} className="w-full rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white">
                {ar ? `تمديد ${extendMonths} شهر` : `Extend ${extendMonths} month(s)`}
              </button>
            </div>

            {/* Cancel */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
              <p className="text-sm font-bold text-red-800">{ar ? "إلغاء الاشتراك" : "Cancel Subscription"}</p>
              <p className="text-xs text-red-600">{ar ? "سيتم إلغاء الباقة الحالية وإيقاف الوصول فوراً." : "Current package will be revoked and access stopped immediately."}</p>
              <button onClick={handleCancelSubscription} className="w-full rounded-2xl bg-red-600 py-2.5 text-xs font-bold text-white">
                {ar ? "إلغاء الاشتراك" : "Cancel Subscription"}
              </button>
            </div>

            <button onClick={() => setSubModal(null)} className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600">
              {ar ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4" onClick={() => setDeleteModal(null)}>
          <div
            className="w-full max-w-sm bg-white rounded-[28px] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🗑️</div>
              <h2 className="text-base font-black text-slate-800">{ar ? "حذف الحساب" : "Delete Account"}</h2>
              <p className="text-sm text-slate-500 mt-1">{deleteModal.email}</p>
              <p className="text-xs text-red-600 mt-2">{ar ? "هذا الإجراء لا يمكن التراجع عنه." : "This action cannot be undone."}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDeleteUser} className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white">
                {ar ? "تأكيد الحذف" : "Confirm Delete"}
              </button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600">
                {ar ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin role modal */}
      {adminModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4" onClick={() => setAdminModal(null)}>
          <div
            className="w-full max-w-sm bg-white rounded-[28px] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <h2 className="text-base font-black text-slate-800">
              {adminModal.action === "assign"
                ? (ar ? "تعيين مشرف" : "Assign Admin Role")
                : (ar ? "إزالة صلاحيات المشرف" : "Remove Admin Role")}
            </h2>
            <p className="text-sm text-slate-600">{adminModal.email}</p>
            <div className="flex gap-2">
              <button
                onClick={() => adminModal.action === "assign" ? handleAssignAdmin(adminModal.uid) : handleRemoveAdmin(adminModal.uid)}
                className={`flex-1 rounded-2xl py-3 text-sm font-bold text-white ${adminModal.action === "assign" ? "bg-blue-600" : "bg-red-600"}`}
              >
                {adminModal.action === "assign" ? (ar ? "تعيين" : "Assign") : (ar ? "إزالة" : "Remove")}
              </button>
              <button onClick={() => setAdminModal(null)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600">
                {ar ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

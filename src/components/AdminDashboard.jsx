import { useCallback, useEffect, useState } from "react";
import { getAllUsers } from "../services/adminService";
import { getAllPaymentRequests } from "../services/paymentService";
import { approvePaymentRequest, rejectPaymentRequest, suspendUser, unsuspendUser, assignAdminRole, removeAdminRole } from "../services/adminService";
import { SUPER_ADMIN_EMAIL } from "../data/packages";

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

export default function AdminDashboard({ profile, isSuperAdmin, language = "ar" }) {
  const ar = language === "ar";
  const adminEmail = profile?.email || "";

  const [tab, setTab]               = useState("requests");
  const [users, setUsers]           = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionMsg, setActionMsg]   = useState("");
  const [rejectModal, setRejectModal] = useState(null); // { requestId, uid }
  const [rejectReason, setRejectReason] = useState("");
  const [adminModal, setAdminModal] = useState(null);   // { uid, email, currentRole }

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([getAllUsers(), getAllPaymentRequests()]);
      setUsers(u);
      setRequests(r);
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

  const handleRemoveAdmin = async (targetUid) => {
    try {
      await removeAdminRole({ targetUid, performedByEmail: adminEmail });
      setAdminModal(null);
      flash(ar ? "تم إزالة صلاحيات المشرف." : "Admin role removed.");
      reload();
    } catch (err) { flash(err.message); }
  };

  const pendingRequests = requests.filter((r) => (r.status || r.requestStatus) === "pending");
  const allRequests     = requests;

  const tabs = [
    { id: "requests", label: ar ? `الطلبات (${pendingRequests.length})` : `Requests (${pendingRequests.length})` },
    { id: "users",    label: ar ? `المستخدمون (${users.length})` : `Users (${users.length})` },
    { id: "all",      label: ar ? "كل الطلبات" : "All Requests" },
  ];

  return (
    <div
      className="flex flex-col bg-[#f3f7ff] min-h-[100dvh]"
      dir={ar ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif", paddingTop: "calc(env(safe-area-inset-top) + 8px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
    >
      {/* Header */}
      <div className="bg-[linear-gradient(135deg,#082555,#16335d)] px-5 py-4 shadow-md">
        <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest">Taseera Admin</p>
        <h1 className="text-white text-xl font-black">
          {ar ? "لوحة الإدارة" : "Admin Dashboard"}
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">{adminEmail}</p>
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

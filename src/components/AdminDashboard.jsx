import { useCallback, useEffect, useState } from "react";
import {
  approvePaymentRequest,
  deleteUserByAdmin,
  getDashboardStats,
  listPaymentRequests,
  listUsersPage,
  searchUsersGlobal,
  rejectPaymentRequest,
  setUserSuspended,
  adminApproveCancellation,
  adminRejectCancellation,
  listenActiveSubscriptions,
  listenCancellationRequests,
  listenDeletionRequests,
} from "../services/adminService";
import { syncMissingAuthUsers } from "../services/adminSyncService";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const USERS_PAGE_SIZE = 10;

const MENU = [
  { id: "dashboard", labelAr: "لوحة التحكم", labelEn: "Dashboard" },
  { id: "users", labelAr: "المستخدمون", labelEn: "Users" },
  { id: "pending", labelAr: "طلبات معلقة", labelEn: "Pending" },
  { id: "payments", labelAr: "المدفوعات", labelEn: "Payments" },
  { id: "subscriptions", labelAr: "الاشتراكات", labelEn: "Subscriptions" },
  { id: "admins", labelAr: "المشرفون", labelEn: "Admins" },
  { id: "logs", labelAr: "السجلات", labelEn: "Logs" },
  { id: "settings", labelAr: "الإعدادات", labelEn: "Settings" },
];

function fmtDate(value) {
  if (!value) return "-";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB");
}

function StatCard({ label, value, tone = "blue", icon }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-800",
    green: "border-emerald-100 bg-emerald-50 text-emerald-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    rose: "border-rose-100 bg-rose-50 text-rose-800",
  };
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-2 text-[24px] font-black leading-none">{value}</div>
    </div>
  );
}

export default function AdminDashboard({ language = "ar", adminProfile, onToast, initialTab = "dashboard" }) {
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState(initialTab || "dashboard");
  const [stats, setStats] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paidFilter] = useState("all");

  // Payments State
  const [payments, setPayments] = useState([]);

  // Real-time Listeners State
  const [, setActiveSubs] = useState([]);
  const [cancelReqs, setCancelReqs] = useState([]);
  const [deleteReqs, setDeleteReqs] = useState([]);

  const canManageAdmins = adminProfile?.adminType === "super";

  const handleSyncUsers = useCallback(async () => {
    if (!canManageAdmins) return;
    try {
      const result = await syncMissingAuthUsers();
      onToast?.(isEn ? `Sync complete. Added ${result.created || 0} missing users.` : `اكتملت المزامنة. تمت إضافة ${result.created || 0} مستخدم ناقص.`, "success");
      loadStats();
      loadUsers(true);
    } catch (error) {
      onToast?.(error?.message || (isEn ? "User sync failed." : "فشلت مزامنة المستخدمين."), "warning");
    }
  }, [canManageAdmins, onToast, isEn]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      onToast?.(e.message, "warning");
    }
  }, [onToast]);

  const loadUsers = useCallback(async (reset = false) => {
    setUsersLoading(true);
    try {
      const result = await listUsersPage({
        pageSize: USERS_PAGE_SIZE,
        cursor: reset ? null : usersCursor,
        status: statusFilter,
        paid: paidFilter,
      });
      setUsers(prev => (reset ? result.rows : [...prev, ...result.rows]));
      setUsersCursor(result.lastDoc);
      setUsersHasMore(result.hasMore);
    } catch (e) {
      onToast?.(e.message, "warning");
    } finally {
      setUsersLoading(false);
    }
  }, [paidFilter, statusFilter, usersCursor, onToast]);

  const handleSearch = useCallback(async (text) => {
    if (text.length < 2) {
      loadUsers(true);
      return;
    }
    setUsersLoading(true);
    try {
      const result = await searchUsersGlobal(text);
      setUsers(result);
      setUsersHasMore(false);
    } catch (e) {
      onToast?.(e.message, "warning");
    } finally {
      setUsersLoading(false);
    }
  }, [loadUsers, onToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === "users") loadUsers(true);
    if (activeTab === "pending" || activeTab === "payments") {
       listPaymentRequests({ pageSize: 50 }).then(data => {
         setPayments(data);
       });
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    const unsubs = [
      listenActiveSubscriptions(setActiveSubs),
      listenCancellationRequests(setCancelReqs),
      listenDeletionRequests(setDeleteReqs),
    ];
    return () => unsubs.forEach(fn => fn?.());
  }, []);

  return (
    <div className="w-full space-y-5" style={{ fontFamily: AR }}>
      {/* Tab Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {MENU.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-[12px] font-bold transition-all ${
              activeTab === item.id
                ? "bg-[#082555] text-[#C9A84C] shadow-md"
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {isEn ? item.labelEn : item.labelAr}
            {item.id === "pending" && cancelReqs.length + deleteReqs.length > 0 && (
              <span className="ms-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">
                {cancelReqs.length + deleteReqs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Users" value={stats?.totalUsers || 0} tone="blue" icon="👥" />
              <StatCard label="Active Subs" value={stats?.activeUsers || 0} tone="green" icon="💎" />
              <StatCard label="Pending" value={stats?.pendingRequests || 0} tone="amber" icon="⏳" />
              <StatCard label="Suspended" value={stats?.suspendedUsers || 0} tone="rose" icon="🚫" />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => setActiveTab("pending")} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📝</span>
                    <span className="text-[13px] font-bold">Review Pending Payments</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </button>
                <button onClick={() => setActiveTab("users")} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔍</span>
                    <span className="text-[13px] font-bold">Search & Manage Users</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex gap-2">
               <input
                 value={queryText}
                 onChange={e => { setQueryText(e.target.value); handleSearch(e.target.value); }}
                 placeholder="Search by name or email..."
                 className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-[13px] outline-none focus:border-[#082555]"
               />
               <select
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value)}
                 className="rounded-xl border border-slate-200 px-3 text-[12px] font-bold"
               >
                 <option value="all">All Status</option>
                 <option value="approved">Approved</option>
                 <option value="suspended">Suspended</option>
               </select>
             </div>

             <div className="space-y-3">
                {users.map(user => (
                  <div key={user.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-[#082555]/20 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[14px] font-bold text-slate-800">{user.name || "User"}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${user.status === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.status || 'approved'}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                           <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">Plan: {user.plan || 'none'}</span>
                           <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">Paid: {user.isPaid ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button
                           onClick={() => setUserSuspended(adminProfile, user.id, user.status !== 'suspended').then(() => loadUsers(true))}
                           className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${user.status === 'suspended' ? 'bg-emerald-600 text-white' : 'bg-rose-50 text-rose-700'}`}
                         >
                           {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                         </button>
                         <button
                           onClick={() => { if(window.confirm('Delete user?')) deleteUserByAdmin(adminProfile, user.id).then(() => loadUsers(true)) }}
                           className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
                         >
                           Delete
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
                {usersHasMore && (
                  <button onClick={() => loadUsers()} className="w-full rounded-xl py-3 text-[13px] font-bold text-slate-500 hover:bg-slate-50">
                    {usersLoading ? 'Loading...' : 'Load More Users'}
                  </button>
                )}
             </div>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
             <h3 className="text-[15px] font-bold text-slate-800">Pending Approvals</h3>

             {/* Payment Requests */}
             <div className="space-y-3">
               {payments.filter(p => p.status === 'pending').map(req => (
                 <div key={req.id} className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                   <div className="flex items-start justify-between gap-3">
                     <div>
                       <p className="text-[14px] font-bold text-slate-800">{req.userName || req.email}</p>
                       <p className="text-[11px] text-slate-500">{req.selectedPlan} · {req.amount} {req.currency}</p>
                       <p className="mt-1 text-[10px] font-bold text-[#082555]">Method: {req.paymentMethod}</p>
                     </div>
                     <div className="flex gap-2">
                        <button
                          onClick={() => approvePaymentRequest(adminProfile, req.id).then(() => { onToast('Approved','success'); setActiveTab('payments'); })}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white shadow-md"
                        >Approve</button>
                        <button
                          onClick={() => { const r = window.prompt('Reason?'); if(r) rejectPaymentRequest(adminProfile, req.id, r).then(() => loadUsers(true)) }}
                          className="rounded-xl bg-white border border-rose-200 px-4 py-2 text-[11px] font-bold text-rose-700"
                        >Reject</button>
                     </div>
                   </div>
                 </div>
               ))}
               {payments.filter(p => p.status === 'pending').length === 0 && (
                 <p className="text-center py-10 text-slate-400 text-[13px]">No pending payment requests.</p>
               )}
             </div>

             {/* Cancellation Requests */}
             {cancelReqs.length > 0 && (
               <div className="space-y-3 pt-4 border-t border-slate-100">
                 <h4 className="text-[13px] font-bold text-rose-700">Cancellation Requests</h4>
                 {cancelReqs.map(user => (
                   <div key={user.id} className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 flex items-center justify-between">
                     <div>
                       <p className="text-[14px] font-bold text-slate-800">{user.name || user.email}</p>
                       <p className="text-[11px] text-slate-500">Reason: {user.cancellationRequest?.reason || 'None'}</p>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => adminApproveCancellation(adminProfile, user.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white">Approve</button>
                        <button onClick={() => adminRejectCancellation(adminProfile, user.id)} className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600">Reject</button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-3">
             {payments.map(req => (
               <div key={req.id} className="rounded-xl border border-slate-100 p-3 text-[12px]">
                 <div className="flex justify-between">
                   <span className="font-bold text-slate-800">{req.userName || req.email}</span>
                   <span className={`font-bold ${req.status === 'approved' ? 'text-emerald-600' : req.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                     {req.status}
                   </span>
                 </div>
                 <div className="mt-1 text-slate-500">
                   {req.selectedPlan} · {req.amount} {req.currency} · {fmtDate(req.createdAt)}
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 p-5 bg-white">
              <h3 className="text-[15px] font-bold mb-4">Runtime Settings</h3>
              <p className="text-[12px] text-slate-500 mb-4">Manage app-wide settings like default plan prices and ad banners.</p>

              <div className="grid gap-4">
                 <button onClick={() => onToast('Syncing ads...','info')} className="w-full rounded-xl bg-[#082555] py-3 text-[13px] font-bold text-[#C9A84C]">
                   Update All Ad Banners
                 </button>
                 <button onClick={handleSyncUsers} className="w-full rounded-xl border border-[#082555] py-3 text-[13px] font-bold text-[#082555]">
                   Sync Auth Users to Firestore
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

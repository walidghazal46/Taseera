import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { ADMIN_PERMISSIONS, DEFAULT_LIMITED_PERMISSIONS } from "../constants/admin";
import {
  approvePaymentRequest,
  deleteUserByAdmin,
  getDashboardStats,
  hasPermission,
  listAdminLogs,
  listAdmins,
  listPaymentRequests,
  listUsersPage,
  searchUsersGlobal,
  rejectPaymentRequest,
  removeAdmin,
  seedAdminUsersByEmail,
  setUserSuspended,
  updateUserByAdmin,
  upsertLimitedAdmin,
  adminRevokeSubscription,
  adminRestoreSubscription,
  listenActiveSubscriptions,
} from "../services/adminApi";
import {
  AD_SLOT_IDS,
  DEFAULT_AD_BANNER,
  DEFAULT_PAYMENT_SETTINGS,
  listenAdBanner,
  listenPaymentSettings,
  saveAdBanner,
  savePaymentSettings,
  adminApproveCancellation,
  adminRejectCancellation,
  adminApproveAccountDeletion,
  adminRejectAccountDeletion,
  listenCancellationRequests,
  listenDeletionRequests,
} from "../services/subscriptionApi";
import {
  listenAllQSPremiumRequests,
  adminApproveQSPremium,
  adminRejectQSPremium,
  adminDeactivateQSPremium,
  adminReactivateQSPremium,
  adminDeleteQSPremium,
  adminHandleRefund,
} from "../services/qsPremiumApi";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

const MENU = [
  { id: "dashboard", labelAr: "Dashboard", labelEn: "Dashboard" },
  { id: "users", labelAr: "Users", labelEn: "Users" },
  { id: "pending", labelAr: "Pending Approvals", labelEn: "Pending Approvals" },
  { id: "payments", labelAr: "Payments", labelEn: "Payments" },
  { id: "subscriptions", labelAr: "Subscriptions", labelEn: "Subscriptions" },
  { id: "admins", labelAr: "Admins", labelEn: "Admins" },
  { id: "logs", labelAr: "Logs", labelEn: "Logs" },
  { id: "settings", labelAr: "Settings", labelEn: "Settings" },
  { id: "qspremium", labelAr: "QS Premium", labelEn: "QS Premium" },
];

const MENU_META = {
  dashboard: { icon: "▦", accent: "#3b5bff", tint: "#eef2ff" },
  users: { icon: "👥", accent: "#4f46e5", tint: "#eef2ff" },
  pending: { icon: "📝", accent: "#f97316", tint: "#fff7ed" },
  payments: { icon: "💳", accent: "#22c55e", tint: "#ecfdf5" },
  subscriptions: { icon: "♛", accent: "#14b8a6", tint: "#ecfeff" },
  admins: { icon: "🛡", accent: "#8b5cf6", tint: "#f5f3ff" },
  logs: { icon: "📄", accent: "#a855f7", tint: "#faf5ff" },
  settings: { icon: "⚙", accent: "#64748b", tint: "#f8fafc" },
  qspremium: { icon: "◇", accent: "#eab308", tint: "#fffbeb" },
};

function fmtDate(value) {
  if (!value) return "-";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB");
}

function StatCard({ label, value, tone = "blue" }) {
  const tones = {
    blue: "border-[#dbeafe] bg-[#eff6ff] text-[#1e3a8a]",
    green: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
    amber: "border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
    red: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  };

  return (
    <div className={`rounded-2xl border p-3 ${tones[tone] || tones.blue}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</div>
      <div className="mt-2 text-[22px] font-extrabold" style={{ fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function PermissionTag({ active }) {
  return (
    <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {active ? "Yes" : "No"}
    </span>
  );
}

function DonutChart({ items, title }) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1;
  const radius = 34;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let offsetAcc = 0;

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <p className="mb-3 text-[12px] font-bold text-[#0f172a]">{title}</p>
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px]">
          <svg className="h-[84px] w-[84px] -rotate-90" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={normalizedRadius} stroke="#e2e8f0" strokeWidth={stroke} fill="transparent" />
            {items.map((item) => {
              const segment = (item.value / total) * circumference;
              const dashOffset = circumference - offsetAcc;
              offsetAcc += segment;
              return (
                <circle
                  key={item.label}
                  cx="42"
                  cy="42"
                  r={normalizedRadius}
                  stroke={item.hex}
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={`${segment} ${circumference - segment}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-600">{total}</div>
        </div>
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.hex }} />
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendChart({ today, week, month }) {
  const points = [today, week, month];
  const max = Math.max(...points, 1);
  const width = 280;
  const height = 90;
  const step = width / (points.length - 1);
  const coords = points
    .map((val, idx) => {
      const x = idx * step;
      const y = height - (val / max) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <p className="mb-2 text-[12px] font-bold text-[#0f172a]">New Users Trend</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[100px] w-full">
        <polyline fill="none" stroke="#cbd5e1" strokeWidth="1" points={`0,${height - 5} ${width},${height - 5}`} />
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={coords} />
        {points.map((val, idx) => {
          const x = idx * step;
          const y = height - (val / max) * (height - 10) - 5;
          return <circle key={`${val}-${idx}`} cx={x} cy={y} r="4" fill="#1d4ed8" />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-3 text-center text-[10px] font-bold text-slate-500">
        <span>Today ({today})</span>
        <span>Week ({week})</span>
        <span>Month ({month})</span>
      </div>
    </div>
  );
}

// ── New KPI card with gradient background ─────────────────────────────────
function KpiCard({ icon, label, value, sub, bg, border, valueColor, labelColor }) {
  return (
    <div
      className="relative min-w-0 overflow-hidden rounded-[28px] border p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)]"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex min-h-[148px] flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] leading-4" style={{ color: labelColor }}>
              {label}
            </p>
            {sub && (
              <p className="mt-2 text-[11px] leading-5" style={{ color: labelColor }}>
                {sub}
              </p>
            )}
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[24px] shadow-sm" style={{ color: valueColor, borderColor: border, background: "rgba(255,255,255,0.45)" }}>
            {icon}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[34px] font-extrabold leading-none sm:text-[38px]" style={{ color: valueColor }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Area sparkline for new-user trend ─────────────────────────────────────
function AreaSparkLine({ points, color, labels }) {
  const vals = points.map((p) => p.value);
  const max = Math.max(...vals, 1);
  const W = 400; const H = 72;
  const step = vals.length > 1 ? W / (vals.length - 1) : W;
  const pts = vals.map((v, i) => [i * step, H - (v / max) * (H - 14) - 7]);
  const linePath = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  const uid = `spark${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "72px" }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${uid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4.5" fill={color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      {labels && (
        <div
          className="mt-2 grid text-center text-[10px] font-bold text-slate-500"
          style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}
        >
          {labels.map((l, i) => (
            <span key={i}>{l}<br /><span style={{ color, fontSize: "13px", fontWeight: 800 }}>{vals[i]}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pending-action feed item ───────────────────────────────────────────────
function ActionFeedItem({ icon, title, name, color, onGo }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e8edf4] bg-[#fafbfd] p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[17px]"
        style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
        <p className="truncate text-[12px] font-semibold text-slate-800">{name || "—"}</p>
      </div>
      <button
        type="button"
        onClick={onGo}
        className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition-opacity hover:opacity-80"
        style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      >
        Review →
      </button>
    </div>
  );
}

// ── Horizontal stacked bar ─────────────────────────────────────────────────
function StackedBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
      {segments.map((seg) => (
        <div
          key={seg.label}
          style={{ width: `${(seg.value / total) * 100}%`, background: seg.hex }}
          title={`${seg.label}: ${seg.value}`}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard({ language = "ar", adminProfile, onToast, initialTab = "dashboard" }) {
  const isEn = language === "en";
  const t = useMemo(
    () => ({
      title: isEn ? "Admin Dashboard" : "Admin Dashboard",
      unauthorized: isEn ? "Access denied. You are not an admin." : "لا يمكن الوصول: لا تملك صلاحيات الأدمن.",
      loading: isEn ? "Loading admin data..." : "جاري تحميل بيانات الأدمن...",
      users: isEn ? "Users" : "المستخدمون",
      email: isEn ? "Email" : "الإيميل",
      phone: isEn ? "Phone" : "الهاتف",
      status: isEn ? "Status" : "الحالة",
      subscription: isEn ? "Subscription" : "الاشتراك",
      paid: isEn ? "Paid" : "مدفوع",
      createdAt: isEn ? "Created" : "تاريخ التسجيل",
      actions: isEn ? "Actions" : "الإجراءات",
      searchPlaceholder: isEn ? "Search by name / email / phone" : "بحث بالاسم / الإيميل / الهاتف",
      all: isEn ? "All" : "الكل",
      active: isEn ? "Approved" : "مقبول",
      pending: isEn ? "Pending" : "معلق",
      rejected: isEn ? "Rejected" : "مرفوض",
      suspended: isEn ? "Suspended" : "موقوف",
      unpaid: isEn ? "Unpaid" : "غير مدفوع",
      paidOnly: isEn ? "Paid" : "مدفوع",
      save: isEn ? "Save" : "حفظ",
      cancel: isEn ? "Cancel" : "إلغاء",
      edit: isEn ? "Edit" : "تعديل",
      suspend: isEn ? "Suspend" : "تعطيل",
      activate: isEn ? "Activate" : "تفعيل",
      remove: isEn ? "Delete" : "حذف",
      approve: isEn ? "Approve" : "Approve",
      reject: isEn ? "Reject" : "Reject",
      addAdmin: isEn ? "Add Limited Admin" : "إضافة Admin Limited",
      permissions: isEn ? "Permissions" : "الصلاحيات",
      noData: isEn ? "No data" : "لا توجد بيانات",
      loadMore: isEn ? "Load more" : "تحميل المزيد",
      refresh: isEn ? "Refresh" : "تحديث",
    }),
    [isEn]
  );

  const [activeTab, setActiveTab] = useState(initialTab || "dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentDateFrom, setPaymentDateFrom] = useState("");
  const [paymentDateTo, setPaymentDateTo] = useState("");
  const [paymentSearchText, setPaymentSearchText] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPermissions, setAdminPermissions] = useState(DEFAULT_LIMITED_PERMISSIONS);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [paymentSettingsDraft, setPaymentSettingsDraft] = useState(DEFAULT_PAYMENT_SETTINGS);
  const [analysisTopAdDraft, setAnalysisTopAdDraft] = useState(DEFAULT_AD_BANNER);
  const [analysisBottomAdDraft, setAnalysisBottomAdDraft] = useState(DEFAULT_AD_BANNER);
  const [areaFormAdDraft, setAreaFormAdDraft] = useState(DEFAULT_AD_BANNER);
  const [areaResultsAdDraft, setAreaResultsAdDraft] = useState(DEFAULT_AD_BANNER);
  const [companiesPaginationAdDraft, setCompaniesPaginationAdDraft] = useState(DEFAULT_AD_BANNER);
  const [suppliersPaginationAdDraft, setSuppliersPaginationAdDraft] = useState(DEFAULT_AD_BANNER);
  const [selfPricingAdDraft, setSelfPricingAdDraft] = useState(DEFAULT_AD_BANNER);
  const [savingSettings, setSavingSettings] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmRemoveAdmin, setConfirmRemoveAdmin] = useState(null);
  const [pendingRejectRequest, setPendingRejectRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Subscriptions (Taseera Pro) state
  const [activeSubs, setActiveSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsDetail, setSubsDetail] = useState(null);
  const [subsSearch, setSubsSearch] = useState("");
  const [cancelReqs, setCancelReqs] = useState([]);
  const [deleteReqs, setDeleteReqs] = useState([]);

  // QS Premium state
  const [qsRequests, setQsRequests] = useState([]);
  const [qsLoading, setQsLoading] = useState(false);
  const [qsRefundModal, setQsRefundModal] = useState(null);
  const [qsRejectModal, setQsRejectModal] = useState(null);
  const [qsRejectReason, setQsRejectReason] = useState("");
  const [qsRefundNotes, setQsRefundNotes] = useState("");
  const [qsFilter, setQsFilter] = useState("all");
  const [qsDetailModal, setQsDetailModal] = useState(null); // selected request object

  useEffect(() => {
    const hasMenuTab = MENU.some((tab) => tab.id === initialTab);
    if (hasMenuTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const canViewUsers = hasPermission(adminProfile, "viewUsers");
  const canEditUsers = hasPermission(adminProfile, "editUsers");
  const canSuspendUsers = hasPermission(adminProfile, "suspendUsers");
  const canDeleteUsers = hasPermission(adminProfile, "deleteUsers");
  const canApprovePayments = hasPermission(adminProfile, "approvePayments");
  const canViewPayments = hasPermission(adminProfile, "viewPayments");
  const canManageAdmins = adminProfile?.adminType === "super";
  const canViewLogs = hasPermission(adminProfile, "viewLogs");
  const canManageRuntimeSettings = hasPermission(adminProfile, "approvePayments");

  const isSearchingAllUsers = queryText.trim().length >= 2;

  const filteredUsers = useMemo(() => users, [users]);
  const filteredPayments = useMemo(() => {
    const queryTextLower = paymentSearchText.trim().toLowerCase();
    const fromDate = paymentDateFrom ? new Date(`${paymentDateFrom}T00:00:00`) : null;
    const toDate = paymentDateTo ? new Date(`${paymentDateTo}T23:59:59`) : null;

    return payments.filter((row) => {
      const statusOk = paymentStatusFilter === "all" || row.requestStatus === paymentStatusFilter;
      const methodOk = paymentMethodFilter === "all" || row.paymentMethod === paymentMethodFilter;
      const rowDateValue = typeof row.createdAt?.toDate === "function" ? row.createdAt.toDate() : row.createdAt ? new Date(row.createdAt) : null;
      const fromOk = !fromDate || (rowDateValue && rowDateValue >= fromDate);
      const toOk = !toDate || (rowDateValue && rowDateValue <= toDate);
      const searchOk = !queryTextLower || [
        row.userName,
        row.email,
        row.orderId,
        row.userSerial,
        row.paymentReference,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(queryTextLower));

      return statusOk && methodOk && fromOk && toOk && searchOk;
    });
  }, [paymentDateFrom, paymentDateTo, paymentMethodFilter, paymentSearchText, paymentStatusFilter, payments]);

  const paymentMethodOptions = useMemo(() => {
    const methods = new Set(payments.map((row) => row.paymentMethod).filter(Boolean));
    return Array.from(methods);
  }, [payments]);

  const exportPaymentsCsv = useCallback(() => {
    const rows = filteredPayments;
    if (!rows.length) {
      onToast?.("No rows to export", "warning");
      return;
    }

    const escapeCell = (value) => {
      const normalized = String(value ?? "").replace(/"/g, '""');
      return `"${normalized}"`;
    };

    const header = [
      "orderId",
      "userSerial",
      "userName",
      "email",
      "paymentMethod",
      "amount",
      "currency",
      "requestStatus",
      "paymentStatus",
      "adminNote",
      "rejectionReason",
      "paymentReference",
      "receiptUrl",
      "createdAt",
    ];

    const body = rows.map((row) => [
      row.orderId,
      row.userSerial,
      row.userName,
      row.email,
      row.paymentMethod,
      row.amount,
      row.currency,
      row.requestStatus,
      row.paymentStatus,
      row.adminNote,
      row.rejectionReason,
      row.paymentReference,
      row.receiptUrl,
      fmtDate(row.createdAt),
    ]);

    const csv = [header, ...body]
      .map((line) => line.map((cell) => escapeCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", `payment-requests-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    onToast?.("CSV exported", "success");
  }, [filteredPayments, onToast]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      onToast?.(error.message || "Failed to load stats", "warning");
    } finally {
      setStatsLoading(false);
    }
  }, [onToast]);

  const loadUsers = useCallback(
    async (reset = false) => {
      if (!canViewUsers) return;
      setUsersLoading(true);
      try {
        const page = await listUsersPage({
          pageSize: 12,
          cursor: reset ? null : usersCursor,
          status: statusFilter,
          paid: paidFilter,
        });

        setUsers((current) => (reset ? page.rows : [...current, ...page.rows]));
        setUsersCursor(page.lastDoc);
        setUsersHasMore(page.hasMore);
      } catch (error) {
        onToast?.(error.message || "Failed to load users", "warning");
      } finally {
        setUsersLoading(false);
      }
    },
    [canViewUsers, onToast, paidFilter, statusFilter, usersCursor]
  );

  const loadPayments = useCallback(async () => {
    if (!canViewPayments && !canApprovePayments) return;
    setPaymentsLoading(true);
    try {
      const data = await listPaymentRequests({ pageSize: 30 });
      setPayments(data);
    } catch (error) {
      onToast?.(error.message || "Failed to load payments", "warning");
    } finally {
      setPaymentsLoading(false);
    }
  }, [canApprovePayments, canViewPayments, onToast]);

  const loadAdmins = useCallback(async () => {
    if (!canManageAdmins) return;
    setAdminsLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch (error) {
      onToast?.(error.message || "Failed to load admins", "warning");
    } finally {
      setAdminsLoading(false);
    }
  }, [canManageAdmins, onToast]);

  const loadLogs = useCallback(async () => {
    if (!canViewLogs) return;
    setLogsLoading(true);
    try {
      const data = await listAdminLogs({ pageSize: 50 });
      setLogs(data);
    } catch (error) {
      onToast?.(error.message || "Failed to load logs", "warning");
    } finally {
      setLogsLoading(false);
    }
  }, [canViewLogs, onToast]);

  useEffect(() => {
    if (!adminProfile?.canAccessAdmin) return;
    loadStats();
  }, [adminProfile?.canAccessAdmin, loadStats]);

  useEffect(() => {
    if (!adminProfile?.canAccessAdmin) return;
    if (activeTab === "users") loadUsers(true);
    if (activeTab === "pending") loadPayments();
    if (activeTab === "payments") loadPayments();
    if (activeTab === "admins") loadAdmins();
    if (activeTab === "logs") loadLogs();
  }, [activeTab, adminProfile?.canAccessAdmin, loadAdmins, loadLogs, loadPayments, loadUsers]);

  // QS Premium real-time listener — always active when admin is logged in (for badge)
  useEffect(() => {
    if (!adminProfile?.canAccessAdmin) return;
    setQsLoading(true);
    let active = true;
    let unsubFn = null;
    const timer = setTimeout(() => {
      if (!active) return;
      unsubFn = listenAllQSPremiumRequests((items) => {
        if (active) {
          setQsRequests(items);
          setQsLoading(false);
        }
      });
    }, 100);
    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubFn) unsubFn();
    };
  }, [adminProfile?.canAccessAdmin]);

  // Active subscriptions + pending cancellation/deletion requests (always active for badges)
  useEffect(() => {
    if (!adminProfile?.canAccessAdmin) return;
    let active = true;
    const unsubs = [];

    const t1 = setTimeout(() => {
      if (!active) return;
      unsubs.push(listenCancellationRequests((items) => { if (active) setCancelReqs(items); }));
      unsubs.push(listenDeletionRequests((items) => { if (active) setDeleteReqs(items); }));
    }, 150);

    // Active subs only when on tab
    let t2 = null;
    if (activeTab === "subscriptions") {
      setSubsLoading(true);
      t2 = setTimeout(() => {
        if (!active) return;
        unsubs.push(listenActiveSubscriptions((items) => {
          if (active) { setActiveSubs(items); setSubsLoading(false); }
        }));
      }, 100);
    }

    return () => {
      active = false;
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      unsubs.forEach((fn) => fn?.());
    };
  }, [activeTab, adminProfile?.canAccessAdmin]);

  useEffect(() => {
    if (activeTab === "users") {
      setUsersCursor(null);
      loadUsers(true);
    }
  }, [activeTab, statusFilter, paidFilter, loadUsers]);

  useEffect(() => {
    if (activeTab !== "users" || !canViewUsers) return;
    const q = queryText.trim();
    if (q.length < 2) {
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const rows = await searchUsersGlobal(q, 40);
        if (active) {
          setUsers(rows);
          setUsersHasMore(false);
          setUsersCursor(null);
        }
      } catch (error) {
        if (active) onToast?.(error.message || "Search failed", "warning");
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeTab, canViewUsers, onToast, queryText]);

  useEffect(() => {
    if (activeTab !== "settings") return undefined;

    const unSubPayment = listenPaymentSettings((data) => {
      setPaymentSettingsDraft(data || DEFAULT_PAYMENT_SETTINGS);
    });
    const unSubTopAd = listenAdBanner(
      (data) => {
        setAnalysisTopAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.analysisPreResult
    );

    const unSubBottomAd = listenAdBanner(
      (data) => {
        setAnalysisBottomAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.analysisPostResult
    );

    const unSubAreaFormAd = listenAdBanner(
      (data) => {
        setAreaFormAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.areaFormAfterCard
    );

    const unSubAreaResultsAd = listenAdBanner(
      (data) => {
        setAreaResultsAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.areaResultsAfterNote
    );

    const unSubCompaniesPaginationAd = listenAdBanner(
      (data) => {
        setCompaniesPaginationAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.companiesAfterPagination
    );

    const unSubSuppliersPaginationAd = listenAdBanner(
      (data) => {
        setSuppliersPaginationAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.suppliersAfterPagination
    );

    const unSubSelfPricingAd = listenAdBanner(
      (data) => {
        setSelfPricingAdDraft(data || DEFAULT_AD_BANNER);
      },
      AD_SLOT_IDS.selfPricingAfterActions
    );

    return () => {
      unSubPayment?.();
      unSubTopAd?.();
      unSubBottomAd?.();
      unSubAreaFormAd?.();
      unSubAreaResultsAd?.();
      unSubCompaniesPaginationAd?.();
      unSubSuppliersPaginationAd?.();
      unSubSelfPricingAd?.();
    };
  }, [activeTab]);

  if (!adminProfile?.canAccessAdmin) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-bold text-rose-700" style={{ fontFamily: AR }}>
        {t.unauthorized}
      </div>
    );
  }

  const summaryBars = dashboardStats
    ? [
        { label: "Total", value: dashboardStats.totalUsers, color: "bg-blue-500" },
        { label: "Active", value: dashboardStats.activeUsers, color: "bg-emerald-500" },
        { label: "Suspended", value: dashboardStats.suspendedUsers, color: "bg-amber-500" },
        { label: "Paid", value: dashboardStats.paidUsers, color: "bg-indigo-500" },
        { label: "Pending", value: dashboardStats.pendingRequests, color: "bg-rose-500" },
      ]
    : [];

  const maxBar = Math.max(...summaryBars.map((i) => i.value), 1);

  // ── Live data computed from always-active listeners ──────────────────────
  const qsActive   = qsRequests.filter((r) => r.status === "active").length;
  const qsPendingN = qsRequests.filter((r) => r.status === "pending").length;
  const qsRejected = qsRequests.filter((r) => r.status === "rejected").length;
  const qsDeacti   = qsRequests.filter((r) => r.status === "deactivated").length;

  const allPendingFeed = [
    ...cancelReqs.map((r) => ({
      id: r.id,
      icon: "🔄",
      title: "Cancel Subscription",
      name: r.name || r.email || r.id,
      tab: "subscriptions",
      color: "#f59e0b",
    })),
    ...deleteReqs.map((r) => ({
      id: r.id,
      icon: "🗑",
      title: "Account Deletion",
      name: r.name || r.email || r.id,
      tab: "subscriptions",
      color: "#ef4444",
    })),
    ...qsRequests
      .filter((r) => r.status === "pending")
      .map((r) => ({
        id: r.id,
        icon: "💎",
        title: "QS Premium Request",
        name: r.userName || r.userEmail || r.userId,
        tab: "qspremium",
        color: "#8b5cf6",
      })),
  ];

  const freeUsers = Math.max(
    0,
    (dashboardStats?.totalUsers || 0) - (dashboardStats?.paidUsers || 0) - qsActive
  );

  return (
    <div className="space-y-4" style={{ fontFamily: AR }}>
      <div className="overflow-hidden rounded-[32px] border border-[#dbe4ff] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] shadow-[0_30px_80px_rgba(37,99,235,0.08)]">
        <div className="border-b border-[#dbe7ff] bg-[linear-gradient(135deg,#082555_0%,#163a6b_52%,#1f4aa1_100%)] px-5 py-5 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">Secure Control Center</p>
          <h2 className="mt-2 text-[24px] font-extrabold sm:text-[28px]">{t.title}</h2>
          <p className="mt-2 text-[12px] text-white/75">{adminProfile.email} • {adminProfile.adminType === "super" ? "Super Admin" : "Admin Limited"}</p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-5 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {MENU.map((item) => {
              const pendingQsBadge = item.id === "qspremium" && activeTab !== "qspremium"
                ? qsRequests.filter((r) => r.status === "pending").length
                : 0;
              const subsBadge = item.id === "subscriptions" && activeTab !== "subscriptions"
                ? cancelReqs.length + deleteReqs.length
                : 0;
              const dashBadge = item.id === "dashboard" && activeTab !== "dashboard"
                ? allPendingFeed.length
                : 0;
              const badgeValue = pendingQsBadge || subsBadge || dashBadge || 0;
              const meta = MENU_META[item.id] || MENU_META.dashboard;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative min-w-0 overflow-hidden rounded-[28px] border px-5 py-5 text-left transition-all duration-200 ${
                    isActive
                      ? "border-transparent text-white shadow-[0_18px_45px_rgba(59,91,255,0.28)]"
                      : "border-[#e5ebf8] bg-white text-[#334155] shadow-[0_14px_34px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-[#c7d7ff]"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg,#3053ff 0%,#4b6cff 52%,#2f6af6 100%)" } : undefined}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border text-[30px] ${
                        isActive ? "border-white/20 bg-white/14 text-white" : ""
                      }`}
                      style={isActive ? undefined : { background: meta.tint, borderColor: `${meta.accent}22`, color: meta.accent }}
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[16px] font-extrabold sm:text-[18px] ${isActive ? "text-white" : "text-[#1e293b]"}`}>
                        {isEn ? item.labelEn : item.labelAr}
                      </div>
                      <div className={`mt-1 text-[11px] font-medium ${isActive ? "text-white/75" : "text-slate-400"}`}>
                        {item.id === "dashboard" && "Overview and live command center"}
                        {item.id === "users" && "Manage accounts and user activity"}
                        {item.id === "pending" && "Review waiting approvals"}
                        {item.id === "payments" && "Track receipts and payment flow"}
                        {item.id === "subscriptions" && "Control active subscription states"}
                        {item.id === "admins" && "Manage admin access levels"}
                        {item.id === "logs" && "Inspect audit trails and events"}
                        {item.id === "settings" && "Runtime controls and ad settings"}
                        {item.id === "qspremium" && "QS premium plans and requests"}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[32px] leading-none ${isActive ? "text-white/85" : "text-slate-400 transition-transform group-hover:translate-x-0.5"}`}>
                      ›
                    </span>
                  </div>
                  {badgeValue > 0 && (
                    <span className={`absolute top-4 right-4 flex min-w-[26px] items-center justify-center rounded-full px-2 py-1 text-[10px] font-extrabold shadow ${
                      isActive ? "bg-white text-[#3053ff]" : "bg-rose-500 text-white"
                    }`}>
                      {badgeValue}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="min-w-0">
            {activeTab === "dashboard" && (
              <div className="space-y-5">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#082555]">📊 Command Center</h3>
                    <p className="text-[11px] text-slate-400">Real-time overview of all platform activity</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadStats}
                    className="shrink-0 rounded-xl border border-[#dbe2ea] bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    🔄 {t.refresh}
                  </button>
                </div>

                {statsLoading ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                    <span className="animate-spin text-[20px]">⏳</span>
                    <p className="text-[12px] font-bold text-slate-500">{t.loading}</p>
                  </div>
                ) : (
                  <>
                    {/* ── KPI Cards ──────────────────────────────────────── */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(176px, 1fr))" }}>
                      <KpiCard
                        icon="👥" label="Total Users"
                        value={dashboardStats?.totalUsers || 0}
                        sub="Registered"
                        bg="linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)"
                        border="#bfdbfe" valueColor="#1e40af" labelColor="#3b82f6"
                      />
                      <KpiCard
                        icon="✅" label="Active"
                        value={dashboardStats?.activeUsers || 0}
                        sub="Approved"
                        bg="linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)"
                        border="#bbf7d0" valueColor="#166534" labelColor="#16a34a"
                      />
                      <KpiCard
                        icon="⏸" label="Suspended"
                        value={dashboardStats?.suspendedUsers || 0}
                        sub="Blocked"
                        bg="linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)"
                        border="#fde68a" valueColor="#92400e" labelColor="#d97706"
                      />
                      <KpiCard
                        icon="💳" label="Taseera Pro"
                        value={dashboardStats?.paidUsers || 0}
                        sub="Active subs"
                        bg="linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)"
                        border="#c7d2fe" valueColor="#3730a3" labelColor="#6366f1"
                      />
                      <KpiCard
                        icon="💎" label="QS Premium"
                        value={qsActive}
                        sub="Active subs"
                        bg="linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)"
                        border="#ddd6fe" valueColor="#5b21b6" labelColor="#8b5cf6"
                      />
                      <KpiCard
                        icon="🔔" label="Actions Needed"
                        value={allPendingFeed.length}
                        sub={allPendingFeed.length === 0 ? "All clear ✓" : "Requires review"}
                        bg={allPendingFeed.length > 0
                          ? "linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%)"
                          : "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)"}
                        border={allPendingFeed.length > 0 ? "#fecdd3" : "#bbf7d0"}
                        valueColor={allPendingFeed.length > 0 ? "#9f1239" : "#166534"}
                        labelColor={allPendingFeed.length > 0 ? "#f43f5e" : "#16a34a"}
                      />
                    </div>

                    {/* ── New Users Growth ───────────────────────────────── */}
                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <p className="text-[13px] font-extrabold text-[#0f172a]">📈 New Users Growth</p>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                          +{dashboardStats?.newMonth || 0} this month
                        </span>
                      </div>
                      <AreaSparkLine
                        points={[
                          { value: dashboardStats?.newToday || 0 },
                          { value: dashboardStats?.newWeek || 0 },
                          { value: dashboardStats?.newMonth || 0 },
                        ]}
                        color="#2563eb"
                        labels={["Today", "This Week", "This Month"]}
                      />
                    </div>

                    {/* ── Donuts Row ────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                        <p className="mb-1 text-[13px] font-extrabold text-[#0f172a]">👥 User Status Mix</p>
                        <StackedBar segments={[
                          { label: "Active",    value: dashboardStats?.activeUsers    || 0, hex: "#10b981" },
                          { label: "Suspended", value: dashboardStats?.suspendedUsers || 0, hex: "#f59e0b" },
                          { label: "Pending",   value: dashboardStats?.pendingRequests || 0, hex: "#ef4444" },
                        ]} />
                        <DonutChart
                          title=""
                          items={[
                            { label: "Active",    value: dashboardStats?.activeUsers    || 0, hex: "#10b981" },
                            { label: "Suspended", value: dashboardStats?.suspendedUsers || 0, hex: "#f59e0b" },
                            { label: "Pending",   value: dashboardStats?.pendingRequests || 0, hex: "#ef4444" },
                          ]}
                        />
                      </div>
                      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                        <p className="mb-1 text-[13px] font-extrabold text-[#0f172a]">💳 Subscription Mix</p>
                        <StackedBar segments={[
                          { label: "Taseera Pro", value: dashboardStats?.paidUsers || 0, hex: "#4f46e5" },
                          { label: "QS Premium",  value: qsActive,                       hex: "#8b5cf6" },
                          { label: "Free",        value: freeUsers,                      hex: "#e2e8f0" },
                        ]} />
                        <DonutChart
                          title=""
                          items={[
                            { label: "Taseera Pro", value: dashboardStats?.paidUsers || 0, hex: "#4f46e5" },
                            { label: "QS Premium",  value: qsActive,                       hex: "#8b5cf6" },
                            { label: "Free",        value: freeUsers,                      hex: "#cbd5e1" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* ── QS Premium Breakdown ──────────────────────────── */}
                    <div className="rounded-2xl border border-[#ede9fe] bg-white p-4 shadow-sm">
                      <p className="mb-3 text-[13px] font-extrabold text-[#0f172a]">💎 QS Premium Breakdown</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { label: "Active",      value: qsActive,   hex: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
                          { label: "Pending",     value: qsPendingN, hex: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
                          { label: "Rejected",    value: qsRejected, hex: "#ef4444", bg: "#fff1f2", border: "#fecdd3" },
                          { label: "Deactivated", value: qsDeacti,   hex: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl p-3 text-center"
                            style={{ background: item.bg, border: `1px solid ${item.border}` }}
                          >
                            <p className="text-[22px] font-extrabold" style={{ color: item.hex }}>{item.value}</p>
                            <p className="text-[10px] font-bold text-slate-500">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      {qsPendingN > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("qspremium")}
                          className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50 py-2 text-[12px] font-bold text-amber-700 hover:bg-amber-100"
                        >
                          ⚡ Review {qsPendingN} pending QS Premium request{qsPendingN > 1 ? "s" : ""} →
                        </button>
                      )}
                    </div>

                    {/* ── Pending Actions Feed ──────────────────────────── */}
                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <p className="text-[13px] font-extrabold text-[#0f172a]">🔔 Pending Actions</p>
                        {allPendingFeed.length > 0 && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                            {allPendingFeed.length}
                          </span>
                        )}
                      </div>
                      {allPendingFeed.length === 0 ? (
                        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-center">
                          <p className="text-[22px]">✅</p>
                          <p className="mt-1 text-[13px] font-bold text-emerald-700">All clear — no pending actions</p>
                          <p className="text-[11px] text-emerald-600 opacity-70">Everything is up to date</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {allPendingFeed.map((item) => (
                            <ActionFeedItem
                              key={`${item.tab}-${item.id}`}
                              icon={item.icon}
                              title={item.title}
                              name={item.name}
                              color={item.color}
                              onGo={() => setActiveTab(item.tab)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Users Distribution Bars ───────────────────────── */}
                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                      <p className="mb-3 text-[13px] font-extrabold text-[#0f172a]">📊 Users Distribution</p>
                      <div className="space-y-3">
                        {summaryBars.map((bar) => (
                          <div key={bar.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-600">{bar.label}</span>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${bar.color}`}
                                style={{ width: `${Math.max(4, (bar.value / maxBar) * 100)}%`, transition: "width 0.8s ease" }}
                              />
                            </div>
                            <span className="text-right text-[12px] font-extrabold text-slate-700">{bar.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-3">
                {!canViewUsers ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-700">No permission: viewUsers</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px] outline-none focus:border-[#60a5fa]"
                      />
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]">
                        <option value="all">{t.all}</option>
                        <option value="approved">{t.active}</option>
                        <option value="pending">{t.pending}</option>
                        <option value="rejected">{t.rejected}</option>
                        <option value="suspended">{t.suspended}</option>
                      </select>
                      <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]">
                        <option value="all">{t.all}</option>
                        <option value="paid">{t.paidOnly}</option>
                        <option value="unpaid">{t.unpaid}</option>
                      </select>
                    </div>

                    {(searchLoading || isSearchingAllUsers) && (
                      <p className="text-[11px] font-bold text-slate-500">
                        {searchLoading ? "Searching all users..." : "Global search mode enabled"}
                      </p>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0]">
                      <table className="min-w-[980px] w-full text-left">
                        <thead className="bg-[#f8fafc] text-[11px] font-bold text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">{t.email}</th>
                            <th className="px-3 py-2">{t.phone}</th>
                            <th className="px-3 py-2">{t.status}</th>
                            <th className="px-3 py-2">{t.subscription}</th>
                            <th className="px-3 py-2">{t.paid}</th>
                            <th className="px-3 py-2">{t.createdAt}</th>
                            <th className="px-3 py-2">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((row) => {
                            const isEditing = editingUserId === row.id;
                            const isSuperTarget = String(row.email || "").toLowerCase() === "walidghazal46@gmail.com";
                            return (
                              <tr key={row.id} className="border-t border-[#eef2f7] text-[12px] text-slate-700">
                                <td className="px-3 py-2">
                                  {isEditing ? (
                                    <input className="w-full rounded border px-2 py-1" value={editDraft.name || ""} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                                  ) : (
                                    row.name || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">{row.email || "-"}</td>
                                <td className="px-3 py-2">
                                  {isEditing ? (
                                    <input className="w-full rounded border px-2 py-1" value={editDraft.phone || ""} onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))} />
                                  ) : (
                                    row.phone || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">{row.status || "pending"}</td>
                                <td className="px-3 py-2">{row.subscriptionType || "free"}</td>
                                <td className="px-3 py-2">{row.isPaid ? "Yes" : "No"}</td>
                                <td className="px-3 py-2">{fmtDate(row.createdAt)}</td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {canEditUsers && !isEditing && !isSuperTarget && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingUserId(row.id);
                                          setEditDraft({ name: row.name || "", phone: row.phone || "" });
                                        }}
                                        className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700"
                                      >
                                        {t.edit}
                                      </button>
                                    )}
                                    {canEditUsers && isEditing && !isSuperTarget && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              await updateUserByAdmin(adminProfile, row.id, { name: editDraft.name || "", phone: editDraft.phone || "" });
                                              onToast?.("User updated", "success");
                                              setEditingUserId(null);
                                              loadUsers(true);
                                            } catch (error) {
                                              onToast?.(error.message, "warning");
                                            }
                                          }}
                                          className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"
                                        >
                                          {t.save}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingUserId(null)}
                                          className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                                        >
                                          {t.cancel}
                                        </button>
                                      </>
                                    )}
                                    {canSuspendUsers && !isSuperTarget && (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            await setUserSuspended(adminProfile, row.id, row.status !== "suspended");
                                            onToast?.("User status updated", "success");
                                            loadUsers(true);
                                          } catch (error) {
                                            onToast?.(error.message, "warning");
                                          }
                                        }}
                                        className="rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"
                                      >
                                        {row.status === "suspended" ? t.activate : t.suspend}
                                      </button>
                                    )}
                                    {canDeleteUsers && !isSuperTarget && (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteUser({ id: row.id, name: row.name || row.email || "User" })}
                                        className="rounded bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700"
                                      >
                                        {t.remove}
                                      </button>
                                    )}
                                    {isSuperTarget && (
                                      <span className="rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">Super Admin Protected</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {usersHasMore && (
                      <button
                        type="button"
                        onClick={() => loadUsers(false)}
                        disabled={usersLoading}
                        className="rounded-xl border border-[#dbe2ea] bg-white px-3 py-2 text-[12px] font-bold text-slate-600"
                      >
                        {usersLoading ? "..." : t.loadMore}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "pending" && (
              <div className="space-y-3">
                {!(canViewPayments || canApprovePayments) ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-700">No permission: viewPayments / approvePayments</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      <input
                        value={paymentSearchText}
                        onChange={(event) => setPaymentSearchText(event.target.value)}
                        placeholder="Search order / serial / email"
                        className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]"
                      />
                      <select value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]">
                        <option value="all">All methods</option>
                        {paymentMethodOptions.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      <input type="date" value={paymentDateFrom} onChange={(event) => setPaymentDateFrom(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]" />
                      <input type="date" value={paymentDateTo} onChange={(event) => setPaymentDateTo(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]" />
                      <button type="button" onClick={exportPaymentsCsv} className="rounded-xl bg-[#082555] px-3 py-2 text-[12px] font-bold text-white">Export CSV</button>
                    </div>

                    {(paymentsLoading ? [] : filteredPayments.filter((p) => ["pending_review", "waiting_receipt"].includes(p.requestStatus))).map((request) => (
                    <div key={request.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="text-[12px] font-bold text-[#082555]">{request.userName || "-"}</div>
                        <div className="text-[11px] text-slate-500">{request.email || "-"}</div>
                        <div className="text-[11px] text-slate-600">Amount: {request.amount || 0}</div>
                        <div className="text-[11px] text-slate-600">Method: {request.paymentMethod || "-"}</div>
                        <div className="text-[11px] text-slate-600">Order: {request.orderId || "-"}</div>
                        <div className="text-[11px] text-slate-600">Serial: {request.userSerial || "-"}</div>
                        <div className="text-[11px] text-slate-600 sm:col-span-2">
                          Receipt: {request.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setReceiptPreview({
                                title: request.orderId || "Receipt",
                                url: request.receiptUrl,
                                isPdf: String(request.receiptUrl).toLowerCase().includes(".pdf"),
                              })}
                              className="font-bold text-[#1d4ed8] underline"
                            >
                              Preview receipt
                            </button>
                          ) : "-"}
                        </div>
                      </div>

                      {canApprovePayments && (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await approvePaymentRequest(adminProfile, request.id);
                                onToast?.("Payment approved", "success");
                                loadPayments();
                                loadStats();
                              } catch (error) {
                                onToast?.(error.message, "warning");
                              }
                            }}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white"
                          >
                            {t.approve}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingRejectRequest(request);
                              setRejectReason("");
                            }}
                            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700"
                          >
                            {t.reject}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  </>
                )}
                {!paymentsLoading && filteredPayments.filter((p) => ["pending_review", "waiting_receipt"].includes(p.requestStatus)).length === 0 && (
                  <p className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[12px] font-bold text-slate-500">{t.noData}</p>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-2">
                {!canViewPayments ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-700">No permission: viewPayments</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
                      <input
                        value={paymentSearchText}
                        onChange={(event) => setPaymentSearchText(event.target.value)}
                        placeholder="Search order / serial / email"
                        className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px] lg:col-span-2"
                      />
                      <select value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]">
                        <option value="all">All statuses</option>
                        <option value="pending_review">pending_review</option>
                        <option value="waiting_receipt">waiting_receipt</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                      <select value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]">
                        <option value="all">All methods</option>
                        {paymentMethodOptions.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      <input type="date" value={paymentDateFrom} onChange={(event) => setPaymentDateFrom(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]" />
                      <input type="date" value={paymentDateTo} onChange={(event) => setPaymentDateTo(event.target.value)} className="rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px]" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-600">Filtered requests: {filteredPayments.length}</p>
                      <button type="button" onClick={exportPaymentsCsv} className="rounded-lg bg-[#082555] px-3 py-1.5 text-[11px] font-bold text-white">Export CSV</button>
                    </div>

                    {filteredPayments.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-3 text-[12px]">
                      <div className="font-bold text-[#082555]">{request.userName || "-"}</div>
                      <div className="mt-1 text-slate-500">{request.email || "-"}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600 sm:grid-cols-4">
                        <div>Amount: {request.amount || 0}</div>
                        <div>Method: {request.paymentMethod || "-"}</div>
                        <div>Status: {request.requestStatus || "-"}</div>
                        <div>Payment: {request.paymentStatus || "-"}</div>
                        <div>Order: {request.orderId || "-"}</div>
                        <div>Serial: {request.userSerial || "-"}</div>
                        <div>Admin note: {request.rejectionReason || request.adminNote || "-"}</div>
                        <div>
                          Receipt: {request.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setReceiptPreview({
                                title: request.orderId || "Receipt",
                                url: request.receiptUrl,
                                isPdf: String(request.receiptUrl).toLowerCase().includes(".pdf"),
                              })}
                              className="font-bold text-[#1d4ed8] underline"
                            >
                              Preview
                            </button>
                          ) : "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                  </>
                )}
                {!paymentsLoading && filteredPayments.length === 0 && <p className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[12px] font-bold text-slate-500">{t.noData}</p>}
              </div>
            )}

            {activeTab === "admins" && (
              <div className="space-y-3">
                {!canManageAdmins ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-700">No permission: manageAdmins</p>
                ) : (
                  <>
                    <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                      <p className="mb-2 text-[12px] font-bold text-[#082555]">{t.addAdmin}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full rounded-xl border border-[#dbe2ea] bg-white px-3 py-2 text-[12px]"
                        />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {ADMIN_PERMISSIONS.map((key) => (
                            <label key={key} className="flex items-center justify-between rounded-lg border border-[#dbe2ea] bg-white px-2 py-1.5 text-[11px]">
                              <span>{key}</span>
                              <input
                                type="checkbox"
                                checked={adminPermissions[key] === true}
                                onChange={(e) => setAdminPermissions((current) => ({ ...current, [key]: e.target.checked }))}
                              />
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!adminEmail.trim()) return;
                            try {
                              await seedAdminUsersByEmail(adminProfile, adminEmail.trim().toLowerCase(), adminPermissions);
                              onToast?.("Admin added", "success");
                              setAdminEmail("");
                              setAdminPermissions(DEFAULT_LIMITED_PERMISSIONS);
                              loadAdmins();
                            } catch (error) {
                              onToast?.(error.message, "warning");
                            }
                          }}
                          className="rounded-xl bg-[#082555] px-3 py-2 text-[12px] font-bold text-white"
                        >
                          {t.save}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {adminsLoading ? <p className="text-[12px] text-slate-500">Loading...</p> : null}
                      {admins.map((row) => (
                        <div key={row.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[12px] font-bold text-[#082555]">{row.email}</p>
                              <p className="text-[10px] text-slate-500">{row.adminType || "limited"}</p>
                            </div>
                            {row.adminType !== "super" && (
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveAdmin({ id: row.id, email: row.email })}
                                className="rounded bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700"
                              >
                                {t.remove}
                              </button>
                            )}
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {ADMIN_PERMISSIONS.map((perm) => (
                              <div key={perm} className="flex items-center justify-between rounded border border-[#e2e8f0] px-2 py-1 text-[10px]">
                                <span>{perm}</span>
                                <PermissionTag active={row.adminType === "super" ? true : row.permissions?.[perm] === true} />
                              </div>
                            ))}
                          </div>

                          {row.adminType !== "super" && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await upsertLimitedAdmin(adminProfile, { targetUid: row.id, permissions: row.permissions || DEFAULT_LIMITED_PERMISSIONS });
                                  onToast?.("Admin permissions synced", "success");
                                  loadAdmins();
                                } catch (error) {
                                  onToast?.(error.message, "warning");
                                }
                              }}
                              className="mt-2 rounded border border-[#dbe2ea] bg-white px-2 py-1 text-[10px] font-bold text-slate-600"
                            >
                              Sync permissions
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-2">
                {!canViewLogs ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-700">No permission: viewLogs</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-[#082555]">{log.actionType}</p>
                        <p className="text-[10px] text-slate-500">{fmtDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">{log.adminEmail} → {log.targetCollection}/{log.targetUserId || "-"}</p>
                    </div>
                  ))
                )}
                {logsLoading ? <p className="text-[12px] text-slate-500">Loading...</p> : null}
                {!logsLoading && logs.length === 0 && <p className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[12px] font-bold text-slate-500">{t.noData}</p>}
              </div>
            )}

            {activeTab === "subscriptions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-[#082555]">Taseera Pro — Active Subscriptions</h3>
                  {subsLoading && <span className="text-[11px] text-slate-500">Loading...</span>}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatCard label="Active Now" value={activeSubs.length} tone="green" />
                  <StatCard label="This Month" value={activeSubs.filter((u) => {
                    const d = u.paymentDate?.toDate?.() || (u.paymentDate ? new Date(u.paymentDate) : null);
                    if (!d) return false;
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length} tone="blue" />
                  <StatCard label="Full Access" value={activeSubs.filter((u) => u.subscriptionType === "full_access").length} tone="green" />
                </div>

                {/* Search */}
                <input
                  value={subsSearch}
                  onChange={(e) => setSubsSearch(e.target.value)}
                  placeholder="Search by name / email / order ID..."
                  className="w-full rounded-xl border border-[#dbe2ea] px-3 py-2 text-[12px] outline-none focus:border-[#1d4ed8]"
                />

                {/* List */}
                <div className="space-y-2">
                  {activeSubs
                    .filter((u) => {
                      if (!subsSearch.trim()) return true;
                      const q = subsSearch.trim().toLowerCase();
                      return [u.displayName, u.email, u.orderId, u.userSerial]
                        .map((v) => String(v || "").toLowerCase())
                        .some((v) => v.includes(q));
                    })
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full text-left rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-sm hover:border-[#1d4ed8] hover:shadow-md transition-all active:scale-[0.99]"
                        onClick={() => setSubsDetail(user)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-extrabold text-[#0f172a]">{user.displayName || user.email || user.id}</p>
                              <span className="rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                ✓ مفعل
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-[#1d4ed8]">{user.email || "—"}</p>
                            <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
                              <span>Type: <strong>{user.subscriptionType || "full_access"}</strong></span>
                              <span>Paid: <strong>{fmtDate(user.paymentDate)}</strong></span>
                              {user.userSerial && <span className="font-mono font-bold text-slate-600">{user.userSerial}</span>}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">›</span>
                        </div>
                      </button>
                    ))}
                  {!subsLoading && activeSubs.filter((u) => {
                    if (!subsSearch.trim()) return true;
                    const q = subsSearch.trim().toLowerCase();
                    return [u.displayName, u.email, u.orderId, u.userSerial]
                      .map((v) => String(v || "").toLowerCase())
                      .some((v) => v.includes(q));
                  }).length === 0 && (
                    <p className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[12px] font-bold text-slate-500">
                      No active subscriptions found.
                    </p>
                  )}
                </div>

                {/* ── Cancellation Requests ── */}
                {cancelReqs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-rose-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px]">⊘</span>
                      طلبات إلغاء الاشتراك
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">{cancelReqs.length}</span>
                    </h4>
                    {cancelReqs.map((u) => (
                      <div key={u.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[13px] font-extrabold text-[#0f172a]">{u.displayName || "—"}</p>
                            <p className="text-[11px] font-bold text-[#1d4ed8]">{u.email || "—"}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              طلب الإلغاء: <strong>{fmtDate(u.cancellationRequest?.requestedAt)}</strong>
                              {u.cancellationRequest?.reason && <> — {u.cancellationRequest.reason}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button"
                            className="flex-1 rounded-xl bg-rose-600 py-2 text-[11px] font-bold text-white hover:bg-rose-700 transition"
                            onClick={async () => {
                              try { await adminApproveCancellation(adminProfile, u.id); onToast?.("✓ تم إلغاء الاشتراك", "success"); }
                              catch (e) { onToast?.(e.message, "warning"); }
                            }}>✓ موافقة — إلغاء الاشتراك</button>
                          <button type="button"
                            className="flex-1 rounded-xl border border-slate-300 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                            onClick={async () => {
                              try { await adminRejectCancellation(adminProfile, u.id); onToast?.("رُفض طلب الإلغاء", "success"); }
                              catch (e) { onToast?.(e.message, "warning"); }
                            }}>✗ رفض — إبقاء الاشتراك</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Account Deletion Requests ── */}
                {deleteReqs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-red-800">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px]">🗑</span>
                      طلبات حذف الحساب
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">{deleteReqs.length}</span>
                    </h4>
                    {deleteReqs.map((u) => (
                      <div key={u.id} className="rounded-2xl border border-red-300 bg-red-50 p-3 space-y-2">
                        <div>
                          <p className="text-[13px] font-extrabold text-[#0f172a]">{u.displayName || u.deletionRequest?.displayName || "—"}</p>
                          <p className="text-[11px] font-bold text-[#1d4ed8]">{u.email || u.deletionRequest?.email || "—"}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500">
                            <span>User ID: <strong className="font-mono">{u.id}</strong></span>
                            <span>طلب: <strong>{fmtDate(u.deletionRequest?.requestedAt)}</strong></span>
                            {u.isPaid && <span className="font-bold text-amber-700">⚠️ مشترك</span>}
                          </div>
                          {u.deletionRequest?.reason && (
                            <p className="mt-1 text-[10px] text-slate-600">السبب: {u.deletionRequest.reason}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button"
                            className="flex-1 rounded-xl bg-red-700 py-2 text-[11px] font-bold text-white hover:bg-red-800 transition"
                            onClick={async () => {
                              if (!window.confirm(`Approve deletion for ${u.email || u.id}?`)) return;
                              try { await adminApproveAccountDeletion(adminProfile, u.id); onToast?.("✓ تمت الموافقة على الحذف", "success"); }
                              catch (e) { onToast?.(e.message, "warning"); }
                            }}>🗑 موافقة على الحذف</button>
                          <button type="button"
                            className="flex-1 rounded-xl border border-slate-300 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                            onClick={async () => {
                              try { await adminRejectAccountDeletion(adminProfile, u.id); onToast?.("رُفض طلب الحذف", "success"); }
                              catch (e) { onToast?.(e.message, "warning"); }
                            }}>✗ رفض الطلب</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subscription Detail Modal */}
            {subsDetail && (() => {
              const user = activeSubs.find((u) => u.id === subsDetail.id) || subsDetail;
              return (
                <div
                  className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
                  onClick={() => setSubsDetail(null)}
                >
                  <div
                    className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#082555] text-white px-4 py-4 rounded-t-3xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Taseera Pro Subscription</p>
                        <p className="text-[15px] font-extrabold mt-0.5">{user.displayName || user.email || user.id}</p>
                      </div>
                      <button type="button" onClick={() => setSubsDetail(null)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition">✕</button>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Status badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {user.isPaid ? (
                          <span className="rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">✓ الاشتراك مفعل</span>
                        ) : (
                          <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">⊘ غير مفعل</span>
                        )}
                        {user.subscriptionType && (
                          <span className="rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">{user.subscriptionType}</span>
                        )}
                      </div>

                      {/* Info grid */}
                      <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] divide-y divide-[#e2e8f0]">
                        {[
                          { label: "الاسم / Name", value: user.displayName || "—" },
                          { label: "الإيميل / Email", value: user.email || "—", mono: true },
                          { label: "User ID", value: user.id, mono: true },
                          { label: "السيريال / Serial", value: user.userSerial || "—", mono: true },
                          { label: "نوع الاشتراك", value: user.subscriptionType || "—" },
                          { label: "تاريخ الدفع", value: fmtDate(user.paymentDate) },
                          { label: "آخر تحديث", value: fmtDate(user.updatedAt) },
                          { label: "الحالة", value: user.status || "—" },
                          { label: "الدولة", value: user.country || "—" },
                          { label: "رقم الهاتف", value: user.phone || "—" },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="flex items-start justify-between gap-3 px-3 py-2">
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">{label}</span>
                            <span className={`text-[11px] font-bold text-[#0f172a] text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Email button */}
                      {user.email && (
                        <a
                          href={`mailto:${user.email}?subject=${encodeURIComponent("بخصوص اشتراكك في Taseera Pro")}&body=${encodeURIComponent(`السلام عليكم ${user.displayName || ""},\n\nبخصوص اشتراكك في Taseera Pro...\n\nشكراً،\nفريق تسعيرة`)}`}
                          className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#1d4ed8] bg-[#eff6ff] py-2.5 text-[12px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✉ مراسلة المشترك / Email Subscriber
                        </a>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        {user.isPaid ? (
                          <button
                            type="button"
                            className="w-full rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-[12px] font-bold text-rose-700 hover:bg-rose-100 transition"
                            onClick={async () => {
                              if (!window.confirm(`Revoke subscription for ${user.email || user.id}?`)) return;
                              try {
                                await adminRevokeSubscription(adminProfile, user.id);
                                onToast?.("✓ تم إيقاف الاشتراك", "success");
                                setSubsDetail(null);
                              } catch (e) { onToast?.(e.message, "warning"); }
                            }}
                          >
                            ⊘ إيقاف الاشتراك / Revoke
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full rounded-xl bg-emerald-600 py-2.5 text-[12px] font-bold text-white hover:bg-emerald-700 transition"
                            onClick={async () => {
                              try {
                                await adminRestoreSubscription(adminProfile, user.id);
                                onToast?.("✓ تم إعادة تفعيل الاشتراك", "success");
                                setSubsDetail(null);
                              } catch (e) { onToast?.(e.message, "warning"); }
                            }}
                          >
                            ↺ إعادة تفعيل الاشتراك / Restore
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-full rounded-xl border border-slate-300 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          onClick={() => {
                            setSubsDetail(null);
                            setActiveTab("users");
                            setQueryText(user.email || "");
                          }}
                        >
                          👤 عرض ملف المستخدم / View User Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === "qspremium" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-[#082555]">QS Premium Subscriptions</h3>
                  {qsLoading && <span className="text-[11px] text-slate-500">Loading...</span>}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard label="Total" value={qsRequests.length} tone="blue" />
                  <StatCard label="Pending" value={qsRequests.filter((r) => r.status === "pending").length} tone="amber" />
                  <StatCard label="Active" value={qsRequests.filter((r) => r.status === "active").length} tone="green" />
                  <StatCard label="Rejected" value={qsRequests.filter((r) => r.status === "rejected").length} tone="red" />
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                  {["all", "pending", "active", "rejected", "deactivated"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setQsFilter(f)}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${
                        qsFilter === f
                          ? "border-[#1d4ed8] bg-[#dbeafe] text-[#1e3a8a]"
                          : "border-[#dbe2ea] bg-white text-slate-600"
                      }`}
                    >
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Requests list */}
                <div className="space-y-2">
                  {qsRequests
                    .filter((r) => qsFilter === "all" || r.status === qsFilter)
                    .sort((a, b) => {
                      const aT = a.requestedAt?.toMillis?.() || 0;
                      const bT = b.requestedAt?.toMillis?.() || 0;
                      return bT - aT;
                    })
                    .map((req) => {
                      const statusColors = {
                        pending: "bg-amber-100 text-amber-700 border-amber-200",
                        active: "bg-emerald-100 text-emerald-700 border-emerald-200",
                        rejected: "bg-rose-100 text-rose-700 border-rose-200",
                        deactivated: "bg-slate-100 text-slate-600 border-slate-200",
                      };
                      const statusColor = statusColors[req.status] || statusColors.pending;
                      return (
                        <button
                          key={req.id}
                          type="button"
                          className="w-full text-left rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-sm hover:border-[#1d4ed8] hover:shadow-md transition-all active:scale-[0.99]"
                          onClick={() => setQsDetailModal(req)}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[13px] font-extrabold text-[#0f172a]">
                                  {req.userName || "—"}
                                </p>
                                <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>
                                  {req.status}
                                </span>
                                {req.refundRequest?.status === "pending_review" && (
                                  <span className="rounded-lg border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                    💰 Refund
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] font-bold text-[#1d4ed8]">{req.userEmail || "—"}</p>
                              <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
                                {req.orderId && <span className="font-mono font-bold text-slate-700">{req.orderId}</span>}
                                <span>Country: <strong>{(req.country || "").toUpperCase()}</strong></span>
                                <span>Price: <strong>{req.price} {req.currency}</strong></span>
                                <span>Requested: <strong>{fmtDate(req.requestedAt)}</strong></span>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-400 shrink-0 mt-0.5">›</div>
                          </div>
                        </button>
                      );
                    })}

                  {!qsLoading && qsRequests.filter((r) => qsFilter === "all" || r.status === qsFilter).length === 0 && (
                    <p className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-[12px] font-bold text-slate-500">
                      No records found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden">
                  <button type="button" onClick={() => toggleSection("security")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Security checklist</p>
                    <span className="text-slate-400 text-[10px]">{openSections["security"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["security"] && <div className="px-3 pb-3">
                  <ul className="mt-2 list-disc space-y-1 pr-4 text-[11px] text-slate-600">
                    <li>All sensitive writes are logged to adminLogs.</li>
                    <li>UI actions are permission-gated by role and permissions map.</li>
                    <li>Firestore Rules must be deployed to enforce backend security.</li>
                    <li>Use pagination and indexed filters for large data sets.</li>
                  </ul>
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("payment")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Payment Settings</p>
                    <span className="text-slate-400 text-[10px]">{openSections["payment"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["payment"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={paymentSettingsDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setPaymentSettingsDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Base Amount (SAR)</span>
                        <input
                          type="number"
                          value={paymentSettingsDraft.baseAmountSar || 100}
                          onChange={(e) => setPaymentSettingsDraft((curr) => ({ ...curr, baseAmountSar: Number(e.target.value) || 100 }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px] sm:col-span-2">
                        <span className="mb-1 block font-bold text-slate-600">Note</span>
                        <input
                          value={paymentSettingsDraft.note || ""}
                          onChange={(e) => setPaymentSettingsDraft((curr) => ({ ...curr, note: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("adTop")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Analysis Banner (Before Result Card)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["adTop"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["adTop"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={analysisTopAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setAnalysisTopAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={analysisTopAdDraft.title || ""}
                          onChange={(e) => setAnalysisTopAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={analysisTopAdDraft.imageUrl || ""}
                          onChange={(e) => setAnalysisTopAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={analysisTopAdDraft.targetUrl || ""}
                          onChange={(e) => setAnalysisTopAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("adBottom")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Analysis Banner (After Result Card)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["adBottom"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["adBottom"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={analysisBottomAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setAnalysisBottomAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={analysisBottomAdDraft.title || ""}
                          onChange={(e) => setAnalysisBottomAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={analysisBottomAdDraft.imageUrl || ""}
                          onChange={(e) => setAnalysisBottomAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={analysisBottomAdDraft.targetUrl || ""}
                          onChange={(e) => setAnalysisBottomAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("areaForm")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Area Form Banner (After Card)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["areaForm"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["areaForm"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={areaFormAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setAreaFormAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={areaFormAdDraft.title || ""}
                          onChange={(e) => setAreaFormAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={areaFormAdDraft.imageUrl || ""}
                          onChange={(e) => setAreaFormAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={areaFormAdDraft.targetUrl || ""}
                          onChange={(e) => setAreaFormAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("areaResults")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Area Results Banner (After Note)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["areaResults"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["areaResults"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={areaResultsAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setAreaResultsAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={areaResultsAdDraft.title || ""}
                          onChange={(e) => setAreaResultsAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={areaResultsAdDraft.imageUrl || ""}
                          onChange={(e) => setAreaResultsAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={areaResultsAdDraft.targetUrl || ""}
                          onChange={(e) => setAreaResultsAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}

                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("companies")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Companies Banner (After Pagination)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["companies"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["companies"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={companiesPaginationAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setCompaniesPaginationAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={companiesPaginationAdDraft.title || ""}
                          onChange={(e) => setCompaniesPaginationAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={companiesPaginationAdDraft.imageUrl || ""}
                          onChange={(e) => setCompaniesPaginationAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={companiesPaginationAdDraft.targetUrl || ""}
                          onChange={(e) => setCompaniesPaginationAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("suppliers")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Suppliers Banner (After Pagination)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["suppliers"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["suppliers"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={suppliersPaginationAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setSuppliersPaginationAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={suppliersPaginationAdDraft.title || ""}
                          onChange={(e) => setSuppliersPaginationAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={suppliersPaginationAdDraft.imageUrl || ""}
                          onChange={(e) => setSuppliersPaginationAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={suppliersPaginationAdDraft.targetUrl || ""}
                          onChange={(e) => setSuppliersPaginationAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}

                  </div>}
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
                  <button type="button" onClick={() => toggleSection("selfPricing")} className="flex w-full items-center justify-between px-3 py-3 text-left">
                    <p className="text-[12px] font-bold text-[#082555]">Self Pricing Banner (After Actions)</p>
                    <span className="text-slate-400 text-[10px]">{openSections["selfPricing"] ? "▲" : "▼"}</span>
                  </button>
                  {openSections["selfPricing"] && <div className="px-3 pb-3">
                  {!canManageRuntimeSettings ? (
                    <p className="mt-2 text-[11px] text-amber-700">No permission: approvePayments</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Enabled</span>
                        <select
                          value={selfPricingAdDraft.enabled ? "yes" : "no"}
                          onChange={(e) => setSelfPricingAdDraft((curr) => ({ ...curr, enabled: e.target.value === "yes" }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Banner Title</span>
                        <input
                          value={selfPricingAdDraft.title || ""}
                          onChange={(e) => setSelfPricingAdDraft((curr) => ({ ...curr, title: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Image URL</span>
                        <input
                          value={selfPricingAdDraft.imageUrl || ""}
                          onChange={(e) => setSelfPricingAdDraft((curr) => ({ ...curr, imageUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block font-bold text-slate-600">Target URL</span>
                        <input
                          value={selfPricingAdDraft.targetUrl || ""}
                          onChange={(e) => setSelfPricingAdDraft((curr) => ({ ...curr, targetUrl: e.target.value }))}
                          className="w-full rounded-lg border border-[#dbe2ea] px-2 py-1.5"
                        />
                      </label>
                    </div>
                  )}
                  </div>}
                </div>

                {canManageRuntimeSettings && (
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={async () => {
                        setSavingSettings(true);
                        try {
                          await savePaymentSettings(adminProfile, paymentSettingsDraft);
                          await saveAdBanner(adminProfile, analysisTopAdDraft, AD_SLOT_IDS.analysisPreResult);
                          await saveAdBanner(adminProfile, analysisBottomAdDraft, AD_SLOT_IDS.analysisPostResult);
                          await saveAdBanner(adminProfile, areaFormAdDraft, AD_SLOT_IDS.areaFormAfterCard);
                          await saveAdBanner(adminProfile, areaResultsAdDraft, AD_SLOT_IDS.areaResultsAfterNote);
                          await saveAdBanner(adminProfile, companiesPaginationAdDraft, AD_SLOT_IDS.companiesAfterPagination);
                          await saveAdBanner(adminProfile, suppliersPaginationAdDraft, AD_SLOT_IDS.suppliersAfterPagination);
                          await saveAdBanner(adminProfile, selfPricingAdDraft, AD_SLOT_IDS.selfPricingAfterActions);
                          onToast?.("Settings updated", "success");
                        } catch (error) {
                          onToast?.(error.message || "Failed to save settings", "warning");
                        } finally {
                          setSavingSettings(false);
                        }
                      }}
                      className="mt-3 rounded-xl bg-[#082555] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-60"
                    >
                      {savingSettings ? "..." : "Save payment + ad settings"}
                    </button>
                  )}
                </div>
            )}
          </section>
        </div>
      </div>

      {receiptPreview && (
        <Modal title={`Receipt Preview • ${receiptPreview.title || ""}`} onClose={() => setReceiptPreview(null)}>
          <div className="space-y-3">
            {receiptPreview.isPdf ? (
              <iframe
                src={receiptPreview.url}
                title="receipt-preview"
                className="h-[60vh] w-full rounded-xl border border-[#e2e8f0] bg-white"
              />
            ) : (
              <img src={receiptPreview.url} alt="receipt" className="w-full rounded-xl border border-[#e2e8f0] bg-white" />
            )}
            <a href={receiptPreview.url} target="_blank" rel="noreferrer" className="block text-center text-[12px] font-bold text-[#1d4ed8] underline">
              Open in new tab
            </a>
          </div>
        </Modal>
      )}

      {confirmDeleteUser && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDeleteUser(null)}>
          <div className="space-y-3 text-[12px]">
            <p className="font-bold text-slate-700">Delete user {confirmDeleteUser.name} permanently?</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await deleteUserByAdmin(adminProfile, confirmDeleteUser.id);
                    onToast?.("User deleted", "success");
                    setConfirmDeleteUser(null);
                    loadUsers(true);
                  } catch (error) {
                    onToast?.(error.message, "warning");
                  }
                }}
              >
                Delete
              </button>
              <button type="button" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-bold" onClick={() => setConfirmDeleteUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmRemoveAdmin && (
        <Modal title="Remove Admin" onClose={() => setConfirmRemoveAdmin(null)}>
          <div className="space-y-3 text-[12px]">
            <p className="font-bold text-slate-700">Remove admin access from {confirmRemoveAdmin.email}?</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await removeAdmin(adminProfile, confirmRemoveAdmin.id);
                    onToast?.("Admin removed", "success");
                    setConfirmRemoveAdmin(null);
                    loadAdmins();
                  } catch (error) {
                    onToast?.(error.message, "warning");
                  }
                }}
              >
                Remove
              </button>
              <button type="button" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-bold" onClick={() => setConfirmRemoveAdmin(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {pendingRejectRequest && (
        <Modal title="Reject Payment Request" onClose={() => setPendingRejectRequest(null)}>
          <div className="space-y-3 text-[12px]">
            <p className="font-bold text-slate-700">Provide rejection reason for {pendingRejectRequest.userName || pendingRejectRequest.email}.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[96px] w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-rose-400"
              placeholder="Reason"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await rejectPaymentRequest(adminProfile, pendingRejectRequest.id, rejectReason.trim() || "No reason provided");
                    onToast?.("Payment rejected", "success");
                    setPendingRejectRequest(null);
                    setRejectReason("");
                    loadPayments();
                    loadStats();
                  } catch (error) {
                    onToast?.(error.message, "warning");
                  }
                }}
              >
                Reject
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-bold"
                onClick={() => {
                  setPendingRejectRequest(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* QS Premium — Reject modal */}
      {qsRejectModal && (
        <Modal title="Reject QS Premium Request" onClose={() => { setQsRejectModal(null); setQsRejectReason(""); }}>
          <div className="space-y-3 text-[12px]">
            <p className="font-bold text-slate-700">Provide a rejection reason.</p>
            <textarea
              value={qsRejectReason}
              onChange={(e) => setQsRejectReason(e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-rose-400"
              placeholder="Reason..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await adminRejectQSPremium(adminProfile, qsRejectModal, qsRejectReason.trim() || "No reason provided");
                    onToast?.("Request rejected", "success");
                    setQsRejectModal(null);
                    setQsRejectReason("");
                  } catch (e) { onToast?.(e.message, "warning"); }
                }}
              >
                Reject
              </button>
              <button type="button" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-bold" onClick={() => { setQsRejectModal(null); setQsRejectReason(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* QS Premium — Detail modal */}
      {qsDetailModal && (() => {
        const req = qsRequests.find((r) => r.id === qsDetailModal.id) || qsDetailModal;
        const statusColors = {
          pending: "bg-amber-100 text-amber-700 border-amber-200",
          active: "bg-emerald-100 text-emerald-700 border-emerald-200",
          rejected: "bg-rose-100 text-rose-700 border-rose-200",
          deactivated: "bg-slate-100 text-slate-600 border-slate-200",
        };
        const statusColor = statusColors[req.status] || statusColors.pending;
        return (
          <div
            className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setQsDetailModal(null)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#082555] text-white px-4 py-4 rounded-t-3xl sm:rounded-t-3xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">QS Premium Request</p>
                  <p className="text-[15px] font-extrabold mt-0.5">{req.userName || req.userEmail || req.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQsDetailModal(null)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-lg border px-3 py-1 text-[11px] font-bold ${statusColor}`}>
                    {req.status}
                  </span>
                  {req.refundRequest?.status === "pending_review" && (
                    <span className="rounded-lg border border-orange-200 bg-orange-100 px-3 py-1 text-[11px] font-bold text-orange-700">
                      💰 Refund Pending
                    </span>
                  )}
                </div>

                {/* Info grid */}
                <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] divide-y divide-[#e2e8f0]">
                  {[
                    { label: "الاسم / Name", value: req.userName || "—" },
                    { label: "الإيميل / Email", value: req.userEmail || "—", mono: true },
                    { label: "رقم الطلب / Order ID", value: req.orderId || "—", mono: true },
                    { label: "الدولة / Country", value: (req.country || "—").toUpperCase() },
                    { label: "المبلغ / Amount", value: req.price ? `${req.price} ${req.currency}` : "—" },
                    { label: "تاريخ الطلب / Requested", value: fmtDate(req.requestedAt) },
                    { label: "تفعيل / Activated", value: fmtDate(req.activatedAt) },
                    { label: "انتهاء التجربة / Trial Ends", value: fmtDate(req.trialEndsAt) },
                    { label: "البنود المستخدمة / Trial Items", value: `${(req.trialItemsUsed || []).length} / 10` },
                    { label: "User ID", value: req.userId || req.id || "—", mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">{label}</span>
                      <span className={`text-[11px] font-bold text-[#0f172a] text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
                    </div>
                  ))}
                  {req.rejectionReason && (
                    <div className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="text-[10px] font-bold text-rose-500 shrink-0 mt-0.5">سبب الرفض</span>
                      <span className="text-[11px] font-bold text-rose-700 text-right">{req.rejectionReason}</span>
                    </div>
                  )}
                  {req.adminNotes && (
                    <div className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">Admin Notes</span>
                      <span className="text-[11px] text-slate-700 text-right">{req.adminNotes}</span>
                    </div>
                  )}
                </div>

                {/* Email button */}
                {req.userEmail && (
                  <a
                    href={`mailto:${req.userEmail}?subject=${encodeURIComponent(`بخصوص طلب QS Premium #${req.orderId || ""}`)}&body=${encodeURIComponent(`السلام عليكم ${req.userName || ""},\n\nبخصوص طلب اشتراكك QS Premium رقم ${req.orderId || ""}...\n\nشكراً،\nفريق تسعيرة`)}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#1d4ed8] bg-[#eff6ff] py-2.5 text-[12px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✉ مراسلة المستخدم / Email User
                  </a>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {req.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[12px] font-bold text-white hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            await adminApproveQSPremium(adminProfile, req.id);
                            onToast?.("✓ تم القبول", "success");
                            setQsDetailModal(null);
                          } catch (e) { onToast?.(e.message, "warning"); }
                        }}
                      >
                        ✓ قبول / Approve
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-rose-600 py-2.5 text-[12px] font-bold text-white hover:bg-rose-700 transition"
                        onClick={() => { setQsRejectModal(req.id); setQsRejectReason(""); setQsDetailModal(null); }}
                      >
                        ✗ رفض / Reject
                      </button>
                    </div>
                  )}
                  {req.status === "active" && (
                    <button
                      type="button"
                      className="w-full rounded-xl border border-slate-300 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition"
                      onClick={async () => {
                        try {
                          await adminDeactivateQSPremium(adminProfile, req.id);
                          onToast?.("Deactivated", "success");
                          setQsDetailModal(null);
                        } catch (e) { onToast?.(e.message, "warning"); }
                      }}
                    >
                      ⊘ إيقاف / Deactivate
                    </button>
                  )}
                  {(req.status === "deactivated" || req.status === "rejected") && (
                    <button
                      type="button"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 text-[12px] font-bold text-white hover:bg-indigo-700 transition"
                      onClick={async () => {
                        try {
                          await adminReactivateQSPremium(adminProfile, req.id);
                          onToast?.("Reactivated", "success");
                          setQsDetailModal(null);
                        } catch (e) { onToast?.(e.message, "warning"); }
                      }}
                    >
                      ↺ إعادة تفعيل / Reactivate
                    </button>
                  )}
                  {req.refundRequest?.status === "pending_review" && (
                    <button
                      type="button"
                      className="w-full rounded-xl bg-orange-500 py-2.5 text-[12px] font-bold text-white hover:bg-orange-600 transition"
                      onClick={() => { setQsRefundModal(req.id); setQsRefundNotes(""); setQsDetailModal(null); }}
                    >
                      💰 مراجعة الاسترداد / Review Refund
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-[12px] font-bold text-rose-700 hover:bg-rose-100 transition"
                    onClick={async () => {
                      if (!window.confirm("Are you sure you want to delete this request?")) return;
                      try {
                        await adminDeleteQSPremium(adminProfile, req.id);
                        onToast?.("Deleted", "success");
                        setQsDetailModal(null);
                      } catch (e) { onToast?.(e.message, "warning"); }
                    }}
                  >
                    🗑 حذف الطلب / Delete Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QS Premium — Refund review modal */}
      {qsRefundModal && (
        <Modal title="Review Refund Request" onClose={() => { setQsRefundModal(null); setQsRefundNotes(""); }}>
          <div className="space-y-3 text-[12px]">
            <p className="font-bold text-slate-700">
              Review refund for user{" "}
              <span className="text-[#1d4ed8]">
                {qsRequests.find((r) => r.id === qsRefundModal)?.userEmail || qsRefundModal}
              </span>.
            </p>
            {(() => {
              const req = qsRequests.find((r) => r.id === qsRefundModal);
              return req?.refundRequest?.reason ? (
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">User reason</p>
                  <p>{req.refundRequest.reason}</p>
                </div>
              ) : null;
            })()}
            <textarea
              value={qsRefundNotes}
              onChange={(e) => setQsRefundNotes(e.target.value)}
              className="min-h-[72px] w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-400"
              placeholder="Admin notes (optional)..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await adminHandleRefund(adminProfile, qsRefundModal, true, qsRefundNotes.trim());
                    onToast?.("Refund approved", "success");
                    setQsRefundModal(null);
                    setQsRefundNotes("");
                  } catch (e) { onToast?.(e.message, "warning"); }
                }}
              >
                ✓ Approve Refund
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 font-bold text-white"
                onClick={async () => {
                  try {
                    await adminHandleRefund(adminProfile, qsRefundModal, false, qsRefundNotes.trim());
                    onToast?.("Refund rejected", "success");
                    setQsRefundModal(null);
                    setQsRefundNotes("");
                  } catch (e) { onToast?.(e.message, "warning"); }
                }}
              >
                ✗ Reject Refund
              </button>
            </div>
            <button
              type="button"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold mt-1"
              onClick={() => { setQsRefundModal(null); setQsRefundNotes(""); }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

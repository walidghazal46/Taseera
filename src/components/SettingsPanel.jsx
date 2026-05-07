import { useEffect, useMemo, useState } from "react";
import { getAppText } from "../data/appText";
import useBackStack from "../hooks/useBackStack";
import useAdminSession from "../hooks/useAdminSession";
import taseeraLogo from "../assets/taseera-logo-light.png";
import AdminDashboard from "./AdminDashboard";
import SubscriptionPanel from "./SubscriptionPanel";
import { requestAccountDeletion } from "../services/subscriptionApi";

const F = "'Cairo','Tajawal',sans-serif";

/* ─── copy ───────────────────────────────────────────────────────────────── */
function getSettingsCopy(language) {
  return language === "en"
    ? {
        permissionEnabled: "Enabled", permissionDisabled: "Disabled",
        permissionNotRequired: "Not required", permissionUnavailable: "Unavailable",
        requestPermission: "Request", openSettings: "Open settings",
        pricingEnvironment: "Current pricing environment", pricingActive: "Active",
        profitSummary: "Profit", pricingCountryTitle: "Country & pricing settings",
        country: "Country", city: "City", currency: "Currency",
        locationFactor: "Location factor", pricingRatios: "Pricing ratios",
        profitPercent: "Profit %", overheadPercent: "Overhead %", taxPercent: "Tax %",
        dataState: "Activity", savedAnalyses: "Saved analyses", rfqs: "RFQ requests",
        pricingTab: "Pricing", accountTab: "Account", subscriptionTab: "Subscription",
        subscriptionTitle: "Full Access Subscription",
        subscriptionHint: "Unlock all pricing items and unlimited building pricing.",
        basePrice: "Price", paymentMethod: "Payment method",
        paymentReference: "Transfer reference", paymentNote: "Additional note",
        sendPaymentRequest: "Send payment request",
        pendingReview: "Pending review", approved: "Approved", rejected: "Rejected",
        orderId: "Order", amount: "Amount", createdOn: "Created",
        loginRequired: "Please log in first to submit your payment request.",
        loginToSubscribe: "Log in to continue subscription",
        receiptFile: "Payment receipt", receiptRequired: "Receipt is required before sending your request.",
        uploadReceipt: "Upload receipt", uploadProgress: "Uploading",
        requestSubmitted: "Request submitted successfully",
        requestStatusPendingMessage: "Your receipt was received. Admin team will review and activate your subscription after payment verification.",
        myRequestsBoard: "My Requests", requestStatus: "Request status",
        adminNote: "Admin note", viewReceipt: "View receipt",
        serial: "Serial", noAdminNote: "No admin note",
        invalidFile: "Only image/pdf files are allowed (max 8 MB).",
      }
    : {
        permissionEnabled: "مفعلة", permissionDisabled: "غير مفعلة",
        permissionNotRequired: "غير مطلوبة", permissionUnavailable: "غير متاحة",
        requestPermission: "طلب الإذن", openSettings: "فتح الإعدادات",
        pricingEnvironment: "بيئة التسعير الحالية", pricingActive: "نشطة",
        profitSummary: "ربح", pricingCountryTitle: "إعدادات الدولة والتسعير",
        country: "الدولة", city: "المدينة", currency: "العملة",
        locationFactor: "عامل الموقع", pricingRatios: "نسب التسعير",
        profitPercent: "الربح %", overheadPercent: "المصاريف %", taxPercent: "الضريبة %",
        dataState: "النشاط", savedAnalyses: "تحليلات محفوظة", rfqs: "طلبات عروض سعر",
        pricingTab: "التسعير", accountTab: "الحساب", subscriptionTab: "الاشتراك",
        subscriptionTitle: "اشتراك الوصول الكامل",
        subscriptionHint: "افتح كل البنود وتسعير المباني بدون حدود.",
        basePrice: "السعر", paymentMethod: "طريقة الدفع",
        paymentReference: "مرجع التحويل", paymentNote: "ملاحظة إضافية",
        sendPaymentRequest: "إرسال طلب الدفع",
        pendingReview: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض",
        orderId: "رقم الطلب", amount: "المبلغ", createdOn: "تاريخ الطلب",
        loginRequired: "يرجى تسجيل الدخول أولاً لإرسال طلب الدفع.",
        loginToSubscribe: "سجل الدخول للاشتراك",
        receiptFile: "إيصال الدفع", receiptRequired: "لا يمكن إرسال الطلب بدون رفع إيصال الدفع.",
        uploadReceipt: "رفع الإيصال", uploadProgress: "جاري الرفع",
        requestSubmitted: "تم إرسال الطلب بنجاح",
        requestStatusPendingMessage: "تم استلام إيصالك. ستقوم الإدارة بمراجعته وتفعيل الاشتراك بعد التأكد من الدفع.",
        myRequestsBoard: "لوحة طلباتي", requestStatus: "حالة الطلب",
        adminNote: "ملاحظة الأدمن", viewReceipt: "عرض الإيصال",
        serial: "السيريال", noAdminNote: "لا توجد ملاحظة",
        invalidFile: "مسموح فقط بصيغ الصور أو PDF وبحد أقصى 8 ميجابايت.",
      };
}

/* ─── primitives ─────────────────────────────────────────────────────────── */

function PremiumInput({ label, value, onChange, placeholder, type = "text", options, icon }) {
  return (
    <label className="block group">
      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: F }}>
        {icon && <span>{icon}</span>}
        {label}
      </span>
      {type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12px] font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-[#d4a843] focus:bg-white focus:ring-2 focus:ring-[#d4a843]/20 hover:border-[#d4a843]/40"
          style={{ fontFamily: F }}>
          {(options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12px] font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-[#d4a843] focus:bg-white focus:ring-2 focus:ring-[#d4a843]/20 hover:border-[#d4a843]/40 placeholder:font-normal placeholder:text-slate-300"
          style={{ fontFamily: F }} />
      )}
    </label>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_6px_28px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, extra, accent }) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 ${accent ? "bg-gradient-to-r from-[#071e40] to-[#0d2545]" : "bg-gradient-to-r from-slate-50 to-white"}`}>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-sm shadow-sm ${accent ? "bg-white/10" : "bg-slate-100"}`}>{icon}</span>
        <p className={`min-w-0 break-words text-[12px] font-bold ${accent ? "text-white" : "text-slate-700"}`} style={{ fontFamily: F }}>{title}</p>
      </div>
      <div className="shrink-0">{extra}</div>
    </div>
  );
}

function ActionRow({ title, subtitle, onClick, icon, danger }) {
  return (
    <button type="button" onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right transition-all duration-150 active:scale-[0.98] ${
        danger
          ? "border border-red-100 bg-red-50 hover:bg-red-100"
          : "border border-slate-100 bg-white hover:border-[#d4a843]/30 hover:bg-amber-50/50 hover:shadow-sm"
      }`}>
      {icon && (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base shadow-sm transition-transform duration-150 group-hover:scale-105 ${
          danger ? "bg-red-100" : "bg-slate-100 group-hover:bg-[#d4a843]/10"
        }`}>{icon}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-bold leading-snug ${danger ? "text-red-600" : "text-slate-800"}`} style={{ fontFamily: F }}>{title}</p>
        {subtitle && <p className="mt-0.5 text-[10px] text-slate-400 leading-relaxed" style={{ fontFamily: F }}>{subtitle}</p>}
      </div>
      {!danger && <span className="shrink-0 text-[#d4a843]/60 text-lg font-bold transition-all duration-150 group-hover:text-[#d4a843] group-hover:translate-x-0.5">›</span>}
    </button>
  );
}

/* ─── social logos ───────────────────────────────────────────────────────── */
function WhatsAppLogo() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M19.05 4.94A9.77 9.77 0 0 0 12.09 2C6.67 2 2.25 6.4 2.25 11.82c0 1.74.45 3.43 1.3 4.93L2 22l5.39-1.5a9.8 9.8 0 0 0 4.69 1.2h.01c5.42 0 9.84-4.41 9.84-9.83a9.76 9.76 0 0 0-2.88-6.93ZM12.09 20.02h-.01a8.14 8.14 0 0 1-4.14-1.13l-.3-.18-3.2.89.86-3.12-.2-.32a8.12 8.12 0 0 1-1.24-4.34c0-4.51 3.68-8.18 8.21-8.18 2.19 0 4.24.85 5.79 2.39a8.11 8.11 0 0 1 2.4 5.79c0 4.52-3.69 8.2-8.17 8.2Zm4.48-6.14c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.28.18-.53.06-.25-.13-1.05-.39-2-.99a7.45 7.45 0 0 1-1.38-1.72c-.14-.25-.02-.39.11-.52.11-.11.25-.28.37-.42.13-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.83-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.23 3.74.59.25 1.05.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.15-1.17-.06-.1-.22-.16-.47-.29Z"/></svg>;
}
function LinkedInLogo() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 0 0 3.3 4.97c0 1.08.87 1.97 1.93 1.97h.02a1.97 1.97 0 0 0 0-3.94ZM20.7 12.88c0-3.02-1.61-4.43-3.76-4.43-1.73 0-2.5.95-2.93 1.62V8.5h-3.38c.05 1.04 0 11.5 0 11.5H14v-6.42c0-.34.02-.68.12-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.87 1.03 1.87 2.53V20h3.38v-7.12Z"/></svg>;
}
function YouTubeLogo() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M21.58 7.19a2.99 2.99 0 0 0-2.1-2.12C17.63 4.56 12 4.56 12 4.56s-5.63 0-7.48.51a2.99 2.99 0 0 0-2.1 2.12C1.9 9.06 1.9 12 1.9 12s0 2.94.52 4.81a2.99 2.99 0 0 0 2.1 2.12c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.99 2.99 0 0 0 2.1-2.12c.52-1.87.52-4.81.52-4.81s0-2.94-.52-4.81ZM10.2 15.05V8.95L15.27 12l-5.07 3.05Z"/></svg>;
}

/* ─── HowToUse Modal ─────────────────────────────────────────────────────── */
function HowToUseModal({ language, onClose }) {
  const isAr = language !== "en";
  const sections = isAr
    ? [
        { icon: "🏢", title: "صفحة الشركات", color: "from-blue-500 to-blue-600", steps: ["اضغط على «الشركات» من شريط التنقل السفلي.", "اضغط «إضافة شركة» لإنشاء شركة جديدة بتفاصيلها.", "بعد اختيار الشركة يمكنك إضافة مشاريعها وتتبع حالتها."] },
        { icon: "💰", title: "صفحة التسعير", color: "from-amber-500 to-amber-600", steps: ["اختر بنداً من قائمة البنود أو ابحث عنه مباشرةً.", "أدخل الكميات والموارد ليحسب التطبيق السعر تلقائياً.", "احفظ التحليل وربطه بمشروع لمراجعته لاحقاً."] },
        { icon: "🔧", title: "صفحة الموردين", color: "from-emerald-500 to-emerald-600", steps: ["اختر الدولة من شاشة الاختيار عند الدخول للصفحة.", "تصفح الموردين أو ابحث بالاسم أو التخصص.", "اضغط على المورد لعرض تفاصيله والتواصل معه أو طلب عرض سعر."] },
        { icon: "🌐", title: "الموقع الإلكتروني", color: "from-purple-500 to-purple-600", steps: ["يعمل الموقع بنفس واجهة التطبيق على أي متصفح.", "البيانات محفوظة محلياً في المتصفح ولا تُفقد عند إغلاق الصفحة.", "لتجربة كاملة مع الإشعارات والمكالمات استخدم تطبيق Android."] },
      ]
    : [
        { icon: "🏢", title: "Companies Page", color: "from-blue-500 to-blue-600", steps: ["Tap «Companies» in the bottom navigation bar.", "Tap «Add Company» to create a new company with its details.", "After selecting a company you can add projects and track their status."] },
        { icon: "💰", title: "Pricing Page", color: "from-amber-500 to-amber-600", steps: ["Choose an item from the list or search for it directly.", "Enter quantities and resources; the app calculates the price automatically.", "Save the analysis and link it to a project for later review."] },
        { icon: "🔧", title: "Suppliers Page", color: "from-emerald-500 to-emerald-600", steps: ["Select the country from the picker when entering the page.", "Browse suppliers or search by name or specialty.", "Tap a supplier to view details, contact them, or request a quote."] },
        { icon: "🌐", title: "Website", color: "from-purple-500 to-purple-600", steps: ["The website uses the same interface as the app in any browser.", "Data is saved locally in the browser and persists between sessions.", "For full features like calls and notifications use the Android app."] },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose} style={{ backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-2xl rounded-t-[28px] bg-[#F7F3EC] shadow-2xl"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()} dir={isAr ? "rtl" : "ltr"}>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] bg-gradient-to-r from-[#082555] to-[#0d3070] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4a843]/30 to-[#d4a843]/10 text-lg shadow-inner">📖</div>
            <p className="text-[15px] font-bold text-white" style={{ fontFamily: F }}>
              {isAr ? "كيفية الاستخدام" : "How to Use"}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white text-sm">✕</button>
        </div>

        {/* Intro */}
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-[#d4a843]/25 bg-gradient-to-br from-[#fffbf0] via-[#fff8e6] to-[#fffbf0]">
          <div className="px-4 py-3.5">
            <p className="text-[12px] leading-6 text-slate-600" style={{ fontFamily: F }}>
              {isAr
                ? "تطبيق تسعيرة هو أداة احترافية لتسعير الأعمال الإنشائية ومتابعة الموردين وإدارة المشاريع."
                : "Taseera is a professional tool for construction pricing, supplier management, and project tracking."}
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3 p-4">
          {sections.map((section, si) => (
            <div key={section.title} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className={`flex items-center gap-3 bg-gradient-to-r ${section.color} px-4 py-3`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-base">{section.icon}</span>
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: F }}>{section.title}</p>
              </div>
              <div className="p-4 space-y-2.5">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">{i + 1}</span>
                    <p className="text-[11px] leading-5 text-slate-600" style={{ fontFamily: F }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 pt-0">
          <button type="button" onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-[#082555] to-[#0d3070] py-3.5 text-[13px] font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            style={{ fontFamily: F }}>
            {isAr ? "فهمت، شكراً" : "Got it, thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing Tab ─────────────────────────────────────────────────────────── */
function PricingTab({ settings, onUpdateSetting, copy }) {
  const isAr = settings.language !== "en";
  const countryOptions = [
    { value: "السعودية", label: "🇸🇦 " + (isAr ? "السعودية" : "Saudi Arabia") },
    { value: "جمهورية مصر العربية", label: "🇪🇬 " + (isAr ? "مصر" : "Egypt") },
    { value: "الإمارات العربية المتحدة", label: "🇦🇪 " + (isAr ? "الإمارات" : "UAE") },
  ];
  const ratioItems = useMemo(() => [
    { key: "profitPercent",   label: copy.profitPercent,   value: Number(settings.profitPercent)   || 0, icon: "📈", from: "from-emerald-400", to: "to-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", light: "bg-emerald-50" },
    { key: "overheadPercent", label: copy.overheadPercent, value: Number(settings.overheadPercent) || 0, icon: "⚙️",  from: "from-blue-400",    to: "to-blue-500",    ring: "ring-blue-200",    text: "text-blue-700",    light: "bg-blue-50" },
    { key: "taxPercent",      label: copy.taxPercent,       value: Number(settings.taxPercent)      || 0, icon: "🏛️", from: "from-violet-400",  to: "to-violet-500",  ring: "ring-violet-200",  text: "text-violet-700",  light: "bg-violet-50" },
  ], [copy, settings]);

  return (
    <div className="space-y-3">
      {/* Live environment banner */}
      <div className="relative overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(212,168,67,0.18)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a2200] via-[#4d2e00] to-[#2a1800]" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(212,168,67,0.15), transparent 60%)" }} />
        <div className="pointer-events-none absolute -top-4 -right-4 h-24 w-24 rounded-full bg-[#d4a843]/20 blur-2xl" />

        <div className="relative px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-[#d4a843]/30 blur-md scale-110" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4a843]/20 text-xl ring-1 ring-[#d4a843]/30">🌍</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a843] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4a843]" />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a843]/80" style={{ fontFamily: F }}>{copy.pricingEnvironment}</p>
                </div>
                <p className="text-[14px] font-black text-white leading-tight" style={{ fontFamily: F }}>
                  {settings.country}
                </p>
                <p className="mt-0.5 text-[10px] text-white/40" style={{ fontFamily: F }}>
                  {settings.currency} · {copy.profitSummary} {settings.profitPercent}%
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-[#d4a843] px-3 py-1 text-[9px] font-black text-[#2a1800] shadow-md uppercase tracking-wide" style={{ fontFamily: F }}>
                {copy.pricingActive}
              </span>
              <span className="text-[9px] text-white/30" style={{ fontFamily: F }}>
                ×{settings.locationFactor || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Country & city */}
      <GlassCard>
        <CardHeader icon="🗺️" title={copy.pricingCountryTitle} accent />
        <div className="grid grid-cols-2 gap-3 p-4">
          <PremiumInput label={copy.country} type="select" value={settings.country}
            onChange={(v) => onUpdateSetting("country", v)} options={countryOptions} icon="🌍" />
          <PremiumInput label={copy.city} value={settings.city}
            onChange={(v) => onUpdateSetting("city", v)} placeholder={isAr ? "الرياض" : "Riyadh"} icon="📍" />
          <PremiumInput label={isAr ? "رقم الهاتف" : "Phone Number"} value={settings.userPhone}
            onChange={(v) => onUpdateSetting("userPhone", v)} placeholder="+966 50..." icon="📱" />
          <PremiumInput label={copy.currency} value={settings.currency}
            onChange={(v) => onUpdateSetting("currency", v)} placeholder="SAR" icon="💲" />
          <PremiumInput label={copy.locationFactor} type="number" value={settings.locationFactor}
            onChange={(v) => onUpdateSetting("locationFactor", v)} placeholder="1.0" icon="📐" />
        </div>
      </GlassCard>

      {/* Ratio visual cards with interactive sliders */}
      <GlassCard>
        <CardHeader icon="📊" title={copy.pricingRatios} accent />
        <div className="p-4 space-y-3">
          {ratioItems.map((r) => (
            <div key={r.key} className={`relative overflow-hidden rounded-2xl ${r.light} ring-1 ${r.ring} p-3.5`}>
              {/* Background glow */}
              <div className={`pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br ${r.from} ${r.to} opacity-15 blur-xl`} />

              <div className="relative flex items-center gap-3 mb-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${r.from} ${r.to} text-white text-sm shadow-sm`}>
                  {r.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${r.text}`} style={{ fontFamily: F }}>{r.label}</p>
                </div>
                <div className={`flex items-baseline gap-0.5 rounded-xl px-2.5 py-1 bg-white/70`}>
                  <span className={`text-[22px] font-black leading-none ${r.text}`}>{r.value}</span>
                  <span className={`text-[13px] font-bold ${r.text} opacity-70`}>%</span>
                </div>
              </div>

              {/* Slider track */}
              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-2 rounded-full bg-white/60 ring-1 ring-white/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${r.from} ${r.to} transition-all duration-150`}
                    style={{ width: `${Math.min(r.value, 50) * 2}%` }}
                  />
                </div>
                <input
                  type="range" min="0" max="50" step="0.5"
                  value={r.value}
                  onChange={(e) => onUpdateSetting(r.key, e.target.value)}
                  className="absolute w-full h-6 opacity-0 cursor-pointer"
                  style={{ touchAction: "none" }}
                />
                {/* Thumb indicator */}
                <div
                  className={`absolute h-4 w-4 rounded-full bg-gradient-to-br ${r.from} ${r.to} ring-2 ring-white shadow-md pointer-events-none transition-all duration-150`}
                  style={{ left: `calc(${Math.min(r.value, 50) * 2}% - 8px)` }}
                />
              </div>

              {/* Fine-tune number input */}
              <input
                type="number" min="0" max="100" step="0.1"
                value={settings[r.key]}
                onChange={(e) => onUpdateSetting(r.key, e.target.value)}
                className={`mt-2 w-full rounded-lg border bg-white/60 px-2 py-1 text-center text-[11px] font-bold outline-none transition-all focus:bg-white focus:ring-2 ${r.ring} ${r.text} border-white/60`}
                style={{ fontFamily: F }}
              />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── Account Tab ─────────────────────────────────────────────────────────── */
function AccountTab({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, onOpenAuthScreen, sessionMeta,
  companies = [], suppliers = [], onShowStatus,
}) {
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showRfqs, setShowRfqs] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);
  const text = getAppText(settings.language);
  const copy = getSettingsCopy(settings.language);
  const isAr = settings.language !== "en";
  const isGuest = authMode === "guest";
  const isSuperAdminEmail = settings.userEmail?.toLowerCase() === "walidghazal46@gmail.com";
  const { profile: adminProfile, loading: adminLoading } = useAdminSession({
    uid: sessionMeta?.uid, email: settings.userEmail, displayName: settings.userName,
  });
  const canAccessAdminPanel = !isGuest && (isSuperAdminEmail || adminLoading || adminProfile?.canAccessAdmin === true);

  const initials = useMemo(() => {
    if (isGuest) return null;
    const name = settings.userName || "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] || "U").toUpperCase();
  }, [isGuest, settings.userName]);

  const guestItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody, icon: "🔒" },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue, icon: "💬" },
  ];
  const authItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody, icon: "🔒" },
    { id: "update",  title: text.settings.update,  subtitle: text.settings.updateStatus, icon: "⬆️" },
    { id: "rate",    title: text.settings.rate,    subtitle: text.settings.rateBody,     icon: "⭐" },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue, icon: "💬" },
  ];

  const socialLinks = [
    { id: "whatsapp", label: "WhatsApp", Icon: WhatsAppLogo, iconBg: "bg-[#25D366]", cardBg: "bg-[#F0FBF4]", border: "border-[#B8EFD0]", url: "https://wa.me/201064463650" },
    { id: "linkedin", label: "LinkedIn",  Icon: LinkedInLogo, iconBg: "bg-[#0A66C2]", cardBg: "bg-[#EEF5FF]", border: "border-[#B3D0F5]", url: "https://www.linkedin.com/in/walid-ghazal-pmi-pmp%C2%AE-85208678/" },
    { id: "youtube",  label: "YouTube",   Icon: YouTubeLogo,  iconBg: "bg-[#FF0000]", cardBg: "bg-[#FFF0F0]", border: "border-[#FFCCCC]", url: "https://www.youtube.com/@WalidGhazal" },
  ];

  if (showRfqs) {
    const isAr2 = settings.language !== "en";
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowRfqs(false)}
          className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-[12px] font-bold text-[#082555] transition hover:bg-[#f8fafc]"
          style={{ fontFamily: F }}
        >
          <span className="text-[14px]">›</span>
          {isAr2 ? "طلبات عروض السعر" : "RFQ Requests"}
        </button>

        {rfqRequests.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-[#e2e8f0] bg-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-3xl">📬</div>
            <p className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: F }}>
              {isAr2 ? "لا يوجد طلبات بعد" : "No RFQ requests yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rfqRequests.map((r) => {
              const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString(isAr2 ? "ar-SA" : "en-GB") : "";
              return (
                <div key={r.id} className="rounded-2xl border-2 border-sky-100 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-sky-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {r.rfqRef || "RFQ"}
                    </span>
                    <span className="text-[10px] text-slate-400">{date}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[#082555] leading-snug" style={{ fontFamily: F }}>
                    {r.itemName || (isAr2 ? "طلب عرض سعر عام" : "General RFQ")}
                  </p>
                  {r.itemId && (
                    <p className="mt-0.5 text-[11px] text-slate-400" style={{ fontFamily: F }}>{r.itemId}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "sent" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {r.status === "sent" ? (isAr2 ? "تم الإرسال" : "Sent") : (isAr2 ? "مسودة" : "Draft")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (showSaved) {
    const isAr2 = settings.language !== "en";
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowSaved(false)}
          className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-[12px] font-bold text-[#082555] transition hover:bg-[#f8fafc]"
          style={{ fontFamily: F }}
        >
          <span className="text-[14px]">›</span>
          {isAr2 ? "التحليلات المحفوظة" : "Saved Analyses"}
        </button>

        {savedAnalyses.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-[#e2e8f0] bg-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl">📋</div>
            <p className="text-[14px] font-bold text-[#082555]" style={{ fontFamily: F }}>
              {isAr2 ? "لا يوجد تحليلات محفوظة بعد" : "No saved analyses yet"}
            </p>
            <p className="mt-1 text-[12px] text-slate-500" style={{ fontFamily: F }}>
              {isAr2 ? "احفظ تحليلاتك من صفحة التسعير" : "Save analyses from the pricing page"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {savedAnalyses.map((item) => {
              const total = item.projectTotal ?? item.results?.finalTotal ?? item.results?.total ?? 0;
              const unit = item.finalUnitPrice ?? item.results?.unitPrice ?? 0;
              const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString(isAr2 ? "ar-SA" : "en-GB") : "";
              return (
                <div key={item.id} className="rounded-2xl border-2 border-[#E2D8C4] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.mode === "area" ? "bg-[#082555] text-[#C9A84C]" : "bg-[#C9A84C] text-[#082555]"
                    }`}>
                      {item.mode === "area" ? "BUILDING" : item.itemNum || "ITEM"}
                    </span>
                    <span className="text-[10px] text-slate-400">{date}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[#082555] leading-snug" style={{ fontFamily: F }}>{item.itemName}</p>
                  {(item.companyName || item.projectName) && (
                    <p className="mt-0.5 text-[11px] text-slate-400" style={{ fontFamily: F }}>
                      {item.projectName}{item.projectName && item.companyName ? " · " : ""}{item.companyName}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-[#F7F3EC] pt-2.5">
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase text-slate-400">Total</p>
                      <p className="text-[15px] font-black text-[#082555]">{Number(total).toLocaleString()}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-bold uppercase text-slate-400">Unit Price</p>
                      <p className="text-[15px] font-black text-[#C9A84C]">{Number(unit).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* ── Hero Profile Card ── */}
      <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/80 bg-white/78 shadow-[0_20px_60px_rgba(119,138,224,0.16)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(102,95,255,0.09)_0%,rgba(47,145,255,0.06)_48%,rgba(77,226,229,0.09)_100%)]" />
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#7edff0]/16 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#c0acff]/14 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,#7b8fd7 0,#7b8fd7 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#7b8fd7 0,#7b8fd7 1px,transparent 1px,transparent 24px)" }} />

        <div className="relative">
          {/* Avatar + identity */}
          <div className="flex items-start gap-4 px-5 pt-6 pb-4">
            <div className="relative shrink-0">
              {/* outer glow ring */}
              <div className="absolute inset-0 rounded-[18px] bg-[#d4a843]/30 blur-md scale-110" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(114,98,255,0.18)_0%,rgba(74,225,228,0.18)_100%)] text-2xl font-black text-[#7287d4] ring-2 ring-[#c9d6ff]">
                {isGuest ? "👤" : initials}
              </div>
              {!isGuest && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[17px] font-black leading-tight text-[#28417c]" style={{ fontFamily: F }}>
                {isGuest ? text.settings.guest : settings.userName}
              </p>
              <p className="mt-1 truncate text-[11px] text-[#8f99c3]" style={{ fontFamily: F }}>
                {isGuest ? text.settings.browseMode : settings.userEmail}
              </p>
              {!isGuest && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#4ade80]" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">{isAr ? "متصل" : "Active"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Inline stats */}
          {!isGuest && (
            <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowSaved(true)}
                className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-[#d7e4ff] bg-white/76 px-3 py-2.5 text-right transition hover:bg-white active:scale-[0.97]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7082ff_0%,#45dde4_100%)] text-base text-white shadow-sm">📋</div>
                <div>
                  <p className="text-[24px] font-black leading-none text-[#28417c]">{savedAnalyses.length}</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide leading-tight text-[#8f99c3]" style={{ fontFamily: F }}>{copy.savedAnalyses}</p>
                </div>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#b0badb]">‹</span>
              </button>
              <button type="button" onClick={() => setShowRfqs(true)} className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-[#d7e4ff] bg-white/76 px-3 py-2.5 transition hover:bg-white active:scale-95">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8d69ff_0%,#4ca0ff_100%)] text-base text-white shadow-sm">📬</div>
                <div>
                  <p className="text-[24px] font-black leading-none text-[#28417c]">{rfqRequests.length}</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide leading-tight text-[#8f99c3]" style={{ fontFamily: F }}>{copy.rfqs}</p>
                </div>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#b0badb]">‹</span>
              </button>
            </div>
          )}

          {/* Session info strip */}
          <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-[#d7e4ff] bg-white/72 px-4 py-2.5">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-widest text-[#91a0cf]">{text.settings.sessionStatus}</p>
            <p className="text-[11px] text-[#6375ac]" style={{ fontFamily: F }}>
              {isGuest ? text.settings.guestSession : `${text.settings.signedInAs} ${settings.userName}`}
            </p>
            {!isGuest && sessionMeta?.lastLoginAt && (
              <p className="mt-0.5 text-[10px] text-[#98a4ca]" style={{ fontFamily: F }}>
                {text.settings.signedInAt}: {sessionMeta.lastLoginAt}
              </p>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex flex-wrap gap-2 px-4 pb-5">
            {isGuest ? (
              <>
                <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#d4a843] to-[#e8c97a] py-2.5 text-[11px] font-bold text-[#082555] shadow-[0_4px_14px_rgba(212,168,67,0.4)] transition-all hover:shadow-[0_4px_20px_rgba(212,168,67,0.55)] active:scale-[0.97]"
                  style={{ fontFamily: F }}>{text.settings.loginNow}</button>
                <button type="button" onClick={() => onOpenAuthScreen?.("register")}
                  className="flex-1 rounded-xl border border-[#d7e4ff] bg-white/72 py-2.5 text-[11px] font-bold text-[#5d72b5] transition hover:bg-white active:scale-[0.97]"
                  style={{ fontFamily: F }}>{text.settings.createAccountNow}</button>
              </>
            ) : (
              <div className="grid w-full grid-cols-3 gap-2">
                <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#d7e4ff] bg-white/72 py-2.5 text-center text-[10px] font-bold text-[#5d72b5] transition hover:bg-white active:scale-[0.97]"
                  style={{ fontFamily: F }}>
                  <span>{text.settings.switchAccount}</span>
                </button>
                <button type="button" onClick={onLogout}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-[10px] font-bold text-red-500 transition hover:bg-red-100 active:scale-[0.97]"
                  style={{ fontFamily: F }}>
                  <span>{text.settings.logout}</span>
                </button>
                {deleteSent ? (
                  <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-1 py-2.5 text-center text-[9px] font-bold text-amber-600" style={{ fontFamily: F }}>
                    {isAr ? "طلب حذف معلق" : "Deletion pending"}
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-[10px] font-bold text-red-500 transition hover:bg-red-100 active:scale-[0.97]"
                    style={{ fontFamily: F }}>
                    <span>{isAr ? "حذف الحساب" : "Delete Account"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Account Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !deleteSubmitting && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-red-600/40 bg-[#1a0808] shadow-[0_0_80px_rgba(220,38,38,0.25),0_0_30px_rgba(220,38,38,0.12)] p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: F, direction: isAr ? "rtl" : "ltr" }}
          >
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/15 text-4xl shadow-[0_0_30px_rgba(220,38,38,0.35)]">
                🗑
              </div>
              <p className="text-[18px] font-extrabold text-white">
                {isAr ? "حذف الحساب" : "Delete Account"}
              </p>
              <p className="mt-2 text-[12px] text-white/60 leading-relaxed">
                {isAr
                  ? "هل تريد إرسال طلب حذف حسابك؟ سيراجع الأدمن طلبك ويتواصل معك قبل تنفيذ الحذف."
                  : "Do you want to request account deletion? Admin will review and contact you before proceeding."}
              </p>
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-[11px] text-red-300/80 leading-relaxed">
                ⚠️ {isAr ? "لا يمكن التراجع عن هذا الإجراء بعد موافقة الأدمن" : "This action cannot be undone after admin approval"}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={async () => {
                  if (!sessionMeta?.uid) return;
                  setDeleteSubmitting(true);
                  try {
                    await requestAccountDeletion(sessionMeta.uid, {
                      displayName: settings.userName || "",
                      email: settings.userEmail || "",
                    });
                    setDeleteSent(true);
                    setShowDeleteConfirm(false);
                    onShowStatus?.(
                      isAr ? "تم إرسال طلب الحذف — سيتم مراجعته قريباً" : "Deletion request sent",
                      "success"
                    );
                  } catch (e) {
                    onShowStatus?.(e.message || "Error", "warning");
                  } finally {
                    setDeleteSubmitting(false);
                  }
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-[13px] font-bold text-white hover:bg-red-700 transition disabled:opacity-60 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                {deleteSubmitting ? "⏳..." : (isAr ? "نعم، أرسل الطلب" : "Yes, request")}
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-2xl border border-white/15 bg-white/8 py-3 text-[13px] font-bold text-white/70 hover:bg-white/15 transition"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Language Toggle ── */}
      <GlassCard>
        <CardHeader icon="🌐" title={text.settings.languageSwitch} accent />
        <div className="p-3">
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5">
            {[{ lang: "ar", label: "العربية", flag: "🇸🇦" }, { lang: "en", label: "English", flag: "🇬🇧" }].map(({ lang, label, flag }) => {
              const active = settings.language === lang;
              return (
                <button key={lang} type="button" onClick={() => onUpdateSetting("language", lang)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-bold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-[#082555] to-[#0d3070] text-white shadow-[0_4px_12px_rgba(8,37,85,0.3)]"
                      : "text-slate-500 hover:text-slate-700"
                  }`} style={{ fontFamily: F }}>
                  <span className="text-base">{flag}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* ── Contact Social ── */}
      <GlassCard>
        <CardHeader icon="💬"
          title={isAr ? "تواصل معنا" : "Contact Us"}
          accent
          extra={<span className="text-[9px] font-bold text-white/40 uppercase tracking-wide">{isAr ? "اختر المنصة" : "Choose platform"}</span>}
        />
        <div className="grid grid-cols-3 gap-2 p-3">
          {socialLinks.map(({ id, label, Icon, iconBg, cardBg, border, url }) => (
            <button key={id} type="button" onClick={() => systemBridge.openExternalUrl(url)}
              className={`group flex flex-col items-center gap-2 rounded-2xl border ${border} ${cardBg} py-3.5 transition-all duration-150 hover:shadow-md active:scale-[0.97]`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} text-white shadow-md transition-transform duration-150 group-hover:scale-105`}>
                <Icon />
              </div>
              <span className="text-[10px] font-bold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ── How to Use ── */}
      <button type="button" onClick={() => setShowHowToUse(true)}
        className="group relative w-full overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(8,37,85,0.14)] transition-all duration-200 hover:shadow-[0_8px_28px_rgba(8,37,85,0.22)] hover:-translate-y-px active:scale-[0.98]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071e40] via-[#0d2545] to-[#162e52]" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(212,168,67,0.12), transparent 60%)" }} />
        <div className="pointer-events-none absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-[#d4a843] to-[#d4a843]/20" />

        <div className="relative flex items-center gap-3.5 px-4 py-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-[#d4a843]/20 blur-md scale-110" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4a843]/15 text-2xl ring-1 ring-[#d4a843]/25">📖</div>
          </div>
          <div className="min-w-0 flex-1 text-right" dir={isAr ? "rtl" : "ltr"}>
            <p className="text-[13px] font-bold text-white" style={{ fontFamily: F }}>
              {isAr ? "كيفية الاستخدام" : "How to Use"}
            </p>
            <p className="mt-0.5 text-[10px] text-white/40" style={{ fontFamily: F }}>
              {isAr ? "دليل سريع للتطبيق والموقع" : "Quick guide for the app & website"}
            </p>
          </div>
          <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-white/8 text-white/60 font-bold text-lg transition-all duration-150 group-hover:bg-[#d4a843]/20 group-hover:text-[#d4a843]">›</span>
        </div>
      </button>

      {showHowToUse && <HowToUseModal language={settings.language} onClose={() => setShowHowToUse(false)} />}

      {/* ── Quick Actions ── */}
      <GlassCard>
        <CardHeader icon="⚡" title={isAr ? "إجراءات سريعة" : "Quick Actions"} accent />
        <div className="p-2 space-y-1">
          {(isGuest ? guestItems : authItems).map((item) => (
            <ActionRow key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon}
              onClick={() => onSettingsAction?.(item.id)} />
          ))}
        </div>
      </GlassCard>

      {/* ── Admin Panel ── */}
      {canAccessAdminPanel && (
        <GlassCard>
          <CardHeader icon="🛡️" title={text.settings.adminTitle} accent
            extra={<span className="rounded-full bg-red-500/20 border border-red-400/30 px-2.5 py-0.5 text-[9px] font-bold text-red-300 uppercase tracking-wide">Admin</span>} />
          <div className="w-full max-w-full overflow-x-hidden p-4">
            {adminLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4a843] border-t-transparent" />
                <p className="text-[11px] font-bold text-slate-500">
                  {isAr ? "جاري تحميل ملف الأدمن..." : "Loading admin profile..."}
                </p>
              </div>
            ) : adminProfile?.canAccessAdmin === true ? (
              <AdminDashboard
                language={settings.language}
                adminProfile={adminProfile}
                onToast={(message, tone = "info") => onShowStatus?.(message, tone)}
                initialTab={settings?.adminDashboardTab || "dashboard"}
              />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-[12px] font-bold text-amber-700">
                  {isAr
                    ? "ملف الأدمن لم يكتمل تحميله أو أن جلسة تسجيل الدخول غير متزامنة على هذا الجهاز."
                    : "The admin profile is not fully loaded yet, or the sign-in session is not synced on this device."}
                </p>
                <p className="mt-2 text-[11px] text-amber-600">
                  {isAr
                    ? "أعد تسجيل الدخول أو افتح التطبيق من جديد بعد المزامنة."
                    : "Please sign in again or reopen the app after syncing."}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── App Info Footer ── */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/78 shadow-[0_20px_60px_rgba(119,138,224,0.14)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(102,95,255,0.08)_0%,rgba(47,145,255,0.05)_48%,rgba(77,226,229,0.08)_100%)]" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(116,222,240,0.16), transparent 60%)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,#7b8fd7 0,#7b8fd7 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#7b8fd7 0,#7b8fd7 1px,transparent 1px,transparent 20px)" }} />

        <div className="relative px-4 py-5 text-center">
          <div className="mx-auto mb-3 relative w-fit">
            <div className="absolute inset-2 rounded-[22px] bg-[linear-gradient(135deg,rgba(109,98,255,0.22)_0%,rgba(73,223,226,0.2)_100%)] blur-[18px] scale-125" />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl p-0">
              <img
                src={taseeraLogo}
                alt="Taseera app icon"
                className="h-full w-full rounded-2xl object-contain shadow-[0_0_26px_rgba(106,127,224,0.22)]"
              />
            </div>
          </div>
          <p className="bg-[linear-gradient(90deg,#685fff_0%,#2f90ff_52%,#3ddcdf_100%)] bg-clip-text text-[15px] font-black text-transparent" style={{ fontFamily: F }}>{settings.appName}</p>
          <p className="mt-0.5 text-[10px] text-[#8f9ac5] font-bold uppercase tracking-widest" style={{ fontFamily: F }}>
            {text.settings.version} {settings.appVersion}
          </p>
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-[#d7e2ff] to-transparent" />
          <p className="text-[9px] leading-relaxed text-[#6677ae]" style={{ fontFamily: F }}>
            {text.settings.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main SettingsPanel ─────────────────────────────────────────────────── */
const TABS = [
  { id: "account",      icon: "👤", labelKey: "accountTab" },
  { id: "subscription", icon: "💎", labelKey: "subscriptionTab" },
];

export default function SettingsPanel({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, navigationBridge,
  onOpenAuthScreen, sessionMeta, companies, suppliers, onShowStatus, onNavigate,
}) {
  const copy = getSettingsCopy(settings.language);
  const isGuest = authMode === "guest";
  const isSuperAdminEmail = settings.userEmail?.toLowerCase() === "walidghazal46@gmail.com";
  const { profile: adminProfile, loading: adminLoading } = useAdminSession({
    uid: sessionMeta?.uid, email: settings.userEmail, displayName: settings.userName,
  });
  const isSubscribed = !isGuest && (isSuperAdminEmail || adminProfile?.canAccessAdmin === true || adminProfile?.isPaid === true);
  const initialSection = settings?.settingsPanelSection || "account";
  const nav = useBackStack({
    initialEntry: { section: initialSection },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
    onEntryChange: navigationBridge?.onEntryChange,
  });
  const activeView = nav.currentEntry.section;

  useEffect(() => {
    const preferred = settings?.settingsPanelSection || "account";
    if (preferred !== activeView) nav.reset({ section: preferred });
  }, [activeView, nav, settings?.settingsPanelSection]);

  return (
    <div className="space-y-3">

      {/* ── Premium Tab Switcher ── */}
      <div className="relative overflow-hidden rounded-[22px] shadow-[0_8px_32px_rgba(8,37,85,0.28)]">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071e40] via-[#0d2545] to-[#162e52]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 20px)" }} />
        <div className="pointer-events-none absolute top-0 right-0 h-16 w-32 bg-[#d4a843]/8 blur-2xl" />

        <div className="relative flex gap-1.5 p-2">
          {TABS.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button key={tab.id} type="button"
                onClick={() => {
                  onUpdateSetting?.("settingsPanelSection", tab.id);
                  nav.navigate({ section: tab.id });
                }}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-[14px] py-3 px-1 text-center transition-all duration-200 ${
                  active
                    ? "bg-[#d4a843] shadow-[0_4px_16px_rgba(212,168,67,0.5)]"
                    : "hover:bg-white/8 active:bg-white/12"
                }`}
                style={{ fontFamily: F }}
              >
                <span className={`text-[18px] leading-none transition-all duration-200 ${active ? "scale-110 drop-shadow-sm" : "opacity-50"}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-bold leading-none transition-colors duration-200 ${active ? "text-[#082555]" : "text-white/45"}`}>
                  {copy[tab.labelKey]}
                </span>
                {active && (
                  <span className="absolute bottom-1.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-[#082555]/25" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeView === "subscription" ? (
        <SubscriptionPanel
          language={settings?.language || "ar"}
          authMode={authMode}
          sessionMeta={sessionMeta}
          settings={settings}
          isSubscribed={isSubscribed}
          onOpenAuthScreen={onOpenAuthScreen}
          onShowStatus={onShowStatus}
          onGoToPricing={() => onNavigate?.("pricing")}
        />
      ) : (
        <AccountTab
          settings={settings} authMode={authMode} onLogout={onLogout}
          onUpdateSetting={onUpdateSetting} onSettingsAction={onSettingsAction}
          systemBridge={systemBridge} savedAnalyses={savedAnalyses}
          rfqRequests={rfqRequests} onOpenAuthScreen={onOpenAuthScreen}
          sessionMeta={sessionMeta} companies={companies} suppliers={suppliers}
          onShowStatus={onShowStatus}
        />
      )}
    </div>
  );
}

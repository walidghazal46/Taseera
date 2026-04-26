import { useState } from "react";
import { APP_LANGUAGES, getAppText } from "../data/appText";
import { GlobeIcon, LogOutIcon, ShieldIcon, UserIcon } from "./icons";
import useBackStack from "../hooks/useBackStack";

const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";

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
        phonePermissions: "Phone permissions", androidConnected: "Android connected",
        webPreview: "Web / preview mode", androidSummaryPrefix: "Package",
        androidVersion: "Version", webSummary: "Preview mode — full permissions appear in the Android app.",
        dataState: "Data status", savedAnalyses: "Saved analyses", rfqs: "RFQ requests",
        pricingTab: "Pricing", accountTab: "Account",
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
        phonePermissions: "صلاحيات الهاتف", androidConnected: "بيئة Android متصلة",
        webPreview: "وضع الويب / المعاينة", androidSummaryPrefix: "الحزمة",
        androidVersion: "الإصدار", webSummary: "معاينة الواجهة — الصلاحيات الكاملة من تطبيق Android.",
        dataState: "حالة البيانات", savedAnalyses: "تحليلات محفوظة", rfqs: "طلبات عروض سعر",
        pricingTab: "التسعير", accountTab: "الحساب",
      };
}

function SettingInput({ label, value, onChange, placeholder, type = "text", options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {label}
      </span>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
          style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
        >
          {(options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"
          style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }} />
      )}
    </label>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f0e4cc] text-sm">
          {icon}
        </span>
        <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionRow({ title, subtitle, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-[#f0e8d8] bg-[#faf6ef] px-3 py-2.5 text-right transition hover:bg-[#f5ede0] active:scale-[0.98]">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{title}</p>
        {subtitle && <p className="mt-0.5 text-[9px] text-slate-400 leading-relaxed" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>{subtitle}</p>}
      </div>
      <span className="shrink-0 text-[#d4a843] font-bold mr-2">›</span>
    </button>
  );
}

function LangToggle({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl px-4 py-2 text-[11px] font-bold transition ${
        active ? "bg-gradient-to-r from-[#0d2545] to-[#162e52] text-white shadow-sm" : "border border-[#e8dcc8] bg-white text-slate-600"
      }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      {children}
    </button>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M19.05 4.94A9.77 9.77 0 0 0 12.09 2C6.67 2 2.25 6.4 2.25 11.82c0 1.74.45 3.43 1.3 4.93L2 22l5.39-1.5a9.8 9.8 0 0 0 4.69 1.2h.01c5.42 0 9.84-4.41 9.84-9.83a9.76 9.76 0 0 0-2.88-6.93ZM12.09 20.02h-.01a8.14 8.14 0 0 1-4.14-1.13l-.3-.18-3.2.89.86-3.12-.2-.32a8.12 8.12 0 0 1-1.24-4.34c0-4.51 3.68-8.18 8.21-8.18 2.19 0 4.24.85 5.79 2.39a8.11 8.11 0 0 1 2.4 5.79c0 4.52-3.69 8.2-8.17 8.2Zm4.48-6.14c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.28.18-.53.06-.25-.13-1.05-.39-2-.99a7.45 7.45 0 0 1-1.38-1.72c-.14-.25-.02-.39.11-.52.11-.11.25-.28.37-.42.13-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.83-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.23 3.74.59.25 1.05.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.15-1.17-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 0 0 3.3 4.97c0 1.08.87 1.97 1.93 1.97h.02a1.97 1.97 0 0 0 0-3.94ZM20.7 12.88c0-3.02-1.61-4.43-3.76-4.43-1.73 0-2.5.95-2.93 1.62V8.5h-3.38c.05 1.04 0 11.5 0 11.5H14v-6.42c0-.34.02-.68.12-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.87 1.03 1.87 2.53V20h3.38v-7.12Z" />
    </svg>
  );
}

function YouTubeLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M21.58 7.19a2.99 2.99 0 0 0-2.1-2.12C17.63 4.56 12 4.56 12 4.56s-5.63 0-7.48.51a2.99 2.99 0 0 0-2.1 2.12C1.9 9.06 1.9 12 1.9 12s0 2.94.52 4.81a2.99 2.99 0 0 0 2.1 2.12c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.99 2.99 0 0 0 2.1-2.12c.52-1.87.52-4.81.52-4.81s0-2.94-.52-4.81ZM10.2 15.05V8.95L15.27 12l-5.07 3.05Z" />
    </svg>
  );
}

function HowToUseModal({ language, onClose }) {
  const isAr = language !== "en";
  const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

  const sections = isAr
    ? [
        {
          icon: "🏢",
          title: "صفحة الشركات",
          steps: [
            "اضغط على «الشركات» من شريط التنقل السفلي.",
            "اضغط «إضافة شركة» لإنشاء شركة جديدة بتفاصيلها.",
            "بعد اختيار الشركة يمكنك إضافة مشاريعها وتتبع حالتها.",
          ],
        },
        {
          icon: "💰",
          title: "صفحة التسعير",
          steps: [
            "اختر بنداً من قائمة البنود أو ابحث عنه مباشرةً.",
            "أدخل الكميات والموارد ليحسب التطبيق السعر تلقائياً.",
            "احفظ التحليل وربطه بمشروع لمراجعته لاحقاً.",
          ],
        },
        {
          icon: "🔧",
          title: "صفحة الموردين",
          steps: [
            "اختر الدولة من شاشة الاختيار عند الدخول للصفحة.",
            "تصفح الموردين أو ابحث بالاسم أو التخصص.",
            "اضغط على المورد لعرض تفاصيله والتواصل معه أو طلب عرض سعر.",
          ],
        },
        {
          icon: "🌐",
          title: "الموقع الإلكتروني",
          steps: [
            "يعمل الموقع بنفس واجهة التطبيق على أي متصفح.",
            "البيانات محفوظة محلياً في المتصفح ولا تُفقد عند إغلاق الصفحة.",
            "لتجربة كاملة مع الإشعارات والمكالمات استخدم تطبيق Android.",
          ],
        },
      ]
    : [
        {
          icon: "🏢",
          title: "Companies Page",
          steps: [
            "Tap «Companies» in the bottom navigation bar.",
            "Tap «Add Company» to create a new company with its details.",
            "After selecting a company you can add projects and track their status.",
          ],
        },
        {
          icon: "💰",
          title: "Pricing Page",
          steps: [
            "Choose an item from the list or search for it directly.",
            "Enter quantities and resources; the app calculates the price automatically.",
            "Save the analysis and link it to a project for later review.",
          ],
        },
        {
          icon: "🔧",
          title: "Suppliers Page",
          steps: [
            "Select the country from the picker when entering the page.",
            "Browse suppliers or search by name or specialty.",
            "Tap a supplier to view details, contact them, or request a quote.",
          ],
        },
        {
          icon: "🌐",
          title: "Website",
          steps: [
            "The website uses the same interface as the app in any browser.",
            "Data is saved locally in the browser and persists between sessions.",
            "For full features like calls and notifications use the Android app.",
          ],
        },
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-t-3xl bg-[#F7F3EC] shadow-2xl"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-[#082555] to-[#0d3070] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C9A84C]/20 text-lg">📖</span>
            <p className="text-[15px] font-bold text-white" style={{ fontFamily: AR }}>
              {isAr ? "كيفية الاستخدام" : "How to Use"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Intro */}
        <div className="mx-4 mt-4 rounded-2xl border border-[#C9A84C]/30 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] p-4">
          <p className="text-[12px] leading-6 text-slate-700" style={{ fontFamily: AR }}>
            {isAr
              ? "تطبيق تسعيرة هو أداة احترافية لتسعير الأعمال الإنشائية ومتابعة الموردين وإدارة المشاريع. اتبع الخطوات التالية للاستفادة الكاملة."
              : "Taseera is a professional tool for construction pricing, supplier management, and project tracking. Follow the steps below to get the most out of it."}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3 p-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-[#f0e8d8] bg-[#faf6ef] px-4 py-3">
                <span className="text-lg">{section.icon}</span>
                <p className="text-[12px] font-bold text-[#082555]" style={{ fontFamily: AR }}>
                  {section.title}
                </p>
              </div>
              <div className="p-4 space-y-2">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-[10px] font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-5 text-slate-700" style={{ fontFamily: AR }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-[#082555] to-[#0d3070] py-3 text-[13px] font-bold text-white shadow-lg"
            style={{ fontFamily: AR }}
          >
            {isAr ? "فهمت، شكراً" : "Got it, thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactLinksCard({ onOpen }) {
  const links = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppLogo />,
      bg: "bg-[#EAF8EF]",
      border: "border-[#A9E5BC]",
      text: "text-[#25D366]",
      hover: "hover:bg-[#DFF4E7]",
      url: "https://wa.me/201064463650",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInLogo />,
      bg: "bg-[#EAF4FF]",
      border: "border-[#A9CFFA]",
      text: "text-[#0A66C2]",
      hover: "hover:bg-[#DFEEFF]",
      url: "https://www.linkedin.com/in/walid-ghazal-pmi-pmp%C2%AE-85208678/",
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: <YouTubeLogo />,
      bg: "bg-[#FFF0F0]",
      border: "border-[#FFC4C4]",
      text: "text-[#FF0000]",
      hover: "hover:bg-[#FFE5E5]",
      url: "https://www.youtube.com/@WalidGhazal",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          تواصل معنا
        </p>
        <span className="text-[9px] text-slate-400">اختر المنصة المناسبة</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onOpen(link.url)}
            className={`rounded-[22px] border ${link.border} ${link.bg} ${link.hover} px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition active:scale-[0.98]`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className={`flex h-10.5 w-10.5 items-center justify-center rounded-xl ${link.text} bg-white shadow-sm ring-1 ring-black/5`}>
                {link.icon}
              </div>
              <div className={`text-[12px] font-bold ${link.text}`}>{link.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingTab({ settings, onUpdateSetting, copy }) {
  const countryOptions = [
    { value: "السعودية", label: "السعودية" },
    { value: "جمهورية مصر العربية", label: "جمهورية مصر العربية" },
    { value: "الإمارات العربية المتحدة", label: "الإمارات العربية المتحدة" },
  ];

  return (
    <div className="space-y-3">
      {/* Status banner */}
      <div className="rounded-2xl border border-[#d4a843]/30 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.pricingEnvironment}
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {settings.country} — {settings.currency} — {copy.profitSummary} {settings.profitPercent}%
            </p>
          </div>
          <span className="rounded-full bg-[#d4a843]/20 px-3 py-1 text-[9px] font-bold text-[#b8893d]"
            style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {copy.pricingActive}
          </span>
        </div>
      </div>

      <SectionCard title={copy.pricingCountryTitle} icon="⚙️">
        <div className="grid grid-cols-2 gap-3">
          <SettingInput label={copy.country} type="select" value={settings.country} onChange={(v) => onUpdateSetting("country", v)} options={countryOptions} />
          <SettingInput label={copy.city} value={settings.city} onChange={(v) => onUpdateSetting("city", v)} placeholder="الرياض" />
          <SettingInput label={copy.currency} value={settings.currency} onChange={(v) => onUpdateSetting("currency", v)} placeholder="SAR" />
          <SettingInput label={copy.locationFactor} type="number" value={settings.locationFactor} onChange={(v) => onUpdateSetting("locationFactor", v)} placeholder="1" />
        </div>
      </SectionCard>

      <SectionCard title={copy.pricingRatios} icon="📈">
        <div className="grid grid-cols-3 gap-3">
          <SettingInput label={copy.profitPercent} type="number" value={settings.profitPercent} onChange={(v) => onUpdateSetting("profitPercent", v)} placeholder="15" />
          <SettingInput label={copy.overheadPercent} type="number" value={settings.overheadPercent} onChange={(v) => onUpdateSetting("overheadPercent", v)} placeholder="6" />
          <SettingInput label={copy.taxPercent} type="number" value={settings.taxPercent} onChange={(v) => onUpdateSetting("taxPercent", v)} placeholder="15" />
        </div>
      </SectionCard>
    </div>
  );
}

function AccountTab({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, onOpenAuthScreen, sessionMeta,
}) {
  const [showHowToUse, setShowHowToUse] = useState(false);
  const text = getAppText(settings.language);
  const copy = getSettingsCopy(settings.language);
  const isGuest = authMode === "guest";
  const isPrimaryAdmin = !isGuest && settings.userEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL;

  const guestItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue },
  ];

  const authItems = [
    { id: "privacy", title: text.settings.privacy, subtitle: text.settings.privacyBody },
    { id: "update", title: text.settings.update, subtitle: text.settings.updateStatus },
    { id: "rate", title: text.settings.rate, subtitle: text.settings.rateBody },
    { id: "support", title: text.settings.technicalSupport, subtitle: text.settings.supportValue },
  ];

  return (
    <div className="space-y-3">
      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              {isGuest ? "👤" : "👤"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {isGuest ? text.settings.guest : settings.userName}
              </p>
              <p className="mt-0.5 text-[10px] text-white/50" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {isGuest ? text.settings.browseMode : settings.userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Session status */}
        <div className="border-t border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[9px] text-[#d4a843] font-bold mb-1" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {text.settings.sessionStatus}
          </p>
          <p className="text-[10px] text-white/70" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
            {isGuest ? text.settings.guestSession : `${text.settings.signedInAs} ${settings.userName}`}
          </p>
          {!isGuest && sessionMeta?.lastLoginAt && (
            <p className="mt-0.5 text-[9px] text-white/40" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {text.settings.signedInAt}: {sessionMeta.lastLoginAt}
            </p>
          )}
        </div>

        {/* Auth actions */}
        <div className="flex gap-2 px-4 pb-4 pt-2">
          {isGuest ? (
            <>
              <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                className="flex-1 rounded-xl bg-[#d4a843] py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.loginNow}
              </button>
              <button type="button" onClick={() => onOpenAuthScreen?.("register")}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.createAccountNow}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onOpenAuthScreen?.("login")}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold text-white"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.switchAccount}
              </button>
              <button type="button" onClick={onLogout}
                className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-[10px] font-bold text-red-300"
                style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.logout}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Language */}
      <SectionCard title={text.settings.languageSwitch} icon="🌐">
        <div className="flex gap-2">
          <LangToggle active={settings.language === "ar"} onClick={() => onUpdateSetting("language", "ar")}>
            العربية
          </LangToggle>
          <LangToggle active={settings.language === "en"} onClick={() => onUpdateSetting("language", "en")}>
            English
          </LangToggle>
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title={copy.dataState} icon="📊">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] py-3 text-center">
            <p className="text-[20px] font-bold text-[#0d2545]">{savedAnalyses.length}</p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.savedAnalyses}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] py-3 text-center">
            <p className="text-[20px] font-bold text-[#0d2545]">{rfqRequests.length}</p>
            <p className="mt-0.5 text-[9px] text-slate-500" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {copy.rfqs}
            </p>
          </div>
        </div>
      </SectionCard>

      <ContactLinksCard onOpen={systemBridge.openExternalUrl} />

      {/* How to use */}
      <button
        type="button"
        onClick={() => setShowHowToUse(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] px-4 py-3.5 text-right shadow-sm transition hover:from-[#fff5e0] hover:to-[#fff2d8] active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C9A84C]/15 text-base">📖</span>
          <div>
            <p className="text-[12px] font-bold text-[#082555]" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {settings.language === "en" ? "How to Use" : "كيفية الاستخدام"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {settings.language === "en" ? "Quick guide for the app & website" : "دليل سريع للتطبيق والموقع"}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[#C9A84C] font-bold text-lg">›</span>
      </button>

      {showHowToUse && (
        <HowToUseModal language={settings.language} onClose={() => setShowHowToUse(false)} />
      )}

      {/* Action items */}
      <div className="space-y-2">
        {(isGuest ? guestItems : authItems).map((item) => (
          <ActionRow key={item.id} title={item.title} subtitle={item.subtitle}
            onClick={() => onSettingsAction?.(item.id)} />
        ))}
      </div>

      {/* Admin panel */}
      {isPrimaryAdmin && (
        <SectionCard title={text.settings.adminTitle} icon="🛡️">
          <div className="space-y-2">
            <div className="rounded-xl bg-[#faf6ef] px-3 py-2">
              <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                {text.settings.adminPrimary}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500">{settings.userEmail}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[text.settings.manageCompanies, text.settings.managePricing, text.settings.manageSuppliers].map((label) => (
                <div key={label} className="rounded-xl border border-[#e8dcc8] bg-white py-2 text-center text-[9px] font-bold text-slate-600"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* App info */}
      <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] px-4 py-3 text-center">
        <p className="text-[12px] font-bold text-slate-700" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {settings.appName}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {text.settings.version} {settings.appVersion}
        </p>
        <p className="mt-1.5 text-[9px] text-slate-400" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
          {text.settings.disclaimer}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPanel({
  settings, authMode, onLogout, onUpdateSetting, onSettingsAction,
  systemBridge, savedAnalyses, rfqRequests, navigationBridge,
  onOpenAuthScreen, sessionMeta,
}) {
  const copy = getSettingsCopy(settings.language);
  const text = getAppText(settings.language);
  const nav = useBackStack({
    initialEntry: { section: "account" },
    registerBackHandler: navigationBridge?.registerBackHandler,
    pushHistoryEntry: navigationBridge?.pushHistoryEntry,
    onEntryChange: navigationBridge?.onEntryChange,
  });
  const activeView = nav.currentEntry.section;

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] p-3 shadow-[0_8px_24px_rgba(13,37,69,0.25)]">
        <div className="flex gap-1 rounded-xl bg-white/10 p-1">
          {[{ id: "account", label: copy.accountTab }, { id: "pricing", label: copy.pricingTab }].map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => nav.navigate({ section: tab.id })}
              className={`flex-1 rounded-[10px] px-2 py-2 text-[10px] font-bold transition-all ${
                activeView === tab.id ? "bg-[#d4a843] text-white shadow-[0_2px_8px_rgba(212,168,67,0.35)]" : "text-white/70"
              }`} style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "pricing" ? (
        <PricingTab settings={settings} onUpdateSetting={onUpdateSetting} copy={copy} />
      ) : (
        <AccountTab
          settings={settings} authMode={authMode} onLogout={onLogout}
          onUpdateSetting={onUpdateSetting} onSettingsAction={onSettingsAction}
          systemBridge={systemBridge} savedAnalyses={savedAnalyses}
          rfqRequests={rfqRequests} onOpenAuthScreen={onOpenAuthScreen}
          sessionMeta={sessionMeta}
        />
      )}
    </div>
  );
}

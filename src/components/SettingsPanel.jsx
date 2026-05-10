import { useMemo, useState } from "react";
import { getAppText } from "../data/appText";
import taseeraLogo from "../assets/taseera-logo-light.png";

const F = "'Cairo','Tajawal',sans-serif";

function SettingsCard({ title, subtitle, icon, children, className = "" }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-[#dbe5ff] bg-white/86 shadow-[0_14px_34px_rgba(94,124,214,0.12)] ${className}`}>
      <div className="flex items-center gap-3 border-b border-[#edf2ff] bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_55%,#f6fffd_100%)] px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-black leading-tight text-[#102a56]" style={{ fontFamily: F }}>{title}</h3>
          {subtitle ? <p className="mt-1 text-[10px] font-semibold leading-4 text-[#66789d]" style={{ fontFamily: F }}>{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function ActionButton({ children, onClick, tone = "blue", square = false }) {
  const tones = {
    blue: "border-[#bcd6ff] bg-[#eef6ff] text-[#174f9a] hover:bg-[#e2f0ff]",
    mint: "border-[#bceee4] bg-[#effdfa] text-[#0f766e] hover:bg-[#dcfbf5]",
    gold: "border-[#f0dca4] bg-[#fff8e5] text-[#8a6516] hover:bg-[#fff1c2]",
    rose: "border-[#ffc5d0] bg-[#fff1f4] text-[#b42346] hover:bg-[#ffe4ea]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl border text-center text-[12px] font-black leading-tight transition ${square ? "aspect-square min-h-0 px-2 py-2" : "min-h-[44px] px-3 py-2"} ${tones[tone] || tones.blue}`}
      style={{ fontFamily: F }}
    >
      {children}
    </button>
  );
}

function PrivacyPolicyPage({ language, onBack }) {
  const isAr = language !== "en";
  const sections = isAr
    ? [
        ["البيانات التي نحفظها", "يحفظ التطبيق بيانات الاستخدام الأساسية داخل الجهاز مثل الإعدادات، الدولة المختارة، الشركات، الموردين، التحليلات، وطلبات الأسعار التي تنشئها."],
        ["طريقة الاستخدام", "تُستخدم البيانات لتشغيل وظائف التطبيق، تحسين تجربة التسعير، حفظ اختياراتك، وتسهيل الرجوع إلى التحليلات والمعلومات التي أدخلتها."],
        ["الضيوف والمستخدمون", "يمكن للضيوف والمستخدمين استخدام التطبيق بالكامل. قد تختلف طريقة حفظ البيانات حسب حالة الدخول، لكنها لا تُستخدم لتقييد الوصول إلى الأدوات."],
        ["مشاركة البيانات", "لا نبيع بياناتك ولا نشاركها مع أطراف خارجية لأغراض تسويقية. عند فتح واتساب أو لينكدإن أو يوتيوب أو البريد، تنتقل إلى خدمات خارجية تخضع لسياسات الخصوصية الخاصة بها."],
        ["الصلاحيات", "قد يطلب التطبيق صلاحيات مرتبطة بالجهاز مثل الاتصال أو المشاركة أو فتح الروابط فقط عند استخدام ميزة تحتاج لذلك. يمكنك إدارة هذه الصلاحيات من إعدادات الجهاز."],
        ["حماية البيانات", "نستخدم أقل قدر ممكن من البيانات لتشغيل التطبيق، ونوصي بعدم إدخال معلومات حساسة داخل حقول الملاحظات أو الطلبات إلا عند الحاجة."],
        ["التواصل", "لأي سؤال متعلق بالخصوصية يمكنك التواصل عبر قنوات التواصل الموجودة داخل صفحة الإعدادات."],
      ]
    : [
        ["Data We Store", "The app stores basic in-app data such as settings, selected country, companies, suppliers, analyses, and RFQ records you create."],
        ["How Data Is Used", "Data is used to run app features, improve pricing workflows, save your choices, and make your analyses easy to revisit."],
        ["Guests And Users", "Guests and signed-in users can use the full app. Storage may differ by session type, but data is not used to restrict tool access."],
        ["Data Sharing", "We do not sell your data or share it with third parties for marketing. External links such as WhatsApp, LinkedIn, YouTube, or email follow their own privacy policies."],
        ["Permissions", "The app may request device permissions only when a feature needs them, such as calling, sharing, or opening links. You can manage permissions from device settings."],
        ["Data Protection", "We keep data use minimal and recommend avoiding sensitive information in notes or requests unless needed."],
        ["Contact", "For privacy questions, use the contact channels available in Settings."],
      ];

  return (
    <div className="grid gap-3 pb-4" dir={isAr ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={onBack}
        className="w-fit rounded-xl border border-[#cfe0ff] bg-white/85 px-4 py-2 text-[12px] font-black text-[#1554b7] shadow-sm"
        style={{ fontFamily: F }}
      >
        {isAr ? "رجوع" : "Back"}
      </button>
      <section className="overflow-hidden rounded-3xl border border-[#dbe5ff] bg-white/90 shadow-[0_18px_46px_rgba(94,124,214,0.14)]">
        <div className="bg-[linear-gradient(135deg,#eef7ff_0%,#effdfa_100%)] px-5 py-5">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#36a8c7]" style={{ fontFamily: F }}>Taseera</p>
          <h2 className="mt-1 text-[22px] font-black text-[#102a56]" style={{ fontFamily: F }}>
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h2>
          <p className="mt-2 text-[12px] font-semibold leading-6 text-[#66789d]" style={{ fontFamily: F }}>
            {isAr ? "آخر تحديث: مايو 2026" : "Last updated: May 2026"}
          </p>
        </div>
        <div className="grid gap-3 p-4">
          {sections.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-[#edf2ff] bg-[#fbfdff] px-4 py-3">
              <h3 className="text-[13px] font-black text-[#102a56]" style={{ fontFamily: F }}>{title}</h3>
              <p className="mt-2 text-[12px] font-semibold leading-6 text-[#566784]" style={{ fontFamily: F }}>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  authMode,
  onLogout,
  onUpdateSetting,
  onSettingsAction,
  systemBridge,
  savedAnalyses = [],
  rfqRequests = [],
  onOpenAuthScreen,
  sessionMeta,
  companies = [],
  suppliers = [],
}) {
  const text = getAppText(settings.language);
  const isAr = settings.language !== "en";
  const [showGuide, setShowGuide] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const stats = useMemo(() => ([
    { label: isAr ? "الشركات" : "Companies", value: companies.length },
    { label: isAr ? "الموردين" : "Suppliers", value: suppliers.length },
    { label: isAr ? "التحليلات" : "Analyses", value: savedAnalyses.length },
    { label: isAr ? "طلبات السعر" : "RFQs", value: rfqRequests.length },
  ]), [companies.length, isAr, rfqRequests.length, savedAnalyses.length, suppliers.length]);

  const displayName = authMode === "guest"
    ? text.settings.guest
    : settings.userName || sessionMeta?.userName || (isAr ? "مستخدم" : "User");

  if (showPrivacy) {
    return <PrivacyPolicyPage language={settings.language} onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <div className="grid gap-4 pb-4" dir={isAr ? "rtl" : "ltr"}>
      <section className="overflow-hidden rounded-[28px] border border-[#d6e5ff] bg-[linear-gradient(135deg,#ffffff_0%,#f1f7ff_46%,#edfffb_100%)] shadow-[0_22px_60px_rgba(85,121,214,0.16)]">
        <div className="flex items-center gap-4 px-5 py-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-[0_12px_30px_rgba(90,128,222,0.18)]">
            <img src={taseeraLogo} alt="Taseera" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#36a8c7]" style={{ fontFamily: F }}>
              {isAr ? "وصول كامل للجميع" : "Full access for everyone"}
            </p>
            <h2 className="mt-1 break-words text-[20px] font-black leading-tight text-[#102a56]" style={{ fontFamily: F }}>
              {displayName}
            </h2>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#66789d]" style={{ fontFamily: F }}>
              {isAr ? "كل الأدوات والبيانات متاحة للجميع بشكل مباشر." : "All tools and data are available to everyone immediately."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <SettingsCard icon="🌐" title={text.settings.languageSwitch} subtitle={isAr ? "اختر لغة الواجهة" : "Choose interface language"}>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#eef5ff] p-1.5">
            {[{ lang: "ar", label: "العربية" }, { lang: "en", label: "English" }].map((item) => {
              const active = settings.language === item.lang;
              return (
                <button key={item.lang} type="button" onClick={() => onUpdateSetting("language", item.lang)}
                  className={`rounded-xl px-3 py-3 text-[12px] font-black transition ${active ? "bg-white text-[#1554b7] shadow-sm" : "text-[#6b7da1] hover:bg-white/70"}`}
                  style={{ fontFamily: F }}>
                  {item.label}
                </button>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard icon="📊" title={isAr ? "نشاط التطبيق" : "App Activity"} subtitle={isAr ? "ملخص سريع للبيانات الحالية" : "Quick summary of current data"}>
          <div className="grid grid-cols-2 gap-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl bg-[linear-gradient(135deg,#f5f9ff_0%,#effcf9_100%)] px-3 py-3 text-center">
                <p className="text-[18px] font-black text-[#1554b7]" style={{ fontFamily: F }}>{item.value}</p>
                <p className="text-[10px] font-bold text-[#6b7da1]" style={{ fontFamily: F }}>{item.label}</p>
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard icon="⚡" title={isAr ? "إجراءات سريعة" : "Quick Actions"} subtitle={isAr ? "روابط وخدمات مساعدة" : "Helpful app links and services"}>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={() => setShowPrivacy(true)}>{text.settings.privacy}</ActionButton>
            <ActionButton tone="mint" onClick={() => systemBridge?.openEmail?.("walidghazal46@gmail.com", isAr ? "تواصل من تطبيق تسعيرة" : "Contact from Taseera", "")}>
              {text.settings.contact}
              <span className="mt-1 block text-[9px] font-bold opacity-70">walidghazal46@gmail.com</span>
            </ActionButton>
            <ActionButton tone="gold" onClick={() => setShowGuide(true)}>{isAr ? "كيفية الاستخدام" : "How to use"}</ActionButton>
            <ActionButton tone="blue" onClick={() => onSettingsAction?.("update")}>{text.settings.update}</ActionButton>
          </div>
        </SettingsCard>

        <SettingsCard icon="💬" title={isAr ? "تواصل معنا" : "Contact Us"} subtitle={isAr ? "اختر قناة التواصل المناسبة" : "Choose a contact channel"} className="sm:col-span-2">
          <div className="grid grid-cols-3 gap-2">
            <ActionButton square tone="mint" onClick={() => systemBridge?.openExternalUrl?.("https://wa.me/201064463650")}>WhatsApp</ActionButton>
            <ActionButton square tone="blue" onClick={() => systemBridge?.openExternalUrl?.("https://www.linkedin.com/in/walid-ghazal-pmi-pmp%C2%AE-85208678/")}>LinkedIn</ActionButton>
            <ActionButton square tone="rose" onClick={() => systemBridge?.openExternalUrl?.("https://www.youtube.com/@WalidGhazal")}>YouTube</ActionButton>
          </div>
        </SettingsCard>

        <SettingsCard icon="👤" title={text.settings.sessionStatus} subtitle={authMode === "guest" ? text.settings.guestSessionBody : `${text.settings.signedInAs} ${displayName}`} className="sm:col-span-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <ActionButton onClick={() => onOpenAuthScreen?.("login")}>{authMode === "guest" ? text.settings.loginNow : text.settings.switchAccount}</ActionButton>
            <ActionButton tone="gold" onClick={() => onSettingsAction?.("rate")}>{text.settings.rate}</ActionButton>
            {authMode !== "guest" ? <ActionButton tone="rose" onClick={onLogout}>{text.settings.logout}</ActionButton> : null}
          </div>
        </SettingsCard>
      </div>

      <footer className="rounded-2xl border border-[#dbe5ff] bg-white/80 px-4 py-4 text-center shadow-sm">
        <img src={taseeraLogo} alt="Taseera" className="mx-auto h-12 w-auto object-contain" />
        <p className="mt-2 text-[13px] font-black text-[#102a56]" style={{ fontFamily: F }}>{settings.appName}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a8ba9]" style={{ fontFamily: F }}>{text.settings.version} {settings.appVersion}</p>
        <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-[#66789d]" style={{ fontFamily: F }}>{text.settings.disclaimer}</p>
      </footer>

      {showGuide ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-[16px] font-black text-[#102a56]" style={{ fontFamily: F }}>{isAr ? "كيفية الاستخدام" : "How to use"}</h3>
            <div className="mt-3 grid gap-2">
              {[
                isAr ? "اختر الدولة من بطاقات ثابتة ثم افتح كامل محتوى الصفحة." : "Select a country card, then access the full page content.",
                isAr ? "استخدم التسعير لتحليل البنود أو تسعير مساحة المبنى بدون حدود." : "Use pricing to analyze items or building areas without limits.",
                isAr ? "افتح الموردين والشركات وبيانات التواصل مباشرة للجميع." : "Open supplier and company contact data directly for everyone.",
              ].map((line, index) => (
                <p key={line} className="rounded-xl bg-[#f4f8ff] px-3 py-2 text-[12px] font-semibold leading-5 text-[#44536f]" style={{ fontFamily: F }}>
                  {index + 1}. {line}
                </p>
              ))}
            </div>
            <button type="button" onClick={() => setShowGuide(false)} className="mt-4 w-full rounded-xl bg-[#1554b7] py-3 text-[13px] font-black text-white" style={{ fontFamily: F }}>
              {isAr ? "تم" : "Done"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

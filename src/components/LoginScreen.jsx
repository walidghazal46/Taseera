import { useCallback, useEffect, useState } from "react";
import { getAppText } from "../data/appText";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

export default function LoginScreen({
  onLogin, onGuest, language = "ar", onChangeLanguage, theme = "dark", initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const text = getAppText(language);
  const isLight = theme === "light";

  const mapGoogleError = useCallback((code) => {
    const fallback = language === "en" ? "Google sign-in failed." : "فشل تسجيل الدخول بجوجل.";
    const byCode = {
      "auth/unauthorized-domain": language === "en"
        ? "This domain is not authorized in Firebase Auth."
        : "هذا الدومين غير مصرح به في Firebase Auth.",
      "auth/operation-not-allowed": language === "en"
        ? "Google provider is disabled in Firebase Authentication."
        : "تسجيل الدخول بجوجل غير مفعّل في Firebase Authentication.",
      "auth/popup-blocked": language === "en"
        ? "Popup blocked. Switching to redirect sign-in..."
        : "تم حظر النافذة المنبثقة. جارٍ التحويل لتسجيل الدخول...",
      "auth/web-storage-unsupported": language === "en"
        ? "Browser storage is blocked."
        : "تخزين المتصفح غير متاح.",
      "auth/network-request-failed": language === "en"
        ? "Network error. Check your connection and retry."
        : "خطأ في الشبكة. تحقق من الاتصال وحاول مرة أخرى.",
    };
    return byCode[code] || fallback;
  }, [language]);

  useEffect(() => {
    let active = true;
    getRedirectResult(auth)
      .then((cred) => {
        if (!active || !cred?.user) return;
        onLogin("authenticated", {
          uid: cred.user.uid,
          userName: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
          userEmail: cred.user.email,
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(mapGoogleError(err?.code));
      });
    return () => { active = false; };
  }, [mapGoogleError, onLogin]);

  const updateField = (field, value) => {
    setForm((c) => ({ ...c, [field]: value }));
    setError("");
  };

  const submit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError(language === "en" ? "Email and password are required." : "البريد الإلكتروني وكلمة المرور مطلوبان.");
      return;
    }
    if (mode === "register") {
      if (!form.fullName.trim()) { setError(language === "en" ? "Full name is required." : "الاسم الكامل مطلوب."); return; }
      if (form.password !== form.confirmPassword) { setError(language === "en" ? "Passwords don't match." : "كلمة المرور غير مطابقة."); return; }
    }
    setLoading(true); setError("");
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(cred.user, { displayName: form.fullName.trim() });
        onLogin("authenticated", { uid: cred.user.uid, userName: form.fullName.trim(), userEmail: form.email.trim() });
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        onLogin("authenticated", { uid: cred.user.uid, userName: cred.user.displayName || cred.user.email.split("@")[0], userEmail: cred.user.email });
      }
    } catch (err) {
      const msgs = {
        "auth/user-not-found": language === "en" ? "No account with this email." : "لا يوجد حساب بهذا البريد.",
        "auth/wrong-password": language === "en" ? "Incorrect password." : "كلمة المرور غير صحيحة.",
        "auth/email-already-in-use": language === "en" ? "Email already registered." : "البريد مسجّل مسبقاً.",
        "auth/invalid-email": language === "en" ? "Invalid email." : "بريد إلكتروني غير صالح.",
        "auth/weak-password": language === "en" ? "Password must be 6+ characters." : "كلمة المرور 6 أحرف على الأقل.",
        "auth/invalid-credential": language === "en" ? "Incorrect email or password." : "البريد أو كلمة المرور غير صحيحة.",
      };
      setError(msgs[err.code] || (language === "en" ? "An error occurred." : "حدث خطأ، حاول مجدداً."));
    } finally { setLoading(false); }
  };

  const signInWithGoogle = async () => {
    setLoading(true); setError("");
    const isAndroid = typeof window !== "undefined" && window.TaseeraAndroid;
    if (isAndroid) {
      try {
        const handleSuccess = (e) => {
          window.removeEventListener("taseera:google-signin-success", handleSuccess);
          window.removeEventListener("taseera:google-signin-error", handleError);
          setLoading(false);
          onLogin("authenticated", { uid: e.detail.uid, userName: e.detail.displayName, userEmail: e.detail.email });
        };
        const handleError = (e) => {
          window.removeEventListener("taseera:google-signin-success", handleSuccess);
          window.removeEventListener("taseera:google-signin-error", handleError);
          setLoading(false);
          const nativeMessage = e?.detail?.error;
          setError(
            nativeMessage ||
            (language === "en" ? "Google sign-in failed." : "فشل تسجيل الدخول بجوجل.")
          );
        };
        window.addEventListener("taseera:google-signin-success", handleSuccess);
        window.addEventListener("taseera:google-signin-error", handleError);
        window.TaseeraAndroid.signInWithGoogle();
      } catch { setLoading(false); setError(language === "en" ? "Google sign-in failed." : "فشل تسجيل الدخول بجوجل."); }
    } else {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        onLogin("authenticated", { uid: cred.user.uid, userName: cred.user.displayName || cred.user.email.split("@")[0], userEmail: cred.user.email });
      } catch (err) {
        if (err.code === "auth/popup-closed-by-user") {
          // User cancelled popup intentionally.
        } else if (
          err.code === "auth/popup-blocked" ||
          err.code === "auth/cancelled-popup-request" ||
          err.code === "auth/operation-not-supported-in-this-environment"
        ) {
          try {
            await signInWithRedirect(auth, googleProvider);
          } catch (redirectErr) {
            setError(mapGoogleError(redirectErr?.code || err?.code));
          }
        } else {
          setError(mapGoogleError(err?.code));
        }
      } finally { setLoading(false); }
    }
  };

  /* ── field sizing adapts to register mode (more fields = shorter padding) ── */
  const fieldPy = mode === "register" ? "py-2.5" : "py-3";
  const inputClass = `w-full rounded-2xl border px-4 ${fieldPy} text-[13px] outline-none transition
    border-white/15 bg-white/10 text-white placeholder:text-white/40
    focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20`;

  const GoogleIcon = () => (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.58A14.9 14.9 0 0 1 9.6 24c0-1.58.27-3.12.93-4.58L2.55 13.26A23.93 23.93 0 0 0 0 24c0 3.77.9 7.34 2.55 10.74l7.98-6.16z"/>
      <path fill="#EA4335" d="M24 9.52c3.53 0 6.69 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.26l7.98 6.16C12.43 13.74 17.74 9.52 24 9.52z"/>
    </svg>
  );

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-[#07162b] via-[#0a1e3d] to-[#0f2650]"
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
    >
      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[#d4a843]/6 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-72 w-72 rounded-full bg-[#1a4a8a]/30 blur-3xl" />
      </div>

      <div
        className="relative flex flex-1 flex-col px-5 gap-3"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* ══════════════ HEADER ══════════════ */}
        <div className="flex items-center gap-3">
          {/* Logo stamp */}
          <div
            className="shrink-0 w-[52px] h-[52px] rounded-[1.1rem] overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.5)" }}
          >
            <img
              src="./taseera-logo.png"
              alt="Taseera"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Brand text */}
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-black text-white leading-tight">تسعيرة</p>
            <p className="text-[10px] font-medium text-white/40 leading-tight tracking-wide">
              Know Costs · Beat The Market
            </p>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1 shrink-0">
            {[{ id: "ar", label: "ع" }, { id: "en", label: "EN" }].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onChangeLanguage?.(lang.id)}
                className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition ${
                  language === lang.id
                    ? "bg-[#d4a843] text-white"
                    : "border border-white/15 text-white/40"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════ MAIN CARD ══════════════ */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] px-4 pt-3.5 pb-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm space-y-2.5">

          {/* Mode tabs */}
          <div className="flex gap-1 rounded-2xl bg-white/8 p-1">
            {[{ id: "login", label: text.login.login }, { id: "register", label: text.login.register }].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setError(""); }}
                className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition-all ${
                  mode === m.id
                    ? "bg-[#d4a843] text-white shadow-[0_3px_10px_rgba(212,168,67,0.4)]"
                    : "text-white/50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-2">
            {mode === "register" && (
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClass}
                placeholder={text.login.fullName}
              />
            )}
            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              placeholder={text.login.email}
              inputMode="email"
              autoComplete="email"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={inputClass}
              placeholder={text.login.password}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
            {mode === "register" && (
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={inputClass}
                placeholder={text.login.confirmPassword}
                autoComplete="new-password"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full rounded-2xl bg-[#d4a843] py-3 text-[13px] font-bold text-white shadow-[0_6px_20px_rgba(212,168,67,0.4)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? (language === "en" ? "Please wait…" : "جارٍ التحميل…")
              : (mode === "register" ? text.login.submitRegister : text.login.submitLogin)}
          </button>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-500/20 border border-red-500/30 px-3 py-2 text-center text-[10px] font-semibold text-red-300 leading-snug">
              {error}
            </p>
          )}

          {/* Sub-hint */}
          <p className="text-center text-[9px] leading-relaxed text-white/35">
            {mode === "register" ? text.login.registerHint : text.login.loginHint}
          </p>
        </div>

        {/* ══════════════ DIVIDER ══════════════ */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[9px] text-white/25 font-bold">{language === "en" ? "or" : "أو"}</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* ══════════════ SOCIAL ROW ══════════════ */}
        {/* Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/7 px-4 py-3 text-[12px] font-bold text-white transition hover:bg-white/12 active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon />
          {language === "en" ? "Continue with Google" : "المتابعة بحساب جوجل"}
        </button>

        {/* Guest */}
        <button
          type="button"
          onClick={() => onGuest("guest")}
          className="w-full rounded-2xl border border-[#d4a843]/35 py-2.5 text-[12px] font-bold text-[#d4a843] transition hover:bg-[#d4a843]/8 active:scale-[0.98]"
        >
          {text.login.guest}
        </button>

        {/* ══════════════ FOOTER HINT ══════════════ */}
        <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.04] px-3.5 py-2.5">
          <p className="flex-1 text-[9px] leading-relaxed text-white/30">{text.login.guestHint}</p>
        </div>
      </div>
    </div>
  );
}

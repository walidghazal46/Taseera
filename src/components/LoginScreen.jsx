import { useCallback, useEffect, useState } from "react";
import { getAppText } from "../data/appText";
import { auth, googleProvider } from "../firebase";
import taseeraLogoLight from "../assets/taseera-logo-light.png";
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
  const isLight = true;

  const mapEmailAuthError = useCallback((code) => {
    const fallback = language === "en"
      ? "Unable to sign in right now. Please try again."
      : "تعذر تسجيل الدخول الآن. حاول مرة أخرى.";
    const byCode = {
      "auth/user-not-found": language === "en"
        ? "No account found with this email."
        : "لا يوجد حساب بهذا البريد.",
      "auth/wrong-password": language === "en"
        ? "The password is incorrect."
        : "كلمة المرور غير صحيحة.",
      "auth/invalid-credential": language === "en"
        ? "Email or password is incorrect."
        : "البريد أو كلمة المرور غير صحيحة.",
      "auth/invalid-login-credentials": language === "en"
        ? "Email or password is incorrect."
        : "البريد أو كلمة المرور غير صحيحة.",
      "auth/invalid-email": language === "en"
        ? "Please enter a valid email address."
        : "يرجى إدخال بريد إلكتروني صالح.",
      "auth/email-already-in-use": language === "en"
        ? "This email is already registered."
        : "هذا البريد مسجل بالفعل.",
      "auth/weak-password": language === "en"
        ? "Password must be at least 6 characters."
        : "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      "auth/too-many-requests": language === "en"
        ? "Too many attempts. Wait a bit, then try again."
        : "عدد المحاولات كبير. انتظر قليلًا ثم حاول مرة أخرى.",
      "auth/network-request-failed": language === "en"
        ? "Network error. Check your connection and try again."
        : "هناك مشكلة في الشبكة. تحقق من الاتصال ثم حاول مرة أخرى.",
    };
    return byCode[code] || fallback;
  }, [language]);

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
      setError(mapEmailAuthError(err?.code));
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

  /* field py shrinks slightly in register mode (4 fields) to stay on screen */
  const fieldPy = mode === "register" ? "py-2" : "py-2.5";
  const inputClass = `w-full rounded-2xl border px-4 ${fieldPy} text-[13px] outline-none transition
    ${isLight
      ? "border-[#e2e9ff] bg-white/88 text-[#2d3a74] placeholder:text-[#a0a8ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:border-[#52dfe4] focus:ring-2 focus:ring-[#79d6ff]/24"
      : "border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20"}`;

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`flex h-[100dvh] flex-col overflow-hidden ${
        isLight
          ? "bg-[radial-gradient(circle_at_top_left,rgba(101,225,245,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(180,140,255,0.16),transparent_24%),linear-gradient(180deg,#fcfdff_0%,#f3f7ff_48%,#fafcff_100%)]"
          : "bg-gradient-to-b from-[#061422] via-[#0a1e3d] to-[#0f2650]"
      }`}
      style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
    >
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[#74def0]/18 blur-3xl" />
        <div className="absolute top-24 -right-16 h-64 w-64 rounded-full bg-[#bfa7ff]/18 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#4a97ff]/10 blur-3xl" />
      </div>

      <div
        className="app-container relative flex flex-1 flex-col overflow-hidden px-5"
      >
        {/* ── Logo ── */}
        <div className="flex flex-col items-center pt-8 pb-5">
          <div
            className="mx-auto overflow-hidden rounded-[2.6rem] border border-white/80 bg-white/78 p-1.5 shadow-[0_24px_60px_rgba(122,142,232,0.18)] backdrop-blur-xl w-[min(52vw,13.2rem)]"
            style={{
              boxShadow: "0 0 0 1px rgba(255,255,255,0.45), 0 30px 80px rgba(120,138,224,0.18)",
            }}
          >
            <img
              src={taseeraLogoLight}
              alt="Taseera"
              className="block w-full rounded-[2.3rem] object-contain"
            />
          </div>
          <p className="mt-5 text-center text-[11px] font-medium leading-relaxed text-[#8a94bf] max-w-[18rem]">
            {text.login.hero}
          </p>
        </div>

        {/* ── Main card ── */}
        <div className="space-y-2.5 rounded-[34px] border border-white/80 bg-white/74 px-5 pt-4 pb-4 shadow-[0_26px_80px_rgba(118,136,224,0.18)] backdrop-blur-xl">

          {/* Mode switcher */}
          <div className="flex gap-1 rounded-2xl bg-[#edf2ff] p-1">
            {[{ id: "login", label: text.login.login }, { id: "register", label: text.login.register }].map((m) => (
              <button key={m.id} type="button" onClick={() => { setMode(m.id); setError(""); }}
                className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
                  mode === m.id
                    ? "bg-[linear-gradient(90deg,#7260ff_0%,#3395ff_52%,#4de2e4_100%)] text-white shadow-[0_10px_24px_rgba(95,125,255,0.28)]"
                    : "text-[#8d97bf]"
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-2">
            {mode === "register" && (
              <input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClass} placeholder={text.login.fullName} />
            )}
            <input value={form.email} onChange={(e) => updateField("email", e.target.value)}
              className={inputClass} placeholder={text.login.email} inputMode="email" autoComplete="email" />
            <input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)}
              className={inputClass} placeholder={text.login.password}
              autoComplete={mode === "register" ? "new-password" : "current-password"} />
            {mode === "register" && (
              <input type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={inputClass} placeholder={text.login.confirmPassword} autoComplete="new-password" />
            )}
          </div>

          {/* Submit */}
          <button type="button" onClick={submit} disabled={loading}
            className="w-full rounded-2xl bg-[linear-gradient(90deg,#7a58ff_0%,#3595ff_50%,#50e0e5_100%)] py-3 text-[13px] font-bold text-white shadow-[0_16px_32px_rgba(95,125,255,0.24)] transition active:scale-[0.98] disabled:opacity-60">
            {loading ? (language === "en" ? "Please wait…" : "جارٍ التحميل…") : (mode === "register" ? text.login.submitRegister : text.login.submitLogin)}
          </button>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-center text-[11px] font-semibold text-rose-600">
              {error}
            </p>
          )}

          <p className="text-center text-[10px] leading-relaxed text-[#97a1c7]">
            {mode === "register" ? text.login.registerHint : text.login.loginHint}
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#dbe4ff]" />
          <span className="text-[10px] text-[#9ca5c9]">{language === "en" ? "or" : "أو"}</span>
          <div className="h-px flex-1 bg-[#dbe4ff]" />
        </div>

        {/* ── Google ── */}
        <button type="button" onClick={signInWithGoogle} disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#dfe6ff] bg-white/82 px-4 py-3 text-[13px] font-bold text-[#21356a] shadow-[0_10px_24px_rgba(115,131,208,0.08)] transition hover:border-[#8dd9ee] hover:bg-white active:scale-[0.98] disabled:opacity-60">
          <svg width="21" height="21" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
            <path fill="#FBBC05" d="M10.53 28.58A14.9 14.9 0 0 1 9.6 24c0-1.58.27-3.12.93-4.58L2.55 13.26A23.93 23.93 0 0 0 0 24c0 3.77.9 7.34 2.55 10.74l7.98-6.16z"/>
            <path fill="#EA4335" d="M24 9.52c3.53 0 6.69 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.26l7.98 6.16C12.43 13.74 17.74 9.52 24 9.52z"/>
          </svg>
          {language === "en" ? "Continue with Google" : "المتابعة بحساب جوجل"}
        </button>

        {/* ── Guest + Language ── */}
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => onGuest("guest")}
            className="flex-1 rounded-2xl border border-[#90d9ee] py-3 text-[13px] font-bold text-[#4aa9ff] transition hover:bg-[#eefaff] active:scale-[0.98]">
            {text.login.guest}
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            {[{ id: "ar", label: "ع" }, { id: "en", label: "EN" }].map((lang) => (
              <button key={lang.id} type="button" onClick={() => onChangeLanguage?.(lang.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-[11px] font-bold transition ${
                  language === lang.id
                    ? "bg-[linear-gradient(135deg,#8e68ff_0%,#48dddf_100%)] text-white shadow-[0_10px_22px_rgba(98,125,236,0.24)]"
                    : "border border-[#dfe6ff] bg-white/82 text-[#98a1c7]"
                }`}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

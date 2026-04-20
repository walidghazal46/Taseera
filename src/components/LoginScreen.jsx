import { useState } from "react";
import { getAppText } from "../data/appText";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

export default function LoginScreen({
  onLogin,
  onGuest,
  language = "ar",
  onChangeLanguage,
  theme = "dark",
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const text = getAppText(language);
  const isLight = theme === "light";

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = async () => {
    if (!formState.email.trim() || !formState.password.trim()) {
      setError(
        language === "en"
          ? "Email and password are required."
          : "البريد الإلكتروني وكلمة المرور مطلوبان."
      );
      return;
    }

    if (mode === "register") {
      if (!formState.fullName.trim()) {
        setError(language === "en" ? "Full name is required." : "الاسم الكامل مطلوب.");
        return;
      }
      if (formState.password !== formState.confirmPassword) {
        setError(
          language === "en"
            ? "Password confirmation does not match."
            : "تأكيد كلمة المرور غير مطابق."
        );
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          formState.email.trim(),
          formState.password
        );
        await updateProfile(credential.user, {
          displayName: formState.fullName.trim(),
        });
        onLogin("authenticated", {
          userName: formState.fullName.trim(),
          userEmail: formState.email.trim(),
        });
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          formState.email.trim(),
          formState.password
        );
        onLogin("authenticated", {
          userName: credential.user.displayName || credential.user.email.split("@")[0],
          userEmail: credential.user.email,
        });
      }
    } catch (err) {
      const msg = {
        "auth/user-not-found": language === "en" ? "No account with this email." : "لا يوجد حساب بهذا البريد.",
        "auth/wrong-password": language === "en" ? "Incorrect password." : "كلمة المرور غير صحيحة.",
        "auth/email-already-in-use": language === "en" ? "Email already registered." : "البريد مسجّل مسبقاً.",
        "auth/invalid-email": language === "en" ? "Invalid email address." : "بريد إلكتروني غير صالح.",
        "auth/weak-password": language === "en" ? "Password must be at least 6 characters." : "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
        "auth/invalid-credential": language === "en" ? "Incorrect email or password." : "البريد أو كلمة المرور غير صحيحة.",
      }[err.code];
      setError(msg || (language === "en" ? "An error occurred. Try again." : "حدث خطأ، حاول مجدداً."));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      onLogin("authenticated", {
        userName: credential.user.displayName || credential.user.email.split("@")[0],
        userEmail: credential.user.email,
      });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(language === "en" ? "Google sign-in failed. Try again." : "فشل تسجيل الدخول بجوجل، حاول مجدداً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`flex h-[100dvh] max-h-[100dvh] overflow-hidden flex-col ${
        isLight
          ? "bg-[radial-gradient(circle_at_top,#f7efdf_0%,#ecdec0_58%,#d4be94_100%)]"
          : "bg-[radial-gradient(circle_at_top,#0B4A84_0%,#002D5A_52%,#001A35_100%)]"
      }`}
    >
      <div
        className={`flex flex-1 w-full flex-col ${
          isLight ? "bg-[#fffaf1]" : "bg-[#001F3F]"
        }`}
      >
        <div className="flex flex-1 flex-col overflow-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col justify-end gap-6 sm:justify-between h-full">
            <div className="pt-3 text-center">
              <div className="mx-auto w-[min(58vw,15rem)] bg-transparent p-0 shadow-none ring-0">
                <img
                  src="./taseera-logo.png"
                  alt="Taseera"
                  className="block w-full object-contain"
                  style={{
                    WebkitMaskImage:
                      "radial-gradient(circle at center, rgba(0,0,0,1) 62%, rgba(0,0,0,0.92) 74%, rgba(0,0,0,0.68) 86%, rgba(0,0,0,0) 100%)",
                    maskImage:
                      "radial-gradient(circle at center, rgba(0,0,0,1) 62%, rgba(0,0,0,0.92) 74%, rgba(0,0,0,0.68) 86%, rgba(0,0,0,0) 100%)",
                  }}
                />
              </div>
              <p
                className={`mx-auto mt-2 max-w-[17.5rem] px-2 text-center text-[14px] font-medium leading-5 ${
                  isLight ? "text-[#002D5A]" : "text-white/90"
                }`}
              >
                {text.login.hero}
              </p>
            </div>

            <div className="grid shrink-0 gap-2 pt-1.5 mb-[1cm] sm:mb-0">
              <div className="grid grid-cols-2 rounded-[14px] bg-[#f4ecdf] p-1">
                {[
                  { id: "login", label: text.login.login },
                  { id: "register", label: text.login.register },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-[10px] px-2.5 py-2 text-[13px] font-bold transition ${
                      mode === item.id
                        ? "bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] text-white shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="rounded-[18px] border border-[#eadfca] bg-white p-3 shadow-sm">
                {mode === "register" && (
                  <input
                    value={formState.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    className="w-full rounded-[12px] border border-slate-200 px-3 py-2.5 text-[14px] outline-none"
                    placeholder={text.login.fullName}
                  />
                )}
                <input
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={`w-full rounded-[12px] border border-slate-200 px-3 py-2.5 text-[14px] outline-none ${
                    mode === "register" ? "mt-3" : ""
                  }`}
                  placeholder={text.login.email}
                />
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className="mt-2 w-full rounded-[12px] border border-slate-200 px-3 py-2.5 text-[14px] outline-none"
                  placeholder={text.login.password}
                />
                {mode === "register" && (
                  <input
                    type="password"
                    value={formState.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    className="mt-2 w-full rounded-[12px] border border-slate-200 px-3 py-2.5 text-[14px] outline-none"
                    placeholder={text.login.confirmPassword}
                  />
                )}
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="mt-3 w-full rounded-full bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] px-3 py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
                >
                  {loading
                    ? (language === "en" ? "Please wait…" : "جارٍ التحميل…")
                    : (mode === "register" ? text.login.submitRegister : text.login.submitLogin)}
                </button>
                {error && (
                  <p className="mt-2 text-center text-[13px] font-semibold text-red-600">{error}</p>
                )}
                <p className="mt-2 text-center text-[12px] leading-5 text-slate-500">
                  {mode === "register"
                    ? text.login.registerHint
                    : text.login.loginHint}
                </p>
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-[14px] font-bold text-slate-700 shadow-sm disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.53 28.58A14.9 14.9 0 0 1 9.6 24c0-1.58.27-3.12.93-4.58L2.55 13.26A23.93 23.93 0 0 0 0 24c0 3.77.9 7.34 2.55 10.74l7.98-6.16z"/>
                  <path fill="#EA4335" d="M24 9.52c3.53 0 6.69 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.26l7.98 6.16C12.43 13.74 17.74 9.52 24 9.52z"/>
                </svg>
                {language === "en" ? "Continue with Google" : "المتابعة بحساب جوجل"}
              </button>

              <button
                type="button"
                onClick={() => onGuest("guest")}
                className="w-full rounded-full border border-[#d8b16c] bg-white px-3 py-2.5 text-[14px] font-bold text-[#b8893d]"
              >
                {text.login.guest}
              </button>

              <div className="rounded-[14px] bg-[#fff8ec] px-3 py-2 text-[13px] text-slate-600">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onChangeLanguage?.("ar")}
                      className={`rounded-[8px] px-2 py-1 text-[13px] font-bold ${
                        language === "ar"
                          ? "bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] text-white"
                          : "border border-[#d8b16c] bg-white text-[#b8893d]"
                      }`}
                    >
                      ع
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeLanguage?.("en")}
                      className={`rounded-[8px] px-2 py-1 text-[13px] font-bold ${
                        language === "en"
                          ? "bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] text-white"
                          : "border border-[#d8b16c] bg-white text-[#b8893d]"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
                {text.login.guestHint}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

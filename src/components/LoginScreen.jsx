import { useState } from "react";

import { getAppText } from "../data/appText";

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
  const text = getAppText(language);
  const isLight = theme === "light";

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = () => {
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

    onLogin("authenticated", {
      userName: formState.fullName.trim() || formState.email.split("@")[0],
      userEmail: formState.email.trim(),
    });
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen px-4 py-6 ${
        isLight
          ? "bg-[radial-gradient(circle_at_top,#f7efdf_0%,#ecdec0_58%,#d4be94_100%)]"
          : "bg-[radial-gradient(circle_at_top,#0B4A84_0%,#002D5A_52%,#001A35_100%)]"
      }`}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div
          className={`w-full max-w-[430px] rounded-[36px] border p-2.5 shadow-[0_30px_90px_rgba(2,6,23,0.55)] ${
            isLight ? "border-[#d0b27a] bg-[#f8f1e4]" : "border-[#d0b27a] bg-[#001F3F]"
          }`}
        >
          <div
            className={`overflow-hidden rounded-[24px] border p-4 ${
              isLight ? "border-[#eadfca] bg-[#fffaf1]" : "border-slate-800 bg-[#001F3F]"
            }`}
          >
            <div className="flex min-h-[620px] flex-col justify-between">
              <div className="pt-8 text-center">
                <div className="mx-auto w-64 bg-transparent p-0 shadow-none ring-0">
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
                  className={`mx-auto mt-4 max-w-[19rem] px-3 text-center text-[13px] font-medium leading-6 ${
                    isLight ? "text-[#002D5A]" : "text-white/90"
                  }`}
                >
                  {text.login.hero}
                </p>
              </div>

              <div className="grid gap-2.5 pt-2">
                <div className="grid grid-cols-2 rounded-[16px] bg-[#f4ecdf] p-1">
                  {[
                    { id: "login", label: text.login.login },
                    { id: "register", label: text.login.register },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`rounded-[12px] px-3 py-2 text-xs font-bold transition ${
                        mode === item.id
                          ? "bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] text-white shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-[20px] border border-[#eadfca] bg-white p-3 shadow-sm">
                  {mode === "register" ? (
                    <input
                      value={formState.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-xs outline-none"
                      placeholder={text.login.fullName}
                    />
                  ) : null}
                  <input
                    value={formState.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={`w-full rounded-[14px] border border-slate-200 px-3 py-2 text-xs outline-none ${
                      mode === "register" ? "mt-3" : ""
                    }`}
                    placeholder={text.login.email}
                  />
                  <input
                    type="password"
                    value={formState.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="mt-2 w-full rounded-[14px] border border-slate-200 px-3 py-2 text-xs outline-none"
                    placeholder={text.login.password}
                  />
                  {mode === "register" ? (
                    <input
                      type="password"
                      value={formState.confirmPassword}
                      onChange={(event) => updateField("confirmPassword", event.target.value)}
                      className="mt-2 w-full rounded-[14px] border border-slate-200 px-3 py-2 text-xs outline-none"
                      placeholder={text.login.confirmPassword}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={submit}
                    className="mt-3 w-full rounded-full bg-[linear-gradient(135deg,#0A4C87_0%,#002D5A_100%)] px-3 py-2.5 text-xs font-bold text-white"
                  >
                    {mode === "register" ? text.login.submitRegister : text.login.submitLogin}
                  </button>
                  {error ? (
                    <p className="mt-2 text-center text-[10px] font-semibold text-red-600">{error}</p>
                  ) : null}
                  <p className="mt-2 text-center text-[10px] leading-5 text-slate-500">
                    {mode === "register"
                      ? text.login.registerHint
                      : text.login.loginHint}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onGuest("guest")}
                  className="-mt-2 w-full rounded-full border border-[#d8b16c] bg-white px-3 py-2.5 text-xs font-bold text-[#b8893d]"
                >
                  {text.login.guest}
                </button>

                <div className="rounded-[16px] bg-[#fff8ec] px-3 py-2 text-xs text-slate-600">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onChangeLanguage?.("ar")}
                        className={`rounded-[8px] px-2 py-1 text-[10px] font-bold ${
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
                        className={`rounded-[8px] px-2 py-1 text-[10px] font-bold ${
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
    </div>
  );
}

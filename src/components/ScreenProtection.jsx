import { useEffect, useRef, useState } from "react";

const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";
const PROTECTION_MSG =
  "Content protection is enabled. Screenshots are not allowed on this screen. You can export the data or save it to your account using the available options.";

/**
 * ScreenProtection wraps premium content to prevent casual copying/screenshots.
 * When enabled:
 *  - disables text selection
 *  - blocks right-click (shows toast)
 *  - calls TaseeraAndroid.setSecureScreen(true/false) on Android
 *  - shows a fixed bottom banner
 */
export default function ScreenProtection({ enabled = true, children }) {
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Tell Android WebView to set FLAG_SECURE
    try {
      window.TaseeraAndroid?.setSecureScreen?.(true);
    } catch (_) {}

    return () => {
      try {
        window.TaseeraAndroid?.setSecureScreen?.(false);
      } catch (_) {}
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    function handleContextMenu(e) {
      e.preventDefault();
      setToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), 3500);
    }

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      clearTimeout(toastTimer.current);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <div
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        position: "relative",
      }}
    >
      {children}

      {/* Fixed bottom banner */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(15,36,68,0.92)",
          backdropFilter: "blur(4px)",
          color: "#fff",
          fontSize: "11px",
          fontFamily: AR,
          direction: "rtl",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span style={{ fontSize: "14px" }}>🔒</span>
        <span>
          محتوى محمي — التصوير والنسخ غير مسموح به. يمكنك تصدير البيانات أو حفظها في حسابك.
        </span>
      </div>

      {/* Right-click blocked toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "52px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 51,
            background: "rgba(15,36,68,0.95)",
            color: "#fff",
            fontSize: "11px",
            fontFamily: AR,
            padding: "10px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            maxWidth: "360px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {PROTECTION_MSG}
        </div>
      )}
    </div>
  );
}

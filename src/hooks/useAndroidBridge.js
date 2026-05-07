import { useCallback, useEffect, useMemo, useState } from "react";

const defaultPermissions = {
  notifications: {
    key: "notifications",
    label: "الإشعارات",
    description: "لاستقبال تنبيهات حالة طلبات عروض الأسعار والمتابعة داخل التطبيق.",
    required: false,
    available: false,
    granted: false,
    status: "unavailable",
  },
};

const defaultCapabilities = {
  platform: "web",
  canShare: typeof navigator !== "undefined" && typeof navigator.share === "function",
  canDial: true,
  canEmail: true,
  canOpenExternal: true,
  canOpenSettings: false,
  canRateApp: false,
};

function parseBridgePayload(rawValue, fallbackValue) {
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return fallbackValue;
  }
}

function getBridge() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.TaseeraAndroid || null;
}

export default function useAndroidBridge() {
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [capabilities, setCapabilities] = useState(defaultCapabilities);
  const [platformInfo, setPlatformInfo] = useState({
    platform: "web",
    appVersion: "web",
    packageName: "web",
  });

  const refresh = useCallback(() => {
    const bridge = getBridge();

    if (!bridge) {
      setPermissions(defaultPermissions);
      setCapabilities(defaultCapabilities);
      setPlatformInfo({
        platform: "web",
        appVersion: "web",
        packageName: "web",
      });
      return;
    }

    setPermissions(
      parseBridgePayload(bridge.getPermissionsStatus?.(), defaultPermissions)
    );
    setCapabilities(
      parseBridgePayload(bridge.getCapabilities?.(), {
        ...defaultCapabilities,
        platform: "android",
      })
    );
    setPlatformInfo(
      parseBridgePayload(bridge.getPlatformInfo?.(), {
        platform: "android",
        appVersion: "android",
        packageName: "android",
      })
    );
  }, []);

  useEffect(() => {
    refresh();

    const handlePermissionChange = (event) => {
      if (event?.detail) {
        setPermissions(event.detail);
        return;
      }

      refresh();
    };

    window.addEventListener("taseera:permissions-changed", handlePermissionChange);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("taseera:permissions-changed", handlePermissionChange);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refresh]);

  const openExternalUrl = useCallback((url) => {
    const bridge = getBridge();
    if (bridge?.openExternalUrl) {
      bridge.openExternalUrl(url);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const openDialer = useCallback((phoneNumber) => {
    const bridge = getBridge();
    if (bridge?.openDialer) {
      bridge.openDialer(phoneNumber);
      return;
    }

    window.location.href = `tel:${phoneNumber}`;
  }, []);

  const openEmail = useCallback((email, subject = "", body = "") => {
    const bridge = getBridge();
    if (bridge?.openEmail) {
      bridge.openEmail(email, subject, body);
      return;
    }

    // URLSearchParams encodes spaces as "+" which mailto: clients show literally.
    // Use encodeURIComponent instead — it encodes spaces as "%20" (RFC 6068 compliant).
    const parts = [];
    if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
    if (body)    parts.push(`body=${encodeURIComponent(body)}`);

    window.location.href = `mailto:${email}${parts.length ? `?${parts.join("&")}` : ""}`;
  }, []);

  const shareText = useCallback(async (title, text) => {
    const bridge = getBridge();
    if (bridge?.shareText) {
      bridge.shareText(title, text);
      return true;
    }

    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    return false;
  }, []);

  const requestNotificationsPermission = useCallback(() => {
    const bridge = getBridge();
    bridge?.requestNotificationsPermission?.();
  }, []);

  const openAppSettings = useCallback(() => {
    const bridge = getBridge();
    bridge?.openAppSettings?.();
  }, []);

  const rateApp = useCallback(() => {
    const bridge = getBridge();
    if (bridge?.rateApp) {
      bridge.rateApp();
      return;
    }

    window.open("https://play.google.com/store", "_blank", "noopener,noreferrer");
  }, []);

  const exitApp = useCallback(() => {
    const bridge = getBridge();
    bridge?.exitApp?.();
  }, []);

  const showToast = useCallback((message) => {
    const bridge = getBridge();
    bridge?.showToast?.(message);
  }, []);

  return useMemo(
    () => ({
      permissions,
      capabilities,
      platformInfo,
      isAndroid: capabilities.platform === "android",
      refresh,
      openExternalUrl,
      openDialer,
      openEmail,
      shareText,
      requestNotificationsPermission,
      openAppSettings,
      rateApp,
      exitApp,
      showToast,
    }),
    [
      permissions,
      capabilities,
      platformInfo,
      refresh,
      openExternalUrl,
      openDialer,
      openEmail,
      shareText,
      requestNotificationsPermission,
      openAppSettings,
      rateApp,
      exitApp,
      showToast,
    ]
  );
}

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-6810176545596111";
// ← ضع هنا slot ID من حسابك في AdSense بعد إنشاء وحدة إعلانية
const AD_SLOT = "XXXXXXXXXX";

export default function AdSenseUnit({ className = "" }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (ref.current && ref.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={ref}
      />
    </div>
  );
}

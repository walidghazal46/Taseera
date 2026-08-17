const AR = "'IBM Plex Sans Arabic','Cairo','Tajawal',sans-serif";

export default function ManagedAdBanner({
  adBanner,
  slotId,
  className = "",
  canManageAds = false,
  onManageAds,
  onToggleVisibility,
  onRemove,
  fallback = null,
  placeholderTitle = "مساحة إعلانية",
  contactPhone = "00201064463650",
}) {
  const hasContent = Boolean(adBanner?.enabled && adBanner?.imageUrl);
  const isEnabled = adBanner?.enabled !== false;
  const resolvedSlotId = adBanner?.slotId || slotId;

  if (!canManageAds && adBanner?.enabled === false) return null;

  const handleClick = () => {
    if (!hasContent || !adBanner?.targetUrl) return;
    window.open(adBanner.targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      data-managed-ad-slot={resolvedSlotId}
      className={`relative mx-auto w-full max-w-[608px] overflow-hidden rounded-[22px] border border-sky-100 bg-white/72 shadow-[0_10px_30px_rgba(8,37,85,0.08)] ${className}`}
      style={{ minHeight: 96, fontFamily: AR }}
      aria-label={placeholderTitle}
    >
      {canManageAds && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onManageAds?.(resolvedSlotId, adBanner)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#082555] shadow-sm"
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility?.(resolvedSlotId, adBanner, !isEnabled)}
            className="rounded-xl border border-[#082555]/15 bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#082555] shadow-sm"
          >
            {isEnabled ? "إخفاء" : "إظهار"}
          </button>
          <button
            type="button"
            onClick={() => onRemove?.(resolvedSlotId, adBanner)}
            className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 shadow-sm"
          >
            حذف
          </button>
        </div>
      )}

      {hasContent ? (
        <div
          role={adBanner.targetUrl ? "button" : undefined}
          tabIndex={adBanner.targetUrl ? 0 : undefined}
          onClick={handleClick}
          onKeyDown={(event) => {
            if (!adBanner.targetUrl) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick();
            }
          }}
          className={adBanner.targetUrl ? "cursor-pointer" : undefined}
        >
          <img
            src={adBanner.imageUrl}
            alt={adBanner.alt || adBanner.title || "ad-banner"}
            loading="lazy"
            className="h-[120px] w-full object-cover sm:h-[180px]"
          />
          {adBanner.title && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#082555]/82 to-transparent px-4 pb-3 pt-10">
              <p className="truncate text-[13px] font-black text-white">{adBanner.title}</p>
            </div>
          )}
        </div>
      ) : canManageAds || !fallback ? (
        <div className="flex min-h-[110px] flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#38bdf8]/35 bg-[#f5fbff] px-4 py-5 text-center text-[#8b98bd]">
          <span className="text-[11px] font-black tracking-[0.18em]">مساحة إعلانية</span>
          <span className="mt-1 text-[12px] font-bold text-[#5A4E38]">
            {isEnabled ? "أضف صورة وعنوان لهذا المكان" : "الإعلان مخفي حالياً"}
          </span>
          {isEnabled && (
            <span className="mt-1 text-[11px] font-bold text-[#9a8455]">
              لإضافة إعلان هنا تواصل معنا {contactPhone}
            </span>
          )}
        </div>
      ) : (
        fallback
      )}
    </section>
  );
}

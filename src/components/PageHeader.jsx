export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  density = "normal",
  hideEyebrow = false,
  badge,
}) {
  const isCompact = compact || density !== "normal";
  const isTight = density === "tight";
  const isUltraTight = density === "ultra-tight";

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] bg-[#082555] shadow-[0_8px_32px_rgba(8,37,85,0.28)] ${
        isUltraTight ? "px-5 py-3" : isTight ? "px-5 py-3.5" : isCompact ? "px-5 py-4" : "px-6 py-5"
      }`}
    >
      {/* Layered background gradients for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/18 via-transparent to-[#0d3070]/60" />
        <div className="absolute bottom-0 right-0 h-24 w-40 rounded-full bg-[#C9A84C]/6 blur-2xl" />
        <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-[#1a5a9a]/20 blur-2xl" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Eyebrow + optional badge */}
          {!hideEyebrow && eyebrow ? (
            <div className="mb-2 flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="h-[3px] w-5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A]" />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C9A84C]"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
                >
                  {eyebrow}
                </p>
              </div>
              {badge && (
                <span
                  className="rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/35 px-2.5 py-0.5 text-[9px] font-bold text-[#E8C97A]"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
                >
                  {badge}
                </span>
              )}
            </div>
          ) : null}

          {/* Title */}
          {title ? (
            <h2
              className={`${hideEyebrow ? "" : "mt-0.5"} text-[18px] font-bold leading-snug text-white`}
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
            >
              {title}
            </h2>
          ) : null}

          {/* Description */}
          {description ? (
            <p
              className={`${title ? "mt-1.5" : hideEyebrow ? "mt-0" : "mt-1"} text-[11px] font-medium leading-relaxed text-[#8BA4C8]`}
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

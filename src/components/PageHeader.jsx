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
      className={`relative overflow-hidden rounded-[26px] border border-white/80 bg-white/76 shadow-[0_20px_60px_rgba(119,138,224,0.16)] backdrop-blur-xl ${
        isUltraTight ? "px-5 py-3" : isTight ? "px-5 py-3.5" : isCompact ? "px-5 py-4" : "px-6 py-5"
      }`}
    >
      {/* Layered background gradients for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(102,95,255,0.09)_0%,rgba(48,145,255,0.04)_45%,rgba(77,226,229,0.08)_100%)]" />
        <div className="absolute bottom-0 right-0 h-24 w-40 rounded-full bg-[#78ddf0]/12 blur-2xl" />
        <div className="absolute -top-4 -left-4 h-24 w-36 rounded-full bg-[#c0acff]/12 blur-2xl" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Eyebrow + optional badge */}
          {!hideEyebrow && eyebrow ? (
            <div className="mb-2 flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="h-[3px] w-5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A]" />
                <p
                  className="bg-[linear-gradient(90deg,#7562ff_0%,#2b94ff_55%,#41dddf_100%)] bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent"
                  style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
                >
                  {eyebrow}
                </p>
              </div>
              {badge && (
                <span
                  className="rounded-full border border-[#dfe7ff] bg-white/82 px-2.5 py-0.5 text-[9px] font-bold text-[#6a75b0]"
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
              className={`${hideEyebrow ? "" : "mt-0.5"} text-[18px] font-bold leading-snug text-[#20376e]`}
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
            >
              {title}
            </h2>
          ) : null}

          {/* Description */}
          {description ? (
            <p
              className={`${title ? "mt-1.5" : hideEyebrow ? "mt-0" : "mt-1"} text-[11px] font-medium leading-relaxed text-[#8e98c2]`}
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

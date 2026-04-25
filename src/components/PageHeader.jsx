export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  density = "normal",
  hideEyebrow = false,
}) {
  const isCompact = compact || density !== "normal";
  const isTight = density === "tight";
  const isUltraTight = density === "ultra-tight";

  return (
    <div className={`mb-4 overflow-hidden rounded-[24px] bg-[#082555] px-5 shadow-xl relative ${
      isUltraTight ? "py-2" : isTight ? "py-2.5" : isCompact ? "py-3" : "py-4"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/15 to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Eyebrow */}
          {!hideEyebrow ? (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-[#C9A84C]" />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]"
                style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
              >
                {eyebrow}
              </p>
            </div>
          ) : null}

          {/* Title */}
          {title ? (
            <h2
              className={`${hideEyebrow ? "mt-0" : "mt-3"} text-[18px] font-bold leading-tight text-white`}
              style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
            >
              {title}
            </h2>
          ) : null}

          {/* Description */}
          <p
            className={`${
              title ? "mt-1.5" : isCompact ? "mt-1" : "mt-2"
            } text-[11px] font-medium ${
              isUltraTight ? "leading-[1.35]" : isTight ? "leading-[1.45]" : isCompact ? "leading-[1.55]" : "leading-relaxed"
            } text-[#9A8A6A]`}
            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
          >
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

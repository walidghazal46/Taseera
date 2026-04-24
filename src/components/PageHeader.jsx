export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  density = "normal",
}) {
  const isCompact = compact || density !== "normal";
  const isTight = density === "tight";

  return (
    <div className={`mb-4 overflow-hidden rounded-[24px] bg-[#082555] px-5 shadow-xl relative ${
      isTight ? "py-3" : isCompact ? "py-4" : "py-5"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/15 to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[#C9A84C]" />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]"
              style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
            >
              {eyebrow}
            </p>
          </div>

          {/* Title */}
          {title ? (
            <h2
              className="mt-3 text-[18px] font-bold leading-tight text-white"
              style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
            >
              {title}
            </h2>
          ) : null}

          {/* Description */}
          <p
            className={`${
              title ? "mt-2" : isCompact ? "mt-1.5" : "mt-3"
            } text-[11px] font-medium ${
              isTight ? "leading-[1.45]" : isCompact ? "leading-[1.55]" : "leading-relaxed"
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

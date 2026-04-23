export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2545] to-[#162e52] px-4 py-3.5 shadow-[0_8px_32px_rgba(13,37,69,0.2)]">
      {/* Decorative corner accent */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-24 w-24 opacity-10"
        style={{
          background: "radial-gradient(circle at 0 0, #d4a843, transparent 70%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Eyebrow */}
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full bg-[#d4a843]" />
            <p
              className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#d4a843]"
              style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
            >
              {eyebrow}
            </p>
          </div>

          {/* Title */}
          {title ? (
            <h2
              className="mt-1.5 text-[15px] font-bold leading-snug text-white"
              style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
            >
              {title}
            </h2>
          ) : null}

          {/* Description */}
          <p
            className={`${title ? "mt-1" : "mt-1.5"} max-w-[28rem] text-[10px] leading-[1.6] text-white/60`}
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

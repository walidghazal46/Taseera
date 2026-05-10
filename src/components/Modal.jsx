import { XIcon } from "./icons";

export default function Modal({ title, children, onClose, closeLabel = "إغلاق", hideCloseButton = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md overflow-hidden rounded-t-[24px] sm:rounded-[20px] bg-white shadow-[0_-8px_60px_rgba(0,0,0,0.25)]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#0d2545] to-[#162e52] px-4 py-3">
          <h3
            className="text-[13px] font-bold text-white"
            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
          >
            {title}
          </h3>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="max-h-[70vh] overflow-y-auto bg-[#faf6ef] px-4 py-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

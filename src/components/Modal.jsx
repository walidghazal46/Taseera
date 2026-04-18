export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[20px] border border-[#eadfca] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between bg-[linear-gradient(135deg,#173460_0%,#10213e_100%)] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] text-white transition hover:bg-white/15"
          >
            إغلاق
          </button>
        </div>
        <div className="bg-[#fbf7ef] px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

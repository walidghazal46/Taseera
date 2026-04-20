export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-[1cm] rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,#182e56_0%,#10213e_100%)] px-3 py-3 text-white shadow-[0_18px_36px_rgba(15,23,42,0.2)] sm:rounded-[24px] sm:px-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="max-w-3xl">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d9b36a]" />
            <p className="text-[22px] font-medium tracking-[0.22em] text-[#d9b36a]">{eyebrow}</p>
          </div>
          {title ? (
            <h2 className="mt-1 text-[35px] font-semibold leading-5 text-white sm:text-[39px] sm:leading-6">
              {title}
            </h2>
          ) : null}
          <p className={`${title ? "mt-1" : "mt-0.5"} max-w-[30rem] text-[22px] leading-4 text-slate-200 sm:text-[23px] sm:leading-5`}>
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

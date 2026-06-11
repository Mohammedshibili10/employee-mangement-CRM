function Logo({ subtitle = "CRM" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-10 w-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-lg shadow-glow-sm">
        R
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
      </div>
      <div className="leading-tight">
        <p className="font-extrabold tracking-tight text-slate-800 text-[15px]">RAC</p>
        <p className="text-[11px] font-medium text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export default Logo;

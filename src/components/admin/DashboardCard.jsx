// Stat card for the admin dashboard. Each color comes with its own
// gradient icon chip so the summary row feels rich and premium.

const ICONS = {
  blue: (
    <path d="M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20a5.5 5.5 0 0 1 11 0M16 7.5a3 3 0 0 1 0 5.8M17 14.2a5.2 5.2 0 0 1 3.5 5" />
  ),
  green: <path d="m9 14.5 1.8 1.8L14.5 12M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />,
  purple: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5" />,
  orange: (
    <path d="M6.5 3.5h11A1.5 1.5 0 0 1 19 5v15l-7-3.2L5 20V5a1.5 1.5 0 0 1 1.5-1.5Z" />
  ),
};

function DashboardCard({ title, value, color = "blue" }) {
  const accents = {
    blue: { ring: "from-sky-400 to-sky-600", text: "text-sky-600" },
    green: { ring: "from-brand-400 to-brand-600", text: "text-brand-600" },
    purple: { ring: "from-teal-400 to-teal-600", text: "text-teal-600" },
    orange: { ring: "from-amber-400 to-amber-500", text: "text-amber-600" },
  };
  const accent = accents[color] || accents.blue;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      {/* faint corner glow on hover */}
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent.ring} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${accent.ring} text-white flex items-center justify-center shadow-soft`}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[color] || ICONS.blue}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;

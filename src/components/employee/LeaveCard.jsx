function LeaveCard({ title, value, color = "blue" }) {
  const colors = {
    blue: "text-brand-600",
    green: "text-emerald-600",
    orange: "text-amber-600",
    red: "text-rose-600",
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`text-2xl font-extrabold mt-1.5 tracking-tight ${colors[color]}`}>{value}</p>
    </div>
  );
}

export default LeaveCard;

// A small statistic card for the dashboard.
// "color" sets the left border / icon color.
function DashboardCard({ title, value, color = "blue" }) {
  // Left-edge accent only (per-side color), so the other borders stay slate.
  const colors = {
    blue: "border-l-green-500",
    green: "border-l-emerald-500",
    purple: "border-l-teal-500",
    orange: "border-l-amber-500",
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 border-l-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

export default DashboardCard;

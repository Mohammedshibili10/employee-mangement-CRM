
function LeaveCard({ title, value, color = "blue" }) {
  const colors = {
    blue: "text-green-600",
    green: "text-emerald-600",
    orange: "text-amber-600",
    red: "text-rose-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

export default LeaveCard;

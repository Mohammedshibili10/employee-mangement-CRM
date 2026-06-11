function AttendanceCard({ title, value, note }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-extrabold text-slate-800 mt-1.5 tracking-tight">{value}</p>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  );
}

export default AttendanceCard;

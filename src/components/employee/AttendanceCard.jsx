function AttendanceCard({ title, value, note }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  );
}

export default AttendanceCard;

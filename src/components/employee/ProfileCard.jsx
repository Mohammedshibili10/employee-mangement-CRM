function ProfileCard({ employee, onPhotoClick, busy }) {
  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );

  const initial = (employee.name || "?").charAt(0).toUpperCase();

  const inner = employee.photo ? (
    <img src={employee.photo} alt={employee.name} className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
      {initial}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4 mb-5">
        {onPhotoClick ? (
          <button
            type="button"
            onClick={onPhotoClick}
            disabled={busy}
            title="Click to change your photo"
            className="relative h-16 w-16 rounded-full overflow-hidden border border-slate-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {inner}
            <span
              className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-medium transition-opacity ${
                busy ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {busy ? "Saving..." : "Change"}
            </span>
          </button>
        ) : (
          <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200">
            {inner}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{employee.name}</h2>
          <p className="text-sm text-slate-500">{employee.designation}</p>
        </div>
      </div>

      <Row label="Email" value={employee.email} />
      <Row label="Phone" value={employee.phone} />
      <Row label="Department" value={employee.department} />
      <Row label="Joining Date" value={employee.joiningDate} />
    </div>
  );
}

export default ProfileCard;

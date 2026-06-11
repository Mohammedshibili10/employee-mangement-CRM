// Premium profile card: gradient cover banner, overlapping avatar with
// an editable photo button, identity badges, and detail rows with icons.

const DETAIL_ICONS = {
  email: <path d="M3.5 6.5h17v11h-17z M4 7l8 6 8-6" />,
  phone: <path d="M6 3h3l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />,
  department: <path d="M3 21V8l6-3 6 3v13M9 21v-4h2v4M15 11h3v10M18 15h3v6" />,
  joiningDate: <path d="M4.5 5.5h15v14h-15zM8 3v4M16 3v4M4.5 10h15" />,
};

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="flex items-center gap-2.5 text-slate-500">
        <span className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {DETAIL_ICONS[icon]}
          </svg>
        </span>
        <span className="text-sm">{label}</span>
      </span>
      <span className="text-slate-800 font-semibold text-sm text-right max-w-[55%] truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function ProfileCard({ employee, onPhotoClick, busy }) {
  const initial = (employee.name || "?").charAt(0).toUpperCase();

  const inner = employee.photo ? (
    <img src={employee.photo} alt={employee.name} className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full bg-brand-gradient text-white flex items-center justify-center text-3xl font-extrabold">
      {initial}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
      {/* Gradient cover banner */}
      <div className="h-24 bg-brand-gradient relative">
        <div className="absolute inset-0 bg-[radial-gradient(120px_60px_at_80%_0%,rgba(255,255,255,0.35),transparent)]" />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar overlapping the banner */}
        <div className="-mt-12 mb-3 flex items-end justify-between">
          {onPhotoClick ? (
            <button
              type="button"
              onClick={onPhotoClick}
              disabled={busy}
              title="Click to change your photo"
              className="relative h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-card group cursor-pointer focus:outline-none focus:ring-brand-300"
            >
              {inner}
              <span
                className={`absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity ${
                  busy ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {busy ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "Change"
                )}
              </span>
            </button>
          ) : (
            <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-card">
              {inner}
            </div>
          )}

          {employee.status && (
            <span
              className={`mb-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                employee.status === "active"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {employee.status}
            </span>
          )}
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{employee.name}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-sm text-slate-500">{employee.designation}</p>
          {employee.empId && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {employee.empId}
            </span>
          )}
        </div>

        <div className="mt-5">
          <DetailRow icon="email" label="Email" value={employee.email} />
          <DetailRow icon="phone" label="Phone" value={employee.phone} />
          <DetailRow icon="department" label="Department" value={employee.department} />
          <DetailRow icon="joiningDate" label="Joining Date" value={employee.joiningDate} />
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;

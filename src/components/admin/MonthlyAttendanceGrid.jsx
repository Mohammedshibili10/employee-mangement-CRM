// Monthly Attendance Grid — one row per employee, one cell per day of the month.
// Reads the same attendance records the rest of the page uses; nothing is
// derived or assumed, so a day with no record simply shows as unmarked.

// Sunday is the weekly off (matches the payroll rule in salaryController).
const WEEKLY_OFF_WEEKDAYS = [0];
const isWeeklyOff = (y, m, d) => WEEKLY_OFF_WEEKDAYS.includes(new Date(y, m - 1, d).getDay());

// One place for every cell's letter and colours.
const CELL = {
  present: { code: "P", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  late: { code: "L", cls: "bg-amber-50 border-amber-200 text-amber-700" },
  absent: { code: "A", cls: "bg-rose-50 border-rose-200 text-rose-600" },
  leave: { code: "LV", cls: "bg-sky-50 border-sky-200 text-sky-700" },
  "half-day": { code: "HD", cls: "bg-violet-50 border-violet-200 text-violet-700" },
  wfh: { code: "W", cls: "bg-purple-50 border-purple-200 text-purple-700" },
  off: { code: "WO", cls: "bg-slate-100 border-slate-200 text-slate-400" },
  none: { code: "–", cls: "bg-white border-slate-200 text-slate-300" },
};

const LEGEND = [
  ["Present", "border-emerald-300 bg-emerald-50"],
  ["Absent", "border-rose-300 bg-rose-50"],
  ["Late", "border-amber-300 bg-amber-50"],
  ["Leave", "border-sky-300 bg-sky-50"],
  ["Half day", "border-violet-300 bg-violet-50"],
  ["WFH", "border-purple-300 bg-purple-50"],
  ["Weekly off", "border-slate-300 bg-slate-100"],
];

const AVATAR_COLOURS = [
  "bg-sky-500", "bg-violet-500", "bg-rose-500", "bg-emerald-500",
  "bg-amber-500", "bg-indigo-500", "bg-teal-500", "bg-fuchsia-500",
];

function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function avatarColour(name) {
  let sum = 0;
  for (const ch of String(name || "")) sum += ch.charCodeAt(0);
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function MonthlyAttendanceGrid({ employees, records, month }) {
  const [yStr, mStr] = String(month || "").split("-");
  const year = Number(yStr);
  const monthNo = Number(mStr);
  if (!year || !monthNo) return null;

  const totalDays = new Date(year, monthNo, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const workingDays = days.filter((d) => !isWeeklyOff(year, monthNo, d)).length;

  // Index the month's records: employee id -> day-of-month -> record.
  const byEmployee = new Map();
  for (const r of records || []) {
    const id = r.employee?._id || r.employee;
    if (!id) continue;
    if (!byEmployee.has(String(id))) byEmployee.set(String(id), new Map());
    byEmployee.get(String(id)).set(new Date(r.date).getDate(), r);
  }

  const rows = (employees || []).map((emp) => {
    const own = byEmployee.get(String(emp._id)) || new Map();
    let attended = 0;
    const cells = days.map((d) => {
      const rec = own.get(d);
      if (rec) {
        if (rec.status === "present" || rec.status === "late" || rec.status === "wfh") attended += 1;
        else if (rec.status === "half-day") attended += 0.5;
        return { day: d, ...(CELL[rec.status] || CELL.none), title: `${d} ${MONTH_NAMES[monthNo - 1]} — ${rec.status}` };
      }
      if (isWeeklyOff(year, monthNo, d)) return { day: d, ...CELL.off, title: `${d} ${MONTH_NAMES[monthNo - 1]} — weekly off` };
      return { day: d, ...CELL.none, title: `${d} ${MONTH_NAMES[monthNo - 1]} — not marked` };
    });
    const percent = workingDays > 0 ? Math.round((attended / workingDays) * 100) : 0;
    return { emp, cells, percent };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5">
      {/* Header + legend */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-800">Monthly Attendance Grid</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {MONTH_NAMES[monthNo - 1]} {year} · {rows.length} employee{rows.length === 1 ? "" : "s"} · {workingDays} working days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGEND.map(([label, swatch]) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-3 w-3 rounded border ${swatch}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto scrollbar-slim">
        <table className="border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 pb-2 pr-4 min-w-[190px]">
                Employee
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className={`pb-2 px-0.5 text-center text-xs font-semibold ${
                    isWeeklyOff(year, monthNo, d) ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  <span className="inline-block w-9">{d}</span>
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-white pb-2 pl-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ emp, cells, percent }) => (
              <tr key={emp._id} className="group">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 pr-4 py-1 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-7 w-7 shrink-0 rounded-full ${avatarColour(emp.name)} text-white text-[10px] font-bold flex items-center justify-center`}>
                      {initialsOf(emp.name)}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[145px]" title={emp.name}>
                      {emp.name}
                    </span>
                  </div>
                </td>

                {cells.map((c) => (
                  <td key={c.day} className="px-0.5 py-1 group-hover:bg-slate-50/80 transition-colors">
                    <div
                      title={c.title}
                      className={`w-9 h-7 rounded-md border flex items-center justify-center text-[11px] font-semibold ${c.cls}`}
                    >
                      {c.code}
                    </div>
                  </td>
                ))}

                <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 pl-3 py-1 text-right transition-colors">
                  <span className="text-sm font-bold text-slate-700">{percent}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-center text-slate-500 py-8">No employees to show.</p>
      )}
    </div>
  );
}

export default MonthlyAttendanceGrid;

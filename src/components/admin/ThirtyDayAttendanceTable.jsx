import React from "react";

const WEEKLY_OFF_WEEKDAYS = [0]; // Sunday
const isWeeklyOff = (y, m, d) => WEEKLY_OFF_WEEKDAYS.includes(new Date(y, m - 1, d).getDay());
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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

function formatTimeShort(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function statusPillStyle(status) {
  if (status === "present") return "bg-emerald-50 text-emerald-700";
  if (status === "late") return "bg-amber-50 text-amber-700";
  if (status === "absent") return "bg-rose-50 text-rose-700";
  if (status === "half-day") return "bg-violet-50 text-violet-700";
  if (status === "leave") return "bg-sky-50 text-sky-700";
  if (status === "wfh") return "bg-purple-50 text-purple-700";
  if (status === "holiday") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function statusText(row) {
  if (!row) return "-";
  if (row.status === "leave" && row.leaveType) return `${row.leaveType} leave`;
  if (row.status === "wfh") return "WFH";
  if (row.status === "holiday") return "Holiday";
  if (row.status === "none") return "None";
  return row.status;
}

function ThirtyDayAttendanceTable({ employees, records, month, searchQuery = "", statusFilter = "All" }) {
  const [yStr, mStr] = String(month || "").split("-");
  const year = Number(yStr);
  const monthNo = Number(mStr);
  if (!year || !monthNo) return null;

  const totalDays = new Date(year, monthNo, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Map records by employee id -> day of month -> record
  const byEmployee = new Map();
  for (const r of records || []) {
    const id = r.employee?._id || r.employee;
    if (!id) continue;
    if (!byEmployee.has(String(id))) byEmployee.set(String(id), new Map());
    const d = new Date(r.date).getDate();
    byEmployee.get(String(id)).set(d, r);
  }

  // Filter employees by search query if provided
  let filteredEmployees = employees || [];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredEmployees = filteredEmployees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(q) ||
        emp.department?.name?.toLowerCase().includes(q)
    );
  }

  // Filter by status if selected
  if (statusFilter !== "All") {
    filteredEmployees = filteredEmployees.filter((emp) => {
      const own = byEmployee.get(String(emp._id));
      if (!own) return false;
      for (const rec of own.values()) {
        if (rec.status === statusFilter) return true;
      }
      return false;
    });
  }

  const monthLabel = `${MONTH_SHORT[monthNo - 1]}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-5">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
            {MONTH_NAMES[monthNo - 1]} {year} — 30-Day Attendance Table
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Check-in, Check-out & Status columns per day for {filteredEmployees.length} employee{filteredEmployees.length === 1 ? "" : "s"} across {totalDays} days.
          </p>
        </div>
      </div>

      {/* Table with separate Check-in, Check-out, Status columns per day */}
      <div className="overflow-x-auto scrollbar-slim border border-slate-200 rounded-xl">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            {/* Day Row Header */}
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th
                rowSpan={2}
                className="sticky left-0 z-30 bg-slate-100 px-4 py-3 font-bold uppercase tracking-wider text-slate-700 min-w-[200px] border-r-2 border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-middle"
              >
                Employee Name
              </th>
              {days.map((d) => {
                const dateObj = new Date(year, monthNo - 1, d);
                const dayName = WEEKDAY_NAMES[dateObj.getDay()];
                const off = isWeeklyOff(year, monthNo, d);

                return (
                  <th
                    key={d}
                    colSpan={3}
                    className={`px-2 py-2 text-center border-r-2 border-slate-200 ${
                      off ? "bg-slate-200/60 text-slate-500" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <span className="font-extrabold text-[12px]">{d} {monthLabel}</span>{" "}
                    <span className="text-[10px] uppercase font-semibold text-slate-500">({dayName})</span>
                  </th>
                );
              })}
            </tr>

            {/* Sub-header: Check-in | Check-out | Status */}
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              {days.map((d) => (
                <React.Fragment key={d}>
                  <th className="px-2 py-1.5 text-center min-w-[80px] border-r border-slate-100">Check-in</th>
                  <th className="px-2 py-1.5 text-center min-w-[80px] border-r border-slate-100">Check-out</th>
                  <th className="px-2 py-1.5 text-center min-w-[85px] border-r-2 border-slate-200">Status</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs">
            {filteredEmployees.map((emp) => {
              const own = byEmployee.get(String(emp._id)) || new Map();
              return (
                <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Sticky Employee Name */}
                  <td className="sticky left-0 z-10 bg-white hover:bg-slate-50/90 px-4 py-2.5 font-semibold text-slate-800 border-r-2 border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-7 w-7 shrink-0 rounded-full ${avatarColour(emp.name)} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {initialsOf(emp.name)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[145px]" title={emp.name}>
                        {emp.name}
                      </span>
                    </div>
                  </td>

                  {/* Day Columns */}
                  {days.map((d) => {
                    const rec = own.get(d);
                    const off = isWeeklyOff(year, monthNo, d);
                    const inTime = rec ? formatTimeShort(rec.checkIn) : "-";
                    const outTime = rec ? formatTimeShort(rec.checkOut) : "-";

                    return (
                      <React.Fragment key={d}>
                        {/* Check-in */}
                        <td className={`px-2 py-2 text-center font-mono text-[11px] border-r border-slate-100 ${off ? "bg-slate-50/40" : ""}`}>
                          <span className={inTime !== "-" ? "font-semibold text-emerald-700" : "text-slate-300"}>
                            {inTime}
                          </span>
                        </td>

                        {/* Check-out */}
                        <td className={`px-2 py-2 text-center font-mono text-[11px] border-r border-slate-100 ${off ? "bg-slate-50/40" : ""}`}>
                          <span className={outTime !== "-" ? "font-semibold text-slate-700" : "text-slate-300"}>
                            {outTime}
                          </span>
                        </td>

                        {/* Status */}
                        <td className={`px-1.5 py-2 text-center border-r-2 border-slate-200 ${off ? "bg-slate-50/40" : ""}`}>
                          {rec ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize truncate max-w-[80px] ${statusPillStyle(rec.status)}`}>
                              {statusText(rec)}
                            </span>
                          ) : off ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-400">
                              Off
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && (
        <p className="text-center text-slate-400 py-8 text-sm">No employees found.</p>
      )}
    </div>
  );
}

export default ThirtyDayAttendanceTable;

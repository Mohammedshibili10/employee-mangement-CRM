import { useState, useEffect } from "react";
import AttendanceTable from "../../components/admin/AttendanceTable.jsx";
import MonthlyAttendanceGrid from "../../components/admin/MonthlyAttendanceGrid.jsx";
import AttendanceFormModal from "../../components/admin/AttendanceFormModal.jsx";
import Button from "../../components/common/Button.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getAttendanceApi } from "../../api/attendanceApi.js";
import { getEmployeesApi } from "../../api/employeeApi.js";
import { exportAttendanceExcel, exportAttendancePDF } from "../../utils/exportAttendance.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Local date helpers (avoid UTC shifting the calendar day).
function toDayStr(d) {
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
}
function toMonthStr(d) {
  return toDayStr(d).slice(0, 7); // YYYY-MM
}

function Attendance() {
  const now = new Date();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Report controls: daily (default) or monthly.
  const [mode, setMode] = useState("daily");
  const [month, setMonth] = useState(toMonthStr(now)); // "YYYY-MM"
  const [day, setDay] = useState(toDayStr(now)); // "YYYY-MM-DD"
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Refetch whenever the report mode or the selected month/day changes.
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, month, day]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      let params;
      if (mode === "daily") {
        params = { date: day };
      } else {
        const [y, m] = month.split("-");
        params = { month: Number(m), year: Number(y) };
      }
      const res = await getAttendanceApi(params);
      setRecords(res.attendance || []);
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setError(err.response?.data?.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const data = await getEmployeesApi();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  }

  function openAdd() {
    setEditRecord(null);
    setFormOpen(true);
  }

  function openEdit(record) {
    setEditRecord(record);
    setFormOpen(true);
  }

  // Summary reflects exactly what's in the selected report period.
  const summary = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { present: 0, late: 0, absent: 0, "half-day": 0, leave: 0, wfh: 0 }
  );

  const filtered =
    statusFilter === "All" ? records : records.filter((row) => row.status === statusFilter);

  // Heading label for the current report period.
  const [ly, lm] = month.split("-");
  const reportLabel =
    mode === "daily"
      ? new Date(day).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : `${MONTHS[Number(lm) - 1]} ${ly}`;

  // Export the currently-shown daily report (respects the status filter).
  function handleExport(type) {
    if (filtered.length === 0) {
      alert("No attendance records to export for the selected date.");
      return;
    }
    if (type === "excel") exportAttendanceExcel(filtered, reportLabel);
    else exportAttendancePDF(filtered, reportLabel);
  }

  const cards = [
    { label: "Present", value: summary.present, color: "text-brand-600" },
    { label: "Late", value: summary.late, color: "text-amber-600" },
    { label: "Absent", value: summary.absent, color: "text-rose-600" },
    { label: "Leave", value: summary.leave, color: "text-sky-600" },
    { label: "WFH", value: summary.wfh, color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Attendance</h2>
        <Button color="green" onClick={openAdd}>+ Add Attendance</Button>
      </div>

      {/* Report type + period selector */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {[
              { key: "monthly", label: "Monthly Report" },
              { key: "daily", label: "Daily Report" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === t.key ? "bg-white text-brand-700 shadow-soft" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "monthly" ? (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
              />
            </div>
          )}

          <span className="sm:ml-auto text-sm font-semibold text-slate-700">{reportLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 text-center transition-all duration-300 hover:shadow-card hover:-translate-y-0.5"
          >
            <p className="text-sm font-medium text-slate-500">{c.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* The status filter and export apply to the Daily report's record list;
          the Monthly report is a grid of the whole month instead. */}
      {mode === "daily" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
          >
            <option value="All">All Records</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="half-day">Half-day</option>
            <option value="leave">Leave</option>
            <option value="wfh">WFH</option>
          </select>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm font-medium text-slate-500">Export:</span>
            <Button color="green" onClick={() => handleExport("excel")}>Excel</Button>
            <Button color="gray" onClick={() => handleExport("pdf")}>PDF</Button>
          </div>
        </div>
      )}

      {loading && <SkeletonTable rows={6} cols={8} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && mode === "monthly" && (
        <MonthlyAttendanceGrid employees={employees} records={records} month={month} />
      )}

      {!loading && !error && mode === "daily" && (
        <>
          <AttendanceTable records={filtered} onEdit={openEdit} />
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No attendance records found for {reportLabel}.
            </p>
          )}
        </>
      )}

      <AttendanceFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        employees={employees}
        editRecord={editRecord}
        onSaved={fetchData}
      />
    </div>
  );
}

export default Attendance;

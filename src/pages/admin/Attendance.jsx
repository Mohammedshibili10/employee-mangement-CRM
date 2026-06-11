import { useState, useEffect } from "react";
import AttendanceTable from "../../components/admin/AttendanceTable.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getAttendanceApi, getAttendanceSummaryApi } from "../../api/attendanceApi.js";

function Attendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [listRes, summaryRes] = await Promise.all([
          getAttendanceApi(),
          getAttendanceSummaryApi(),
        ]);
        setRecords(listRes.attendance || []);
        setSummary(summaryRes.summary || { present: 0, late: 0, absent: 0 });
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setError(err.response?.data?.message || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered =
    filter === "All" ? records : records.filter((row) => row.status === filter);

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-5">Attendance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 text-center transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
          <p className="text-sm font-medium text-slate-500">Present</p>
          <p className="text-2xl font-extrabold text-brand-600 mt-1">{summary.present}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 text-center transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
          <p className="text-sm font-medium text-slate-500">Late</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{summary.late}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 text-center transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
          <p className="text-sm font-medium text-slate-500">Absent</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{summary.absent}</p>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
        >
          <option value="All">All Records</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half-day</option>
          <option value="leave">Leave</option>
        </select>
      </div>

      {loading && <SkeletonTable rows={6} cols={7} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <AttendanceTable records={filtered} />
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No attendance records found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Attendance;

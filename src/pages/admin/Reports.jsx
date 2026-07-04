import { useState } from "react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import {
  getEmployeeReportApi,
  getAttendanceReportApi,
} from "../../api/reportApi.js";

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString() : "-";
}
function formatTime(v) {
  return v ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function downloadCsv(filename, columns, rows) {
  const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => escape(c.label)).join(",")];
  for (const r of rows) {
    lines.push(columns.map((c) => escape(c.value(r))).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const REPORTS = {
  employees: {
    title: "Employee Report",
    columns: [
      { label: "Emp ID", value: (r) => r.empId },
      { label: "Name", value: (r) => r.name },
      { label: "Email", value: (r) => r.email },
      { label: "Department", value: (r) => r.department?.name || "-" },
      { label: "Designation", value: (r) => r.designation },
      { label: "Status", value: (r) => r.status },
    ],
  },
  attendance: {
    title: "Attendance Report",
    columns: [
      { label: "Employee", value: (r) => r.employee?.name || "-" },
      { label: "Department", value: (r) => r.employee?.department?.name || "-" },
      { label: "Date", value: (r) => formatDate(r.date) },
      { label: "Check In", value: (r) => formatTime(r.checkIn) },
      { label: "Check Out", value: (r) => formatTime(r.checkOut) },
      { label: "Status", value: (r) => r.status },
    ],
  },
};

function Reports() {
  const [active, setActive] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function viewReport(type) {
    try {
      setActive(type);
      setLoading(true);
      setRows([]);
      let data;
      if (type === "employees") data = (await getEmployeeReportApi()).employees;
      else data = (await getAttendanceReportApi()).attendanceRecords;
      setRows(data || []);
    } catch (err) {
      console.error("Failed to load report:", err);
      alert(err.response?.data?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  const config = active ? REPORTS[active] : null;

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-5">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReportCard
          title="Employee Report"
          desc="Full list of all employees and their details."
          active={active === "employees"}
          onView={() => viewReport("employees")}
        />
        <ReportCard
          title="Attendance Report"
          desc="All check-in / check-out records."
          active={active === "attendance"}
          onView={() => viewReport("attendance")}
        />
      </div>

      {active && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800">{config.title}</h3>
            {!loading && rows.length > 0 && (
              <Button color="green" onClick={() => downloadCsv(`${active}-report.csv`, config.columns, rows)}>
                Export CSV
              </Button>
            )}
          </div>

          {loading && <SkeletonTable rows={6} cols={config.columns.length} />}

          {!loading && (
            <>
              <Table headers={config.columns.map((c) => c.label)}>
                {rows.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-slate-50">
                    {config.columns.map((c, ci) => (
                      <td key={ci} className="px-4 py-3 text-slate-600">{c.value(r)}</td>
                    ))}
                  </tr>
                ))}
              </Table>
              {rows.length === 0 && (
                <p className="text-center text-slate-500 mt-6">No records found.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, desc, active, onView }) {
  return (
    <div
      className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 ${
        active ? "border-brand-400 ring-2 ring-brand-500/15" : "border-slate-200/70"
      }`}
    >
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button color="green" onClick={onView}>View</Button>
      </div>
    </div>
  );
}

export default Reports;

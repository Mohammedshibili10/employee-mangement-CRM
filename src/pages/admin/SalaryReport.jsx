import { useState, useEffect, useMemo } from "react";
import Button from "../../components/common/Button.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import SalaryDetailModal from "../../components/admin/SalaryDetailModal.jsx";
import { getSalaryReportsApi, generateSalaryApi } from "../../api/salaryApi.js";
import { getEmployeesApi } from "../../api/employeeApi.js";
import { getDepartmentsApi } from "../../api/departmentApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MONEY_KEYS = new Set([
  "monthlySalary", "grossSalary", "basicPay", "hra", "lta", "specialAllowance",
  "actualPay", "lopDeduction", "lateDeduction", "salaryAdvance", "wfhDeduction", "officeExpenses",
  "assetDeduction", "netPay",
]);

const COLUMNS = [
  { key: "month", label: "Month", get: (r) => `${MONTHS[r.month]} ${r.year}` },
  { key: "empId", label: "Emp ID", get: (r) => r.empId },
  { key: "employeeName", label: "Name", get: (r) => r.employeeName },
  { key: "monthlyWorkingDays", label: "Working Days", get: (r) => r.monthlyWorkingDays },
  { key: "attendanceDays", label: "Attendance", get: (r) => r.attendanceDays },
  { key: "sickLeaveDays", label: "Sick Leave", get: (r) => r.sickLeaveDays || 0 },
  { key: "casualLeaveDays", label: "Casual Leave", get: (r) => r.casualLeaveDays || 0 },
  { key: "totalPaidLeave", label: "Paid Leave", get: (r) => Math.min(r.sickLeaveDays || 0, 1) + Math.min(r.casualLeaveDays || 0, 1) },
  { key: "lop", label: "LOP", get: (r) => r.lop },
  { key: "monthlySalary", label: "Monthly Salary", get: (r) => r.monthlySalary },
  { key: "grossSalary", label: "Gross", get: (r) => r.grossSalary },
  { key: "basicPay", label: "Basic", get: (r) => r.basicPay },
  { key: "hra", label: "HRA", get: (r) => r.hra },
  { key: "lta", label: "LTA", get: (r) => r.lta },
  { key: "specialAllowance", label: "SA", get: (r) => r.specialAllowance },
  { key: "actualPay", label: "Actual Pay", get: (r) => r.actualPay },
  { key: "lopDays", label: "LOP Days", get: (r) => r.lopDays || 0 },
  { key: "lopDeduction", label: "LOP Ded.", get: (r) => r.lopDeduction || 0 },
  { key: "lateDeduction", label: "Late Ded.", get: (r) => r.lateDeduction },
  { key: "salaryAdvance", label: "Salary Adv.", get: (r) => r.salaryAdvance },
  { key: "wfhDeduction", label: "WFH Ded.", get: (r) => r.wfhDeduction },
  { key: "officeExpenses", label: "Office Exp.", get: (r) => r.officeExpenses },
  { key: "assetDeduction", label: "Asset Ded.", get: (r) => r.assetDeduction },
  { key: "netPay", label: "Net Pay", get: (r) => r.netPay },
];

const PAGE_SIZE = 10;
const now = new Date();
const YEARS = [now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

function SalaryReport() {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [warning, setWarning] = useState("");

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [search, setSearch] = useState("");

  const [sort, setSort] = useState({ key: "employeeName", dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getEmployeesApi().then((d) => setEmployees(d.employees || [])).catch(() => {});
    getDepartmentsApi().then((d) => setDepartments(d.departments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchReports();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, employeeId, departmentId]);

  async function fetchReports() {
    try {
      setLoading(true);
      const data = await getSalaryReportsApi({ month, year, employee: employeeId || undefined, department: departmentId || undefined });
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to load salary reports:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    try {
      setGenerating(true);
      setWarning("");
      const data = await generateSalaryApi({ month, year, department: departmentId || undefined });
      await fetchReports();
      if (data.skipped?.length) {
        setWarning(
          `Generated ${data.created}. ${data.skipped.length} already existed and were skipped — open a row to Recalculate/Update instead of duplicating.`
        );
      } else if (data.created === 0) {
        setWarning("No new reports generated (no matching employees, or all already generated).");
      } else {
        setWarning(`Generated ${data.created} salary report(s) for ${MONTHS[month]} ${year}.`);
      }
      setTimeout(() => setWarning(""), 7000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate salary.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = reports.filter(
      (r) => !q || (r.employeeName || "").toLowerCase().includes(q) || (r.empId || "").toLowerCase().includes(q)
    );
    const col = COLUMNS.find((c) => c.key === sort.key);
    if (col) {
      list = [...list].sort((a, b) => {
        const va = col.get(a), vb = col.get(b);
        const cmp = typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sort.dir === "desc" ? -cmp : cmp;
      });
    }
    return list;
  }, [reports, search, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageRows = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ---- exports ----
  function exportCsv() {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [COLUMNS.map((c) => esc(c.label)).join(",")];
    processed.forEach((r) => lines.push(COLUMNS.map((c) => esc(c.get(r))).join(",")));
    downloadBlob(lines.join("\n"), "text/csv;charset=utf-8", "csv");
  }
  function exportExcel() {
    const head = COLUMNS.map((c) => `<th>${c.label}</th>`).join("");
    const body = processed
      .map((r) => `<tr>${COLUMNS.map((c) => `<td>${c.get(r)}</td>`).join("")}</tr>`)
      .join("");
    const html = `<table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    downloadBlob(html, "application/vnd.ms-excel", "xls");
  }
  function downloadBlob(content, type, ext) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-${MONTHS[month]}-${year}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function printReport() {
    const head = COLUMNS.map((c) => `<th>${c.label}</th>`).join("");
    const body = processed
      .map((r) => `<tr>${COLUMNS.map((c) => `<td>${MONEY_KEYS.has(c.key) ? money(c.get(r)) : c.get(r)}</td>`).join("")}</tr>`)
      .join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Salary Report — ${MONTHS[month]} ${year}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#0f172a}
        h1{font-size:18px;margin:0 0 12px}
        table{border-collapse:collapse;width:100%;font-size:11px}
        th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;white-space:nowrap}
        th{background:#f1f5f9}
      </style></head><body>
      <h1>Salary Report — ${MONTHS[month]} ${year}</h1>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Salary Report</h2>
          <p className="text-sm text-slate-500 mt-1">Generate and review monthly payroll for all employees.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button color="green" onClick={handleGenerate} loading={generating}>Generate Salary</Button>
          <Button color="gray" onClick={exportCsv}>CSV</Button>
          <Button color="gray" onClick={exportExcel}>Excel</Button>
          <Button color="gray" onClick={printReport}>PDF</Button>
          <Button color="gray" onClick={printReport}>Print</Button>
        </div>
      </div>

      {warning && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-soft animate-fade-in-up">
          <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-medium">{warning}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          <option value="">All Employees</option>
          {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name / ID..."
          className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
      </div>

      {loading && <SkeletonTable rows={6} cols={8} />}

      {!loading && (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/70 shadow-card scrollbar-slim">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/70">
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      onClick={() => toggleSort(c.key)}
                      className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {sort.key === c.key && <span className="text-brand-600">{sort.dir === "asc" ? "▲" : "▼"}</span>}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => {
                  const missingAttendance = !r.attendanceDays;
                  return (
                    <tr
                      key={r._id}
                      onClick={() => setSelected(r)}
                      className={`cursor-pointer transition-colors ${missingAttendance ? "bg-amber-50/70 hover:bg-amber-100/60" : "hover:bg-brand-50/40"}`}
                    >
                      {COLUMNS.map((c) => {
                        const raw = c.get(r);
                        const val = MONEY_KEYS.has(c.key) ? money(raw) : raw;
                        if (c.key === "employeeName") {
                          return (
                            <td key={c.key} className="px-3 py-3 font-semibold text-slate-800">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${r.status === "paid" ? "bg-brand-500" : "bg-amber-400"}`} title={r.status} />
                                {missingAttendance && (
                                  <span className="text-amber-500" title="No attendance recorded">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                  </span>
                                )}
                                {val}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={c.key} className={`px-3 py-3 ${c.key === "netPay" ? "font-bold text-brand-700" : "text-slate-600"}`}>{val}</td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {processed.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No salary reports for {MONTHS[month]} {year}. Click <span className="font-semibold">Generate Salary</span> to create them.
            </p>
          )}

          {/* Pagination */}
          {processed.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, processed.length)} of {processed.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">Prev</button>
                <span className="text-slate-600">Page {page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <SalaryDetailModal
        report={selected}
        onClose={() => setSelected(null)}
        onSaved={(updated) => {
          setReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
          setSelected(null);
        }}
      />
    </div>
  );
}

export default SalaryReport;

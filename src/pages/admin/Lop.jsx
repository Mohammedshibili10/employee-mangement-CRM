import { useState, useEffect } from "react";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getDeductionsApi, createLopRecordApi, updateLopRecordApi, deleteLopRecordApi } from "../../api/lopApi.js";
import { getEmployeesApi } from "../../api/employeeApi.js";
import { getSalaryReportsApi } from "../../api/salaryApi.js";
import { updateAttendanceApi, pardonLateApi } from "../../api/attendanceApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const nowDate = new Date();
const YEARS = [nowDate.getFullYear() + 1, nowDate.getFullYear(), nowDate.getFullYear() - 1, nowDate.getFullYear() - 2];

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : "-";
}
// Date + time, used for the pardon audit trail ("approved by X on ...").
function formatDateTime(d) {
  return d ? new Date(d).toLocaleString() : "";
}
// First day of a month as YYYY-MM-DD (default date for a new LOP in the filtered month).
function firstOfMonth(m, y) {
  return `${y}-${String(m).padStart(2, "0")}-01`;
}
// The month's working days: its calendar days minus the Sundays / weekly offs
// (matches the backend). This is the divisor behind a day's pay, so the LOP
// amount previewed here is the same one payroll charges.
const WEEKLY_OFF_WEEKDAYS = [0]; // 0 = Sunday
function workingDaysInMonth(y, m) {
  const total = new Date(y, m, 0).getDate();
  let count = 0;
  for (let d = 1; d <= total; d++) {
    if (!WEEKLY_OFF_WEEKDAYS.includes(new Date(y, m - 1, d).getDay())) count++;
  }
  return count;
}
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Deductions() {
  const [entries, setEntries] = useState([]);
  const [salaryByEmp, setSalaryByEmp] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(nowDate.getMonth() + 1);
  const [year, setYear] = useState(nowDate.getFullYear());
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingSource, setEditingSource] = useState(null); // null (add) | "manual" | "attendance"
  const [form, setForm] = useState({ employee: "", date: toDateInput(nowDate), days: "1", reason: "", pardoned: false });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingEntryType, setEditingEntryType] = useState(null); // null | 'wfh' | 'late'
  // Id of the late entry currently being pardoned (disables just that button).
  const [pardoningId, setPardoningId] = useState(null);
  // Working days + monthly salary used to calculate the LOP deduction (display only).
  const [calc, setCalc] = useState({ workingDays: 0, monthlySalary: 0 });

  useEffect(() => {
    getEmployeesApi().then((d) => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDeductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // When the form's employee/date is set, look up the working days + salary used
  // for that employee's payroll month so the LOP deduction shown matches payroll.
  useEffect(() => {
    if (!modalOpen || !form.employee || !form.date) { setCalc({ workingDays: 0, monthlySalary: 0 }); return; }
    const [yStr, mStr] = form.date.split("-");
    const m = Number(mStr), y = Number(yStr);
    const emp = employees.find((e) => e._id === form.employee);
    let cancelled = false;
    getSalaryReportsApi({ employee: form.employee, month: m, year: y })
      .then((data) => {
        if (cancelled) return;
        const rep = (data.reports || [])[0];
        setCalc({
          workingDays: (rep && rep.monthlyWorkingDays) || workingDaysInMonth(y, m),
          monthlySalary: (rep && rep.monthlySalary) || emp?.salary || 0,
        });
      })
      .catch(() => { if (!cancelled) setCalc({ workingDays: workingDaysInMonth(y, m), monthlySalary: emp?.salary || 0 }); });
    return () => { cancelled = true; };
  }, [modalOpen, form.employee, form.date, employees]);

  async function fetchDeductions() {
    try {
      setLoading(true);
      setError(null);
      // Deductions + the month's salary reports (for each employee's per-day pay).
      const [data, salary] = await Promise.all([
        getDeductionsApi({ month, year }),
        getSalaryReportsApi({ month, year }).catch(() => ({ reports: [] })),
      ]);
      setEntries(data.entries || []);
      const map = {};
      (salary.reports || []).forEach((r) => {
        map[r.empId] = {
          monthlySalary: r.monthlySalary || 0,
          workingDays: r.monthlyWorkingDays || workingDaysInMonth(year, month),
        };
      });
      setSalaryByEmp(map);
    } catch (err) {
      console.error("Failed to load deductions:", err);
      setError(err.response?.data?.message || "Failed to load deductions.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setEditingSource(null);
    setEditingEntryType(null);
    setForm({ employee: "", date: firstOfMonth(month, year), days: "1", reason: "", pardoned: false });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry._id);
    setEditingSource(entry.source);
    setEditingEntryType(entry.entryType || null);
    setForm({
      employee: entry.employee || "",
      date: toDateInput(entry.date),
      days: String(entry.days ?? ""),
      reason: entry.reason || "",
      pardoned: !!entry.pardoned,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const errors = {};
    if (!form.employee) errors.employee = "Select an employee";
    if (!form.date) errors.date = "Choose a date";
    if (form.days === "" || isNaN(Number(form.days)) || Number(form.days) <= 0) errors.days = "Enter valid LOP days";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setFormErrors({});

    setSaving(true);
    try {
      if (editingEntryType === 'wfh') {
        // WFH entry: only wfhPardoned can be toggled here
        await updateAttendanceApi(editingId, { wfhPardoned: !!form.pardoned });
      } else if (editingSource === "attendance") {
        // Attendance-marked LOP: LOP days + pardon are adjustable here; that
        // updates the underlying attendance record and re-syncs payroll.
        await updateAttendanceApi(editingId, { lop: Number(form.days), lopPardoned: !!form.pardoned });
      } else {
        // Manual LOP: payroll period is derived from the entered date.
        const [yStr, mStr] = form.date.split("-");
        const payload = {
          employee: form.employee,
          month: Number(mStr),
          year: Number(yStr),
          date: form.date,
          days: Number(form.days),
          reason: form.reason,
          pardoned: !!form.pardoned,
        };
        if (editingId) await updateLopRecordApi(editingId, payload);
        else await createLopRecordApi(payload);
      }
      await fetchDeductions();
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save LOP record.");
    } finally {
      setSaving(false);
    }
  }

  // Waive a late-arrival deduction (or put it back). The backend records who
  // approved it and when, and recalculates the employee's Net Pay.
  async function handlePardonLate(entry) {
    const pardon = !entry.pardoned;
    const mins = `${entry.lateMinutes} min`;
    const question = pardon
      ? `Pardon ${mins} of lateness for ${entry.employeeName} on ${formatDate(entry.date)}? Those minutes leave the month's total and the salary will be recalculated.`
      : `Count ${mins} of lateness for ${entry.employeeName} on ${formatDate(entry.date)} again?`;
    if (!window.confirm(question)) return;
    try {
      setPardoningId(entry._id);
      await pardonLateApi(entry._id, pardon);
      await fetchDeductions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pardon the late deduction.");
    } finally {
      setPardoningId(null);
    }
  }

  async function handleDelete(entry) {
    try {
      if (entry.source === "attendance") {
        if (!window.confirm(`Clear the LOP marked in Attendance for ${entry.employeeName} on ${formatDate(entry.date)}? The attendance record stays; only the LOP is removed.`)) return;
        await updateAttendanceApi(entry._id, { lop: 0 });
      } else {
        if (!window.confirm(`Delete this LOP entry for ${entry.employeeName}? Salary will be recalculated.`)) return;
        await deleteLopRecordApi(entry._id);
      }
      await fetchDeductions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete LOP entry.");
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = entries.filter((e) => !q || (e.employeeName || "").toLowerCase().includes(q) || (e.empId || "").toLowerCase().includes(q));

  // ₹ value of a LOP entry (per-day pay × LOP days). For a pardoned entry this
  // is the amount that was waived. Display only — no effect on any calculation.
  function amountFor(en) {
    const s = salaryByEmp[en.empId];
    const monthlySalary = s ? s.monthlySalary : (employees.find((e) => e.empId === en.empId)?.salary || 0);
    const workingDays = s ? s.workingDays : 30;
    if (!workingDays) return 0;
    return Math.round((monthlySalary / workingDays) * (Number(en.days) || 0));
  }

  // Live LOP deduction preview for the form (per-day pay × LOP days).
  const perDay = calc.workingDays > 0 ? calc.monthlySalary / calc.workingDays : 0;
  const lopAmount = Math.round(perDay * (Number(form.days) || 0));
  // Attendance-sourced LOP: only the LOP days can be changed here.
  const isAttendanceEdit = editingSource === "attendance" && editingEntryType !== 'wfh';
  const isWfhEdit = editingEntryType === 'wfh';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Deductions</h2>
          <p className="text-sm text-slate-500 mt-1">
            All deductions for <span className="font-semibold text-slate-700">{MONTHS[month]} {year}</span> — manual entries, attendance-marked LOP, unpaid absences, WFH and late arrivals.
          </p>
        </div>
        <Button color="green" onClick={openAdd}>+ Add LOP</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / ID..."
          className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
      </div>

      {loading && <SkeletonTable rows={6} cols={8} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/70 shadow-card scrollbar-slim">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/70">
                <tr>
                  {["Employee", "Month", "Date", "LOP Days", "Amount", "Reason", "Source", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((en) => (
                  <tr key={`${en.source}-${en._id}`} className="hover:bg-brand-50/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {en.employeeName}
                      <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{en.empId}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{MONTHS[en.month] || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(en.date)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {/* A late day is measured in minutes — the charge comes from
                          the month's total, so the day has no day-fraction. */}
                      <span className={en.pardoned ? "line-through text-slate-400" : "text-rose-600"}>
                        {en.entryType === "late" ? `${en.lateMinutes} min` : en.days}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {en.entryType === "late" ? (
                        <span className="text-xs font-medium text-slate-400" title="Late pay is charged on the month's total minutes, not per day — see Salary Adjustments → Late Minutes">
                          charged monthly
                        </span>
                      ) : (
                        <span className={en.pardoned ? "line-through text-slate-400" : "text-rose-600"} title={en.pardoned ? "Waived (pardoned)" : "Deducted from pay"}>{money(amountFor(en))}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={en.reason}>{en.reason || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        en.entryType === 'late'
                          ? 'bg-orange-100 text-orange-700'
                          : en.entryType === 'wfh'
                          ? 'bg-purple-100 text-purple-700'
                          : en.absence
                          ? 'bg-slate-100 text-slate-600'
                          : en.source === 'attendance'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-brand-100 text-brand-700'
                      }`}>
                        {en.entryType === 'late' ? 'Late' : en.entryType === 'wfh' ? 'WFH' : en.absence ? 'Absent' : en.source === 'attendance' ? 'Attendance' : 'Manual'}
                      </span>
                      {en.pardoned && (
                        <span
                          className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                          title={en.pardonedBy ? `Pardoned by ${en.pardonedBy}${en.pardonedAt ? ` on ${formatDateTime(en.pardonedAt)}` : ""}` : "Pardoned — not deducted from pay"}
                        >
                          Pardoned
                        </span>
                      )}
                      {/* Audit trail: who approved the pardon and when. */}
                      {en.pardoned && en.pardonedBy && (
                        <p className="mt-1 text-[10px] font-normal text-slate-400 normal-case">
                          by {en.pardonedBy}
                          {en.pardonedAt && ` · ${formatDateTime(en.pardonedAt)}`}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      {en.entryType === 'late' ? (
                        // Late arrivals aren't editable here — they come from the
                        // check-in time. The only action is to waive the deduction.
                        <button
                          onClick={() => handlePardonLate(en)}
                          disabled={pardoningId === en._id}
                          title={en.pardoned ? "Count this day's minutes again" : "Waive this day — its minutes leave the month's total and Net Pay is recalculated"}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                            en.pardoned
                              ? "text-slate-700 bg-slate-100 hover:bg-slate-200"
                              : "text-amber-800 bg-amber-100 hover:bg-amber-200"
                          }`}
                        >
                          {pardoningId === en._id ? "Saving..." : en.pardoned ? "Un-pardon" : "Pardon"}
                        </button>
                      ) : en.absence ? (
                        <span className="text-xs text-slate-400">Synced from Attendance</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(en)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-brand-700 bg-brand-100 hover:bg-brand-200 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {!en.entryType && (
                            <button
                              onClick={() => handleDelete(en)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition-colors"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No LOP entries for {MONTHS[month]} {year}. Click <span className="font-semibold">+ Add LOP</span> to create one.
            </p>
          )}
        </>
      )}

      {/* Add / Edit LOP modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isWfhEdit ? "Edit WFH Deduction" : isAttendanceEdit ? "Edit Attendance LOP" : editingId ? "Edit LOP Entry" : "Add LOP"} size="lg">
        <form onSubmit={handleSave} noValidate>
          {isWfhEdit && (
            <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2.5 text-sm text-purple-800">
              This is a <span className="font-semibold">Work From Home</span> deduction. You can <span className="font-semibold">pardon</span> it below to waive the 50% penalty — the salary will be recalculated automatically.
            </div>
          )}
          {isAttendanceEdit && (
            <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm text-sky-800">
              This LOP was marked in <span className="font-semibold">Attendance</span>. You can adjust the <span className="font-semibold">LOP Days</span> here; employee, date and reason stay managed in the Attendance module.
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name</label>
            <select
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              disabled={isAttendanceEdit}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${formErrors.employee ? "border-rose-400 focus:ring-rose-300" : "border-slate-300 focus:ring-green-500"}`}
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.empId})</option>)}
            </select>
            {formErrors.employee && <p className="text-xs text-rose-600 mt-1">{formErrors.employee}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            <Input label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={formErrors.date} disabled={isAttendanceEdit} />
            <Input label="LOP Days" name="days" type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} placeholder="1" error={formErrors.days} />
          </div>

          {/* Auto-calculated LOP deduction — read-only, display only. */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">LOP Calculation (Deduction Amount)</label>
            <input
              type="text"
              value={!form.employee ? "Select an employee" : form.pardoned ? `${money(lopAmount)} — Waived (Pardoned)` : money(lopAmount)}
              readOnly
              tabIndex={-1}
              className={`w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-semibold cursor-not-allowed ${form.pardoned ? "text-amber-700" : "text-slate-700"}`}
            />
            {form.employee && (
              <p className="text-[11px] text-slate-400 mt-1">
                {money(calc.monthlySalary)} ÷ {calc.workingDays} working days × {Number(form.days) || 0} LOP day(s)
              </p>
            )}
          </div>

          {/* Pardon — only when editing an existing record */}
          {editingId && (
            <div className="mb-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pardoned}
                  onChange={(e) => setForm({ ...form, pardoned: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-sm font-semibold text-slate-700">
                  {isWfhEdit ? "Pardon WFH Deduction" : "Pardon LOP"}
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 ml-6">
                {isWfhEdit
                  ? "When pardoned, the 50% WFH deduction is waived. The employee receives full pay for this day. Uncheck to re-apply the deduction."
                  : "When pardoned, this LOP is not deducted from pay (Net Pay increases). The record and its amount are kept for reference. Uncheck to apply the deduction again."}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              disabled={isAttendanceEdit}
              placeholder="e.g. Unpaid Leave, Late Attendance, Unauthorized Absence…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green" loading={saving}>
              {saving ? "Saving..." : isWfhEdit ? "Update WFH Deduction" : editingId ? "Update LOP" : "Add LOP"}
            </Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Deductions;

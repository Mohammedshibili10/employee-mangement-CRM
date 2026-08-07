import { useState, useEffect } from "react";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Table from "../../components/common/Table.jsx";
import ActionButton from "../../components/common/ActionButton.jsx";
import SearchableSelect from "../../components/common/SearchableSelect.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import {
  getSalaryAdvancesApi,
  createSalaryAdvanceApi,
  updateSalaryAdvanceApi,
  deleteSalaryAdvanceApi,
} from "../../api/salaryAdvanceApi.js";
import { getEmployeesApi } from "../../api/employeeApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const nowDate = new Date();
const YEARS = [nowDate.getFullYear() + 1, nowDate.getFullYear(), nowDate.getFullYear() - 1, nowDate.getFullYear() - 2];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 10);
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : "-";
}
function firstOfMonth(m, y) {
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all";

function SalaryAdvance() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(nowDate.getMonth() + 1);
  const [year, setYear] = useState(nowDate.getFullYear());
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ employee: "", date: toDateInput(nowDate), amount: "", reason: "", pardoned: false });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // The employee list follows the selected period, so someone who left during
  // the month can still have an advance recorded against it.
  useEffect(() => {
    getEmployeesApi({ month, year })
      .then((d) => setEmployees(d.employees || []))
      .catch(() => {});
  }, [month, year]);

  useEffect(() => {
    fetchAdvances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function fetchAdvances() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSalaryAdvancesApi({ month, year });
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load salary advances:", err);
      setError(err.response?.data?.message || "Failed to load salary advances.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm({ employee: "", date: firstOfMonth(month, year), amount: "", reason: "", pardoned: false });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry._id);
    setForm({
      employee: entry.employee || "",
      date: toDateInput(entry.date),
      amount: String(entry.amount ?? ""),
      reason: entry.reason || "",
      pardoned: !!entry.pardoned,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const errors = {};
    if (!form.employee) errors.employee = "Select an employee";
    if (!form.date) errors.date = "Choose a date";
    if (form.amount === "" || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      errors.amount = "Enter a valid amount";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const [y, m] = form.date.split("-");
    const payload = {
      employee: form.employee,
      date: form.date,
      amount: Number(form.amount) || 0,
      reason: form.reason,
      month: Number(m),
      year: Number(y),
      pardoned: form.pardoned,
    };

    try {
      setSaving(true);
      if (editingId) await updateSalaryAdvanceApi(editingId, payload);
      else await createSalaryAdvanceApi(payload);
      setModalOpen(false);
      await fetchAdvances();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save the salary advance.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this salary advance? The month's salary will be recalculated.")) return;
    try {
      await deleteSalaryAdvanceApi(id);
      await fetchAdvances();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete the salary advance.");
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = entries.filter(
    (e) => !q || (e.employeeName || "").toLowerCase().includes(q) || (e.empId || "").toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Salary Advance</h2>
          <p className="text-sm text-slate-500 mt-1">
            Advances paid out to employees. The month's total is deducted from Net Pay automatically.
          </p>
        </div>
        <Button color="green" onClick={openAdd}>+ Add Salary Advance</Button>
      </div>

      {/* Period + search */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        >
          {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / ID..."
          className="col-span-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
        />
      </div>

      {loading && <SkeletonTable rows={5} cols={6} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <Table headers={["Emp ID", "Employee", "Date", "Amount", "Reason", "Status", "Actions"]}>
            {filtered.map((e) => (
              <tr key={e._id} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{e.empId}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{e.employeeName}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(e.date)}</td>
                <td className={`px-4 py-3 font-bold ${e.pardoned ? "text-slate-400 line-through" : "text-rose-600"}`}>
                  {money(e.amount)}
                </td>
                <td className="px-4 py-3 text-slate-600">{e.reason || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    e.pardoned ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-700"
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {e.pardoned ? "Waived" : "Deducted"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <ActionButton color="blue" icon="edit" title="Edit" onClick={() => openEdit(e)} />
                    <ActionButton color="red" icon="delete" title="Delete" onClick={() => handleDelete(e._id)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No salary advances recorded for {MONTHS[month]} {year}.
            </p>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="rounded-2xl border border-brand-200 bg-brand-gradient-soft px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  Total deducted this month
                </span>
                <p className="text-xl font-extrabold text-brand-700 mt-0.5">{money(total)}</p>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Salary Advance" : "Add Salary Advance"}
        size="lg"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
          <SearchableSelect
            value={form.employee}
            onChange={(val) => setForm({ ...form, employee: val })}
            options={employees.map((emp) => ({ value: emp._id, label: `${emp.name} (${emp.empId})` }))}
            placeholder="Select an employee"
            className={inputCls}
          />
          {formErrors.employee && <p className="text-xs text-rose-600 mt-1">{formErrors.employee}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            error={formErrors.date}
          />
          <Input
            label="Amount (₹)"
            type="number"
            name="amount"
            min="0"
            step="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            error={formErrors.amount}
          />
        </div>

        <Input
          label="Reason"
          name="reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          placeholder="What the advance was for (optional)"
        />

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <input
            type="checkbox"
            checked={form.pardoned}
            onChange={(e) => setForm({ ...form, pardoned: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          Waive this advance (kept on record, not deducted from pay)
        </label>

        <p className="text-xs text-brand-600 mb-3">
          Saving recalculates that month's salary straight away — the total appears in the
          Salary Report's <span className="font-semibold">Salary Adv.</span> column and reduces Net Pay.
        </p>

        <div className="flex gap-3 mt-2">
          <Button color="green" onClick={handleSave} loading={saving}>
            {editingId ? "Update Advance" : "Save Advance"}
          </Button>
          <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

export default SalaryAdvance;

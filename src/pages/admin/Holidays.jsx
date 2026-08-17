import { useState, useEffect, Fragment } from "react";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import {
  getHolidaysApi,
  createHolidayApi,
  updateHolidayApi,
  deleteHolidayApi,
  applyHolidayApi,
} from "../../api/holidayApi.js";
import { formatDate, toDateInput } from "../../utils/formatDate.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const nowDate = new Date();
const YEARS = [nowDate.getFullYear() + 1, nowDate.getFullYear(), nowDate.getFullYear() - 1, nowDate.getFullYear() - 2];

const todayStr = () => toDateInput(new Date());

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(nowDate.getFullYear());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", date: todayStr(), description: "", paid: true });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  async function fetchHolidays() {
    try {
      setLoading(true);
      setError(null);
      const data = await getHolidaysApi({ year });
      setHolidays(data.holidays || []);
    } catch (err) {
      console.error("Failed to load holidays:", err);
      setError(err.response?.data?.message || "Failed to load holidays.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", date: todayStr(), description: "", paid: true });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(h) {
    setEditingId(h._id);
    setForm({
      name: h.name || "",
      date: toDateInput(h.date),
      description: h.description || "",
      paid: h.paid !== false,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = "Enter the holiday name";
    if (!form.date) errors.date = "Choose a date";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setFormErrors({});

    setSaving(true);
    try {
      const data = editingId ? await updateHolidayApi(editingId, form) : await createHolidayApi(form);
      await fetchHolidays();
      setModalOpen(false);
      if (data?.message) alert(data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save the holiday.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApply(h) {
    try {
      setSyncingId(h._id);
      const data = await applyHolidayApi(h._id);
      alert(data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark the holiday in Attendance.");
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDelete(h) {
    if (!window.confirm(`Remove ${h.name} on ${formatDate(h.date)}? Attendance and payroll for that month will be recalculated.`)) return;
    try {
      await deleteHolidayApi(h._id);
      await fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove the holiday.");
    }
  }

  // Grouped by month so a year's calendar reads at a glance.
  const byMonth = {};
  holidays.forEach((h) => {
    const m = new Date(h.date).getMonth() + 1;
    (byMonth[m] ||= []).push(h);
  });

  const paidCount = holidays.filter((h) => h.paid !== false).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Holiday Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Company holidays for <span className="font-semibold text-slate-700">{year}</span>. Every date added here is
            applied to <span className="font-semibold">all employees automatically</span> — the day shows as a holiday in
            Attendance and is paid in full, never counted as an absence or a loss of pay.
          </p>
        </div>
        <Button color="green" onClick={openAdd}>+ Add Holiday</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15">
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
          <p className="text-sm font-bold text-slate-700">{holidays.length} holiday{holidays.length === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paid</p>
          <p className="text-sm font-bold text-brand-700">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Unpaid</p>
          <p className="text-sm font-bold text-slate-500">{holidays.length - paidCount}</p>
        </div>
      </div>

      {loading && <SkeletonTable rows={6} cols={5} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/70 shadow-card scrollbar-slim">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/70">
                <tr>
                  {["Date", "Day", "Holiday", "Type", "Notes", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(byMonth)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((m) => (
                    <Fragment key={`month-${m}`}>
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {MONTHS[m]} · {byMonth[m].length}
                        </td>
                      </tr>
                      {byMonth[m].map((h) => {
                        const d = new Date(h.date);
                        return (
                          <tr key={h._id} className="hover:bg-brand-50/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{formatDate(d)}</td>
                            <td className="px-4 py-3 text-slate-600">{DAYS[d.getDay()]}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{h.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${h.paid !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                {h.paid !== false ? "Paid" : "Unpaid"}
                              </span>
                              {d.getDay() === 0 && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500" title="Already a weekly off — this holiday adds nothing to pay">
                                  Sunday
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={h.description}>{h.description || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEdit(h)}
                                  title="Edit"
                                  className="p-1.5 rounded-lg text-brand-700 bg-brand-100 hover:bg-brand-200 transition-colors"
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleApply(h)}
                                  disabled={syncingId === h._id}
                                  title="Mark this holiday in Attendance for everyone (covers employees who joined later)"
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-60"
                                >
                                  {syncingId === h._id ? "..." : "Sync"}
                                </button>
                                <button
                                  onClick={() => handleDelete(h)}
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
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          {holidays.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No holidays set for {year}. Click <span className="font-semibold">+ Add Holiday</span> to add one.
            </p>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Holiday" : "Add Holiday"} size="lg">
        <form onSubmit={handleSave} noValidate>
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
            The date is applied to <span className="font-semibold">every employee</span> the moment it is saved — no
            attendance needs to be marked. Payroll for that month recalculates automatically.
          </div>

          <Input
            label="Holiday Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Independence Day"
            error={formErrors.name}
          />

          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            error={formErrors.date}
          />
          {form.date && (
            <p className="text-[11px] text-slate-400 -mt-2 mb-4">
              {DAYS[new Date(`${form.date}T00:00:00`).getDay()]}
              {new Date(`${form.date}T00:00:00`).getDay() === 0 && " — already a weekly off, so this adds nothing to pay"}
            </p>
          )}

          <div className="mb-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="text-sm font-semibold text-slate-700">Paid holiday</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1 ml-6">
              {form.paid
                ? "Everyone is paid for the day exactly like a Sunday, with no attendance marked."
                : "An unpaid shutdown: nobody is due in and nobody is charged, but the day is not paid either — the month is prorated."}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green" loading={saving}>
              {saving ? "Saving..." : editingId ? "Update Holiday" : "Add Holiday"}
            </Button>
            <Button color="gray" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Holidays;

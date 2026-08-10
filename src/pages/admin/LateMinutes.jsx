import { useState, useEffect } from "react";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import {
  getLateAdjustmentsApi,
  saveLateAdjustmentApi,
  deleteLateAdjustmentApi,
} from "../../api/lateAdjustmentApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const nowDate = new Date();
const YEARS = [nowDate.getFullYear() + 1, nowDate.getFullYear(), nowDate.getFullYear() - 1, nowDate.getFullYear() - 2];

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The same ladder the backend charges on, so the modal can preview an edit
// before it is saved. A completed 90-minute slab costs a full day; what is left
// over is charged on its own band. The 40-minute allowance is spent once on the
// month's total and is NOT granted again to the leftover.
const SLAB = 90;
function daysForMinutes(total) {
  const m = Math.max(0, Math.round(Number(total) || 0));
  if (m <= 40) return 0;
  const slabs = Math.floor(m / SLAB);
  const rem = m % SLAB;
  const extra = rem > 60 ? 0.5 : rem > 0 ? 0.25 : 0;
  return slabs + extra;
}
// What the leftover minutes alone add, given the slabs are already charged.
function bandLabel(rem, hasSlabs) {
  if (rem === 0) return "0 — nothing left over";
  if (!hasSlabs && rem <= 40) return "0 — within the month's 40-minute allowance";
  if (rem <= 60) return "0.25 day — 1-60 minutes left over";
  if (rem < SLAB) return "0.50 day — 61-89 minutes left over";
  return "fills another 90-minute slab";
}

function LateMinutes() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(nowDate.getMonth() + 1);
  const [year, setYear] = useState(nowDate.getFullYear());
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null);
  const [minutes, setMinutes] = useState("0");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function fetchEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLateAdjustmentsApi({ month, year });
      setEntries(data.entries || []);
    } catch (err) {
      console.error("Failed to load late minutes:", err);
      setError(err.response?.data?.message || "Failed to load late minutes.");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(en) {
    setEditing(en);
    setMinutes(String(en.extraMinutes ?? 0));
    setReason(en.reason || "");
  }

  async function save(e) {
    e.preventDefault();
    const value = Number(minutes);
    if (isNaN(value) || value < 0) return;
    setSaving(true);
    try {
      await saveLateAdjustmentApi({
        employee: editing.employee,
        month,
        year,
        extraMinutes: value,
        reason,
      });
      await fetchEntries();
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to adjust the late minutes.");
    } finally {
      setSaving(false);
    }
  }

  async function reset(en) {
    if (!en._id) return;
    if (!window.confirm(`Remove the adjustment for ${en.employeeName} and go back to the ${en.originalExtraMinutes} minute(s) attendance recorded?`)) return;
    try {
      await deleteLateAdjustmentApi(en._id);
      await fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove the adjustment.");
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = entries.filter(
    (e) => !q || (e.employeeName || "").toLowerCase().includes(q) || (e.empId || "").toLowerCase().includes(q)
  );

  // Live preview inside the modal.
  const previewMinutes = editing ? editing.slabs * SLAB + Math.max(0, Number(minutes) || 0) : 0;
  const previewDays = daysForMinutes(previewMinutes);
  const previewAmount = editing ? previewDays * editing.perDay : 0;
  const currentDays = editing ? daysForMinutes(editing.slabs * SLAB + editing.extraMinutes) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Late Minutes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Late pay for <span className="font-semibold text-slate-700">{MONTHS[month]} {year}</span> is charged on each
            employee's <span className="font-semibold">total minutes for the month</span>. Every complete 90 minutes costs
            one day's pay; the leftover minutes are charged on their own band and can be adjusted here.
          </p>
        </div>
      </div>

      {/* The ladder, spelled out */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { band: "Total 0 – 40 min", charge: "No deduction", note: "the allowance, once per month" },
          { band: "Every 90 min", charge: "1 full day", note: "a completed slab" },
          { band: "Leftover 1 – 60 min", charge: "0.25 day", note: "no allowance re-applied" },
          { band: "Leftover 61 – 89 min", charge: "0.50 day", note: "" },
        ].map((s) => (
          <div key={s.band} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.band}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{s.charge}</p>
            {s.note && <p className="text-[10px] text-slate-400 mt-0.5">{s.note}</p>}
          </div>
        ))}
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
                  {["Employee", "Total Minutes", "90-min Slabs", "Extra Minutes", "Deduction Days", "Late Deduction", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((en) => (
                  <tr key={en.empId} className="hover:bg-brand-50/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {en.employeeName}
                      <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{en.empId}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{en.totalMinutes} min</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        {en.slabs} × 90 min = {en.slabs} day{en.slabs === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <span className={en.adjusted ? "text-brand-700" : "text-slate-700"}>{en.extraMinutes} min</span>
                      {en.adjusted && (
                        <span
                          className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 text-brand-700"
                          title={`Attendance recorded ${en.originalExtraMinutes} min${en.adjustedByName ? ` · adjusted by ${en.adjustedByName}` : ""}`}
                        >
                          adjusted from {en.originalExtraMinutes}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{en.deductionDays}</td>
                    <td className="px-4 py-3 font-semibold text-rose-600">{money(en.lateDeduction)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(en)}
                          title="Adjust the leftover minutes"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 transition-colors"
                        >
                          Edit minutes
                        </button>
                        {en.adjusted && (
                          <button
                            onClick={() => reset(en)}
                            title="Go back to what attendance recorded"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">
              No late minutes recorded for {MONTHS[month]} {year}.
            </p>
          )}
        </>
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Adjust Late Minutes" size="lg">
        {editing && (
          <form onSubmit={save} noValidate>
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm">
              <p className="font-semibold text-slate-800">{editing.employeeName} <span className="text-slate-500 font-normal">({editing.empId})</span></p>
              <p className="text-slate-500 mt-1">
                {MONTHS[month]} {year} · {editing.totalMinutes} total late minutes · a day's pay is {money(editing.perDay)}
              </p>
            </div>

            {/* The completed slabs are fixed */}
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
              <span className="font-semibold">{editing.slabs} completed 90-minute slab{editing.slabs === 1 ? "" : "s"}</span> ={" "}
              <span className="font-semibold">{editing.slabs} day{editing.slabs === 1 ? "" : "s"}</span> of pay.
              These come straight from attendance and cannot be adjusted — only the leftover minutes below can.
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Extra / leftover minutes <span className="text-slate-400 font-normal">(attendance recorded {editing.originalExtraMinutes})</span>
              </label>
              <input
                type="number"
                min="0"
                max={editing.originalExtraMinutes}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {bandLabel(Math.max(0, Number(minutes) || 0), editing.slabs > 0)}. Can only be reduced, never raised above what attendance recorded.
              </p>
            </div>

            {/* Live preview of the effect */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current deduction</span>
                <span className="font-semibold text-slate-700">{currentDays} day{currentDays === 1 ? "" : "s"} · {money(currentDays * editing.perDay)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5 pt-1.5 border-t border-slate-100">
                <span className="text-slate-500">After this change</span>
                <span className={`font-bold ${previewDays < currentDays ? "text-brand-700" : "text-slate-800"}`}>
                  {previewDays} day{previewDays === 1 ? "" : "s"} · {money(previewAmount)}
                </span>
              </div>
              {previewDays < currentDays && (
                <p className="text-[11px] text-brand-600 font-medium mt-1.5">
                  Net Pay increases by {money((currentDays - previewDays) * editing.perDay)}.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Traffic disruption on the 14th, approved by manager"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <Button type="submit" color="green" loading={saving}>
                {saving ? "Saving..." : "Save & Recalculate"}
              </Button>
              <Button color="gray" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default LateMinutes;

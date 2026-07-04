import { useState, useEffect } from "react";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getLopSummaryApi, setEmployeeLopApi } from "../../api/lopApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const now = new Date();
const YEARS = [now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Lop() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");

  // Per-employee save status: { [empId]: "saving" | "saved" }
  const [status, setStatus] = useState({});

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function fetchSummary() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLopSummaryApi({ month, year });
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to load LOP summary:", err);
      setError(err.response?.data?.message || "Failed to load LOP data.");
    } finally {
      setLoading(false);
    }
  }

  function patchLocal(empId, patch) {
    setEmployees((prev) => prev.map((e) => (e._id === empId ? { ...e, ...patch } : e)));
  }

  // Auto-save an employee's LOP days + reason for the selected month.
  async function saveLop(empId, rawDays, reason) {
    const value = Math.max(0, Number(rawDays) || 0);
    const rsn = reason ?? "";
    patchLocal(empId, { lopDays: value, reason: rsn });
    setStatus((s) => ({ ...s, [empId]: "saving" }));
    try {
      const res = await setEmployeeLopApi({ employee: empId, month, year, days: value, reason: rsn });
      patchLocal(empId, { lopDays: res.lopDays, reason: res.reason ?? "" });
      setStatus((s) => ({ ...s, [empId]: "saved" }));
      setTimeout(() => setStatus((s) => { const n = { ...s }; delete n[empId]; return n; }), 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save LOP.");
      setStatus((s) => { const n = { ...s }; delete n[empId]; return n; });
      fetchSummary(); // revert to server truth
    }
  }

  const filtered = employees.filter((e) => {
    const q = search.trim().toLowerCase();
    return !q || (e.name || "").toLowerCase().includes(q) || (e.empId || "").toLowerCase().includes(q);
  });
  const totalLop = employees.reduce((s, e) => s + (Number(e.lopDays) || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Loss of Pay (LOP)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Set each employee's LOP days for <span className="font-semibold text-slate-700">{MONTHS[month]} {year}</span>. Changes save automatically and are deducted in payroll.
          </p>
        </div>
      </div>

      {/* Month / year / search */}
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

      {loading && <SkeletonTable rows={6} cols={5} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/70 shadow-card scrollbar-slim">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/70">
                <tr>
                  {["Employee", "Emp ID", "Department", "Designation", "Salary", "LOP Days", "Reason"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => {
                  const st = status[e._id];
                  return (
                    <tr key={e._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${e.status === "active" ? "bg-brand-500" : "bg-slate-300"}`} title={e.status} />
                          {e.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{e.empId}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{e.department || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{e.designation || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{money(e.salary)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveLop(e._id, (Number(e.lopDays) || 0) - 1, e.reason)}
                            className="h-7 w-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-bold leading-none disabled:opacity-40"
                            disabled={(Number(e.lopDays) || 0) <= 0}
                            title="Decrease"
                          >−</button>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={e.lopDays}
                            onChange={(ev) => patchLocal(e._id, { lopDays: ev.target.value })}
                            onBlur={(ev) => saveLop(e._id, ev.target.value, e.reason)}
                            onKeyDown={(ev) => { if (ev.key === "Enter") ev.currentTarget.blur(); }}
                            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-center focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => saveLop(e._id, (Number(e.lopDays) || 0) + 1, e.reason)}
                            className="h-7 w-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 font-bold leading-none"
                            title="Increase"
                          >+</button>
                          <span className="w-12 text-xs">
                            {st === "saving" && <span className="text-slate-400">Saving…</span>}
                            {st === "saved" && <span className="text-brand-600 font-semibold">Saved ✓</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          list="lop-reasons"
                          value={e.reason || ""}
                          disabled={(Number(e.lopDays) || 0) <= 0}
                          placeholder={(Number(e.lopDays) || 0) <= 0 ? "Set LOP days first" : "Reason…"}
                          onChange={(ev) => patchLocal(e._id, { reason: ev.target.value })}
                          onBlur={(ev) => saveLop(e._id, e.lopDays, ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === "Enter") ev.currentTarget.blur(); }}
                          className="w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 mt-6">No employees found.</p>
          ) : (
            <p className="text-sm text-slate-500 mt-3">
              {filtered.length} employee(s) · <span className="font-semibold text-slate-700">{totalLop}</span> total LOP day(s) for {MONTHS[month]} {year}
            </p>
          )}
        </>
      )}

      {/* Preset reason suggestions (users can still type any custom reason). */}
      <datalist id="lop-reasons">
        <option value="Unpaid Leave" />
        <option value="Late Attendance" />
        <option value="Unauthorized Absence" />
        <option value="Half Day" />
      </datalist>
    </div>
  );
}

export default Lop;

import { useState, useEffect } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import SearchableSelect from "../common/SearchableSelect.jsx";
import { markAttendanceApi, updateAttendanceApi, getAttendanceApi } from "../../api/attendanceApi.js";
import { deriveWorkStatus } from "../../utils/attendanceStatus.js";

// ---- date/time helpers ----
function toDayStr(d) {
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
}
function todayStr() {
  return toDayStr(new Date());
}
function timeStr(d) {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}
function combine(date, time) {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`).toISOString();
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const cellCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-50 disabled:bg-slate-50";

function WarningIcon({ title }) {
  return (
    <span title={title} className="text-rose-500 shrink-0">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

const emptySingle = { employeeId: "", date: todayStr(), status: "present", checkIn: "", checkOut: "", leaveType: "", lopChecked: false, lop: "", lopReason: "", wfhPardoned: false };

// Short explanation of how each status affects the salary — shown under the picker.
const STATUS_HINTS = {
  present: "Present — counts as a full day. A late-arrival deduction still applies if the check-in is after the start time.",
  late: "Late — counts as a full day, minus a late-arrival deduction based on the check-in time.",
  "half-day": "Half Day — counts as half a day; half a day's pay.",
  leave: "Full Leave — Sick/Casual are paid (within the monthly cap); None = unpaid (counts as LOP).",
  wfh: "Work From Home — 50% of the day's salary is deducted automatically (unless pardoned).",
  holiday: "Holiday — a paid day off, exactly like a Sunday. Never attendance, never a loss of pay. Dates set in Holiday Management already apply to everyone; use this for a one-off.",
};

function AttendanceFormModal({ isOpen, onClose, employees, onSaved, editRecord }) {
  const isEdit = !!editRecord;
  const [mode, setMode] = useState("single");
  const [saving, setSaving] = useState(false);

  const [single, setSingle] = useState(emptySingle);
  const [singleError, setSingleError] = useState("");
  const [singleExistingRecord, setSingleExistingRecord] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);

  // One date for the whole bulk section; each employee's row auto-loads for it.
  const [bulkDate, setBulkDate] = useState(todayStr());
  const [bulkLoading, setBulkLoading] = useState(false);
  // bulk: { [empId]: { checkIn, checkOut, leaveType, existingId, existingStatus, orig } }
  const [bulk, setBulk] = useState({});

  // Initialise the form ONLY when the modal opens or the target record changes.
  // Deliberately NOT keyed on `employees`/`records`: otherwise a background
  // refetch (e.g. after another save, or React StrictMode re-runs) would reset
  // the form and wipe the edit the user is in the middle of making.
  useEffect(() => {
    if (!isOpen) return;
    setSingleError("");
    if (editRecord) {
      setMode("single");
      setSingle({
        employeeId: editRecord.employee?._id || "",
        date: toDayStr(editRecord.date),
        status: editRecord.leaveType ? "leave" : (editRecord.status || "present"),
        checkIn: timeStr(editRecord.checkIn),
        checkOut: timeStr(editRecord.checkOut),
        leaveType: editRecord.leaveType || "",
        lopChecked: (editRecord.lop || 0) > 0,
        lop: editRecord.lop ? String(editRecord.lop) : "",
        lopReason: editRecord.lopReason || "",
        wfhPardoned: editRecord.wfhPardoned || false,
      });
    } else {
      // Adding: default to the date-based "all employees" view; rows load below.
      setMode("bulk");
      setSingle({ ...emptySingle, date: todayStr() });
      setBulkDate(todayStr());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editRecord]);

  // Load every employee's attendance for the selected bulk date, so the section
  // shows existing records (pre-filled) that can be viewed / entered / updated.
  useEffect(() => {
    if (!isOpen || isEdit || mode !== "bulk") return;
    let cancelled = false;
    setBulkLoading(true);
    getAttendanceApi({ date: bulkDate })
      .then((res) => {
        if (cancelled) return;
        const byEmp = {};
        (res.attendance || []).forEach((a) => {
          if (a.employee?._id) byEmp[a.employee._id] = a;
        });
        const rows = {};
        employees.forEach((emp) => {
          const ex = byEmp[emp._id];
          const checkIn = ex ? timeStr(ex.checkIn) : "";
          const checkOut = ex ? timeStr(ex.checkOut) : "";
          const leaveType = ex ? ex.leaveType || "" : "";
          const lopNum = ex && ex.lop != null ? Number(ex.lop) : 0;
          const status = ex ? (ex.leaveType ? "leave" : (ex.status || "")) : "";
          rows[emp._id] = {
            status,
            checkIn,
            checkOut,
            leaveType,
            lopChecked: lopNum > 0,
            lop: lopNum > 0 ? String(lopNum) : "",
            lopReason: ex ? (ex.lopReason || "") : "",
            wfhPardoned: ex ? (ex.wfhPardoned || false) : false,
            existingId: ex ? ex._id : null,
            existingStatus: ex ? ex.status : null,
            orig: { status, checkIn, checkOut, leaveType, lop: lopNum, lopReason: ex ? (ex.lopReason || "") : "", wfhPardoned: ex ? (ex.wfhPardoned || false) : false },
          };
        });
        setBulk(rows);
      })
      .catch(() => { if (!cancelled) setBulk({}); })
      .finally(() => { if (!cancelled) setBulkLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, isEdit, mode, bulkDate, employees]);

  // Single ADD mode: auto-load the existing record for the selected employee+date
  // straight from the backend (works for ANY date), so its saved check-in/out,
  // status, leave and LOP are shown — ready to view or update, not duplicate.
  useEffect(() => {
    if (!isOpen || isEdit) return;
    if (!single.employeeId || !single.date) {
      setSingleExistingRecord(null);
      return;
    }
    let cancelled = false;
    setSingleLoading(true);
    getAttendanceApi({ employee: single.employeeId, date: single.date })
      .then((res) => {
        if (cancelled) return;
        const ex = (res.attendance || [])[0] || null;
        setSingleExistingRecord(ex);
        setSingle((s) => ({
          ...s,
          status: ex ? (ex.leaveType ? "leave" : (ex.status || "present")) : "present",
          checkIn: ex ? timeStr(ex.checkIn) : "",
          checkOut: ex ? timeStr(ex.checkOut) : "",
          leaveType: ex ? ex.leaveType || "" : "",
          lopChecked: ex ? (ex.lop || 0) > 0 : false,
          lop: ex && ex.lop ? String(ex.lop) : "",
          lopReason: ex ? (ex.lopReason || "") : "",
          wfhPardoned: ex ? (ex.wfhPardoned || false) : false,
        }));
      })
      .catch(() => { if (!cancelled) setSingleExistingRecord(null); })
      .finally(() => { if (!cancelled) setSingleLoading(false); });
    return () => { cancelled = true; };
  }, [single.employeeId, single.date, isOpen, isEdit]);

  // ---- single ----
  const singleExisting = !isEdit ? singleExistingRecord : null;
  const selectedEmp = employees.find((e) => e._id === single.employeeId);
  const singleIsLeave = single.status === "leave";

  // Changing the status keeps the rest of the form consistent (leave clears
  // check-in/out & LOP; a work status clears the leave type).
  function setSingleStatus(status) {
    setSingle((s) => ({
      ...s,
      status,
      leaveType: status === "leave" ? (s.leaveType || "sick") : "",
      // LOP is kept whatever the status — a leave day can be marked as loss of pay.
      wfhPardoned: status === "wfh" ? s.wfhPardoned : false,
    }));
  }

  async function handleSingleSave() {
    if (!single.employeeId) return setSingleError("Please select an employee.");
    if (!single.date) return setSingleError("Please choose a date.");
    if (!singleIsLeave && !single.checkIn && !isEdit)
      return setSingleError("Set a check-in time, or choose Full Leave as the status.");
    setSingleError("");
    setSaving(true);
    try {
      const payload = singleIsLeave
        ? {
            employee: single.employeeId,
            date: single.date,
            status: "leave",
            leaveType: single.leaveType,
            // A leave day can still carry LOP.
            lop: single.lopChecked ? (Number(single.lop) || 0) : 0,
            lopReason: single.lopChecked ? single.lopReason : "",
          }
        : {
            employee: single.employeeId,
            date: single.date,
            status: single.status,
            checkIn: combine(single.date, single.checkIn),
            checkOut: combine(single.date, single.checkOut),
            leaveType: "",
            lop: single.lopChecked ? (Number(single.lop) || 0) : 0,
            wfhPardoned: single.wfhPardoned,
          };
      if (isEdit) {
        await updateAttendanceApi(editRecord._id, payload);
      } else {
        // Look up an existing record for this employee+date straight from the
        // backend (not just the currently-viewed day/month), so marking a past
        // date updates the existing record instead of failing as a duplicate.
        const existingRes = await getAttendanceApi({ employee: single.employeeId, date: single.date });
        const existing = (existingRes.attendance || [])[0];
        if (existing) await updateAttendanceApi(existing._id, payload);
        else await markAttendanceApi(payload);
      }
      // Wait for the refreshed list before closing so the table shows the saved values.
      await onSaved();
      onClose();
    } catch (err) {
      setSingleError(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  // ---- bulk ----
  const emptyRow = { status: "", checkIn: "", checkOut: "", leaveType: "", lopChecked: false, lop: "", lopReason: "", wfhPardoned: false, existingId: null, existingStatus: null, orig: { status: "", checkIn: "", checkOut: "", leaveType: "", lop: 0, lopReason: "", wfhPardoned: false } };
  function rowOf(empId) {
    return bulk[empId] || emptyRow;
  }
  function setRow(empId, field, value) {
    setBulk((prev) => {
      const cur = prev[empId] || emptyRow;
      return { ...prev, [empId]: { ...cur, [field]: value } };
    });
  }
  // Picking a status keeps the row consistent (Full Leave clears check-in/out and
  // defaults the leave type; a work status clears the leave type). LOP is left
  // alone either way — a leave day can be marked as loss of pay.
  function setRowStatus(empId, status) {
    setBulk((prev) => {
      const cur = prev[empId] || emptyRow;
      return {
        ...prev,
        [empId]: {
          ...cur,
          status,
          leaveType: status === "leave" ? (cur.leaveType || "sick") : "",
          wfhPardoned: status === "wfh" ? cur.wfhPardoned : false,
        },
      };
    });
  }

  async function handleBulkSave() {
    // Only save the rows the user actually changed (create new, update existing).
    const changed = employees
      .map((emp) => ({ emp, row: rowOf(emp._id) }))
      .filter(({ row }) =>
        row.status !== row.orig.status ||
        row.checkIn !== row.orig.checkIn ||
        row.checkOut !== row.orig.checkOut ||
        row.leaveType !== row.orig.leaveType ||
        (row.lopChecked ? (Number(row.lop) || 0) : 0) !== row.orig.lop ||
        (row.lopChecked ? (row.lopReason || "") : "") !== (row.orig.lopReason || "") ||
        row.wfhPardoned !== row.orig.wfhPardoned
      );

    if (changed.length === 0) {
      alert("No changes to save for this date.");
      return;
    }

    setSaving(true);
    let created = 0, updated = 0, skipped = 0;
    for (const { emp, row } of changed) {
      const payload = row.status === "leave"
        ? {
            employee: emp._id,
            date: bulkDate,
            status: "leave",
            leaveType: row.leaveType,
            // A leave day can still carry LOP.
            lop: row.lopChecked ? (Number(row.lop) || 0) : 0,
            lopReason: row.lopChecked ? row.lopReason : "",
          }
        : {
            employee: emp._id,
            date: bulkDate,
            status: row.status || undefined,
            checkIn: combine(bulkDate, row.checkIn),
            checkOut: combine(bulkDate, row.checkOut),
            leaveType: "",
            lop: row.lopChecked ? (Number(row.lop) || 0) : 0,
            wfhPardoned: row.wfhPardoned,
          };
      try {
        if (row.existingId) { await updateAttendanceApi(row.existingId, payload); updated++; }
        else if (row.status || row.checkIn) { await markAttendanceApi(payload); created++; }
        else { skipped++; }
      } catch {
        skipped++;
      }
    }
    setSaving(false);
    await onSaved();
    onClose();
    alert(`Attendance saved — ${created} created, ${updated} updated${skipped ? `, ${skipped} skipped` : ""}.`);
  }

  const title = isEdit ? "Edit Attendance" : "Add Attendance";

  return (
    // Bulk needs the full grid width; single is roomy enough for its two-column
    // rows without becoming a wall of empty space.
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={mode === "bulk" && !isEdit ? "3xl" : "xl"}>
      {!isEdit && (
        <div className="flex gap-2 mb-5">
          {[{ key: "single", label: "Single Attendance" }, { key: "bulk", label: "Bulk Attendance" }].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === t.key ? "bg-brand-gradient text-white shadow-glow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ---------- SINGLE ---------- */}
      {mode === "single" && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
            <SearchableSelect
              value={single.employeeId}
              onChange={(val) => setSingle({ ...single, employeeId: val })}
              options={employees.map((emp) => ({ value: emp._id, label: `${emp.name} (${emp.empId})` }))}
              placeholder="Select an employee"
              disabled={isEdit}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input type="date" value={single.date} onChange={(e) => setSingle({ ...single, date: e.target.value })} className={inputCls} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={single.status} onChange={(e) => setSingleStatus(e.target.value)} className={inputCls}>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Full Leave</option>
                <option value="wfh">Work From Home</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
          </div>

          {single.status === "leave" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type</label>
              <select value={single.leaveType} onChange={(e) => setSingle({ ...single, leaveType: e.target.value })} className={inputCls}>
                <option value="">None — unpaid (counts as LOP)</option>
                <option value="sick">Sick Leave (paid)</option>
                <option value="casual">Casual Leave (paid)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-in Time</label>
              <input
                type="time"
                value={single.checkIn}
                disabled={singleIsLeave}
                onChange={(e) => {
                  const checkIn = e.target.value;
                  setSingle((s) => {
                    // Auto-apply the late rule from the employee's assigned start,
                    // unless this is a Leave/WFH day (those keep their status).
                    const worked = s.status !== "leave" && s.status !== "wfh" && s.status !== "holiday";
                    return {
                      ...s,
                      checkIn,
                      status: worked ? deriveWorkStatus(checkIn, selectedEmp?.workStartTime) : s.status,
                    };
                  });
                }}
                className={inputCls}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-out Time</label>
              <input type="time" value={single.checkOut} disabled={singleIsLeave} onChange={(e) => setSingle({ ...single, checkOut: e.target.value })} className={inputCls} />
            </div>
          </div>

          {selectedEmp && !singleIsLeave && (
            <p className="text-xs text-slate-500 mb-2">
              Assigned hours: <span className="font-semibold text-slate-600">{selectedEmp.workStartTime || "09:30"} – {selectedEmp.workEndTime || "18:00"}</span>
              {" · "}status auto-set from check-in vs the start time (you can override it above).
            </p>
          )}

          <div className="mb-2">
            {/* Available on every status, leave included. */}
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={single.lopChecked}
                onChange={(e) => setSingle({ ...single, lopChecked: e.target.checked, lop: e.target.checked ? single.lop : "" })}
                className="h-4 w-4 accent-brand-600"
              />
              Loss of Pay (LOP)
            </label>
            {/* Amount and reason appear together, only once LOP is ticked. */}
            {single.lopChecked && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={single.lop}
                  onChange={(e) => setSingle({ ...single, lop: e.target.value })}
                  placeholder="How much LOP (days)"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={single.lopReason}
                  onChange={(e) => setSingle({ ...single, lopReason: e.target.value })}
                  placeholder="Reason for LOP"
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {single.status === "wfh" && (
            <p className="text-xs text-brand-600 mb-3">{STATUS_HINTS[single.status]}</p>
          )}

          {single.status !== "wfh" && (
            <p className="text-xs text-brand-600 mb-3">{STATUS_HINTS[single.status]}</p>
          )}

          {singleIsLeave && (
            <p className="text-xs text-slate-500 mb-3">
              Check-in/out are not required for a full leave day.
            </p>
          )}

          {singleLoading && (
            <p className="text-xs text-slate-400 mb-2">Loading attendance for this date…</p>
          )}

          {singleExisting && (
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 my-3">
              <WarningIcon title="Attendance already exists" />
              <p className="text-sm text-brand-800">
                Loaded existing attendance for <span className="font-semibold">{selectedEmp?.name}</span> on this date
                (status: <span className="font-semibold capitalize">{singleExisting.leaveType ? `${singleExisting.leaveType} leave` : singleExisting.status}</span>).
                Edit any field and save to <span className="font-semibold">update</span> it.
              </p>
            </div>
          )}

          {singleError && <p className="text-sm text-rose-600 mb-3">{singleError}</p>}

          <div className="flex gap-3 mt-2">
            <Button color="green" onClick={handleSingleSave} loading={saving}>
              {isEdit ? "Update Attendance" : singleExisting ? "Update Existing Record" : "Save Attendance"}
            </Button>
            <Button color="gray" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ---------- BULK: all employees for one selected date ---------- */}
      {mode === "bulk" && !isEdit && (
        <div>
          {/* Single date picker for the whole section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <label className="text-sm font-semibold text-slate-700">Date</label>
            <input
              type="date"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
            />
            <span className="text-xs text-slate-500 sm:ml-2">
              Existing records are pre-filled — edit any row and save to update that day.
            </span>
          </div>

          {bulkLoading ? (
            <p className="text-center text-sm text-slate-500 py-8">Loading attendance for this date…</p>
          ) : (
            <div className="overflow-x-auto scrollbar-slim">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_1.6fr_1fr] gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Employee</span><span>Check-in</span><span>Check-out</span><span>Leave Type</span><span>LOP</span><span>Status</span>
                </div>

                <div className="space-y-1 max-h-[46vh] overflow-y-auto scrollbar-slim pr-1">
                  {employees.map((emp) => {
                    const row = rowOf(emp._id);
                    const isLeave = row.status === "leave";
                    return (
                      <div
                        key={emp._id}
                        className={`grid grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_1.6fr_1fr] gap-2 items-center rounded-lg px-2 py-1.5 ${row.existingId ? "bg-brand-50/50" : "hover:bg-slate-50"}`}
                      >
                        <span className="text-sm text-slate-700 truncate">{emp.name}</span>
                        <input
                          type="time"
                          value={row.checkIn}
                          disabled={isLeave}
                          onChange={(e) => {
                            const checkIn = e.target.value;
                            setBulk((prev) => {
                              const cur = prev[emp._id] || emptyRow;
                              // Auto-apply the late rule from this employee's start,
                              // leaving Leave/WFH rows untouched.
                              const worked = cur.status !== "leave" && cur.status !== "wfh" && cur.status !== "holiday";
                              return {
                                ...prev,
                                [emp._id]: {
                                  ...cur,
                                  checkIn,
                                  status: worked ? deriveWorkStatus(checkIn, emp.workStartTime) : cur.status,
                                },
                              };
                            });
                          }}
                          className={cellCls}
                        />
                        <input type="time" value={row.checkOut} disabled={isLeave} onChange={(e) => setRow(emp._id, "checkOut", e.target.value)} className={cellCls} />
                        <select value={row.leaveType} disabled={!isLeave} onChange={(e) => setRow(emp._id, "leaveType", e.target.value)} className={cellCls}>
                          <option value="">None</option>
                          <option value="sick">Sick</option>
                          <option value="casual">Casual</option>
                        </select>
                        <div className="flex items-center gap-1.5">
                          {/* Available on every status, leave included. */}
                          <input
                            type="checkbox"
                            checked={row.lopChecked}
                            onChange={(e) => setRow(emp._id, "lopChecked", e.target.checked)}
                            className="h-4 w-4 accent-brand-600 shrink-0"
                            title="Loss of Pay"
                          />
                          {row.lopChecked && (
                            <>
                              <input type="number" min="0" step="0.5" value={row.lop} placeholder="0" onChange={(e) => setRow(emp._id, "lop", e.target.value)} className="w-14 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" />
                              <input type="text" value={row.lopReason} placeholder="Reason" title="Reason for LOP" onChange={(e) => setRow(emp._id, "lopReason", e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" />
                            </>
                          )}
                        </div>
                        <select value={row.status} onChange={(e) => setRowStatus(emp._id, e.target.value)} className={cellCls}>
                          <option value="">—</option>
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="half-day">Half Day</option>
                          <option value="leave">Full Leave</option>
                          <option value="wfh">WFH</option>
                          <option value="holiday">Holiday</option>
                        </select>
                      </div>
                    );
                  })}
                  {employees.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-6">No employees found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button color="green" onClick={handleBulkSave} loading={saving}>Save Attendance</Button>
            <Button color="gray" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AttendanceFormModal;

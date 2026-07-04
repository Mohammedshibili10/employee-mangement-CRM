import { useState, useEffect } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import { updateSalaryReportApi } from "../../api/salaryApi.js";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const DEDUCTIONS = [
  { key: "lateDeduction", label: "Late Deduction" },
  { key: "salaryAdvance", label: "Salary Advance" },
  { key: "wfhDeduction", label: "WFH Deduction" },
  { key: "officeExpenses", label: "Office Expenses" },
  { key: "assetDeduction", label: "Asset Deduction" },
];

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-bold text-slate-800" : "font-medium text-slate-700"}>{value}</span>
    </div>
  );
}

function SalaryDetailModal({ report, onClose, onSaved }) {
  const [ded, setDed] = useState({});
  const [workingDays, setWorkingDays] = useState(0);
  const [attendanceDays, setAttendanceDays] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setWorkingDays(report.monthlyWorkingDays || 0);
      setAttendanceDays(report.attendanceDays || 0);
      setDed({
        lateDeduction: report.lateDeduction || 0,
        salaryAdvance: report.salaryAdvance || 0,
        wfhDeduction: report.wfhDeduction || 0,
        officeExpenses: report.officeExpenses || 0,
        assetDeduction: report.assetDeduction || 0,
      });
    }
  }, [report]);

  if (!report) return null;

  // Live recompute of earnings + pay when working days or attendance days is edited.
  // Sick/Casual leave are paid and excluded from LOP.
  const wd = Number(workingDays) || 0;
  const attDays = Number(attendanceDays) || 0;
  const sick = report.sickLeaveDays || 0;
  const casual = report.casualLeaveDays || 0;
  // Paid-leave policy: up to 1 sick + 1 casual paid; extra leave is LOP.
  const paidLeave = Math.min(sick, 1) + Math.min(casual, 1);
  const accounted = attDays + paidLeave;

  // Gross Salary = ROUND((Monthly Salary / Working Days) * Attendance, 1) — mirrors the backend.
  const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const liveGross = wd > 0 ? round1(((report.monthlySalary || 0) / wd) * attDays) : 0;
  const liveBasic = Math.round(liveGross * 0.5);
  const liveHra = Math.round(liveGross * 0.2);
  // LTA = ROUND(Basic Pay * 10 / 100, 2) — always 10% of Basic Pay.
  const liveLta = round2(liveBasic * 0.1);
  const liveSpecial = round1(liveGross - liveBasic - liveHra - liveLta);

  // A full day's pay is based on the monthly salary, not the prorated gross
  // (mirrors the backend) — so Actual Pay isn't prorated by attendance twice.
  const perDay = wd > 0 ? (report.monthlySalary || 0) / wd : 0;
  const liveActualPay = Math.round(perDay * Math.min(accounted, wd));
  const liveLop = Math.max(0, wd - accounted);
  // Recorded LOP (from the LOP module) — a full day's pay per recorded LOP day.
  const recordedLopDays = report.lopDays || 0;
  const liveLopDeduction = Math.round(perDay * recordedLopDays);
  const fixedDeductions = DEDUCTIONS.reduce((sum, d) => sum + (Number(ded[d.key]) || 0), 0);
  const totalDeductions = fixedDeductions + liveLopDeduction;
  const netPay = Math.round(liveActualPay - totalDeductions);

  async function save(extra = {}) {
    try {
      setSaving(true);
      const payload = { ...ded, ...extra };
      // Send the (possibly edited) working days + attendance days on normal saves,
      // but not when recalculating — recalculate re-derives both from attendance.
      if (!extra.recalculate) {
        payload.monthlyWorkingDays = wd;
        payload.attendanceDays = attDays;
      }
      const data = await updateSalaryReportApi(report._id, payload);
      onSaved(data.report);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update salary report.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={!!report} onClose={onClose} title="Salary Breakdown" size="xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800">{report.employeeName}</h3>
          <p className="text-sm text-slate-500">
            {report.empId} · {report.departmentName || "—"} · {MONTHS[report.month]} {report.year}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${report.status === "paid" ? "bg-brand-100 text-brand-700" : "bg-amber-100 text-amber-700"}`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Earnings + attendance */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Earnings</h4>
          <Row label="Monthly Salary" value={money(report.monthlySalary)} />
          <Row label="Basic Pay" value={money(liveBasic)} />
          <Row label="HRA" value={money(liveHra)} />
          <Row label="LTA" value={money(liveLta)} />
          <Row label="Special Allowance" value={money(liveSpecial)} />
          <div className="border-t border-slate-100 mt-1 pt-1">
            <Row label="Gross Salary" value={money(liveGross)} strong />
          </div>

          <h4 className="font-bold text-slate-800 mt-4 mb-2 text-sm uppercase tracking-wider">Attendance</h4>
          <div className="flex items-center justify-between py-1.5">
            <label className="text-sm text-slate-500">Working Days</label>
            <input
              type="number"
              min="0"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-right focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <label className="text-sm text-slate-500">Attendance Days</label>
            <input
              type="number"
              min="0"
              value={attendanceDays}
              onChange={(e) => setAttendanceDays(e.target.value)}
              className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-right focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <Row label="Sick Leave (taken)" value={sick} />
          <Row label="Casual Leave (taken)" value={casual} />
          <Row label="Total Paid Leave (max 2)" value={paidLeave} strong />
          <Row label="LOP (Loss of Pay)" value={liveLop} />
          <Row label="Actual Pay" value={money(liveActualPay)} strong />
        </div>

        {/* Editable deductions */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Deductions</h4>
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-slate-500">
              LOP Deduction{recordedLopDays > 0 ? ` (${recordedLopDays} day${recordedLopDays === 1 ? "" : "s"})` : ""}
            </span>
            <span className="font-medium text-slate-700">{money(liveLopDeduction)}</span>
          </div>
          {DEDUCTIONS.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-3 py-1.5">
              <label className="text-sm text-slate-500">{d.label}</label>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  value={ded[d.key]}
                  onChange={(e) => setDed({ ...ded, [d.key]: e.target.value })}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-right focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <Row label="Total Deductions" value={money(totalDeductions)} />
          </div>

          <div className="mt-4 rounded-xl bg-brand-gradient-soft border border-brand-200 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Net Pay</p>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">{money(netPay)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <Button color="green" onClick={() => save()} loading={saving}>Save Changes</Button>
        <Button color="gray" onClick={() => save({ recalculate: true })}>Recalculate from Attendance</Button>
        <Button
          color={report.status === "paid" ? "gray" : "green"}
          onClick={() => save({ status: report.status === "paid" ? "pending" : "paid" })}
        >
          {report.status === "paid" ? "Mark as Pending" : "Mark as Paid"}
        </Button>
        <Button color="gray" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

export default SalaryDetailModal;

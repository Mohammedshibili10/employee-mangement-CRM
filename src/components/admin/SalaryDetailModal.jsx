import { useState } from "react";
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
  const [saving, setSaving] = useState(false);

  if (!report) return null;

  // Read-only view — all values come straight from the (system-computed) report.
  const sick = report.sickLeaveDays || 0;
  const casual = report.casualLeaveDays || 0;
  const paidLeave = Math.min(sick, 1) + Math.min(casual, 1);
  const recordedLopDays = report.lopDays || 0;
  const fixedDeductions = DEDUCTIONS.reduce((sum, d) => sum + (Number(report[d.key]) || 0), 0);
  const totalDeductions = (report.lopDeduction || 0) + fixedDeductions;

  async function save(extra) {
    try {
      setSaving(true);
      const data = await updateSalaryReportApi(report._id, extra);
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

      <p className="text-xs text-slate-400 mb-3">This breakdown is read-only — values are calculated automatically from attendance, LOP and salary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Earnings + attendance */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Earnings</h4>
          <Row label="Monthly Salary" value={money(report.monthlySalary)} />
          <Row label="Basic Pay" value={money(report.basicPay)} />
          <Row label="HRA" value={money(report.hra)} />
          <Row label="LTA" value={money(report.lta)} />
          <Row label="Special Allowance" value={money(report.specialAllowance)} />
          <div className="border-t border-slate-100 mt-1 pt-1">
            <Row label="Gross Salary" value={money(report.grossSalary)} strong />
          </div>

          <h4 className="font-bold text-slate-800 mt-4 mb-2 text-sm uppercase tracking-wider">Attendance</h4>
          <Row label="Working Days" value={report.monthlyWorkingDays} strong />
          <Row label="Attendance Days" value={report.attendanceDays} />
          <Row label="Sick Leave (taken)" value={sick} />
          <Row label="Casual Leave (taken)" value={casual} />
          <Row label="Total Paid Leave (max 2)" value={paidLeave} strong />
          <Row label="LOP (Loss of Pay)" value={(report.lop || 0) + (report.lopDays || 0)} />
          <Row label="Actual Pay" value={money(report.actualPay)} strong />
        </div>

        {/* Deductions (read-only) */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Deductions</h4>
          <Row
            label={`LOP Deduction${recordedLopDays > 0 ? ` (${recordedLopDays} day${recordedLopDays === 1 ? "" : "s"})` : ""}`}
            value={money(report.lopDeduction)}
          />
          {DEDUCTIONS.map((d) => (
            <Row key={d.key} label={d.label} value={money(report[d.key])} />
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <Row label="Total Deductions" value={money(totalDeductions)} />
          </div>

          <div className="mt-4 rounded-xl bg-brand-gradient-soft border border-brand-200 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Net Pay</p>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">{money(report.netPay)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <Button color="gray" onClick={() => save({ recalculate: true })} loading={saving}>Recalculate from Attendance</Button>
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

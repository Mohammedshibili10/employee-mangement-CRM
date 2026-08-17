
// Dependency-free export of the daily attendance report.
//  - Excel: an HTML table saved as a real .xls file (Excel opens it as a sheet).
//  - PDF: a clean print-ready page where the user chooses "Save as PDF".

import { formatDate as fmtDate } from './formatDate.js';

function fmtTime(v) {
  return v ? new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
}
function statusLabel(r) {
  if (r.status === "leave" && r.leaveType) return `${r.leaveType} leave`;
  return r.status || "-";
}
function overtimeLabel(r) {
  if (!r.overtime || !r.overtimeMinutes) return "-";
  const h = Math.floor(r.overtimeMinutes / 60);
  const m = r.overtimeMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Punctuality for the export follows each EMPLOYEE'S own start time: a check-in
// later than their start is "Late", at or before it is "On Time". No check-in
// (leave/absent) -> blank. Falls back to 09:30 when no custom start is set.
function startMinutes(r) {
  const m = String(r.employee?.workStartTime || "09:30").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 9 * 60 + 30;
}
function lateStatus(r) {
  if (!r.checkIn) return "-";
  const d = new Date(r.checkIn);
  const minutesOfDay = d.getHours() * 60 + d.getMinutes();
  return minutesOfDay > startMinutes(r) ? "Late" : "On Time";
}

// Columns match the on-screen attendance table (plus Employee ID and the
// 9:30 AM Late Status column).
const COLUMNS = [
  { header: "Emp ID", get: (r) => r.employee?.empId || "-" },
  { header: "Name", get: (r) => r.employee?.name || "-" },
  { header: "Department", get: (r) => r.employee?.department?.name || "-" },
  { header: "Date", get: (r) => fmtDate(r.date) },
  { header: "Check In", get: (r) => fmtTime(r.checkIn) },
  { header: "Check Out", get: (r) => fmtTime(r.checkOut) },
  { header: "Status", get: (r) => statusLabel(r) },
  { header: "Late Status", get: (r) => lateStatus(r) },
  { header: "LOP", get: (r) => r.lop ?? 0 },
  { header: "Overtime", get: (r) => overtimeLabel(r) },
];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function buildTableHtml(rows) {
  const head = COLUMNS.map((c) => `<th>${c.header}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${COLUMNS.map((c) => `<td>${escapeHtml(c.get(r))}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function safeName(label) {
  return String(label).replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "");
}

// Trigger a browser download for a Blob.
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAttendanceExcel(rows, dateLabel) {
  const html =
    `<html><head><meta charset="utf-8" /></head><body>` +
    `<h3>Daily Attendance Report — ${escapeHtml(dateLabel)}</h3>` +
    buildTableHtml(rows) +
    `</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  download(blob, `Attendance_${safeName(dateLabel)}.xls`);
}

export function exportAttendancePDF(rows, dateLabel) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this site to export the PDF.");
    return;
  }
  win.document.write(
    `<html><head><title>Attendance — ${escapeHtml(dateLabel)}</title>
     <style>
       body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #1e293b; }
       h3 { margin: 0 0 16px; }
       table { width: 100%; border-collapse: collapse; font-size: 12px; }
       th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
       th { background: #f1f5f9; }
       @media print { body { padding: 0; } }
     </style></head><body>
     <h3>Daily Attendance Report — ${escapeHtml(dateLabel)}</h3>
     ${buildTableHtml(rows)}
     </body></html>`
  );
  win.document.close();
  // Let the new window render before opening the print dialog.
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}

import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";

function statusClass(status) {
  if (status === "present") return "bg-brand-100 text-brand-700";
  if (status === "late") return "bg-amber-100 text-amber-700";
  if (status === "absent") return "bg-rose-100 text-rose-700";
  if (status === "leave") return "bg-sky-100 text-sky-700";
  if (status === "wfh") return "bg-purple-100 text-purple-700";
  if (status === "holiday") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-500";
}

// Show "Sick Leave" / "Casual Leave" for leave records; otherwise the status.
function statusLabel(row) {
  if (row.status === "leave" && row.leaveType) return `${row.leaveType} leave`;
  if (row.status === "wfh") return "WFH";
  if (row.status === "holiday") return "Holiday";
  return row.status;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
}

function formatOvertime(row) {
  if (!row.overtime || !row.overtimeMinutes) return "-";
  const h = Math.floor(row.overtimeMinutes / 60);
  const m = row.overtimeMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function AttendanceTable({ records, onEdit }) {
  const headers = ["Name", "Department", "Date", "Check In", "Check Out", "Status", "LOP", "Overtime"];
  if (onEdit) headers.push("Actions");

  return (
    <Table headers={headers}>
      {records.map((row) => (
        <tr key={row._id} className="hover:bg-brand-50/40 transition-colors">
          <td className="px-4 py-3 font-semibold text-slate-800">{row.employee?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{row.employee?.department?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
          <td className="px-4 py-3 text-slate-600">{formatTime(row.checkIn)}</td>
          <td className="px-4 py-3 text-slate-600">{formatTime(row.checkOut)}</td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(row.status)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {statusLabel(row)}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-600">{row.lop ? row.lop : "-"}</td>
          <td className="px-4 py-3 text-slate-600">{formatOvertime(row)}</td>
          {onEdit && (
            <td className="px-4 py-3">
              <ActionButton color="blue" icon="edit" title="Edit" onClick={() => onEdit(row)} />
            </td>
          )}
        </tr>
      ))}
    </Table>
  );
}

export default AttendanceTable;

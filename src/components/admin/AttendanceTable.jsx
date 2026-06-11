import Table from "../common/Table.jsx";

function statusClass(status) {
  if (status === "present") return "bg-brand-100 text-brand-700";
  if (status === "late") return "bg-amber-100 text-amber-700";
  if (status === "absent") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-500";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function formatOvertime(row) {
  if (!row.overtime || !row.overtimeMinutes) return "-";
  const h = Math.floor(row.overtimeMinutes / 60);
  const m = row.overtimeMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function AttendanceTable({ records }) {
  return (
    <Table headers={["Name", "Department", "Date", "Check In", "Check Out", "Status", "Overtime"]}>
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
              {row.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-600">{formatOvertime(row)}</td>
        </tr>
      ))}
    </Table>
  );
}

export default AttendanceTable;

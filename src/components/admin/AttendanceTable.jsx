import Table from "../common/Table.jsx";

function statusClass(status) {
  if (status === "present") return "bg-green-100 text-green-700";
  if (status === "late") return "bg-amber-100 text-amber-700";
  if (status === "absent") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
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
        <tr key={row._id} className="hover:bg-slate-50">
          <td className="px-4 py-3 font-medium text-slate-800">{row.employee?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{row.employee?.department?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
          <td className="px-4 py-3 text-slate-600">{formatTime(row.checkIn)}</td>
          <td className="px-4 py-3 text-slate-600">{formatTime(row.checkOut)}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
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

import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";

// Backend stores status in lowercase: pending / approved / rejected.
function statusClass(status) {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700"; // pending
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

// Shows leave requests.
// onApprove / onReject are called with the request id.
function LeaveRequestTable({ requests, onApprove, onReject }) {
  return (
    <Table headers={["Name", "Type", "From", "To", "Reason", "Status", "Actions"]}>
      {requests.map((req) => (
        <tr key={req._id} className="hover:bg-slate-50">
          <td className="px-4 py-3 font-medium text-slate-800">{req.employee?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{req.type}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(req.from)}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(req.to)}</td>
          <td className="px-4 py-3 text-slate-600">
            <span className="block max-w-[16rem] truncate" title={req.reason}>{req.reason}</span>
          </td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(req.status)}`}>
              {req.status}
            </span>
          </td>
          <td className="px-4 py-3 space-x-2">
            {req.status === "pending" ? (
              <>
                <ActionButton color="green" onClick={() => onApprove(req._id)}>
                  Approve
                </ActionButton>
                <ActionButton color="red" onClick={() => onReject(req._id)}>
                  Reject
                </ActionButton>
              </>
            ) : (
              <span className="text-slate-400 text-sm">—</span>
            )}
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default LeaveRequestTable;

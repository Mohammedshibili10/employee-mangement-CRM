import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";

function EmployeeTable({ employees, onView, onDelete }) {

  return (
    <Table headers={["Emp ID", "Name", "Email", "Department", "Designation", "Status", "Actions"]}>
      {employees.map((emp) => (
        <tr key={emp._id} className="hover:bg-brand-50/40 transition-colors">
          <td className="px-4 py-3">
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {emp.empId}
            </span>
          </td>
          <td className="px-4 py-3 font-semibold text-slate-800">{emp.name}</td>
          <td className="px-4 py-3 text-slate-600">{emp.email}</td>

          <td className="px-4 py-3 text-slate-600">{emp.department?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{emp.designation}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                emp.status === "active"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {emp.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1.5">
              <ActionButton color="green" icon="view" title="View" onClick={() => onView(emp)} />
              <ActionButton color="red" icon="delete" title="Delete" onClick={() => onDelete(emp._id)} />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default EmployeeTable;

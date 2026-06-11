import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";




function EmployeeTable({ employees, onView, onDelete }) {

  return (
    <Table headers={["Emp ID", "Name", "Email", "Department", "Designation", "Status", "Actions"]}>
      {employees.map((emp) => (
        <tr key={emp._id} className="hover:bg-slate-50">
          <td className="px-4 py-3">
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {emp.empId}
            </span>
          </td>
          <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
          <td className="px-4 py-3 text-slate-600">{emp.email}</td>
          {/* department is populated from the backend, so it's an object */}
          <td className="px-4 py-3 text-slate-600">{emp.department?.name || "-"}</td>
          <td className="px-4 py-3 text-slate-600">{emp.designation}</td>
          <td className="px-4 py-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                emp.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {emp.status}
            </span>
          </td>
          <td className="px-4 py-3 space-x-2">
            <ActionButton color="green" onClick={() => onView(emp)}>
              View
            </ActionButton>
            <ActionButton color="red" onClick={() => onDelete(emp._id)}>
              Delete
            </ActionButton>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default EmployeeTable;

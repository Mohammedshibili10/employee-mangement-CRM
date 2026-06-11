import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";

function DepartmentTable({ departments, onEdit, onDelete }) {
  return (
    <Table headers={["Department", "Head", "Employees", "Actions"]}>
      {departments.map((dept) => (
        <tr key={dept._id} className="hover:bg-brand-50/40 transition-colors">
          <td className="px-4 py-3 font-semibold text-slate-800">{dept.name}</td>
          <td className="px-4 py-3 text-slate-600">{dept.head}</td>
          <td className="px-4 py-3 text-slate-600">{dept.employeeCount}</td>
          <td className="px-4 py-3 space-x-2">
            <ActionButton color="blue" onClick={() => onEdit(dept)}>
              Edit
            </ActionButton>
            <ActionButton color="red" onClick={() => onDelete(dept._id)}>
              Delete
            </ActionButton>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default DepartmentTable;

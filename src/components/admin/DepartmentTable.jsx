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
          <td className="px-4 py-3">
            <div className="flex items-center gap-1.5">
              <ActionButton color="blue" icon="edit" title="Edit" onClick={() => onEdit(dept)} />
              <ActionButton color="red" icon="delete" title="Delete" onClick={() => onDelete(dept._id)} />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default DepartmentTable;

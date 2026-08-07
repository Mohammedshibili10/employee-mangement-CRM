import { useState, useMemo } from "react";
import Table from "../common/Table.jsx";
import ActionButton from "../common/ActionButton.jsx";

function EmployeeTable({ employees, onView, onDelete }) {
  // null = the order the list arrived in; clicking the header starts at
  // ascending, then toggles between ascending and descending.
  const [sortDir, setSortDir] = useState(null);

  const toggleSort = () => setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));

  const rows = useMemo(() => {
    if (!sortDir) return employees;
    // `numeric` so RAC2E sorts before RAC10E — a plain string compare would put
    // RAC10E first as soon as the IDs stop being zero-padded to the same width.
    const byEmpId = (a, b) =>
      String(a.empId || "").localeCompare(String(b.empId || ""), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    const sorted = [...employees].sort(byEmpId);
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [employees, sortDir]);

  const empIdHeader = (
    <button
      type="button"
      onClick={toggleSort}
      title={`Sort by Employee ID (${sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "click to sort"})`}
      aria-sort={sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"}
      className="inline-flex items-center gap-1 uppercase tracking-wider select-none hover:text-slate-700 transition-colors"
    >
      Emp ID
      <span className={`text-[9px] leading-none ${sortDir ? "text-brand-600" : "text-slate-300"}`}>
        {sortDir === "desc" ? "▼" : "▲"}
      </span>
    </button>
  );

  return (
    <Table headers={[empIdHeader, "Name", "Email", "Department", "Designation", "Status", "Actions"]}>
      {rows.map((emp) => (
        <tr key={emp._id} className="hover:bg-brand-50/40 transition-colors">
          <td className="px-4 py-3">
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {emp.empId}
            </span>
          </td>
          <td className="px-4 py-3 font-semibold text-slate-800">
            {emp.name}
            {/* Probation employees are flagged (P); permanent ones carry no label. */}
            {emp.employmentStatus === "probation" && (
              <span
                title="On probation — no paid-leave allowance"
                className="ml-1.5 text-xs font-bold text-amber-600"
              >
                (P)
              </span>
            )}
          </td>
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

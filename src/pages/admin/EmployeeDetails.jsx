import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import OnboardingStatus from "../../components/admin/OnboardingStatus.jsx";
import { getEmployeeApi } from "../../api/employeeApi.js";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployeeApi(id);
        setEmployee(data.employee);
      } catch (err) {
        console.error("Failed to load employee:", err);
        setError(err.response?.data?.message || "Employee not found.");
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
  }, [id]);

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );

  if (loading) {
    return <p className="text-slate-500">Loading employee...</p>;
  }

  if (error || !employee) {
    return (
      <div>
        <p className="text-slate-600">{error || "Employee not found."}</p>
        <div className="mt-4">
          <Button color="gray" onClick={() => navigate("/admin/employees")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const joiningDate = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString()
    : "-";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Employee Details</h2>
        <Button color="gray" onClick={() => navigate("/admin/employees")}>Back</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-500">{employee.designation}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
            {employee.empId}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              employee.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {employee.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Personal Information</h3>
            <Row label="Email" value={employee.email} />
            <Row label="Phone" value={employee.phone} />

            <h3 className="font-semibold text-slate-800 mt-5 mb-3">Department Information</h3>
            <Row label="Department" value={employee.department?.name || "-"} />
            <Row label="Designation" value={employee.designation} />
            <Row label="Joining Date" value={joiningDate} />
          </div>
        </div>

        <OnboardingStatus onboarding={employee.onboarding || {}} />
      </div>
    </div>
  );
}

export default EmployeeDetails;

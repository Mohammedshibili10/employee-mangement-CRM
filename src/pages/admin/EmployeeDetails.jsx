import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import OnboardingStatus from "../../components/admin/OnboardingStatus.jsx";
import Skeleton, { SkeletonCard } from "../../components/common/Skeleton.jsx";
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
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6 mb-5 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Employee Details</h2>
        <Button color="gray" onClick={() => navigate("/admin/employees")}>Back</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {employee.profilePhoto ? (
          <img
            src={employee.profilePhoto}
            alt={employee.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-soft"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-brand-gradient text-white flex items-center justify-center text-2xl font-bold shadow-glow-sm">
            {employee.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-500">{employee.designation}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
            {employee.empId}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              employee.status === "active"
                ? "bg-brand-100 text-brand-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {employee.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
            <h3 className="font-bold text-slate-800 mb-3">Personal Information</h3>
            <Row label="Email" value={employee.email} />
            <Row label="Phone" value={employee.phone} />

            <h3 className="font-bold text-slate-800 mt-5 mb-3">Department Information</h3>
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

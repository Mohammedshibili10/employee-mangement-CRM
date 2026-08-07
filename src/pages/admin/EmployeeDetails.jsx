import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Skeleton, { SkeletonCard } from "../../components/common/Skeleton.jsx";
import { getEmployeeApi, updateEmployeeApi } from "../../api/employeeApi.js";
import { getDepartmentsApi } from "../../api/departmentApi.js";
import { employeeSchema, validate } from "../../validation/schemas.js";

// Turn a stored date (ISO string) into the YYYY-MM-DD a <input type="date"> needs.
function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state.
  const [departments, setDepartments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  // Load departments once, for the edit form's dropdown.
  useEffect(() => {
    getDepartmentsApi()
      .then((data) => setDepartments(data.departments))
      .catch((err) => console.error("Failed to load departments:", err));
  }, []);

  function openEdit() {
    setForm({
      empId: employee.empId || "",
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department?._id || "",
      designation: employee.designation || "",
      salary: employee.salary ?? "",
      joiningDate: toDateInput(employee.joiningDate),
      workStartTime: employee.workStartTime || "09:30",
      workEndTime: employee.workEndTime || "18:00",
      status: employee.status || "active",
      employmentStatus: employee.employmentStatus || "probation",
    });
    setFormErrors({});
    setEditOpen(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();

    const check = validate(employeeSchema, form);
    const errors = check.valid ? {} : { ...check.errors };
    if (!form.empId.trim()) {
      errors.empId = "Employee ID is required";
    }
    if (form.salary === "" || isNaN(Number(form.salary)) || Number(form.salary) < 0) {
      errors.salary = "Enter a valid salary amount";
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {
      const data = await updateEmployeeApi(employee._id, {
        empId: form.empId.trim(),
        name: form.name,
        email: form.email,
        phoneNumber: form.phone, // backend maps phoneNumber -> phone
        department: form.department,
        designation: form.designation,
        salary: Number(form.salary),
        joiningDate: form.joiningDate,
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        status: form.status,
        employmentStatus: form.employmentStatus,
      });
      // Show the freshly-saved (and populated) record immediately.
      setEmployee(data.employee);
      setEditOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update employee. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="max-w-2xl">
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

  const salary =
    employee.salary != null && employee.salary !== 0
      ? `₹${Number(employee.salary).toLocaleString()}`
      : "-";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Employee Details</h2>
        <div className="flex gap-2">
          <Button color="green" onClick={openEdit}>Edit</Button>
          <Button color="gray" onClick={() => navigate("/admin/employees")}>Back</Button>
        </div>
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

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
          <h3 className="font-bold text-slate-800 mb-3">Personal Information</h3>
          <Row label="Email" value={employee.email} />
          <Row label="Phone" value={employee.phone} />

          <h3 className="font-bold text-slate-800 mt-5 mb-3">Department Information</h3>
          <Row label="Department" value={employee.department?.name || "-"} />
          <Row label="Designation" value={employee.designation} />
          <Row label="Salary" value={salary} />
          <Row label="Joining Date" value={joiningDate} />
          <Row label="Working Hours" value={`${employee.workStartTime || "09:30"} – ${employee.workEndTime || "18:00"}`} />
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Employee" size="lg">
        {form && (
          <form onSubmit={handleSave} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <Input label="Employee ID" name="empId" value={form.empId} onChange={handleChange} error={formErrors.empId} placeholder="e.g. RAC043E" />
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} error={formErrors.name} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={formErrors.email} />
              <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={formErrors.phone} />

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    formErrors.department ? "border-rose-400 focus:ring-rose-300" : "border-slate-300 focus:ring-green-500"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-xs text-rose-600 mt-1">{formErrors.department}</p>}
              </div>

              <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} error={formErrors.designation} />
              <Input label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} error={formErrors.salary} />
              <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} error={formErrors.joiningDate} />
              <Input label="Work Start Time" name="workStartTime" type="time" value={form.workStartTime} onChange={handleChange} error={formErrors.workStartTime} />
              <Input label="Work End Time" name="workEndTime" type="time" value={form.workEndTime} onChange={handleChange} error={formErrors.workEndTime} />

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
                <select
                  name="employmentStatus"
                  value={form.employmentStatus}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="probation">Probation</option>
                  <option value="permanent">Permanent</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Probation runs 3 months. While on probation there is no paid-leave
                  allowance — every leave day is loss of pay.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button type="submit" color="green" loading={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button color="gray" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default EmployeeDetails;

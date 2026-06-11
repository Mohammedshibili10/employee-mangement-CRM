import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../../components/admin/EmployeeTable.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import { getEmployeesApi, createEmployeeApi, deleteEmployeeApi } from "../../api/employeeApi.js";
import { getDepartmentsApi } from "../../api/departmentApi.js";
import { employeeSchema, validate } from "../../validation/schemas.js";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  status: "active",
  sendWhatsApp: true,
};

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [created, setCreated] = useState(null);

  function openAdd() {
    setForm(emptyForm);
    setFormErrors({});
    setAddOpen(true);
  }

  function closeAdd() {
    setFormErrors({});
    setAddOpen(false);
  }

  useEffect(() => {
    fetchEmployees();
    loadDepartments();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeesApi();
      setEmployees(data.employees);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(err.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const data = await getDepartmentsApi();
      setDepartments(data.departments);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();

    const check = validate(employeeSchema, form);
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {

      const data = await createEmployeeApi({
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        department: form.department,
        designation: form.designation,
        joiningDate: form.joiningDate,
        status: form.status,
        sendWhatsApp: form.sendWhatsApp,
      });
      await fetchEmployees();
      setForm(emptyForm);
      setAddOpen(false);
      setCreated(data.employee);
    } catch (err) {

      alert(err.response?.data?.message || "Failed to add employee. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEmployeeApi(id);
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert(err.response?.data?.message || "Failed to delete employee.");
    }
  }

  const filtered = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || emp.status === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
        <Button color="green" onClick={openAdd}>
          + Add Employee
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee..."
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {loading && (
        <p className="text-center text-slate-500 mt-6">Loading employees...</p>
      )}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <EmployeeTable
            employees={filtered}
            onView={(emp) => navigate(`/admin/employees/${emp._id}`)}
            onDelete={(id) => handleDelete(id)}
          />

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No employees found.</p>
          )}
        </>
      )}

      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title="Add Employee"
        size="lg"
      >
        <form onSubmit={handleAdd} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" error={formErrors.name} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" error={formErrors.email} />

            <Input label="Login Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" error={formErrors.password} />

            <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" error={formErrors.phone} />

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

            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} placeholder="Developer" error={formErrors.designation} />
            <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} error={formErrors.joiningDate} />

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

          <label className="flex items-center gap-2 mb-1 mt-1 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sendWhatsApp}
              onChange={(e) => setForm({ ...form, sendWhatsApp: e.target.checked })}
              className="h-4 w-4 accent-green-600"
            />
            Send WhatsApp Invitation
          </label>

          <div className="flex gap-3 mt-4">
            <Button type="submit" color="green">{saving ? "Saving..." : "Create Employee"}</Button>
            <Button color="gray" onClick={closeAdd}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={created !== null}
        onClose={() => setCreated(null)}
        title="Employee Created"
      >
        {created && (
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mb-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Employee Created Successfully
            </h3>

            <div className="bg-slate-50 rounded-lg p-4 mt-4 text-left text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Name</span>
                <span className="font-medium text-slate-800">{created.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Employee ID</span>
                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                  {created.empId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-medium text-slate-800">{created.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WhatsApp Invitation</span>
                {created.whatsappSent ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Sent
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">
                    Not sent
                  </span>
                )}
              </div>
            </div>

            {created.whatsappSent && (
              <p className="text-xs text-slate-500 mt-3">
                Invitation sent to {created.phone}
              </p>
            )}

            <div className="flex gap-3 justify-center mt-5">
              <Button
                color="green"
                onClick={() => {
                  const id = created._id;
                  setCreated(null);
                  navigate(`/admin/employees/${id}`);
                }}
              >
                View Employee
              </Button>
              <Button color="gray" onClick={() => setCreated(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Employees;

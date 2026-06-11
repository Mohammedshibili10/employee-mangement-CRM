import { useState, useEffect } from "react";
import DepartmentTable from "../../components/admin/DepartmentTable.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../../api/departmentApi.js";
import { getEmployeesApi } from "../../api/employeeApi.js";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", head: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [deptRes, empRes] = await Promise.all([
        getDepartmentsApi(),
        getEmployeesApi(),
      ]);
      setDepartments(deptRes.departments);
      setEmployees(empRes.employees);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError(err.response?.data?.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }

  const departmentsWithCounts = departments.map((d) => ({
    ...d,
    employeeCount: employees.filter((e) => e.department?._id === d._id).length,
  }));

  function openAdd() {
    setEditing(null);
    setForm({ name: "", head: "" });
    setIsOpen(true);
  }

  function openEdit(dept) {
    setEditing(dept);
    setForm({ name: dept.name, head: dept.head });
    setIsOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDepartmentApi(editing._id, { name: form.name, head: form.head });
      } else {
        await createDepartmentApi({ name: form.name, head: form.head });
      }
      await fetchData();
      setIsOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save department. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDepartmentApi(id);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete department:", err);
      alert(err.response?.data?.message || "Failed to delete department.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
        <Button color="green" onClick={openAdd}>+ Add Department</Button>
      </div>

      {loading && (
        <p className="text-center text-slate-500 mt-6">Loading departments...</p>
      )}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <DepartmentTable
          departments={departmentsWithCounts}
          onEdit={openEdit}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Engineering"
          />
          <Input
            label="Department Head"
            value={form.head}
            onChange={(e) => setForm({ ...form, head: e.target.value })}
            placeholder="Manager name"
          />
          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green">{saving ? "Saving..." : "Save"}</Button>
            <Button color="gray" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Departments;

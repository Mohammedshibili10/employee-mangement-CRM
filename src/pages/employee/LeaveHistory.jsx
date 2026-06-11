import { useState, useEffect } from "react";
import Table from "../../components/common/Table.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { getMeApi } from "../../api/authApi.js";
import { getLeavesApi, applyLeaveApi } from "../../api/leaveApi.js";
import { leaveSchema, validate } from "../../validation/schemas.js";

function statusClass(status) {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

const emptyForm = { type: "sick", from: "", to: "", reason: "" };

function LeaveHistory() {
  const [employeeId, setEmployeeId] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function openModal() {
    setForm(emptyForm);
    setFormErrors({});
    setOpen(true);
  }

  function closeModal() {
    setFormErrors({});
    setOpen(false);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const me = await getMeApi();
        setEmployeeId(me.employeeId);
        if (me.employeeId) {
          await fetchLeaves(me.employeeId);
        }
      } catch (err) {
        console.error("Failed to load leave history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function fetchLeaves(id) {
    const res = await getLeavesApi(id);
    setLeaves(res.leaves || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleApply(e) {
    e.preventDefault();

    const check = validate(leaveSchema, form);
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }
    setFormErrors({});

    if (!employeeId) {
      alert("Could not find your employee profile. Please try again.");
      return;
    }
    try {
      setSaving(true);
      await applyLeaveApi({
        employee: employeeId,
        type: form.type,
        from: form.from,
        to: form.to,
        reason: form.reason,
      });
      await fetchLeaves(employeeId);
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      console.error("Failed to apply for leave:", err);
      alert(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Leave History</h2>
        <Button color="green" onClick={openModal}>+ Apply Leave</Button>
      </div>

      {loading && <p className="text-center text-slate-500 mt-6">Loading leave history...</p>}

      {!loading && (
        <>
          <Table headers={["Leave Type", "Duration", "Reason", "Status"]}>
            {leaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800 font-medium">{leave.type}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(leave.from)} → {formatDate(leave.to)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="block max-w-[16rem] truncate" title={leave.reason}>{leave.reason}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(leave.status)}`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </Table>

          {leaves.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No leave requests yet.</p>
          )}
        </>
      )}

      <Modal isOpen={open} onClose={closeModal} title="Apply Leave">
        <form onSubmit={handleApply} noValidate>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <Input label="Start Date" name="from" type="date" value={form.from} onChange={handleChange} error={formErrors.from} />
          <Input label="End Date" name="to" type="date" value={form.to} onChange={handleChange} error={formErrors.to} />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows="3"
              placeholder="Write your reason..."
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                formErrors.reason ? "border-rose-400 focus:ring-rose-300" : "border-slate-300 focus:ring-green-500"
              }`}
            />
            {formErrors.reason && <p className="text-xs text-rose-600 mt-1">{formErrors.reason}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green">{saving ? "Submitting..." : "Submit Request"}</Button>
            <Button color="gray" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LeaveHistory;

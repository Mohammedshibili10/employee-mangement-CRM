import { useState, useEffect } from "react";
import Table from "../../components/common/Table.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getMeApi } from "../../api/authApi.js";
import { getLeavesApi, applyLeaveApi } from "../../api/leaveApi.js";
import { leaveSchema, validate } from "../../validation/schemas.js";

function statusClass(status) {
  if (status === "approved") return "bg-brand-100 text-brand-700";
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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Leave History</h2>
        <Button color="green" onClick={openModal}>+ Apply Leave</Button>
      </div>

      {loading && <SkeletonTable rows={5} cols={4} />}

      {!loading && (
        <>
          <Table headers={["Leave Type", "Duration", "Reason", "Status"]}>
            {leaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-4 py-3 text-slate-800 font-semibold capitalize">{leave.type}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(leave.from)} → {formatDate(leave.to)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="block max-w-[16rem] truncate" title={leave.reason}>{leave.reason}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(leave.status)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
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
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-4 transition-all ${
                formErrors.reason
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/15"
                  : "border-slate-200 focus:border-brand-400 focus:ring-brand-500/15"
              }`}
            />
            {formErrors.reason && <p className="text-xs text-rose-600 mt-1">{formErrors.reason}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green" loading={saving}>{saving ? "Submitting..." : "Submit Request"}</Button>
            <Button color="gray" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LeaveHistory;

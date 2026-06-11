import { useState, useEffect, useRef } from "react";
import Table from "../../components/common/Table.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getTaskReportsApi, createTaskReportApi } from "../../api/taskReportApi.js";
import { taskReportSchema, validate } from "../../validation/schemas.js";

function statusClass(status) {
  if (status === "completed") return "bg-brand-100 text-brand-700";
  if (status === "in-progress") return "bg-sky-100 text-sky-700";
  return "bg-amber-100 text-amber-700"; // pending
}

function statusLabel(status) {
  if (status === "in-progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function todayStr() {
  // Local YYYY-MM-DD for the date input default.
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

const emptyForm = { title: "", description: "", date: todayStr(), status: "pending" };

function TaskReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [file, setFile] = useState(null); // { dataUrl, name }
  const fileRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const data = await getTaskReportsApi();
      setReports(data.taskReports || []);
    } catch (err) {
      console.error("Failed to load task reports:", err);
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setForm({ ...emptyForm, date: todayStr() });
    setFormErrors({});
    setFile(null);
    setOpen(true);
  }

  function closeModal() {
    setFormErrors({});
    setOpen(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      alert("File is too large. Please choose a file under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFile({ dataUrl: reader.result, name: f.name });
    reader.onerror = () => alert("Could not read the selected file.");
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const check = validate(taskReportSchema, form);
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }
    setFormErrors({});

    try {
      setSaving(true);
      await createTaskReportApi({
        title: form.title,
        description: form.description,
        date: form.date,
        status: form.status,
        file: file?.dataUrl,
        fileName: file?.name,
      });
      await fetchReports();
      setOpen(false);
      setSuccess("Task report submitted successfully!");
      // Auto-hide the success banner after a few seconds.
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to submit task report:", err);
      alert(err.response?.data?.message || "Failed to submit task report.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Task Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Submit your daily or weekly task updates.</p>
        </div>
        <Button color="green" onClick={openModal}>+ New Report</Button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-700 shadow-soft animate-fade-in-up">
          <span className="h-7 w-7 shrink-0 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-glow-sm">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {loading && <SkeletonTable rows={5} cols={5} />}

      {!loading && (
        <>
          <Table headers={["Date", "Title", "Description", "Attachment", "Status"]}>
            {reports.map((r) => (
              <tr key={r._id} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{r.title}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="block max-w-[20rem] truncate" title={r.description}>{r.description}</span>
                </td>
                <td className="px-4 py-3">
                  {r.file ? (
                    <a
                      href={r.file}
                      download={r.fileName || "attachment"}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      File
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(r.status)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </Table>

          {reports.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No task reports yet. Submit your first one!</p>
          )}
        </>
      )}

      <Modal isOpen={open} onClose={closeModal} title="New Task Report" size="lg">
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Task Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Implemented login page"
            error={formErrors.title}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Task Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what you worked on..."
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-4 transition-all ${
                formErrors.description
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/15"
                  : "border-slate-200 focus:border-brand-400 focus:ring-brand-500/15"
              }`}
            />
            {formErrors.description && <p className="text-xs text-rose-600 mt-1.5">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={formErrors.date}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Optional file upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Attachment <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFile}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-700 truncate">
                  <svg className="h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                  </svg>
                  <span className="truncate">{file.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs font-medium text-rose-600 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-200 px-3.5 py-3 text-sm text-slate-500 hover:border-brand-300 hover:bg-brand-50/40 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Upload screenshot or document
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="submit" color="green" loading={saving}>
              {saving ? "Submitting..." : "Submit Report"}
            </Button>
            <Button color="gray" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TaskReports;

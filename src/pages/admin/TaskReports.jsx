import { useState, useEffect } from "react";
import Table from "../../components/common/Table.jsx";
import { SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getTaskReportsApi, verifyTaskReportApi } from "../../api/taskReportApi.js";

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

function TaskReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTaskReportsApi();
        setReports(data.taskReports || []);
      } catch (err) {
        console.error("Failed to load task reports:", err);
        setError(err.response?.data?.message || "Failed to load task reports.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleVerify(id) {
    try {
      setVerifyingId(id);
      const data = await verifyTaskReportApi(id);
      // Update just this row with the verified report returned by the server.
      setReports((prev) => prev.map((r) => (r._id === id ? data.taskReport : r)));
    } catch (err) {
      console.error("Failed to verify task report:", err);
      alert(err.response?.data?.message || "Failed to verify task report.");
    } finally {
      setVerifyingId(null);
    }
  }

  const filtered = reports.filter((r) => {
    const name = r.employee?.name?.toLowerCase() || "";
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesFilter = filter === "All" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Task Reports</h2>
        <p className="text-sm text-slate-500 mt-1">Daily and weekly task updates submitted by employees.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 transition-all"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <SkeletonTable rows={6} cols={6} />}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <Table headers={["Employee", "Department", "Title", "Date", "Attachment", "Status", "Verification"]}>
            {filtered.map((r) => (
              <tr key={r._id} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{r.employee?.name || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{r.employee?.department?.name || "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="block max-w-[18rem] truncate" title={r.description}>{r.title}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
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
                <td className="px-4 py-3">
                  {r.verified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerify(r._id)}
                      disabled={verifyingId === r._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-gradient text-white shadow-glow-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {verifyingId === r._id ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                      {verifyingId === r._id ? "Verifying..." : "Verify"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No task reports found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default TaskReports;

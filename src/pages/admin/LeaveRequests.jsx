import { useState, useEffect } from "react";
import LeaveRequestTable from "../../components/admin/LeaveRequestTable.jsx";
import { getLeavesApi, approveLeaveApi, rejectLeaveApi } from "../../api/leaveApi.js";

function LeaveRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pending");

  // Load all leave requests when the page opens.
  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeavesApi();
      setList(data.leaves || []);
    } catch (err) {
      console.error("Failed to load leaves:", err);
      setError(err.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await approveLeaveApi(id);
      await fetchLeaves();
    } catch (err) {
      console.error("Failed to approve leave:", err);
      alert(err.response?.data?.message || "Failed to approve leave.");
    }
  }

  async function handleReject(id) {
    try {
      await rejectLeaveApi(id);
      await fetchLeaves();
    } catch (err) {
      console.error("Failed to reject leave:", err);
      alert(err.response?.data?.message || "Failed to reject leave.");
    }
  }

  const filtered = list.filter((req) => req.status === tab);

  // Tab value (lowercase, matches backend) + the label we show on the button.
  const tabs = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-5">Leave Requests</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              tab === t.value
                ? "bg-green-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-slate-500 mt-6">Loading leave requests...</p>}
      {error && <p className="text-center text-rose-500 mt-6">{error}</p>}

      {!loading && !error && (
        <>
          <LeaveRequestTable
            requests={filtered}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No {tab} requests.</p>
          )}
        </>
      )}
    </div>
  );
}

export default LeaveRequests;

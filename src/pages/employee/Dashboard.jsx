import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeaveCard from "../../components/employee/LeaveCard.jsx";
import AttendanceCard from "../../components/employee/AttendanceCard.jsx";
import Button from "../../components/common/Button.jsx";
import { SkeletonStatCards, SkeletonCard } from "../../components/common/Skeleton.jsx";
import { getMeApi } from "../../api/authApi.js";
import { getAttendanceApi } from "../../api/attendanceApi.js";
import { getLeavesApi } from "../../api/leaveApi.js";

function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getMeApi();
        setMe(profile);
        if (profile.employeeId) {
          const [attRes, leaveRes] = await Promise.all([
            getAttendanceApi(profile.employeeId),
            getLeavesApi(profile.employeeId),
          ]);
          setAttendance(attRes.attendance || []);
          setLeaves(leaveRes.leaves || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Count on-time, late, and half-day check-ins all as days attended.
  const attendedStatuses = ["present", "late", "half-day"];
  const presentDays = attendance.filter((a) => attendedStatuses.includes(a.status)).length;
  const attendancePercent = attendance.length
    ? Math.round((presentDays / attendance.length) * 100)
    : 0;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
        Welcome, {me?.name || "Employee"}
      </h2>
      <p className="text-sm text-slate-500 mb-6">{me?.designation || "Your daily snapshot"}</p>

      {loading ? (
        <>
          <SkeletonStatCards count={4} />
          <SkeletonCard className="mt-6 h-32" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <AttendanceCard title="Attendance %" value={`${attendancePercent}%`} note="So far" />
            <LeaveCard title="Total Leaves" value={leaves.length} color="blue" />
            <LeaveCard title="Pending Leaves" value={pendingLeaves} color="orange" />
            <LeaveCard title="Approved Leaves" value={approvedLeaves} color="green" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button color="green" onClick={() => navigate("/employee/task-reports")}>
                Submit Task Report
              </Button>
              <Button onClick={() => navigate("/employee/leave-history")}>Apply Leave</Button>
              <Button color="gray" onClick={() => navigate("/employee/attendance")}>
                View Attendance
              </Button>
              <Button color="gray" onClick={() => navigate("/employee/profile")}>
                View Profile
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;

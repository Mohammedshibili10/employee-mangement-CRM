import { useState, useEffect } from "react";
import DashboardCard from "../../components/admin/DashboardCard.jsx";
import AttendanceTable from "../../components/admin/AttendanceTable.jsx";
import { SkeletonStatCards, SkeletonCard, SkeletonTable } from "../../components/common/Skeleton.jsx";
import { getEmployeesApi } from "../../api/employeeApi.js";
import { getDepartmentsApi } from "../../api/departmentApi.js";
import { getLeavesApi } from "../../api/leaveApi.js";
import { getAttendanceSummaryApi, getAttendanceApi } from "../../api/attendanceApi.js";

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState({ present: 0, late: 0, absent: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, deptRes, leaveRes, attRes, attListRes] = await Promise.all([
          getEmployeesApi(),
          getDepartmentsApi(),
          getLeavesApi(),
          getAttendanceSummaryApi(),
          getAttendanceApi(),
        ]);
        setEmployees(empRes.employees || []);
        setDepartments(deptRes.departments || []);
        setLeaves(leaveRes.leaves || []);
        setAttendance(attRes.summary || { present: 0, late: 0, absent: 0 });
        setAttendanceRecords(attListRes.attendance || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const totalDepartments = departments.length;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected").length;

  const distribution = departments.map((d) => ({
    name: d.name,
    count: employees.filter((e) => e.department?._id === d._id).length,
  }));

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentAttendance = [...attendanceRecords]
    .sort((a, b) => new Date(b.checkIn || b.date) - new Date(a.checkIn || a.date))
    .slice(0, 10);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-5">Dashboard</h2>
        <SkeletonStatCards count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="mt-6">
          <SkeletonTable rows={5} cols={7} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-5">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <DashboardCard title="Total Employees" value={totalEmployees} color="blue" />
        <DashboardCard title="Active Employees" value={activeEmployees} color="green" />
        <DashboardCard title="Total Departments" value={totalDepartments} color="purple" />
        <DashboardCard title="Pending Leaves" value={pendingLeaves} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5">
          <h3 className="font-bold text-slate-800 mb-3">Employee Distribution</h3>
          {distribution.length === 0 && (
            <p className="text-sm text-slate-400">No departments yet.</p>
          )}
          {distribution.map((d) => (
            <div key={d.name} className="flex justify-between text-sm py-1.5 text-slate-600">
              <span>{d.name}</span>
              <span className="font-semibold text-slate-800">{d.count}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5">
          <h3 className="font-bold text-slate-800 mb-3">Attendance Summary</h3>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Present Today</span>
            <span className="font-semibold text-brand-600">{attendance.present}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Late</span>
            <span className="font-semibold text-amber-600">{attendance.late}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Absent</span>
            <span className="font-semibold text-rose-600">{attendance.absent}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5">
          <h3 className="font-bold text-slate-800 mb-3">Leave Overview</h3>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Pending</span>
            <span className="font-semibold text-amber-600">{pendingLeaves}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Approved</span>
            <span className="font-semibold text-brand-600">{approvedLeaves}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 text-slate-600">
            <span>Rejected</span>
            <span className="font-semibold text-rose-600">{rejectedLeaves}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5 mt-5">
        <h3 className="font-bold text-slate-800 mb-4">Recently Added Employees</h3>
        {recentEmployees.length === 0 && (
          <p className="text-sm text-slate-400">No employees yet.</p>
        )}
        <div className="space-y-3">
          {recentEmployees.map((emp) => (
            <div key={emp._id} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0"></span>
              <div className="flex-1 flex justify-between gap-3">
                <span className="text-sm text-slate-700">
                  {emp.name} — {emp.designation}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {emp.department?.name || ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-bold text-slate-800 mb-3">Check-in / Check-out History</h3>
        <AttendanceTable records={recentAttendance} />
        {recentAttendance.length === 0 && (
          <p className="text-center text-slate-500 mt-6">No check-in records yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

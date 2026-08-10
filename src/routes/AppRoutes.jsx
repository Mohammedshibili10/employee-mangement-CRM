import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminLayout from "../layouts/AdminLayout.jsx";
import EmployeeLayout from "../layouts/EmployeeLayout.jsx";

import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Employees from "../pages/admin/Employees.jsx";
import EmployeeDetails from "../pages/admin/EmployeeDetails.jsx";
import Departments from "../pages/admin/Departments.jsx";
import Attendance from "../pages/admin/Attendance.jsx";
import SalaryReport from "../pages/admin/SalaryReport.jsx";
import Lop from "../pages/admin/Lop.jsx";
import Additions from "../pages/admin/Additions.jsx";
import SalaryAdvance from "../pages/admin/SalaryAdvance.jsx";
import LateMinutes from "../pages/admin/LateMinutes.jsx";
import Reports from "../pages/admin/Reports.jsx";
import AdminSettings from "../pages/admin/Settings.jsx";

import EmployeeDashboard from "../pages/employee/Dashboard.jsx";
import Profile from "../pages/employee/Profile.jsx";
import MyAttendance from "../pages/employee/MyAttendance.jsx";
import EmployeeSettings from "../pages/employee/Settings.jsx";

function AppRoutes() {

  const { user, token } = useSelector((state) => state.auth);
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";

  return (
    <Routes>

      <Route path="/" element={<Navigate to={token ? dashboardPath : "/login"} replace />} />

      <Route
        path="/login"
        element={token ? <Navigate to={dashboardPath} replace /> : <Login />}
      />

      <Route
        path="/forgot-password"
        element={token ? <Navigate to={dashboardPath} replace /> : <ForgotPassword />}
      />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="salary" element={<SalaryReport />} />
          <Route path="salary-adjustments" element={<Navigate to="/admin/salary-adjustments/deductions" replace />} />
          <Route path="salary-adjustments/deductions" element={<Lop />} />
          <Route path="salary-adjustments/salary-advance" element={<SalaryAdvance />} />
          <Route path="salary-adjustments/late-minutes" element={<LateMinutes />} />
          <Route path="salary-adjustments/additions" element={<Additions />} />
          <Route path="lop" element={<Navigate to="/admin/salary-adjustments/deductions" replace />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="settings" element={<EmployeeSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;

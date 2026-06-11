import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ role }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    const ownDashboard =
      user?.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={ownDashboard} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

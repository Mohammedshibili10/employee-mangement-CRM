import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Guards a group of routes.
// - If nobody is logged in, send them to the login page.
// - If a "role" is required and the logged-in user has a different role,
//   send them to their own dashboard instead.
// - Otherwise show the page (Outlet renders the matched child route).
function ProtectedRoute({ role }) {
  const { user, token } = useSelector((state) => state.auth);

  // Not logged in -> go to login.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but trying to open the wrong section -> go to own dashboard.
  if (role && user?.role !== role) {
    const ownDashboard =
      user?.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={ownDashboard} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

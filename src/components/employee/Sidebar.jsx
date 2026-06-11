import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice.js";
import Logo from "../common/Logo.jsx";

// Links shown in the employee sidebar
const menu = [
  { name: "Dashboard", path: "/employee/dashboard" },
  { name: "My Attendance", path: "/employee/attendance" },
  { name: "Leave History", path: "/employee/leave-history" },
  { name: "My Profile", path: "/employee/profile" },
  { name: "Settings", path: "/employee/settings" },
];

// open / onClose control the mobile drawer (ignored on desktop).
function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Clear the saved user/token, then go to login (with history replaced).
  function handleLogout() {
    onClose();
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  }

  const content = (
    <div className="h-full flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <Logo subtitle="Employee" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="m-3 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200">
        {content}
      </aside>

      {/* Mobile: slide-in drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

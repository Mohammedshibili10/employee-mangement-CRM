import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice.js";
import Logo from "../common/Logo.jsx";
import Icon from "../common/Icon.jsx";

const menu = [
  { name: "Dashboard", path: "/employee/dashboard", icon: "dashboard" },
  { name: "My Attendance", path: "/employee/attendance", icon: "attendance" },
  { name: "My Profile", path: "/employee/profile", icon: "profile" },
  { name: "Settings", path: "/employee/settings", icon: "settings" },
];

function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    onClose();
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  }

  const content = (
    <div className="h-full flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <Logo subtitle="Employee" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-slim">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-gradient text-white shadow-glow-sm"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-brand-600"
                  }`}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="m-3 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-sm font-semibold transition-all duration-200"
      >
        <Icon name="logout" className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 bg-white/80 backdrop-blur-sm border-r border-slate-200/70">
        {content}
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-premium animate-slide-in-left">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

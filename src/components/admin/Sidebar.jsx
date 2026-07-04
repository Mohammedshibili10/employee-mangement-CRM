import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice.js";
import Logo from "../common/Logo.jsx";
import Icon from "../common/Icon.jsx";

const menu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
  { name: "Employees", path: "/admin/employees", icon: "employees" },
  { name: "Departments", path: "/admin/departments", icon: "departments" },
  { name: "Attendance", path: "/admin/attendance", icon: "attendance" },
  { name: "Salary Report", path: "/admin/salary", icon: "salary" },
  {
    name: "Salary Adjustments",
    icon: "lop",
    children: [
      { name: "Deductions", path: "/admin/salary-adjustments/deductions" },
      { name: "Additions", path: "/admin/salary-adjustments/additions" },
    ],
  },
  { name: "Reports", path: "/admin/reports", icon: "reports" },
  { name: "Settings", path: "/admin/settings", icon: "settings" },
];

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-brand-gradient text-white shadow-glow-sm"
      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
  }`;

// A parent menu item with expandable child links (e.g. Salary Adjustments).
function SubMenu({ item, onClose }) {
  const { pathname } = useLocation();
  const isChildActive = item.children.some((c) => pathname.startsWith(c.path));
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isChildActive ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
        }`}
      >
        <Icon
          name={item.icon}
          className={`h-5 w-5 shrink-0 transition-colors ${isChildActive ? "text-brand-600" : "text-slate-400 group-hover:text-brand-600"}`}
        />
        <span className="flex-1 text-left">{item.name}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      {open && (
        <div className="mt-1 ml-5 pl-3 border-l border-slate-200 space-y-1">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-gradient text-white shadow-glow-sm"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`
              }
            >
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <Logo subtitle="Admin Panel" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-slim">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {menu.map((item) =>
          item.children ? (
            <SubMenu key={item.name} item={item} onClose={onClose} />
          ) : (
            <NavLink key={item.path} to={item.path} onClick={onClose} className={linkClass}>
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
          )
        )}
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

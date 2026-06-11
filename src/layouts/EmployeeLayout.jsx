import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/employee/Sidebar.jsx";
import Navbar from "../components/employee/Navbar.jsx";

function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen app-surface text-slate-800">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* `key` on the route path re-triggers the entrance animation per page */}
        <main key={location.pathname} className="p-4 sm:p-6 lg:p-8 animate-fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/employee/Sidebar.jsx";
import Navbar from "../components/employee/Navbar.jsx";

function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;

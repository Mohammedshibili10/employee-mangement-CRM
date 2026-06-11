import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice.js";
import { getMeApi } from "../../api/authApi.js";

// Top bar shown on every employee page
function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false); // is the profile dropdown open?
  const [me, setMe] = useState(null); // logged-in user's details from the backend

  // Load the logged-in user's details from the backend when the bar appears.
  useEffect(() => {
    getMeApi()
      .then(setMe)
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  // Log out: clear the saved user/token and go to the login page.
  function logout() {
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  }

  const name = me?.name || "Employee";
  const email = me?.email || "";
  const designation = me?.designation || "-";
  const department = me?.department || "-";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger: opens the sidebar drawer on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-800">My Workspace</h1>
      </div>

      {/* Profile area */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3"
        >
          <span className="text-sm text-slate-600">{name}</span>
          <div className="h-9 w-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
            {initial}
          </div>
        </button>

        {/* Dropdown shown when the icon is clicked */}
        {open && (
          <>
            {/* Click anywhere outside to close */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
              {/* Name + email from the backend */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{email}</p>
              </div>

              {/* Extra details from the backend */}
              <div className="px-4 py-3 border-b border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Designation</span>
                  <span className="text-slate-700">{designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="text-slate-700">{department}</span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1 text-sm">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/profile");
                  }}
                  className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/settings");
                  }}
                  className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;

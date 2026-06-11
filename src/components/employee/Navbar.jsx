import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction, setProfilePhoto } from "../../redux/slices/authSlice.js";
import { getMeApi } from "../../api/authApi.js";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const photo = useSelector((s) => s.auth.profilePhoto);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getMeApi()
      .then((profile) => {
        setMe(profile);
        dispatch(setProfilePhoto(profile.profilePhoto || null));
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, [dispatch]);

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
    <header className="sticky top-0 z-30 h-16 glass border-b border-slate-200/70 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">My Workspace</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 sm:gap-3 rounded-full p-1 pr-1 sm:pr-3 hover:bg-slate-100/70 transition-colors"
        >
          {photo ? (
            <img src={photo} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-soft" />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-full bg-brand-gradient text-white flex items-center justify-center text-sm font-semibold shadow-glow-sm ring-2 ring-white">
              {initial}
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[140px] truncate">{name}</span>
          <svg className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-premium ring-1 ring-slate-900/5 z-20 overflow-hidden animate-scale-in origin-top-right">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-brand-gradient-soft">
                <p className="font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
              </div>

              <div className="px-4 py-3 border-b border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Designation</span>
                  <span className="text-slate-700 font-medium">{designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="text-slate-700 font-medium">{department}</span>
                </div>
              </div>

              <div className="py-1.5 text-sm">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/profile");
                  }}
                  className="block w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/settings");
                  }}
                  className="block w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
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

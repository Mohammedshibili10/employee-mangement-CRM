import { useState, useEffect } from "react";
import ProfileCard from "../../components/employee/ProfileCard.jsx";
import { getMeApi } from "../../api/authApi.js";

function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the logged-in employee's details from the backend.
  useEffect(() => {
    getMeApi()
      .then((profile) => setMe(profile))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  if (!me) {
    return <p className="text-slate-600">Could not load profile.</p>;
  }

  // Shape the data the way ProfileCard expects.
  const employee = {
    name: me.name,
    designation: me.designation || "-",
    email: me.email,
    phone: me.phone || "-",
    department: me.department || "-",
    joiningDate: me.joiningDate ? new Date(me.joiningDate).toLocaleDateString() : "-",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
      </div>

      <div className="max-w-md">
        <ProfileCard employee={employee} />
      </div>
    </div>
  );
}

export default Profile;

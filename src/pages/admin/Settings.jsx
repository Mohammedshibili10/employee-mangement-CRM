import { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

function Settings() {
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@company.com" });
  const [password, setPassword] = useState({ current: "", next: "" });

  function saveProfile(e) {
    e.preventDefault();
    alert("Profile saved (demo only)");
  }

  function savePassword(e) {
    e.preventDefault();
    alert("Password changed (demo only)");
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-5">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Profile Settings</h3>
          <Input
            label="Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Button type="submit">Save Changes</Button>
        </form>

        <form onSubmit={savePassword} className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Change Password</h3>
          <Input
            label="Current Password"
            type="password"
            value={password.current}
            onChange={(e) => setPassword({ ...password, current: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            value={password.next}
            onChange={(e) => setPassword({ ...password, next: e.target.value })}
          />
          <Button type="submit" color="green">Update Password</Button>
        </form>
      </div>
    </div>
  );
}

export default Settings;

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { updateProfileApi, changePasswordApi } from "../../api/authApi.js";
import { updateUser } from "../../redux/slices/authSlice.js";

function Settings() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({ current: "", next: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { ok: boolean, text: string }
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Load the logged-in user's real name/email into the form.
  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "" });
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(null);
    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileMsg({ ok: false, text: "Name and email are required." });
      return;
    }
    setSavingProfile(true);
    try {
      const data = await updateProfileApi({ name: profile.name.trim(), email: profile.email.trim() });
      dispatch(updateUser(data.user));
      setProfileMsg({ ok: true, text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ ok: false, text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!password.current || !password.next) {
      setPasswordMsg({ ok: false, text: "Enter both your current and new password." });
      return;
    }
    if (password.next.length < 6) {
      setPasswordMsg({ ok: false, text: "New password must be at least 6 characters." });
      return;
    }
    setSavingPassword(true);
    try {
      await changePasswordApi({ currentPassword: password.current, newPassword: password.next });
      setPassword({ current: "", next: "" });
      setPasswordMsg({ ok: true, text: "Password changed successfully." });
    } catch (err) {
      setPasswordMsg({ ok: false, text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setSavingPassword(false);
    }
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
          <Button type="submit" color="green" loading={savingProfile}>Save Changes</Button>
          {profileMsg && (
            <p className={`text-sm mt-3 ${profileMsg.ok ? "text-brand-600" : "text-rose-600"}`}>{profileMsg.text}</p>
          )}
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
          <Button type="submit" color="green" loading={savingPassword}>Update Password</Button>
          {passwordMsg && (
            <p className={`text-sm mt-3 ${passwordMsg.ok ? "text-brand-600" : "text-rose-600"}`}>{passwordMsg.text}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Settings;

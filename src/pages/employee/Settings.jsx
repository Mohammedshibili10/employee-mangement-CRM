import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { getMeApi, changePasswordApi } from "../../api/authApi.js";

const emptyPassword = { current: "", next: "" };

function Settings() {
  const [me, setMe] = useState(null);

  // Change Password popup
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(emptyPassword);
  const [saving, setSaving] = useState(false);

  // Load the logged-in user's account info.
  useEffect(() => {
    getMeApi()
      .then((profile) => setMe(profile))
      .catch((err) => console.error("Failed to load account:", err));
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await changePasswordApi({
        currentPassword: password.current,
        newPassword: password.next,
      });
      alert("Password changed successfully");
      setPassword(emptyPassword);
      setOpen(false);
    } catch (err) {
      console.error("Failed to change password:", err);
      alert(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-5">Settings</h2>

      {/* Account info + actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
        <h3 className="font-semibold text-slate-800 mb-4">Account</h3>

        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Name</span>
          <span className="text-slate-800 font-medium">{me?.name || "-"}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-800 font-medium">{me?.email || "-"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Role</span>
          <span className="text-slate-800 font-medium capitalize">{me?.role || "-"}</span>
        </div>

        <div className="mt-5">
          <Button color="green" onClick={() => setOpen(true)}>Change Password</Button>
        </div>
      </div>

      {/* Change Password popup */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword}>
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
            placeholder="At least 6 characters"
          />
          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green">{saving ? "Updating..." : "Update Password"}</Button>
            <Button color="gray" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Settings;

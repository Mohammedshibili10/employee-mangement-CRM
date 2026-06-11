import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { getMeApi, changePasswordApi } from "../../api/authApi.js";
import { changePasswordSchema, validate } from "../../validation/schemas.js";

const emptyPassword = { current: "", next: "" };

function Settings() {
  const [me, setMe] = useState(null);

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(emptyPassword);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMeApi()
      .then((profile) => setMe(profile))
      .catch((err) => console.error("Failed to load account:", err));
  }, []);

  function openModal() {
    setPassword(emptyPassword);
    setFormErrors({});
    setOpen(true);
  }

  function closeModal() {
    setFormErrors({});
    setOpen(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    const check = validate(changePasswordSchema, password);
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }
    setFormErrors({});

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
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-5">Settings</h2>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-6 max-w-lg">
        <h3 className="font-bold text-slate-800 mb-4">Account</h3>

        <div className="flex justify-between py-2.5 border-b border-slate-100">
          <span className="text-slate-500">Name</span>
          <span className="text-slate-800 font-semibold">{me?.name || "-"}</span>
        </div>
        <div className="flex justify-between py-2.5 border-b border-slate-100">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-800 font-semibold">{me?.email || "-"}</span>
        </div>
        <div className="flex justify-between py-2.5">
          <span className="text-slate-500">Role</span>
          <span className="text-slate-800 font-semibold capitalize">{me?.role || "-"}</span>
        </div>

        <div className="mt-5">
          <Button color="green" onClick={openModal}>Change Password</Button>
        </div>
      </div>

      <Modal isOpen={open} onClose={closeModal} title="Change Password">
        <form onSubmit={handleChangePassword} noValidate>
          <Input
            label="Current Password"
            type="password"
            value={password.current}
            onChange={(e) => setPassword({ ...password, current: e.target.value })}
            error={formErrors.current}
          />
          <Input
            label="New Password"
            type="password"
            value={password.next}
            onChange={(e) => setPassword({ ...password, next: e.target.value })}
            placeholder="At least 6 characters"
            error={formErrors.next}
          />
          <div className="flex gap-3 mt-2">
            <Button type="submit" color="green" loading={saving}>{saving ? "Updating..." : "Update Password"}</Button>
            <Button color="gray" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Settings;

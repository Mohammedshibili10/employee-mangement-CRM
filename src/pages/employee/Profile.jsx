import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import ProfileCard from "../../components/employee/ProfileCard.jsx";
import { getMeApi } from "../../api/authApi.js";
import { updateMyPhotoApi, deleteMyPhotoApi } from "../../api/employeeApi.js";
import { setProfilePhoto } from "../../redux/slices/authSlice.js";

function fileToResizedDataUrl(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Profile() {
  const dispatch = useDispatch();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getMeApi()
      .then((profile) => setMe(profile))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    try {
      setBusy(true);
      const dataUrl = await fileToResizedDataUrl(file);
      const res = await updateMyPhotoApi(dataUrl);
      setMe((m) => ({ ...m, profilePhoto: res.profilePhoto }));
      dispatch(setProfilePhoto(res.profilePhoto));
    } catch (err) {
      console.error("Failed to upload photo:", err);
      alert(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    try {
      setBusy(true);
      await deleteMyPhotoApi();
      setMe((m) => ({ ...m, profilePhoto: null }));
      dispatch(setProfilePhoto(null));
    } catch (err) {
      console.error("Failed to remove photo:", err);
      alert(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  if (!me) {
    return <p className="text-slate-600">Could not load profile.</p>;
  }

  const employee = {
    name: me.name,
    photo: me.profilePhoto,
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

      <div className="max-w-md space-y-3">
        <ProfileCard
          employee={employee}
          busy={busy}
          onPhotoClick={() => fileRef.current?.click()}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <p className="text-xs text-slate-400 px-1">
          Tip: click your photo to upload or change it.
          {me.profilePhoto && (
            <>
              {" "}
              <button
                onClick={handleRemove}
                disabled={busy}
                className="text-rose-600 hover:underline disabled:opacity-60"
              >
                Remove photo
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Profile;

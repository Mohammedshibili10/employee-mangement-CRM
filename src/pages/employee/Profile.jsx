import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import ProfileCard from "../../components/employee/ProfileCard.jsx";
import Skeleton from "../../components/common/Skeleton.jsx";
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
    return (
      <div>
        <Skeleton className="h-7 w-40 mb-5" />
        <div className="max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
            <Skeleton className="h-24 w-full rounded-none" />
            <div className="px-6 pb-6">
              <Skeleton className="-mt-12 h-24 w-24 rounded-2xl" />
              <Skeleton className="h-5 w-44 mt-3" />
              <Skeleton className="h-3 w-28 mt-2" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!me) {
    return <p className="text-slate-600">Could not load profile.</p>;
  }

  const employee = {
    name: me.name,
    photo: me.profilePhoto,
    empId: me.empId,
    status: me.status,
    designation: me.designation || "-",
    email: me.email,
    phone: me.phone || "-",
    department: me.department || "-",
    joiningDate: me.joiningDate ? formatDate(me.joiningDate) : "-",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">My Profile</h2>
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

        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-xs text-slate-400">
            Tip: click your photo to upload or change it.
          </p>
          {me.profilePhoto && (
            <button
              onClick={handleRemove}
              disabled={busy}
              className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-60 whitespace-nowrap"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

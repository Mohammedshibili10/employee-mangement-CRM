import { useRef, useState, useEffect } from "react";
import Button from "../common/Button.jsx";
import { checkInApi, checkOutApi } from "../../api/attendanceApi.js";

// Camera + GPS capture used inside a popup modal.
// mode = "checkin" or "checkout". onSuccess() runs after it works.
// This component is mounted only while the modal is open, so the camera
// starts when the modal opens and stops when it closes (cleanup).
function AttendanceCamera({ mode, onSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isCheckIn = mode === "checkin";

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access the camera. Please allow camera permission.");
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Get the browser's current GPS position as a promise.
  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation is not supported by this browser."));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => reject(new Error("Could not get your location. Please allow location access.")),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // Take a still photo from the live video as a base64 JPEG.
  function captureSelfie() {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  async function handleSubmit() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const location = await getLocation();
      const image = captureSelfie();
      const payload = { ...location, image };
      const res = isCheckIn ? await checkInApi(payload) : await checkOutApi(payload);
      setMessage(res.message || "Done");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Attendance action failed:", err);
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-md bg-slate-100 mb-3 aspect-video object-cover"
      />

      <Button color="green" onClick={handleSubmit}>
        {busy ? "Saving..." : isCheckIn ? "Capture & Check-in" : "Capture & Check-out"}
      </Button>

      {message && <p className="text-sm mt-3 text-green-600">{message}</p>}
      {error && <p className="text-sm mt-3 text-rose-600">{error}</p>}

      <p className="text-xs text-slate-400 mt-3">
        Needs camera + location permission, and you must be near the office.
      </p>
    </div>
  );
}

export default AttendanceCamera;

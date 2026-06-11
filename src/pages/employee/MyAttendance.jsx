import { useState, useEffect } from "react";
import AttendanceCard from "../../components/employee/AttendanceCard.jsx";
import AttendanceCamera from "../../components/employee/AttendanceCamera.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Table from "../../components/common/Table.jsx";
import { getMeApi } from "../../api/authApi.js";
import { getAttendanceApi } from "../../api/attendanceApi.js";

function statusClass(status) {
  if (status === "present") return "bg-green-100 text-green-700";
  if (status === "late") return "bg-amber-100 text-amber-700";
  if (status === "absent") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function formatOvertime(row) {
  if (!row.overtime || !row.overtimeMinutes) return "-";
  const h = Math.floor(row.overtimeMinutes / 60);
  const m = row.overtimeMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function MyAttendance() {
  const [employeeId, setEmployeeId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which camera popup is open: null | "checkin" | "checkout"
  const [mode, setMode] = useState(null);

  // Find the logged-in employee, then load their attendance.
  useEffect(() => {
    async function init() {
      try {
        const me = await getMeApi();
        setEmployeeId(me.employeeId);
        if (me.employeeId) {
          await loadRecords(me.employeeId);
        }
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function loadRecords(id) {
    const res = await getAttendanceApi(id);
    setRecords(res.attendance || []);
  }

  const presentDays = records.filter((r) => r.status === "present").length;
  const absentDays = records.filter((r) => r.status === "absent").length;
  const percent = records.length ? Math.round((presentDays / records.length) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-5">My Attendance</h2>

      {/* Check-in / Check-out open a camera popup */}
      <div className="flex gap-3 mb-6">
        <Button color="green" onClick={() => setMode("checkin")}>Check-in</Button>
        <Button onClick={() => setMode("checkout")}>Check-out</Button>
      </div>

      {/* Camera popup for check-in / check-out */}
      <Modal
        isOpen={mode !== null}
        onClose={() => setMode(null)}
        title={mode === "checkin" ? "Check-in" : "Check-out"}
      >
        {mode && (
          <AttendanceCamera
            mode={mode}
            onSuccess={() => {
              if (employeeId) loadRecords(employeeId);
              setMode(null);
            }}
          />
        )}
      </Modal>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        <AttendanceCard title="Present Days" value={presentDays} note="Total" />
        <AttendanceCard title="Absent Days" value={absentDays} note="Total" />
        <AttendanceCard title="Attendance %" value={`${percent}%`} note="So far" />
      </div>

      {/* History */}
      <h3 className="font-semibold text-slate-800 mb-3">Attendance History</h3>

      {loading && <p className="text-center text-slate-500 mt-6">Loading attendance...</p>}

      {!loading && (
        <>
          <Table headers={["Date", "Check In", "Check Out", "Status", "Overtime"]}>
            {records.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800 font-medium">{formatDate(row.date)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTime(row.checkIn)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTime(row.checkOut)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatOvertime(row)}</td>
              </tr>
            ))}
          </Table>

          {records.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No attendance records yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default MyAttendance;

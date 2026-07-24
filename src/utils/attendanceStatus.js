// Derive a worked-day attendance status from a check-in time and the employee's
// assigned start time. Mirrors the backend rule (attendanceRules.js):
//   check-in at/before start        -> "present"
//   within 4 hours after start       -> "late"
//   more than 4 hours after start    -> "half-day"
// workStart / checkIn are "HH:MM" strings (24-hour). Falls back to 09:30 start.
const toMinutes = (hhmm) => {
  const m = String(hhmm || "").match(/^(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export function deriveWorkStatus(checkIn, workStart) {
  const t = toMinutes(checkIn);
  if (t == null) return "present"; // no check-in yet -> treat as on time
  const start = toMinutes(workStart);
  const startMin = start == null ? 9 * 60 + 30 : start;
  const late = t - startMin;
  if (late <= 0) return "present";
  if (late > 4 * 60) return "half-day";
  return "late";
}

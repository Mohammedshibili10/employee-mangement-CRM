// Derive a worked-day attendance status from a check-in time and the employee's
// assigned start time. Mirrors the backend rule (attendanceRules.js):
//   check-in at/before start + 5 minutes -> "present"
//   within 4 hours after the grace      -> "late"
//   more than 4 hours after the grace   -> "half-day"
// workStart / checkIn are "HH:MM" strings (24-hour). Falls back to 09:30 start.
const toMinutes = (hhmm) => {
  const m = String(hhmm || "").match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export function deriveWorkStatus(checkIn, workStart) {
  const t = toMinutes(checkIn);
  if (t == null) return "present"; // no check-in yet -> treat as on time
  const start = toMinutes(workStart);
  const startMin = start == null ? 9 * 60 + 30 : start;
  const late = t - (startMin + 5);
  if (late <= 0) return "present";
  if (late > 4 * 60) return "half-day";
  return "late";
}

// Every date shown anywhere in the system is formatted here, so the whole app
// reads the same way regardless of the browser's locale.
//
// The house format is DD/MM/YYYY. `toLocaleDateString()` cannot be trusted for
// this: the same record renders as 07/08/2026 in one browser and 8/7/2026 in
// another, which for a payroll date is not a cosmetic difference.

const pad = (n) => String(n).padStart(2, '0');

// DD/MM/YYYY — e.g. 07/08/2026. Returns "-" for anything missing or unparseable.
export function formatDate(value, fallback = '-') {
    if (!value) return fallback;
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// DD/MM/YYYY, hh:mm AM/PM — for audit trails ("pardoned by X on ...").
export function formatDateTime(value, fallback = '') {
    if (!value) return fallback;
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatDate(d)}, ${time}`;
}

// Long form with the weekday — e.g. "Friday, 07/08/2026". Used for report
// headings where the day of the week is worth reading at a glance.
export function formatDateLong(value, fallback = '-') {
    if (!value) return fallback;
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
    return `${weekday}, ${formatDate(d)}`;
}

// YYYY-MM-DD, built from LOCAL parts — the format an <input type="date"> needs.
// Never use toISOString() for this: it converts to UTC first, so an IST date can
// come back a day early.
export function toDateInput(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

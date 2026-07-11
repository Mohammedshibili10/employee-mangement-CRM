import axios from 'axios';

// Accepts either an employee id string (backward compatible) or a params object
// like { employee, date, month, year } to fetch daily/monthly attendance reports.
export const getAttendanceApi = async (params) => {
    const token = localStorage.getItem('token');
    const query = typeof params === 'string' ? { employee: params } : (params || {});
    const qs = new URLSearchParams();
    if (query.employee) qs.set('employee', query.employee);
    if (query.date) qs.set('date', query.date);
    if (query.month) qs.set('month', query.month);
    if (query.year) qs.set('year', query.year);
    const url = qs.toString() ? `/api/attendance?${qs.toString()}` : '/api/attendance';
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getAttendanceSummaryApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/attendance/summary', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const markAttendanceApi = async (attendanceData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance', attendanceData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateAttendanceApi = async (id, attendanceData) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/attendance/${id}`, attendanceData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const pardonWfhForMonthApi = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance/pardon-wfh-month', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const checkInApi = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance/checkin', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const checkOutApi = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance/checkout', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

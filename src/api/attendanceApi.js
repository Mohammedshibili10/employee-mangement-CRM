import axios from 'axios';

export const getAttendanceApi = async (employeeId) => {
    const token = localStorage.getItem('token');
    const url = employeeId ? `/api/attendance?employee=${employeeId}` : '/api/attendance';
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

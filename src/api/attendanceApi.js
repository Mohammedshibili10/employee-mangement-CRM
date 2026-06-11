// Attendance API calls (list, mark, summary).
import axios from 'axios';

export const getAttendanceApi = async (employeeId) => {
    const token = localStorage.getItem('token');
    // Pass an employeeId to get only that employee's records.
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

// Check in with GPS location + selfie. data = { latitude, longitude, image }
export const checkInApi = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance/checkin', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Check out with GPS location + selfie. data = { latitude, longitude, image }
export const checkOutApi = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/attendance/checkout', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

import axios from 'axios';

export const getEmployeeReportApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/reports/employees', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getAttendanceReportApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/reports/attendance', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getLeaveReportApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/reports/leaves', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

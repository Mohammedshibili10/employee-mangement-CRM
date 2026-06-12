import axios from 'axios';

// Get task reports. Employees automatically get only their own (enforced on the
// server from the JWT). Admins get all, or one employee's when employeeId is passed.
export const getTaskReportsApi = async (employeeId) => {
    const token = localStorage.getItem('token');
    const url = employeeId ? `/api/task-reports?employee=${employeeId}` : '/api/task-reports';
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Submit a new task report. The employee reference is taken from the JWT on the
// server, so it is never sent from here.
export const createTaskReportApi = async (reportData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/task-reports', reportData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Admin verifies a task report (marks it as verified).
export const verifyTaskReportApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/task-reports/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

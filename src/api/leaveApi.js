// Leave API calls (list, apply, approve, reject).
import axios from 'axios';

export const getLeavesApi = async (employeeId) => {
    const token = localStorage.getItem('token');
    // Pass an employeeId to get only that employee's leaves.
    const url = employeeId ? `/api/leaves?employee=${employeeId}` : '/api/leaves';
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const applyLeaveApi = async (leaveData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/leaves', leaveData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const approveLeaveApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/leaves/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const rejectLeaveApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/leaves/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

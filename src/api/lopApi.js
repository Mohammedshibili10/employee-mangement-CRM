import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Employee-centric: all employees + their total LOP days for a month.
export const getLopSummaryApi = async ({ month, year }) => {
    const params = new URLSearchParams();
    params.set('month', month);
    params.set('year', year);
    const res = await axios.get(`/api/lop/summary?${params.toString()}`, auth());
    return res.data;
};

// Set an employee's total LOP days + reason for a month (auto-save from the LOP module).
export const setEmployeeLopApi = async ({ employee, month, year, days, reason }) => {
    const res = await axios.put('/api/lop/set', { employee, month, year, days, reason }, auth());
    return res.data;
};

export const getLopRecordsApi = async ({ employee, month, year } = {}) => {
    const params = new URLSearchParams();
    if (employee) params.set('employee', employee);
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    const res = await axios.get(`/api/lop?${params.toString()}`, auth());
    return res.data;
};

export const createLopRecordApi = async (data) => {
    const res = await axios.post('/api/lop', data, auth());
    return res.data;
};

export const updateLopRecordApi = async (id, data) => {
    const res = await axios.put(`/api/lop/${id}`, data, auth());
    return res.data;
};

export const deleteLopRecordApi = async (id) => {
    const res = await axios.delete(`/api/lop/${id}`, auth());
    return res.data;
};

import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getSalaryReportsApi = async ({ month, year, employee, department } = {}) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    if (employee) params.set('employee', employee);
    if (department) params.set('department', department);
    const res = await axios.get(`/api/salary?${params.toString()}`, auth());
    return res.data;
};

export const generateSalaryApi = async ({ month, year, department }) => {
    const res = await axios.post('/api/salary/generate', { month, year, department }, auth());
    return res.data;
};

export const updateSalaryReportApi = async (id, data) => {
    const res = await axios.put(`/api/salary/${id}`, data, auth());
    return res.data;
};

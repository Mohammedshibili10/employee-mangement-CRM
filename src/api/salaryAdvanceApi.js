import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getSalaryAdvancesApi = async ({ month, year, employee } = {}) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    if (employee) params.set('employee', employee);
    const res = await axios.get(`/api/salary-advance?${params.toString()}`, auth());
    return res.data;
};

export const createSalaryAdvanceApi = async (data) => {
    const res = await axios.post('/api/salary-advance', data, auth());
    return res.data;
};

export const updateSalaryAdvanceApi = async (id, data) => {
    const res = await axios.put(`/api/salary-advance/${id}`, data, auth());
    return res.data;
};

export const deleteSalaryAdvanceApi = async (id) => {
    const res = await axios.delete(`/api/salary-advance/${id}`, auth());
    return res.data;
};

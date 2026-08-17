import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Holidays for a month, a whole year, or all of them when nothing is passed.
export const getHolidaysApi = async ({ month, year } = {}) => {
    const qs = new URLSearchParams();
    if (year) qs.set('year', year);
    if (month) qs.set('month', month);
    const url = qs.toString() ? `/api/holidays?${qs.toString()}` : '/api/holidays';
    const res = await axios.get(url, auth());
    return res.data;
};

export const createHolidayApi = async (data) => {
    const res = await axios.post('/api/holidays', data, auth());
    return res.data;
};

export const updateHolidayApi = async (id, data) => {
    const res = await axios.put(`/api/holidays/${id}`, data, auth());
    return res.data;
};

// Re-mark a holiday across Attendance — covers employees who joined after it
// was configured, or a holiday added before marking existed.
export const applyHolidayApi = async (id) => {
    const res = await axios.post(`/api/holidays/${id}/apply`, {}, auth());
    return res.data;
};

export const deleteHolidayApi = async (id) => {
    const res = await axios.delete(`/api/holidays/${id}`, auth());
    return res.data;
};

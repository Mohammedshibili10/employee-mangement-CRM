import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// All employees + their LOP entries (manual + attendance) for a month.
export const getDeductionsApi = async ({ month, year }) => {
    const params = new URLSearchParams();
    params.set('month', month);
    params.set('year', year);
    const res = await axios.get(`/api/lop/deductions?${params.toString()}`, auth());
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

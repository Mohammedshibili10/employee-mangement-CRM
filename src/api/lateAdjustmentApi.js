import axios from 'axios';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// One row per employee with late minutes in the month: the total, the completed
// 90-minute slabs, and the leftover minutes an admin can reduce.
export const getLateAdjustmentsApi = async ({ month, year }) => {
    const res = await axios.get(`/api/late-adjustment?month=${month}&year=${year}`, auth());
    return res.data;
};

// Set the leftover minutes for one employee's month. Payroll recalculates.
export const saveLateAdjustmentApi = async (data) => {
    const res = await axios.post('/api/late-adjustment', data, auth());
    return res.data;
};

// Drop the override and go back to what attendance produced.
export const deleteLateAdjustmentApi = async (id) => {
    const res = await axios.delete(`/api/late-adjustment/${id}`, auth());
    return res.data;
};

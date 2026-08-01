import axios from 'axios';

// Returns the employees who belong in the period being viewed.
//   (no options)          -> active employees only
//   { month, year }       -> everyone employed at any point that month, so
//                            someone who left on 15 July still shows in July
//                            and disappears from August onwards
//   { includeInactive }   -> everyone (the Employees page, to reactivate)
export const getEmployeesApi = async ({ includeInactive = false, month, year } = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (includeInactive) params.set('includeInactive', 'true');
    if (month && year) { params.set('month', month); params.set('year', year); }
    const qs = params.toString();
    const res = await axios.get(`/api/employees${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export const createEmployeeApi = async (employeeData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/employees', employeeData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export const getEmployeeApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export const updateEmployeeApi = async (id, employeeData) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/employees/${id}`, employeeData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export const deleteEmployeeApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

// Employee uploads/updates their OWN profile photo (image = base64 data URL).
export const updateMyPhotoApi = async (image) => {
    const token = localStorage.getItem('token');
    const res = await axios.put('/api/employees/me/photo', { image }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

// Employee removes their OWN profile photo.
export const deleteMyPhotoApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.delete('/api/employees/me/photo', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

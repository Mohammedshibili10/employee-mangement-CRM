import axios from 'axios';

export const getEmployeesApi = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/employees', {
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

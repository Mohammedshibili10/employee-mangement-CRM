import axios from 'axios';

export const getDepartmentsApi =async ()=>{
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;

}

export const createDepartmentApi = async (departmentData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/departments', departmentData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

export const updateDepartmentApi = async (id, departmentData) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/departments/${id}`, departmentData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

export const deleteDepartmentApi = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}

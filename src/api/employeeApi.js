// Employee API calls (list, create, get one, update, delete) go here.

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
    
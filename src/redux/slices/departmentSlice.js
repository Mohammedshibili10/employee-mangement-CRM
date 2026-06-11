import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
    loading: false,
    error: null,
};

const departmentSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {
        departmentsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        setDepartments: (state, action) => {
            state.loading = false;
            state.error = null;
            state.list = action.payload;
        },
        departmentsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
         addDepartment: (state, action) => {
            state.list.push(action.payload);
        }
    },

});

export const { departmentsStart, setDepartments, departmentsFailure, addDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;

// Employee slice: holds the list of employees.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
    selected: null,
    loading: false,
    error: null,
};

const employeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        employeesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        setEmployees: (state, action) => {
            state.loading = false;
            state.error = null;
            state.list = action.payload;
        },
        employeesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addEmployee: (state, action) => {
            state.list.push(action.payload);
        },
    },
});

export const { employeesStart, setEmployees, employeesFailure, addEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import employeeReducer from './slices/employeeSlice.js';
import departmentReducer from './slices/departmentSlice.js';
import attendanceReducer from './slices/attendanceSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        employees: employeeReducer,
        departments: departmentReducer,
        attendance: attendanceReducer,
    },
});

export default store;

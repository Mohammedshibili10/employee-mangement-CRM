import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import employeeReducer from './slices/employeeSlice.js';
import departmentReducer from './slices/departmentSlice.js';
import attendanceReducer from './slices/attendanceSlice.js';
import leaveReducer from './slices/leaveSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        employees: employeeReducer,
        departments: departmentReducer,
        attendance: attendanceReducer,
        leaves: leaveReducer,
    },
});

export default store;

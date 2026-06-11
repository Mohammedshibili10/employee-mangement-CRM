// Attendance slice: holds attendance records.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
    summary: null,
    loading: false,
    error: null,
};

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        // TODO: add reducers here (e.g. setAttendance, markAttendance).
    },
});

// TODO: export actions here once reducers are added.
export default attendanceSlice.reducer;

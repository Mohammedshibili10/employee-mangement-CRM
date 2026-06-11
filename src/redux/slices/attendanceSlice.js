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
    },
});

export default attendanceSlice.reducer;

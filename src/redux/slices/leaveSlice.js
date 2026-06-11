import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
    loading: false,
    error: null,
};

const leaveSlice = createSlice({
    name: 'leaves',
    initialState,
    reducers: {
    },
});

export default leaveSlice.reducer;

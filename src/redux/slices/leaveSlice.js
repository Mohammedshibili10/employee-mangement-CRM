// Leave slice: holds leave requests.
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
        // TODO: add reducers here (e.g. setLeaves, applyLeave).
    },
});

// TODO: export actions here once reducers are added.
export default leaveSlice.reducer;

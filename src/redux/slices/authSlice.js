// Auth slice: holds the logged-in user and token.
import { createSlice } from '@reduxjs/toolkit';

// Read any saved login from the browser so the user stays logged in on refresh.
const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');

const initialState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken ? savedToken : null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
     
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },

      
        loginSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload.user;
            state.token = action.payload.token;

            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

      
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;

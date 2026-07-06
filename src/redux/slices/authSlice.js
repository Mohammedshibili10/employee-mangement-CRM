import { createSlice } from '@reduxjs/toolkit';

// Safely read the saved user. If localStorage holds corrupt/invalid JSON we
// must NOT throw here — this runs at store-init (before React renders), so an
// exception would white-screen the whole app with no way to recover.
function loadSavedUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        // Corrupt value — drop it so the app can still boot (to the login page).
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
    }
}

const savedUser = loadSavedUser();
const savedToken = savedUser ? localStorage.getItem('token') : null;

const initialState = {
    user: savedUser,
    token: savedToken ? savedToken : null,
    profilePhoto: null,
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

        setProfilePhoto: (state, action) => {
            state.profilePhoto = action.payload;
        },

        // Merge updated fields (e.g. name/email from Settings) into the user and
        // persist so the navbar and next reload show the new values.
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.profilePhoto = null;
            state.error = null;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, setProfilePhoto, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

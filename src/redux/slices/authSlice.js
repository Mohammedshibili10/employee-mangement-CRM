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
    // True only when the user was signed out because their token expired.
    sessionEnded: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        loginStart: (state) => {
            state.loading = true;
            state.error = null;
            state.sessionEnded = false;
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
            state.sessionEnded = false;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        // The token expired or was rejected by the server. Same clean-up as a
        // logout, but keeps a message so the login page can explain why the user
        // was sent back instead of just appearing to drop them.
        sessionExpired: (state) => {
            state.user = null;
            state.token = null;
            state.profilePhoto = null;
            state.loading = false;
            state.error = null;
            // Distinguishes "your session ran out" from "wrong password", so the
            // login page can explain the redirect without hijacking form errors.
            state.sessionEnded = true;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, setProfilePhoto, updateUser, logout, sessionExpired } = authSlice.actions;
export default authSlice.reducer;

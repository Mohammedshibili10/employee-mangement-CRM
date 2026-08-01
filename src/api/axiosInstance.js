import axios from 'axios';
import { sessionExpired } from '../redux/slices/authSlice.js';

// Every API module calls axios directly (with an Authorization header it reads
// from localStorage), so the interceptor goes on the global axios instance —
// that way one place covers every request in the app.
//
// What this solves: the JWT eventually expires. Until now the server's 401 was
// just logged, leaving the user on a page that could no longer load anything,
// holding a token that would never work again. Now any rejected token clears the
// session, which drops `token` in Redux, and ProtectedRoute sends them to the
// login page.
export function setupAuthInterceptor(store) {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;
            const url = error.config?.url || '';

            // A failed sign-in also answers 401 ("Invalid email or password").
            // That is a normal login error, not an expired session — leave it to
            // the login form, or we would wipe the state mid sign-in attempt.
            const isLoginRequest = url.includes('/api/auth/login');

            // Only act while the user actually believes they are signed in,
            // so a stray 401 can't fire this repeatedly.
            const signedIn = Boolean(store.getState().auth.token);

            if (status === 401 && !isLoginRequest && signedIn) {
                store.dispatch(sessionExpired());
            }

            return Promise.reject(error);
        }
    );
}

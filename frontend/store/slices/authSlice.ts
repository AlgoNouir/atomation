import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';
import { fetchProjects } from './project';
import { fetchLogs } from './logSlice';
import { fetchTags } from './tagSlice';
import { fetchProjectUsers } from './userSlice';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    redirectToPanel: boolean;
    activityLoading: boolean;
    role: 'owner' | 'admin' | 'user' | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    redirectToPanel: false,
    activityLoading: false,
    role: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ token: string; role: 'owner' | 'admin' | 'user' }>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            state.activityLoading = true;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.redirectToPanel = false;
            state.role = null;
        },
        setRedirectToPanel: (state) => {
            state.redirectToPanel = true;
        },
        activityFetchComplete: (state) => {
            state.activityLoading = false;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setRedirectToPanel, activityFetchComplete } = authSlice.actions;

export const login = (username: string, password: string): AppThunk => async (dispatch) => {
    try {
        dispatch(loginStart());
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, { username, password });
        const { access: token, role } = response.data;
        console.log(role);

        localStorage.setItem('token', token);
        dispatch(loginSuccess({ token, role }));

        // Fetch initial data
        await Promise.all([
            dispatch(fetchProjects()),
            dispatch(fetchLogs('all')),
            dispatch(fetchTags()),
            dispatch(fetchProjectUsers())
        ]);

        dispatch(activityFetchComplete());
        dispatch(setRedirectToPanel());
    } catch (error) {
        dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
    }
};

export const logoutUser = (): AppThunk => async (dispatch) => {
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/logout/`);
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        localStorage.removeItem('token');
        dispatch(logout());
    }
};

export default authSlice.reducer;


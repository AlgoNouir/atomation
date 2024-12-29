import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';
import { fetchProjects } from './project';
import { fetchLogs } from './logSlice';
import { fetchTags } from './tagSlice';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    redirectToPanel: boolean;
    activityLoading: boolean;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    redirectToPanel: false,
    activityLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
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
        const token = response.data.access;
        localStorage.setItem('token', token);
        dispatch(loginSuccess(token));

        // Fetch initial data
        await Promise.all([
            dispatch(fetchProjects()),
            dispatch(fetchLogs('all')), // Assuming 'all' fetches logs for all projects
            dispatch(fetchTags())
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


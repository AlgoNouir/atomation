import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    redirectToPanel: boolean;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    redirectToPanel: false,
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
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setRedirectToPanel } = authSlice.actions;

export const login = (username: string, password: string): AppThunk => async (dispatch) => {
    try {
        dispatch(loginStart());
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, { username, password });
        const token = response.data.access;
        localStorage.setItem('token', token);
        dispatch(loginSuccess(token));
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


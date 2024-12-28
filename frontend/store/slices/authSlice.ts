import { createSlice, PayloadAction, Action, ThunkAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
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
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export const login = (username: string, password: string): AppThunk => async (dispatch) => {
    try {
        dispatch(loginStart());
        const response = await axios.post('http://localhost:8000/api/token/', { username, password });
        const token = response.data.access;
        localStorage.setItem('token', token);
        dispatch(loginSuccess(token));
    } catch (error) {
        dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
    }
};

export const logoutUser = (): AppThunk => (dispatch) => {
    localStorage.removeItem('token');
    dispatch(logout());
};

export default authSlice.reducer;


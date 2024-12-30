import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';
import { fetchProjects } from './project';
import { fetchLogs } from './logSlice';
import { fetchTags } from './tagSlice';
import { fetchProjectUsers } from './userSlice';
import { axiosReq } from '@/utils/axios';

export type UserRole = 'user' | 'admin' | 'owner';

interface AuthState {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    permittedProjects: string[];
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    redirectToPanel: boolean;
    activityLoading: boolean;
}

const initialState: AuthState = {
    id: '',
    name: '',
    email: '',
    avatar: undefined,
    role: 'user',
    permittedProjects: [],
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
        loginSuccess: (state, action: PayloadAction<{ token: string; user: Omit<AuthState, 'token' | 'isAuthenticated' | 'loading' | 'error' | 'redirectToPanel' | 'activityLoading'> }>) => {
            state.token = action.payload.token;
            state.id = action.payload.user.id;
            state.name = action.payload.user.name;
            state.email = action.payload.user.email;
            state.avatar = action.payload.user.avatar;
            state.role = action.payload.user.role;
            state.permittedProjects = action.payload.user.permittedProjects;
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
            return { ...initialState, token: null };
        },
        setRedirectToPanel: (state) => {
            state.redirectToPanel = true;
        },
        activityFetchComplete: (state) => {
            state.activityLoading = false;
        },
        updateAccount: (state, action: PayloadAction<Partial<AuthState>>) => {
            return { ...state, ...action.payload };
        },
        setPermittedProjects: (state, action: PayloadAction<string[]>) => {
            state.permittedProjects = action.payload;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setRedirectToPanel,
    activityFetchComplete,
    updateAccount,
    setPermittedProjects,
} = authSlice.actions;

export const login = (username: string, password: string): AppThunk => async (dispatch) => {
    try {
        dispatch(loginStart());
        const response = await axiosReq.post("/api/token/", { username, password });
        const { access: token, ...userData } = response.data;
        localStorage.setItem('token', token);
        dispatch(loginSuccess({ token, user: userData }));

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
        await axiosReq.post("/api/logout/");
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        localStorage.removeItem('token');
        dispatch(logout());
    }
};

export default authSlice.reducer;


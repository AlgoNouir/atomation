import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    person: string;
    projectId: string;
}

interface LogState {
    entries: LogEntry[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    milestoneLogs: {
        status: 'idle' | 'loading' | 'succeeded' | 'failed';
        error: string | null;
    };
}

const initialState: LogState = {
    entries: [],
    status: 'idle',
    error: null,
    milestoneLogs: {
        status: 'idle',
        error: null,
    },
};

export const fetchLogs = createAsyncThunk(
    'log/fetchLogs',
    async (projectId: string, { getState }) => {
        const { auth } = getState() as RootState;
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/`;

        if (projectId === 'all') {
            url += 'logs/';
        } else {
            url += `projects/${projectId}/logs/`;
        }

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });
        return response.data;
    }
);

export const fetchMilestoneLogs = createAsyncThunk(
    'log/fetchMilestoneLogs',
    async (milestoneId: string, { getState }) => {
        const { auth } = getState() as RootState;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/milestones/${milestoneId}/logs/`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });
        return response.data;
    }
);

const logSlice = createSlice({
    name: 'log',
    initialState,
    reducers: {
        addLog: (state, action: PayloadAction<{ message: string; person: string; projectId: string }>) => {
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                message: action.payload.message,
                person: action.payload.person,
                projectId: action.payload.projectId,
            };
            state.entries.push(newLog);
        },
        clearLogs: (state) => {
            state.entries = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.entries = action.payload;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch logs';
            })
            .addCase(fetchMilestoneLogs.pending, (state) => {
                state.milestoneLogs.status = 'loading';
                state.milestoneLogs.error = null;
            })
            .addCase(fetchMilestoneLogs.fulfilled, (state, action) => {
                state.milestoneLogs.status = 'succeeded';
                state.entries = action.payload;
            })
            .addCase(fetchMilestoneLogs.rejected, (state, action) => {
                state.milestoneLogs.status = 'failed';
                state.milestoneLogs.error = action.error.message || 'Failed to fetch milestone logs';
            });
    },
});

export const { addLog, clearLogs } = logSlice.actions;
export default logSlice.reducer;

export const selectPermittedLogs = (state: RootState) => {
    const { role, id, permittedProjects } = state.account;
    const allLogs = state.log.entries;

    if (role === 'owner') {
        return allLogs;
    }

    return allLogs.filter(log =>
        role === 'admin' ||
        log.person === id ||
        permittedProjects.includes(log.projectId)
    );
};


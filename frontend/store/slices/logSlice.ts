import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    person: string;
    projectId: string;
}

interface LogState {
    entries: LogEntry[];
}

const initialState: LogState = {
    entries: [],
};

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


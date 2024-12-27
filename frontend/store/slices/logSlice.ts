import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
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
        addLog: (state, action: PayloadAction<{ message: string }>) => {
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                message: action.payload.message,
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


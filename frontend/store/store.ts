import { configureStore } from '@reduxjs/toolkit';
import kanbanReducer from './slices/kanban';
import projectReducer from './slices/project';
import logReducer from './slices/logSlice';
import { addLog } from './slices/logSlice';
import userReducer from './slices/userSlice';
import tagReducer from './slices/tagSlice';

export const store = configureStore({
    reducer: {
        kanban: kanbanReducer,
        projects: projectReducer,
        log: logReducer,
        users: userReducer,
        tags: tagReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


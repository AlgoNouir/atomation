import { configureStore } from '@reduxjs/toolkit';
import kanbanReducer from './slices/kanban';
import projectReducer from './slices/project';

export const store = configureStore({
    reducer: {
        kanban: kanbanReducer,
        projects: projectReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

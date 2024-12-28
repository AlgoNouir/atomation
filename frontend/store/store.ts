import { configureStore } from '@reduxjs/toolkit';
import kanbanReducer from './slices/kanban';
import projectReducer from './slices/project';
import logReducer from './slices/logSlice';
import userReducer from './slices/userSlice';
import tagReducer from './slices/tagSlice';
import accountReducer from './slices/accountSlice';
import authReducer from './slices/authSlice';
import { ThunkAction } from 'redux-thunk';
import { Action } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        kanban: kanbanReducer,
        projects: projectReducer,
        log: logReducer,
        users: userReducer,
        tags: tagReducer,
        account: accountReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;


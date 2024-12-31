import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import kanbanReducer from './slices/kanban';
import projectReducer from './slices/project';
import logReducer from './slices/logSlice';
import userReducer from './slices/userSlice';
import tagReducer from './slices/tagSlice';
import authReducer from './slices/authSlice';
import { ThunkAction } from 'redux-thunk';
import { Action } from '@reduxjs/toolkit';
import persistCombineReducers from 'redux-persist/es/persistCombineReducers';
import storage from 'redux-persist/lib/storage';


const reducer = {
    kanban: kanbanReducer,
    projects: projectReducer,
    log: logReducer,
    users: userReducer,
    tags: tagReducer,
    auth: authReducer,
}

const persistConfig = {
    key: "root",
    storage: storage,
    whitelist: ["auth"], // Add 'user' to the whitelist
};

const persistedReducer = persistCombineReducers(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

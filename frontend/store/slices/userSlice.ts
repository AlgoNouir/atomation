import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { axiosReq } from '@/utils/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  users: [],
  status: 'idle',
  error: null,
};

export const fetchProjectUsers = createAsyncThunk(
  'users/fetchProjectUsers',
  async (_, { getState }) => {
    const { auth } = getState() as RootState;
    const response = await axiosReq.get("/api/project-users");

    console.log(response.data);


    return response.data.map((d: { [key: string]: string }) => ({ ...d, name: d.get_full_name }));
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<{ id: string; updates: Partial<User> }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload.updates };
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjectUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchProjectUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch project users';
      });
  },
});

export const { addUser, updateUser, removeUser } = userSlice.actions;
export default userSlice.reducer;


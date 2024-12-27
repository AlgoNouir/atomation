import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'user' | 'admin' | 'owner';

export interface AccountState {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permittedProjects: string[];
}

const initialState: AccountState = {
  id: '',
  name: '',
  email: '',
  role: 'owner',
  permittedProjects: [],
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    updateAccount: (state, action: PayloadAction<Partial<AccountState>>) => {
      return { ...state, ...action.payload };
    },
    setPermittedProjects: (state, action: PayloadAction<string[]>) => {
      state.permittedProjects = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { updateAccount, setPermittedProjects, logout } = accountSlice.actions;
export default accountSlice.reducer;


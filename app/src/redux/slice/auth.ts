import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from '@/redux/api/authApi';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  tokenType: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  tokenType: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        tokenType: string;
        user: AuthUser;
      }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.tokenType = action.payload.tokenType;
      state.user = action.payload.user;
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.tokenType = null;
    },
  },
});

export const { setAuthenticated, setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

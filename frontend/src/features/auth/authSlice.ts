import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userRole: 'admin' | 'agent' | 'client' | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<'admin' | 'agent' | 'client'>) => {
      state.isLoggedIn = true;
      state.userRole = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userRole = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserRole } from '../../models/models';

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: 'guest', // default to guest
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserRole>) {
      state.isLoggedIn = true;
      state.userRole = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userRole = 'guest'; // default to guest
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
